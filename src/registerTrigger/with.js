V.rt("#with", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		dataHandle_id = handle.childNodes[0].id,
		comment_with_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
			var key = NodeList_of_ViewModel[dataHandle_id]._data,
				AllLayoutViewModel = V._instances[viewModel_ID]._WVI,
				withViewModel = AllLayoutViewModel[id], // || (AllLayoutViewModel[id] = V.withModules[id](data).insert(NodeList_of_ViewModel[comment_with_id].currentNode)),
				inserNew;
			if (!withViewModel) {
				withViewModel = AllLayoutViewModel[id] = V.withModules[id]();
				model.subset(withViewModel,key);
				withViewModel.insert(NodeList_of_ViewModel[comment_with_id].currentNode);
			}
		}
	}
	return trigger;
});