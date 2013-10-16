var _unary_operator_list = "! ~ -".split(" ");// ++ --
$.ftE(_unary_operator_list, function(operator) {
	templateOperatorNum[operator] = 1;
	V.rh(operator, _operator_handle)
});