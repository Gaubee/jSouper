;
(function() {
	var _get = DM_proto.get,
		_set = DM_proto.set,
		prefix = DM_config.prefix,
		_rebuildTree = DM_proto.rebuildTree,
		_subset = DM_proto.subset,
		set = DM_proto.set = function(key) {
			var self = this,
				args = arguments /*$.s(arguments)*/ ,
				result;
			if (args.length > 1) {
				if (key.indexOf(prefix.Parent) === 0) { //$parent
					if (self = self._parentDataManager) {
						if (key === prefix.Parent) {
							// args.splice(0, 1);
							$.sp.call(args, 0, 1)
						} else if (key.charAt(prefix.Parent.length) === ".") {
							args[0] = key.replace(prefix.Parent + ".", "");
						}
						result = set.apply(self, args);
					} else {
						DataManager.session.filterKey = $UNDEFINED;
						DataManager.session.topSetter = $UNDEFINED;
						key = ""
					}
				} else if (key.indexOf(prefix.This) === 0) { //$this
					if (key === prefix.This) {
						// args.splice(0, 1);
						$.sp.call(args, 0, 1)
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
						// args.splice(0, 1);
						$.sp.call(args, 0, 1)
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
			//TODO:简化返回结果，节省内存
			result || (result = {
				key: key/*,
				// allUpdateKey: allUpdateKey,
				updateKey: [key],
				chidlUpdateKey: []*/
			});

			//更新调用堆栈层数，如果是0,则意味着冒泡到顶层的调用即将结束，是最后一层set
			result.stacks = DataManager.session.setStacks.length
			return result
		},
		get = DM_proto.get = function(key) {
			var self = this,
				args = arguments /*$.s(arguments)*/ ,
				result;
			if (args.length > 0) {
				if (key.indexOf(prefix.Parent) === 0) { //$parent
					if (self = self._parentDataManager) {
						if (key === prefix.Parent) {
							// args.splice(0, 1);
							$.sp.call(args, 0, 1)
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
						// args.splice(0, 1);
						$.sp.call(args, 0, 1)
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
						// args.splice(0, 1);
						$.sp.call(args, 0, 1)
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
		};

	function _getAllSmartDataManagers(self, result) {
		result ? $.p(result, self) : (result = []);
		var dmSmartDataManagers = self._smartDMs_id;
		dmSmartDataManagers && $.ftE(dmSmartDataManagers, function(dm) {
			dm = DataManager.get(dm);
			if ($.iO(result, dm) === -1) {
				_getAllSmartDataManagers(dm, result);
			}
		});
		// console.table(result)
		return result;
	};
	DM_proto.rebuildTree = function() {
		var self = this,
			smartSource;
		$.ftE(_getAllSmartDataManagers(self), function(dm) {
			if (smartSource = dm._smartSource) {
				var smart_prefix = smartSource.prefix,
					smart_dataManager = DataManager.get(smartSource.dm_id);
				// console.log(smart_prefix)
				if (smart_prefix.indexOf(prefix.Parent) === 0 || smart_prefix.indexOf(prefix.Top) === 0) {
					var data = smart_dataManager.get(smart_prefix);
					var topGetter = DataManager.session.topGetter
					if (topGetter !== smartSource.topGetter && (smartSource.topGetter = topGetter)) {
						smart_dataManager.subset(dm, smart_prefix);
					}
				}
			}
		})
		return _rebuildTree.call(self);
	};
	DM_proto.subset = function(dataManager, prefixKey) {
		var self = this,
			data = self.get(prefixKey),
			result,
			topGetter = DataManager.session.topGetter,
			filterKey = DataManager.session.filterKey || "";
		if (filterKey !== prefixKey) { //is smart key

			if (prefixKey.indexOf(prefix.This) === 0) {
				if (filterKey) {
					_subset.call(self, dataManager, filterKey)
				} else { //prefixKey === "$THIS"
					dataManager.replaceAs(self);
				}
			} else {
				dataManager._smartSource = {
					topGetter: topGetter, // current coordinate
					dm_id: self.id,
					prefix: prefixKey
				};
				$.p(self._smartDMs_id || (self._smartDMs_id = []), dataManager.id);
				if (topGetter) { // smart dm maybe change coodition
					if (filterKey) {
						_subset.call(topGetter, dataManager, filterKey)
					} else {
						topGetter.collect(dataManager);
					}
				}
			}
		} else {
			result = _subset.apply(self, arguments /*$.s(arguments)*/ );
		}
		return result;
	}
}());