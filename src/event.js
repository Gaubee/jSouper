var _event_cache = {},
	_box,
	_eventNameMap = (_isIE ? {
		input: ["keypress", /*"focus", */ "blur", "keyup", "paste", "propertychange", "cut"],
		contextmenu: ["mousedown", "contextmenu"],
		rightclick: ["mousedown", "contextmenu"],
		rclick: ["mousedown", "contextmenu"],
		lclick: "mousedown",
		leftclick: "mousedown",
		wclick: "mousedown",
		wheelclick: "mousedown"
	} : {
		rightclick: "contextmenu",
		rclick: "contextmenu",
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		lclick: "mousedown",
		leftclick: "mousedown",
		wclick: "mousedown",
		wheelclick: "mousedown"
	}),
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
	_fixMouseEvent = function(event) {
		_fixEvent(event);
		if (!_box && _isIE) {
			_box = event.target.ownerDocument || doc;
			_box = "BackCompat" === _box.compatMode ? _box.body : _box.documentElement;
		}
		event.pageX || (event.pageX = event.clientX + ~~_box.scrollLeft - ~~_box.clientLeft);
		event.pageY || (event.pageY = event.clientY + ~~_box.scrollTop - ~~_box.clientTop);
	},
	_registerEventBase = function(Element, eventName, eventFun, elementHash) {
		var result = {
			name: /*_eventNameMap[eventName] || */ eventName,
			fn: eventFun
		};
		result.fn = (function(fixEvent) {
			return function(e) {
				fixEvent(e);
				var _e = e;
				if (e._eventName) {
					if (e.__proto__) {
						_e = {
							type: e._eventName
						}
						_e.__proto__ = e;
					} else {
						// try {
						// 	delete e.type;
						// 	e.type = e._eventName;
						// } catch (e) {
						// 	_e = $.c(e)
						// 	_e.type = "leftclick"
						// }
						if (_isIE) {
							_e = $.c(e)
							_e.type = e._eventName
						} else {
							delete e.type;
							e.type = e._eventName;
						}
					}
				}
				var result = eventFun.call(Element, _e);
				(result === $FALSE) && (e.preventDefault() || e.stopPropagation());
				return result;
			}
		}(_isIE ? (/mouse|click|contextmenu/.test(eventName) ? _fixMouseEvent : _fixEvent) : $.noop));

		if (eventName === "input" && !("oninput" in doc)) {
			(function() {
				result.name = ["keypress", /*"focus", */ "blur", "keyup", "paste", "propertychange", "cut"]
				var _fn = result.fn;
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
							result = _fn(e);
						}
					} else if (e.type === "propertychange") { // 2
						if (_fixPropertychangeLock) {
							_fixPropertychangeLock = $FALSE;
							result = _fn(e);
						} else if ((e.keyCode === 8 /*backspace*/ || e.keyCode === 46 /*delete*/ ) || _oldValue !== Element.value) { //delete or chinese input
							console.log(arguments.callee.caller)
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
				// function(b){"keydown"===b.type?8!==b.keyCode&&46!==b.keyCode||f===a.value||(f=a.value,z=G):"propertychange"===b.type?z&&(z=H,g(b)):z=G}
			}());
		} else if (/contextmenu|rclick|rightclick/.test(eventName) && _isIE) {
			(function() {
				result.name = ["mousedown", "contextmenu"];
				var _fn = result.fn;
				var _result;
				result.fn = function(e) {
					if (e.type === "contextmenu") {
						return _result;
					} else {
						if (e.button === 2) {
							e._eventName = "contextmenu"
							_result = _fn(e)
						};
					}
				}
			}());
		} else if (/mouseenter|mouseleave/.test(eventName) && !_isIE) {
			(function() {
				var _fn = result.fn;
				result.name = eventName[5] === "e" ? "mouseover" : "mouseout";
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
						e._eventName = eventName;
						return _fn(e);
					}
					/*else{
						return _fixMouseEnterAndLeave;//stop run 
					}*/
				}
			}())
		} else if (eventName === "lclick" || eventName === "leftclick") {
			(function() {
				result.name = "mousedown"
				var _fn = result.fn;
				result.fn = _isIE ? function(e) {
					if (e.button === 1) {
						e._eventName = "leftclick"
						return _fn(e);
					}
				} : function(e) {
					if (e.button === 0) {
						e._eventName = "leftclick"
						return _fn.call(this, e);
					}
				}
			}());
		} else if (eventName === "wclick" || eventName === "wheelclick") {
			(function() {
				result.name = "mousedown"
				var _fn = result.fn;
				result.fn = _isIE ? function(e) {
					if (e.button === 4) {
						e._eventName = "wheelclick"
						return _fn(e);
					}
				} : function(e) {
					if (e.button === 1) {
						e._eventName = "wheelclick"
						return _fn.call(this, e);
					}
				}
			}());
		}else if(eventName==="mousewheel"){
			result.name= "onwheel" in doc||doc.documentMode>=9?"wheel":["mousewheel","DomMouseScroll","MozMousePiexlScroll"];
		}
		_event_cache[elementHash + $.hashCode(eventFun)] = result;
		return result;
	},
	_addEventListener = function(Element, eventName, eventFun, elementHash) {
		var eventConfig = _registerEventBase(Element, eventName, eventFun, elementHash)
		if (typeof eventConfig.name === "string") {
			Element.addEventListener(eventConfig.name, eventConfig.fn, $FALSE);
		} else {
			$.ftE(eventConfig.name, function(eventName) {
				Element.addEventListener(eventName, eventConfig.fn, $FALSE);
			})
		}
	},
	_removeEventListener = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.removeEventListener(eventName, wrapEventFun, $FALSE);
	},
	_attachEvent = function(Element, eventName, eventFun, elementHash) {
		var eventConfig = _registerEventBase(Element, eventName, eventFun, elementHash)
		if (typeof eventConfig.name === "string") {
			Element.attachEvent("on" + eventConfig.name, eventConfig.fn);
		} else {
			$.ftE(eventConfig.name, function(eventName) {
				Element.attachEvent("on" + eventName, eventConfig.fn);
			})
		}
	},
	_detachEvent = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.detachEvent("on" + eventName, wrapEventFun);
	},
	_registerEvent = _isIE ? _attachEvent : _addEventListener,
	_cancelEvent = _isIE ? _detachEvent : _removeEventListener;