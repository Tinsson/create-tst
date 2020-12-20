import chalk from 'chalk'
import fs from 'fs'
import ncp from 'ncp'
import path from 'path'
import { promisify } from 'util'
import execa from 'execa'
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

// 把异步操作处理成promise
const access = promisify(fs.access)
// 后续复制操作
const copy = promisify(ncp)

const copyTemplateToTarget = async (options) => {
  return copy(options.templateDir, options.targetDir, {
    clobber: false
  })
}

const initGit = async (options) => {
  const result = await execa('git', ['init'], {
    cwd: options.targetDir
  })
  if (result.failed) {
    return Promise.reject(new Error('Failed to initialize git'))
  }
  return
}

export default async function createSpaApp(options) {
  options = {
    ...options,
    targetDir: options.targetDir || process.cwd()
  }
  // 预设模板目录
  const templateDir = path.resolve(
    new URL(import.meta.url).pathname,
    '../../templates',
    options.template
  )
  options.templateDir = templateDir;

  try {
    // 检查文件是否存在于当前目录中
    await access(templateDir, fs.constants.F_OK);
  } catch (e) {
    console.error('%s Invalid template name', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateToTarget(options)
    },
    {
      title: 'Initialize git',
      task: () => initGit(options),
      enabled: () => options.git
    },
    {
      title: 'Install dependencies',
      task: () => 
        projectInstall({
          prefer: 'yarn',
          cwd: options.targetDir
        })
      ,
      skip: () => {
        !options.install
          ? 'Pass --install to automatically install dependencies'
          : undefined
      }
    }
  ])

  await tasks.run()
  console.log('%s Project ready', chalk.green.bold('DONE'));
  return true
}