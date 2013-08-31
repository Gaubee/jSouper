var Controller = function(dataManager, statementRelations) {
	var self = this;
	if (!(self instanceof Controller)) {
		return new Controller(dataManager, statementRelations);
	}
	if (statementRelations===undefined) {
		statementRelations = dataManager;
		dataManager = [];
	}
	if (!(dataManager instanceof Array)) {
		if (!(dataManager instanceof DataManager)) {
			dataManager = DataManager(dataManager);
		}
		dataManager = [dataManager];
	};

	(self.dataManager = $.slice(dataManager)).unshift(DataManager(statementRelations));

	// $.fastEach(self.dataManager,function(dm){
	// 	Controller.Soap(dm);
	// });

	var exportsDM = self.exports();
	console.log(exportsDM.id)
	$.fastEach(exportsDM._database,function(fnKey){
		var fn = statementRelations[fnKey];
		if (typeof fn ==="function") {
			Controller.relyOn.upPack(fnKey,fn,exportsDM,dataManager)();
		}
	});
};
(function Soap(){//速补——《云图Cloud Atlas》
	var proto = DataManager.prototype,
		_set = proto.set,
		_get = proto.get;
	proto.set = function(){
		var relys = Controller.relyOn.container[this.id],
			updataKey = _set.apply(this,$.slice(arguments))
		relys&&$.fastEach(updataKey,function(key){
			if (key = relys[key]) {
				$.fastEach(key,function(fn){
					fn();
				})
			}
		});
	};
	proto.get = function(key){
		key = key||"";
		var relyOn =Controller.relyOn,
			id = this.id ;
		if (relyOn.status) {
			$.push(relyOn.cache[id]||(relyOn.cache[id] = []),key);
		}
		return _get.call(this,key)
	};
})();
Controller.relyOn = {
	status:false,
	container:{},
	cache:{},
	pickUp:function(dm,fun){
		var self = this;
		$.forIn(self.cache,function(keys,id){
			var con = self.container[id]||(self.container[id]={});
			$.fastEach(keys,function(key){
				var fns = con[key]
				if (fns&&$.indexOf(fns,fun)===-1) {
					$.push(fns,fun)
				}else{
					$.push((con[key]=[]),fun)
				}
			});
		});
		self.cache = {};
	},
	upPack:function(fnKey,fn,sdm,dms){
		var relyOn = this;
		function upPackFn(){
			relyOn.status = true;
			var result = fn.apply(sdm,dms);
			relyOn.status = false;
			relyOn.pickUp(sdm,upPackFn);
			sdm.set(fnKey,result);
			// return result;
		}
		return upPackFn;
	}
}

Controller.prototype.find = function(prefix) {
	var self = this,
		dataManager = self.dataManager,
		result = [];
	$.fastEach(dataManager, function(dm) {
		var data = dm.get(prefix);
		if (data) {
			if (!(data instanceof Array)) {
				data = [data];
			}
			result.push.apply(result, data);
		}
	});
	return result;
};
Controller.prototype.findOne = function(prefix) {
	var self = this,
		dataManager = self.dataManager,
		result;
	$.forEach(dataManager, function(dm) {
		if (result = dm.get(prefix)) {
			return false;
		}
	});
	return result;
};
Controller.prototype.exports = function() {
	var self = this,
		dataManager = self.dataManager,
		i=dataManager.length-1,
		result = dataManager[i];

	for(;i>0;i-=1){
		var cache = $.create(dataManager[i-1])
		cache._parentDataManager = result;
		result = cache;
	}
	self.exports = function(){
		return result;
	}
	return result;
};
Controller.prototype.set = function(){
	var self = this,
		dm = this.exports();
	return dm.set.apply(dm,$.slice(arguments));
}
Controller.prototype.get = function(){
	var self = this,
		dm = this.exports();
	return dm.get.apply(dm,$.slice(arguments));
}