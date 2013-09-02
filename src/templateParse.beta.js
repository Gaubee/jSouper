var matchReg = /\{\{([\w\W]+?)\}\}/g,
	handles = {
		"#if": true,
		"/if": false
	},
	handleType = {
		arg: {},
		pre: {},
		emp: {}
	},
	parse = function(str) {
		result = str.replace(matchReg, function(matchStr, innerStr, index) {
			// console.log(arguments)
			var fun_name = innerStr.trim().split(" ")[0];
			if (fun_name in handles) {
				if (handles[fun_name]) {
					return "{" + fun_name + "(" + parseArg(innerStr.replace(fun_name, "").trim()) + ")}";
				} else {
					return "{" + fun_name + "()}";
				}
			} else {
				return "{(" + innerStr + ")}"; //"{("+parseArg(innerStr)+")}";
			}
		})
		return result;
	},
	parseArg = function(argStr) {
		var stack = [];
		console.log(argStr);
		var pointer = 0;
		argStr.replace(/([\W]+?)/g, function(matchOperator, operator, index, str) {
			// console.log(arguments)
			if (operator !== ".") {
				stack.push({
					type: "arg",
					value: str.substring(pointer, index)
				}, {
					type: "ope",
					value: operator
				});
				pointer = index + matchOperator.length;
			}
			return matchOperator;
		});
		if (argStr.length - pointer) {
			stack.push({
				type: "arg",
				value: argStr.substring(pointer, argStr.length)
			})
		}
		console.log(pointer, argStr.length)
		// stack = argStr.split(/([\W]+?)/);
		parseIte(stack);
		console.log(stack);
		return argStr;
	},
	parseIte = function(arr) {
		var status = handleType.emp;
		arr.forEach(function(block, index) {
			switch (block.type) {
				case "arg":
					if (status === handleType.pre) {

					} else {
						block.parse = "{(" + block.value + ")}";
					}
					break;
				case "ope":
					break;
			}
		});
		return arr;
	};
registerHandle = function(handleName) {
	handles[handleName] = true;
};


var testStr = "{{  #if bool}} {{name}} {{/if}}"; //==>{#if( {(bool)} )} {(name)} {/if()}
var testStr = "{{  #if a.x+b+c  }} {{name}} {{/if}}"; //==>{#if( {+({(a)}{(b)})} )} {(name)} {/if()}
console.log(parse(testStr));