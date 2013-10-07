var _isIE = !window.dispatchEvent,//!+"\v1",
	//by RubyLouvre(司徒正美)
	//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
	IEfix = {
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
The full list of boolean attributes in HTML 4.01 (and hence XHTML 1.0) is (with property names where they differ in case):

checked             (input type=checkbox/radio)
selected            (option)
disabled            (input, textarea, button, select, option, optgroup)
readonly            (input type=text/password, textarea)
multiple            (select)
ismap     isMap     (img, input type=image)

defer               (script)
declare             (object; never used)
noresize  noResize  (frame)
nowrap    noWrap    (td, th; deprecated)
noshade   noShade   (hr; deprecated)
compact             (ul, ol, dl, menu, dir; deprecated)
//------------anyother answer
all elements: hidden
script: async, defer
button: autofocus, formnovalidate, disabled
input: autofocus, formnovalidate, multiple, readonly, required, disabled, checked
keygen: autofocus, disabled
select: autofocus, multiple, required, disabled
textarea: autofocus, readonly, required, disabled
style: scoped
ol: reversed
command: disabled, checked
fieldset: disabled
optgroup: disabled
option: selected, disabled
audio: autoplay, controls, loop, muted
video: autoplay, controls, loop, muted
iframe: seamless
track: default
img: ismap
form: novalidate
details: open
object: typemustmatch
marquee: truespeed
//----
editable
draggable
*/
	_AttributeHandle = function(attrKey) {
		var assign;
		var attrHandles = V.attrHandles,
			result;
		// console.log("attrKey:",attrKey)
		$.fE(attrHandles, function(attrHandle) {
			// console.log(attrHandle.match)
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

			var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
				_shadowDIV = $.D.cl(shadowDIV), //parserNode
				_attributeHandle = _AttributeHandle(attrKey);
			attrViewInstance.append(_shadowDIV);
			attrViewInstance._isAttr = {
				key: attrKey
			}

			var attrTrigger = {
				event: function(NodeList, dataManager, eventTrigger, isAttr, viewInstance_ID) { /*NodeList, dataManager, eventTrigger, self._isAttr, self._id*/
					var currentNode = NodeList[handle.id].currentNode,
						viewInstance = V._instances[viewInstance_ID];
					if (currentNode) {
						dataManager.collect(attrViewInstance);
						$.fE(attrViewInstance._triggers, function(key) {
							attrViewInstance.touchOff(key);
						});
						_attributeHandle(attrKey, currentNode, _shadowDIV, viewInstance, dataManager, handle, triggerTable);
						dataManager.remove(attrViewInstance); //?
					}
				}
			}
			$.fE(attrViewInstance._triggers, function(key) {
				$.us(triggerTable[key] || (triggerTable[key] = []), attrTrigger);
			});

		}
	};