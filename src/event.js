var
//事件缓存区
_event_cache = {},
    // //底层事件缓存区，实现系统的getEventListeners
    // __base_event_cache = {},
    _fixEvent = function(e) { //@Rybylouvre
        // if (!e.target) {console.log(e)};
        e.target || (e.target = e.srcElement);
        e.which || (e.which = e.charCode || e.keyCode); //e.charCode != $NULL ? e.charCode : e.keyCode;
        e.preventDefault || (e.preventDefault = function() { //for ie
            e.returnValue = $FALSE
        });
        e.stopPropagation || (e.stopPropagation = function() { //for ie
            e.cancelBubble = $TRUE
        });
    },

    //修复浏览器兼容的鼠标坐标
    _box,
    _fixMouseEvent = function(event) {
        _fixEvent(event);
        if (!_box && _isIE) {
            _box = event.target.ownerDocument || doc;
            _box = "BackCompat" === _box.compatMode ? _box.body : _box.documentElement;
        }
        event.pageX || (event.pageX = event.clientX + ~~_box.scrollLeft - ~~_box.clientLeft);
        event.pageY || (event.pageY = event.clientY + ~~_box.scrollTop - ~~_box.clientTop);
    },

    //修复浏览器兼容的滚轮事件缓存值
    __lowestDelta, __lowestDeltaXY,

    //事件对象修复
    _extendEventRouter = function(e, _extend) {
        //可以操作原型链的话直接使用原型链继承方式
        if (e.__proto__) {
            var result = (_extendEventRouter = function(e, _extend) {
                var _e = {};
                $.fI(_extend, function(value, key) {
                    _e[key] = value;
                })
                _e.__proto__ = e;
                return _e;
            })(e, _extend);
        } else {
            //IE系列也是使用原型链，但是现代浏览器的属性操作会直接定位到原型链上
            if (_isIE) {
                result = (_extendEventRouter = function(e, _extend) {
                    var _e;
                    _e = $.c(e)
                    $.fI(_extend, function(value, key) {
                        _e[key] = value;
                    })
                    return _e;
                })(e, _extend);
            } else {
                try {
                    result = (_extendEventRouter = function(e, _extend) {
                        $.fI(_extend, function(value, key) {
                            delete e[key];
                            e[key] = value;
                        })
                        return e;
                    })(e, _extend);
                } catch (ex) {}
            }
        }
        return result;
    },

    //事件生成器中的路由匹配
    _registerEventRouterMatch = {
        ip: {
            input: $TRUE
        },
        //右键
        rc: {
            contextmenu: $TRUE,
            rclick: $TRUE,
            rightclick: $TRUE
        },
        //模拟mouseEnter、mouseLeave
        el: ("onmouseenter" in doc) ? {} : {
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        },
        //左键
        lc: {
            lclick: $TRUE,
            leftclick: $TRUE
        },
        //中键
        wc: {
            wclick: $TRUE,
            wheelclick: $TRUE
        },
        //滚轮事件
        mw: {
            mousewheel: $TRUE
        },
        //声明及执行事件，用于做初始化
        rd: {
            ready: $TRUE
        }
    },
    //事件生成器
    _registerEventBase = function(Element, eventName, eventFun, elementHash) {
        var result = {
            name: eventName,
            fn: eventFun
        };
        var _fn = result.fn = (function(fixEvent) {
            return function(e) {
                fixEvent(e);
                var _e = e;
                e._extend && (_e = _extendEventRouter(e, e._extend));
                var result = eventFun.call(Element, _e);
                (result === $FALSE) && (e.preventDefault() || e.stopPropagation());
                return result;
            }
        }(_isIE ? (/mouse|click|contextmenu/.test(eventName) ? _fixMouseEvent : _fixEvent) : $.noop));

        if (_registerEventRouterMatch.ip[eventName] && !("oninput" in doc) ) {
            //不真实，input只来自用户的输入，不来自脚本的改动
            // //现代浏览器模拟value被写
            // if ("oninput" in doc) {
            //     //初始化模拟
            //     var ev = doc.createEvent("HTMLEvents");
            //     ev.initEvent("input", true, false);
            //     Element.__value__ = "";
            //     //如果这个现代浏览器没有对value做保护，可自定义，IE、Chrome、Firefox都支持
            //     if (Element.__defineSetter__) {
            //         (function() {
            //             Element.__defineSetter__("value", function(newValue) {
            //                 if (typeof newValue !== "number") {
            //                     newValue = String(newValue);
            //                 }
            //                 if (Element.__value__ !== newValue) {
            //                     Element.__value__ = newValue;
            //                     Element.setAttribute("value", newValue);
            //                     if (doc.contains(Element)) {
            //                         Element.dispatchEvent(ev);
            //                     }
            //                 }
            //             });
            //             Element.__defineGetter__("value", function() {
            //                 return Element.__value__;
            //             })
            //         }());
            //     }
            //     //如果不能自动义或者自定义失败
            //     //不支持value监听的话，比如safari，只能时间循环机制轮询，为了浏览器渲染稳定，使用requestAnimationFrame
            //     if (!Element.__lookupSetter__ || !Element.__lookupSetter__("value")) {
            //         //无需顾及内存泄漏，框架对废弃的节点应自动收集重用
            //         _jSouperBase.ready(function(argument) {
            //             requestAnimationFrame(function checkValue() {
            //                 if (doc.contains(Element) && Element.__value__ !== Element.value) {
            //                     Element.setAttribute("value", Element.__value__ = Element.value);
            //                     Element.dispatchEvent(ev);
            //                 }
            //                 requestAnimationFrame(checkValue);
            //             });
            //         })
            //     }
            // } else {
            (function() {
                result.name = ["keypress", /*"focus", */ "blur", "keyup", "paste", "propertychange", "cut"]
                var _fixPropertychangeLock,
                    _deleteOrChienseInput,
                    _oldValue = Element.value,
                    _TI;
                // delete Element.value;
                result.fn = function(e) { // @Gaubee github/blog/issues/44
                    var result;
                    if (e.type === "keyup") { //keyup // 3
                        if (_deleteOrChienseInput) {
                            _deleteOrChienseInput = $FALSE;
                            _oldValue = Element.value;
                            e._extend = {
                                type: "input"
                            }
                            result = _fn(e);
                        }
                    } else if (e.type === "propertychange") { // 2
                        if (_fixPropertychangeLock) {
                            _fixPropertychangeLock = $FALSE;
                            e._extend = {
                                type: "input"
                            }
                            result = _fn(e);
                        } else if ((e.keyCode === 8 /*backspace*/ || e.keyCode === 46 /*delete*/ ) || _oldValue !== Element.value) { //delete or chinese input
                            _deleteOrChienseInput = $TRUE;
                        }
                    } else if (e.type === "blur") {
                        Element.fireEvent("onkeyup")
                        // clearInterval(_TI);
                    } else { //paste cut keypress  // 1
                        _fixPropertychangeLock = $TRUE;
                        _deleteOrChienseInput = $FALSE;
                    }
                }
            }());
            // }
        } else if (_registerEventRouterMatch.rc[eventName] /*&& _isIE*/ ) {
            if (_isIE) {
                (function() {
                    result.name = ["mousedown", "contextmenu"];
                    var _result;
                    result.fn = function(e) {
                        if (e.type !== "contextmenu" && e.button === 2) {
                            e._extend = {
                                type: "contextmenu"
                            }
                            _result = _fn(e)
                        }
                        return _result;
                    }
                }());
            } else {
                result.name = ["contextmenu"];
            }
        } else if (result._cacheName = _registerEventRouterMatch.el[eventName]) {
            (function() {
                result.name = result._cacheName;
                result.fn = function(e) {
                    var topNode = e.relatedTarget,
                        self = this;
                    /*compareDocumentPosition
                        0 self == topNode ===> 
                        1 self in deffriend Document with topNode
                        2 topNode befor self
                        4 self befor topNode
                        8 topNode contains self
                        16 self contains topNode  ==>  
                        32 Brower private*/
                    if (!topNode || (topNode !== self && !(self.compareDocumentPosition(topNode) & 16))) { //@Rubylouvre
                        e._extend = {
                            type: eventName
                        }
                        return _fn(e);
                    }
                }
            }())
        } else if (_registerEventRouterMatch.lc[eventName]) {
            (function() {
                result.name = "mousedown"
                result.fn = _isIE ? function(e) {
                    if (e.button === 1) {
                        e._extend = {
                            type: "leftclick"
                        }
                        return _fn(e);
                    }
                } : function(e) {
                    if (e.button === 0) {
                        e._extend = {
                            type: "leftclick"
                        }
                        return _fn(e);
                    }
                }
            }());
        } else if (_registerEventRouterMatch.wc[eventName]) {
            (function() {
                result.name = "mousedown"
                result.fn = _isIE ? function(e) {
                    if (e.button === 4) {
                        e._extend = {
                            type: "wheelclick"
                        }
                        return _fn(e);
                    }
                } : function(e) {
                    if (e.button === 1) {
                        e._extend = {
                            type: "wheelclick"
                        }
                        return _fn(e);
                    }
                }
            }());
        } else if (_registerEventRouterMatch.mw[eventName]) {
            //@brandonaaron:jquery-mousewheel MIT License
            (function() {
                result.name = "onwheel" in doc || doc.documentMode >= 9 ? "wheel" : ["mousewheel", "DomMouseScroll", "MozMousePiexlScroll"];
                result.fn = function(e) {
                    var delta = 0, //增量
                        deltaX = 0,
                        deltaY = 0,
                        absDelta = 0,
                        absDeltaXY = 0,
                        fn;

                    // Old school scrollwheel delta
                    if (e.wheelDelta /*px or undefined*/ ) {
                        delta = e.wheelDelta;
                    }
                    if (e.detail /*0 or px*/ ) {
                        delta = e.detail * -1;
                    }
                    // At a minimum, setup the deltaY to be delta
                    deltaY = delta;

                    // Firefox < 17 related to DOMMouseScroll event
                    if (e.axis !== $UNDEFINED && e.axis === e.HORIZONTAL_AXIS) {
                        deltaY = 0;
                        deltaX = delta * -1;
                    }

                    // New school wheel delta (wheel event)
                    if (e.deltaY) {
                        deltaY = e.deltaY * -1;
                        delta = deltaY;
                    }
                    if (e.deltaX) {
                        deltaX = e.deltaX;
                        delta = deltaX * -1;
                    }
                    // Webkit
                    if (e.wheelDeltaY !== $UNDEFINED) {
                        deltaY = e.wheelDeltaY;
                    }
                    if (e.wheelDeltaX !== $UNDEFINED) {
                        deltaX = e.wheelDeltaX * -1;
                    }

                    // Look for lowest delta to normalize the delta values
                    absDelta = Math.abs(delta);
                    if (!__lowestDelta || absDelta < __lowestDelta) {
                        __lowestDelta = absDelta;
                    }
                    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
                    if (!__lowestDeltaXY || absDeltaXY < __lowestDeltaXY) {
                        __lowestDeltaXY = absDeltaXY;
                    }

                    // Get a whole value for the deltas
                    fn = delta > 0 ? 'floor' : 'ceil';
                    delta = Math[fn](delta / __lowestDelta);
                    deltaX = Math[fn](deltaX / __lowestDeltaXY);
                    deltaY = Math[fn](deltaY / __lowestDeltaXY);
                    e._extend = {
                        type: 'mousewheel',
                        wheelDelta: delta,
                        wheelDeltaX: deltaX,
                        wheelDeltaY: deltaY
                    }
                    _fn(e)
                }
            }());
        } else if (_registerEventRouterMatch.rd[eventName]) {
            finallyRun.register(elementHash, function() {
                _fn({
                    type: "ready"
                });
            })
        }
        _event_cache[elementHash + $.hashCode(eventFun)] = result;
        return result;
    },

    //现代浏览器的事件监听
    _addEventListener = function(Element, eventName, eventFun, elementHash) {
        var eventConfig = _registerEventBase(Element, eventName, eventFun, elementHash)
        // var __base_hash_code = $.hashCode(Element);
        // var event_cache = __base_event_cache[__base_hash_code] || (__base_event_cache[__base_hash_code] = {});
        if ($.isS(eventConfig.name)) {
            Element.addEventListener(eventConfig.name, eventConfig.fn, $FALSE);
            // $.p(event_cache[eventConfig.name] || (event_cache[eventConfig.name] = []), eventConfig.fn);
        } else {
            $.E(eventConfig.name, function(eventName) {
                Element.addEventListener(eventName, eventConfig.fn, $FALSE);
                // $.p(event_cache[eventConfig.name] || (event_cache[eventConfig.name] = []), eventConfig.fn);
            })
        }
    },
    //现代浏览器的事件移除
    _removeEventListener = function(Element, eventName, eventFun, elementHash) {
        var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
        // var __base_hash_code = $.hashCode(Element);
        // var eventList = __base_event_cache[__base_hash_code][eventConfig.name];
        wrapEventFun && Element.removeEventListener(eventName, wrapEventFun, $FALSE);
        // eventList.splice($.iO(eventList, eventFun), 1);
    },

    //IE浏览器的时间监听
    _attachEvent = function(Element, eventName, eventFun, elementHash) {
        var eventConfig = _registerEventBase(Element, eventName, eventFun, elementHash)
        // var __base_hash_code = $.hashCode(Element);
        // var event_cache = __base_event_cache[__base_hash_code] || (__base_event_cache[__base_hash_code] = {});
        if ($.isS(eventConfig.name)) {
            Element.attachEvent("on" + eventConfig.name, eventConfig.fn);
            // $.p(event_cache[eventConfig.name] || (event_cache[eventConfig.name] = []), eventConfig.fn);
        } else {
            $.E(eventConfig.name, function(eventName) {
                Element.attachEvent("on" + eventName, eventConfig.fn);
                // $.p(event_cache[eventConfig.name] || (event_cache[eventConfig.name] = []), eventConfig.fn);
            })
        }
    },
    //IE浏览器的事件移除
    _detachEvent = function(Element, eventName, eventFun, elementHash) {
        var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
        // var __base_hash_code = $.hashCode(Element);
        // var eventList = __base_event_cache[__base_hash_code][eventConfig.name];
        wrapEventFun && Element.detachEvent("on" + eventName, wrapEventFun);
        // eventList.splice($.iO(eventList, eventFun), 1);
    },

    //对外的接口
    _registerEvent = $.registerEvent = _isIE ? _attachEvent : _addEventListener,
    _cancelEvent = $.cancelEvent = _isIE ? _detachEvent : _removeEventListener;
