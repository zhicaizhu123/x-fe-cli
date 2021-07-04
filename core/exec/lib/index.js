'use strict';

const path = require('path')
const Package = require('@x-fe-cli/package')
const log = require('@x-fe-cli/log')

const SETTINGS = {
    init: '@x-fe-cli/init'
}

// 缓存目录
const CACHE_DIR = 'dependencies'

async function exec() {
    // 1. targetPath -> modulePath
    // 2. modulePath -> Package(npm模块)
    // 3. Package.getRootFilePath(获取入口文件)
    // 4. Package.update/Package.install
    // 封装 -> 复用

    // 制定本地调试文件路径
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    let storeDir = '' // 缓存路径，如果这个参数不为控制，则说明使用的是缓存模式
    let pkg = ''
    log.verbose('targetPath', targetPath)
    log.verbose('homePath', homePath)

    const cmdObj = arguments[arguments.length - 1]
    // 当前命令名称
    const cmdName = cmdObj.name()
    // 安装依赖包名称
    const packageName = SETTINGS[cmdName]
    // 安装依赖包版本
    const packageVersion = 'latest'
    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR) // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules')
        log.verbose('targetPath:', targetPath)
        log.verbose('storeDir:', storeDir)
        pkg = new Package({
            targetPath,
            packageName,
            storeDir,
            packageVersion
        })
        if (await pkg.exists()) {
            // 更新package
            await pkg.update()
        } else {
            // 安装package
            await pkg.install()
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
    }
    // 3. Package.getRootFilePath(获取入口文件)
    const rootFile = pkg.getRootFilePath()
    if (rootFile) {
        try {
            // 在当前进程中调用
            require(rootFile).call(null, Array.from(arguments))
            // 在node子进程调用
            // TODO
        } catch(err) {
            log.error(err.message)
        }
    }
    
    
}


module.exports = exec;