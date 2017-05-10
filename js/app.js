(function () {
'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  return returnValue;
}

// Set the escape character
var char = '&';

// Initlize RegExp
var oct = new RegExp(("\\" + char + "[0-7]{1,3}"), 'g');
var ucp = new RegExp(("\\" + char + "u\\[.*?\\]"), 'g');
var uni = new RegExp(("\\" + char + "u.{0,4}"), 'g');
var hex = new RegExp(("\\" + char + "x.{0,2}"), 'g');
var esc = new RegExp(("\\" + char), 'g');
var b = new RegExp(("\\" + char + "b"), 'g');
var t$1 = new RegExp(("\\" + char + "t"), 'g');
var n = new RegExp(("\\" + char + "n"), 'g');
var v = new RegExp(("\\" + char + "v"), 'g');
var f = new RegExp(("\\" + char + "f"), 'g');
var r = new RegExp(("\\" + char + "r"), 'g');

// Escape octonary sequence
var O2C = function () {
	throw new SyntaxError('Octal escape sequences are not allowed in EFML.')
};

// Escape unicode code point sequence
var UC2C = function (val) {
	val = val.substr(3, val.length - 4);
	val = parseInt(val, 16);
	if (!val) { throw new SyntaxError('Invalid Unicode escape sequence') }
	try {
		return String.fromCodePoint(val)
	} catch (err) {
		throw new SyntaxError('Undefined Unicode code-point')
	}
};

// Escape unicode sequence
var U2C = function (val) {
	val = val.substring(2);
	val = parseInt(val, 16);
	if (!val) { throw new SyntaxError('Invalid Unicode escape sequence') }
	return String.fromCharCode(val)
};

// Escape hexadecimal sequence
var X2C = function (val) {
	val = "00" + (val.substring(2));
	val = parseInt(val, 16);
	if (!val) { throw new SyntaxError('Invalid hexadecimal escape sequence') }
	return String.fromCharCode(val)
};

var ESCAPE = function (string) {
	// Split strings
	var splited = string.split(char + char);
	var escaped = [];

	// Escape all known escape characters
	for (var i$1 = 0, list = splited; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		var escapedStr = i
			.replace(oct, O2C)
			.replace(ucp, UC2C)
			.replace(uni, U2C)
			.replace(hex, X2C)
			.replace(b, '\b')
			.replace(t$1, '\t')
			.replace(n, '\n')
			.replace(v, '\v')
			.replace(f, '\f')
			.replace(r, '\r')
			// Remove all useless escape characters
			.replace(esc, '');
		escaped.push(escapedStr);
	}
	// Return escaped string
	return escaped.join(char)
};

// export default ESCAPE
var escapeParser = ESCAPE;

var typeSymbols = '>#%@.-+'.split('');
var reserved = '$avatar $parent $key $data $element $refs $methods $mount $umount $subscribe $unsubscribe $update $destroy __DIRECTMOUNT__'.split(' ');
var mustache = /\{\{.+?\}\}/g;
var spaceIndent = /^(\t*)( *).*/;
var hashref = /#([^}]|}[^}])*$/;

var getErrorMsg = function (msg, line) {
	if ( line === void 0 ) line = -2;

	return ("Failed to parse eft template: " + msg + ". at line " + (line + 1));
};

var isEmpty = function (string) { return !string.replace(/\s/, ''); };

var getOffset = function (string, parsingInfo) {
	if (parsingInfo.offset !== null) { return }
	parsingInfo.offset = string.match(/\s*/)[0];
	if (parsingInfo.offset) { parsingInfo.offsetReg = new RegExp(("^" + (parsingInfo.offset))); }
};

var removeOffset = function (string, parsingInfo, i) {
	if (parsingInfo.offsetReg) {
		var removed = false;
		string = string.replace(parsingInfo.offsetReg, function () {
			removed = true;
			return ''
		});
		if (!removed) { throw new SyntaxError(getErrorMsg(("Expected indent to be grater than 0 and less than " + (parsingInfo.prevDepth + 1) + ", but got -1"), i)) }
	}
	return string
};

var getIndent = function (string, parsingInfo) {
	if (parsingInfo.indentReg) { return }
	var spaces = string.match(spaceIndent)[2];
	if (spaces) {
		parsingInfo.indentReg = new RegExp(spaces, 'g');
	}
};

var getDepth = function (string, parsingInfo, i) {
	var depth = 0;
	if (parsingInfo.indentReg) { string = string.replace(/^\s*/, function (str) { return str.replace(parsingInfo.indentReg, '\t'); }); }
	var content = string.replace(/^\t*/, function (str) {
		depth = str.length;
		return ''
	});
	if (/^\s/.test(content)) { throw new SyntaxError(getErrorMsg('Bad indent', i)) }
	return { depth: depth, content: content }
};

var resolveDepth = function (ast, depth) {
	var currentNode = ast;
	for (var i = 0; i < depth; i++) { currentNode = currentNode[currentNode.length - 1]; }
	return currentNode
};

var splitDefault = function (string) {
	string = string.slice(2, string.length - 2);
	var ref = string.split('=');
	var _path = ref[0];
	var _default = ref.slice(1);
	var pathArr = _path.trim().split('.');
	var defaultVal = escapeParser(_default.join('=').trim());
	if (defaultVal) { return [pathArr, defaultVal] }
	return [pathArr]
};

var splitLiterals = function (string) {
	var strs = string.split(mustache);
	if (strs.length === 1) { return escapeParser(string) }
	var tmpl = [];
	if (strs.length === 2 && !strs[0] && !strs[1]) { tmpl.push(0); }
	else { tmpl.push(strs.map(escapeParser)); }
	var mustaches = string.match(mustache);
	if (mustaches) { tmpl.push.apply(tmpl, mustaches.map(splitDefault)); }
	return tmpl
};

var pushStr = function (textArr, str) {
	if (str) { textArr.push(str); }
};

var parseText = function (string) {
	var result = splitLiterals(string);
	if (typeof result === 'string') { return [result] }
	var strs = result[0];
	var exprs = result.slice(1);
	var textArr = [];
	for (var i = 0; i < exprs.length; i++) {
		pushStr(textArr, strs[i]);
		textArr.push(exprs[i]);
	}
	pushStr(textArr, strs[strs.length - 1]);
	return textArr
};

var dotToSpace = function (val) { return val.replace(/\./g, ' '); };

var parseTag = function (string) {
	var tagInfo = {};
	var ref = string.replace(hashref, function (val) {
		tagInfo.ref = val.slice(1);
		return ''
	}).split('.');
	var tag = ref[0];
	var content = ref.slice(1);
	tagInfo.tag = tag;
	tagInfo.class = splitLiterals(content.join('.'));
	if (typeof tagInfo.class === 'string') { tagInfo.class = dotToSpace(tagInfo.class).trim(); }
	else if (tagInfo.class[0]) { tagInfo.class[0] = tagInfo.class[0].map(dotToSpace); }
	return tagInfo
};

var parseNodeProps = function (string) {
	var splited = string.split('=');
	return {
		name: splited.shift().trim(),
		value: splitLiterals(splited.join('=').trim())
	}
};

var parseEvent = function (string) {
	var splited = string.split('=');
	return {
		name: splited.shift().trim(),
		value: splited.join('=').trim()
	}
};

var setOption = function (options, option) {
	switch (option) {
		case 'stop': {
			options.s = 1;
			break
		}
		case 'stopImmediate': {
			options.i = 1;
			break
		}
		case 'prevent': {
			options.p = 1;
			break
		}
		case 'shift': {
			options.h = 1;
			break
		}
		case 'alt': {
			options.a = 1;
			break
		}
		case 'ctrl': {
			options.c = 1;
			break
		}
		case 'meta': {
			options.t = 1;
			break
		}
		case 'capture': {
			options.u = 1;
			break
		}
		default: {
			console.warn(("Abandoned unsupported event option '" + option + "'."));
		}
	}
};

var getOption = function (options, keys, option) {
	var keyCode = parseInt(option, 10);
	if (isNaN(keyCode)) { return setOption(options, option) }
	keys.push(keyCode);
};

var getEventOptions = function (name) {
	var options = {};
	var keys = [];
	var ref = name.split('.');
	var listener = ref[0];
	var ops = ref.slice(1);
	options.l = listener;
	for (var i$1 = 0, list = ops; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		getOption(options, keys, i);
	}
	if (keys.length > 0) { options.k = keys; }
	return options
};

var splitEvents = function (string) {
	var ref = string.split(':');
	var name = ref[0];
	var value = ref.slice(1);
	var content = value.join(':');
	if (content) { return [name.trim(), splitLiterals(content)] }
	return [name.trim()]
};

var parseLine = function (ref) {
	var line = ref.line;
	var ast = ref.ast;
	var parsingInfo = ref.parsingInfo;
	var i = ref.i;

	if (isEmpty(line)) { return }
	getIndent(line, parsingInfo);
	getOffset(line, parsingInfo);

	var ref$1 = getDepth(removeOffset(line, parsingInfo, i), parsingInfo, i);
	var depth = ref$1.depth;
	var content = ref$1.content;

	if (content) {
		if (depth < 0 || depth - parsingInfo.prevDepth > 1 || (depth - parsingInfo.prevDepth === 1 && ['comment', 'tag'].indexOf(parsingInfo.prevType) === -1) || (parsingInfo.prevType !== 'comment' && depth === 0 && parsingInfo.topExists)) { throw new SyntaxError(getErrorMsg(("Expected indent to be grater than 0 and less than " + (parsingInfo.prevDepth + 1) + ", but got " + depth), i)) }
		var type = content[0];
		content = content.slice(1);
		if (!parsingInfo.topExists && typeSymbols.indexOf(type) >= 0 && type !== '>') { throw new SyntaxError(getErrorMsg('No top level entry', i)) }
		if (!content && typeSymbols.indexOf(type) >= 0) { throw new SyntaxError(getErrorMsg('Empty content', i)) }
		// Jump back to upper level
		if (depth < parsingInfo.prevDepth || (depth === parsingInfo.prevDepth && parsingInfo.prevType === 'tag')) { parsingInfo.currentNode = resolveDepth(ast, depth); }
		parsingInfo.prevDepth = depth;

		switch (type) {
			case '>': {
				if (!parsingInfo.topExists) {
					parsingInfo.topExists = true;
					parsingInfo.minDepth = depth;
				}
				var info = parseTag(content);
				var newNode = [{
					t: info.tag
				}];
				if (info.class) {
					newNode[0].a = {};
					newNode[0].a.class = info.class;
				}
				if (info.ref) { newNode[0].r = info.ref; }
				parsingInfo.currentNode.push(newNode);
				parsingInfo.currentNode = newNode;
				parsingInfo.prevType = 'tag';
				break
			}
			case '#': {
				var ref$2 = parseNodeProps(content);
				var name = ref$2.name;
				var value = ref$2.value;
				if (!parsingInfo.currentNode[0].a) { parsingInfo.currentNode[0].a = {}; }
				parsingInfo.currentNode[0].a[name] = value;
				parsingInfo.prevType = 'attr';
				break
			}
			case '%': {
				var ref$3 = parseNodeProps(content);
				var name$1 = ref$3.name;
				var value$1 = ref$3.value;
				if (!parsingInfo.currentNode[0].p) { parsingInfo.currentNode[0].p = {}; }
				parsingInfo.currentNode[0].p[name$1] = value$1;
				parsingInfo.prevType = 'prop';
				break
			}
			case '@': {
				var ref$4 = parseEvent(content);
				var name$2 = ref$4.name;
				var value$2 = ref$4.value;
				if (!parsingInfo.currentNode[0].e) { parsingInfo.currentNode[0].e = []; }
				var options = getEventOptions(name$2);
				var ref$5 = splitEvents(value$2);
				var method = ref$5[0];
				var _value = ref$5[1];
				options.m = method;
				if (_value) { options.v = _value; }
				parsingInfo.currentNode[0].e.push(options);
				parsingInfo.prevType = 'event';
				break
			}
			case '.': {
				(ref$6 = parsingInfo.currentNode).push.apply(ref$6, parseText(content));
				parsingInfo.prevType = 'text';
				break
			}
			case '-': {
				if (reserved.indexOf(content) !== -1) { throw new SyntaxError(getErrorMsg(("Reserved name '" + content + "' should not be used"), i)) }
				parsingInfo.currentNode.push({
					n: content,
					t: 0
				});
				parsingInfo.prevType = 'node';
				break
			}
			case '+': {
				parsingInfo.currentNode.push({
					n: content,
					t: 1
				});
				parsingInfo.prevType = 'list';
				break
			}
			default: {
				parsingInfo.prevType = 'comment';
			}
		}
	}
	var ref$6;
};

var parseEft = function (template) {
	if (!template) { throw new TypeError(getErrorMsg('Template required, but nothing present')) }
	var tplType = typeof template;
	if (tplType !== 'string') { throw new TypeError(getErrorMsg(("Expected a string, but got a(n) " + tplType))) }
	var lines = template.split(/\r?\n/);
	var ast = [];
	var parsingInfo = {
		indentReg: null,
		prevDepth: 0,
		offset: null,
		offsetReg: null,
		prevType: 'comment',
		currentNode: ast,
		topExists: false,
	};
	for (var i = 0; i < lines.length; i++) { parseLine({line: lines[i], ast: ast, parsingInfo: parsingInfo, i: i}); }

	if (ast[0]) { return ast[0] }
	throw new SyntaxError(getErrorMsg('Nothing to be parsed', lines.length - 1))
};

var parse = function (template, parser) {
	if (!parser) { parser = parseEft; }
	return parser(template)
};

var proto = Array.prototype;

var ARR = {
	copy: function copy(arr) {
		return proto.slice.call(arr, 0)
	},
	empty: function empty(arr) {
		arr.length = 0;
		return arr
	},
	equals: function equals(left, right) {
		if (!Array.isArray(right)) { return false }
		if (left === right) { return true }
		if (left.length !== right.length) { return false }
		for (var i in left) { if (left[i] !== right[i]) { return false } }
		return true
	},
	pop: function pop(arr) {
		return proto.pop.call(arr)
	},
	push: function push(arr) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		return proto.push.apply(arr, items)
	},
	remove: function remove(arr, item) {
		var index = proto.indexOf.call(arr, item);
		if (index > -1) {
			proto.splice.call(arr, index, 1);
			return item
		}
	},
	reverse: function reverse(arr) {
		return proto.reverse.call(arr)
	},
	rightUnique: function rightUnique(arr) {
		var newArr = [];
		for (var i = 0; i < arr.length; i++) {
			for (var j = i + 1; j < arr.length; j++) { if (arr[i] === arr[j]) { j = i += 1; } }
			newArr.push(arr[i]);
		}
		return newArr
	},
	shift: function shift(arr) {
		return proto.shift.call(arr)
	},
	slice: function slice(arr, index, length) {
		return proto.slice.call(arr, index, length)
	},
	sort: function sort(arr, fn) {
		return proto.sort.call(arr, fn)
	},
	splice: function splice(arr) {
		var args = [], len = arguments.length - 1;
		while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

		return proto.splice.apply(arr, args)
	},
	unshift: function unshift(arr) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		return proto.unshift.apply(arr, items)
	}
};

if (window.Set) { ARR.unique = function (arr) { return Array.from(new Set(arr)); }; }
else { ARR.unique = ARR.rightUnique; }

var mixStr = function (strs) {
	var exprs = [], len = arguments.length - 1;
	while ( len-- > 0 ) exprs[ len ] = arguments[ len + 1 ];

	var string = '';
	for (var i = 0; i < exprs.length; i++) { string += (strs[i] + exprs[i]); }
	return string + strs[strs.length - 1]
};

var getVal = function (ref) {
	var dataNode = ref.dataNode;
	var _key = ref._key;

	return dataNode[_key];
};

var mixVal = function (strs) {
	var exprs = [], len = arguments.length - 1;
	while ( len-- > 0 ) exprs[ len ] = arguments[ len + 1 ];

	if (!strs) { return getVal(exprs[0]) }
	var template = [strs];
	template.push.apply(template, exprs.map(getVal));
	return mixStr.apply(void 0, template)
};

// Enough for ef's usage, so no need for a full polyfill
var _assign = function (ee, er) {
	for (var i in er) { ee[i] = er[i]; }
	return ee
};

var assign = Object.assign || _assign;

var query = [];
var domQuery = [];
var count = 0;

var queue = function (handlers) { return query.push.apply(query, handlers); };

var queueDom = function (handler) { return domQuery.push(handler); };

var inform = function () {
	count += 1;
	return count
};

var exec = function (immediate) {
	if (!immediate && (count -= 1) > 0) { return count }
	count = 0;

	if (query.length > 0) {
		var renderQuery = ARR.unique(query);
		{ console.info('[EF]', ((query.length) + " modification operations cached, " + (renderQuery.length) + " executed.")); }
		for (var i$2 = 0, list = renderQuery; i$2 < list.length; i$2 += 1) {
			var i = list[i$2];

			i();
		}
		ARR.empty(query);
	}

	if (domQuery.length > 0) {
		var domRenderQuery = ARR.rightUnique(domQuery);
		{ console.info('[EF]', ((domQuery.length) + " DOM operations cached, " + (domRenderQuery.length) + " executed.")); }
		for (var i$3 = 0, list$1 = domRenderQuery; i$3 < list$1.length; i$3 += 1) {
			var i$1 = list$1[i$3];

			i$1();
		}
		ARR.empty(domQuery);
	}
	return count
};

var resolveAllPath = function (ref) {
	var _path = ref._path;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;

	for (var i$1 = 0, list = _path; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		if (!handlers[i]) { handlers[i] = {}; }
		if (!subscribers[i]) { subscribers[i] = {}; }
		if (!innerData[i]) { innerData[i] = {}; }
		handlers = handlers[i];
		subscribers = subscribers[i];
		innerData = innerData[i];
	}
	return {
		handlerNode: handlers,
		subscriberNode: subscribers,
		dataNode: innerData
	}
};

var resolveReactivePath = function (_path, obj, enume) {
	for (var i$1 = 0, list = _path; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		if (!obj[i]) {
			var node = {};
			Object.defineProperty(obj, i, {
				get: function get() {
					return node
				},
				set: function set(data) {
					inform();
					assign(node, data);
					exec();
				},
				configurable: !enume,
				enumerable: enume
			});
		}
		obj = obj[i];
	}
	return obj
};

var resolve = function (ref) {
	var _path = ref._path;
	var _key = ref._key;
	var data = ref.data;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;

	var parentNode = resolveReactivePath(_path, data, true);
	var ref$1 = resolveAllPath({_path: _path, handlers: handlers, subscribers: subscribers, innerData: innerData});
	var handlerNode = ref$1.handlerNode;
	var subscriberNode = ref$1.subscriberNode;
	var dataNode = ref$1.dataNode;
	if (!handlerNode[_key]) { handlerNode[_key] = []; }
	if (!subscriberNode[_key]) { subscriberNode[_key] = []; }
	if (!Object.prototype.hasOwnProperty.call(dataNode, _key)) { dataNode[_key] = ''; }
	return { parentNode: parentNode, handlerNode: handlerNode[_key], subscriberNode: subscriberNode[_key], dataNode: dataNode }
};

var resolveSubscriber = function (_path, subscribers) {
	var pathArr = _path.split('.');
	var key = pathArr.pop();
	for (var i$1 = 0, list = pathArr; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		if (!subscribers[i]) { subscribers[i] = {}; }
		subscribers = subscribers[i];
	}
	return subscribers[key]
};

var initDataNode = function (ref) {
	var parentNode = ref.parentNode;
	var dataNode = ref.dataNode;
	var handlerNode = ref.handlerNode;
	var subscriberNode = ref.subscriberNode;
	var state = ref.state;
	var _key = ref._key;

	Object.defineProperty(parentNode, _key, {
		get: function get() {
			return dataNode[_key]
		},
		set: function set(value) {
			if (dataNode[_key] === value) { return }
			dataNode[_key] = value;
			queue(handlerNode);
			inform();
			for (var i = 0, list = subscriberNode; i < list.length; i += 1) {
				var j = list[i];

				j({state: state, value: value});
			}
			exec();
		},
		enumerable: true
	});
};

var initBinding = function (ref) {
	var bind = ref.bind;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;

	var _path = ARR.copy(bind[0]);
	var _default = bind[1];
	var _key = _path.pop();
	var ref$1 = resolve({
		_path: _path,
		_key: _key,
		data: state.$data,
		handlers: handlers,
		subscribers: subscribers,
		innerData: innerData
	});
	var parentNode = ref$1.parentNode;
	var handlerNode = ref$1.handlerNode;
	var subscriberNode = ref$1.subscriberNode;
	var dataNode = ref$1.dataNode;

	// Initlize data binding node if not exist
	if (!Object.prototype.hasOwnProperty.call(parentNode, _key)) { initDataNode({parentNode: parentNode, dataNode: dataNode, handlerNode: handlerNode, subscriberNode: subscriberNode, state: state, _key: _key}); }
	// Update default value
	if (_default) { parentNode[_key] = _default; }

	return {dataNode: dataNode, handlerNode: handlerNode, subscriberNode: subscriberNode, _key: _key}
};

var getElement = function (tag, ref, refs) {
	var element = document.createElement(tag);
	if (ref) { Object.defineProperty(refs, ref, {
		value: element,
		enumerable: true
	}); }
	return element
};

var regTmpl = function (ref) {
	var val = ref.val;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;
	var handler = ref.handler;

	if (Array.isArray(val)) {
		var strs = val[0];
		var exprs = val.slice(1);
		var tmpl = [strs];
		var _handler = function () { return handler(mixVal.apply(void 0, tmpl)); };
		tmpl.push.apply(tmpl, exprs.map(function (item) {
			var ref = initBinding({bind: item, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData});
			var dataNode = ref.dataNode;
			var handlerNode = ref.handlerNode;
			var _key = ref._key;
			handlerNode.push(_handler);
			return {dataNode: dataNode, _key: _key}
		}));
		return _handler
	}
	return function () { return val; }
};

var updateOthers = function (ref) {
	var dataNode = ref.dataNode;
	var handlerNode = ref.handlerNode;
	var subscriberNode = ref.subscriberNode;
	var _handler = ref._handler;
	var state = ref.state;
	var _key = ref._key;
	var value = ref.value;

	if (dataNode[_key] === value) { return }
	dataNode[_key] = value;
	var query = ARR.copy(handlerNode);
	ARR.remove(query, _handler);
	queue(query);
	inform();
	for (var i$1 = 0, list = subscriberNode; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		i({state: state, value: value});
	}
	exec();
};

var addValListener = function (ref) {
	var _handler = ref._handler;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;
	var element = ref.element;
	var key = ref.key;
	var expr = ref.expr;

	var ref$1 = initBinding({bind: expr, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData});
	var dataNode = ref$1.dataNode;
	var handlerNode = ref$1.handlerNode;
	var subscriberNode = ref$1.subscriberNode;
	var _key = ref$1._key;
	var _update = function () { return updateOthers({dataNode: dataNode, handlerNode: handlerNode, subscriberNode: subscriberNode, _handler: _handler, state: state, _key: _key, value: element.value}); };
	if (key === 'value') {
		element.addEventListener('input', _update, true);
		element.addEventListener('keyup', _update, true);
		element.addEventListener('change', _update, true);
	} else { element.addEventListener('change', function () { return updateOthers({dataNode: dataNode, handlerNode: handlerNode, subscriberNode: subscriberNode, _handler: _handler, state: state, _key: _key, value: element.checked}); }, true); }
};

var getAttrHandler = function (element, key) {
	if (key === 'class') { return function (val) {
		val = val.replace(/\s+/g, ' ').trim();
		element.setAttribute(key, val);
	} }
	return function (val) { return element.setAttribute(key, val); }
};

var addAttr = function (ref) {
	var element = ref.element;
	var attr = ref.attr;
	var key = ref.key;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;

	if (typeof attr === 'string') { element.setAttribute(key, attr); }
	else {
		var handler = getAttrHandler(element, key);
		queue([regTmpl({val: attr, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData, handler: handler})]);
	}
};

var addProp = function (ref) {
	var element = ref.element;
	var prop = ref.prop;
	var key = ref.key;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;

	if (typeof prop === 'string') { element[key] = prop; }
	else {
		var handler = function (val) {
			element[key] = val;
		};
		var _handler = regTmpl({val: prop, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData, handler: handler});
		if ((key === 'value' ||
			key === 'checked') &&
			!prop[0]) { addValListener({_handler: _handler, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData, element: element, key: key, expr: prop[1]}); }
		queue([_handler]);
	}
};


