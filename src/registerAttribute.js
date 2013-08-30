var _isIE = !+"\v1";
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
	vspace: "vSpace"
};
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

var _AttributeHandle = function(attrKey) {
	var assign;
	var attrHandles = V.attrHandles,
		result;
	// console.log("attrKey:",attrKey)
	$.forEach(attrHandles, function(attrHandle) {
		// console.log(attrHandle.match)
		if (attrHandle.match(attrKey)) {
			result = attrHandle.handle(attrKey);
			return false
		}
	});
	return result || _AttributeHandleEvent.com;
};
// var setAttribute = function() { /*viewInstance ,dataManager*/
// 	var self = this,
// 		attrKey = self.key,
// 		currentNode = self.currentNode,
// 		parserNode = self.parserNode;
// 	if (currentNode) {
// 		// console.log(attrKey,":",parserNode.innerText);//DEBUG
// 		self._attributeHandle(attrKey, currentNode, parserNode);
// 	}
// };

var attributeHandle = function(attrStr, node, handle, triggerTable) {
	var attrKey = $.trim(attrStr.substring(0, attrStr.search("="))),
		attrValue = node.getAttribute(attrKey);
	attrKey = attrKey.toLowerCase()
	attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
	attrKey = (_isIE && IEfix[attrKey]) || attrKey
	if (_matchRule.test(attrValue)) {

		var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
			_shadowDIV = $.DOM.clone(shadowDIV); //parserNode
		attrViewInstance.append(_shadowDIV);
		attrViewInstance._isAttr = {
			key: attrKey,
			// parserNode: _shadowDIV,
			/*
			When the trigger of be injecte in the View instance being fired (triggered by the ViewInstance instance), 
			it will storage the property value where the currentNode,// and the dataManager, 
			and lock it into attrViewInstance, 
			waiting for updates the attribute.*/ //(so the trigger of be injecte in mush be unshift)
			currentNode: null,
			_attributeHandle: _AttributeHandle(attrKey),
			setAttribute: function() { /*viewInstance ,dataManager*/
				var self = this,
					currentNode = self.currentNode;
				if (currentNode) {
					// console.log(attrKey,":",parserNode.innerText);//DEBUG
					self._attributeHandle(attrKey, currentNode, _shadowDIV);
				}
			}
		};

		var attrTrigger = {
			// key:"$ATTR",
			// TEMP: {
			// 	belongsNodeId: handle.id,
			// 	self: attrViewInstance
			// },
			event: function(NodeList, dataManager, eventTrigger) {
				attrViewInstance._isAttr.currentNode = NodeList[handle.id].currentNode;
				dataManager.collect(attrViewInstance);
			}
		}
		$.forEach(attrViewInstance._triggers, function(key) {
			$.unshift((triggerTable[key] = triggerTable[key] || []), attrTrigger);
		});

	}
}