var newTemplateMatchReg = /\{\{([\w\W]+?)\}\}/g,
    templateHandles = {};
$.fI(V.handles, function(handleFun, handleName) {
    var result = $TRUE
    if (handleName.charAt(0) === "/") {
        result = $FALSE //no arguments
    }
    templateHandles[handleName] = result
});

var parse = function(str) {

    var result = str.replace(newTemplateMatchReg, function(matchStr, innerStr, index) {
        innerStr = $.trim(innerStr);
        //获取前缀标识
        var fun_name = $.stf(innerStr, " ");
        var result;
        //如果是，则进行标志
        if (templateHandles.hasOwnProperty(fun_name)) {
            if (templateHandles[fun_name]) { //可带参数的解析式
                var expression = $.trim(innerStr.replace(fun_name, ""));
                result = "{" + fun_name + "(" + expression + ")}";
            } else { //不可带参数的解析式
                result = "{" + fun_name + "()}";
            }
        } else {
            result = "{(" + $.trim(innerStr) + ")}"; //"{(" + innerStr + ")}";
        }
        return result;
    });

    return result;
};
