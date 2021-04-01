#! /usr/bin/env node

const {exec} = require('child_process');
const Const = require('./const');
const GITDIFF = 'git diff --cached --diff-filter=ACMR --name-only';
const {ESLint} = require('eslint');
const chalk = require('chalk');
const {log, error} = console;
const util = require('./util');

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
    // 执行ESLint代码检查
    const eslintResults = await linter.lintFiles(diffFileArray);
    // 对检查结果进行处理，提取报错数和警告数
    eslintResults.forEach((result) => {
      errorCount += result.errorCount;
      warningCount += result.warningCount;
      if (result.messages && result.messages.length) {
        log(chalk.blue('ESLint has found problems in file ') + chalk.blue.underline(result.filePath));
        result.messages.forEach((msg) => {
          if (msg.severity === Const.ERROR_TYPE) {
            util.logErrorMsg(msg);
          }
          else {
            util.logWarngingMsg(msg);
          }
        });
      }
    });
  }
  util.logFinalResult(errorCount, warningCount);
}

/**
 *执行git diff 获取更改文件路径
 *
 * @param {*}
 */
try {
  exec(GITDIFF, (err, stdout) => {
    if (err) {
      error(`exec error: ${err}`);
    }
    // 对返回结果进行处理，拿到要检查的文件列表
    const diffFileArray = stdout.split('\n').filter((diffFile) => (
      /(\.js|\.jsx)(\n|$)/gi.test(diffFile)
    ));
    handleDiffFile(diffFileArray);
  });
}
catch (e) {
  log(e);
  process.exit(0);
}
