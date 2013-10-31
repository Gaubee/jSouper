;
(function() {
	var _get = DM_proto.get,
		_set = DM_proto.set,
		prefix = DM_config.prefix,
		set = DM_proto.set = function(key) {
			var self = this,
				args = $.s(arguments),
				result;
			if (args.length > 1) {
				if (key.indexOf(prefix.Parent) === 0) { //$parent
					if (self = self._parentDataManager) {
						if (key === prefix.Parent) {
							args.splice(0, 1);
						} else if (key.charAt(prefix.Parent.length) === ".") {
							args[0] = key.replace(prefix.Parent + ".", "");
						}
						result = set.apply(self, args);
					} else {
						DataManager.session.filterKey = $UNDEFINED;
						DataManager.session.topGetter = $UNDEFINED;
						key = ""
					}
				} else if (key.indexOf(prefix.This) === 0) { //$this
					if (key === prefix.This) {
						args.splice(0, 1);
					} else if (key.charAt(prefix.This.length) === ".") {
						args[0] = key.replace(prefix.This + ".", "");
					}
					result = set.apply(self, args);
				} else if (key.indexOf(prefix.Top) === 0) {
					var next;
					while (next = self._parentDataManager) {
						self = next;
					}
					if (key === prefix.Top) {
						args.splice(0, 1);
					} else if (key.charAt(prefix.Top.length) === ".") {
						args[0] = key.replace(prefix.Top + ".", "");
					}
					result = set.apply(self, args);
				} else { //no prefix key
					result = _set.apply(self, args);
				}
			} else { //one argument
				result = _set.apply(self, args);
			}
			return result || {
				key: key,
				// allUpdateKey: allUpdateKey,
				updateKey: [key],
				chidlUpdateKey: []
			};
		},
		get = DM_proto.get = function(key) {
			var self = this,
				args = $.s(arguments),
				result;
			if (args.length > 0) {
				if (key.indexOf(prefix.Parent) === 0) { //$parent
					if (self = self._parentDataManager) {
						if (key === prefix.Parent) {
							args.splice(0, 1);
						} else if (key.charAt(prefix.Parent.length) === ".") {
							args[0] = key.replace(prefix.Parent + ".", "");
						}
						result = get.apply(self, args);
					} else {
						DataManager.session.filterKey = $UNDEFINED;
						DataManager.session.topGetter = $UNDEFINED;
						key = ""
					}
				} else if (key.indexOf(prefix.This) === 0) { //$this
					if (key === prefix.This) {
						args.splice(0, 1);
					} else if (key.charAt(prefix.This.length) === ".") {
						args[0] = key.replace(prefix.This + ".", "");
					}
					result = get.apply(self, args);
				} else if (key.indexOf(prefix.Top) === 0) {
					var next;
					while (next = self._parentDataManager) {
						self = next;
					}
					if (key === prefix.Top) {
						args.splice(0, 1);
					} else if (key.charAt(prefix.Top.length) === ".") {
						args[0] = key.replace(prefix.Top + ".", "");
					}
					result = get.apply(self, args);
				} else { //no prefix key
					result = _get.apply(self, args);
				}
			} else { //one argument
				result = _get.apply(self, args);
			}
			return result;
		},
		_rebuildTree = DM_proto.rebuildTree;
	DM_proto.rebuildTree = function() {
		var self = this,
			smartSource;
		$.ftE($.rm(_getAllSiblingDataManagers(self), self), function(dm) {
			if (smartSource = dm._smartSource) {
				var prefixKey = smartSource.prefix;
				// console.log(prefixKey)
				if (prefixKey.indexOf(prefix.Parent)===0||prefixKey.indexOf(prefix.Top)===0) {
					smartSource.dataManager.get(smartSource.prefix);
					var topGetter = DataManager.session.topGetter
					if (topGetter && topGetter !== dm._parentDataManager) {
						// console.log("rebuild", dm.id,
						// 	"\n\tself:", self.id,
						// 	"\n\ttopGetter:", topGetter.id,
						// 	"\n\tparent:", dm._parentDataManager && dm._parentDataManager.id)
						$.ftE(dm._siblingDataManagers,function(sublingDM){
							$.rm(sublingDM._siblingDataManagers,dm)
						});
						dm._siblingDataManagers.length=0;
						smartSource.dataManager.subset(dm, smartSource.prefix);
					}
				}
			}
		})
		return _rebuildTree.call(self);
	}
}());