var rawHandler = function (val) { return val; };

var addEvent = function (ref) {
	var element = ref.element;
	var event = ref.event;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;


	/**
	 *  l: listener									: string
	 *  m: method                   : string
	 *  s: stopPropagation          : number/undefined
	 *  i: stopImmediatePropagation : number/undefined
	 *  p: preventDefault           : number/undefined
	 *  h: shiftKey                 : number/undefined
	 *  a: altKey                   : number/undefined
	 *  c: ctrlKey                  : number/undefined
	 *  t: metaKey                  : number/undefined
	 *  u: capture                  : number/undefined
	 *  k: keyCodes                 : array/undefined
	 *  v: value                    : string/array/undefined
	 */
	var l = event.l;
	var m = event.m;
	var s = event.s;
	var i = event.i;
	var p = event.p;
	var h = event.h;
	var a = event.a;
	var c = event.c;
	var t = event.t;
	var u = event.u;
	var k = event.k;
	var v = event.v;
	var _handler = regTmpl({val: v, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData, handler: rawHandler});
	element.addEventListener(l, function (e) {
		if (!!h !== !!e.shiftKey ||
			!!a !== !!e.altKey ||
			!!c !== !!e.ctrlKey ||
			!!t !== !!e.metaKey ||
			(k && k.indexOf(e.which) === -1)) { return }
		if (s) { e.stopPropagation(); }
		if (i) { e.stopImmediatePropagation(); }
		if (p) { e.preventDefault(); }
		if (state.$methods[m]) { state.$methods[m]({e: e, value: _handler(), state: state}); }
		else { console.warn('[EF]', ("Method named '" + m + "' not found!")); }
	}, !!u);
};

var createElement = function (ref) {
	var info = ref.info;
	var state = ref.state;
	var innerData = ref.innerData;
	var refs = ref.refs;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;


	/**
	 *  t: tag       : string
	 *  a: attr      : object
	 *  p: prop      : object
	 *  e: event     : array
	 *  r: reference : string
	 */
	var t = info.t;
	var a = info.a;
	var p = info.p;
	var e = info.e;
	var r = info.r;
	var element = getElement(t, r, refs);
	for (var i in a) { addAttr({element: element, attr: a[i], key: i, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData}); }
	for (var i$1 in p) { addProp({element: element, prop: p[i$1], key: i$1, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData}); }
	for (var i$2 in e) { addEvent({element: element, event: e[i$2], state: state, handlers: handlers, subscribers: subscribers, innerData: innerData}); }
	return element
};

var proto$1 = Node.prototype;
// const safeZone = document.createDocumentFragment()

var DOM = {
	// addClass(node, className) {
	// 	const classes = className.split(' ')
	// 	node.classList.add(...classes)
	// },

	// removeClass(node, className) {
	// 	const classes = className.split(' ')
	// 	node.classList.remove(...classes)
	// },

	// toggleClass(node, className) {
	// 	const classes = className.split(' ')
	// 	const classArr = node.className.split(' ')
	// 	for (let i of classes) {
	// 		const classIndex = classArr.indexOf(i)
	// 		if (classIndex > -1) {
	// 			classArr.splice(classIndex, 1)
	// 		} else {
	// 			classArr.push(i)
	// 		}
	// 	}
	// 	node.className = classArr.join(' ').trim()
	// },

	// replaceWith(node, newNode) {
	// 	const parent = node.parentNode
	// 	if (parent) proto.replaceChild.call(parent, newNode, node)
	// },

	// swap(node, newNode) {
	// 	const nodeParent = node.parentNode
	// 	const newNodeParent = newNode.parentNode
	// 	const nodeSibling = node.nextSibling
	// 	const newNodeSibling = newNode.nextSibling
	// 	if (nodeParent && newNodeParent) {
	// 		proto.insertBefore.call(nodeParent, newNode, nodeSibling)
	// 		proto.insertBefore.call(newNodeParent, node, newNodeSibling)
	// 	}
	// },

	before: function before(node) {
		var nodes = [], len = arguments.length - 1;
		while ( len-- > 0 ) nodes[ len ] = arguments[ len + 1 ];

		var tempFragment = document.createDocumentFragment();
		nodes.reverse();
		for (var i$1 = 0, list = nodes; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			proto$1.appendChild.call(tempFragment, i);
		}
		proto$1.insertBefore.call(node.parentNode, tempFragment, node);
	},

	after: function after(node) {
		var nodes = [], len = arguments.length - 1;
		while ( len-- > 0 ) nodes[ len ] = arguments[ len + 1 ];

		var tempFragment = document.createDocumentFragment();
		for (var i$1 = 0, list = nodes; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			proto$1.appendChild.call(tempFragment, i);
		}
		if (node.nextSibling) { proto$1.insertBefore.call(node.parentNode, tempFragment, node.nextSibling); }
		else { proto$1.appendChild.call(node.parentNode, tempFragment); }
	},

	append: function append(node) {
		var nodes = [], len = arguments.length - 1;
		while ( len-- > 0 ) nodes[ len ] = arguments[ len + 1 ];

		if ([1,9,11].indexOf(node.nodeType) === -1) { return }
		var tempFragment = document.createDocumentFragment();
		for (var i$1 = 0, list = nodes; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			proto$1.appendChild.call(tempFragment, i);
		}
		proto$1.appendChild.call(node, tempFragment);
	},

	// prepend(node, ...nodes) {
	// 	if ([1,9,11].indexOf(node.nodeType) === -1) {
	// 		return
	// 	}
	// 	const tempFragment = document.createDocumentFragment()
	// 	nodes.reverse()
	// 	for (let i of nodes) {
	// 		proto.appendChild.call(tempFragment, i)
	// 	}
	// 	if (node.firstChild) {
	// 		proto.insertBefore.call(node, tempFragment, node.firstChild)
	// 	} else {
	// 		proto.appendChild.call(node, tempFragment)
	// 	}
	// },

	// appendTo(node, newNode) {
	// 	proto.appendChild.call(newNode, node)
	// },

	// prependTo(node, newNode) {
	// 	if (newNode.firstChild) {
	// 		proto.insertBefore.call(newNode, node, node.firstChild)
	// 	} else {
	// 		proto.appendChild.call(newNode, node)
	// 	}
	// },

	// empty(node) {
	// 	node.innerHTML = ''
	// },

	remove: function remove(node) {
		proto$1.removeChild.call(node.parentNode, node);
	},

	// safeRemove(node) {
	// 	proto.appendChild.call(safeZone, node)
	// }
};

var DOMARR = {
	empty: function empty() {
		var this$1 = this;

		inform();
		for (var i$1 = 0, list = ARR.copy(this$1); i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			i.$destroy();
		}
		exec();
		ARR.empty(this);
	},
	pop: function pop() {
		if (this.length === 0) { return }
		var poped = ARR.pop(this);
		poped.$umount();
		return poped
	},
	push: function push(ref) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		var state = ref.state;
		var key = ref.key;
		var anchor = ref.anchor;
		var elements = [];
		inform();
		for (var i$1 = 0, list = items; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			ARR.push(elements, i.$mount({parent: state, key: key}));
		}
		if (this.length === 0) { DOM.after.apply(DOM, [ anchor ].concat( elements )); }
		else { DOM.after.apply(DOM, [ this[this.length - 1].$avatar ].concat( elements )); }
		exec();
		return ARR.push.apply(ARR, [ this ].concat( items ))
	},
	remove: function remove(item) {
		if (this.indexOf(item) === -1) { return }
		item.$umount();
		return item
	},
	reverse: function reverse(ref) {
		var state = ref.state;
		var key = ref.key;
		var anchor = ref.anchor;

		if (this.length === 0) { return this }
		var tempArr = ARR.copy(this);
		var elements = [];
		inform();
		for (var i = tempArr.length - 1; i >= 0; i--) {
			tempArr[i].$umount();
			ARR.push(elements, tempArr[i].$mount({parent: state, key: key}));
		}
		ARR.push.apply(ARR, [ this ].concat( ARR.reverse(tempArr) ));
		DOM.after.apply(DOM, [ anchor ].concat( elements ));
		exec();
		return this
	},
	shift: function shift() {
		if (this.length === 0) { return }
		var shifted = ARR.shift(this);
		shifted.$umount();
		return shifted
	},
	sort: function sort(ref, fn) {
		var state = ref.state;
		var key = ref.key;
		var anchor = ref.anchor;

		if (this.length === 0) { return this }
		var sorted = ARR.copy(ARR.sort(this, fn));
		var elements = [];
		inform();
		for (var i$1 = 0, list = sorted; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			i.$umount();
			ARR.push(elements, i.$mount({parent: state, key: key}));
		}
		ARR.push.apply(ARR, [ this ].concat( sorted ));
		DOM.after.apply(DOM, [ anchor ].concat( elements ));
		exec();
		return this
	},
	splice: function splice(ref) {
		var args = [], len = arguments.length - 1;
		while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

		var state = ref.state;
		var key = ref.key;
		var anchor = ref.anchor;
		if (this.length === 0) { return this }
		var spliced = ARR.splice.apply(ARR, [ ARR.copy(this) ].concat( args ));
		inform();
		for (var i$1 = 0, list = spliced; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			i.$umount();
		}
		exec();
		return spliced
	},
	unshift: function unshift(ref) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		var state = ref.state;
		var key = ref.key;
		var anchor = ref.anchor;
		if (this.length === 0) { return (ref$1 = this).push.apply(ref$1, items).length }
		var elements = [];
		inform();
		for (var i$1 = 0, list = items; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			if (i.$parent) {
				{ console.warn('[EF]', 'Better detach the component before attaching it to a new component!'); }
				return
			}
			i.$umount();
			ARR.push(elements, i.$mount({parent: state, key: key}));
		}
		DOM.after.apply(DOM, [ anchor ].concat( elements ));
		exec();
		return ARR.unshift.apply(ARR, [ this ].concat( items ))
		var ref$1;
	}
};

var defineArr = function (arr, info) {
	Object.defineProperties(arr, {
		empty: {value: DOMARR.empty},
		pop: {value: DOMARR.pop},
		push: {value: DOMARR.push.bind(arr, info)},
		remove: {value: DOMARR.remove},
		reverse: {value: DOMARR.reverse.bind(arr, info)},
		shift: {value: DOMARR.shift},
		sort: {value: DOMARR.sort.bind(arr, info)},
		splice: {value: DOMARR.splice.bind(arr, info)},
		unshift: {value: DOMARR.unshift.bind(arr, info)}
	});
	return arr
};

var typeOf = function (obj) {
	if (Array.isArray(obj)) { return 'array' }
	return typeof obj
};

var bindTextNode = function (ref) {
	var node = ref.node;
	var state = ref.state;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var innerData = ref.innerData;
	var element = ref.element;

	// Data binding text node
	var textNode = document.createTextNode('');
	var ref$1 = initBinding({bind: node, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData});
	var dataNode = ref$1.dataNode;
	var handlerNode = ref$1.handlerNode;
	var _key = ref$1._key;
	var handler = function () {
		textNode.textContent = dataNode[_key];
	};
	handlerNode.push(handler);
	queue([handler]);

	// Append element to the component
	DOM.append(element, textNode);
};

var updateMountingNode = function (ref) {
	var state = ref.state;
	var children = ref.children;
	var key = ref.key;
	var anchor = ref.anchor;
	var value = ref.value;

	if (children[key] === value) { return }
	if (value) {
		if (value.$parent && "development" !== 'production') { console.warn('[EF]', 'Better detach the component before attaching it to a new component!'); }
		if (value.$element.contains(state.$element)) {
			{ console.warn('[EF]', 'Cannot mount a component to it\'s child component!'); }
			return
		}
	}

	inform();
	// Update component
	if (children[key]) { children[key].$umount(); }
	// Update stored value
	children[key] = value;
	if (value) { value.$mount({target: anchor, parent: state, option: 'before', key: key}); }
	exec();
};

var bindMountingNode = function (ref) {
	var state = ref.state;
	var key = ref.key;
	var children = ref.children;
	var anchor = ref.anchor;

	Object.defineProperty(state, key, {
		get: function get() {
			return children[key]
		},
		set: function set(value) {
			updateMountingNode({state: state, children: children, key: key, anchor: anchor, value: value});
		},
		enumerable: true,
		configurable: true
	});
};

var updateMountingList = function (ref) {
	var state = ref.state;
	var children = ref.children;
	var key = ref.key;
	var anchor = ref.anchor;
	var value = ref.value;

	if (value) { value = ARR.copy(value); }
	else { value = []; }
	var fragment = document.createDocumentFragment();
	// Update components
	inform();
	if (children[key]) {
		for (var i = 0, list = value; i < list.length; i += 1) {
			var j = list[i];

			if (j.$element.contains(state.$element)) {
				{ console.warn('[EF]', 'Cannot mount a component to it\'s child component!'); }
				return
			}
			j.$umount();
			DOM.append(fragment, j.$mount({parent: state, key: key}));
		}
		for (var i$1 = 0, list$1 = ARR.copy(children[key]); i$1 < list$1.length; i$1 += 1) {
			var j$1 = list$1[i$1];

			j$1.$umount();
		}
	} else { for (var i$2 = 0, list$2 = value; i$2 < list$2.length; i$2 += 1) {
		var j$2 = list$2[i$2];

		DOM.append(fragment, j$2.$mount({parent: state, key: key}));
	} }
	// Update stored value
	children[key].length = 0;
	ARR.push.apply(ARR, [ children[key] ].concat( value ));
	// Append to current component
	DOM.after(anchor, fragment);
	exec();
};

var bindMountingList = function (ref) {
	var state = ref.state;
	var key = ref.key;
	var children = ref.children;
	var anchor = ref.anchor;

	children[key] = defineArr([], {state: state, key: key, anchor: anchor});
	Object.defineProperty(state, key, {
		get: function get() {
			return children[key]
		},
		set: function set(value) {
			if (children[key] && ARR.equals(children[key], value)) { return }
			updateMountingList({state: state, children: children, key: key, anchor: anchor, value: value});
		},
		enumerable: true,
		configurable: true
	});
};

var resolveAST = function (ref) {
	var node = ref.node;
	var nodeType = ref.nodeType;
	var element = ref.element;
	var state = ref.state;
	var innerData = ref.innerData;
	var refs = ref.refs;
	var children = ref.children;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var create = ref.create;

	switch (nodeType) {
		case 'string': {
			// Static text node
			DOM.append(element, document.createTextNode(node));
			break
		}
		case 'array': {
			if (typeOf(node[0]) === 'object') { DOM.append(element, create({ast: node, state: state, innerData: innerData, refs: refs, children: children, handlers: handlers, subscribers: subscribers, create: create})); }
			else { bindTextNode({node: node, state: state, handlers: handlers, subscribers: subscribers, innerData: innerData, element: element}); }
			break
		}
		case 'object': {
			var anchor = document.createTextNode('');
			if (node.t === 0) { bindMountingNode({state: state, key: node.n, children: children, anchor: anchor}); }
			else if (node.t === 1) { bindMountingList({state: state, key: node.n, children: children, anchor: anchor}); }
			else { throw new TypeError(("Not a standard ef.js AST: Unknown mounting point type '" + (node.t) + "'")) }
			// Append anchor
			DOM.append(element, anchor);
			// Display anchor indicator in development mode
			{
				DOM.before(anchor, document.createComment(("Start of mounting point '" + (node.n) + "'")));
				DOM.after(anchor, document.createComment(("End of mounting point '" + (node.n) + "'")));
			}
			break
		}
		default: {
			throw new TypeError(("Not a standard ef.js AST: Unknown node type '" + nodeType + "'"))
		}
	}
};

var create$1 = function (ref) {
	var ast = ref.ast;
	var state = ref.state;
	var innerData = ref.innerData;
	var refs = ref.refs;
	var children = ref.children;
	var handlers = ref.handlers;
	var subscribers = ref.subscribers;
	var create = ref.create;

	// First create an element according to the description
	var element = createElement({info: ast[0], state: state, innerData: innerData, refs: refs, handlers: handlers, subscribers: subscribers});

	// Append child nodes
	for (var i = 1; i < ast.length; i++) { resolveAST({node: ast[i], nodeType: typeOf(ast[i]), element: element, state: state, innerData: innerData, refs: refs, children: children, handlers: handlers, subscribers: subscribers, create: create}); }

	return element
};

var unsubscribe = function (_path, fn, subscribers) {
	var pathArr = _path.split('.');
	var subscriberNode = resolveSubscriber(pathArr, subscribers);
	ARR.remove(subscriberNode, fn);
};

var update = function(newState) {
	inform();
	var tmpState = assign({}, newState);
	if (tmpState.$data) {
		assign(this.$data, tmpState.$data);
		delete(tmpState.$data);
	}
	if (tmpState.$methods) {
		assign(this.$methods, tmpState.$methods);
		delete(tmpState.$methods);
	}
	assign(this, tmpState);
	exec();
};

var destroy$1 = function() {
	var this$1 = this;

	var ref = this;
	var $element = ref.$element;
	var $avatar = ref.$avatar;
	inform();
	this.$umount();
	for (var i in this$1) {
		this$1[i] = null;
		delete this$1[i];
	}
	queueDom(function () {
		DOM.remove($element);
		DOM.remove($avatar);
	});
	delete this.$element;
	delete this.$avatar;
	delete this.$parent;
	delete this.$key;
	delete this.$data;
	delete this.$methods;
	delete this.$refs;
	delete this.$mount;
	delete this.$umount;
	delete this.$subscribe;
	delete this.$unsubscribe;
	return exec()
};

var state = (function () {
	function state (ast) {
	var this$1 = this;

		var children = {};
		var refs = {};
		var innerData = {};
		var methods = {};
		var handlers = {};
		var subscribers = {};
		var nodeInfo = {
			avatar: document.createTextNode(''),
			replace: [],
			parent: null,
			key: null
		};

		{ nodeInfo.avatar = document.createComment('AVATAR OF COMPONENT'); }

		var safeZone = document.createDocumentFragment();
		var mount = function () {
			if (nodeInfo.replace.length > 0) {
				for (var i$1 = 0, list = nodeInfo.replace; i$1 < list.length; i$1 += 1) {
				var i = list[i$1];

				DOM.remove(i);
			}
				ARR.empty(nodeInfo.replace);
			}
			DOM.before(nodeInfo.avatar, nodeInfo.element);
		};

		inform();
		Object.defineProperties(this, {
			$element: {
				get: function get() {
					return nodeInfo.element
				},
				configurable: true
			},
			$avatar: {
				get: function get() {
					return nodeInfo.avatar
				},
				configurable: true
			},
			$parent: {
				get: function get() {
					return nodeInfo.parent
				},
				configurable: true
			},
			$key: {
				get: function get() {
					return nodeInfo.key
				},
				configurable: true
			},
			$methods: {
				get: function get() {
					return methods
				},
				set: function set(newMethods) {
					assign(methods, newMethods);
				},
				configurable: true
			},
			$refs: {
				value: refs,
				configurable: true
			},
			$mount: {
				value: function(ref) {
				var target = ref.target;
				var option = ref.option;
				var parent = ref.parent;
				var key = ref.key;

					if (typeof target === 'string') { target = document.querySelector(target); }

					inform();
					if (nodeInfo.parent) {
						this.$umount();
						{ console.warn('[EF]', 'Component detached from previous mounting point.'); }
					}

					if (!parent) { parent = target; }
					if (!key) { key = '__DIRECTMOUNT__'; }
					nodeInfo.parent = parent;
					nodeInfo.key = key;
					queueDom(mount);

					if (!target) {
						exec();
						return nodeInfo.avatar
					}

					switch (option) {
						case 'before': {
							DOM.before(target, nodeInfo.avatar);
							break
						}
						case 'after': {
							DOM.after(target, nodeInfo.avatar);
							break
						}
						case 'replace': {
							DOM.before(target, nodeInfo.avatar);
							nodeInfo.replace.push(target);
							break
						}
						default: {
							DOM.append(target, nodeInfo.avatar);
						}
					}
					return exec()
				},
				configurable: true
			},
			$umount: {
				value: function() {
					var parent = nodeInfo.parent;
				var key = nodeInfo.key;
					nodeInfo.parent = null;
					nodeInfo.key = null;

					inform();
					if (parent && key !== '__DIRECTMOUNT__' && parent[key]) {
						if (Array.isArray(parent[key])) { ARR.remove(parent[key], this); }
						else {
							parent[key] = null;
							return exec()
						}
					}
					DOM.append(safeZone, nodeInfo.avatar);
					queueDom(mount);
					return exec()
				},
				configurable: true
			},
			$subscribe: {
				value: function (pathStr, subscriber) {
					var _path = pathStr.split('.');
					var ref = initBinding({bind: [_path], state: this$1, handlers: handlers, subscribers: subscribers, innerData: innerData});
				var dataNode = ref.dataNode;
				var subscriberNode = ref.subscriberNode;
				var _key = ref._key;
					// Execute subscriber immediately
					subscriber({state: this$1, value: dataNode[_key]});
					subscriberNode.push(subscriber);
				},
				configurable: true
			},
			$unsubscribe: {
				value: function (_path, fn) {
					unsubscribe(_path, fn, subscribers);
				},
				configurable: true
			}
		});
		// Init root data node
		resolveReactivePath(['$data'], this, false);

		nodeInfo.element = create$1({ast: ast, state: this, innerData: innerData, refs: refs, children: children, handlers: handlers, subscribers: subscribers, create: create$1});
		DOM.append(safeZone, nodeInfo.avatar);
		queueDom(mount);
		exec();
	}

	return state;
}());

Object.defineProperties(state.prototype, {
	$update: {value: update},
	$destroy: {value: destroy$1}
});

var version = "0.3.3-alpha.3";

// Import everything
var parser = parseEft;

var create = function (value) {
	var valType = typeOf(value);
	if (valType === 'string') { value = parse(value, parser); }
	else if (valType !== 'array') { throw new TypeError('Cannot create new component without proper template or AST!') }

	var ast = value;
	var ef = (function (state$$1) {
		function ef(newState) {
			inform();
			state$$1.call(this, ast);
			if (newState) { this.$update(newState); }
			exec();
		}

		if ( state$$1 ) ef.__proto__ = state$$1;
		ef.prototype = Object.create( state$$1 && state$$1.prototype );
		ef.prototype.constructor = ef;

		return ef;
	}(state));
	return ef
};

var bundle = function (cb) {
	inform();
	return exec(cb(inform, exec))
};

var setParser = function (newParser) {
	parser = newParser;
};

var t = function () {
	var args = [], len = arguments.length;
	while ( len-- ) args[ len ] = arguments[ len ];

	return create(mixStr.apply(void 0, args));
};

{ console.info('[EF]', ("ef.js v" + version + " initialized!")); }


