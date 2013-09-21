var DM_proto = DataManager.prototype,
	DM_proto_set = DM_proto.set;

function Subset(dataManager) {
	var self = this;
	if (!(this instanceof Subset)) {
		return new Subset(dataManager);
	}
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
	parentDM._touchOffSubset(self._prefix);
	subsetDM.splice(index, 0, self);
	return result;
};