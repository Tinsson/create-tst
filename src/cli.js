import arg from 'arg';
import inquirer from 'inquirer'
import createSpaApp from './main'

// 解析输入参数
const parseArgsIntoOptions = (rawArgs) => {
  const args = arg({
    '--git': Boolean,
    '--yes': Boolean,
    '--install': Boolean,
    '--help': Boolean,
    '-g': '--git',
    '-y': '--yes',
    '-i': '--install',
    '-h': '--help',
    '--skip': '--yes'
  }, {
    argv: rawArgs.slice(2)
  })
  return {
    skipPrompts: args['--yes'] || false,
    initGit: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false
  }
}

// 根据提示自定义选项
const promptForOptions = async (options) => {
  const defaultTemplate = 'JavaScript';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate
    }
  }

  const questions = [];
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: '请选择当前新建项目的模板',
      choices: ['JavaScript', 'TypeScript'],
      default: defaultTemplate
    })
  }

  if (!options.initGit) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: '是否初始化git仓库',
      default: false
    })
  }

  if (!options.runInstall) {
    questions.push({
      type: 'confirm',
      name: 'install',
      message: '是否安装依赖',
      default: false
    })
  }

  const answers = await inquirer.prompt(questions)

  return {
    ...options,
    template: options.template || answers.template,
    git: options.initGit || answers.git,
    install: options.runInstall || answers.install
  }
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args)
  options = await promptForOptions(options)
  createSpaApp(options)
}