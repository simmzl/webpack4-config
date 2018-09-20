Webpack项目工程化构建配置。

# 创建package.json  
```
npm init
```

```
package name: (test) test
version: (1.0.0)
description:
entry point: (index.js)
test command:
git repository:
...
```

# 安装webpack  
```
cnpm i --save-dev webpack
```

# 配置 webpack.config.js  
`webpack.config.js`会最终暴露出一个配置对象。

```javascript
const config = {};
module.exports = config;
```
## mode  
webpcak4新增了mode,用于根据环境选用对应配置，不设置会warning: `The 'mode' option has not been set, webpack will fallback to 'production' for this value...`  
```javascript
const config = {
    mode: "production"  // none/development/production
}
```

## entry & output  
webpack入口和输出。  
`entry/output` 是一个对象，可以定义多个入口。配置output，使其根据入口加上hash动态生成打包后的名称：  
```javascript
const path = require("path");

// __dirname为当前绝对路径
console.error("__dirname ===>", __dirname);
// __dirname ===> D:\github\Personal-site

const config = {
    entry: {
        index: "./src/index.js"
        // 可以添加多个入口
        // app: "./src/app.js"
    },
    output: {
        filename: "[name].[hash].js",
        // 生成绝对路径
        // D:\github\Personal-site\dist
        path: path.resolve(__dirname, "dist"),
        publicPath: "./"
    }
}
```
以上用了`path`做了路径处理，`path`是`node.js`内置的`package`，用来处理路径。`path.resolve(__dirname, "dist")`会生成返回一个绝对路径，以储存生成的文件。  
`publicPath` 并不会对生成文件的路径造成影响，主要是对页面里面引入的资源的路径做对应的补全。如`publicPath: "/"`后，生成的页面引入js的路径为`src="/[name].[hash].js"`,本地预览会报错，设置成`publicPath: "./"` ===> `src="./[name].[hash].js"`则可以解决问题。
## devtool
指定sourceMap模式。  
sourceMap模式有很多种，具体可看：[webpack——devtool里的7种SourceMap模式](https://www.cnblogs.com/wangyingblog/p/7027540.html)  
vue-cli的webpack.dev.conf.js使用了`cheap-module-eval-source-map`。  
生产环境这里使用`hidden-source-map`。
```javascript
const config = {
    // cheap-module-eval-source-map is faster for development
    devtool: "cheap-module-eval-source-map"
}
```

## devServer  
- 在开发模式下，DevServer 提供虚拟服务器，让我们进行开发和调试。
- 提供实时重新加载,减少开发时间。
- 它不是 webpack 内置插件，要安装

```
cnpm i --save-dev webpack-dev-server
```
```javascript
const config = {
    devSever: {
        contentBase: './dist',
        hot: true,
        host: 'localhost'
    }
}
```
可参考：[官方文档](https://webpack.js.org/configuration/dev-server/) 、 [segmentfault](https://segmentfault.com/a/1190000012383015)。

这里我们将开发的devServer单独分为一个js文件，并通过node运行文件从而跑起服务器。  
安装依赖：

```
cnpm i --save-dev opn webpack-dev-server
```

新建： /build/dev-server.js
```javascript
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
// 使用opn打开浏览器（解决devServer.open无效）
const opn = require("opn");

// 引入配置
const config = require('../webpack.config.js');
// devServer配置
const options = {
    contentBase: './dist',
    hot: true,
    host: 'localhost'
};

// 将devServer加入webpack配置
webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
// 新建devServer
const server = new webpackDevServer(compiler, options);
// 监听、打开端口
server.listen(8080, 'localhost', () => {
    console.log('dev server listening on port 8080');
    opn(`http://127.0.0.1:8080`);
});
```
在`package.json`中添加脚本命令：
```json
{
    scripts: {
        "dev": "node ./build/dev-server.js"
    }
}
```
注释掉`webpack.config.js`中配置的`devServer`:

```javascript
const config = {
    // devSever: {
    //     contentBase: './dist',
    //     hot: true,
    //     host: 'localhost'
    // }
}
```

执行`npm run dev`即可开启服务。(别急着运行，继续配置)  

## plugins  
`plugins` 选项用于以各种方式自定义 `webpack` 构建过程。`webpack`附带了各种内置插件，可以通过`webpack.[plugin-name]`或者直接引入`require([plugin-name])` 访问这些插件。  [自带插件](https://webpack.docschina.org/plugins/)
### html-webpack-plugin
自动生成html，插入script。  
更多： [官方配置](https://github.com/jantimon/html-webpack-plugin#)、[html-minifier配置](https://github.com/kangax/html-minifier#options-quick-reference)、[html-minifier中文文档](https://www.cnblogs.com/YangJieCheng/p/8302975.html)  

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
    entry: {
        index: "./src/index.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            // html模板文件(在文件中写好title、meta等)
            template: "src/index.html",
            // 输出的路径(包含文件名)
            filename: "./index.html",
            //自动插入js脚本
            // true body head false 默认为true:script标签位于html文件的 body 底部
            inject: true,
            // chunks主要用于多入口文件，当你有多个入口文件，那就回编译后生成多个打包后的文件，那么chunks 就能选择你要使用那些js文件
            chunks: ["index"],
            // 压缩html
            minify: {
                // 移除注释
                removeComments: true,
                // 不要留下任何空格
                collapseWhitespace: true,
                // 当值匹配默认值时删除属性
                removeRedundantAttributes: true,
                // 使用短的doctype替代doctype
                useShortDoctype: true,
                // 移除空属性
                removeEmptyAttributes: true,
                // 从style和link标签中删除type="text/css"
                removeStyleLinkTypeAttributes: true,
                // 保留单例元素的末尾斜杠。
                keepClosingSlash: true,
                // 在脚本元素和事件属性中缩小JavaScript(使用UglifyJS)
                minifyJS: true,
                // 缩小CSS样式元素和样式属性
                minifyCSS: true,
                // 在各种属性中缩小url
                minifyURLs: true
            }
        })
    ]
}
```
### mini-css-extract-plugin
自带插件，为每个引入 css 的 JS 文件创建一个 css 文件，css抽离，并写入html。  
```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
        })
    ]
};
```
### clean-webpack-plugin  
删除文件夹，避免因为生成的文件带hash,而一直存在。
```
cnpm i --save-dev clean-webpack-plugin
``` 
```javascript
const CleanWebpackPlugin = require("clean-webpack-plugin");

const config = {
    plugins: [
        new CleanWebpackPlugin(["dist"])
    ]
};
```
###  HotModuleReplacementPlugin
启用热替换模式。  
### NamedModulesPlugin  
在控制台中输出可读的模块名。
### HashedModuleIdsPlugin  
文件未变动时，保持build出来的文件hash不变。

