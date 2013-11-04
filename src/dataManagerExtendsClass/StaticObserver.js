var _cacheGet = Observer.get;
function StaticObserver(obs) { //静态计算类（只收集一次的依赖，适合于简单的计算属性，没有逻辑嵌套）
	var observerInstance = new Observer(obs);
	observerInstance.get = StaticObserver.staticGet;
}
StaticObserver.staticGet = function() { //转化成静态计算类
	var self = this,
		result = _cacheGet.apply(self, arguments/*$.s(arguments)*/);
	self.get = self._get; //剥离依赖收集器
	return result;
};