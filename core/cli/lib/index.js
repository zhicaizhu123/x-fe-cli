'use strict';

const path = require('path')

const semver = require('semver')
const colors = require('colors')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const dotenv = require('dotenv')
const { program } = require('commander')
const log = require('@x-fe-cli/log')
const exec = require('@x-fe-cli/exec')
const pkg = require('../package.json')
const constants = require('./const')


async function cli() {
    try {
        await prepare()
        registerCommand()
    } catch(error) {
        log.error(error.message)
        if (program.debug) {
            console.log(error)
        }
    }
}


/**
 * 准备阶段
 *
 */
async function prepare() {
    checkPkgVersion()
    await checkRoot()
    checkUserHome()
    checkEnv()
    await checkGlobalUpdate()
}


/**
 * 注册命令
 *
 */
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', '制定本地调试文件路径', '')
    
    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化', false)
        .action(exec)

    // 对调试模式监听
    program.on('option:debug', () => {
        const options = program.opts()
        if (options.debug) {
            process.env.LOG_LEVEL = 'verbose'
        } else {
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
    })

    // 指定targetPath制定本地调试文件路径
    program.on('option:targetPath', () => {
        // 使用环境变量进行解耦
        process.env.CLI_TARGET_PATH = program.opts().targetPath
    })

    // 对未知命令监听
    program.on('command:*', (obj) => {
        const availableCommands = program.commands.map(cmd => cmd.name())
        log.error('未知命令：' + colors.red(obj[0]))
        if (availableCommands.length) {
            log.info('可用命令：' + availableCommands)
        }
        
    })
    
    program.parse(process.argv)

    // 参数长度小于1时，输出帮助信息
    if (program.args && program.args.length < 1) {
        program.outputHelp()
    }
}


/**
 * 检查的版本号
 *
 */
function checkPkgVersion() {
    log.info('当前版本号：', pkg.version)
}


/**
 * 判断root并降级措施
 *
 */
async function checkRoot() {
    const rootCheck = await import('root-check')
    rootCheck.default()
}


/**
 * 检查用户主目录
 *
 */
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录主目录不存在'))
    }
}

/**
 * 检查环境变量
 *
 */
function checkEnv() {
    const dotenvPath = path.resolve(userHome, '.env')
    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: path.resolve(userHome, '.env')
        })
    }
    createDefaultCliConfig()
}

function createDefaultCliConfig() {
    const cliHome = process.env.CLI_HOME
        ? path.join(userHome, process.env.CLI_HOME)
        : path.join(userHome, constants.DEFAULT_CLI_HOME)
    process.env.CLI_HOME_PATH = cliHome
}


/**
 * 提示更新版本号
 *
 */
async function checkGlobalUpdate() {
    const currentVersion = pkg.version
    const npmName = pkg.name
    try {
        const { getNpmSemverVersion } = require('@x-fe-cli/get-npm-info')
        const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
        if (lastVersion && semver.gt(lastVersion, currentVersion)) {
           log.warn(colors.yellow(`请手动更新${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}，更新命令：npm install -g ${npmName}`)) 
        }
    } catch(err) {
        log.error(`获取 ${npmName} npm包版本错误：`, err.message)
    }
}

module.exports = cli; 