```javascript
// 三种插件webpack自带
const config = {
    plugins: [
        // 启用 HMR
        new webpack.HotModuleReplacementPlugin(),
        // 在控制台中输出可读的模块名
        new webpack.NamedModulesPlugin(),
        // 不做改动hash保持不变
        new webpack.HashedModuleIdsPlugin()
    ]
};
```

## performance  
配置如何展示性能提示。  

默认不配置下开启devServer时，会提示：
```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets:
  vendor.256a0afe197a0724d634.js (1.67 MiB)

WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
Entrypoints:
  index (1.8 MiB)
      vendor.256a0afe197a0724d634.js
      index.256a0afe197a0724d634.css
      index.256a0afe197a0724d634.js


WARNING in webpack performance recommendations:
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/
```
因为限制了文件大小为250kb，如果超过就会提示；

```javascript
const config = {
    performance: {
        // false | "error" | "warning" // 不显示性能提示 | 以错误形式提示 | 以警告...
        hints: "warning",
        // 开发环境设置较大防止警告
        // 根据入口起点的最大体积，控制webpack何时生成性能提示,整数类型,以字节为单位
        maxEntrypointSize: 5000000, 
        // 最大单个资源体积，默认250000 (bytes)
        maxAssetSize: 3000000
    }
}
```
## loader  

loader 用于对模块的源代码进行转换。我们可以使用loader将less/sass/scss/stylus转为css并压缩、兼容处理等，可以将js es6/7语法转为es5等等。  
### 处理less

安装：  
```
cnpm i --save-dev less css-loader postcss-loader less-loader autoprefixer mini-css-extract-plugin
```

```javascript
// css抽离
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 使用mini-css-extract-plugin则不能用style-loader
const config = {
    module: {
        rules: [
            {
                test: /\.less$/,
                // 只解析改目录的文件
                include: path.resolve(__dirname, "src"),
                use: [
                    MiniCssExtractPlugin.loader,
                    // "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require("autoprefixer")({
                                    browsers: [
                                        "ie >= 11",
                                        "ff >= 30",
                                        "chrome >= 34",
                                        "safari >= 7",
                                        "opera >= 23",
                                        "ios >= 7",
                                        "android >= 4.4",
                                        "bb >= 10"
                                    ]
                                })
                            ]
                        }
                    },
                    "less-loader"
                ]
            }
        ]
    }
}
```
使用`mini-css-extract-plugin`会将js中的css抽离出来，打包成单独的文件，从而避免默认情况下，打包后，由于css通过js动态插入到html中，导致页面闪动。  
使用`css-loder`能够解析js中引入的css:`import "main.less"`。  
使用`style-loader`把加载的css作为style标签内容插入到html中。  
使用`postcss-loader autoprefixer`能够将css代码自动加兼容性前缀，配置如上代码。  
使用`less-loader`将less代码转为css。  

