const path = require("path");
// 自动生成html，插入script
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 清除文件
const CleanWebpackPlugin = require("clean-webpack-plugin");
// css抽离
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// css压缩
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// js压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require("webpack");

// __dirname为当前绝对路径
// console.error("__dirname ===>", __dirname);
// __dirname ===> D:\github\webpack4-config

const src = path.resolve(__dirname, "src");
const config = {
    mode: "production",
    // cheap-module-eval-source-map is faster for development
    devtool: "cheap-module-eval-source-map",
    entry: {
        index: "./src/index.js"
    },
    output: {
        filename: "[name].[hash].js",
        path: path.resolve(__dirname, "dist"),
        // D:\github\webpack4-config\dist
        publicPath: "./"
    },
    // devSever: {
    //     contentBase: './dist',
    //     hot: true,
    //     host: 'localhost',
    //     port: "8080"
    // }
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
        }),
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            // html模板文件(在文件中写好title、meta等)
            template: "src/index.html",
            // 输出的路径(包含文件名)
            filename: "./index.html",
            //自动插入js脚本
            // true body head false 默认为true:script标签位于html文件的 body 底部
            // inject: true,
            // chunks主要用于多入口文件，当你有多个入口文件，那就回编译后生成多个打包后的文件，那么chunks 就能选择你要使用那些js文件
            // chunks: ["index", "app"]
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
        }),

        // 启用 HMR
        new webpack.HotModuleReplacementPlugin(),
        // 在控制台中输出可读的模块名
        new webpack.NamedModulesPlugin(),

        // 不做改动hash保持不变
        new webpack.HashedModuleIdsPlugin()
    ],
    // loader处理资源模块
    module: {
        rules: [{
                test: /\.js$/,
                include: src,
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
                            // 包含stage-1, stage-2以及stage-3的所有功能,个人开发就直接上最新的了
                            "stage-0"
                        ]
                        // plugins: [
                        //     "transform-es2015-modules-commonjs"
                        // ]
                    }
                }]
            },
            {
                test: /\.less$/,
                include: src,
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
            },
            {
                // 处理引入的图片视频字体等文件的loader
                // 将小于10k的图片文件转为DataURL,并且设置默认的dist中存放方式
                test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif|mp4|webm)(\?\S*)?$/,
                loader: "url-loader?limit=102400&name=[name]_[hash].[ext]&outputPath=assets/img/"
            }
        ]
    },
    performance: {
        // false | "error" | "warning"
        hints: "warning",
        // 最大单个资源体积，默认250000 (bytes)
        maxAssetSize: 3000000,
        // 根据入口起点的最大体积，控制webpack何时生成性能提示整数类型（以字节为单位）
        maxEntrypointSize: 5000000
    },
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
    },
};
module.exports = config;