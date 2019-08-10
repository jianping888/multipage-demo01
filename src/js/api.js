/**
 * 请求接口
 */
(function ($, window) {
	
	var Util = {
		// OPENAPI: "http://10.250.23.90:8090", //后端开发环境---------------
		OPENAPI: "http://10.250.100.92:8080/CarInfoMonitor12",
		/**
		 * @func
		 * @desc toast提示
		 * @param {string} msg - 提示信息
		 * @param {number} duration=1500 - 显示持续时间，默认为1500ms
		 */
		toast: function (msg, duration) {
			// 当之前有弹窗的时候让弹窗消失
			if ($('.toast')) {
				$('.toast').css({
					display: 'none'
				});
			}
			duration = duration || 1500;
			var _toast = $('<div/>').addClass('toast'),
				_msg = $('<span/>').html(msg);
			_toast.append(_msg);
			$('body').append(_toast);
			setTimeout(function () {
				_toast.remove();
			}, duration);
		},
		showLoader: function () {
			var temp = '<div class="loading"><div class="loader-wrapper"><svg class="spinner show" viewBox="0 0 44 44"><circle class="path" fill="none" stroke-width="4" stroke-linecap="round" cx="22" cy="22" r="20"></circle> </svg></div></div>',
				$loader = $('.loading');
			if ($loader.length > 0) {
				$loader.show();
			} else {
				$('body').append(temp);
			}
		},
		hideLoader: function () {
			$('.loading').hide();
		},
		showLoaderNomove: function () {
			var temp = '<div class="loader-outer"><div class="loader-wrapper"><svg class="spinner show" viewBox="0 0 44 44"><circle class="path" fill="none" stroke-width="4" stroke-linecap="round" cx="22" cy="22" r="20"></circle> </svg></div></div>',
				$loader = $('.loader-outer');
			if ($loader.length > 0) {
				$loader.show();
			} else {
				$('body').append(temp);
			}
			// 禁止页面滑动
			$('body').css({
				overflow: 'hidden'
			});
		},
		hideLoaderNomove: function () {
			$('.loader-outer').hide();
			$('body').css({
				overFlow: 'auto'
			});
		},
		/**
		 * @func
		 * @desc Fetch
		 * @param {config} config - 配置参数
		 * @param {string} config.url - 请求路径，选填
		 * @param {object} config.requestHead - 选填，用于单纯h5中登陆获取token等的使用
		 * @param {object} config.data - 请求参数，必填
		 * @param {string} config.dataType - 返回数据类型，必填
		 * @param {string} config.selfToast - 是否会采用自定义的活动弹窗，选填
		 * @param {function} [config.beforeSend] - 请求发送前事件，选填
		 * @param {function} [config.cbOk] - 请求成功事件，选填
		 * @param {function} [config.cbErr] - 请求失败事件，包含error 回调和 success中 系统消息码或者业务处理码错误下的回滚事件，选填 ; 调用时的参数[message,xhr,textStatus]
		 * @param {function} [config.cbCp] - 请求完成事件，可用于无论是否请求成功都处理的内容。例如：目前有用于全局变量稀释访问次数，请求完成后重置全局变量使得可以重新访问。选填
		 * @param {boolean} [loader] - 是否有loader, 选填，不填的时候，默认为false
		 */
		Fetch: function (config, loader) {
			var _this = this
			$.ajax({
				timeout: 20 * 1000, // 20 秒超时
				url: config.url,
				type: config.type || 'POST',
				data: config.data || {},
				dataType: config.dataType || 'json',
				crossDomain: true,
				contentType: 'application/json;charset=utf-8',
				beforeSend: function (xhr, settings) {
					if (loader) {
						_this.showLoader();
					}
					config.beforeSend && config.beforeSend(xhr, settings);
				},
				success: function (data, textStatus, xhr) {
					if (data.code == 200) {
						config.cbOk && config.cbOk(data, textStatus, xhr);
					}else if(data.code == 400){
						window.location.href="./login.html"
					}else{
						_this.toast(data.msg, 3000);
					}
				},
				/**
				 * @param {object} xhr
				 * @param {string} textStatus 包含 null,timeout,error,abort,parsererror
				 * @param {*} e 当发生 HTTP 请求出错时, 返回http 状态的文本信息，例如"Not Found" or "Internal Server Error. 可从 xhr.statusText 获取
				 */
				error: function (xhr, textStatus, e) {
					// 报错时的用户友好提示
					!config.selfToast && _this.toast('请求出错，请稍后再试~', 3000);
					config.cbErr && config.cbErr('请求出错，请稍后再试~', xhr, textStatus);
				},
				complete: function (xhr, status) {
					if (loader) {
						_this.hideLoader();
					}
				}
			});
		}
	};
	module.exports = Util;
})(jQuery, window)