# npm 版本号
 <a href="https://blog.csdn.net/weixin_40817115/article/details/90384398">参考</a>

* prerelease
    操作说明: 当执行npm version prerelease时，如果没有预发布号，则增加minor，同时prerelease 设为0；
    如果有prerelease， 则prerelease 增加1。
    
    还有如下命令：
    - prepatch
    - preminor
    - premajor

```bash
    npm version prerelease // 1.0.0 --> 1.0.1-0 
```

* 小版本(bug修复)

    直接升级patch，去掉prerelease ，其他保持不变；

```bash
  npm version patch // 2.0.0 --> 2.0.1
```

* 中版本(特性更新，兼容之前API)
    
    直接升级minor，同时patch设置为0；

```bash
  npm version minor // 2.0.1 --> 2.1.0
```

* 大版本(特性更新，不兼容之前API)

    直接升级major，其他位都置为0；

```bash
  npm version major // 3.1.0 --> 4.0.0
```

### beta(test 分支发布) 测试环境 版本号 自动追加 （beta.数字）
```bash
  node bin/autoChangeVersion // 1.1.0 --> 1.1.0-beta.2
```
例如：
    - 1.1.0 => 1.1.0-beta.1
    - 1.1.0-beta.1 => 1.1.0-beta.2