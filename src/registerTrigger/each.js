DM_config.prefix.Index = "$INDEX";
var _extend_DM_get_Index = (function() {
	var $Index_set = function(key) {
		var self = DataManager.session.topSetter = this
		var indexKey = DM_config.prefix.Index;
		if (key === indexKey) {
			DataManager.session.filterKey = "";
			throw Error(indexKey + " is read only.")
		} else {
			return DM_proto.set.apply(self, arguments)
		}
	}
	var $Index_get = function(key) {
		var self = DataManager.session.topGetter = this;
		var indexKey = DM_config.prefix.Index;
		if (key === indexKey) {
			DataManager.session.filterKey = "";
			return self._index;
		} else {
			return DM_proto.get.apply(self, arguments)
		}
	};

	function _extend_DM_get_Index(dataManager) {
		// if(dataManager._isEach)
		dataManager.set = $Index_set
		dataManager.get = $Index_get
	};
	return _extend_DM_get_Index;
}());
V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandle = handle.childNodes[0],
		arrDataHandle_id = arrDataHandle.id,
		arrDataHandle_Key = arrDataHandle.childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;
	trigger = {
		// smartTrigger:$NULL,
		// key:$NULL,
		event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[arrDataHandle_id]._data,
				// arrTriggerKey = arrDataHandle_Key + ".length",
				viewInstance = V._instances[viewInstance_ID],
				allArrViewInstances = viewInstance._AVI,
				arrViewInstances = allArrViewInstances[id] || (allArrViewInstances[id] = []),
				showed_vi_len = arrViewInstances.len,
				new_data_len = data ? data.length : 0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;
			if (showed_vi_len !== new_data_len) {
				arrViewInstances.len = new_data_len; //change immediately,to avoid the `subset` trigger the `rebuildTree`,and than trigger each-trigger again.

				var _rebuildTree = dataManager.rebuildTree,
					_touchOff = DM_proto.touchOff;
				//沉默相关多余操作的API，提升效率
				dataManager.rebuildTree = $.noop //doesn't need rebuild every subset
				DM_proto.touchOff = $.noop; //subset的touchOff会遍历整个子链，会造成爆炸性增长。

				if (showed_vi_len > new_data_len) {
					$.fE(arrViewInstances, function(eachItemHandle) {
						var isEach = eachItemHandle._isEach
						//移除each标志避免排队
						eachItemHandle._isEach = $FALSE;
						eachItemHandle.remove();
						//恢复原有each标志
						eachItemHandle._isEach = isEach;
					}, new_data_len);
				} else {
					//undefined null false "" 0 ...
					data && $.ftE($.s(data), function(eachItemData, index) {
						//TODO:if too mush vi will be create, maybe asyn
						var viewInstance = arrViewInstances[index];
						if (!viewInstance) {
							//临时回滚沉默的功能，保证这个对象的内部渲染正确
							DM_proto.touchOff = _touchOff;
							viewInstance = arrViewInstances[index] = eachModuleConstructor(eachItemData);
							DM_proto.touchOff = $.noop;

							viewInstance._arrayVI = arrViewInstances;
							var viDM = viewInstance.dataManager
							viDM._isEach = viewInstance._isEach = {
								//_index在push到Array_DM时才进行真正定义，由于remove会重新更正_index，所以这个参数完全交给Array_DM管理
								// _index: index,
								eachId: id,
								eachVIs: arrViewInstances
							}
							dataManager.subset(viDM, arrDataHandle_Key + "." + index); //+"."+index //reset arrViewInstance's dataManager
							_extend_DM_get_Index(viDM)
						}
						viewInstance.insert(comment_endeach_node)
					}, showed_vi_len /*||0*/ );
				}
				//回滚沉默的功能
				//强制刷新，保证each中子对象的smartkey的渲染正确
				(DM_proto.touchOff = _touchOff).call(dataManager);
				(dataManager.rebuildTree = _rebuildTree).call(dataManager);
			}
		}
	}
	return trigger
});