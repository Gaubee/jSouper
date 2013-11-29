/*
 * parse rule
 */
var placeholder = {
	"<": "&lt;",
	">": "&gt;",
	"{": _placeholder(),
	"(": _placeholder(),
	")": _placeholder(),
	"}": _placeholder()
},
	_Rg = function(s) {
		return RegExp(s, "g")
	},
	placeholderReg = {
		"<": /</g,
		">": />/g,
		"/{": /\\\{/g,
		"{": _Rg(placeholder["{"]),
		"/(": /\\\(/g,
		"(": _Rg(placeholder["("]),
		"/)": /\\\)/g,
		")": _Rg(placeholder[")"]),
		"/}": /\\\}/g,
		"}": _Rg(placeholder["}"])
	}, _head = /\{([\w\W]*?)\(/g,
	_footer = /\)[\s]*\}/g,
	parseRule = function(str) {
		var parseStr = str
			.replace(/</g, placeholder["<"])
			.replace(/>/g, placeholder[">"])
			.replace(placeholderReg["/{"], placeholder["{"])
			.replace(placeholderReg["/("], placeholder["("])
			.replace(placeholderReg["/)"], placeholder[")"])
			.replace(placeholderReg["/}"], placeholder["}"])
			.replace(_head, "<span type='handle' handle='$1'>")
			.replace(_footer, "</span>")
			.replace(placeholderReg["{"], "{")
			.replace(placeholderReg["("], "(")
			.replace(placeholderReg[")"], ")")
			.replace(placeholderReg["}"], "}");
		return parseStr;
	},
	_matchRule = /\{[\w\W]*?\([\w\W]*?\)[\s]*\}/,
	/*
	 * expores function
	 */

	V = {
		prefix: "attr-",
		_nodeTree: function(htmlStr) {
			var _shadowBody = $.D.cl(shadowBody);
			_shadowBody.innerHTML = htmlStr;
			var insertBefore = [];
			_traversal(_shadowBody, function(node, index, parentNode) {
				if (node.nodeType === 3) {
					$.p(insertBefore, {
						baseNode: node,
						parentNode: parentNode,
						insertNodesHTML: parseRule(node.data)
					});
				}
			});
			$.fE(insertBefore, function(item, i) {
				var node = item.baseNode,
					parentNode = item.parentNode,
					insertNodesHTML = item.insertNodesHTML;
				shadowDIV.innerHTML = $.trim(insertNodesHTML); //optimization
				//Using innerHTML rendering is complete immediate operation DOM, 
				//innerHTML otherwise covered again, the node if it is not, 
				//then memory leaks, IE can not get to the full node.
				$.fE(shadowDIV.childNodes, function(refNode) {
					$.D.iB(parentNode, refNode, node)
				})
				$.D.rC(parentNode, node);
			});
			//when re-rendering,select node's child will be filter by ``` _shadowBody.innerHTML = _shadowBody.innerHTML;```
			return new ElementHandle(_shadowBody);
		},
		parse: function(htmlStr) {
			return View(this._nodeTree(htmlStr));
		},
		rt: function(handleName, triggerFactory) {
			return V.triggers[handleName] = triggerFactory;
		},
		rh: function(handleName, handle) {
			return V.handles[handleName] = handle
		},
		ra: function(match, handle) {
			var attrHandle = V.attrHandles[V.attrHandles.length] = {
				match: $NULL,
				handle: handle
			}
			if (typeof match === "function") {
				attrHandle.match = match;
			} else {
				attrHandle.match = function(attrKey) {
					return attrKey === match;
				}
			}
		},
		triggers: {},
		handles: {},
		attrHandles: [],
		modules: {},
		attrModules: {},
		eachModules: {},
		withModules: {},
		_instances: {},

		// Proto: DynamicComputed /*Proto*/ ,
		Model: DataManager
	};
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
		Data: {}
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
		return template;
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
				if (/complete|interactive/.test(doc.readyState)) { //fix asyn load
					_load()
				}
			}
		}
	}())
};
(function() {
	var scriptTags = document.getElementsByTagName("script"),
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