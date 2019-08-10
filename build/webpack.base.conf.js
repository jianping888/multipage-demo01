const path = require('path');
const webpack = require("webpack");
const glob = require("glob");
//消除冗余的css
const purifyCssWebpack = require("purifycss-webpack");
// html模板
const htmlWebpackPlugin = require("html-webpack-plugin");
//静态资源输出
const copyWebpackPlugin = require("copy-webpack-plugin");
const rules = require("./webpack.rules.conf.js");
// 获取html-webpack-plugin参数的方法
let getHtmlConfig = function (name, chunks) {
	return {
		template: `./src/pages/${name}/index.html`,
		filename: `${name}.html`,
		favicon: './favicon.ico',
		// title: title,
		inject: true,
		hash: true, //开启hash  ?[hash]
		chunks: chunks,
		minify: process.env.NODE_ENV === "development" ? false : {
			removeComments: true, //移除HTML中的注释
			collapseWhitespace: true, //折叠空白区域 也就是压缩代码
			removeAttributeQuotes: true, //去除属性引用
		},
	};
};

//动态添加入口
function getEntry(PAGES_DIR) {
	var entry = {};
	//读取src目录所有page入口
	glob.sync(PAGES_DIR + '**/*.js').forEach(function (name) {
		var start = name.indexOf('pages/') + 4;
		var end = name.length - 3;
		var eArr = [];
		var n = name.slice(start, end);
		n = n.split('/')[1];
		eArr.push(name);
		entry[n] = eArr;
	})
	return entry;
}
let entrys = getEntry('./src/pages/');
// let entrysAddQ=getEntry('./src/pages/');
// entrysAddQ['jquery']="jquery"
module.exports = {
	entry: entrys,
	module: {
		rules: [...rules]
	},
	//将外部变量或者模块加载进来
	externals: {
		// 'jquery': 'window.jQuery'
	},
	plugins: [
		// 全局暴露统一入口
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.jQuery': 'jquery',
		}),
		//静态资源输出
		new copyWebpackPlugin([{
			from: path.resolve(__dirname, "../src/assets"),
			to: './assets',
			ignore: ['.*']
		}]),
		// 消除冗余的css代码
		new purifyCssWebpack({
			paths: glob.sync(path.join(__dirname, "../src/pages/*/*.html"))
		})

	],
	// webpack4里面移除了commonChunksPulgin插件，放在了config.optimization里面,提取js， vendor名字可改
	optimization: {
		splitChunks: {
			cacheGroups: {
				//公用模块抽离
				common: {
					chunks: 'initial',
					minSize: 0, //大于0个字节
					minChunks: 2, //在分割之前，这个代码块最小应该被引用的次数
				  },
				  
				  //第三方库抽离
				  vendor: {
					priority: 1, //权重
					test: /node_modules/,
					chunks: 'initial',
					minSize: 0, //大于0个字节
					minChunks: 2, //在分割之前，这个代码块最小应该被引用的次数
				  }
			}
		}
	},
}


//修改   自动化配置页面
var htmlArray = [];
Object.keys(entrys).forEach(function (element) {
	htmlArray.push({
		_html: element,
		title: '',
		chunks: ['common','vendor',element]
	})
})

//自动生成html模板
htmlArray.forEach((element) => {
	module.exports.plugins.push(new htmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)));
})