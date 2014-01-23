/*
 * export
 */
var jSouper = global.jSouper = {
    //暴露基本的工具集合，给拓展组件使用
    $: $,
    queryHandle: function(node) {
        return ViewModel.queryList._[$.hashCode(node)];
    },
    scans: function(node) {
        node || (node = doc);
        var xmps = $.s(node.getElementsByTagName("xmp"));
        Array.prototype.push.apply(xmps, node.getElementsByTagName(V.namespace + "xmp"));
        $.e(xmps, function(tplNode) {
            var type = tplNode.getAttribute("type");
            var name = tplNode.getAttribute("name");
            if (name) {
                if (type === "template") {
                    V.modules[name] = jSouper.parseStr(tplNode.innerHTML, name);
                    $.D.rm(tplNode);
                }
            }
        });
        $.e(node.getElementsByTagName("script"), function(scriptNode) {
            var type = scriptNode.getAttribute("type");
            var name = scriptNode.getAttribute("name");
            if (name) {
                if (type === "text/template") {
                    V.modules[name] = jSouper.parseStr(scriptNode.text, name);
                    $.D.rm(scriptNode);
                } else if (type === "text/vm") {
                    V.modulesInit[name] = Function("return " + $.trim(scriptNode.text))();
                    $.D.rm(scriptNode);
                }
            }
        });
        return node;
    },
    parseStr: function(htmlStr, name) {
        return V.parse(parse(htmlStr), name)
    },
    parseNode: function(htmlNode, name) {
        return V.parse(parse(htmlNode.innerHTML), name)
    },
    parse: function(html, name) {
        if ($.isO(html)) {
            return this.parseNode(html, name)
        }
        return this.parseStr(html, name)
    },
    modules: V.modules,
    modulesInit: V.modulesInit,
    _V: V,
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
            // template.set(HVP_config.Data);
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
            vi = module(userConfig.Data);
            var appName = userConfig.Var;
            if (appName) {
                if (appName in global) {
                    appName = appName + "_App";
                    console.warn("App's name will be set as " + appName);
                }
                global[appName] = vi;
            }
        }
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
                if (/complete|onload/.test(doc.readyState)) { //fix asyn load
                    _load()
                }
            }
        }
    }())
};
(function() {
    var scriptTags = doc.getElementsByTagName("script"),
        HVP_config = jSouper.config,
        userConfigStr = $.trim(scriptTags[scriptTags.length - 1].innerHTML);
    //TODO:append style:xmp{display:none}
    jSouper.ready(function() {
        jSouper.scans();
        if (userConfigStr.charAt(0) === "{") {
            try {
                var userConfig = userConfigStr ? Function("return" + userConfigStr)() : {};
            } catch (e) {
                console.error("config error:" + e.message);
            }
            userConfig && jSouper.app(userConfig)
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