var ef = Object.freeze({
	create: create,
	inform: inform,
	exec: exec,
	bundle: bundle,
	setParser: setParser,
	parseEft: parseEft,
	t: t,
	version: version
});

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (!("classList" in document.createElement("_"))
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) { return; }

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var this$1 = this;

        var
            i = 0
          , len = this.length;
        for (; i < len; i++) {
          if (i in this$1 && this$1[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var this$1 = this;

        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length;
        for (; i < len; i++) {
          this$1.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      };
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var this$1 = this;

      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this$1, token) === -1) {
          this$1.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var this$1 = this;

      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this$1, token);
        while (index !== -1) {
          this$1.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this$1, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add";

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var arguments$1 = arguments;
            var this$1 = this;

            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments$1[i];
              original.call(this$1, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

var _todoapp = create([{"t":"section","a":{"class":"todoapp"}},[{"t":"header","a":{"class":"header"}},[{"t":"h1"},"todos"],[{"t":"input","a":{"class":"new-todo","placeholder":"What needs to be done?","autofocus":""},"r":"input","p":{"value":[0,[["input"]]]},"e":[{"l":"keypress","p":1,"k":[13],"m":"addTodo","v":[0,[["input"]]]}]}]],{"n":"main","t":0},{"n":"footer","t":0}]);

var _main = create([{"t":"section","a":{"class":"main","style":"display: none;"}},[{"t":"input","a":{"class":"toggle-all","id":"toggle-all","type":"checkbox"},"p":{"checked":[0,[["allCompleted"]]]}}],[{"t":"label","a":{"for":"toggle-all"}},"Mark all as complete"],[{"t":"ul","a":{"class":"todo-list"}},{"n":"todos","t":1}]]);

var _todo = create([{"t":"li","a":{"class":[["todo ",""],[["completed"]]]}},[{"t":"div","a":{"class":"view"}},[{"t":"input","a":{"class":"toggle","type":"checkbox"},"p":{"checked":[0,[["stored","completed"]]]}}],[{"t":"label","e":[{"l":"dblclick","m":"edit"}]},[["stored","title"]]],[{"t":"button","a":{"class":"destroy"},"e":[{"l":"click","m":"destroy"}]}]],[{"t":"input","a":{"class":"edit"},"r":"edit","p":{"value":[0,[["stored","update"]]]},"e":[{"l":"keydown","p":1,"k":[13],"m":"blur"},{"l":"keydown","k":[27],"m":"cancel","v":[0,[["stored","title"]]]},{"l":"blur","m":"confirm","v":[0,[["update"]]]}]}]]);

var _footer = create([{"t":"footer","a":{"class":"footer","style":"display: none;"}},[{"t":"span","a":{"class":"todo-count"}},[{"t":"strong"},[["count"],"0"]]," item",[["s"]]," left"],[{"t":"ul","a":{"class":"filters"}},[{"t":"li"},[{"t":"a","a":{"class":[0,[["allSelected"]]],"href":"#/"}},"All"]],[{"t":"li"},[{"t":"a","a":{"class":[0,[["activeSelected"]]],"href":"#/active"}},"Active"]],[{"t":"li"},[{"t":"a","a":{"class":[0,[["completedSelected"]]],"href":"#/completed"}},"Completed"]]],[{"t":"button","a":{"class":"clear-completed","style":"display: none;"},"r":"clear","e":[{"l":"click","m":"clear"}]},"Clear completed"]]);

var proto$2 = Array.prototype;

var ARR$2 = {
	copy: function copy(arr) {
		return proto$2.slice.call(arr, 0)
	},
	empty: function empty(arr) {
		arr.length = 0;
		return arr
	},
	equals: function equals(left, right) {
		if (!Array.isArray(right)) { return false }
		if (left === right) { return true }
		if (left.length !== right.length) { return false }
		for (var i in left) { if (left[i] !== right[i]) { return false } }
		return true
	},
	pop: function pop(arr) {
		return proto$2.pop.call(arr)
	},
	push: function push(arr) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		return proto$2.push.apply(arr, items)
	},
	remove: function remove(arr, item) {
		var index = proto$2.indexOf.call(arr, item);
		if (index > -1) {
			proto$2.splice.call(arr, index, 1);
			return item
		}
	},
	reverse: function reverse(arr) {
		return proto$2.reverse.call(arr)
	},
	shift: function shift(arr) {
		return proto$2.shift.call(arr)
	},
	slice: function slice(arr, index, length) {
		return proto$2.slice.call(arr, index, length)
	},
	sort: function sort(arr, fn) {
		return proto$2.sort.call(arr, fn)
	},
	splice: function splice(arr) {
		var args = [], len = arguments.length - 1;
		while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

		return proto$2.splice.apply(arr, args)
	},
	unshift: function unshift(arr) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		return proto$2.unshift.apply(arr, items)
	}
};

var todoapp = new _todoapp();
var main = new _main();
var footer = new _footer();
var order = 0;

todoapp.main = main;
todoapp.footer = footer;

var todos = [];
var completed = [];
var all = [];
var storage = [];

var updateStorage = function () {
	localStorage.setItem('todos-ef', JSON.stringify(storage));
};

var sortList = function (l, r) {
	if (l.$data.stored.order > r.$data.stored.order) { return 1 }
	return -1
};

var updateList = function (hash) {
	inform();
	switch (hash) {
		case '#/active': {
			main.todos = todos.sort(sortList);
			footer.$data = {
				allSelected: '',
				activeSelected: 'selected',
				completedSelected: ''
			};
			break
		}
		case '#/completed': {
			main.todos = completed.sort(sortList);
			footer.$data = {
				allSelected: '',
				activeSelected: '',
				completedSelected: 'selected'
			};
			break
		}
		default: {
			main.todos = all;
			footer.$data = {
				allSelected: 'selected',
				activeSelected: '',
				completedSelected: ''
			};
		}
	}
	exec();
};

var updateCount = function () {
	if (all.length === 0) {
		footer.$element.style.display = 'none';
		main.$element.style.display = 'none';
	} else {
		footer.$element.style.display = 'block';
		main.$element.style.display = 'block';
	}

	if (all.length !== 0 && all.length === completed.length) { main.$data.allCompleted = true; }
	else { main.$data.allCompleted = false; }

	if (completed.length === 0) { footer.$refs.clear.style.display = 'none'; }
	else { footer.$refs.clear.style.display = 'block'; }
	footer.$data.count = todos.length;
	if (todos.length > 1) { footer.$data.s = 's'; }
	else { footer.$data.s = ''; }
};

var toggleAll = function (ref) {
	var value = ref.value;

	inform();
	if (value) {
		var _todos = ARR$2.copy(todos);
		for (var i$2 = 0, list = _todos; i$2 < list.length; i$2 += 1) {
			var i = list[i$2];

			i.$data.stored.completed = true;
		}
	} else if (completed.length === all.length) {
		var _completed = ARR$2.copy(completed);
		for (var i$3 = 0, list$1 = _completed; i$3 < list$1.length; i$3 += 1) {
			var i$1 = list$1[i$3];

			i$1.$data.stored.completed = false;
		}
	}
	if (location.hash !== '#/') { updateList(location.hash); }
	exec();
};

var clear = function () {
	inform();
	for (var i$1 = 0, list = completed; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		ARR$2.remove(all, i);
		ARR$2.remove(storage, i.$data.stored);
		main.todos.remove(i);
		i.$destroy();
	}
	completed.length = 0;
	updateCount();
	updateStorage();
	updateList(location.hash);
	exec();
};

var destroy = function (ref) {
	var state = ref.state;

	inform();
	ARR$2.remove(all, state);
	ARR$2.remove(storage, state.$data.stored);
	ARR$2.remove(completed, state);

	state.$destroy();
	updateCount();
	updateStorage();
	updateList(location.hash);
	exec();
};

var toggleComplete = function(ref) {
	var checked = ref.value;

	inform();
	if (checked) {
		this.$data.completed = 'completed';
		ARR$2.remove(todos, this);
		completed.push(this);
		if (location.hash === '#/active') { main.todos.remove(this); }
	} else {
		this.$data.completed = '';
		todos.push(this);
		ARR$2.remove(completed, this);
		window._this_ = this;
		if (location.hash === '#/completed') { main.todos.remove(this); }
	}
	updateCount();
	updateStorage();
	exec();
};

var confirm = function (ref) {
	var e = ref.e;
	var state = ref.state;
	var value = ref.value;

	inform();
	var newVal = value.trim();
	if (!newVal) { return exec(destroy({state: state})) }
	state.$element.classList.remove('editing');
	state.$data.stored.title = newVal;
	if (e.type === 'blur') { state.$data.update = ''; }
	updateStorage();
	exec();
};

var cancel = function (ref) {
	var state = ref.state;
	var value = ref.value;

	inform();
	state.$element.classList.remove('editing');
	state.$data.update = value;
	exec();
};

var edit = function (ref) {
	var state = ref.state;

	inform();
	state.$element.classList.add('editing');
	state.$data.update = state.$data.stored.title;
	state.$refs.edit.focus();
	exec();
};

var blur = function (ref) {
	var state = ref.state;

	state.$refs.edit.blur();
};

var add = function (value) {
	value.order = order += 1;
	value.completed = !!value.completed;
	var todo = new _todo({
		$data: {stored: value},
		$methods: {
			blur: blur,
			edit: edit,
			cancel: cancel,
			confirm: confirm,
			destroy: destroy
		}
	});

	all.push(todo);
	storage.push(todo.$data.stored);

	if (!value.completed && location.hash !== '#/completed') { main.todos.push(todo); }

	todo.$subscribe('stored.completed', toggleComplete.bind(todo));

	updateCount();
	updateStorage();

	todoapp.$refs.input.focus();
};

var addTodo = function (ref) {
	var state = ref.state;
	var value = ref.value;

	value = value.trim();
	inform();
	if (!value) { return }
	state.$data.input = '';
	add({
		title: value,
		completed: false
	});
	exec();
};

todoapp.$methods.addTodo = addTodo;
footer.$methods.clear = clear;
main.$subscribe('allCompleted', toggleAll);

var lastStorage = localStorage.getItem('todos-ef');
if (lastStorage) {
	var lastTodos = JSON.parse(lastStorage);
	inform();
	for (var i$1 = 0, list = lastTodos; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		add(i);
	}
	exec();
}

if (!(/^#\/(active|completed)?$/).test(location.hash)) { window.location = '#/'; }

updateList(location.hash);

window.addEventListener('hashchange', function () { return updateList(location.hash); });

todoapp.$mount({
	target: '.todoapp',
	option: 'replace'
});

window.todoapp = todoapp;
window.ef = ef;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZWZ0LXBhcnNlci9zcmMvZXNjYXBlLXBhcnNlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZnQtcGFyc2VyL3NyYy9lZnQtcGFyc2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvcGFyc2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvYXJyYXktaGVscGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvbGl0ZXJhbHMtbWl4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvcG9seWZpbGxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvcmVuZGVyLXF1ZXJ5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvcmVzb2x2ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZWYuanMvc3JjL2xpYi91dGlscy9iaW5kaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvZWxlbWVudC1jcmVhdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvZG9tLWhlbHBlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvbGliL3V0aWxzL2RvbS1hcnItaGVscGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvdHlwZS1vZi5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvbGliL3V0aWxzL2NyZWF0b3IuanMiLCIuLi9ub2RlX21vZHVsZXMvZWYuanMvc3JjL2xpYi9yZW5kZXJlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvZWYuanMiLCIuLi9ub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIi4uL3NyYy9hcnJheS1oZWxwZXIuanMiLCIuLi9zcmMvdGVtcGxhdGVzL3RvZG9hcHAuanMiLCIuLi9zcmMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNldCB0aGUgZXNjYXBlIGNoYXJhY3RlclxuY29uc3QgY2hhciA9ICcmJ1xuXG4vLyBJbml0bGl6ZSBSZWdFeHBcbmNvbnN0IG9jdCA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9WzAtN117MSwzfWAsICdnJylcbmNvbnN0IHVjcCA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9dVxcXFxbLio/XFxcXF1gLCAnZycpXG5jb25zdCB1bmkgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfXUuezAsNH1gLCAnZycpXG5jb25zdCBoZXggPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfXguezAsMn1gLCAnZycpXG5jb25zdCBlc2MgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfWAsICdnJylcbmNvbnN0IGIgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfWJgLCAnZycpXG5jb25zdCB0ID0gbmV3IFJlZ0V4cChgXFxcXCR7Y2hhcn10YCwgJ2cnKVxuY29uc3QgbiA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9bmAsICdnJylcbmNvbnN0IHYgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfXZgLCAnZycpXG5jb25zdCBmID0gbmV3IFJlZ0V4cChgXFxcXCR7Y2hhcn1mYCwgJ2cnKVxuY29uc3QgciA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9cmAsICdnJylcblxuLy8gRXNjYXBlIG9jdG9uYXJ5IHNlcXVlbmNlXG5jb25zdCBPMkMgPSAoKSA9PiB7XG5cdHRocm93IG5ldyBTeW50YXhFcnJvcignT2N0YWwgZXNjYXBlIHNlcXVlbmNlcyBhcmUgbm90IGFsbG93ZWQgaW4gRUZNTC4nKVxufVxuXG4vLyBFc2NhcGUgdW5pY29kZSBjb2RlIHBvaW50IHNlcXVlbmNlXG5jb25zdCBVQzJDID0gKHZhbCkgPT4ge1xuXHR2YWwgPSB2YWwuc3Vic3RyKDMsIHZhbC5sZW5ndGggLSA0KVxuXHR2YWwgPSBwYXJzZUludCh2YWwsIDE2KVxuXHRpZiAoIXZhbCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlJylcblx0dHJ5IHtcblx0XHRyZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQodmFsKVxuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1VuZGVmaW5lZCBVbmljb2RlIGNvZGUtcG9pbnQnKVxuXHR9XG59XG5cbi8vIEVzY2FwZSB1bmljb2RlIHNlcXVlbmNlXG5jb25zdCBVMkMgPSAodmFsKSA9PiB7XG5cdHZhbCA9IHZhbC5zdWJzdHJpbmcoMilcblx0dmFsID0gcGFyc2VJbnQodmFsLCAxNilcblx0aWYgKCF2YWwpIHRocm93IG5ldyBTeW50YXhFcnJvcignSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZScpXG5cdHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbClcbn1cblxuLy8gRXNjYXBlIGhleGFkZWNpbWFsIHNlcXVlbmNlXG5jb25zdCBYMkMgPSAodmFsKSA9PiB7XG5cdHZhbCA9IGAwMCR7dmFsLnN1YnN0cmluZygyKX1gXG5cdHZhbCA9IHBhcnNlSW50KHZhbCwgMTYpXG5cdGlmICghdmFsKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0ludmFsaWQgaGV4YWRlY2ltYWwgZXNjYXBlIHNlcXVlbmNlJylcblx0cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUodmFsKVxufVxuXG5jb25zdCBFU0NBUEUgPSAoc3RyaW5nKSA9PiB7XG5cdC8vIFNwbGl0IHN0cmluZ3Ncblx0Y29uc3Qgc3BsaXRlZCA9IHN0cmluZy5zcGxpdChjaGFyICsgY2hhcilcblx0Y29uc3QgZXNjYXBlZCA9IFtdXG5cblx0Ly8gRXNjYXBlIGFsbCBrbm93biBlc2NhcGUgY2hhcmFjdGVyc1xuXHRmb3IgKGxldCBpIG9mIHNwbGl0ZWQpIHtcblx0XHRjb25zdCBlc2NhcGVkU3RyID0gaVxuXHRcdFx0LnJlcGxhY2Uob2N0LCBPMkMpXG5cdFx0XHQucmVwbGFjZSh1Y3AsIFVDMkMpXG5cdFx0XHQucmVwbGFjZSh1bmksIFUyQylcblx0XHRcdC5yZXBsYWNlKGhleCwgWDJDKVxuXHRcdFx0LnJlcGxhY2UoYiwgJ1xcYicpXG5cdFx0XHQucmVwbGFjZSh0LCAnXFx0Jylcblx0XHRcdC5yZXBsYWNlKG4sICdcXG4nKVxuXHRcdFx0LnJlcGxhY2UodiwgJ1xcdicpXG5cdFx0XHQucmVwbGFjZShmLCAnXFxmJylcblx0XHRcdC5yZXBsYWNlKHIsICdcXHInKVxuXHRcdFx0Ly8gUmVtb3ZlIGFsbCB1c2VsZXNzIGVzY2FwZSBjaGFyYWN0ZXJzXG5cdFx0XHQucmVwbGFjZShlc2MsICcnKVxuXHRcdGVzY2FwZWQucHVzaChlc2NhcGVkU3RyKVxuXHR9XG5cdC8vIFJldHVybiBlc2NhcGVkIHN0cmluZ1xuXHRyZXR1cm4gZXNjYXBlZC5qb2luKGNoYXIpXG59XG5cbi8vIGV4cG9ydCBkZWZhdWx0IEVTQ0FQRVxubW9kdWxlLmV4cG9ydHMgPSBFU0NBUEVcbiIsImltcG9ydCBFU0NBUEUgZnJvbSAnLi9lc2NhcGUtcGFyc2VyLmpzJ1xuXG5jb25zdCB0eXBlU3ltYm9scyA9ICc+IyVALi0rJy5zcGxpdCgnJylcbmNvbnN0IHJlc2VydmVkID0gJyRhdmF0YXIgJHBhcmVudCAka2V5ICRkYXRhICRlbGVtZW50ICRyZWZzICRtZXRob2RzICRtb3VudCAkdW1vdW50ICRzdWJzY3JpYmUgJHVuc3Vic2NyaWJlICR1cGRhdGUgJGRlc3Ryb3kgX19ESVJFQ1RNT1VOVF9fJy5zcGxpdCgnICcpXG5jb25zdCBtdXN0YWNoZSA9IC9cXHtcXHsuKz9cXH1cXH0vZ1xuY29uc3Qgc3BhY2VJbmRlbnQgPSAvXihcXHQqKSggKikuKi9cbmNvbnN0IGhhc2hyZWYgPSAvIyhbXn1dfH1bXn1dKSokL1xuXG5jb25zdCBnZXRFcnJvck1zZyA9IChtc2csIGxpbmUgPSAtMikgPT4gYEZhaWxlZCB0byBwYXJzZSBlZnQgdGVtcGxhdGU6ICR7bXNnfS4gYXQgbGluZSAke2xpbmUgKyAxfWBcblxuY29uc3QgaXNFbXB0eSA9IHN0cmluZyA9PiAhc3RyaW5nLnJlcGxhY2UoL1xccy8sICcnKVxuXG5jb25zdCBnZXRPZmZzZXQgPSAoc3RyaW5nLCBwYXJzaW5nSW5mbykgPT4ge1xuXHRpZiAocGFyc2luZ0luZm8ub2Zmc2V0ICE9PSBudWxsKSByZXR1cm5cblx0cGFyc2luZ0luZm8ub2Zmc2V0ID0gc3RyaW5nLm1hdGNoKC9cXHMqLylbMF1cblx0aWYgKHBhcnNpbmdJbmZvLm9mZnNldCkgcGFyc2luZ0luZm8ub2Zmc2V0UmVnID0gbmV3IFJlZ0V4cChgXiR7cGFyc2luZ0luZm8ub2Zmc2V0fWApXG59XG5cbmNvbnN0IHJlbW92ZU9mZnNldCA9IChzdHJpbmcsIHBhcnNpbmdJbmZvLCBpKSA9PiB7XG5cdGlmIChwYXJzaW5nSW5mby5vZmZzZXRSZWcpIHtcblx0XHRsZXQgcmVtb3ZlZCA9IGZhbHNlXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocGFyc2luZ0luZm8ub2Zmc2V0UmVnLCAoKSA9PiB7XG5cdFx0XHRyZW1vdmVkID0gdHJ1ZVxuXHRcdFx0cmV0dXJuICcnXG5cdFx0fSlcblx0XHRpZiAoIXJlbW92ZWQpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZyhgRXhwZWN0ZWQgaW5kZW50IHRvIGJlIGdyYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAke3BhcnNpbmdJbmZvLnByZXZEZXB0aCArIDF9LCBidXQgZ290IC0xYCwgaSkpXG5cdH1cblx0cmV0dXJuIHN0cmluZ1xufVxuXG5jb25zdCBnZXRJbmRlbnQgPSAoc3RyaW5nLCBwYXJzaW5nSW5mbykgPT4ge1xuXHRpZiAocGFyc2luZ0luZm8uaW5kZW50UmVnKSByZXR1cm5cblx0Y29uc3Qgc3BhY2VzID0gc3RyaW5nLm1hdGNoKHNwYWNlSW5kZW50KVsyXVxuXHRpZiAoc3BhY2VzKSB7XG5cdFx0cGFyc2luZ0luZm8uaW5kZW50UmVnID0gbmV3IFJlZ0V4cChzcGFjZXMsICdnJylcblx0fVxufVxuXG5jb25zdCBnZXREZXB0aCA9IChzdHJpbmcsIHBhcnNpbmdJbmZvLCBpKSA9PiB7XG5cdGxldCBkZXB0aCA9IDBcblx0aWYgKHBhcnNpbmdJbmZvLmluZGVudFJlZykgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL15cXHMqLywgc3RyID0+IHN0ci5yZXBsYWNlKHBhcnNpbmdJbmZvLmluZGVudFJlZywgJ1xcdCcpKVxuXHRjb25zdCBjb250ZW50ID0gc3RyaW5nLnJlcGxhY2UoL15cXHQqLywgKHN0cikgPT4ge1xuXHRcdGRlcHRoID0gc3RyLmxlbmd0aFxuXHRcdHJldHVybiAnJ1xuXHR9KVxuXHRpZiAoL15cXHMvLnRlc3QoY29udGVudCkpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZygnQmFkIGluZGVudCcsIGkpKVxuXHRyZXR1cm4geyBkZXB0aCwgY29udGVudCB9XG59XG5cbmNvbnN0IHJlc29sdmVEZXB0aCA9IChhc3QsIGRlcHRoKSA9PiB7XG5cdGxldCBjdXJyZW50Tm9kZSA9IGFzdFxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGVbY3VycmVudE5vZGUubGVuZ3RoIC0gMV1cblx0cmV0dXJuIGN1cnJlbnROb2RlXG59XG5cbmNvbnN0IHNwbGl0RGVmYXVsdCA9IChzdHJpbmcpID0+IHtcblx0c3RyaW5nID0gc3RyaW5nLnNsaWNlKDIsIHN0cmluZy5sZW5ndGggLSAyKVxuXHRjb25zdCBbX3BhdGgsIC4uLl9kZWZhdWx0XSA9IHN0cmluZy5zcGxpdCgnPScpXG5cdGNvbnN0IHBhdGhBcnIgPSBfcGF0aC50cmltKCkuc3BsaXQoJy4nKVxuXHRjb25zdCBkZWZhdWx0VmFsID0gRVNDQVBFKF9kZWZhdWx0LmpvaW4oJz0nKS50cmltKCkpXG5cdGlmIChkZWZhdWx0VmFsKSByZXR1cm4gW3BhdGhBcnIsIGRlZmF1bHRWYWxdXG5cdHJldHVybiBbcGF0aEFycl1cbn1cblxuY29uc3Qgc3BsaXRMaXRlcmFscyA9IChzdHJpbmcpID0+IHtcblx0Y29uc3Qgc3RycyA9IHN0cmluZy5zcGxpdChtdXN0YWNoZSlcblx0aWYgKHN0cnMubGVuZ3RoID09PSAxKSByZXR1cm4gRVNDQVBFKHN0cmluZylcblx0Y29uc3QgdG1wbCA9IFtdXG5cdGlmIChzdHJzLmxlbmd0aCA9PT0gMiAmJiAhc3Ryc1swXSAmJiAhc3Ryc1sxXSkgdG1wbC5wdXNoKDApXG5cdGVsc2UgdG1wbC5wdXNoKHN0cnMubWFwKEVTQ0FQRSkpXG5cdGNvbnN0IG11c3RhY2hlcyA9IHN0cmluZy5tYXRjaChtdXN0YWNoZSlcblx0aWYgKG11c3RhY2hlcykgdG1wbC5wdXNoKC4uLm11c3RhY2hlcy5tYXAoc3BsaXREZWZhdWx0KSlcblx0cmV0dXJuIHRtcGxcbn1cblxuY29uc3QgcHVzaFN0ciA9ICh0ZXh0QXJyLCBzdHIpID0+IHtcblx0aWYgKHN0cikgdGV4dEFyci5wdXNoKHN0cilcbn1cblxuY29uc3QgcGFyc2VUZXh0ID0gKHN0cmluZykgPT4ge1xuXHRjb25zdCByZXN1bHQgPSBzcGxpdExpdGVyYWxzKHN0cmluZylcblx0aWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSByZXR1cm4gW3Jlc3VsdF1cblx0Y29uc3QgW3N0cnMsIC4uLmV4cHJzXSA9IHJlc3VsdFxuXHRjb25zdCB0ZXh0QXJyID0gW11cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBleHBycy5sZW5ndGg7IGkrKykge1xuXHRcdHB1c2hTdHIodGV4dEFyciwgc3Ryc1tpXSlcblx0XHR0ZXh0QXJyLnB1c2goZXhwcnNbaV0pXG5cdH1cblx0cHVzaFN0cih0ZXh0QXJyLCBzdHJzW3N0cnMubGVuZ3RoIC0gMV0pXG5cdHJldHVybiB0ZXh0QXJyXG59XG5cbmNvbnN0IGRvdFRvU3BhY2UgPSB2YWwgPT4gdmFsLnJlcGxhY2UoL1xcLi9nLCAnICcpXG5cbmNvbnN0IHBhcnNlVGFnID0gKHN0cmluZykgPT4ge1xuXHRjb25zdCB0YWdJbmZvID0ge31cblx0Y29uc3QgW3RhZywgLi4uY29udGVudF0gPSBzdHJpbmcucmVwbGFjZShoYXNocmVmLCAodmFsKSA9PiB7XG5cdFx0dGFnSW5mby5yZWYgPSB2YWwuc2xpY2UoMSlcblx0XHRyZXR1cm4gJydcblx0fSkuc3BsaXQoJy4nKVxuXHR0YWdJbmZvLnRhZyA9IHRhZ1xuXHR0YWdJbmZvLmNsYXNzID0gc3BsaXRMaXRlcmFscyhjb250ZW50LmpvaW4oJy4nKSlcblx0aWYgKHR5cGVvZiB0YWdJbmZvLmNsYXNzID09PSAnc3RyaW5nJykgdGFnSW5mby5jbGFzcyA9IGRvdFRvU3BhY2UodGFnSW5mby5jbGFzcykudHJpbSgpXG5cdGVsc2UgaWYgKHRhZ0luZm8uY2xhc3NbMF0pIHRhZ0luZm8uY2xhc3NbMF0gPSB0YWdJbmZvLmNsYXNzWzBdLm1hcChkb3RUb1NwYWNlKVxuXHRyZXR1cm4gdGFnSW5mb1xufVxuXG5jb25zdCBwYXJzZU5vZGVQcm9wcyA9IChzdHJpbmcpID0+IHtcblx0Y29uc3Qgc3BsaXRlZCA9IHN0cmluZy5zcGxpdCgnPScpXG5cdHJldHVybiB7XG5cdFx0bmFtZTogc3BsaXRlZC5zaGlmdCgpLnRyaW0oKSxcblx0XHR2YWx1ZTogc3BsaXRMaXRlcmFscyhzcGxpdGVkLmpvaW4oJz0nKS50cmltKCkpXG5cdH1cbn1cblxuY29uc3QgcGFyc2VFdmVudCA9IChzdHJpbmcpID0+IHtcblx0Y29uc3Qgc3BsaXRlZCA9IHN0cmluZy5zcGxpdCgnPScpXG5cdHJldHVybiB7XG5cdFx0bmFtZTogc3BsaXRlZC5zaGlmdCgpLnRyaW0oKSxcblx0XHR2YWx1ZTogc3BsaXRlZC5qb2luKCc9JykudHJpbSgpXG5cdH1cbn1cblxuY29uc3Qgc2V0T3B0aW9uID0gKG9wdGlvbnMsIG9wdGlvbikgPT4ge1xuXHRzd2l0Y2ggKG9wdGlvbikge1xuXHRcdGNhc2UgJ3N0b3AnOiB7XG5cdFx0XHRvcHRpb25zLnMgPSAxXG5cdFx0XHRicmVha1xuXHRcdH1cblx0XHRjYXNlICdzdG9wSW1tZWRpYXRlJzoge1xuXHRcdFx0b3B0aW9ucy5pID0gMVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSAncHJldmVudCc6IHtcblx0XHRcdG9wdGlvbnMucCA9IDFcblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGNhc2UgJ3NoaWZ0Jzoge1xuXHRcdFx0b3B0aW9ucy5oID0gMVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSAnYWx0Jzoge1xuXHRcdFx0b3B0aW9ucy5hID0gMVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSAnY3RybCc6IHtcblx0XHRcdG9wdGlvbnMuYyA9IDFcblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGNhc2UgJ21ldGEnOiB7XG5cdFx0XHRvcHRpb25zLnQgPSAxXG5cdFx0XHRicmVha1xuXHRcdH1cblx0XHRjYXNlICdjYXB0dXJlJzoge1xuXHRcdFx0b3B0aW9ucy51ID0gMVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0Y29uc29sZS53YXJuKGBBYmFuZG9uZWQgdW5zdXBwb3J0ZWQgZXZlbnQgb3B0aW9uICcke29wdGlvbn0nLmApXG5cdFx0fVxuXHR9XG59XG5cbmNvbnN0IGdldE9wdGlvbiA9IChvcHRpb25zLCBrZXlzLCBvcHRpb24pID0+IHtcblx0Y29uc3Qga2V5Q29kZSA9IHBhcnNlSW50KG9wdGlvbiwgMTApXG5cdGlmIChpc05hTihrZXlDb2RlKSkgcmV0dXJuIHNldE9wdGlvbihvcHRpb25zLCBvcHRpb24pXG5cdGtleXMucHVzaChrZXlDb2RlKVxufVxuXG5jb25zdCBnZXRFdmVudE9wdGlvbnMgPSAobmFtZSkgPT4ge1xuXHRjb25zdCBvcHRpb25zID0ge31cblx0Y29uc3Qga2V5cyA9IFtdXG5cdGNvbnN0IFtsaXN0ZW5lciwgLi4ub3BzXSA9IG5hbWUuc3BsaXQoJy4nKVxuXHRvcHRpb25zLmwgPSBsaXN0ZW5lclxuXHRmb3IgKGxldCBpIG9mIG9wcykgZ2V0T3B0aW9uKG9wdGlvbnMsIGtleXMsIGkpXG5cdGlmIChrZXlzLmxlbmd0aCA+IDApIG9wdGlvbnMuayA9IGtleXNcblx0cmV0dXJuIG9wdGlvbnNcbn1cblxuY29uc3Qgc3BsaXRFdmVudHMgPSAoc3RyaW5nKSA9PiB7XG5cdGNvbnN0IFtuYW1lLCAuLi52YWx1ZV0gPSBzdHJpbmcuc3BsaXQoJzonKVxuXHRjb25zdCBjb250ZW50ID0gdmFsdWUuam9pbignOicpXG5cdGlmIChjb250ZW50KSByZXR1cm4gW25hbWUudHJpbSgpLCBzcGxpdExpdGVyYWxzKGNvbnRlbnQpXVxuXHRyZXR1cm4gW25hbWUudHJpbSgpXVxufVxuXG5jb25zdCBwYXJzZUxpbmUgPSAoe2xpbmUsIGFzdCwgcGFyc2luZ0luZm8sIGl9KSA9PiB7XG5cdGlmIChpc0VtcHR5KGxpbmUpKSByZXR1cm5cblx0Z2V0SW5kZW50KGxpbmUsIHBhcnNpbmdJbmZvKVxuXHRnZXRPZmZzZXQobGluZSwgcGFyc2luZ0luZm8pXG5cblx0bGV0IHsgZGVwdGgsIGNvbnRlbnQgfSA9IGdldERlcHRoKHJlbW92ZU9mZnNldChsaW5lLCBwYXJzaW5nSW5mbywgaSksIHBhcnNpbmdJbmZvLCBpKVxuXG5cdGlmIChjb250ZW50KSB7XG5cdFx0aWYgKGRlcHRoIDwgMCB8fCBkZXB0aCAtIHBhcnNpbmdJbmZvLnByZXZEZXB0aCA+IDEgfHwgKGRlcHRoIC0gcGFyc2luZ0luZm8ucHJldkRlcHRoID09PSAxICYmIFsnY29tbWVudCcsICd0YWcnXS5pbmRleE9mKHBhcnNpbmdJbmZvLnByZXZUeXBlKSA9PT0gLTEpIHx8IChwYXJzaW5nSW5mby5wcmV2VHlwZSAhPT0gJ2NvbW1lbnQnICYmIGRlcHRoID09PSAwICYmIHBhcnNpbmdJbmZvLnRvcEV4aXN0cykpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZyhgRXhwZWN0ZWQgaW5kZW50IHRvIGJlIGdyYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAke3BhcnNpbmdJbmZvLnByZXZEZXB0aCArIDF9LCBidXQgZ290ICR7ZGVwdGh9YCwgaSkpXG5cdFx0Y29uc3QgdHlwZSA9IGNvbnRlbnRbMF1cblx0XHRjb250ZW50ID0gY29udGVudC5zbGljZSgxKVxuXHRcdGlmICghcGFyc2luZ0luZm8udG9wRXhpc3RzICYmIHR5cGVTeW1ib2xzLmluZGV4T2YodHlwZSkgPj0gMCAmJiB0eXBlICE9PSAnPicpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZygnTm8gdG9wIGxldmVsIGVudHJ5JywgaSkpXG5cdFx0aWYgKCFjb250ZW50ICYmIHR5cGVTeW1ib2xzLmluZGV4T2YodHlwZSkgPj0gMCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGdldEVycm9yTXNnKCdFbXB0eSBjb250ZW50JywgaSkpXG5cdFx0Ly8gSnVtcCBiYWNrIHRvIHVwcGVyIGxldmVsXG5cdFx0aWYgKGRlcHRoIDwgcGFyc2luZ0luZm8ucHJldkRlcHRoIHx8IChkZXB0aCA9PT0gcGFyc2luZ0luZm8ucHJldkRlcHRoICYmIHBhcnNpbmdJbmZvLnByZXZUeXBlID09PSAndGFnJykpIHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlID0gcmVzb2x2ZURlcHRoKGFzdCwgZGVwdGgpXG5cdFx0cGFyc2luZ0luZm8ucHJldkRlcHRoID0gZGVwdGhcblxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSAnPic6IHtcblx0XHRcdFx0aWYgKCFwYXJzaW5nSW5mby50b3BFeGlzdHMpIHtcblx0XHRcdFx0XHRwYXJzaW5nSW5mby50b3BFeGlzdHMgPSB0cnVlXG5cdFx0XHRcdFx0cGFyc2luZ0luZm8ubWluRGVwdGggPSBkZXB0aFxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGluZm8gPSBwYXJzZVRhZyhjb250ZW50KVxuXHRcdFx0XHRjb25zdCBuZXdOb2RlID0gW3tcblx0XHRcdFx0XHR0OiBpbmZvLnRhZ1xuXHRcdFx0XHR9XVxuXHRcdFx0XHRpZiAoaW5mby5jbGFzcykge1xuXHRcdFx0XHRcdG5ld05vZGVbMF0uYSA9IHt9XG5cdFx0XHRcdFx0bmV3Tm9kZVswXS5hLmNsYXNzID0gaW5mby5jbGFzc1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpbmZvLnJlZikgbmV3Tm9kZVswXS5yID0gaW5mby5yZWZcblx0XHRcdFx0cGFyc2luZ0luZm8uY3VycmVudE5vZGUucHVzaChuZXdOb2RlKVxuXHRcdFx0XHRwYXJzaW5nSW5mby5jdXJyZW50Tm9kZSA9IG5ld05vZGVcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAndGFnJ1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSAnIyc6IHtcblx0XHRcdFx0Y29uc3QgeyBuYW1lLCB2YWx1ZSB9ID0gcGFyc2VOb2RlUHJvcHMoY29udGVudClcblx0XHRcdFx0aWYgKCFwYXJzaW5nSW5mby5jdXJyZW50Tm9kZVswXS5hKSBwYXJzaW5nSW5mby5jdXJyZW50Tm9kZVswXS5hID0ge31cblx0XHRcdFx0cGFyc2luZ0luZm8uY3VycmVudE5vZGVbMF0uYVtuYW1lXSA9IHZhbHVlXG5cdFx0XHRcdHBhcnNpbmdJbmZvLnByZXZUeXBlID0gJ2F0dHInXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlICclJzoge1xuXHRcdFx0XHRjb25zdCB7IG5hbWUsIHZhbHVlIH0gPSBwYXJzZU5vZGVQcm9wcyhjb250ZW50KVxuXHRcdFx0XHRpZiAoIXBhcnNpbmdJbmZvLmN1cnJlbnROb2RlWzBdLnApIHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlWzBdLnAgPSB7fVxuXHRcdFx0XHRwYXJzaW5nSW5mby5jdXJyZW50Tm9kZVswXS5wW25hbWVdID0gdmFsdWVcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAncHJvcCdcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgJ0AnOiB7XG5cdFx0XHRcdGNvbnN0IHsgbmFtZSwgdmFsdWUgfSA9IHBhcnNlRXZlbnQoY29udGVudClcblx0XHRcdFx0aWYgKCFwYXJzaW5nSW5mby5jdXJyZW50Tm9kZVswXS5lKSBwYXJzaW5nSW5mby5jdXJyZW50Tm9kZVswXS5lID0gW11cblx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IGdldEV2ZW50T3B0aW9ucyhuYW1lKVxuXHRcdFx0XHRjb25zdCBbbWV0aG9kLCBfdmFsdWVdID0gc3BsaXRFdmVudHModmFsdWUpXG5cdFx0XHRcdG9wdGlvbnMubSA9IG1ldGhvZFxuXHRcdFx0XHRpZiAoX3ZhbHVlKSBvcHRpb25zLnYgPSBfdmFsdWVcblx0XHRcdFx0cGFyc2luZ0luZm8uY3VycmVudE5vZGVbMF0uZS5wdXNoKG9wdGlvbnMpXG5cdFx0XHRcdHBhcnNpbmdJbmZvLnByZXZUeXBlID0gJ2V2ZW50J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSAnLic6IHtcblx0XHRcdFx0cGFyc2luZ0luZm8uY3VycmVudE5vZGUucHVzaCguLi5wYXJzZVRleHQoY29udGVudCkpXG5cdFx0XHRcdHBhcnNpbmdJbmZvLnByZXZUeXBlID0gJ3RleHQnXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlICctJzoge1xuXHRcdFx0XHRpZiAocmVzZXJ2ZWQuaW5kZXhPZihjb250ZW50KSAhPT0gLTEpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZyhgUmVzZXJ2ZWQgbmFtZSAnJHtjb250ZW50fScgc2hvdWxkIG5vdCBiZSB1c2VkYCwgaSkpXG5cdFx0XHRcdHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlLnB1c2goe1xuXHRcdFx0XHRcdG46IGNvbnRlbnQsXG5cdFx0XHRcdFx0dDogMFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRwYXJzaW5nSW5mby5wcmV2VHlwZSA9ICdub2RlJ1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSAnKyc6IHtcblx0XHRcdFx0cGFyc2luZ0luZm8uY3VycmVudE5vZGUucHVzaCh7XG5cdFx0XHRcdFx0bjogY29udGVudCxcblx0XHRcdFx0XHR0OiAxXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHBhcnNpbmdJbmZvLnByZXZUeXBlID0gJ2xpc3QnXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdHBhcnNpbmdJbmZvLnByZXZUeXBlID0gJ2NvbW1lbnQnXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmNvbnN0IHBhcnNlRWZ0ID0gKHRlbXBsYXRlKSA9PiB7XG5cdGlmICghdGVtcGxhdGUpIHRocm93IG5ldyBUeXBlRXJyb3IoZ2V0RXJyb3JNc2coJ1RlbXBsYXRlIHJlcXVpcmVkLCBidXQgbm90aGluZyBwcmVzZW50JykpXG5cdGNvbnN0IHRwbFR5cGUgPSB0eXBlb2YgdGVtcGxhdGVcblx0aWYgKHRwbFR5cGUgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKGdldEVycm9yTXNnKGBFeHBlY3RlZCBhIHN0cmluZywgYnV0IGdvdCBhKG4pICR7dHBsVHlwZX1gKSlcblx0Y29uc3QgbGluZXMgPSB0ZW1wbGF0ZS5zcGxpdCgvXFxyP1xcbi8pXG5cdGNvbnN0IGFzdCA9IFtdXG5cdGNvbnN0IHBhcnNpbmdJbmZvID0ge1xuXHRcdGluZGVudFJlZzogbnVsbCxcblx0XHRwcmV2RGVwdGg6IDAsXG5cdFx0b2Zmc2V0OiBudWxsLFxuXHRcdG9mZnNldFJlZzogbnVsbCxcblx0XHRwcmV2VHlwZTogJ2NvbW1lbnQnLFxuXHRcdGN1cnJlbnROb2RlOiBhc3QsXG5cdFx0dG9wRXhpc3RzOiBmYWxzZSxcblx0fVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSBwYXJzZUxpbmUoe2xpbmU6IGxpbmVzW2ldLCBhc3QsIHBhcnNpbmdJbmZvLCBpfSlcblxuXHRpZiAoYXN0WzBdKSByZXR1cm4gYXN0WzBdXG5cdHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZygnTm90aGluZyB0byBiZSBwYXJzZWQnLCBsaW5lcy5sZW5ndGggLSAxKSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VFZnRcbiIsImltcG9ydCBlZnRQYXJzZXIgZnJvbSAnZWZ0LXBhcnNlcidcblxuY29uc3QgcGFyc2UgPSAodGVtcGxhdGUsIHBhcnNlcikgPT4ge1xuXHRpZiAoIXBhcnNlcikgcGFyc2VyID0gZWZ0UGFyc2VyXG5cdHJldHVybiBwYXJzZXIodGVtcGxhdGUpXG59XG5cbmV4cG9ydCBkZWZhdWx0IHBhcnNlXG4iLCJjb25zdCBwcm90byA9IEFycmF5LnByb3RvdHlwZVxuXG5jb25zdCBBUlIgPSB7XG5cdGNvcHkoYXJyKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNsaWNlLmNhbGwoYXJyLCAwKVxuXHR9LFxuXHRlbXB0eShhcnIpIHtcblx0XHRhcnIubGVuZ3RoID0gMFxuXHRcdHJldHVybiBhcnJcblx0fSxcblx0ZXF1YWxzKGxlZnQsIHJpZ2h0KSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHJpZ2h0KSkgcmV0dXJuIGZhbHNlXG5cdFx0aWYgKGxlZnQgPT09IHJpZ2h0KSByZXR1cm4gdHJ1ZVxuXHRcdGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2Vcblx0XHRmb3IgKGxldCBpIGluIGxlZnQpIGlmIChsZWZ0W2ldICE9PSByaWdodFtpXSkgcmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIHRydWVcblx0fSxcblx0cG9wKGFycikge1xuXHRcdHJldHVybiBwcm90by5wb3AuY2FsbChhcnIpXG5cdH0sXG5cdHB1c2goYXJyLCAuLi5pdGVtcykge1xuXHRcdHJldHVybiBwcm90by5wdXNoLmFwcGx5KGFyciwgaXRlbXMpXG5cdH0sXG5cdHJlbW92ZShhcnIsIGl0ZW0pIHtcblx0XHRjb25zdCBpbmRleCA9IHByb3RvLmluZGV4T2YuY2FsbChhcnIsIGl0ZW0pXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHByb3RvLnNwbGljZS5jYWxsKGFyciwgaW5kZXgsIDEpXG5cdFx0XHRyZXR1cm4gaXRlbVxuXHRcdH1cblx0fSxcblx0cmV2ZXJzZShhcnIpIHtcblx0XHRyZXR1cm4gcHJvdG8ucmV2ZXJzZS5jYWxsKGFycilcblx0fSxcblx0cmlnaHRVbmlxdWUoYXJyKSB7XG5cdFx0Y29uc3QgbmV3QXJyID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0Zm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYXJyLmxlbmd0aDsgaisrKSBpZiAoYXJyW2ldID09PSBhcnJbal0pIGogPSBpICs9IDFcblx0XHRcdG5ld0Fyci5wdXNoKGFycltpXSlcblx0XHR9XG5cdFx0cmV0dXJuIG5ld0FyclxuXHR9LFxuXHRzaGlmdChhcnIpIHtcblx0XHRyZXR1cm4gcHJvdG8uc2hpZnQuY2FsbChhcnIpXG5cdH0sXG5cdHNsaWNlKGFyciwgaW5kZXgsIGxlbmd0aCkge1xuXHRcdHJldHVybiBwcm90by5zbGljZS5jYWxsKGFyciwgaW5kZXgsIGxlbmd0aClcblx0fSxcblx0c29ydChhcnIsIGZuKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNvcnQuY2FsbChhcnIsIGZuKVxuXHR9LFxuXHRzcGxpY2UoYXJyLCAuLi5hcmdzKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNwbGljZS5hcHBseShhcnIsIGFyZ3MpXG5cdH0sXG5cdHVuc2hpZnQoYXJyLCAuLi5pdGVtcykge1xuXHRcdHJldHVybiBwcm90by51bnNoaWZ0LmFwcGx5KGFyciwgaXRlbXMpXG5cdH1cbn1cblxuaWYgKHdpbmRvdy5TZXQpIEFSUi51bmlxdWUgPSBhcnIgPT4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpXG5lbHNlIEFSUi51bmlxdWUgPSBBUlIucmlnaHRVbmlxdWVcblxuZXhwb3J0IGRlZmF1bHQgQVJSXG4iLCJjb25zdCBtaXhTdHIgPSAoc3RycywgLi4uZXhwcnMpID0+IHtcblx0bGV0IHN0cmluZyA9ICcnXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgZXhwcnMubGVuZ3RoOyBpKyspIHN0cmluZyArPSAoc3Ryc1tpXSArIGV4cHJzW2ldKVxuXHRyZXR1cm4gc3RyaW5nICsgc3Ryc1tzdHJzLmxlbmd0aCAtIDFdXG59XG5cbmNvbnN0IGdldFZhbCA9ICh7ZGF0YU5vZGUsIF9rZXl9KSA9PiBkYXRhTm9kZVtfa2V5XVxuXG5jb25zdCBtaXhWYWwgPSAoc3RycywgLi4uZXhwcnMpID0+IHtcblx0aWYgKCFzdHJzKSByZXR1cm4gZ2V0VmFsKGV4cHJzWzBdKVxuXHRjb25zdCB0ZW1wbGF0ZSA9IFtzdHJzXVxuXHR0ZW1wbGF0ZS5wdXNoKC4uLmV4cHJzLm1hcChnZXRWYWwpKVxuXHRyZXR1cm4gbWl4U3RyKC4uLnRlbXBsYXRlKVxufVxuXG5leHBvcnQgeyBtaXhTdHIsIG1peFZhbCB9XG4iLCIvLyBFbm91Z2ggZm9yIGVmJ3MgdXNhZ2UsIHNvIG5vIG5lZWQgZm9yIGEgZnVsbCBwb2x5ZmlsbFxuY29uc3QgX2Fzc2lnbiA9IChlZSwgZXIpID0+IHtcblx0Zm9yIChsZXQgaSBpbiBlcikgZWVbaV0gPSBlcltpXVxuXHRyZXR1cm4gZWVcbn1cblxuY29uc3QgYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBfYXNzaWduXG5cbmV4cG9ydCB7IGFzc2lnbiB9XG4iLCJpbXBvcnQgQVJSIGZyb20gJy4vYXJyYXktaGVscGVyLmpzJ1xuXG5jb25zdCBxdWVyeSA9IFtdXG5jb25zdCBkb21RdWVyeSA9IFtdXG5sZXQgY291bnQgPSAwXG5cbmNvbnN0IHF1ZXVlID0gaGFuZGxlcnMgPT4gcXVlcnkucHVzaCguLi5oYW5kbGVycylcblxuY29uc3QgcXVldWVEb20gPSBoYW5kbGVyID0+IGRvbVF1ZXJ5LnB1c2goaGFuZGxlcilcblxuY29uc3QgaW5mb3JtID0gKCkgPT4ge1xuXHRjb3VudCArPSAxXG5cdHJldHVybiBjb3VudFxufVxuXG5jb25zdCBleGVjID0gKGltbWVkaWF0ZSkgPT4ge1xuXHRpZiAoIWltbWVkaWF0ZSAmJiAoY291bnQgLT0gMSkgPiAwKSByZXR1cm4gY291bnRcblx0Y291bnQgPSAwXG5cblx0aWYgKHF1ZXJ5Lmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCByZW5kZXJRdWVyeSA9IEFSUi51bmlxdWUocXVlcnkpXG5cdFx0aWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmluZm8oJ1tFRl0nLCBgJHtxdWVyeS5sZW5ndGh9IG1vZGlmaWNhdGlvbiBvcGVyYXRpb25zIGNhY2hlZCwgJHtyZW5kZXJRdWVyeS5sZW5ndGh9IGV4ZWN1dGVkLmApXG5cdFx0Zm9yIChsZXQgaSBvZiByZW5kZXJRdWVyeSkgaSgpXG5cdFx0QVJSLmVtcHR5KHF1ZXJ5KVxuXHR9XG5cblx0aWYgKGRvbVF1ZXJ5Lmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBkb21SZW5kZXJRdWVyeSA9IEFSUi5yaWdodFVuaXF1ZShkb21RdWVyeSlcblx0XHRpZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuaW5mbygnW0VGXScsIGAke2RvbVF1ZXJ5Lmxlbmd0aH0gRE9NIG9wZXJhdGlvbnMgY2FjaGVkLCAke2RvbVJlbmRlclF1ZXJ5Lmxlbmd0aH0gZXhlY3V0ZWQuYClcblx0XHRmb3IgKGxldCBpIG9mIGRvbVJlbmRlclF1ZXJ5KSBpKClcblx0XHRBUlIuZW1wdHkoZG9tUXVlcnkpXG5cdH1cblx0cmV0dXJuIGNvdW50XG59XG5cbmV4cG9ydCB7IHF1ZXVlLCBxdWV1ZURvbSwgaW5mb3JtLCBleGVjIH1cbiIsImltcG9ydCB7IGFzc2lnbiB9IGZyb20gJy4vcG9seWZpbGxzLmpzJ1xuaW1wb3J0IHsgaW5mb3JtLCBleGVjIH0gZnJvbSAnLi9yZW5kZXItcXVlcnkuanMnXG5cbmNvbnN0IHJlc29sdmVBbGxQYXRoID0gKHtfcGF0aCwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KSA9PiB7XG5cdGZvciAobGV0IGkgb2YgX3BhdGgpIHtcblx0XHRpZiAoIWhhbmRsZXJzW2ldKSBoYW5kbGVyc1tpXSA9IHt9XG5cdFx0aWYgKCFzdWJzY3JpYmVyc1tpXSkgc3Vic2NyaWJlcnNbaV0gPSB7fVxuXHRcdGlmICghaW5uZXJEYXRhW2ldKSBpbm5lckRhdGFbaV0gPSB7fVxuXHRcdGhhbmRsZXJzID0gaGFuZGxlcnNbaV1cblx0XHRzdWJzY3JpYmVycyA9IHN1YnNjcmliZXJzW2ldXG5cdFx0aW5uZXJEYXRhID0gaW5uZXJEYXRhW2ldXG5cdH1cblx0cmV0dXJuIHtcblx0XHRoYW5kbGVyTm9kZTogaGFuZGxlcnMsXG5cdFx0c3Vic2NyaWJlck5vZGU6IHN1YnNjcmliZXJzLFxuXHRcdGRhdGFOb2RlOiBpbm5lckRhdGFcblx0fVxufVxuXG5jb25zdCByZXNvbHZlUmVhY3RpdmVQYXRoID0gKF9wYXRoLCBvYmosIGVudW1lKSA9PiB7XG5cdGZvciAobGV0IGkgb2YgX3BhdGgpIHtcblx0XHRpZiAoIW9ialtpXSkge1xuXHRcdFx0Y29uc3Qgbm9kZSA9IHt9XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBpLCB7XG5cdFx0XHRcdGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gbm9kZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQoZGF0YSkge1xuXHRcdFx0XHRcdGluZm9ybSgpXG5cdFx0XHRcdFx0YXNzaWduKG5vZGUsIGRhdGEpXG5cdFx0XHRcdFx0ZXhlYygpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogIWVudW1lLFxuXHRcdFx0XHRlbnVtZXJhYmxlOiBlbnVtZVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0b2JqID0gb2JqW2ldXG5cdH1cblx0cmV0dXJuIG9ialxufVxuXG5jb25zdCByZXNvbHZlID0gKHsgX3BhdGgsIF9rZXksIGRhdGEsIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgaW5uZXJEYXRhIH0pID0+IHtcblx0Y29uc3QgcGFyZW50Tm9kZSA9IHJlc29sdmVSZWFjdGl2ZVBhdGgoX3BhdGgsIGRhdGEsIHRydWUpXG5cdGNvbnN0IHtoYW5kbGVyTm9kZSwgc3Vic2NyaWJlck5vZGUsIGRhdGFOb2RlfSA9IHJlc29sdmVBbGxQYXRoKHtfcGF0aCwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KVxuXHRpZiAoIWhhbmRsZXJOb2RlW19rZXldKSBoYW5kbGVyTm9kZVtfa2V5XSA9IFtdXG5cdGlmICghc3Vic2NyaWJlck5vZGVbX2tleV0pIHN1YnNjcmliZXJOb2RlW19rZXldID0gW11cblx0aWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YU5vZGUsIF9rZXkpKSBkYXRhTm9kZVtfa2V5XSA9ICcnXG5cdHJldHVybiB7IHBhcmVudE5vZGUsIGhhbmRsZXJOb2RlOiBoYW5kbGVyTm9kZVtfa2V5XSwgc3Vic2NyaWJlck5vZGU6IHN1YnNjcmliZXJOb2RlW19rZXldLCBkYXRhTm9kZSB9XG59XG5cbmNvbnN0IHJlc29sdmVTdWJzY3JpYmVyID0gKF9wYXRoLCBzdWJzY3JpYmVycykgPT4ge1xuXHRjb25zdCBwYXRoQXJyID0gX3BhdGguc3BsaXQoJy4nKVxuXHRjb25zdCBrZXkgPSBwYXRoQXJyLnBvcCgpXG5cdGZvciAobGV0IGkgb2YgcGF0aEFycikge1xuXHRcdGlmICghc3Vic2NyaWJlcnNbaV0pIHN1YnNjcmliZXJzW2ldID0ge31cblx0XHRzdWJzY3JpYmVycyA9IHN1YnNjcmliZXJzW2ldXG5cdH1cblx0cmV0dXJuIHN1YnNjcmliZXJzW2tleV1cbn1cblxuZXhwb3J0IHsgcmVzb2x2ZVJlYWN0aXZlUGF0aCwgcmVzb2x2ZSwgcmVzb2x2ZVN1YnNjcmliZXIgfVxuIiwiaW1wb3J0IEFSUiBmcm9tICcuL2FycmF5LWhlbHBlci5qcydcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICcuL3Jlc29sdmVyLmpzJ1xuaW1wb3J0IHsgcXVldWUsIGluZm9ybSwgZXhlYyB9IGZyb20gJy4vcmVuZGVyLXF1ZXJ5LmpzJ1xuXG5jb25zdCBpbml0RGF0YU5vZGUgPSAoe3BhcmVudE5vZGUsIGRhdGFOb2RlLCBoYW5kbGVyTm9kZSwgc3Vic2NyaWJlck5vZGUsIHN0YXRlLCBfa2V5fSkgPT4ge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkocGFyZW50Tm9kZSwgX2tleSwge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBkYXRhTm9kZVtfa2V5XVxuXHRcdH0sXG5cdFx0c2V0KHZhbHVlKSB7XG5cdFx0XHRpZiAoZGF0YU5vZGVbX2tleV0gPT09IHZhbHVlKSByZXR1cm5cblx0XHRcdGRhdGFOb2RlW19rZXldID0gdmFsdWVcblx0XHRcdHF1ZXVlKGhhbmRsZXJOb2RlKVxuXHRcdFx0aW5mb3JtKClcblx0XHRcdGZvciAobGV0IGogb2Ygc3Vic2NyaWJlck5vZGUpIGooe3N0YXRlLCB2YWx1ZX0pXG5cdFx0XHRleGVjKClcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSlcbn1cblxuY29uc3QgaW5pdEJpbmRpbmcgPSAoe2JpbmQsIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YX0pID0+IHtcblx0Y29uc3QgX3BhdGggPSBBUlIuY29weShiaW5kWzBdKVxuXHRjb25zdCBfZGVmYXVsdCA9IGJpbmRbMV1cblx0Y29uc3QgX2tleSA9IF9wYXRoLnBvcCgpXG5cdGNvbnN0IHsgcGFyZW50Tm9kZSwgaGFuZGxlck5vZGUsIHN1YnNjcmliZXJOb2RlLCBkYXRhTm9kZSB9ID0gcmVzb2x2ZSh7XG5cdFx0X3BhdGgsXG5cdFx0X2tleSxcblx0XHRkYXRhOiBzdGF0ZS4kZGF0YSxcblx0XHRoYW5kbGVycyxcblx0XHRzdWJzY3JpYmVycyxcblx0XHRpbm5lckRhdGFcblx0fSlcblxuXHQvLyBJbml0bGl6ZSBkYXRhIGJpbmRpbmcgbm9kZSBpZiBub3QgZXhpc3Rcblx0aWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocGFyZW50Tm9kZSwgX2tleSkpIGluaXREYXRhTm9kZSh7cGFyZW50Tm9kZSwgZGF0YU5vZGUsIGhhbmRsZXJOb2RlLCBzdWJzY3JpYmVyTm9kZSwgc3RhdGUsIF9rZXl9KVxuXHQvLyBVcGRhdGUgZGVmYXVsdCB2YWx1ZVxuXHRpZiAoX2RlZmF1bHQpIHBhcmVudE5vZGVbX2tleV0gPSBfZGVmYXVsdFxuXG5cdHJldHVybiB7ZGF0YU5vZGUsIGhhbmRsZXJOb2RlLCBzdWJzY3JpYmVyTm9kZSwgX2tleX1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5pdEJpbmRpbmdcbiIsImltcG9ydCBBUlIgZnJvbSAnLi9hcnJheS1oZWxwZXIuanMnXG5pbXBvcnQgeyBtaXhWYWwgfSBmcm9tICcuL2xpdGVyYWxzLW1peC5qcydcbmltcG9ydCBpbml0QmluZGluZyBmcm9tICcuL2JpbmRpbmcuanMnXG5pbXBvcnQgeyBxdWV1ZSwgaW5mb3JtLCBleGVjIH0gZnJvbSAnLi9yZW5kZXItcXVlcnkuanMnXG5cbmNvbnN0IGdldEVsZW1lbnQgPSAodGFnLCByZWYsIHJlZnMpID0+IHtcblx0Y29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKVxuXHRpZiAocmVmKSBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVmcywgcmVmLCB7XG5cdFx0dmFsdWU6IGVsZW1lbnQsXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KVxuXHRyZXR1cm4gZWxlbWVudFxufVxuXG5jb25zdCByZWdUbXBsID0gKHt2YWwsIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YSwgaGFuZGxlcn0pID0+IHtcblx0aWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuXHRcdGNvbnN0IFtzdHJzLCAuLi5leHByc10gPSB2YWxcblx0XHRjb25zdCB0bXBsID0gW3N0cnNdXG5cdFx0Y29uc3QgX2hhbmRsZXIgPSAoKSA9PiBoYW5kbGVyKG1peFZhbCguLi50bXBsKSlcblx0XHR0bXBsLnB1c2goLi4uZXhwcnMubWFwKChpdGVtKSA9PiB7XG5cdFx0XHRjb25zdCB7ZGF0YU5vZGUsIGhhbmRsZXJOb2RlLCBfa2V5fSA9IGluaXRCaW5kaW5nKHtiaW5kOiBpdGVtLCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KVxuXHRcdFx0aGFuZGxlck5vZGUucHVzaChfaGFuZGxlcilcblx0XHRcdHJldHVybiB7ZGF0YU5vZGUsIF9rZXl9XG5cdFx0fSkpXG5cdFx0cmV0dXJuIF9oYW5kbGVyXG5cdH1cblx0cmV0dXJuICgpID0+IHZhbFxufVxuXG5jb25zdCB1cGRhdGVPdGhlcnMgPSAoe2RhdGFOb2RlLCBoYW5kbGVyTm9kZSwgc3Vic2NyaWJlck5vZGUsIF9oYW5kbGVyLCBzdGF0ZSwgX2tleSwgdmFsdWV9KSA9PiB7XG5cdGlmIChkYXRhTm9kZVtfa2V5XSA9PT0gdmFsdWUpIHJldHVyblxuXHRkYXRhTm9kZVtfa2V5XSA9IHZhbHVlXG5cdGNvbnN0IHF1ZXJ5ID0gQVJSLmNvcHkoaGFuZGxlck5vZGUpXG5cdEFSUi5yZW1vdmUocXVlcnksIF9oYW5kbGVyKVxuXHRxdWV1ZShxdWVyeSlcblx0aW5mb3JtKClcblx0Zm9yIChsZXQgaSBvZiBzdWJzY3JpYmVyTm9kZSkgaSh7c3RhdGUsIHZhbHVlfSlcblx0ZXhlYygpXG59XG5cbmNvbnN0IGFkZFZhbExpc3RlbmVyID0gKHtfaGFuZGxlciwgc3RhdGUsIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgaW5uZXJEYXRhLCBlbGVtZW50LCBrZXksIGV4cHJ9KSA9PiB7XG5cdGNvbnN0IHtkYXRhTm9kZSwgaGFuZGxlck5vZGUsIHN1YnNjcmliZXJOb2RlLCBfa2V5fSA9IGluaXRCaW5kaW5nKHtiaW5kOiBleHByLCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KVxuXHRjb25zdCBfdXBkYXRlID0gKCkgPT4gdXBkYXRlT3RoZXJzKHtkYXRhTm9kZSwgaGFuZGxlck5vZGUsIHN1YnNjcmliZXJOb2RlLCBfaGFuZGxlciwgc3RhdGUsIF9rZXksIHZhbHVlOiBlbGVtZW50LnZhbHVlfSlcblx0aWYgKGtleSA9PT0gJ3ZhbHVlJykge1xuXHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBfdXBkYXRlLCB0cnVlKVxuXHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBfdXBkYXRlLCB0cnVlKVxuXHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgX3VwZGF0ZSwgdHJ1ZSlcblx0fSBlbHNlIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gdXBkYXRlT3RoZXJzKHtkYXRhTm9kZSwgaGFuZGxlck5vZGUsIHN1YnNjcmliZXJOb2RlLCBfaGFuZGxlciwgc3RhdGUsIF9rZXksIHZhbHVlOiBlbGVtZW50LmNoZWNrZWR9KSwgdHJ1ZSlcbn1cblxuY29uc3QgZ2V0QXR0ckhhbmRsZXIgPSAoZWxlbWVudCwga2V5KSA9PiB7XG5cdGlmIChrZXkgPT09ICdjbGFzcycpIHJldHVybiAodmFsKSA9PiB7XG5cdFx0dmFsID0gdmFsLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcblx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbClcblx0fVxuXHRyZXR1cm4gdmFsID0+IGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsKVxufVxuXG5jb25zdCBhZGRBdHRyID0gKHtlbGVtZW50LCBhdHRyLCBrZXksIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YX0pID0+IHtcblx0aWYgKHR5cGVvZiBhdHRyID09PSAnc3RyaW5nJykgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyKVxuXHRlbHNlIHtcblx0XHRjb25zdCBoYW5kbGVyID0gZ2V0QXR0ckhhbmRsZXIoZWxlbWVudCwga2V5KVxuXHRcdHF1ZXVlKFtyZWdUbXBsKHt2YWw6IGF0dHIsIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YSwgaGFuZGxlcn0pXSlcblx0fVxufVxuXG5jb25zdCBhZGRQcm9wID0gKHtlbGVtZW50LCBwcm9wLCBrZXksIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YX0pID0+IHtcblx0aWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykgZWxlbWVudFtrZXldID0gcHJvcFxuXHRlbHNlIHtcblx0XHRjb25zdCBoYW5kbGVyID0gKHZhbCkgPT4ge1xuXHRcdFx0ZWxlbWVudFtrZXldID0gdmFsXG5cdFx0fVxuXHRcdGNvbnN0IF9oYW5kbGVyID0gcmVnVG1wbCh7dmFsOiBwcm9wLCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGEsIGhhbmRsZXJ9KVxuXHRcdGlmICgoa2V5ID09PSAndmFsdWUnIHx8XG5cdFx0XHRrZXkgPT09ICdjaGVja2VkJykgJiZcblx0XHRcdCFwcm9wWzBdKSBhZGRWYWxMaXN0ZW5lcih7X2hhbmRsZXIsIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YSwgZWxlbWVudCwga2V5LCBleHByOiBwcm9wWzFdfSlcblx0XHRxdWV1ZShbX2hhbmRsZXJdKVxuXHR9XG59XG5cblxuY29uc3QgcmF3SGFuZGxlciA9IHZhbCA9PiB2YWxcblxuY29uc3QgYWRkRXZlbnQgPSAoe2VsZW1lbnQsIGV2ZW50LCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KSA9PiB7XG5cblx0LyoqXG5cdCAqICBsOiBsaXN0ZW5lclx0XHRcdFx0XHRcdFx0XHRcdDogc3RyaW5nXG5cdCAqICBtOiBtZXRob2QgICAgICAgICAgICAgICAgICAgOiBzdHJpbmdcblx0ICogIHM6IHN0b3BQcm9wYWdhdGlvbiAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIGk6IHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiA6IG51bWJlci91bmRlZmluZWRcblx0ICogIHA6IHByZXZlbnREZWZhdWx0ICAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIGg6IHNoaWZ0S2V5ICAgICAgICAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIGE6IGFsdEtleSAgICAgICAgICAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIGM6IGN0cmxLZXkgICAgICAgICAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIHQ6IG1ldGFLZXkgICAgICAgICAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIHU6IGNhcHR1cmUgICAgICAgICAgICAgICAgICA6IG51bWJlci91bmRlZmluZWRcblx0ICogIGs6IGtleUNvZGVzICAgICAgICAgICAgICAgICA6IGFycmF5L3VuZGVmaW5lZFxuXHQgKiAgdjogdmFsdWUgICAgICAgICAgICAgICAgICAgIDogc3RyaW5nL2FycmF5L3VuZGVmaW5lZFxuXHQgKi9cblx0Y29uc3Qge2wsIG0sIHMsIGksIHAsIGgsIGEsIGMsIHQsIHUsIGssIHZ9ID0gZXZlbnRcblx0Y29uc3QgX2hhbmRsZXIgPSByZWdUbXBsKHt2YWw6IHYsIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YSwgaGFuZGxlcjogcmF3SGFuZGxlcn0pXG5cdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihsLCAoZSkgPT4ge1xuXHRcdGlmICghIWggIT09ICEhZS5zaGlmdEtleSB8fFxuXHRcdFx0ISFhICE9PSAhIWUuYWx0S2V5IHx8XG5cdFx0XHQhIWMgIT09ICEhZS5jdHJsS2V5IHx8XG5cdFx0XHQhIXQgIT09ICEhZS5tZXRhS2V5IHx8XG5cdFx0XHQoayAmJiBrLmluZGV4T2YoZS53aGljaCkgPT09IC0xKSkgcmV0dXJuXG5cdFx0aWYgKHMpIGUuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiAoaSkgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuXHRcdGlmIChwKSBlLnByZXZlbnREZWZhdWx0KClcblx0XHRpZiAoc3RhdGUuJG1ldGhvZHNbbV0pIHN0YXRlLiRtZXRob2RzW21dKHtlLCB2YWx1ZTogX2hhbmRsZXIoKSwgc3RhdGV9KVxuXHRcdGVsc2UgaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLndhcm4oJ1tFRl0nLCBgTWV0aG9kIG5hbWVkICcke219JyBub3QgZm91bmQhYClcblx0fSwgISF1KVxufVxuXG5jb25zdCBjcmVhdGVFbGVtZW50ID0gKHtpbmZvLCBzdGF0ZSwgaW5uZXJEYXRhLCByZWZzLCBoYW5kbGVycywgc3Vic2NyaWJlcnN9KSA9PiB7XG5cblx0LyoqXG5cdCAqICB0OiB0YWcgICAgICAgOiBzdHJpbmdcblx0ICogIGE6IGF0dHIgICAgICA6IG9iamVjdFxuXHQgKiAgcDogcHJvcCAgICAgIDogb2JqZWN0XG5cdCAqICBlOiBldmVudCAgICAgOiBhcnJheVxuXHQgKiAgcjogcmVmZXJlbmNlIDogc3RyaW5nXG5cdCAqL1xuXHRjb25zdCB7dCwgYSwgcCwgZSwgcn0gPSBpbmZvXG5cdGNvbnN0IGVsZW1lbnQgPSBnZXRFbGVtZW50KHQsIHIsIHJlZnMpXG5cdGZvciAobGV0IGkgaW4gYSkgYWRkQXR0cih7ZWxlbWVudCwgYXR0cjogYVtpXSwga2V5OiBpLCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KVxuXHRmb3IgKGxldCBpIGluIHApIGFkZFByb3Aoe2VsZW1lbnQsIHByb3A6IHBbaV0sIGtleTogaSwgc3RhdGUsIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgaW5uZXJEYXRhfSlcblx0Zm9yIChsZXQgaSBpbiBlKSBhZGRFdmVudCh7ZWxlbWVudCwgZXZlbnQ6IGVbaV0sIHN0YXRlLCBoYW5kbGVycywgc3Vic2NyaWJlcnMsIGlubmVyRGF0YX0pXG5cdHJldHVybiBlbGVtZW50XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUVsZW1lbnRcbiIsImNvbnN0IHByb3RvID0gTm9kZS5wcm90b3R5cGVcbi8vIGNvbnN0IHNhZmVab25lID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbmNvbnN0IERPTSA9IHtcblx0Ly8gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG5cdC8vIFx0Y29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgnICcpXG5cdC8vIFx0bm9kZS5jbGFzc0xpc3QuYWRkKC4uLmNsYXNzZXMpXG5cdC8vIH0sXG5cblx0Ly8gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG5cdC8vIFx0Y29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgnICcpXG5cdC8vIFx0bm9kZS5jbGFzc0xpc3QucmVtb3ZlKC4uLmNsYXNzZXMpXG5cdC8vIH0sXG5cblx0Ly8gdG9nZ2xlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSB7XG5cdC8vIFx0Y29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgnICcpXG5cdC8vIFx0Y29uc3QgY2xhc3NBcnIgPSBub2RlLmNsYXNzTmFtZS5zcGxpdCgnICcpXG5cdC8vIFx0Zm9yIChsZXQgaSBvZiBjbGFzc2VzKSB7XG5cdC8vIFx0XHRjb25zdCBjbGFzc0luZGV4ID0gY2xhc3NBcnIuaW5kZXhPZihpKVxuXHQvLyBcdFx0aWYgKGNsYXNzSW5kZXggPiAtMSkge1xuXHQvLyBcdFx0XHRjbGFzc0Fyci5zcGxpY2UoY2xhc3NJbmRleCwgMSlcblx0Ly8gXHRcdH0gZWxzZSB7XG5cdC8vIFx0XHRcdGNsYXNzQXJyLnB1c2goaSlcblx0Ly8gXHRcdH1cblx0Ly8gXHR9XG5cdC8vIFx0bm9kZS5jbGFzc05hbWUgPSBjbGFzc0Fyci5qb2luKCcgJykudHJpbSgpXG5cdC8vIH0sXG5cblx0Ly8gcmVwbGFjZVdpdGgobm9kZSwgbmV3Tm9kZSkge1xuXHQvLyBcdGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZVxuXHQvLyBcdGlmIChwYXJlbnQpIHByb3RvLnJlcGxhY2VDaGlsZC5jYWxsKHBhcmVudCwgbmV3Tm9kZSwgbm9kZSlcblx0Ly8gfSxcblxuXHQvLyBzd2FwKG5vZGUsIG5ld05vZGUpIHtcblx0Ly8gXHRjb25zdCBub2RlUGFyZW50ID0gbm9kZS5wYXJlbnROb2RlXG5cdC8vIFx0Y29uc3QgbmV3Tm9kZVBhcmVudCA9IG5ld05vZGUucGFyZW50Tm9kZVxuXHQvLyBcdGNvbnN0IG5vZGVTaWJsaW5nID0gbm9kZS5uZXh0U2libGluZ1xuXHQvLyBcdGNvbnN0IG5ld05vZGVTaWJsaW5nID0gbmV3Tm9kZS5uZXh0U2libGluZ1xuXHQvLyBcdGlmIChub2RlUGFyZW50ICYmIG5ld05vZGVQYXJlbnQpIHtcblx0Ly8gXHRcdHByb3RvLmluc2VydEJlZm9yZS5jYWxsKG5vZGVQYXJlbnQsIG5ld05vZGUsIG5vZGVTaWJsaW5nKVxuXHQvLyBcdFx0cHJvdG8uaW5zZXJ0QmVmb3JlLmNhbGwobmV3Tm9kZVBhcmVudCwgbm9kZSwgbmV3Tm9kZVNpYmxpbmcpXG5cdC8vIFx0fVxuXHQvLyB9LFxuXG5cdGJlZm9yZShub2RlLCAuLi5ub2Rlcykge1xuXHRcdGNvbnN0IHRlbXBGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdG5vZGVzLnJldmVyc2UoKVxuXHRcdGZvciAobGV0IGkgb2Ygbm9kZXMpIHByb3RvLmFwcGVuZENoaWxkLmNhbGwodGVtcEZyYWdtZW50LCBpKVxuXHRcdHByb3RvLmluc2VydEJlZm9yZS5jYWxsKG5vZGUucGFyZW50Tm9kZSwgdGVtcEZyYWdtZW50LCBub2RlKVxuXHR9LFxuXG5cdGFmdGVyKG5vZGUsIC4uLm5vZGVzKSB7XG5cdFx0Y29uc3QgdGVtcEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0Zm9yIChsZXQgaSBvZiBub2RlcykgcHJvdG8uYXBwZW5kQ2hpbGQuY2FsbCh0ZW1wRnJhZ21lbnQsIGkpXG5cdFx0aWYgKG5vZGUubmV4dFNpYmxpbmcpIHByb3RvLmluc2VydEJlZm9yZS5jYWxsKG5vZGUucGFyZW50Tm9kZSwgdGVtcEZyYWdtZW50LCBub2RlLm5leHRTaWJsaW5nKVxuXHRcdGVsc2UgcHJvdG8uYXBwZW5kQ2hpbGQuY2FsbChub2RlLnBhcmVudE5vZGUsIHRlbXBGcmFnbWVudClcblx0fSxcblxuXHRhcHBlbmQobm9kZSwgLi4ubm9kZXMpIHtcblx0XHRpZiAoWzEsOSwxMV0uaW5kZXhPZihub2RlLm5vZGVUeXBlKSA9PT0gLTEpIHJldHVyblxuXHRcdGNvbnN0IHRlbXBGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdGZvciAobGV0IGkgb2Ygbm9kZXMpIHByb3RvLmFwcGVuZENoaWxkLmNhbGwodGVtcEZyYWdtZW50LCBpKVxuXHRcdHByb3RvLmFwcGVuZENoaWxkLmNhbGwobm9kZSwgdGVtcEZyYWdtZW50KVxuXHR9LFxuXG5cdC8vIHByZXBlbmQobm9kZSwgLi4ubm9kZXMpIHtcblx0Ly8gXHRpZiAoWzEsOSwxMV0uaW5kZXhPZihub2RlLm5vZGVUeXBlKSA9PT0gLTEpIHtcblx0Ly8gXHRcdHJldHVyblxuXHQvLyBcdH1cblx0Ly8gXHRjb25zdCB0ZW1wRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0Ly8gXHRub2Rlcy5yZXZlcnNlKClcblx0Ly8gXHRmb3IgKGxldCBpIG9mIG5vZGVzKSB7XG5cdC8vIFx0XHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKHRlbXBGcmFnbWVudCwgaSlcblx0Ly8gXHR9XG5cdC8vIFx0aWYgKG5vZGUuZmlyc3RDaGlsZCkge1xuXHQvLyBcdFx0cHJvdG8uaW5zZXJ0QmVmb3JlLmNhbGwobm9kZSwgdGVtcEZyYWdtZW50LCBub2RlLmZpcnN0Q2hpbGQpXG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdHByb3RvLmFwcGVuZENoaWxkLmNhbGwobm9kZSwgdGVtcEZyYWdtZW50KVxuXHQvLyBcdH1cblx0Ly8gfSxcblxuXHQvLyBhcHBlbmRUbyhub2RlLCBuZXdOb2RlKSB7XG5cdC8vIFx0cHJvdG8uYXBwZW5kQ2hpbGQuY2FsbChuZXdOb2RlLCBub2RlKVxuXHQvLyB9LFxuXG5cdC8vIHByZXBlbmRUbyhub2RlLCBuZXdOb2RlKSB7XG5cdC8vIFx0aWYgKG5ld05vZGUuZmlyc3RDaGlsZCkge1xuXHQvLyBcdFx0cHJvdG8uaW5zZXJ0QmVmb3JlLmNhbGwobmV3Tm9kZSwgbm9kZSwgbm9kZS5maXJzdENoaWxkKVxuXHQvLyBcdH0gZWxzZSB7XG5cdC8vIFx0XHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKG5ld05vZGUsIG5vZGUpXG5cdC8vIFx0fVxuXHQvLyB9LFxuXG5cdC8vIGVtcHR5KG5vZGUpIHtcblx0Ly8gXHRub2RlLmlubmVySFRNTCA9ICcnXG5cdC8vIH0sXG5cblx0cmVtb3ZlKG5vZGUpIHtcblx0XHRwcm90by5yZW1vdmVDaGlsZC5jYWxsKG5vZGUucGFyZW50Tm9kZSwgbm9kZSlcblx0fSxcblxuXHQvLyBzYWZlUmVtb3ZlKG5vZGUpIHtcblx0Ly8gXHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKHNhZmVab25lLCBub2RlKVxuXHQvLyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERPTVxuIiwiaW1wb3J0IERPTSBmcm9tICcuL2RvbS1oZWxwZXIuanMnXG5pbXBvcnQgQVJSIGZyb20gJy4vYXJyYXktaGVscGVyLmpzJ1xuaW1wb3J0IHsgaW5mb3JtLCBleGVjIH0gZnJvbSAnLi9yZW5kZXItcXVlcnkuanMnXG5cbmNvbnN0IERPTUFSUiA9IHtcblx0ZW1wdHkoKSB7XG5cdFx0aW5mb3JtKClcblx0XHRmb3IgKGxldCBpIG9mIEFSUi5jb3B5KHRoaXMpKSBpLiRkZXN0cm95KClcblx0XHRleGVjKClcblx0XHRBUlIuZW1wdHkodGhpcylcblx0fSxcblx0cG9wKCkge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cdFx0Y29uc3QgcG9wZWQgPSBBUlIucG9wKHRoaXMpXG5cdFx0cG9wZWQuJHVtb3VudCgpXG5cdFx0cmV0dXJuIHBvcGVkXG5cdH0sXG5cdHB1c2goe3N0YXRlLCBrZXksIGFuY2hvcn0sIC4uLml0ZW1zKSB7XG5cdFx0Y29uc3QgZWxlbWVudHMgPSBbXVxuXHRcdGluZm9ybSgpXG5cdFx0Zm9yIChsZXQgaSBvZiBpdGVtcykgQVJSLnB1c2goZWxlbWVudHMsIGkuJG1vdW50KHtwYXJlbnQ6IHN0YXRlLCBrZXl9KSlcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDApIERPTS5hZnRlcihhbmNob3IsIC4uLmVsZW1lbnRzKVxuXHRcdGVsc2UgRE9NLmFmdGVyKHRoaXNbdGhpcy5sZW5ndGggLSAxXS4kYXZhdGFyLCAuLi5lbGVtZW50cylcblx0XHRleGVjKClcblx0XHRyZXR1cm4gQVJSLnB1c2godGhpcywgLi4uaXRlbXMpXG5cdH0sXG5cdHJlbW92ZShpdGVtKSB7XG5cdFx0aWYgKHRoaXMuaW5kZXhPZihpdGVtKSA9PT0gLTEpIHJldHVyblxuXHRcdGl0ZW0uJHVtb3VudCgpXG5cdFx0cmV0dXJuIGl0ZW1cblx0fSxcblx0cmV2ZXJzZSh7c3RhdGUsIGtleSwgYW5jaG9yfSkge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXNcblx0XHRjb25zdCB0ZW1wQXJyID0gQVJSLmNvcHkodGhpcylcblx0XHRjb25zdCBlbGVtZW50cyA9IFtdXG5cdFx0aW5mb3JtKClcblx0XHRmb3IgKGxldCBpID0gdGVtcEFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0dGVtcEFycltpXS4kdW1vdW50KClcblx0XHRcdEFSUi5wdXNoKGVsZW1lbnRzLCB0ZW1wQXJyW2ldLiRtb3VudCh7cGFyZW50OiBzdGF0ZSwga2V5fSkpXG5cdFx0fVxuXHRcdEFSUi5wdXNoKHRoaXMsIC4uLkFSUi5yZXZlcnNlKHRlbXBBcnIpKVxuXHRcdERPTS5hZnRlcihhbmNob3IsIC4uLmVsZW1lbnRzKVxuXHRcdGV4ZWMoKVxuXHRcdHJldHVybiB0aGlzXG5cdH0sXG5cdHNoaWZ0KCkge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cdFx0Y29uc3Qgc2hpZnRlZCA9IEFSUi5zaGlmdCh0aGlzKVxuXHRcdHNoaWZ0ZWQuJHVtb3VudCgpXG5cdFx0cmV0dXJuIHNoaWZ0ZWRcblx0fSxcblx0c29ydCh7c3RhdGUsIGtleSwgYW5jaG9yfSwgZm4pIHtcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzXG5cdFx0Y29uc3Qgc29ydGVkID0gQVJSLmNvcHkoQVJSLnNvcnQodGhpcywgZm4pKVxuXHRcdGNvbnN0IGVsZW1lbnRzID0gW11cblx0XHRpbmZvcm0oKVxuXHRcdGZvciAobGV0IGkgb2Ygc29ydGVkKSB7XG5cdFx0XHRpLiR1bW91bnQoKVxuXHRcdFx0QVJSLnB1c2goZWxlbWVudHMsIGkuJG1vdW50KHtwYXJlbnQ6IHN0YXRlLCBrZXl9KSlcblx0XHR9XG5cdFx0QVJSLnB1c2godGhpcywgLi4uc29ydGVkKVxuXHRcdERPTS5hZnRlcihhbmNob3IsIC4uLmVsZW1lbnRzKVxuXHRcdGV4ZWMoKVxuXHRcdHJldHVybiB0aGlzXG5cdH0sXG5cdHNwbGljZSh7c3RhdGUsIGtleSwgYW5jaG9yfSwgLi4uYXJncykge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXNcblx0XHRjb25zdCBzcGxpY2VkID0gQVJSLnNwbGljZShBUlIuY29weSh0aGlzKSwgLi4uYXJncylcblx0XHRpbmZvcm0oKVxuXHRcdGZvciAobGV0IGkgb2Ygc3BsaWNlZCkgaS4kdW1vdW50KClcblx0XHRleGVjKClcblx0XHRyZXR1cm4gc3BsaWNlZFxuXHR9LFxuXHR1bnNoaWZ0KHtzdGF0ZSwga2V5LCBhbmNob3J9LCAuLi5pdGVtcykge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMucHVzaCguLi5pdGVtcykubGVuZ3RoXG5cdFx0Y29uc3QgZWxlbWVudHMgPSBbXVxuXHRcdGluZm9ybSgpXG5cdFx0Zm9yIChsZXQgaSBvZiBpdGVtcykge1xuXHRcdFx0aWYgKGkuJHBhcmVudCkge1xuXHRcdFx0XHRpZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUud2FybignW0VGXScsICdCZXR0ZXIgZGV0YWNoIHRoZSBjb21wb25lbnQgYmVmb3JlIGF0dGFjaGluZyBpdCB0byBhIG5ldyBjb21wb25lbnQhJylcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRpLiR1bW91bnQoKVxuXHRcdFx0QVJSLnB1c2goZWxlbWVudHMsIGkuJG1vdW50KHtwYXJlbnQ6IHN0YXRlLCBrZXl9KSlcblx0XHR9XG5cdFx0RE9NLmFmdGVyKGFuY2hvciwgLi4uZWxlbWVudHMpXG5cdFx0ZXhlYygpXG5cdFx0cmV0dXJuIEFSUi51bnNoaWZ0KHRoaXMsIC4uLml0ZW1zKVxuXHR9XG59XG5cbmNvbnN0IGRlZmluZUFyciA9IChhcnIsIGluZm8pID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYXJyLCB7XG5cdFx0ZW1wdHk6IHt2YWx1ZTogRE9NQVJSLmVtcHR5fSxcblx0XHRwb3A6IHt2YWx1ZTogRE9NQVJSLnBvcH0sXG5cdFx0cHVzaDoge3ZhbHVlOiBET01BUlIucHVzaC5iaW5kKGFyciwgaW5mbyl9LFxuXHRcdHJlbW92ZToge3ZhbHVlOiBET01BUlIucmVtb3ZlfSxcblx0XHRyZXZlcnNlOiB7dmFsdWU6IERPTUFSUi5yZXZlcnNlLmJpbmQoYXJyLCBpbmZvKX0sXG5cdFx0c2hpZnQ6IHt2YWx1ZTogRE9NQVJSLnNoaWZ0fSxcblx0XHRzb3J0OiB7dmFsdWU6IERPTUFSUi5zb3J0LmJpbmQoYXJyLCBpbmZvKX0sXG5cdFx0c3BsaWNlOiB7dmFsdWU6IERPTUFSUi5zcGxpY2UuYmluZChhcnIsIGluZm8pfSxcblx0XHR1bnNoaWZ0OiB7dmFsdWU6IERPTUFSUi51bnNoaWZ0LmJpbmQoYXJyLCBpbmZvKX1cblx0fSlcblx0cmV0dXJuIGFyclxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVBcnJcbiIsImNvbnN0IHR5cGVPZiA9IChvYmopID0+IHtcblx0aWYgKEFycmF5LmlzQXJyYXkob2JqKSkgcmV0dXJuICdhcnJheSdcblx0cmV0dXJuIHR5cGVvZiBvYmpcbn1cblxuZXhwb3J0IGRlZmF1bHQgdHlwZU9mXG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuL2VsZW1lbnQtY3JlYXRvci5qcydcbmltcG9ydCBET00gZnJvbSAnLi9kb20taGVscGVyLmpzJ1xuaW1wb3J0IEFSUiBmcm9tICcuL2FycmF5LWhlbHBlci5qcydcbmltcG9ydCBkZWZpbmVBcnIgZnJvbSAnLi9kb20tYXJyLWhlbHBlci5qcydcbmltcG9ydCB0eXBlT2YgZnJvbSAnLi90eXBlLW9mLmpzJ1xuaW1wb3J0IGluaXRCaW5kaW5nIGZyb20gJy4vYmluZGluZy5qcydcbmltcG9ydCB7IHF1ZXVlLCBpbmZvcm0sIGV4ZWMgfSBmcm9tICcuL3JlbmRlci1xdWVyeS5qcydcblxuY29uc3QgYmluZFRleHROb2RlID0gKHtub2RlLCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGEsIGVsZW1lbnR9KSA9PiB7XG5cdC8vIERhdGEgYmluZGluZyB0ZXh0IG5vZGVcblx0Y29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJylcblx0Y29uc3QgeyBkYXRhTm9kZSwgaGFuZGxlck5vZGUsIF9rZXkgfSA9IGluaXRCaW5kaW5nKHtiaW5kOiBub2RlLCBzdGF0ZSwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBpbm5lckRhdGF9KVxuXHRjb25zdCBoYW5kbGVyID0gKCkgPT4ge1xuXHRcdHRleHROb2RlLnRleHRDb250ZW50ID0gZGF0YU5vZGVbX2tleV1cblx0fVxuXHRoYW5kbGVyTm9kZS5wdXNoKGhhbmRsZXIpXG5cdHF1ZXVlKFtoYW5kbGVyXSlcblxuXHQvLyBBcHBlbmQgZWxlbWVudCB0byB0aGUgY29tcG9uZW50XG5cdERPTS5hcHBlbmQoZWxlbWVudCwgdGV4dE5vZGUpXG59XG5cbmNvbnN0IHVwZGF0ZU1vdW50aW5nTm9kZSA9ICh7c3RhdGUsIGNoaWxkcmVuLCBrZXksIGFuY2hvciwgdmFsdWV9KSA9PiB7XG5cdGlmIChjaGlsZHJlbltrZXldID09PSB2YWx1ZSkgcmV0dXJuXG5cdGlmICh2YWx1ZSkge1xuXHRcdGlmICh2YWx1ZS4kcGFyZW50ICYmIEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLndhcm4oJ1tFRl0nLCAnQmV0dGVyIGRldGFjaCB0aGUgY29tcG9uZW50IGJlZm9yZSBhdHRhY2hpbmcgaXQgdG8gYSBuZXcgY29tcG9uZW50IScpXG5cdFx0aWYgKHZhbHVlLiRlbGVtZW50LmNvbnRhaW5zKHN0YXRlLiRlbGVtZW50KSkge1xuXHRcdFx0aWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLndhcm4oJ1tFRl0nLCAnQ2Fubm90IG1vdW50IGEgY29tcG9uZW50IHRvIGl0XFwncyBjaGlsZCBjb21wb25lbnQhJylcblx0XHRcdHJldHVyblxuXHRcdH1cblx0fVxuXG5cdGluZm9ybSgpXG5cdC8vIFVwZGF0ZSBjb21wb25lbnRcblx0aWYgKGNoaWxkcmVuW2tleV0pIGNoaWxkcmVuW2tleV0uJHVtb3VudCgpXG5cdC8vIFVwZGF0ZSBzdG9yZWQgdmFsdWVcblx0Y2hpbGRyZW5ba2V5XSA9IHZhbHVlXG5cdGlmICh2YWx1ZSkgdmFsdWUuJG1vdW50KHt0YXJnZXQ6IGFuY2hvciwgcGFyZW50OiBzdGF0ZSwgb3B0aW9uOiAnYmVmb3JlJywga2V5fSlcblx0ZXhlYygpXG59XG5cbmNvbnN0IGJpbmRNb3VudGluZ05vZGUgPSAoe3N0YXRlLCBrZXksIGNoaWxkcmVuLCBhbmNob3J9KSA9PiB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdGF0ZSwga2V5LCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIGNoaWxkcmVuW2tleV1cblx0XHR9LFxuXHRcdHNldCh2YWx1ZSkge1xuXHRcdFx0dXBkYXRlTW91bnRpbmdOb2RlKHtzdGF0ZSwgY2hpbGRyZW4sIGtleSwgYW5jaG9yLCB2YWx1ZX0pXG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHR9KVxufVxuXG5jb25zdCB1cGRhdGVNb3VudGluZ0xpc3QgPSAoe3N0YXRlLCBjaGlsZHJlbiwga2V5LCBhbmNob3IsIHZhbHVlfSkgPT4ge1xuXHRpZiAodmFsdWUpIHZhbHVlID0gQVJSLmNvcHkodmFsdWUpXG5cdGVsc2UgdmFsdWUgPSBbXVxuXHRjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHQvLyBVcGRhdGUgY29tcG9uZW50c1xuXHRpbmZvcm0oKVxuXHRpZiAoY2hpbGRyZW5ba2V5XSkge1xuXHRcdGZvciAobGV0IGogb2YgdmFsdWUpIHtcblx0XHRcdGlmIChqLiRlbGVtZW50LmNvbnRhaW5zKHN0YXRlLiRlbGVtZW50KSkge1xuXHRcdFx0XHRpZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUud2FybignW0VGXScsICdDYW5ub3QgbW91bnQgYSBjb21wb25lbnQgdG8gaXRcXCdzIGNoaWxkIGNvbXBvbmVudCEnKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdGouJHVtb3VudCgpXG5cdFx0XHRET00uYXBwZW5kKGZyYWdtZW50LCBqLiRtb3VudCh7cGFyZW50OiBzdGF0ZSwga2V5fSkpXG5cdFx0fVxuXHRcdGZvciAobGV0IGogb2YgQVJSLmNvcHkoY2hpbGRyZW5ba2V5XSkpIGouJHVtb3VudCgpXG5cdH0gZWxzZSBmb3IgKGxldCBqIG9mIHZhbHVlKSBET00uYXBwZW5kKGZyYWdtZW50LCBqLiRtb3VudCh7cGFyZW50OiBzdGF0ZSwga2V5fSkpXG5cdC8vIFVwZGF0ZSBzdG9yZWQgdmFsdWVcblx0Y2hpbGRyZW5ba2V5XS5sZW5ndGggPSAwXG5cdEFSUi5wdXNoKGNoaWxkcmVuW2tleV0sIC4uLnZhbHVlKVxuXHQvLyBBcHBlbmQgdG8gY3VycmVudCBjb21wb25lbnRcblx0RE9NLmFmdGVyKGFuY2hvciwgZnJhZ21lbnQpXG5cdGV4ZWMoKVxufVxuXG5jb25zdCBiaW5kTW91bnRpbmdMaXN0ID0gKHtzdGF0ZSwga2V5LCBjaGlsZHJlbiwgYW5jaG9yfSkgPT4ge1xuXHRjaGlsZHJlbltrZXldID0gZGVmaW5lQXJyKFtdLCB7c3RhdGUsIGtleSwgYW5jaG9yfSlcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0YXRlLCBrZXksIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gY2hpbGRyZW5ba2V5XVxuXHRcdH0sXG5cdFx0c2V0KHZhbHVlKSB7XG5cdFx0XHRpZiAoY2hpbGRyZW5ba2V5XSAmJiBBUlIuZXF1YWxzKGNoaWxkcmVuW2tleV0sIHZhbHVlKSkgcmV0dXJuXG5cdFx0XHR1cGRhdGVNb3VudGluZ0xpc3Qoe3N0YXRlLCBjaGlsZHJlbiwga2V5LCBhbmNob3IsIHZhbHVlfSlcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdH0pXG59XG5cbmNvbnN0IHJlc29sdmVBU1QgPSAoe25vZGUsIG5vZGVUeXBlLCBlbGVtZW50LCBzdGF0ZSwgaW5uZXJEYXRhLCByZWZzLCBjaGlsZHJlbiwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBjcmVhdGV9KSA9PiB7XG5cdHN3aXRjaCAobm9kZVR5cGUpIHtcblx0XHRjYXNlICdzdHJpbmcnOiB7XG5cdFx0XHQvLyBTdGF0aWMgdGV4dCBub2RlXG5cdFx0XHRET00uYXBwZW5kKGVsZW1lbnQsIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpKVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSAnYXJyYXknOiB7XG5cdFx0XHRpZiAodHlwZU9mKG5vZGVbMF0pID09PSAnb2JqZWN0JykgRE9NLmFwcGVuZChlbGVtZW50LCBjcmVhdGUoe2FzdDogbm9kZSwgc3RhdGUsIGlubmVyRGF0YSwgcmVmcywgY2hpbGRyZW4sIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgY3JlYXRlfSkpXG5cdFx0XHRlbHNlIGJpbmRUZXh0Tm9kZSh7bm9kZSwgc3RhdGUsIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgaW5uZXJEYXRhLCBlbGVtZW50fSlcblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGNhc2UgJ29iamVjdCc6IHtcblx0XHRcdGNvbnN0IGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKVxuXHRcdFx0aWYgKG5vZGUudCA9PT0gMCkgYmluZE1vdW50aW5nTm9kZSh7c3RhdGUsIGtleTogbm9kZS5uLCBjaGlsZHJlbiwgYW5jaG9yfSlcblx0XHRcdGVsc2UgaWYgKG5vZGUudCA9PT0gMSkgYmluZE1vdW50aW5nTGlzdCh7c3RhdGUsIGtleTogbm9kZS5uLCBjaGlsZHJlbiwgYW5jaG9yfSlcblx0XHRcdGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihgTm90IGEgc3RhbmRhcmQgZWYuanMgQVNUOiBVbmtub3duIG1vdW50aW5nIHBvaW50IHR5cGUgJyR7bm9kZS50fSdgKVxuXHRcdFx0Ly8gQXBwZW5kIGFuY2hvclxuXHRcdFx0RE9NLmFwcGVuZChlbGVtZW50LCBhbmNob3IpXG5cdFx0XHQvLyBEaXNwbGF5IGFuY2hvciBpbmRpY2F0b3IgaW4gZGV2ZWxvcG1lbnQgbW9kZVxuXHRcdFx0aWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdFx0XHRcdERPTS5iZWZvcmUoYW5jaG9yLCBkb2N1bWVudC5jcmVhdGVDb21tZW50KGBTdGFydCBvZiBtb3VudGluZyBwb2ludCAnJHtub2RlLm59J2ApKVxuXHRcdFx0XHRET00uYWZ0ZXIoYW5jaG9yLCBkb2N1bWVudC5jcmVhdGVDb21tZW50KGBFbmQgb2YgbW91bnRpbmcgcG9pbnQgJyR7bm9kZS5ufSdgKSlcblx0XHRcdH1cblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGRlZmF1bHQ6IHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYE5vdCBhIHN0YW5kYXJkIGVmLmpzIEFTVDogVW5rbm93biBub2RlIHR5cGUgJyR7bm9kZVR5cGV9J2ApXG5cdFx0fVxuXHR9XG59XG5cbmNvbnN0IGNyZWF0ZSA9ICh7YXN0LCBzdGF0ZSwgaW5uZXJEYXRhLCByZWZzLCBjaGlsZHJlbiwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBjcmVhdGV9KSA9PiB7XG5cdC8vIEZpcnN0IGNyZWF0ZSBhbiBlbGVtZW50IGFjY29yZGluZyB0byB0aGUgZGVzY3JpcHRpb25cblx0Y29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQoe2luZm86IGFzdFswXSwgc3RhdGUsIGlubmVyRGF0YSwgcmVmcywgaGFuZGxlcnMsIHN1YnNjcmliZXJzfSlcblxuXHQvLyBBcHBlbmQgY2hpbGQgbm9kZXNcblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBhc3QubGVuZ3RoOyBpKyspIHJlc29sdmVBU1Qoe25vZGU6IGFzdFtpXSwgbm9kZVR5cGU6IHR5cGVPZihhc3RbaV0pLCBlbGVtZW50LCBzdGF0ZSwgaW5uZXJEYXRhLCByZWZzLCBjaGlsZHJlbiwgaGFuZGxlcnMsIHN1YnNjcmliZXJzLCBjcmVhdGV9KVxuXG5cdHJldHVybiBlbGVtZW50XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZVxuIiwiaW1wb3J0IGNyZWF0ZSBmcm9tICcuL3V0aWxzL2NyZWF0b3IuanMnXG5pbXBvcnQgeyByZXNvbHZlUmVhY3RpdmVQYXRoLCByZXNvbHZlU3Vic2NyaWJlciB9IGZyb20gJy4vdXRpbHMvcmVzb2x2ZXIuanMnXG5pbXBvcnQgaW5pdEJpbmRpbmcgZnJvbSAnLi91dGlscy9iaW5kaW5nLmpzJ1xuaW1wb3J0IEFSUiBmcm9tICcuL3V0aWxzL2FycmF5LWhlbHBlci5qcydcbmltcG9ydCBET00gZnJvbSAnLi91dGlscy9kb20taGVscGVyLmpzJ1xuaW1wb3J0IHsgYXNzaWduIH0gZnJvbSAnLi91dGlscy9wb2x5ZmlsbHMuanMnXG5pbXBvcnQgeyBxdWV1ZURvbSwgaW5mb3JtLCBleGVjIH0gZnJvbSAnLi91dGlscy9yZW5kZXItcXVlcnkuanMnXG5cbmNvbnN0IHVuc3Vic2NyaWJlID0gKF9wYXRoLCBmbiwgc3Vic2NyaWJlcnMpID0+IHtcblx0Y29uc3QgcGF0aEFyciA9IF9wYXRoLnNwbGl0KCcuJylcblx0Y29uc3Qgc3Vic2NyaWJlck5vZGUgPSByZXNvbHZlU3Vic2NyaWJlcihwYXRoQXJyLCBzdWJzY3JpYmVycylcblx0QVJSLnJlbW92ZShzdWJzY3JpYmVyTm9kZSwgZm4pXG59XG5cbmNvbnN0IHVwZGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdGluZm9ybSgpXG5cdGNvbnN0IHRtcFN0YXRlID0gYXNzaWduKHt9LCBuZXdTdGF0ZSlcblx0aWYgKHRtcFN0YXRlLiRkYXRhKSB7XG5cdFx0YXNzaWduKHRoaXMuJGRhdGEsIHRtcFN0YXRlLiRkYXRhKVxuXHRcdGRlbGV0ZSh0bXBTdGF0ZS4kZGF0YSlcblx0fVxuXHRpZiAodG1wU3RhdGUuJG1ldGhvZHMpIHtcblx0XHRhc3NpZ24odGhpcy4kbWV0aG9kcywgdG1wU3RhdGUuJG1ldGhvZHMpXG5cdFx0ZGVsZXRlKHRtcFN0YXRlLiRtZXRob2RzKVxuXHR9XG5cdGFzc2lnbih0aGlzLCB0bXBTdGF0ZSlcblx0ZXhlYygpXG59XG5cbmNvbnN0IGRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblx0Y29uc3QgeyRlbGVtZW50LCAkYXZhdGFyfSA9IHRoaXNcblx0aW5mb3JtKClcblx0dGhpcy4kdW1vdW50KClcblx0Zm9yIChsZXQgaSBpbiB0aGlzKSB7XG5cdFx0dGhpc1tpXSA9IG51bGxcblx0XHRkZWxldGUgdGhpc1tpXVxuXHR9XG5cdHF1ZXVlRG9tKCgpID0+IHtcblx0XHRET00ucmVtb3ZlKCRlbGVtZW50KVxuXHRcdERPTS5yZW1vdmUoJGF2YXRhcilcblx0fSlcblx0ZGVsZXRlIHRoaXMuJGVsZW1lbnRcblx0ZGVsZXRlIHRoaXMuJGF2YXRhclxuXHRkZWxldGUgdGhpcy4kcGFyZW50XG5cdGRlbGV0ZSB0aGlzLiRrZXlcblx0ZGVsZXRlIHRoaXMuJGRhdGFcblx0ZGVsZXRlIHRoaXMuJG1ldGhvZHNcblx0ZGVsZXRlIHRoaXMuJHJlZnNcblx0ZGVsZXRlIHRoaXMuJG1vdW50XG5cdGRlbGV0ZSB0aGlzLiR1bW91bnRcblx0ZGVsZXRlIHRoaXMuJHN1YnNjcmliZVxuXHRkZWxldGUgdGhpcy4kdW5zdWJzY3JpYmVcblx0cmV0dXJuIGV4ZWMoKVxufVxuXG5jb25zdCBzdGF0ZSA9IGNsYXNzIHtcblx0Y29uc3RydWN0b3IgKGFzdCkge1xuXHRcdGNvbnN0IGNoaWxkcmVuID0ge31cblx0XHRjb25zdCByZWZzID0ge31cblx0XHRjb25zdCBpbm5lckRhdGEgPSB7fVxuXHRcdGNvbnN0IG1ldGhvZHMgPSB7fVxuXHRcdGNvbnN0IGhhbmRsZXJzID0ge31cblx0XHRjb25zdCBzdWJzY3JpYmVycyA9IHt9XG5cdFx0Y29uc3Qgbm9kZUluZm8gPSB7XG5cdFx0XHRhdmF0YXI6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSxcblx0XHRcdHJlcGxhY2U6IFtdLFxuXHRcdFx0cGFyZW50OiBudWxsLFxuXHRcdFx0a2V5OiBudWxsXG5cdFx0fVxuXG5cdFx0aWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSBub2RlSW5mby5hdmF0YXIgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCdBVkFUQVIgT0YgQ09NUE9ORU5UJylcblxuXHRcdGNvbnN0IHNhZmVab25lID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0Y29uc3QgbW91bnQgPSAoKSA9PiB7XG5cdFx0XHRpZiAobm9kZUluZm8ucmVwbGFjZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgb2Ygbm9kZUluZm8ucmVwbGFjZSkgRE9NLnJlbW92ZShpKVxuXHRcdFx0XHRBUlIuZW1wdHkobm9kZUluZm8ucmVwbGFjZSlcblx0XHRcdH1cblx0XHRcdERPTS5iZWZvcmUobm9kZUluZm8uYXZhdGFyLCBub2RlSW5mby5lbGVtZW50KVxuXHRcdH1cblxuXHRcdGluZm9ybSgpXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuXHRcdFx0JGVsZW1lbnQ6IHtcblx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiBub2RlSW5mby5lbGVtZW50XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCRhdmF0YXI6IHtcblx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiBub2RlSW5mby5hdmF0YXJcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0JHBhcmVudDoge1xuXHRcdFx0XHRnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5vZGVJbmZvLnBhcmVudFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQka2V5OiB7XG5cdFx0XHRcdGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gbm9kZUluZm8ua2V5XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCRtZXRob2RzOiB7XG5cdFx0XHRcdGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gbWV0aG9kc1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQobmV3TWV0aG9kcykge1xuXHRcdFx0XHRcdGFzc2lnbihtZXRob2RzLCBuZXdNZXRob2RzKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQkcmVmczoge1xuXHRcdFx0XHR2YWx1ZTogcmVmcyxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0JG1vdW50OiB7XG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbih7dGFyZ2V0LCBvcHRpb24sIHBhcmVudCwga2V5fSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJykgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpXG5cblx0XHRcdFx0XHRpbmZvcm0oKVxuXHRcdFx0XHRcdGlmIChub2RlSW5mby5wYXJlbnQpIHtcblx0XHRcdFx0XHRcdHRoaXMuJHVtb3VudCgpXG5cdFx0XHRcdFx0XHRpZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUud2FybignW0VGXScsICdDb21wb25lbnQgZGV0YWNoZWQgZnJvbSBwcmV2aW91cyBtb3VudGluZyBwb2ludC4nKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghcGFyZW50KSBwYXJlbnQgPSB0YXJnZXRcblx0XHRcdFx0XHRpZiAoIWtleSkga2V5ID0gJ19fRElSRUNUTU9VTlRfXydcblx0XHRcdFx0XHRub2RlSW5mby5wYXJlbnQgPSBwYXJlbnRcblx0XHRcdFx0XHRub2RlSW5mby5rZXkgPSBrZXlcblx0XHRcdFx0XHRxdWV1ZURvbShtb3VudClcblxuXHRcdFx0XHRcdGlmICghdGFyZ2V0KSB7XG5cdFx0XHRcdFx0XHRleGVjKClcblx0XHRcdFx0XHRcdHJldHVybiBub2RlSW5mby5hdmF0YXJcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzd2l0Y2ggKG9wdGlvbikge1xuXHRcdFx0XHRcdFx0Y2FzZSAnYmVmb3JlJzoge1xuXHRcdFx0XHRcdFx0XHRET00uYmVmb3JlKHRhcmdldCwgbm9kZUluZm8uYXZhdGFyKVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnYWZ0ZXInOiB7XG5cdFx0XHRcdFx0XHRcdERPTS5hZnRlcih0YXJnZXQsIG5vZGVJbmZvLmF2YXRhcilcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgJ3JlcGxhY2UnOiB7XG5cdFx0XHRcdFx0XHRcdERPTS5iZWZvcmUodGFyZ2V0LCBub2RlSW5mby5hdmF0YXIpXG5cdFx0XHRcdFx0XHRcdG5vZGVJbmZvLnJlcGxhY2UucHVzaCh0YXJnZXQpXG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0XHRcdERPTS5hcHBlbmQodGFyZ2V0LCBub2RlSW5mby5hdmF0YXIpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBleGVjKClcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0JHVtb3VudDoge1xuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y29uc3Qge3BhcmVudCwga2V5fSA9IG5vZGVJbmZvXG5cdFx0XHRcdFx0bm9kZUluZm8ucGFyZW50ID0gbnVsbFxuXHRcdFx0XHRcdG5vZGVJbmZvLmtleSA9IG51bGxcblxuXHRcdFx0XHRcdGluZm9ybSgpXG5cdFx0XHRcdFx0aWYgKHBhcmVudCAmJiBrZXkgIT09ICdfX0RJUkVDVE1PVU5UX18nICYmIHBhcmVudFtrZXldKSB7XG5cdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwYXJlbnRba2V5XSkpIEFSUi5yZW1vdmUocGFyZW50W2tleV0sIHRoaXMpXG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0cGFyZW50W2tleV0gPSBudWxsXG5cdFx0XHRcdFx0XHRcdHJldHVybiBleGVjKClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0RE9NLmFwcGVuZChzYWZlWm9uZSwgbm9kZUluZm8uYXZhdGFyKVxuXHRcdFx0XHRcdHF1ZXVlRG9tKG1vdW50KVxuXHRcdFx0XHRcdHJldHVybiBleGVjKClcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0JHN1YnNjcmliZToge1xuXHRcdFx0XHR2YWx1ZTogKHBhdGhTdHIsIHN1YnNjcmliZXIpID0+IHtcblx0XHRcdFx0XHRjb25zdCBfcGF0aCA9IHBhdGhTdHIuc3BsaXQoJy4nKVxuXHRcdFx0XHRcdGNvbnN0IHsgZGF0YU5vZGUsIHN1YnNjcmliZXJOb2RlLCBfa2V5IH0gPSBpbml0QmluZGluZyh7YmluZDogW19wYXRoXSwgc3RhdGU6IHRoaXMsIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgaW5uZXJEYXRhfSlcblx0XHRcdFx0XHQvLyBFeGVjdXRlIHN1YnNjcmliZXIgaW1tZWRpYXRlbHlcblx0XHRcdFx0XHRzdWJzY3JpYmVyKHtzdGF0ZTogdGhpcywgdmFsdWU6IGRhdGFOb2RlW19rZXldfSlcblx0XHRcdFx0XHRzdWJzY3JpYmVyTm9kZS5wdXNoKHN1YnNjcmliZXIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCR1bnN1YnNjcmliZToge1xuXHRcdFx0XHR2YWx1ZTogKF9wYXRoLCBmbikgPT4ge1xuXHRcdFx0XHRcdHVuc3Vic2NyaWJlKF9wYXRoLCBmbiwgc3Vic2NyaWJlcnMpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0Ly8gSW5pdCByb290IGRhdGEgbm9kZVxuXHRcdHJlc29sdmVSZWFjdGl2ZVBhdGgoWyckZGF0YSddLCB0aGlzLCBmYWxzZSlcblxuXHRcdG5vZGVJbmZvLmVsZW1lbnQgPSBjcmVhdGUoe2FzdCwgc3RhdGU6IHRoaXMsIGlubmVyRGF0YSwgcmVmcywgY2hpbGRyZW4sIGhhbmRsZXJzLCBzdWJzY3JpYmVycywgY3JlYXRlfSlcblx0XHRET00uYXBwZW5kKHNhZmVab25lLCBub2RlSW5mby5hdmF0YXIpXG5cdFx0cXVldWVEb20obW91bnQpXG5cdFx0ZXhlYygpXG5cdH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RhdGUucHJvdG90eXBlLCB7XG5cdCR1cGRhdGU6IHt2YWx1ZTogdXBkYXRlfSxcblx0JGRlc3Ryb3k6IHt2YWx1ZTogZGVzdHJveX1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHN0YXRlXG4iLCIvLyBJbXBvcnQgZXZlcnl0aGluZ1xuaW1wb3J0IHBhcnNlIGZyb20gJy4vbGliL3BhcnNlci5qcydcbmltcG9ydCBzdGF0ZSBmcm9tICcuL2xpYi9yZW5kZXJlci5qcydcbmltcG9ydCB0eXBlT2YgZnJvbSAnLi9saWIvdXRpbHMvdHlwZS1vZi5qcydcbmltcG9ydCB7IG1peFN0ciB9IGZyb20gJy4vbGliL3V0aWxzL2xpdGVyYWxzLW1peC5qcydcbmltcG9ydCBwYXJzZUVmdCBmcm9tICdlZnQtcGFyc2VyJ1xuaW1wb3J0IHsgaW5mb3JtLCBleGVjIH0gZnJvbSAnLi9saWIvdXRpbHMvcmVuZGVyLXF1ZXJ5LmpzJ1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uL3BhY2thZ2UuanNvbidcblxuLy8gU2V0IHBhcnNlclxubGV0IHBhcnNlciA9IHBhcnNlRWZ0XG5cbmNvbnN0IGNyZWF0ZSA9ICh2YWx1ZSkgPT4ge1xuXHRjb25zdCB2YWxUeXBlID0gdHlwZU9mKHZhbHVlKVxuXHRpZiAodmFsVHlwZSA9PT0gJ3N0cmluZycpIHZhbHVlID0gcGFyc2UodmFsdWUsIHBhcnNlcilcblx0ZWxzZSBpZiAodmFsVHlwZSAhPT0gJ2FycmF5JykgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNyZWF0ZSBuZXcgY29tcG9uZW50IHdpdGhvdXQgcHJvcGVyIHRlbXBsYXRlIG9yIEFTVCEnKVxuXG5cdGNvbnN0IGFzdCA9IHZhbHVlXG5cdGNvbnN0IGVmID0gY2xhc3MgZXh0ZW5kcyBzdGF0ZSB7XG5cdFx0Y29uc3RydWN0b3IobmV3U3RhdGUpIHtcblx0XHRcdGluZm9ybSgpXG5cdFx0XHRzdXBlcihhc3QpXG5cdFx0XHRpZiAobmV3U3RhdGUpIHRoaXMuJHVwZGF0ZShuZXdTdGF0ZSlcblx0XHRcdGV4ZWMoKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZWZcbn1cblxuY29uc3QgYnVuZGxlID0gKGNiKSA9PiB7XG5cdGluZm9ybSgpXG5cdHJldHVybiBleGVjKGNiKGluZm9ybSwgZXhlYykpXG59XG5cbmNvbnN0IHNldFBhcnNlciA9IChuZXdQYXJzZXIpID0+IHtcblx0cGFyc2VyID0gbmV3UGFyc2VyXG59XG5cbmNvbnN0IHQgPSAoLi4uYXJncykgPT4gY3JlYXRlKG1peFN0ciguLi5hcmdzKSlcblxuZXhwb3J0IHsgY3JlYXRlLCBpbmZvcm0sIGV4ZWMsIGJ1bmRsZSwgc2V0UGFyc2VyLCBwYXJzZUVmdCwgdCwgdmVyc2lvbiB9XG5cbmlmIChFTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5pbmZvKCdbRUZdJywgYGVmLmpzIHYke3ZlcnNpb259IGluaXRpYWxpemVkIWApXG4iLCIvKlxuICogY2xhc3NMaXN0LmpzOiBDcm9zcy1icm93c2VyIGZ1bGwgZWxlbWVudC5jbGFzc0xpc3QgaW1wbGVtZW50YXRpb24uXG4gKiAyMDE0LTA3LTIzXG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogUHVibGljIERvbWFpbi5cbiAqIE5PIFdBUlJBTlRZIEVYUFJFU1NFRCBPUiBJTVBMSUVELiBVU0UgQVQgWU9VUiBPV04gUklTSy5cbiAqL1xuXG4vKmdsb2JhbCBzZWxmLCBkb2N1bWVudCwgRE9NRXhjZXB0aW9uICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9jbGFzc0xpc3QuanMvYmxvYi9tYXN0ZXIvY2xhc3NMaXN0LmpzKi9cblxuLyogQ29waWVkIGZyb20gTUROOlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xhc3NMaXN0XG4gKi9cblxuaWYgKFwiZG9jdW1lbnRcIiBpbiB3aW5kb3cuc2VsZikge1xuXG4gIC8vIEZ1bGwgcG9seWZpbGwgZm9yIGJyb3dzZXJzIHdpdGggbm8gY2xhc3NMaXN0IHN1cHBvcnRcbiAgLy8gSW5jbHVkaW5nIElFIDwgRWRnZSBtaXNzaW5nIFNWR0VsZW1lbnQuY2xhc3NMaXN0XG4gIGlmICghKFwiY2xhc3NMaXN0XCIgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIikpXG4gICAgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmICEoXCJjbGFzc0xpc3RcIiBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFwiZ1wiKSkpIHtcblxuICAoZnVuY3Rpb24gKHZpZXcpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKCEoJ0VsZW1lbnQnIGluIHZpZXcpKSByZXR1cm47XG5cbiAgICB2YXJcbiAgICAgICAgY2xhc3NMaXN0UHJvcCA9IFwiY2xhc3NMaXN0XCJcbiAgICAgICwgcHJvdG9Qcm9wID0gXCJwcm90b3R5cGVcIlxuICAgICAgLCBlbGVtQ3RyUHJvdG8gPSB2aWV3LkVsZW1lbnRbcHJvdG9Qcm9wXVxuICAgICAgLCBvYmpDdHIgPSBPYmplY3RcbiAgICAgICwgc3RyVHJpbSA9IFN0cmluZ1twcm90b1Byb3BdLnRyaW0gfHwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKTtcbiAgICAgIH1cbiAgICAgICwgYXJySW5kZXhPZiA9IEFycmF5W3Byb3RvUHJvcF0uaW5kZXhPZiB8fCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXJcbiAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgLCBsZW4gPSB0aGlzLmxlbmd0aFxuICAgICAgICA7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICAvLyBWZW5kb3JzOiBwbGVhc2UgYWxsb3cgY29udGVudCBjb2RlIHRvIGluc3RhbnRpYXRlIERPTUV4Y2VwdGlvbnNcbiAgICAgICwgRE9NRXggPSBmdW5jdGlvbiAodHlwZSwgbWVzc2FnZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNvZGUgPSBET01FeGNlcHRpb25bdHlwZV07XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICB9XG4gICAgICAsIGNoZWNrVG9rZW5BbmRHZXRJbmRleCA9IGZ1bmN0aW9uIChjbGFzc0xpc3QsIHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbiA9PT0gXCJcIikge1xuICAgICAgICAgIHRocm93IG5ldyBET01FeChcbiAgICAgICAgICAgICAgXCJTWU5UQVhfRVJSXCJcbiAgICAgICAgICAgICwgXCJBbiBpbnZhbGlkIG9yIGlsbGVnYWwgc3RyaW5nIHdhcyBzcGVjaWZpZWRcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9cXHMvLnRlc3QodG9rZW4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4KFxuICAgICAgICAgICAgICBcIklOVkFMSURfQ0hBUkFDVEVSX0VSUlwiXG4gICAgICAgICAgICAsIFwiU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJJbmRleE9mLmNhbGwoY2xhc3NMaXN0LCB0b2tlbik7XG4gICAgICB9XG4gICAgICAsIENsYXNzTGlzdCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgICAgdHJpbW1lZENsYXNzZXMgPSBzdHJUcmltLmNhbGwoZWxlbS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKVxuICAgICAgICAgICwgY2xhc3NlcyA9IHRyaW1tZWRDbGFzc2VzID8gdHJpbW1lZENsYXNzZXMuc3BsaXQoL1xccysvKSA6IFtdXG4gICAgICAgICAgLCBpID0gMFxuICAgICAgICAgICwgbGVuID0gY2xhc3Nlcy5sZW5ndGhcbiAgICAgICAgO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5wdXNoKGNsYXNzZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMudG9TdHJpbmcoKSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAsIGNsYXNzTGlzdFByb3RvID0gQ2xhc3NMaXN0W3Byb3RvUHJvcF0gPSBbXVxuICAgICAgLCBjbGFzc0xpc3RHZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2xhc3NMaXN0KHRoaXMpO1xuICAgICAgfVxuICAgIDtcbiAgICAvLyBNb3N0IERPTUV4Y2VwdGlvbiBpbXBsZW1lbnRhdGlvbnMgZG9uJ3QgYWxsb3cgY2FsbGluZyBET01FeGNlcHRpb24ncyB0b1N0cmluZygpXG4gICAgLy8gb24gbm9uLURPTUV4Y2VwdGlvbnMuIEVycm9yJ3MgdG9TdHJpbmcoKSBpcyBzdWZmaWNpZW50IGhlcmUuXG4gICAgRE9NRXhbcHJvdG9Qcm9wXSA9IEVycm9yW3Byb3RvUHJvcF07XG4gICAgY2xhc3NMaXN0UHJvdG8uaXRlbSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICByZXR1cm4gdGhpc1tpXSB8fCBudWxsO1xuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8uY29udGFpbnMgPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgIHRva2VuICs9IFwiXCI7XG4gICAgICByZXR1cm4gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKSAhPT0gLTE7XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by5hZGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXJcbiAgICAgICAgICB0b2tlbnMgPSBhcmd1bWVudHNcbiAgICAgICAgLCBpID0gMFxuICAgICAgICAsIGwgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICwgdG9rZW5cbiAgICAgICAgLCB1cGRhdGVkID0gZmFsc2VcbiAgICAgIDtcbiAgICAgIGRvIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuICAgICAgICBpZiAoY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnB1c2godG9rZW4pO1xuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbCk7XG5cbiAgICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyXG4gICAgICAgICAgdG9rZW5zID0gYXJndW1lbnRzXG4gICAgICAgICwgaSA9IDBcbiAgICAgICAgLCBsID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAsIHRva2VuXG4gICAgICAgICwgdXBkYXRlZCA9IGZhbHNlXG4gICAgICAgICwgaW5kZXhcbiAgICAgIDtcbiAgICAgIGRvIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuICAgICAgICBpbmRleCA9IGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbik7XG4gICAgICAgIHdoaWxlIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgaW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbCk7XG5cbiAgICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8udG9nZ2xlID0gZnVuY3Rpb24gKHRva2VuLCBmb3JjZSkge1xuICAgICAgdG9rZW4gKz0gXCJcIjtcblxuICAgICAgdmFyXG4gICAgICAgICAgcmVzdWx0ID0gdGhpcy5jb250YWlucyh0b2tlbilcbiAgICAgICAgLCBtZXRob2QgPSByZXN1bHQgP1xuICAgICAgICAgIGZvcmNlICE9PSB0cnVlICYmIFwicmVtb3ZlXCJcbiAgICAgICAgOlxuICAgICAgICAgIGZvcmNlICE9PSBmYWxzZSAmJiBcImFkZFwiXG4gICAgICA7XG5cbiAgICAgIGlmIChtZXRob2QpIHtcbiAgICAgICAgdGhpc1ttZXRob2RdKHRva2VuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZvcmNlID09PSB0cnVlIHx8IGZvcmNlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZm9yY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gIXJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuam9pbihcIiBcIik7XG4gICAgfTtcblxuICAgIGlmIChvYmpDdHIuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgIHZhciBjbGFzc0xpc3RQcm9wRGVzYyA9IHtcbiAgICAgICAgICBnZXQ6IGNsYXNzTGlzdEdldHRlclxuICAgICAgICAsIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgLCBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICBvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG4gICAgICB9IGNhdGNoIChleCkgeyAvLyBJRSA4IGRvZXNuJ3Qgc3VwcG9ydCBlbnVtZXJhYmxlOnRydWVcbiAgICAgICAgaWYgKGV4Lm51bWJlciA9PT0gLTB4N0ZGNUVDNTQpIHtcbiAgICAgICAgICBjbGFzc0xpc3RQcm9wRGVzYy5lbnVtZXJhYmxlID0gZmFsc2U7XG4gICAgICAgICAgb2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvYmpDdHJbcHJvdG9Qcm9wXS5fX2RlZmluZUdldHRlcl9fKSB7XG4gICAgICBlbGVtQ3RyUHJvdG8uX19kZWZpbmVHZXR0ZXJfXyhjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RHZXR0ZXIpO1xuICAgIH1cblxuICAgIH0od2luZG93LnNlbGYpKTtcblxuICAgIH0gZWxzZSB7XG4gICAgLy8gVGhlcmUgaXMgZnVsbCBvciBwYXJ0aWFsIG5hdGl2ZSBjbGFzc0xpc3Qgc3VwcG9ydCwgc28ganVzdCBjaGVjayBpZiB3ZSBuZWVkXG4gICAgLy8gdG8gbm9ybWFsaXplIHRoZSBhZGQvcmVtb3ZlIGFuZCB0b2dnbGUgQVBJcy5cblxuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgdmFyIHRlc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIik7XG5cbiAgICAgIHRlc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjMVwiLCBcImMyXCIpO1xuXG4gICAgICAvLyBQb2x5ZmlsbCBmb3IgSUUgMTAvMTEgYW5kIEZpcmVmb3ggPDI2LCB3aGVyZSBjbGFzc0xpc3QuYWRkIGFuZFxuICAgICAgLy8gY2xhc3NMaXN0LnJlbW92ZSBleGlzdCBidXQgc3VwcG9ydCBvbmx5IG9uZSBhcmd1bWVudCBhdCBhIHRpbWUuXG4gICAgICBpZiAoIXRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMyXCIpKSB7XG4gICAgICAgIHZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgb3JpZ2luYWwgPSBET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF07XG5cbiAgICAgICAgICBET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgICAgdmFyIGksIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICB0b2tlbiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgICAgb3JpZ2luYWwuY2FsbCh0aGlzLCB0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgY3JlYXRlTWV0aG9kKCdhZGQnKTtcbiAgICAgICAgY3JlYXRlTWV0aG9kKCdyZW1vdmUnKTtcbiAgICAgIH1cblxuICAgICAgdGVzdEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImMzXCIsIGZhbHNlKTtcblxuICAgICAgLy8gUG9seWZpbGwgZm9yIElFIDEwIGFuZCBGaXJlZm94IDwyNCwgd2hlcmUgY2xhc3NMaXN0LnRvZ2dsZSBkb2VzIG5vdFxuICAgICAgLy8gc3VwcG9ydCB0aGUgc2Vjb25kIGFyZ3VtZW50LlxuICAgICAgaWYgKHRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMzXCIpKSB7XG4gICAgICAgIHZhciBfdG9nZ2xlID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGU7XG5cbiAgICAgICAgRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbih0b2tlbiwgZm9yY2UpIHtcbiAgICAgICAgICBpZiAoMSBpbiBhcmd1bWVudHMgJiYgIXRoaXMuY29udGFpbnModG9rZW4pID09PSAhZm9yY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JjZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90b2dnbGUuY2FsbCh0aGlzLCB0b2tlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICB9XG5cbiAgICAgIHRlc3RFbGVtZW50ID0gbnVsbDtcbiAgICB9KCkpO1xuICB9XG59XG4iLCJjb25zdCBwcm90byA9IEFycmF5LnByb3RvdHlwZVxuXG5jb25zdCBBUlIgPSB7XG5cdGNvcHkoYXJyKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNsaWNlLmNhbGwoYXJyLCAwKVxuXHR9LFxuXHRlbXB0eShhcnIpIHtcblx0XHRhcnIubGVuZ3RoID0gMFxuXHRcdHJldHVybiBhcnJcblx0fSxcblx0ZXF1YWxzKGxlZnQsIHJpZ2h0KSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHJpZ2h0KSkgcmV0dXJuIGZhbHNlXG5cdFx0aWYgKGxlZnQgPT09IHJpZ2h0KSByZXR1cm4gdHJ1ZVxuXHRcdGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2Vcblx0XHRmb3IgKGxldCBpIGluIGxlZnQpIGlmIChsZWZ0W2ldICE9PSByaWdodFtpXSkgcmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIHRydWVcblx0fSxcblx0cG9wKGFycikge1xuXHRcdHJldHVybiBwcm90by5wb3AuY2FsbChhcnIpXG5cdH0sXG5cdHB1c2goYXJyLCAuLi5pdGVtcykge1xuXHRcdHJldHVybiBwcm90by5wdXNoLmFwcGx5KGFyciwgaXRlbXMpXG5cdH0sXG5cdHJlbW92ZShhcnIsIGl0ZW0pIHtcblx0XHRjb25zdCBpbmRleCA9IHByb3RvLmluZGV4T2YuY2FsbChhcnIsIGl0ZW0pXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHByb3RvLnNwbGljZS5jYWxsKGFyciwgaW5kZXgsIDEpXG5cdFx0XHRyZXR1cm4gaXRlbVxuXHRcdH1cblx0fSxcblx0cmV2ZXJzZShhcnIpIHtcblx0XHRyZXR1cm4gcHJvdG8ucmV2ZXJzZS5jYWxsKGFycilcblx0fSxcblx0c2hpZnQoYXJyKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNoaWZ0LmNhbGwoYXJyKVxuXHR9LFxuXHRzbGljZShhcnIsIGluZGV4LCBsZW5ndGgpIHtcblx0XHRyZXR1cm4gcHJvdG8uc2xpY2UuY2FsbChhcnIsIGluZGV4LCBsZW5ndGgpXG5cdH0sXG5cdHNvcnQoYXJyLCBmbikge1xuXHRcdHJldHVybiBwcm90by5zb3J0LmNhbGwoYXJyLCBmbilcblx0fSxcblx0c3BsaWNlKGFyciwgLi4uYXJncykge1xuXHRcdHJldHVybiBwcm90by5zcGxpY2UuYXBwbHkoYXJyLCBhcmdzKVxuXHR9LFxuXHR1bnNoaWZ0KGFyciwgLi4uaXRlbXMpIHtcblx0XHRyZXR1cm4gcHJvdG8udW5zaGlmdC5hcHBseShhcnIsIGl0ZW1zKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFSUlxuIiwiaW1wb3J0IHtpbmZvcm0sIGV4ZWN9IGZyb20gJ2VmLmpzJ1xuXG5pbXBvcnQgJ2NsYXNzbGlzdC1wb2x5ZmlsbCdcblxuaW1wb3J0IF90b2RvYXBwIGZyb20gJy4vdG1wbHMvdG9kb2FwcC5lZnQnXG5pbXBvcnQgX21haW4gZnJvbSAnLi90bXBscy9tYWluLmVmdCdcbmltcG9ydCBfdG9kbyBmcm9tICcuL3RtcGxzL3RvZG8uZWZ0J1xuaW1wb3J0IF9mb290ZXIgZnJvbSAnLi90bXBscy9mb290ZXIuZWZ0J1xuXG5pbXBvcnQgQVJSIGZyb20gJy4uL2FycmF5LWhlbHBlci5qcydcblxuY29uc3QgdG9kb2FwcCA9IG5ldyBfdG9kb2FwcCgpXG5jb25zdCBtYWluID0gbmV3IF9tYWluKClcbmNvbnN0IGZvb3RlciA9IG5ldyBfZm9vdGVyKClcbmxldCBvcmRlciA9IDBcblxudG9kb2FwcC5tYWluID0gbWFpblxudG9kb2FwcC5mb290ZXIgPSBmb290ZXJcblxuY29uc3QgdG9kb3MgPSBbXVxuY29uc3QgY29tcGxldGVkID0gW11cbmNvbnN0IGFsbCA9IFtdXG5jb25zdCBzdG9yYWdlID0gW11cblxuY29uc3QgdXBkYXRlU3RvcmFnZSA9ICgpID0+IHtcblx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RvZG9zLWVmJywgSlNPTi5zdHJpbmdpZnkoc3RvcmFnZSkpXG59XG5cbmNvbnN0IHNvcnRMaXN0ID0gKGwsIHIpID0+IHtcblx0aWYgKGwuJGRhdGEuc3RvcmVkLm9yZGVyID4gci4kZGF0YS5zdG9yZWQub3JkZXIpIHJldHVybiAxXG5cdHJldHVybiAtMVxufVxuXG5jb25zdCB1cGRhdGVMaXN0ID0gKGhhc2gpID0+IHtcblx0aW5mb3JtKClcblx0c3dpdGNoIChoYXNoKSB7XG5cdFx0Y2FzZSAnIy9hY3RpdmUnOiB7XG5cdFx0XHRtYWluLnRvZG9zID0gdG9kb3Muc29ydChzb3J0TGlzdClcblx0XHRcdGZvb3Rlci4kZGF0YSA9IHtcblx0XHRcdFx0YWxsU2VsZWN0ZWQ6ICcnLFxuXHRcdFx0XHRhY3RpdmVTZWxlY3RlZDogJ3NlbGVjdGVkJyxcblx0XHRcdFx0Y29tcGxldGVkU2VsZWN0ZWQ6ICcnXG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHRcdH1cblx0XHRjYXNlICcjL2NvbXBsZXRlZCc6IHtcblx0XHRcdG1haW4udG9kb3MgPSBjb21wbGV0ZWQuc29ydChzb3J0TGlzdClcblx0XHRcdGZvb3Rlci4kZGF0YSA9IHtcblx0XHRcdFx0YWxsU2VsZWN0ZWQ6ICcnLFxuXHRcdFx0XHRhY3RpdmVTZWxlY3RlZDogJycsXG5cdFx0XHRcdGNvbXBsZXRlZFNlbGVjdGVkOiAnc2VsZWN0ZWQnXG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHRcdH1cblx0XHRkZWZhdWx0OiB7XG5cdFx0XHRtYWluLnRvZG9zID0gYWxsXG5cdFx0XHRmb290ZXIuJGRhdGEgPSB7XG5cdFx0XHRcdGFsbFNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxuXHRcdFx0XHRhY3RpdmVTZWxlY3RlZDogJycsXG5cdFx0XHRcdGNvbXBsZXRlZFNlbGVjdGVkOiAnJ1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRleGVjKClcbn1cblxuY29uc3QgdXBkYXRlQ291bnQgPSAoKSA9PiB7XG5cdGlmIChhbGwubGVuZ3RoID09PSAwKSB7XG5cdFx0Zm9vdGVyLiRlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblx0XHRtYWluLiRlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblx0fSBlbHNlIHtcblx0XHRmb290ZXIuJGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblx0XHRtYWluLiRlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cdH1cblxuXHRpZiAoYWxsLmxlbmd0aCAhPT0gMCAmJiBhbGwubGVuZ3RoID09PSBjb21wbGV0ZWQubGVuZ3RoKSBtYWluLiRkYXRhLmFsbENvbXBsZXRlZCA9IHRydWVcblx0ZWxzZSBtYWluLiRkYXRhLmFsbENvbXBsZXRlZCA9IGZhbHNlXG5cblx0aWYgKGNvbXBsZXRlZC5sZW5ndGggPT09IDApIGZvb3Rlci4kcmVmcy5jbGVhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cdGVsc2UgZm9vdGVyLiRyZWZzLmNsZWFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cdGZvb3Rlci4kZGF0YS5jb3VudCA9IHRvZG9zLmxlbmd0aFxuXHRpZiAodG9kb3MubGVuZ3RoID4gMSkgZm9vdGVyLiRkYXRhLnMgPSAncydcblx0ZWxzZSBmb290ZXIuJGRhdGEucyA9ICcnXG59XG5cbmNvbnN0IHRvZ2dsZUFsbCA9ICh7dmFsdWV9KSA9PiB7XG5cdGluZm9ybSgpXG5cdGlmICh2YWx1ZSkge1xuXHRcdGNvbnN0IF90b2RvcyA9IEFSUi5jb3B5KHRvZG9zKVxuXHRcdGZvciAobGV0IGkgb2YgX3RvZG9zKSB7XG5cdFx0XHRpLiRkYXRhLnN0b3JlZC5jb21wbGV0ZWQgPSB0cnVlXG5cdFx0fVxuXHR9IGVsc2UgaWYgKGNvbXBsZXRlZC5sZW5ndGggPT09IGFsbC5sZW5ndGgpIHtcblx0XHRjb25zdCBfY29tcGxldGVkID0gQVJSLmNvcHkoY29tcGxldGVkKVxuXHRcdGZvciAobGV0IGkgb2YgX2NvbXBsZXRlZCkgaS4kZGF0YS5zdG9yZWQuY29tcGxldGVkID0gZmFsc2Vcblx0fVxuXHRpZiAobG9jYXRpb24uaGFzaCAhPT0gJyMvJykgdXBkYXRlTGlzdChsb2NhdGlvbi5oYXNoKVxuXHRleGVjKClcbn1cblxuY29uc3QgY2xlYXIgPSAoKSA9PiB7XG5cdGluZm9ybSgpXG5cdGZvciAobGV0IGkgb2YgY29tcGxldGVkKSB7XG5cdFx0QVJSLnJlbW92ZShhbGwsIGkpXG5cdFx0QVJSLnJlbW92ZShzdG9yYWdlLCBpLiRkYXRhLnN0b3JlZClcblx0XHRtYWluLnRvZG9zLnJlbW92ZShpKVxuXHRcdGkuJGRlc3Ryb3koKVxuXHR9XG5cdGNvbXBsZXRlZC5sZW5ndGggPSAwXG5cdHVwZGF0ZUNvdW50KClcblx0dXBkYXRlU3RvcmFnZSgpXG5cdHVwZGF0ZUxpc3QobG9jYXRpb24uaGFzaClcblx0ZXhlYygpXG59XG5cbmNvbnN0IGRlc3Ryb3kgPSAoe3N0YXRlfSkgPT4ge1xuXHRpbmZvcm0oKVxuXHRBUlIucmVtb3ZlKGFsbCwgc3RhdGUpXG5cdEFSUi5yZW1vdmUoc3RvcmFnZSwgc3RhdGUuJGRhdGEuc3RvcmVkKVxuXHRBUlIucmVtb3ZlKGNvbXBsZXRlZCwgc3RhdGUpXG5cblx0c3RhdGUuJGRlc3Ryb3koKVxuXHR1cGRhdGVDb3VudCgpXG5cdHVwZGF0ZVN0b3JhZ2UoKVxuXHR1cGRhdGVMaXN0KGxvY2F0aW9uLmhhc2gpXG5cdGV4ZWMoKVxufVxuXG5jb25zdCB0b2dnbGVDb21wbGV0ZSA9IGZ1bmN0aW9uKHt2YWx1ZTogY2hlY2tlZH0pIHtcblx0aW5mb3JtKClcblx0aWYgKGNoZWNrZWQpIHtcblx0XHR0aGlzLiRkYXRhLmNvbXBsZXRlZCA9ICdjb21wbGV0ZWQnXG5cdFx0QVJSLnJlbW92ZSh0b2RvcywgdGhpcylcblx0XHRjb21wbGV0ZWQucHVzaCh0aGlzKVxuXHRcdGlmIChsb2NhdGlvbi5oYXNoID09PSAnIy9hY3RpdmUnKSBtYWluLnRvZG9zLnJlbW92ZSh0aGlzKVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuJGRhdGEuY29tcGxldGVkID0gJydcblx0XHR0b2Rvcy5wdXNoKHRoaXMpXG5cdFx0QVJSLnJlbW92ZShjb21wbGV0ZWQsIHRoaXMpXG5cdFx0d2luZG93Ll90aGlzXyA9IHRoaXNcblx0XHRpZiAobG9jYXRpb24uaGFzaCA9PT0gJyMvY29tcGxldGVkJykgbWFpbi50b2Rvcy5yZW1vdmUodGhpcylcblx0fVxuXHR1cGRhdGVDb3VudCgpXG5cdHVwZGF0ZVN0b3JhZ2UoKVxuXHRleGVjKClcbn1cblxuY29uc3QgY29uZmlybSA9ICh7ZSwgc3RhdGUsIHZhbHVlfSkgPT4ge1xuXHRpbmZvcm0oKVxuXHRjb25zdCBuZXdWYWwgPSB2YWx1ZS50cmltKClcblx0aWYgKCFuZXdWYWwpIHJldHVybiBleGVjKGRlc3Ryb3koe3N0YXRlfSkpXG5cdHN0YXRlLiRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2VkaXRpbmcnKVxuXHRzdGF0ZS4kZGF0YS5zdG9yZWQudGl0bGUgPSBuZXdWYWxcblx0aWYgKGUudHlwZSA9PT0gJ2JsdXInKSBzdGF0ZS4kZGF0YS51cGRhdGUgPSAnJ1xuXHR1cGRhdGVTdG9yYWdlKClcblx0ZXhlYygpXG59XG5cbmNvbnN0IGNhbmNlbCA9ICh7c3RhdGUsIHZhbHVlfSkgPT4ge1xuXHRpbmZvcm0oKVxuXHRzdGF0ZS4kZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdlZGl0aW5nJylcblx0c3RhdGUuJGRhdGEudXBkYXRlID0gdmFsdWVcblx0ZXhlYygpXG59XG5cbmNvbnN0IGVkaXQgPSAoe3N0YXRlfSkgPT4ge1xuXHRpbmZvcm0oKVxuXHRzdGF0ZS4kZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdlZGl0aW5nJylcblx0c3RhdGUuJGRhdGEudXBkYXRlID0gc3RhdGUuJGRhdGEuc3RvcmVkLnRpdGxlXG5cdHN0YXRlLiRyZWZzLmVkaXQuZm9jdXMoKVxuXHRleGVjKClcbn1cblxuY29uc3QgYmx1ciA9ICh7c3RhdGV9KSA9PiB7XG5cdHN0YXRlLiRyZWZzLmVkaXQuYmx1cigpXG59XG5cbmNvbnN0IGFkZCA9ICh2YWx1ZSkgPT4ge1xuXHR2YWx1ZS5vcmRlciA9IG9yZGVyICs9IDFcblx0dmFsdWUuY29tcGxldGVkID0gISF2YWx1ZS5jb21wbGV0ZWRcblx0Y29uc3QgdG9kbyA9IG5ldyBfdG9kbyh7XG5cdFx0JGRhdGE6IHtzdG9yZWQ6IHZhbHVlfSxcblx0XHQkbWV0aG9kczoge1xuXHRcdFx0Ymx1cixcblx0XHRcdGVkaXQsXG5cdFx0XHRjYW5jZWwsXG5cdFx0XHRjb25maXJtLFxuXHRcdFx0ZGVzdHJveVxuXHRcdH1cblx0fSlcblxuXHRhbGwucHVzaCh0b2RvKVxuXHRzdG9yYWdlLnB1c2godG9kby4kZGF0YS5zdG9yZWQpXG5cblx0aWYgKCF2YWx1ZS5jb21wbGV0ZWQgJiYgbG9jYXRpb24uaGFzaCAhPT0gJyMvY29tcGxldGVkJykgbWFpbi50b2Rvcy5wdXNoKHRvZG8pXG5cblx0dG9kby4kc3Vic2NyaWJlKCdzdG9yZWQuY29tcGxldGVkJywgdG9nZ2xlQ29tcGxldGUuYmluZCh0b2RvKSlcblxuXHR1cGRhdGVDb3VudCgpXG5cdHVwZGF0ZVN0b3JhZ2UoKVxuXG5cdHRvZG9hcHAuJHJlZnMuaW5wdXQuZm9jdXMoKVxufVxuXG5jb25zdCBhZGRUb2RvID0gKHtzdGF0ZSwgdmFsdWV9KSA9PiB7XG5cdHZhbHVlID0gdmFsdWUudHJpbSgpXG5cdGluZm9ybSgpXG5cdGlmICghdmFsdWUpIHJldHVyblxuXHRzdGF0ZS4kZGF0YS5pbnB1dCA9ICcnXG5cdGFkZCh7XG5cdFx0dGl0bGU6IHZhbHVlLFxuXHRcdGNvbXBsZXRlZDogZmFsc2Vcblx0fSlcblx0ZXhlYygpXG59XG5cbnRvZG9hcHAuJG1ldGhvZHMuYWRkVG9kbyA9IGFkZFRvZG9cbmZvb3Rlci4kbWV0aG9kcy5jbGVhciA9IGNsZWFyXG5tYWluLiRzdWJzY3JpYmUoJ2FsbENvbXBsZXRlZCcsIHRvZ2dsZUFsbClcblxuY29uc3QgbGFzdFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9kb3MtZWYnKVxuaWYgKGxhc3RTdG9yYWdlKSB7XG5cdGNvbnN0IGxhc3RUb2RvcyA9IEpTT04ucGFyc2UobGFzdFN0b3JhZ2UpXG5cdGluZm9ybSgpXG5cdGZvciAobGV0IGkgb2YgbGFzdFRvZG9zKSBhZGQoaSlcblx0ZXhlYygpXG59XG5cbmlmICghKC9eI1xcLyhhY3RpdmV8Y29tcGxldGVkKT8kLykudGVzdChsb2NhdGlvbi5oYXNoKSkgd2luZG93LmxvY2F0aW9uID0gJyMvJ1xuXG51cGRhdGVMaXN0KGxvY2F0aW9uLmhhc2gpXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4gdXBkYXRlTGlzdChsb2NhdGlvbi5oYXNoKSlcblxuZXhwb3J0IGRlZmF1bHQgdG9kb2FwcFxuIiwiaW1wb3J0IHRvZG9hcHAgZnJvbSAnLi90ZW1wbGF0ZXMvdG9kb2FwcC5qcydcbmltcG9ydCAqIGFzIGVmIGZyb20gJ2VmLmpzJ1xuXG50b2RvYXBwLiRtb3VudCh7XG5cdHRhcmdldDogJy50b2RvYXBwJyxcblx0b3B0aW9uOiAncmVwbGFjZSdcbn0pXG5cbndpbmRvdy50b2RvYXBwID0gdG9kb2FwcFxud2luZG93LmVmID0gZWZcbiJdLCJuYW1lcyI6WyJjb25zdCIsInQiLCJsZXQiLCJFU0NBUEUiLCJuYW1lIiwidmFsdWUiLCJlZnRQYXJzZXIiLCJpIiwicHJvdG8iLCJ0aGlzIiwiaiIsImNyZWF0ZSIsImRlc3Ryb3kiLCJzdXBlciIsImFyZ3VtZW50cyIsIkFSUiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUE7OztBQUdoQkEsSUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLEVBQUMsSUFBRyxHQUFFLElBQUksZUFBVyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBQ2xEQSxJQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sRUFBQyxJQUFHLEdBQUUsSUFBSSxlQUFXLEdBQUcsR0FBRyxDQUFDLENBQUE7QUFDbERBLElBQU0sR0FBRyxHQUFHLElBQUksTUFBTSxFQUFDLElBQUcsR0FBRSxJQUFJLFlBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQTtBQUMvQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLEVBQUMsSUFBRyxHQUFFLElBQUksWUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBQy9DQSxJQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sRUFBQyxJQUFHLEdBQUUsSUFBSSxHQUFJLEdBQUcsQ0FBQyxDQUFBO0FBQ3hDQSxJQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sRUFBQyxJQUFHLEdBQUUsSUFBSSxNQUFFLEdBQUcsR0FBRyxDQUFDLENBQUE7QUFDdkNBLElBQU1DLEdBQUMsR0FBRyxJQUFJLE1BQU0sRUFBQyxJQUFHLEdBQUUsSUFBSSxNQUFFLEdBQUcsR0FBRyxDQUFDLENBQUE7QUFDdkNELElBQU0sQ0FBQyxHQUFHLElBQUksTUFBTSxFQUFDLElBQUcsR0FBRSxJQUFJLE1BQUUsR0FBRyxHQUFHLENBQUMsQ0FBQTtBQUN2Q0EsSUFBTSxDQUFDLEdBQUcsSUFBSSxNQUFNLEVBQUMsSUFBRyxHQUFF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
