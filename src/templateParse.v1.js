var newTemplateMatchReg = /\{\{([\w\W]+?)\}\}/g,
	// DoubleQuotedString = /"(?:\.|(\\\")|[^\""\n])*"/g, //双引号字符串
	// SingleQuotedString = /'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	QuotedString = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	templateHandles = {
		"#if": $TRUE,
		"#else": $FALSE, //no arguments
		"/if": $FALSE,
		// "@": $TRUE,
		"#each": $TRUE,
		"/each": $FALSE,
		"#with": $TRUE,
		"/with": $TRUE,
		"HTML": $TRUE,
		">": $TRUE,
		"layout": $TRUE
	},
	templateOperatorNum = {
		"@": 1//,
		// "!": 1,
		// "~": 1,
		// "++": 1,
		// "--": 1,
		// "+": 2,
		// "-": 2,
		// "*": 2,
		// "/": 2,
		// "&&": 2,
		// "||": 2,
		// "&": 2,
		// "|": 2,
		// "=": 2,
		// "==": 2,
		// "===": 2,
		// "!=": 2,
		// "!==": 2,
		// "%": 2,
		// "^": 2,
		// ">": 2,
		// "<": 2,
		// ">>": 2,
		// "<<": 2
	},
	parse = function(str) {
		var quotedString = [];
		var Placeholder = "_" + Math.random(),
			str = str.replace(QuotedString, function(qs) {
				quotedString.push(qs)
				return Placeholder;
			}),
			result = str.replace(newTemplateMatchReg, function(matchStr, innerStr, index) {
				innerStr = innerStr.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&") //Semantic confusion with HTML
				var fun_name = $.trim(innerStr).split(" ")[0];
				if (fun_name in templateHandles) {
					if (templateHandles[fun_name]) {
						var args = innerStr.replace(fun_name, "").split(","),
							result = "{" + fun_name + "(";
						$.ftE(args, function(arg) {
							if (arg = $.trim(arg)) {
								result += parseIte(parseArg(arg));
							}
						});
						result += ")}"
						return result;
					} else {
						return "{" + fun_name + "()}";
					}
				} else {
					return parseIte(parseArg($.trim(innerStr))); //"{(" + innerStr + ")}";
				}
			})

			result = result.replace(RegExp(Placeholder, "g"), function(p) {
				return quotedString.splice(0, 1);
			}).replace(/\{\@\(\{\(([\w.]+?)\)\}\)\}/g, function(matchStr, matchKey) {
				return "{@(" + matchKey + ")}";
			});
			return result
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
			$.p(allStack, {
				// allStack.push({
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
		return allStack;
	},
	parseStr = function(sliceArgStr) {
		var stack = [],
			pointer = 0;
		sliceArgStr.replace(/([^\w$\(\)]+)/g, function(matchOperator, operator, index, str) { //([\W]+)
			operator = $.trim(operator);
			if (operator && operator !== ".") {
				$.p(stack, {
					type: "arg",
					value: str.substring(pointer, index)
				});
				$.p(stack, {
					type: "ope",
					value: operator,
					num: templateOperatorNum[operator] || 0
				});
				pointer = index + matchOperator.length;
			}
			return matchOperator;
		});
		if (stack.length && !stack[0].value) {
			stack.splice(0, 1);
		}
		if (sliceArgStr.length - pointer) {
			$.p(stack, {
				type: "arg",
				value: sliceArgStr.substring(pointer, sliceArgStr.length)
			})
		}
		return stack;
	},
	parseIte = function(arr) {
		var result = "";
		$.ftE(arr, function(block, index) {
			if (block.type === "arg") {
				!block.parse && (block.parse = "{(" + block.value + ")}");
			}
			if (!block.value) {
				block.ignore = $TRUE;
			}
		});
		$.ftE(arr, function(block, index) {
			if (block.type === "ope") {
				var prev = arr[index - 1],
					next = arr[index + 1];
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
				} else {
					throw "Unknown type:" + block.value
				}
			}
		});
		$.ftE(arr, function(block) {
			if (!block.ignore) {
				result += block.parse;
			}
		});
		return result; //arr;
	};