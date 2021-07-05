'use strict';

const fs = require('fs')
const fse = require('fs-extra')
const inquirer = require('inquirer')
const Command = require('@x-fe-cli/command')
const log = require('@x-fe-cli/log')

class InitCommand extends Command {
    init() {
        const opts = this._argv[this._argv.length - 1] || {}
        this.projectName = this._argv[0] || ''
        this.force = !!opts.force
        log.verbose('projectName', this.projectName)
        log.verbose('force', this.force)
    }

    async exec() {
        try {
            // 1. 准备阶段
            await this.prepare()
            // 2. 下载模板

            // 3. 安装模板
        } catch(e) {
            log.error(e.message)
        }
    }

    async prepare() {
        const localPath = process.cwd()
        // 1. 是否目录为空
        if (!this.isDirEmpty(localPath)) {
            let ifContinue = false
            if (!this.force) {
                // 询问是否继续创建
                ifContinue = (await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'ifContinue',
                        default: false,
                        message: '当前文件夹不为空，是否继续创建项目？'
                    }
                ])).ifContinue
                if (!ifContinue) return
            }
            if (ifContinue || this.force) {
                // 给用户做二次确认
                const { confirmDelete } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmDelete',
                        default: false,
                        message: '是否确认清空当前文件夹下的文件？'
                    }
                ])
                console.log('confirmDelete', confirmDelete)
                if (confirmDelete) {
                    fse.emptyDirSync(localPath)
                }
            }
            
        }

        // 2. 是否启动强制更新

        // 3. 选择创建项目或组件

        // 4. 获取项目的基本信息
        throw new Error('出错了')
    }

    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath)
        fileList = fileList.filter(file => !file.startsWith('.') && !['node_modules'].includes(file))
        return !fileList || fileList.length <= 0
    }
}

/**
 * 初始化项目
 *
 */
function init(argv) {
    new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand