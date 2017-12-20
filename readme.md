## TODO

## `Linux` 下的部署(centos)
参考文档: [electron安装](https://electronjs.org/docs/development/build-instructions-linux)
### 安装依赖
```shell
yum install clang dbus-devel gtk2-devel libnotify-devel libgnome-keyring-devel xorg-x11-server-utils libcap-devel cups-devel libXtst-devel alsa-lib-devel libXrandr-devel GConf2-devel nss-devel libXScrnSaver-devel xorg-x11-server-Xvfb
```
### 安装`npm`包
```shell
npm install
```
### 调试过程
可以通过`DEBUG=* node neteaseCrawler.js`进行完成，可以看到详细的报错信息，如果没有搞错信息则说明所有依赖安装完成，如果提示需要`xvfb`，则需要修改`model/request.js`中的下边代码:
```javascript
var Xvfb = require('xvfb');

var xvfb = new Xvfb({
    silent: true
});
xvfb.startSync();
```
把这些的注释打开。