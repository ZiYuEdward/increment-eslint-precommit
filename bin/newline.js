#! /usr/bin/env node
/**
 * 对新增行做lint校验
 */
const util = require('./util');
const Const = require('./const');
const {exec} = require('child_process');
const GITDIFF = 'git diff --staged --cached';
const GIT_DIFF_GET_FILENAME = 'git diff --cached --diff-filter=ACMR --name-only';
const {ESLint} = require('eslint');
const chalk = require('chalk');
const {log, error} = console;
const contentReg = /(@@[ -\\d]*@@)([\w\W]*?)(?=@@|$)/g;

/**
 *处理eslint返回数据，打印错误
 *
 * @param {*} diffFileArray
 */
async function handleDiffFile(diffFileArray) {
  let errorCount = 0;
  let warningCount = 0;
  if (diffFileArray.length) {
    const lintParams = {
      extensions: Const.extensions
    };

    if (await util.hasCustomEslintrc()) {
      lintParams.overrideConfigFile = Const.eslintrcConfig;
    }
    if (await util.hasCustomEslintIgnore()) {
      lintParams.ignorePath = Const.ignoreConfig;
    }

    const linter = new ESLint(lintParams);
    const filesNames = diffFileArray.map((v) => v.file);
    // 执行ESLint代码检查
    const eslintResults = await linter.lintFiles(filesNames);
    // 对检查结果进行处理，提取报错数和警告数
    eslintResults.forEach((result, index) => {
      const changeRows = diffFileArray[index].rows || [];
      if (result.messages && result.messages.length) {
        log(chalk.blue('ESLint has found problems in file ') + chalk.blue.underline(result.filePath));
        result.messages.forEach((msg) => {
          if (changeRows.includes(msg.line)) {
            if (msg.severity === Const.ERROR_TYPE) {
              errorCount += 1;
              util.logErrorMsg(msg);
            }
            else {
              warningCount += 1;
              util.logWarngingMsg(msg);
            }
          }
        });
      }
    });
  }
  util.logFinalResult(errorCount, warningCount);
}
/**
 * 获得更改的行数
 * @param {*} str
 * @returns
 */
const gitChangeLinesNum = (str) => {
  const strRows = str.split(/\n/g);
  strRows.forEach((v, i) => {
    if (v.indexOf('No newline at end of file') > -1) {
      strRows.splice(i, 1);
    }
  });
  const plusReg = /^\+/g;
  const subReg = /^\-/g;
  let startLine = parseInt(str.split('+')[1].split(',')[0], 10);
  const rows = [];
  for (let [index, row] of strRows.entries()) {
    if (row.match(plusReg)) {
      rows.push(startLine + index - 1);
    }
    if (row.match(subReg)) {
      startLine -= 1;
    }
  }
  return rows;
};

function getFileDiffRows(file) {
  return new Promise((resolve, reject) => {
    exec(`${GITDIFF} ${file}`, (err, stdout) => {
      if (err) {
        reject(err);
      }
      const strContent = stdout.toString().match(contentReg);
      let rows = [];
      if (strContent) {
        // eslint-disable-next-line
        for (let str of strContent) {
          rows = [...rows, ...gitChangeLinesNum(str)];
        }
      }
      resolve({
        file,
        rows
      });
    });
  });
}
/**
 *获得filename和对应的新增行数
 *
 * @param {*} diffFileArray
 */
async function handleDiffFileAndRows(diffFileArray) {
  const result = [];
  for (let i = 0; i < diffFileArray.length; i++) {
    const file = diffFileArray[i];
    result.push(getFileDiffRows(file));
  }
  handleDiffFile(await Promise.all(result));
}

/**
 *执行git diff 获取更改文件路径
 *
 * @param {*}
 */
try {
  exec(GIT_DIFF_GET_FILENAME, (err, stdout) => {
    if (err) {
      error(`exec error: ${err}`);
      process.exit(0);
    }
    const diffFileArray = stdout.split('\n').filter((diffFile) => (
      /(\.js|\.jsx)(\n|$)/gi.test(diffFile)
    ));
    handleDiffFileAndRows(diffFileArray);
  });
}
catch (e) {
  log(e);
  process.exit(0);
}
