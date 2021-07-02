'use strict';

const path = require('path')

module.exports = formatPath;

function formatPath(p) {
    // 路径的分隔符
    const sep = path.sep
    if (sep === '/') {
        // macos 直接返回
        return p
    } else {
        // windows 下的的反斜杠‘\’转换成‘/’
        return p,require(/\\/g, '/')
    }
}
