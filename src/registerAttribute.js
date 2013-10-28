	//by RubyLouvre(司徒正美)
	//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
var IEfix = {
		acceptcharset: "acceptCharset",
		accesskey: "accessKey",
		allowtransparency: "allowTransparency",
		bgcolor: "bgColor",
		cellpadding: "cellPadding",
		cellspacing: "cellSpacing",
		"class": "className",
		colspan: "colSpan",
		// checked: "defaultChecked",
		selected: "defaultSelected",
		"for": "htmlFor",
		frameborder: "frameBorder",
		hspace: "hSpace",
		longdesc: "longDesc",
		maxlength: "maxLength",
		marginwidth: "marginWidth",
		marginheight: "marginHeight",
		noresize: "noResize",
		noshade: "noShade",
		readonly: "readOnly",
		rowspan: "rowSpan",
		tabindex: "tabIndex",
		valign: "vAlign",
		vspace: "vSpace",
		DOMContentLoaded:"readystatechange"
	},
	/*
The full list of boolean attributes in HTML 4.01 (and hence XHTML 1.0) is (with property names where they differ in case): \n \n checked             (input type=checkbox/radio) \n selected            (option) \n disabled            (input, textarea, button, select, option, optgroup) \n readonly            (input type=text/password, textarea) \n multiple            (select) \n ismap     isMap     (img, input type=image) \n \n defer               (script) \n declare             (object; never used) \n noresize  noResize  (frame) \n nowrap    noWrap    (td, th; deprecated) \n noshade   noShade   (hr; deprecated) \n compact             (ul, ol, dl, menu, dir; deprecated) \n //------------anyother answer \n all elements: hidden \n script: async, defer \n button: autofocus, formnovalidate, disabled \n input: autofocus, formnovalidate, multiple, readonly, required, disabled, checked \n keygen: autofocus, disabled \n select: autofocus, multiple, required, disabled \n textarea: autofocus, readonly, required, disabled \n style: scoped \n ol: reversed \n command: disabled, checked \n fieldset: disabled \n optgroup: disabled \n option: selected, disabled \n audio: autoplay, controls, loop, muted \n video: autoplay, controls, loop, muted \n iframe: seamless \n track: default \n img: ismap \n form: novalidate \n details: open \n object: typemustmatch \n marquee: truespeed \n //---- \n editable \n draggable \n */
	_AttributeHandle = function(attrKey) {
		var assign;
		var attrHandles = V.attrHandles,
			result;
		$.fE(attrHandles, function(attrHandle) {
			if (attrHandle.match(attrKey)) {
				result = attrHandle.handle(attrKey);
				return $FALSE
			}
		});
		return result || _AttributeHandleEvent.com;
	},
	_templateMatchRule= /\{[\w\W]*?\{[\w\W]*?\}[\s]*\}/,
	attributeHandle = function(attrStr, node, handle, triggerTable) {
		var attrKey = $.trim(attrStr.substring(0, attrStr.search("="))),
			attrValue = node.getAttribute(attrKey);
		attrKey = attrKey.toLowerCase()
		attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
		attrKey = (_isIE && IEfix[attrKey]) || attrKey
		if (_matchRule.test(attrValue)||_templateMatchRule.test(attrValue)) {
			var attrViewInstance = (V.attrModules[handle.id + attrKey] = ViewParser.parse(attrValue))(),
				_shadowDIV = $.D.cl(shadowDIV), //parserNode
				_attributeHandle = _AttributeHandle(attrKey);
			attrViewInstance.append(_shadowDIV);
			attrViewInstance._isAttr = {
				key: attrKey
			}
			var attrTrigger = {
				handleId:handle.id+attrKey,
				key:attrKey,
				type:"attributesTrigger",
				event: function(NodeList, dataManager,/* eventTrigger,*/ isAttr, viewInstance_ID) { /*NodeList, dataManager, eventTrigger, self._isAttr, self._id*/
					var currentNode = NodeList[handle.id].currentNode,
						viewInstance = V._instances[viewInstance_ID];
					if (currentNode) {
						attrViewInstance.dataManager = dataManager;
						$.fE(attrViewInstance._triggers, function(key) {//touchoff all triggers
							attrViewInstance.touchOff(key);
						});
						_attributeHandle(attrKey, currentNode, _shadowDIV, viewInstance, dataManager, handle, triggerTable);
						// dataManager.remove(attrViewInstance); //?
					}
				}
			}
			$.fE(attrViewInstance._triggers, function(key) {
				$.us(triggerTable[key] || (triggerTable[key] = []), attrTrigger);
			});
			// console.log(attrKey,attrValue)
		}
	};