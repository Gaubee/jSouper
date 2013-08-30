HTML-ViewParse
==============

A separate ViewModel module

## 里程碑（Milestone）

* **v0.6.0** 由单独的View模块加入DataManager模块，进行模块管理
* **v0.7.0** 使用DataManager优化属性触发器
* **v0.8.0** 优化Each模块
* **v0.9.0** 实现属性注册器，重构View模块中的属性操作，实现事件绑定
* **v0.10.0** 进行整体优化，减少内存消耗
* **v0.11.0** 添加Tempalte书写风格，优化API（Ajax加载模板文件等）
* **v0.12.0** 添加 *短属性* 书写方案，减小文件体积
* **v1.0.0** 修复浏览器兼容（IE6+）,正式发布。
* **Others 1** 提供Controller层插件，用于管理事件于数据，实现自动识别依赖，添置类数组操作API
* **Others 2** 提供更健壮便捷的Model插件，通过配置文件自动同步服务端数据
* **Others 3** 为jQ、YUI等库书写动画插件， *配置动画(就像书写css)* ，通过属性注册器绑定在元素中
