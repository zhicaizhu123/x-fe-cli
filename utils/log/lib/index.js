'use strict';

const log = require('npmlog')

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info' // 判断debug模式

log.heading = '@x-fe-cli' // 修改前缀
log.headingStyle = { fg: 'yellow', bg: 'black' } // 修改前缀样式

// 添加自定义命令
log.addLevel('success', 2000, { fg: 'white', bg: "green" }, 'SUCCESS')

module.exports = log;
