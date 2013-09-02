var matchReg = /\{\{([\w\W]+?)\}\}/g,
	handles = {
		"#if": true,
		"/if": false
	},
	handleType = {
		arg: {},
		pre: {}
	},
	parse = function(str) {
		result = str.replace(matchReg, function(matchStr, innerStr, index) {
			// console.log(arguments)
			var fun_name = innerStr.trim().split(" ")[0];
			if (fun_name in handles) {
				if (handles[fun_name]) {
					return "{"+fun_name+"("+parseArg(innerStr.replace(fun_name,"").trim())+")}";
				}else{
					return "{"+fun_name+"()}";
				}
			} else {
				return "{("+innerStr+")}";//"{("+parseArg(innerStr)+")}";
			}
		})
		return result;
	},
	parseArg = function(argStr) {
		var stack = [];
		console.log(argStr);
		var pointer = 0;
		argStr.replace(/([\W]+?)/g,function(matchOperator,operator,index,str){
			// console.log(arguments)
			stack.push(str.substring(pointer,index));
			pointer+=index+matchOperator.length;
		});
		console.log(stack)
		return argStr;
	},
	registerHandle = function(handleName) {
		handles[handleName] = true;
	};


var testStr = "{{  #if bool}} {{name}} {{/if}}"; //==>{#if( {(bool)} )} {(name)} {/if()}
var testStr = "{{  #if a+b}} {{name}} {{/if}}"; //==>{#if( {+({(a)}{(b)})} )} {(name)} {/if()}
console.log(parse(testStr));