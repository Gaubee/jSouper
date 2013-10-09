;
(function() {
	var _get = DM_proto.get,
		_set = DM_proto.set,
		set = DM_proto.set = function(key) {
			var self = this,
				args = $.s(arguments),
				prefix_parent = DM_config.prefix.parent,
				prefix_this = DM_config.prefix.this,
				prefix_top = DM_config.prefix.top,
				result;
			if (args.length > 1) {
				if (key.indexOf(prefix_parent) === 0) { //$parent
					if (self = self._parentDataManager) {
						if (key === prefix_parent) {
							args.splice(0, 1);
						} else if (key.charAt(prefix_parent.length) === ".") {
							args[0] = key.replace(prefix_parent + ".", "");
						}
						result = set.apply(self, args);
					}
				} else if (key.indexOf(prefix_this) === 0) { //$this
					if (key === prefix_this) {
						args.splice(0, 1);
					} else if (key.charAt(prefix_this.length) === ".") {
						args[0] = key.replace(prefix_this + ".", "");
					}
					result = set.apply(self, args);
				} else if (key.indexOf(prefix_top) === 0) {
					var next;
					while (next = self._parentDataManager) {
						self = next;
					}
					if (key === prefix_top) {
						args.splice(0, 1);
					} else if (key.charAt(prefix_top.length) === ".") {
						args[0] = key.replace(prefix_top + ".", "");
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
				prefix_parent = DM_config.prefix.parent,
				prefix_this = DM_config.prefix.this,
				prefix_top = DM_config.prefix.top,
				result;
			if (args.length > 0) {
				if (key.indexOf(prefix_parent) === 0) { //$parent
					if (self = self._parentDataManager) {
						if (key === prefix_parent) {
							args.splice(0, 1);
						} else if (key.charAt(prefix_parent.length) === ".") {
							args[0] = key.replace(prefix_parent + ".", "");
						}
						result = get.apply(self, args);
					}
				} else if (key.indexOf(prefix_this) === 0) { //$this
					if (key === prefix_this) {
						args.splice(0, 1);
					} else if (key.charAt(prefix_this.length) === ".") {
						args[0] = key.replace(prefix_this + ".", "");
					}
					result = get.apply(self, args);
				} else if (key.indexOf(prefix_top) === 0) {
					var next;
					while (next = self._parentDataManager) {
						self = next;
					}
					if (key === prefix_top) {
						args.splice(0, 1);
					} else if (key.charAt(prefix_top.length) === ".") {
						args[0] = key.replace(prefix_top + ".", "");
					}
					result = get.apply(self, args);
				} else { //no prefix key
					result = _get.apply(self, args);
				}
			} else { //one argument
				result = _get.apply(self, args);
			}
			return result;
		}
}());