
## 5.24.23:59-5.25.8:27改动：
*1.修复添加周期、时间段任务*
*2.修复tractDisplayEvents函数*

# utils包下新增eventFlush.js文件，做本地数据更新
-在数据库操作之后调用这个文件下的函数，具体可以看page_addEvent.js的56行和61行
- 完成：finishFlush(在event[0]数组的下标，主页)
- 延后（也是修改）：updateFlush（以前的condition，以前的下标，新的事件对象，主页）
- 放弃：giveupFlush（在event[0]数组的下标，主页）
- 删除：deleteFlush（事件的condition，下标，主页）

# 云开发 quickstart

# 云开发 slowend


这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)



