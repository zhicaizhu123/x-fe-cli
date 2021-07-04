'use strict';
const semver = require('semver')
const colors = require('colors')
const log = require('@x-fe-cli/log')

// Node 最低版本号
const LOWEST_NODE_VERSION = '12.0.0'

class Command {
    constructor(argv) {
        if (!argv) {
            throw new Error(colors.red('参数不能为空'))
        }
        if (!Array.isArray(argv)) {
            throw new Error(colors.red('参数必须为数组'))
        }
        if (argv.length < 1) {
            throw new Error(colors.red('参数列表为空'))
        }
        // console.log('command constructor', argv)
        this._argv = argv
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve()
            chain = chain.then(() => this.checkNodeVersion())
            chain = chain.then(() => this.initArgs())
            chain = chain.then(() => this.init())
            chain = chain.then(() => this.exec())
            chain.catch(err => {
                log.error(err.message)
            })
        })
    }

    initArgs() {
        this._cmd = this._argv[this._argv.length - 1]
        this._argv = this._argv.slice(0, this._argv.length - 1)
        console.log(this._cmd.opts())
    }

    /**
     * 检查Node版本号
     *
     */
    checkNodeVersion() {
        // 1. 获取当前node版本号
        const currentVersion = process.version
        // log.info('当前node版本号：', currentVersion)

        // 2. 比对最低版本号
        const lowestNodeVersion = LOWEST_NODE_VERSION
        
        if (!semver.gte(currentVersion, lowestNodeVersion)) {
            throw new Error(colors.red(`x-fe-cli 需要安装v${lowestNodeVersion}以上版本的 Node.js， 当前Node.js版本为${currentVersion}`))
        }
    }

    init() {
        // 下沉到子类实现
        throw new Error('init必须实现')
    }

    exec() {
        // 下沉到子类实现
        throw new Error('exec必须实现')
    }
}

module.exports = Command;
