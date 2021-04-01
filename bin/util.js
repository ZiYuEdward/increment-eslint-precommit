const chalk = require('chalk');
const {log} = console;
const fs = require('mz/fs');
const Const = require('./const');

module.exports = {
  logErrorMsg(msg) {
    log(chalk.gray(`${msg.line}:${msg.column} `)
            + chalk.red('error ')
            + chalk.blue(msg.message)
            + ' '
            + chalk.gray(msg.ruleId));
  },
  logWarngingMsg(msg) {
    log(chalk.gray(`${msg.line}:${msg.column} `)
            + chalk.yellow('warining ')
            + chalk.blue(msg.message)
            + ' '
            + chalk.gray(msg.ruleId));
  },
  /**
     *是否存在自定义rule
    *
    * @returns
 */
  async hasCustomEslintrc() {
    let hasEslintrc = true;
    try {
      await fs.accessSync(Const.eslintrcConfig, fs.constants.F_OK);
    }
    catch (e) {
      hasEslintrc = false;
    }
    return hasEslintrc;
  },
  async hasCustomEslintIgnore() {
    let hasEslintignore = true;
    try {
      await fs.accessSync(Const.ignoreConfig, fs.constants.F_OK);
    }
    catch (e) {
      hasEslintignore = false;
    }
    return hasEslintignore;
  },
  logFinalResult(errorCount, warningCount) {
    log('\n');
    if (errorCount >= 1) {
      log(chalk.red('ESLint failed'));
      log(chalk.red(`✖ ${errorCount + warningCount} problems(${errorCount} error, ${warningCount} warning)`));
      process.exit(1);
    }
    else if (warningCount >= 1) {
      log(chalk.yellow('ESLint passed, but need to be improved.'));
      process.exit(0);
    }
    else {
      log(chalk.green('ESLint passed'));
      process.exit(0);
    }
  }
};
