'use strict';
const path = require('path')
const fse = require('fs-extra')
const pkgDir = require('pkg-dir').sync
const pathExists = require('path-exists').sync
const npmInstall = require('npminstall')
const { isObject } = require('@x-fe-cli/utils')
const formatPath = require('@x-fe-cli/format-path')
const { getDefaultRegister, getLatestVersion } = require('@x-fe-cli/get-npm-info')

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的options参数不能为空')
        }
        if (!isObject(options)) {
            throw new Error('Package类的options必须为对象')
        }
        // 获取package的目标路径
        this.targetPath = options.targetPath
        // package的缓存路径
        this.storeDir = options.storeDir
        // package的name
        this.packageName = options.packageName
        // package的version
        this.packageVersion = options.packageVersion
        // package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')
    }

    async prepare() {
        // 判断缓存目录是否存在
        if (this.storeDir && !pathExists(this.storeDir)) {
            // 缓存模式下，缓存目录不存在则需要手动创建
            fse.mkdirpSync(this.storeDir)
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getLatestVersion(this.packageName)
        }
        
    }

    // 获取当前版本号缓存文件目录
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }

    // 指定版本号获取定义的缓存文件目录
    getSpecificCacheVersionPath(packageVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
    }

    // 判断当前Package是否存在
    async exists() {
        if (this.storeDir) {
            // 缓存模式
            await this.prepare()
            return pathExists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath)
        }
    }

    // 安装Package
    async install() {
        await this.prepare()
        return npmInstall({
            root: this.targetPath, // 模块路径
            storeDir: this.storeDir,
            registry: getDefaultRegister(),
            pkgs: [
                {
                    name: this.packageName,
                    versions: this.packageVersion,
                }
            ]
        })
    }

    // 更新Package
    async update() {
        await this.prepare()
        // 1. 获取npm最新版本号
        const latestPackageVersion = await getLatestVersion(this.packageName)
        // 2. 查询最新版本号对应的路径是否存在
        const latestFilePath = this.getSpecificCacheVersionPath(latestPackageVersion)
        // 3. 如果不存在。则直接安装最新版本
        if (!pathExists(latestFilePath)) {
            await npmInstall({
                root: this.targetPath, // 模块路径
                storeDir: this.storeDir,
                registry: getDefaultRegister(),
                pkgs: [
                    {
                        name: this.packageName,
                        versions: latestPackageVersion,
                    }
                ]
            })
            // 4. 更新版本号
            this.packageVersion = latestPackageVersion
        }
    }

    // 获取package模块的入口文件
    getRootFilePath() {
        // 1. 获取package.json所在的目录 - pkg-dir
        function _getRootFilePath(targetPath) {
            const dir = pkgDir(targetPath)
            if (dir) {
                // 2. 读取package.json - require()
                const pkgFile = require(path.resolve(dir, 'package.json'))
                // 3. 获取入口文件 main/lib - path
                if (pkgFile && pkgFile.main){
                    // 4. 路径的兼容（macos/windows）
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
            return null
        }
        if (this.storeDir) {
            // 如果是缓存模式
            return _getRootFilePath(this.cacheFilePath)
        } else {
            return _getRootFilePath(this.targetPath)
        }
    }
}

module.exports = Package;