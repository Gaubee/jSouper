function _handle_on_event_string(isAttr, data) {
	if (isAttr) {
		//IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
		if (isAttr.key.indexOf("on") === 0 && !_isIE) { //W#C标准，onXXX属性事件使用string，消除差异
			data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
		}
	}
	return data;
}