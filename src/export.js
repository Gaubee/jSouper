/*
 * export
 */
var ViewParser = global.ViewParser = {
	scans: function() {
		$.fE(document.getElementsByTagName("script"), function(scriptNode) {
			if (scriptNode.getAttribute("type") === "text/template") {
				V.modules[scriptNode.getAttribute("name")] = ViewParser.parse(scriptNode.innerHTML);
				$.D.rm(scriptNode)
			}
		});
	},
	parseStr: function(htmlStr) {
		return V.parse(parse(htmlStr))
	},
	parseNode: function(htmlNode) {
		return V.parse(parse(htmlNode.innerHTML))
	},
	parse: function(html) {
		if (html instanceof Object) {
			return this.parseNode(html)
		}
		return this.parseStr(html)
	},
	modules: V.modules,
	config: {
		Id: 'HVP',
		Var: 'App',
		Data: $NULL
	},
	registerHandle: registerHandle,
	app: function(userConfig) {
		ViewParser.scans();
		var HVP_config = ViewParser.config;
		userConfig = _mix(HVP_config, userConfig) || HVP_config;
		var App = document.getElementById(userConfig.Id); //configable
		if (App) {
			var appName = userConfig.Var;
			var template = ViewParser.parseNode(App)(userConfig.Data); //App.getAttribute("template-data")//json or url or configable
			// template.set(HVP_config.Data);
			App.innerHTML = "";
			template.append(App);
			if ( /*!appName || */ appName == userConfig.Id || appName in global) {
				//IE does not support the use and the DOM ID of the same variable names, so automatically add '_App' after the most.
				appName = userConfig.Id + "_App";
				// console.error("App's name shouldn't the same of the DOM'ID");
				console.warn("App's name will be set as " + appName);
			}
			global[appName] = template
		}
	},
	ready: (function() {
		var ready = "DOMContentLoaded", //_isIE ? "DOMContentLoaded" : "readystatechange",
			ready_status = $FALSE,
			callbackFunStacks = [];

		function _load() {
			var callbackObj;
			while (callbackFunStacks.length) {
				callbackObj = callbackFunStacks.shift(0, 1);
				callbackObj.callback.call(callbackObj.scope || global)
			}
			ready_status = $TRUE;
		}
		_registerEvent(doc, (_isIE && IEfix[ready]) || ready, _load);
		return function(callbackFun, scope) {
			if (ready_status) {
				callbackFun.call(scope || global);
			} else {
				$.p(callbackFunStacks, {
					callback: callbackFun,
					scope: scope
				})
				//complete ==> onload , interactive ==> DOMContentLoaded
				//https://developer.mozilla.org/en-US/docs/Web/API/document.readyState
				//seajs src/util-require.js
				if (/complete|onload/.test(doc.readyState)) { //fix asyn load
					_load()
				}
			}
		}
	}())
};
(function() {
	var scriptTags = document.getElementsByTagName("script"),
		HVP_config = ViewParser.config,
		userConfigStr = $.trim(scriptTags[scriptTags.length - 1].innerHTML);
	ViewParser.ready(function() {
		ViewParser.scans();
		if (userConfigStr.charAt(0) === "{") {
			try {
				var userConfig = userConfigStr ? Function("return" + userConfigStr)() : {};
			} catch (e) {
				console.error("config error:" + e.message);
			}
			userConfig && ViewParser.app(userConfig)
		}
	});
}());

/*
 * as AMD & CMD
 */
// fork form jQuery
//module is defined?
//module !== null
//fix IE 关键字
if (typeof module === "object" && module && typeof module["export"] === "object") {
	module["export"] = ViewParser
} else {
	if (typeof define === "function" && define.amd) {
		define("jSoup", [], function() {
			return ViewParser
		})
	}
}