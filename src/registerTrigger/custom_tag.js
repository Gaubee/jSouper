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
	        	var customTagNode = V._customTagNode[customTagNodeId];
	        	customTagCode = customTagCode.replace(/\$\{([\w\W]+?)\}/g,function(matchStr,attributeName){
	        		return customTagNode[attributeName];
	        	});
	        	jSouper.parseStr(customTagCode,"custom_tag-"+id+"-"+uuid)($UNDEFINED,{
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