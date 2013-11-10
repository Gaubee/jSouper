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
	__lowestDelta, __lowestDeltaXY,
	_extendEventRouter = function(e, _extend) {
		if (e.__proto__) {
			var result = (_extendEventRouter = _extendEventRouter_proto)(e, _extend);
		} else {
			// try {// 	delete e.type; // 	e.type = e._eventName; // } catch (e) {// 	_e = $.c(e) // 	_e.type = "leftclick"// }
			if (_isIE) {
				result = (_extendEventRouter = _extendEventRouter_ie)(e, _extend);
			} else {
				result = (_extendEventRouter = _extendEventRouter_old)(e, _extend);
			}
		}
		return result;
	},
	_extendEventRouter_proto = function(e, _extend) {
		var _e = {};
		$.fI(_extend, function(value, key) {
			_e[key] = value;
		})
		_e.__proto__ = e;
		return _e;
	},
	_extendEventRouter_ie = function(e, _extend) {
		var _e;
		_e = $.c(e)
		$.fI(_extend, function(value, key) {
			_e[key] = value;
		})
		return _e;
	},
	_extendEventRouter_old = function(e, _extend) {
		$.fI(_extend, function(value, key) {
			delete e[key];
			e[key] = value;
		})
		return e;
	},
	_registerEventBase = function(Element, eventName, eventFun, elementHash) {
		var result = {
			name: /*_eventNameMap[eventName] || */ eventName,
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

		if (eventName === "input" && !("oninput" in doc)) {
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
				var _result;
				result.fn = function(e) {
					if (e.type === "contextmenu") {
						return _result;
					} else {
						if (e.button === 2) {
							e._extend = {
								type: "contextmenu"
							}
							_result = _fn(e)
						};
					}
				}
			}());
		} else if (/mouseenter|mouseleave/.test(eventName) && !_isIE) {
			(function() {
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
						e._extend = {
							type: eventName
						}
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
		} else if (eventName === "wclick" || eventName === "wheelclick") {
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
		} else if (eventName === "mousewheel") {
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