### babel-loader  
Babel是编写下一代JavaScript的编译器，可以将当前运行平台(浏览器、node服务器)尚不支持的下一代或几代js语法编译为当前支持的js语法版本。  
使用babel-loader将es6/7语法转为es5浏览器可执行代码。  

```
// babel-loader已经升级到了8，需要装@babel/core，但是还是有问题，所以这里安装@7.1.5
cnpm i --save-dev babel-loader@7.1.5 babel-core babel-preset-env babel-polyfill
```

```javascript
const config = {
    module: {
        rules: [{
            test: /\.js$/,
            // 只解析include文件夹内的
            include: path.resolve(__dirname, "src"),
            // 排除node_modules文件夹
            exclude: /node_modules/,
            use: [{
                // cacheDirectory = true 使用缓存，提高性能，将 babel-loader 提速至少两倍
                loader: "babel-loader?cacheDirectory",
                options: {
                    presets: [
                        [
                            "env",
                            {
                                "modules": false
                            }
                        ],
                        // 包含stage-1, stage-2以及stage-3的所有功能,个人开发就直接上最新的了，爽
                        "stage-0"
                    ],
                    plugins: [
                        "transform-es2015-modules-commonjs"
                    ]
                }
            }]
        }]
    }
};
```
`babel-preset-env` 是一个新的 preset，（presets是一系列plugin的集合）可以根据配置的目标运行环境,自动启用需要的 babel 插件，由于**Preset 的执行顺序时从最后一个逆序执行**，所以`env`写在最前，就当是保底...  但是使用preset依然不会解析Set/Map这样的，这时候就要用`babel-polyfill`了。  
`babel-polyfill`简单描述就是**只要引入了`babel-polyfill`你可以大胆的用ES6**，可参考[ES6和Babel你不知道的事儿](https://www.imooc.com/article/21866),但是使用后会使代码体积增大，视需求而定。在文件入口引入`babel-polyfill`即可使用： `import "babel-polyfill"`.  
`stage-0`是对ES7一些提案的支持，`Babel`通过插件的方式引入，让Babel可以编译ES7代码。当然由于ES7没有定下来，所以这些功能随时肯能被废弃掉的。参考：[如何区分Babel中的stage-0,stage-1,stage-2以及stage-3](https://www.cnblogs.com/chris-oil/p/5717544.html)，其通过插件方式引入，所以需要安装：  
```
cnpm i --save-dev babel-preset-stage-0
```
### url-loader  
使用url-loader而非file-loader，因为前者包含了后者，提供了更为强大的功能。他可以解决css样式中引入的图片文件等打包后路径指向不正确和将图片转为DataURL模式（base64编码的字符串形式，[More：DATA URL简介及DATA URL的利弊](https://www.cnblogs.com/xuechenlei/p/5940371.html)）从而提高网站的加载速度。更多参考：[file-loader 和 url-loader](https://blog.csdn.net/qq_38652603/article/details/73835153)  
```
cnpm i --save-dev url-loader
```
```javascript
const config = {
    module: {
        rules: [{
            // 处理引入的图片视频字体等文件的loader
            // 将小于10k的图片文件转为DataURL,并且设置默认的dist中存放方式
            test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif|mp4|webm)(\?\S*)?$/,
            loader: "url-loader?limit=10240&name=static/assets/[name]_[hash].[ext]"
        }]
    }
};
```

## optimization
优化。

```javascript
// css优化压缩
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const config = {
    optimization: {
        // 公共代码抽取
        // CommonsChunkPlugin 已弃用，使用optimization.splitChunks代替
        // 提取被重复引入的文件，单独生成一个或多个文件，这样避免在多入口重复打包文件
        splitChunks: {
            cacheGroups: {
                commons: {
                    // 选择全部chunk
                    chunks: "all",
                    // 生成的公共代码文件名，惯用vendor
                    name: "vendor",
                    // 作用于
                    test: /[\\/]node_modules[\\/]/
                }
            }
        },
        // 压缩代码，默认开启
        // minimize: true,
        // 压缩配置
        minimizer: [
            // 优化压缩css
            new OptimizeCSSAssetsPlugin({}),
            // 压缩js配置
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            })
        ]
    }
}
```
# build  
使用`webpack`命令即可开始构建，也可以自定义命令`npm run build`：

package.json:
```json
{
    "scripts": {
        "build": "webpack"
    }
}
```