;(function(V){
var matchReg = /\{\{([\w\W]+?)\}\}/g,
	// DoubleQuotedString = /"(?:\.|(\\\")|[^\""\n])*"/g, //双引号字符串
	// SingleQuotedString = /'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	QuotedString = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	handles = {
		"#if": $TRUE,
		"#else": $FALSE, //no arguments
		"/if": $FALSE,
		"@": $TRUE,
		"#each": $TRUE,
		"/each": $FALSE,
		"#with": $TRUE,
		"/with": $TRUE,
		"HTML": $TRUE,
		">": $TRUE
	},
	operatorNum = {
		"!": 1,
		"~": 1,
		"++": 1,
		"--": 1,
		"+": 2,
		"-": 2,
		"*": 2,
		"/": 2,
		"&&": 2,
		"||": 2,
		"==": 2,
		"%": 2
	},
	parse = function(str) {
		var quotedString = [];
		var Placeholder = "_"+Math.random();
		str = str.replace(QuotedString,function(qs){
			quotedString.push(qs)
			return Placeholder;
		});
		result = str.replace(matchReg, function(matchStr, innerStr, index) {
			// console.log(arguments)
			var fun_name = innerStr.trim().split(" ")[0];
			if (fun_name in handles) {
				if (handles[fun_name]) {
					return "{" + fun_name + "(" + parseIte(parseArg(innerStr.replace(fun_name, "").trim())) + ")}";
				} else {
					return "{" + fun_name + "()}";
				}
			} else {
				return parseIte(parseArg(innerStr.trim())); //"{(" + innerStr + ")}";
			}
		})
		return result.replace(RegExp(Placeholder,"g"),function(p){
			return quotedString.splice(0,1)
		});
	},
	parseArg = function(argStr) {
		var allStack = [],
			inner = $TRUE;
		// console.log("argStr:", argStr);
		argStr.replace(/\(([\W\w]+?)\)/, function(matchSliceArgStr, sliceArgStr, index) {
			inner = $FALSE;
			var stack = parseStr(argStr.substring(0, index));
			allStack.push.apply(allStack, stack);
			// console.log();
			allStack.push({
				type: "arg",
				value: sliceArgStr,
				parse: parseIte(parseArg(sliceArgStr))
			})
			stack = parseStr(argStr.substring(index + matchSliceArgStr.length));
			allStack.push.apply(allStack, stack);
		});
		if (inner) {
			allStack.push.apply(allStack, parseStr(argStr));
		}
		// console.log(pointer, argStr.length)
		// stack = argStr.split(/([\W]+?)/);
		// console.log(allStack);
		// parseIte(stack);
		// return parseIte(stack); //argStr;
		return allStack;
	},
	parseStr = function(sliceArgStr) {
		var stack = [],
			pointer = 0;
		sliceArgStr.replace(/([^\w$\(\)]+)/g, function(matchOperator, operator, index, str) { //([\W]+)
			// console.log(arguments)
			operator = operator.trim();
			if (operator && operator !== ".") {
				stack.push({
					type: "arg",
					value: str.substring(pointer, index)
				});
				stack.push({
					type: "ope",
					value: operator,
					num: operatorNum[operator] || 0,
				});
				pointer = index + matchOperator.length;
			}
			return matchOperator;
		});
		if (stack.length && !stack[0].value) {
			stack.splice(0, 1);
		}
		if (sliceArgStr.length - pointer) {
			stack.push({
				type: "arg",
				value: sliceArgStr.substring(pointer, sliceArgStr.length)
			})
		}
		return stack;
	},
	parseIte = function(arr) {
		var result = "";
		arr.forEach(function(block, index) {
			if (block.type === "arg") {
				!block.parse && (block.parse = "{(" + block.value + ")}");
				// console.log(block.parse, index)
			}
			if (!block.value) {
				block.ignore = $TRUE;
			}
		});
		arr.forEach(function(block, index) {
			if (block.type === "ope") {
				var prev = arr[index - 1],
					next = arr[index + 1];
				// console.log(prev, index, next)
				if (block.num === 1) {
					if (prev && prev.type === "arg") { //a++
						block.parse = "{$" + block.value + "(" + prev.parse + ")}";
						prev.ignore = $TRUE;
					} else { //++a
						next.parse = "{" + block.value + "(" + next.parse + ")}"
						block.ignore = $TRUE;
					}
				} else if (block.num === 2) {
					next.parse = "{" + block.value + "(" + prev.parse + next.parse + ")}"
					prev.ignore = $TRUE;
					block.ignore = $TRUE;
				} else { //()
					// console.log(block)
					throw "Unknown type:" + block.value
				}
			}
		});
		arr.forEach(function(block) {
			if (!block.ignore) {
				result += block.parse;
			}
		});
		return result; //arr;
	};
	var _parse = V.parse;
	V.parse = function(str){
		return _parse.call(V,parse(str))
	};
}(ViewParser));

// var testStr = "{{  a.b  }} "; //==>{(a.b)}
// var testStr = "{{  --a--  }} "; //==>{$--({--({(a)})})} 
// var testStr = "{{  #if bool}} {{name}} {{/if}}"; //==>{#if({(bool)})} {(name)} {/if()}
// var testStr = "{{  !a.x + (++b)  }}"; //==>{+({!({(a.x)})}{++({(b)})})}
// var testStr = "{{  #if !a.x + (++b) +x.v  }} {{name}} {{/if}}"; //==>{#if({+({+({!({(a.x)})}{++({(b)})})}{(x.v)})})} {(name)} {/if()}
// var testStr = "{{ a || b}}"; //==>{||({(a)}{(b)})}
// var testStr = "{{ a && b}}"; //==>{&&({(a)}{(b)})}
// var testStr = "{{@ hehe }}"; //==>{@({(hehe)})}
// var testStr = "{{HTML gaubee }}"; //==>{@({(hehe)})}
// var testStr = "<p>{{HTML gaubee }}</p>"; //==>{@({(hehe)})}
// var testStr = "<p>{{#if a=='asdsd'}}{{'hehe'}}{{/if}}</p>"; //==>{@({(hehe)})}
// console.log(parse(testStr));