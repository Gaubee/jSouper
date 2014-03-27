/*
 * export
 */
var _jSouperBase = {
    //暴露基本的工具集合，给拓展组件使用
    $: $,
    // JSON: JSON,
    $JS: new Model(global),
    isViewModel: function(vm) {
        return vm instanceof ViewModel;
    },
    isModel: function(m) {
        return m instanceof Model;
    },
    dispatchEvent: function(element, ev) {
        if (element.dispatchEvent) {
            if (ev && typeof ev === "string") {
                var ev = document.createEvent("HTMLEvents");
                ev.initEvent(eventName, true, false);
            }
            element.dispatchEvent(ev);
        } else {
            element.fireEvent(eventName);
        }
    },
    queryHandle: function(node) {
        return ViewModel.queryList._[$.hashCode(node)];
    },
    queryElement: function(matchFun) {
        var result = [];
        matchFun = _buildQueryMatchFun(matchFun);
        $.E(ViewModel.queryList, function(node) {
            if (matchFun(node)) {
                $.p(result, node);
            }
        })
        return result;
    },
    //同jQuery的makeArrayAPI
    //中文文档推荐：http://www.css88.com/jqapi-1.9/jQuery.makeArray/
    makeArray: function(likeArr) {
        return likeArr && likeArr !== $TRUE ? $.s(likeArr) : [];
    },
    indexOf: $.iO,
    isPlainObject: $.isO,
    forEach: $.forEach,
    filter: $.filter,
    map: $.map,
    extend: $.extend,
    trim: function(str) {
        return $.isS(str) ? $.trim(str) : "";
    },
    scans: function(node, vmName) {
        V._scansView(node, vmName);
        V._scansVMInit(node, vmName);
        return node;
    },
    parseStr: function(htmlStr, name) {
        // V._currentParser = name;
        return V.parse(htmlStr, name)
    },
    parseNode: function(htmlNode, name) {
        // V._currentParser = name;
        return V.parse(htmlNode.innerHTML, name)
    },
    parse: function(html, name) {
        if ($.isO(html)) {
            return this.parseNode(html, name)
        }
        return this.parseStr(html, name)
    },
    config: {
        Id: 'HVP',
        Var: 'App',
        // Url:"",//include
        // HTML:"",//html string as template
        Data: $NULL
    },
    registerHandle: registerHandle,
    app: function(userConfig) {
        // jSouper.scans();
        var HVP_config = jSouper.config;
        userConfig = _mix(HVP_config, userConfig) || HVP_config;
        var App = doc.getElementById(userConfig.Id); //configable
        if (App) {
            var appName = userConfig.Var;
            var template = jSouper.parseNode(App, "App")(userConfig.Data); //App.getAttribute("template-data")//json or url or configable
            jSouper.App = template;
            App.innerHTML = "";
            template.append(App);
            if ( /*!appName || */ appName == userConfig.Id || appName in global) {
                //IE does not support the use and the DOM ID of the same variable names, so automatically add '_App' after the most.
                appName = userConfig.Id + "_App";
                // console.error("App's name shouldn't the same of the DOM'ID");
                console.warn("App's name will be set as " + appName);
            }
            return (global[appName] = template);
        }
    },
    build: function(userConfig) {
        var HTML = userConfig.HTML;
        var url = userConfig.Url;
        var module = jSouper.modules[url];
        var vi;
        if (!module) {
            if (!HTML && url) {
                $.ajax({
                    url: url,
                    //for return
                    async: $FALSE,
                    success: function(status, xhr) {
                        HTML = xhr.responseText
                    }
                })
            }
            module = jSouper.modules[url] = jSouper.parseStr(HTML, url);
        }
        if (module) {
            vi = module(userConfig.Data, userConfig.extendConfig);
            var appName = userConfig.Var;
            if (appName) {
                if (appName in global) {
                    appName = appName + "_App";
                    console.warn("App's name will be set as " + appName);
                }
                global[appName] = vi;
            }
        }
        _runScript(vi.topNode());
        return vi;
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
                if (/complete|onload|interactive/.test(doc.readyState)) { //fix asyn load
                    _load()
                }
            }
        }
    }())
};
var jSouper = global.jSouper = $.c(V);
$.fI(_jSouperBase, function(value, key) {
    jSouper[key] = value;
});
(function() {
    var scriptTags = doc.getElementsByTagName("script"),
        HVP_config = _jSouperBase.config,
        userConfigStr = $.trim(scriptTags[scriptTags.length - 1].innerHTML);
    //TODO:append style:xmp{display:none}
    _jSouperBase.ready(function() {
        _jSouperBase.scans();
        if (userConfigStr.charAt(0) === "{") {
            try {
                var userConfig = userConfigStr ? Function("return" + userConfigStr)() : {};
            } catch (e) {
                console.error("config error:" + e.message);
            }
            userConfig && _jSouperBase.app(userConfig)
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

if (typeof module === "object" && module && typeof module.exports === "object") {
    module.exports = jSouper;
} else {
    if (typeof define === "function" && define.amd) {
        define("jSouper", [], function() {
            return jSouper
        })
    }
}
