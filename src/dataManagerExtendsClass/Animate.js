var _parse_animate_keys, // = [],
	_parse_static_keys, // = [],
	_parse_map, //= {},
	_parse_jsObj_to_style = function(jsObj) {

	}, _parse_int_value_to_function = function() {

	}, _parse_iteration = function(obj, prefix, isStart) {
		prefix = prefix ? prefix + "-" : "";
		$.fI(obj, function(value, key) {
			var _mixKey = prefix + key,
				_num_value;
			if (typeof value === "object") {
				_parse_iteration(value, _mixKey,isStart);
			} else {
				value = String(value);
				if ((_num_value = parseFloat(value)).toString() !== "NaN") {
					//animate Keys
					if (!(_mixKey in _parse_map)) {
						$.p(_parse_animate_keys, _mixKey)
						var _parse_obj = _parse_map[_mixKey] = {
							unit: value.replace(_num_value, "")
						};
					} else {
						_parse_obj = _parse_map[_mixKey];
						if (_parse_obj.unit) {
							_parse_obj.unit = value.replace(_num_value, "")
						}
					}
					if (isStart) {
						_parse_obj.startValue = _num_value;
						_parse_obj.endValue === $UNDEFINED&&(_parse_obj.endValue = 0);
					} else {
						_parse_obj.startValue=== $UNDEFINED&&(_parse_obj.startValue = 0);
						_parse_obj.endValue = _num_value;
					}
				} else {
					//static style String
					_parse_static_keys += _mixKey + ":" + value + ";";
				}
			}
		})
	};


function Animate(startValue, endValue, time) {
	var self = this;
	if (!(self instanceof Animate)) {
		return new Animate(startValue, endValue, time)
	}
	DataManager.Object(self);
	self.time = (time || (time = 200)) > 0 ? time : -time;
	self.startValue = startValue;
	self.endValue = endValue;
	self.animate = {
		status: "unstart",
		ti: $UNDEFINED,
		frames: [],
		animateKeys: [],
		staticStr: "",
		valueMap: {},
		pir: 0//Pointer
	}
	self.build();
}
Animate.config = {
	fps: 60 //requestAnimationFrame--setTimeout
}
Animate.prototype = {
	set: function(animate, dataManager, touchOffKey) {
		var self = this;
		if (animate === "stop") {
			self.stop();
		}
		if (animate === "run") {
			self.run(dataManager, touchOffKey);
		} else {
			if (animate instanceof Animate) {
				self.value = animate.value;
				self.time = animate.value;
				self.json = animate.json;
			} else {
				self.value = animate // = _mix(self.value, animate);
				self.json = typeof animate === "object" ? JSON.stringify(animate) : animate;
			}
			self.build();
			console.log(arguments)
			self.run(dataManager, touchOffKey);
		}
	},
	get: function( /*dataManager*/ ) {
		var self = this,
			animate = self.animate
			frames = animate.frames,
			pir = animate.pir;
		if (!frames[pir]) {
			frames[pir] = self._frames(pir);
		}
		return frames[pir] || "";
	},
	stop: function() {

		clearTimeout(this.animate.ti);
	},
	run: function(dataManager, touchOffKey) {
		var self = this,
			animate = self.animate,
			frames = animate.frames;
		animate.status = "run";
		var pir = animate.pir;
		if (!frames[pir]) {
			frames[pir] = self._frames(pir);
		}
		dataManager&&dataManager.touchOff(touchOffKey)
		console.log(frames[pir],touchOffKey)
		var next_pir = pir + 1;
		var allPir = self.time / Animate.config.fps
		if (next_pir > allPir) {
			if (next_pir < allPir + 1) {
				next_pir = allPir
			} else {
				animate.status = "end";
				return;
			}
		}
		animate.pir = next_pir;
		animate.ti = setTimeout(function() {
			self.run(dataManager, touchOffKey)
		}, (1000 / Animate.config.fps)*(next_pir-pir))
	},
	_frames: function(pir) {
		var self = this,
			framesNum = self.time / Animate.config.fps,
			animate = self.animate,
			animateKeys = animate.animateKeys,
			valueMap = animate.valueMap,
			result = animate.staticStr;
		pir === $UNDEFINED && (pir = animate.pir);
		$.ftE(animateKeys, function(key) {
			var valueConfig = valueMap[key],
				startValue = valueConfig.startValue,
				endValue = valueConfig.endValue,
				valueResult = (endValue - startValue) * pir / framesNum + startValue + valueConfig.unit;
			result += ";" + key + ":" + valueResult;
		})
		return result;
	},
	build: function() {
		var self = this,
			framesNum = self.time / Animate.config.fps,
			animate = self.animate,
			_frames = 0,
			value,
			isObj;
		animate.frames.length = 0;
		(_parse_animate_keys = animate.animateKeys).length = 0;
		_parse_static_keys = "";
		_parse_map = animate.valueMap; // = {};
		if (typeof(value = self.endValue) === "object") {
			_parse_iteration(value)
			isObj = $TRUE
		}
		if (typeof(value = self.startValue) === "object") {
			_parse_iteration(value, "", $TRUE);
			isObj = $TRUE
		}
		animate.staticStr = _parse_static_keys;
	}
}