'use strict';

const semver = require('semver')
const axios = require('axios')
const urlJoin = require('url-join')


/**
 * 获取npm信息
 *
 * @param {*} npmName 包名
 * @param {*} registerUrl 镜像地址
 * @return {*} 
 */
function getNpmInfo(npmName, registerUrl) {
    registerUrl = registerUrl || getDefaultRegister()
    const npmUrl = urlJoin(registerUrl, npmName)
    return axios.get(npmUrl)
        .then(res => {
            if (res.status === 200) {
                return res.data
            }
            return null
        })
        .catch(err => {
            return Promise.reject(err)
        })
}


/**
 * 获取默认的镜像源
 *
 * @param {boolean} [isOrigin=false] // 是否为默认的npm镜像
 * @return {*} 
 */
function getDefaultRegister(isOrigin = false) {
    return isOrigin ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org/'
}


/**
 * 获取npm所有版本号
 *
 * @param {*} npmName 包名
 * @param {*} registerUrl 镜像地址
 * @return {*} 
 */
async function getNpmVersions(npmName, registerUrl) {
    const npmInfo = await getNpmInfo(npmName, registerUrl)
    return Object.keys(npmInfo.versions)
}


/**
 * 获取semver 对应的版本列表
 *
 * @param {*} baseVersion 基础版本
 * @param {*} versions 所有版本列表
 * @return {*} 
 */
function getNpmSemverVersions(baseVersion, versions) {
    versions = versions.filter(version => {
        return semver.satisfies(version, `^${baseVersion}`)
    }).sort((a, b) => semver.gt(b, a))
    return versions
}

/**
 * 获取需要更新对应的版本号
 *
 * @param {*} baseVersion 基础版本
 * @param {*} npmName 包名
 * @param {*} registerUrl 镜像地址
 * @return {*} 
 */
async function getNpmSemverVersion(baseVersion, npmName, registerUrl) {
    const versions = await getNpmVersions(npmName, registerUrl)
    const newVersions = getNpmSemverVersions(baseVersion, versions)
    if (newVersions.length) {
        return newVersions[0]
    }
}

async function getLatestVersion(npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    if (versions) {
        return versions.sort((a, b) => semver.gt(b, a))[0]
    }
    return null
}

module.exports = {
    getNpmSemverVersion,
    getDefaultRegister,
    getLatestVersion,
}
