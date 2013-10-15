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
		parse: function(htmlStr) {
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

			$.fE(insertBefore, function(item) {
				var node = item.baseNode,
					parentNode = item.parentNode,
					insertNodesHTML = item.insertNodesHTML;
				shadowDIV.innerHTML = insertNodesHTML;
				//Using innerHTML rendering is complete immediate operation DOM, 
				//innerHTML otherwise covered again, the node if it is not, 
				//then memory leaks, IE can not get to the full node.
				$.fE(shadowDIV.childNodes, function(refNode) {
					$.D.iB(parentNode, refNode, node)
				})
				$.D.rC(parentNode, node);
			});
			_shadowBody.innerHTML = _shadowBody.innerHTML;
			var result = new ElementHandle(_shadowBody);
			return View(result);
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
				V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
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
		app: 'HVP',
		data: {}
	},
	registerHandle:registerHandle,
	ready: (function() {
		var ready = "DOMContentLoaded", //_isIE ? "DOMContentLoaded" : "readystatechange",
			ready_status = $FALSE,
			callbackFunStacks = [];

		_registerEvent(doc, (_isIE && IEfix[ready]) || ready, function() {
			$.ftE(callbackFunStacks, function(callbackObj) {
				callbackObj.callback.call(callbackObj.scope)
			})
			ready_status = $TRUE;
		});
		return function(callbackFun, scope) {
			if (ready_status) {
				callbackFun.call(scope);
			} else {
				$.p(callbackFunStacks, {
					callback: callbackFun,
					scope: scope
				})
			}
		}
	}())
};
(function() {
	var scriptTags = document.getElementsByTagName("script"),
		HVP_config = ViewParser.config,
		userConfigStr = $.trim(scriptTags[scriptTags.length - 1].innerHTML);
	ViewParser.ready(Try(function() {
		var userConfig = userConfigStr ? Function("return" + userConfigStr)() : {};
		for (var i in userConfig) { //mix
			HVP_config[i] = userConfig[i];
		}
	}, function(e) {
		throw "config error:" + e.message;
	}));
	ViewParser.ready(function() {
		var HVP_config = ViewParser.config,
			App = document.getElementById(HVP_config.id); //configable
		if (App) {
			var appName = HVP_config.app;
			if (!appName || appName == HVP_config.id) {
				//IE does not support the use and the DOM ID of the same variable names, so automatically add '_App' after the most.
				appName = HVP_config.id + "_App";
			}
			var template = global[appName] = ViewParser.parseNode(App)( /*HVP_config.data*/ ); //App.getAttribute("template-data")//json or url or configable
			template.set(HVP_config.data);
			App.innerHTML = "";
			template.append(App);
		}
		ViewParser.scans();
	})
}());