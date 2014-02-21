/*
 * 最简单的拓展类，实现自定义赋值取值操作
 */
;
(function() {
    function Define(getFun, setFun) {
        var self = {};
        self[_DM_extends_object_constructor] = $TRUE;
        self.get = getFun || $.noop;
        self.set = setFun || $.noop;
        return self
    }
    //Model.extend
    _modelExtend("Define", Define)
}())
