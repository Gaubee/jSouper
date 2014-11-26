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
        DOMContentLoaded: "readystatechange"
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
    _AttributeHandle = function(attrKey, element) {
        var assign;
        var attrHandles = V.attrHandles,
            result;
        $.e(attrHandles, function(attrHandle) {
            if (attrHandle.match(attrKey)) {
                // if (element.type==="textarea") {debugger}
                result = attrHandle.handle(attrKey, element);
                return $FALSE
            }
        });
        return result || _AttributeHandleEvent.com;
    },
    _templateMatchRule = /\{[\w\W]*?\{[\w\W]*?\}[\s]*\}/,
    _fixAttrKey = function(attrKey) {
        attrKey = attrKey.indexOf(V.prefix) /*!== 0*/ ? attrKey : attrKey.replace(V.prefix, "")
        attrKey = (_isIE && IEfix[attrKey]) || attrKey
        return attrKey;
    },
    _getAttrViewModel = function(attrValue) {
        var AttrView = V.attrModules[attrValue];
        if (!AttrView) {
            //属性VM都是共享的，因为简单，玩玩只有少于10个的触发key。
            AttrView = V.attrModules[attrValue] = jSouper.parse(attrValue, attrValue)
            AttrView.instance = AttrView($UNDEFINED, {
                isAttr: $TRUE
            });
        }
        return AttrView.instance
    },
    attributeHandle = function(attrKey, attrValue, node, handle, triggerTable) {
        attrKey = _fixAttrKey(attrKey);

        var attrViewModel = _getAttrViewModel(attrValue);

        //获取对应的属性处理器
        var _attributeHandle = _AttributeHandle(attrKey, node);
        attrViewModel._isAttr = {
            key: attrKey
        }
        var attrTrigger = {
            handleId: handle.id + attrKey,
            key: attrKey,
            type: "attributesTrigger",
            event: function(NodeList, model, /* eventTrigger,*/ isAttr, viewModel_ID) { /*NodeList, model, eventTrigger, self._isAttr, self._id*/
                var currentNode = NodeList[handle.id].currentNode,
                    viewModel = V._instances[viewModel_ID];
                if (currentNode) {
                    //绑定数据域
                    attrViewModel.model = model;
                    //更新所有节点
                    $.E(attrViewModel._triggers, function(key) { //touchoff all triggers
                        attrViewModel.touchOff(key);
                    });

                    _attributeHandle(attrKey, currentNode, attrViewModel /*.topNode()*/ , viewModel, /*model.id,*/ handle, triggerTable);
                    // model.remove(attrViewModel); //?

                    //触发onporpertychange事件
                    var _attrChangeListenerKey = currentNode[_attrKeyListenerPlaceholder]
                    if (_attrChangeListenerKey) {
                        var eventMap = attrKeyListenerEvent[_attrChangeListenerKey];
                        var propertyChangeEvents = eventMap && eventMap[attrKey];
                        $.isA(propertyChangeEvents)&&$.E(propertyChangeEvents,function (handle) {
                            handle.call(currentNode, attrKey, viewModel);
                        });
                    }

                }
            }
        }

        //将属性VM的所有的触发key映射到父VM中。让父VM托管
        $.E(attrViewModel._triggers, function(key) {
            //TODO:这里是要使用push还是unshift?
            //如果后者，则View再遍历属性时就需要reverse
            //如果前者，会不会因为触发顺序而导致程序逻辑出问题
            $.p(triggerTable[key] || (triggerTable[key] = []), attrTrigger);
        });
        // node.removeAttribute(baseAttrKey);
        //}
    };

/*
 * OnPropertyChange
 */
//用于模拟绑定onpropertychange，只能用于通过jSouper触发属性变动的对象
var _attrKeyListenerPlaceholder = _placeholder("attr_lister");
var attrKeyListenerEvent = {};
function bindElementPropertyChange(ele, attrKey, handle){
    var _attrChangeListenerKey = _placeholder("attr_lister_key")
    ele[_attrKeyListenerPlaceholder] = _attrChangeListenerKey;
    var eventMap = attrKeyListenerEvent[_attrChangeListenerKey]||(attrKeyListenerEvent[_attrChangeListenerKey] = {});
    var propertyChangeEvents = eventMap[attrKey]||(eventMap[attrKey] = []);
    propertyChangeEvents.push(handle);
}