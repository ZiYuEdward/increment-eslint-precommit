#! /usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');
const {log} = console;

const keywords = ['Feedback', 'Ticket', 'Feature', 'Task', 'Bug', 'Subtask'];

/**
 *修改commit msg
 *
 * @param {*} changdCommit
 */
function changeCommitMsg(changdCommit) {
  fs.writeFileSync(process.env.HUSKY_GIT_PARAMS, changdCommit);
  log(chalk.yellow(`commit msg has been changed to : ${changdCommit}`));
  process.exit(0);
}

/**
 *读取commit msg 并且替换为大写
 *
 */
function handleCommitMsg() {
  let contentOrigin = fs.readFileSync(process.env.HUSKY_GIT_PARAMS, 'utf8');
  let contentChanged = contentOrigin;
  if (!contentOrigin) {
    process.exit(0);
  }
  keywords.forEach((v) => {
    const reg = new RegExp(`${v}-\\d+`, 'i'); // 大小写不敏感
    contentChanged = contentChanged.replace(reg, (text) => text.toLocaleUpperCase());
  });

  if (contentOrigin === contentChanged) {
    process.exit(0);
  }
  changeCommitMsg(contentChanged);
}

try {
  handleCommitMsg();
}
catch (e) {
  process.exit(0);
}
