var AllCustomTagVM = {};
V.rt("custom_tag", function(handle, index, parentHandle){
    // console.log(handle)
    var id = handle.id,
        childNodes = handle.childNodes,
        expression = Expression.get(handle.handleInfo.expression),
        comment_layout_id = parentHandle.childNodes[index + 1].id; //eachHandle --> eachComment --> endeachHandle --> endeachComment
	var handleArgs = expression.foo();
	var customTagName = handleArgs[0];
	var customTagNodeId = handleArgs[1];
	var uuid = $.uid();
    var trigger = {
        // cache_tpl_name:$UNDEFINED,
        key: ".",
        event: function(NodeList_of_ViewModel, proxyModel, /*eventTrigger,*/ isAttr, viewModel_ID){
        	var customTagVm = AllCustomTagVM[customTagNodeId];
        	if (!customTagVm) {
	        	var customTagCode = V.customTags[customTagName];
	        	var customTagNodeInfo = V._customTagNode[customTagNodeId];
	        	customTagCode = customTagCode.replace(/\$\{([\w\W]+?)\}/g,function(matchStr,attributeName){
	        		return customTagNodeInfo[attributeName];
	        	});
	        	//锁定标签，避免死循环解析
	        	// console.log("lock ",customTagNodeInfo.tagName);
	        	V._isCustonTagNodeLock[customTagNodeInfo.tagName] = true;
	        	var module = jSouper.parseStr(customTagCode,"custom_tag-"+id+"-"+uuid);
	        	//解锁
	        	V._isCustonTagNodeLock[customTagNodeInfo.tagName] = false;
	        	module($UNDEFINED,{
	                onInit: function(vm) {
	                    //加锁，放置callback前的finallyRun引发的
	                    customTagVm = AllCustomTagVM[customTagNodeId] = vm;
	                },
	                callback: function(vm) {
	                    proxyModel.shelter(vm, "");
	                }
	        	});
        	}
	        //显示layoutViewModel
	        if (customTagVm && !customTagVm._canRemoveAble) { //canInsertAble
	            customTagVm.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
	        }
        }
    }
    return trigger;
});