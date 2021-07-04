'use strict';

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

    exec() {

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