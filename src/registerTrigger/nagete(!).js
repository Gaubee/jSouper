V.rt("!", V.rt("nega", function(handle, index, parentHandle) { //Negate
	var nageteHandlesId = handle.childNodes[0].id,
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewModel, model) {
			NodeList_of_ViewModel[this.handleId]._data = !NodeList_of_ViewModel[nageteHandlesId]._data; //first value
		}
	}
	return trigger;
}));