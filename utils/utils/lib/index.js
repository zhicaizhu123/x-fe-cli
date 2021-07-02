'use strict';


/**
 * 是否为普通对象
 *
 * @param {*} obj 需判断的数据
 * @return {*} 
 */
function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

module.exports = {
    isObject,
};