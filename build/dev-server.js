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
server.listen(5000, 'localhost', () => {
    console.log('dev server listening on port 5000');
    opn(`http://127.0.0.1:5000`);
});