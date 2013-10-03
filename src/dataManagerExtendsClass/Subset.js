var DM_proto_set = DM_proto.set;

function Subset(dataManager) {
	var self = this;
	if (!(this instanceof Subset)) {
		return new Subset(dataManager);
	}
	DataManager.Object(self);
	self.id = $.uid();
	self.dataManager = dataManager;
	dataManager.set = Subset.set;
};
Subset.set = function() {
	var self = this,
		result = DM_proto_set.call(self, $.s(arguments)),
		parentDM = self._parentDataManager,
		subsetDM = parentDM._subsetDataManagers,
		index = $.iO(subsetDM, self);
	subsetDM.splice(index, 1);
	parentDM._touchOffSubset(self._prefix);//find similar keys
	subsetDM.splice(index, 0, self);
	return result;
};
DM_proto.subset = function(viewInstance, prefix) {
	var self = this,
		triggerKeys = self._triggerKeys,
		subsetDataManager = viewInstance.dataManager,
		subsetConfig = Subset(subsetDataManager); //DataManager(baseData, viewInstance);

	triggerKeys.get(DataManager.filterKey(prefix)).set(prefix)

	subsetDataManager._parentDataManager = self;
	subsetDataManager.set = _DM_bubbleSet;
	if (arguments.length > 1) {
		subsetDataManager._database = _mix(subsetDataManager._database, self.get(String(prefix)));
	} else {
		subsetDataManager._database = self._database;
	}
	if (viewInstance instanceof ViewInstance) {
		viewInstance.dataManager = subsetDataManager;
		// viewInstance.reDraw();
		self._collectTriKey(viewInstance);
	}
	if (prefix) {

		subsetDataManager._prefix = prefix;
	}
	$.p(this._subsetDataManagers, subsetDataManager);
	return subsetDataManager; //subset(vi).set(basedata);},
};