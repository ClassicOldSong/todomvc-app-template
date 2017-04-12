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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var loglevel = createCommonjsModule(function (module) {
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(commonjsGlobal, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        var this$1 = this;

        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this$1[methodName] = (i < level) ?
                noop :
                this$1.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));
});

var tag = '[EF]';
var logger = loglevel.getLogger('ef');

var trace = logger.trace.bind(null, tag);
var debug = logger.debug.bind(null, tag);
var info = logger.info.bind(null, tag);
var warn = logger.warn.bind(null, tag);
var error = logger.error.bind(null, tag);

var warnAttachment = function (state) { return error('Detach the component before attaching it to a new component! Component to be detached:', state); };
var warnParentNode = function () { return error('Cannot mount a component to it\'s child component!'); };

{
	logger.setLevel('trace');
}

info('Debug logging enabled!');

// Set the escape character
var char = '&';

// Initlize RegExp
var oct = new RegExp(("\\" + char + "[0-7]{1,3}"), 'g');
var ucp = new RegExp(("\\" + char + "u\\[.*?\\]"), 'g');
var uni = new RegExp(("\\" + char + "u.{0,4}"), 'g');
var hex = new RegExp(("\\" + char + "x.{0,2}"), 'g');
var esc = new RegExp(("\\" + char), 'g');
var b = new RegExp(("\\" + char + "b"), 'g');
var t = new RegExp(("\\" + char + "t"), 'g');
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
			.replace(t, '\t')
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
var reserved = 'attached data element nodes methods subscribe unsubscribe update destroy'.split(' ').map(function (i) { return ("$" + i); });
var fullMustache = /^\{\{.*\}\}$/;
var mustache = /\{\{.+?\}\}/g;
var spaceIndent = /^(\t*)( *).*/;

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
		parsingInfo.indentReg = new RegExp(spaces);
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
	string = string.substr(2, string.length - 4);
	var ref = string.split('=');
	var _path = ref[0];
	var _default = ref.slice(1);
	var pathArr = _path.trim().split('.');
	var defaultVal = escapeParser(_default.join('=').trim());
	if (defaultVal) { return [pathArr, defaultVal] }
	return [pathArr]
};

var parseTag = function (string) {
	var ref = string.split('#');
	var content = ref[0];
	var name = ref.slice(1);
	var ref$1 = content.split('.');
	var tag = ref$1[0];
	var classes = ref$1.slice(1);
	var classValue = classes.join('.');
	if (fullMustache.test(classValue)) { return {
		tag: tag,
		name: name.join('#'),
		class: splitDefault(classValue)
	} }
	return {
		tag: tag,
		name: name.join('#'),
		class: classes.join(' ')
	}
};

var parseNodeProps = function (string) {
	var splited = string.split('=');
	var name = splited.shift().trim();
	var value = splited.join('=').trim();
	if (fullMustache.test(value)) { return { name: name, value: splitDefault(value) } }
	return { name: name, value: escapeParser(value) }
};

var parseText = function (string) {
	var parts = [];
	var mustaches = string.match(mustache);
	if (mustaches) {
		var texts = string.split(mustache);
		for (var i = 0; i < texts.length; i++) {
			if (texts[i]) { parts.push(escapeParser(texts[i])); }
			if (mustaches[i]) { parts.push(splitDefault(mustaches[i])); }
		}
	} else { parts.push(escapeParser(string)); }
	return parts
};

var splitEvents = function (string) {
	var ref = string.split(':');
	var name = ref[0];
	var value = ref.slice(1);
	var content = value.join(':');
	if (content) {
		if (fullMustache.test(content)) { return [name.trim(), splitDefault(content)] }
		return [name.trim(), escapeParser(value.join(':'))]
	}
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
				if (info.name) { newNode[0].n = info.name; }
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
				var ref$4 = parseNodeProps(content);
				var name$2 = ref$4.name;
				var value$2 = ref$4.value;
				if (typeof value$2 !== 'string') { throw new SyntaxError(getErrorMsg('Methods should not be wrapped in mustaches', i)) }
				if (!parsingInfo.currentNode[0].e) { parsingInfo.currentNode[0].e = {}; }
				parsingInfo.currentNode[0].e[name$2] = splitEvents(value$2);
				parsingInfo.prevType = 'event';
				break
			}
			case '.': {
				(ref$5 = parsingInfo.currentNode).push.apply(ref$5, parseText(content));
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
	var ref$5;
};

var eftParser = function (template) {
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

// Tree structure
// Lines not started with >#%@.+- are considered as comments
// this is a comment
// '>' stands for tag name
// >div
// 	'#' stands for attributes
// 	#class = {{class}}
// 	#style = {{attr.style}}
// 	#id = testdiv
// 	#some-attr = some text
// 	#content =
// 	'%' stands for properties
// 	%title = {{name}}
// 	%anotherProperty = text
// 	%contentEditable = {{edit}}
// 	'@' stands for events
// 	@click = updateInfo
// 	@mousedown = setState
// 	'.' stands for text nodes
// 	.Name: {{name}}&nJob: {{job}}
// 	>br
// 	'-' stands for standard mounting point
// 	-node1
// 	>p
// 		#class = some class names
// 		'.' after tag name means static class name, just like what you do in emmet
// 		'#' at the end of the tag announcement will generate a quick access point
// 		of this element in the state tree
// 		>span.notice#notice
// 			.Notice: {{notice}}
// 		.some text
// 		-node2
// 		'+' stands for list mounting point
// 		+list1

var parse = function (template, parser) {
	if (!parser) { parser = eftParser; }
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

var index$1 = function (x) {
	var type = typeof x;
	return x !== null && (type === 'object' || type === 'function');
};

var isObj = index$1;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Sources cannot be null or undefined');
	}

	return Object(val);
}

function assignKey(to, from, key) {
	var val = from[key];

	if (val === undefined || val === null) {
		return;
	}

	if (hasOwnProperty.call(to, key)) {
		if (to[key] === undefined || to[key] === null) {
			throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
		}
	}

	if (!hasOwnProperty.call(to, key) || !isObj(val)) {
		to[key] = val;
	} else {
		to[key] = assign(Object(to[key]), from[key]);
	}
}

function assign(to, from) {
	if (to === from) {
		return to;
	}

	from = Object(from);

	for (var key in from) {
		if (hasOwnProperty.call(from, key)) {
			assignKey(to, from, key);
		}
	}

	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(from);

		for (var i = 0; i < symbols.length; i++) {
			if (propIsEnumerable.call(from, symbols[i])) {
				assignKey(to, from, symbols[i]);
			}
		}
	}

	return to;
}

var index = function deepAssign(target) {
	var arguments$1 = arguments;

	target = toObject(target);

	for (var s = 1; s < arguments.length; s++) {
		assign(target, arguments$1[s]);
	}

	return target;
};

var resolvePath = function (path, obj) {
	for (var i$1 = 0, list = path; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		if (!obj[i]) { obj[i] = {}; }
		obj = obj[i];
	}
	return obj
};

var resolveReactivePath = function (path, obj) {
	for (var i$1 = 0, list = path; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		if (!obj[i]) {
			var node = {};
			Object.defineProperty(obj, i, {
				get: function get() {
					return node
				},
				set: function set(data) {
					index(node, data);
				},
				enumerable: true
			});
		}
		obj = obj[i];
	}
	return obj
};

var resolve = function (ref) {
	var path = ref.path;
	var _key = ref._key;
	var parentNode = ref.parentNode;
	var subscriberNode = ref.subscriberNode;
	var dataNode = ref.dataNode;

	if (path.length > 0) {
		parentNode = resolveReactivePath(path, parentNode);
		subscriberNode = resolvePath(path, subscriberNode);
		dataNode = resolvePath(path, dataNode);
	}
	if (!subscriberNode[_key]) { subscriberNode[_key] = []; }
	if (!Object.hasOwnProperty.call(dataNode, _key)) { dataNode[_key] = ''; }
	return { parentNode: parentNode, subscriberNode: subscriberNode[_key], dataNode: dataNode }
};

var resolveSubscriber = function (path, subscriber) {
	var pathArr = path.split('.');
	var key = pathArr.pop();
	return resolvePath(pathArr, subscriber)[key]
};

var initBinding = function (ref) {
	var bind = ref.bind;
	var state = ref.state;
	var subscriber = ref.subscriber;
	var innerData = ref.innerData;
	var handler = ref.handler;

	var path = ARR.copy(bind[0]);
	var _default = bind[1];
	var _key = path.pop();
	var ref$1 = resolve({
		path: path,
		_key: _key,
		parentNode: state.$data,
		subscriberNode: subscriber,
		dataNode: innerData
	});
	var parentNode = ref$1.parentNode;
	var subscriberNode = ref$1.subscriberNode;
	var dataNode = ref$1.dataNode;
	if (!Object.hasOwnProperty.call(parentNode, _key)) {
		Object.defineProperty(parentNode, _key, {
			get: function get() {
				return dataNode[_key]
			},
			set: function set(value) {
				if (dataNode[_key] === value) { return }
				dataNode[_key] = value;
				for (var i = 0, list = subscriberNode; i < list.length; i += 1) {
					var j = list[i];

					j.call(state, value);
				}
			},
			enumerable: true
		});
	}
	if (_default) {
		parentNode[_key] = _default;
	}

	if (handler) {
		if (parentNode[_key]) { handler(parentNode[_key]); }
		subscriberNode.push(handler);
	}

	return {dataNode: dataNode, subscriberNode: subscriberNode, _key: _key}
};

var getElement = function (tag, _name, nodes) {
	var element = document.createElement(tag);
	if (_name) { Object.defineProperty(nodes, _name, {
		value: element,
		enumerable: true
	}); }
	return element
};

var updateOthers = function (ref) {
	var dataNode = ref.dataNode;
	var subscriberNode = ref.subscriberNode;
	var handler = ref.handler;
	var state = ref.state;
	var _key = ref._key;
	var value = ref.value;

	if (dataNode[_key] === value) { return }
	dataNode[_key] = value;
	for (var i$1 = 0, list = subscriberNode; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		if (i !== handler) { i.call(state, value); }
	}
};

var addValListener = function (ref) {
	var dataNode = ref.dataNode;
	var subscriberNode = ref.subscriberNode;
	var handler = ref.handler;
	var state = ref.state;
	var element = ref.element;
	var key = ref.key;
	var _key = ref._key;

	if (key === 'value') {
		element.addEventListener('input', function () { return updateOthers({dataNode: dataNode, subscriberNode: subscriberNode, handler: handler, state: state, _key: _key, value: element.value}); }, true);
		element.addEventListener('change', function () { return updateOthers({dataNode: dataNode, subscriberNode: subscriberNode, handler: handler, state: state, _key: _key, value: element.value}); }, true);
	} else { element.addEventListener('change', function () { return updateOthers({dataNode: dataNode, subscriberNode: subscriberNode, handler: handler, state: state, _key: _key, value: element.checked}); }, true); }
};

var addAttr = function (ref) {
	var element = ref.element;
	var attr = ref.attr;
	var key = ref.key;
	var state = ref.state;
	var subscriber = ref.subscriber;
	var innerData = ref.innerData;

	if (typeof attr === 'string') { element.setAttribute(key, attr); }
	else { initBinding({bind: attr, state: state, subscriber: subscriber, innerData: innerData, handler: function (value) { return element.setAttribute(key, value); }}); }
};

var addProp = function (ref) {
	var element = ref.element;
	var prop = ref.prop;
	var key = ref.key;
	var state = ref.state;
	var subscriber = ref.subscriber;
	var innerData = ref.innerData;

	if (typeof prop === 'string') { element[key] = prop; }
	else {
		var handler = function (value) {
			element[key] = value;
		};
		var ref$1 = initBinding({bind: prop, state: state, subscriber: subscriber, innerData: innerData, handler: handler});
		var dataNode = ref$1.dataNode;
		var subscriberNode = ref$1.subscriberNode;
		var _key = ref$1._key;
		if (key === 'value' || key === 'checked') { addValListener({dataNode: dataNode, subscriberNode: subscriberNode, handler: handler, state: state, element: element, key: key, _key: _key}); }
	}
};

var addEvent = function (ref) {
	var element = ref.element;
	var event = ref.event;
	var key = ref.key;
	var state = ref.state;
	var subscriber = ref.subscriber;
	var innerData = ref.innerData;

	var method = event[0];
	var value = event[1];
	if (Array.isArray(value)) {
		var ref$1 = initBinding({bind: value, state: state, subscriber: subscriber, innerData: innerData});
		var dataNode = ref$1.dataNode;
		var _key = ref$1._key;
		element.addEventListener(key, function (e) {
			if (state.$methods[method]) { state.$methods[method]({e: e, value: dataNode[_key], state: state}); }
			else { warn(("Method named '" + method + "' not found!")); }
		});
		return
	}
	element.addEventListener(key, function (e) {
		if (state.$methods[method]) { state.$methods[method]({e: e, value: value, state: state}); }
		else { warn(("Method named '" + method + "' not found!")); }
	}, false);
};

var createElement = function (ref) {
	var info$$1 = ref.info;
	var state = ref.state;
	var innerData = ref.innerData;
	var nodes = ref.nodes;
	var subscriber = ref.subscriber;

	var tag = info$$1.t;
	var attr = info$$1.a;
	var prop = info$$1.p;
	var event = info$$1.e;
	var _name = info$$1.n;
	var element = getElement(tag, _name, nodes);
	for (var i in attr) { addAttr({element: element, attr: attr[i], key: i, state: state, subscriber: subscriber, innerData: innerData}); }
	for (var i$1 in prop) { addProp({element: element, prop: prop[i$1], key: i$1, state: state, subscriber: subscriber, innerData: innerData}); }
	for (var i$2 in event) { addEvent({element: element, event: event[i$2], key: i$2, state: state, subscriber: subscriber, innerData: innerData}); }
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

		if (node.parentNode) {
			var tempFragment = document.createDocumentFragment();
			nodes.reverse();
			for (var i$1 = 0, list = nodes; i$1 < list.length; i$1 += 1) {
				var i = list[i$1];

				proto$1.appendChild.call(tempFragment, i);
			}
			proto$1.insertBefore.call(node.parentNode, tempFragment, node);
		}
	},

	after: function after(node) {
		var nodes = [], len = arguments.length - 1;
		while ( len-- > 0 ) nodes[ len ] = arguments[ len + 1 ];

		if (node.parentNode) {
			var tempFragment = document.createDocumentFragment();
			for (var i$1 = 0, list = nodes; i$1 < list.length; i$1 += 1) {
				var i = list[i$1];

				proto$1.appendChild.call(tempFragment, i);
			}
			if (node.nextSibling) {
				proto$1.insertBefore.call(node.parentNode, tempFragment, node.nextSibling);
			} else {
				proto$1.appendChild.call(node.parentNode, tempFragment);
			}
		}
	},

	append: function append(node) {
		var nodes = [], len = arguments.length - 1;
		while ( len-- > 0 ) nodes[ len ] = arguments[ len + 1 ];

		if ([1,9,11].indexOf(node.nodeType) === -1) {
			return
		}
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

		for (var i$1 = 0, list = this$1; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			DOM.remove(i.$element);
			i.$destroy();
		}
		ARR.empty(this);
	},
	pop: function pop() {
		if (this.length === 0) { return }
		var poped = ARR.pop(this);
		DOM.remove(poped.$element);
		return poped
	},
	push: function push(anchor) {
		var items = [], len = arguments.length - 1;
		while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

		var elements = [];
		for (var i$1 = 0, list = items; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			if (i.$attached) { return warnAttachment(i) }
			ARR.push(elements, i.$element);
		}
		if (this.length === 0) { DOM.after.apply(DOM, [ anchor ].concat( elements )); }
		else { DOM.after.apply(DOM, [ this[this.length - 1].$element ].concat( elements )); }
		return ARR.push.apply(ARR, [ this ].concat( items ))
	},
	remove: function remove() {
		var this$1 = this;
		var items = [], len = arguments.length;
		while ( len-- ) items[ len ] = arguments[ len ];

		var removedItems = [];
		for (var i$1 = 0, list = items; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			var removed = ARR.remove(this$1, i);
			if (removed) {
				DOM.remove(removed.$element);
				ARR.push(removedItems, removed);
			}
		}
		return removedItems
	},
	reverse: function reverse() {
		var this$1 = this;

		if (this.length === 0) { return this }
		var insertPoint = document.createTextNode('');
		DOM.before(this[0].$element, insertPoint);
		var elements = [];
		for (var i = this.length - 1; i >= 0; i--) { ARR.push(elements, this$1[i].$element); }
		DOM.after.apply(DOM, [ insertPoint ].concat( elements ));
		DOM.remove(insertPoint);
		return ARR.reverse(this)
	},
	shift: function shift() {
		if (this.length === 0) { return }
		var shifted = ARR.shift(this);
		DOM.remove(shifted.$element);
		return shifted
	},
	sort: function sort(fn) {
		var this$1 = this;

		if (this.length === 0) { return this }
		var insertPoint = document.createTextNode('');
		DOM.before(this[0].$element, insertPoint);
		var sorted = ARR.sort(this, fn);
		var elements = [];
		for (var i$1 = 0, list = this$1; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			ARR.push(elements, i.$element);
		}
		DOM.after.apply(DOM, [ insertPoint ].concat( elements ));
		DOM.remove(insertPoint);
		return sorted
	},
	splice: function splice() {
		var this$1 = this;
		var args = [], len = arguments.length;
		while ( len-- ) args[ len ] = arguments[ len ];

		if (this.length === 0) { return this }
		var insertPoint = document.createTextNode('');
		DOM.before(this[0].$element, insertPoint);
		var spliced = ARR.splice.apply(ARR, [ this ].concat( args ));
		var elements = [];
		for (var i$2 = 0, list = spliced; i$2 < list.length; i$2 += 1) {
			var i = list[i$2];

			DOM.remove(i.$element);
		}
		for (var i$3 = 0, list$1 = this$1; i$3 < list$1.length; i$3 += 1) {
			var i$1 = list$1[i$3];

			ARR.push(elements, i$1.$element);
		}
		DOM.after.apply(DOM, [ insertPoint ].concat( elements ));
		DOM.remove(insertPoint);
		return spliced
	},
	unshift: function unshift() {
		var items = [], len = arguments.length;
		while ( len-- ) items[ len ] = arguments[ len ];

		if (this.length === 0) { return (ref = this).push.apply(ref, items).length }
		var insertPoint = document.createTextNode('');
		DOM.before(this[0].$element, insertPoint);
		var elements = [];
		for (var i$1 = 0, list = items; i$1 < list.length; i$1 += 1) {
			var i = list[i$1];

			if (i.$attached) { return warnAttachment(i) }
			ARR.push(elements, i.$element);
		}
		DOM.after.apply(DOM, [ insertPoint ].concat( elements ));
		DOM.remove(insertPoint);
		return ARR.unshift.apply(ARR, [ this ].concat( items ))
		var ref;
	}
};

var defineArr = function (arr, anchor) {
	Object.defineProperties(arr, {
		empty: {value: DOMARR.empty},
		pop: {value: DOMARR.pop},
		push: {value: DOMARR.push.bind(arr, anchor)},
		remove: {value: DOMARR.remove},
		reverse: {value: DOMARR.reverse},
		shift: {value: DOMARR.shift},
		sort: {value: DOMARR.sort},
		splice: {value: DOMARR.splice},
		unshift: {value: DOMARR.unshift}
	});
	return arr
};

var typeOf = function (obj) {
	if (Array.isArray(obj)) { return 'array' }
	return typeof obj
};

var reserved$1 = 'attached data element nodes methods subscribe unsubscribe update destroy'
	.split(' ').map(function (i) { return ("$" + i); });

var bindTextNode = function (ref) {
	var node = ref.node;
	var state = ref.state;
	var subscriber = ref.subscriber;
	var innerData = ref.innerData;
	var element = ref.element;

	// Data binding text node
	var textNode = document.createTextNode('');
	var handler = function (value) {
		textNode.textContent = value;
	};
	initBinding({bind: node, state: state, subscriber: subscriber, innerData: innerData, handler: handler});

	// Append element to the component
	DOM.append(element, textNode);
};

var updateMountingNode = function (ref) {
	var $element = ref.$element;
	var children = ref.children;
	var name = ref.name;
	var anchor = ref.anchor;
	var value = ref.value;

	if (children[name] === value) { return }
	if (value) {
		if (value.$attached) { warnAttachment(value); }
		if (value.$element.contains($element)) { return warnParentNode() }
	}
	// Update component
	if (children[name]) { DOM.remove(children[name].$element); }
	if (value) { DOM.after(anchor, value.$element); }
	// Update stored value
	children[name] = value;
};

var bindMountingNode = function (ref) {
	var state = ref.state;
	var name = ref.name;
	var children = ref.children;
	var anchor = ref.anchor;

	Object.defineProperty(state, name, {
		get: function get() {
			return children[name]
		},
		set: function set(value) {
			updateMountingNode({$element: state.$element, children: children, name: name, anchor: anchor, value: value});
		},
		enumerable: true,
		configurable: true
	});
};

var updateMountingList = function (ref) {
	var $element = ref.$element;
	var children = ref.children;
	var name = ref.name;
	var anchor = ref.anchor;
	var value = ref.value;

	if (value) { value = ARR.copy(value); }
	else { value = []; }
	var fragment = document.createDocumentFragment();
	// Update components
	if (children[name]) {
		for (var i = 0, list = value; i < list.length; i += 1) {
			var j = list[i];

			if (j.$element.contains($element)) { return warnParentNode() }
			DOM.append(fragment, j.$element);
			ARR.remove(children[name], j);
		}
		for (var i$1 = 0, list$1 = children[name]; i$1 < list$1.length; i$1 += 1) {
			var j$1 = list$1[i$1];

			DOM.remove(j$1.$element);
		}
	} else { for (var i$2 = 0, list$2 = value; i$2 < list$2.length; i$2 += 1) {
		var j$2 = list$2[i$2];

		DOM.append(fragment, j$2.$element);
	} }
	// Update stored value
	children[name].length = 0;
	ARR.push.apply(ARR, [ children[name] ].concat( value ));
	// Append to current component
	DOM.after(anchor, fragment);
};

var bindMountingList = function (ref) {
	var state = ref.state;
	var name = ref.name;
	var children = ref.children;
	var anchor = ref.anchor;

	children[name] = defineArr([], anchor);
	Object.defineProperty(state, name, {
		get: function get() {
			return children[name]
		},
		set: function set(value) {
			if (children[name] && ARR.equals(children[name], value)) { return }
			updateMountingList({$element: state.$element, children: children, name: name, anchor: anchor, value: value});
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
	var nodes = ref.nodes;
	var children = ref.children;
	var subscriber = ref.subscriber;
	var create = ref.create;

	switch (nodeType) {
		case 'string': {
			// Static text node
			DOM.append(element, document.createTextNode(node));
			break
		}
		case 'array': {
			if (typeOf(node[0]) === 'object') { DOM.append(element, create({ast: node, state: state, innerData: innerData, nodes: nodes, children: children, subscriber: subscriber, create: create})); }
			else { bindTextNode({node: node, state: state, subscriber: subscriber, innerData: innerData, element: element}); }
			break
		}
		case 'object': {
			if (reserved$1.indexOf(node.n) !== -1) {
				warn(("Reserved name '" + (node.n) + "' should not be used, ignoring."));
				break
			}
			var anchor = document.createTextNode('');
			if (node.t === 0) { bindMountingNode({state: state, name: node.n, children: children, anchor: anchor}); }
			else if (node.t === 1) { bindMountingList({state: state, name: node.n, children: children, anchor: anchor}); }
			else { throw new TypeError(("Not a standard ef.js AST: Unknown mounting point type '" + (node.t) + "'")) }
			// Append placeholder
			DOM.append(element, anchor);
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

var create = function (ref) {
	var ast = ref.ast;
	var state = ref.state;
	var innerData = ref.innerData;
	var nodes = ref.nodes;
	var children = ref.children;
	var subscriber = ref.subscriber;
	var create = ref.create;

	// First create an element according to the description
	var element = createElement({info: ast[0], state: state, innerData: innerData, nodes: nodes, subscriber: subscriber});

	// Append child nodes
	for (var i = 1; i < ast.length; i++) { resolveAST({node: ast[i], nodeType: typeOf(ast[i]),element: element, state: state, innerData: innerData, nodes: nodes, children: children, subscriber: subscriber, create: create}); }

	return element
};

var toStr$2 = Object.prototype.toString;

var isArguments = function isArguments(value) {
	var str = toStr$2.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr$2.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

var has = Object.prototype.hasOwnProperty;
var toStr$1 = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = isArguments;
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr$1.call(object) === '[object Function]';
	var isArguments$$1 = isArgs(object);
	var isString = isObject && toStr$1.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments$$1) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments$$1 && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

var index$6 = keysShim;

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var index$8 = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};

var keys = index$6;
var foreach = index$8;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties$1 = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties$1.supportsDescriptors = !!supportsDescriptors;

var index$4 = defineProperties$1;

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice$1 = Array.prototype.slice;
var toStr$3 = Object.prototype.toString;
var funcType = '[object Function]';

var implementation$4 = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr$3.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice$1.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice$1.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice$1.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var implementation$3 = implementation$4;

var index$10 = Function.prototype.bind || implementation$3;

var keys$2 = index$6;

var hasSymbols$2 = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; }
	if (keys$2(obj).length !== 0) { return false; }
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

var keys$1 = index$6;
var bind = index$10;
var canBeObject = function (obj) {
	return typeof obj !== 'undefined' && obj !== null;
};
var hasSymbols$1 = hasSymbols$2();
var toObject$1 = Object;
var push = bind.call(Function.call, Array.prototype.push);
var propIsEnumerable$1 = bind.call(Function.call, Object.prototype.propertyIsEnumerable);
var originalGetSymbols = hasSymbols$1 ? Object.getOwnPropertySymbols : null;

var implementation$1 = function assign(target, source1) {
	var arguments$1 = arguments;

	if (!canBeObject(target)) { throw new TypeError('target must be an object'); }
	var objTarget = toObject$1(target);
	var s, source, i, props, syms, value, key;
	for (s = 1; s < arguments.length; ++s) {
		source = toObject$1(arguments$1[s]);
		props = keys$1(source);
		var getSymbols = hasSymbols$1 && (Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			syms = getSymbols(source);
			for (i = 0; i < syms.length; ++i) {
				key = syms[i];
				if (propIsEnumerable$1(source, key)) {
					push(props, key);
				}
			}
		}
		for (i = 0; i < props.length; ++i) {
			key = props[i];
			value = source[key];
			if (propIsEnumerable$1(source, key)) {
				objTarget[key] = value;
			}
		}
	}
	return objTarget;
};

var implementation$6 = implementation$1;

var lacksProperEnumerationOrder = function () {
	if (!Object.assign) {
		return false;
	}
	// v8, specifically in node 4.x, has a bug with incorrect property enumeration order
	// note: this does not detect the bug unless there's 20 characters
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function () {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	// Firefox 37 still has "pending exception" logic in its Object.assign implementation,
	// which is 72% slower than our shim, and Firefox 40's native implementation.
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

var polyfill$1 = function getPolyfill() {
	if (!Object.assign) {
		return implementation$6;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation$6;
	}
	if (assignHasPendingExceptions()) {
		return implementation$6;
	}
	return Object.assign;
};

var define$1 = index$4;
var getPolyfill$1 = polyfill$1;

var shim$1 = function shimAssign() {
	var polyfill = getPolyfill$1();
	define$1(
		Object,
		{ assign: polyfill },
		{ assign: function () { return Object.assign !== polyfill; } }
	);
	return polyfill;
};

var defineProperties = index$4;

var implementation = implementation$1;
var getPolyfill = polyfill$1;
var shim = shim$1;

var polyfill = getPolyfill();

defineProperties(polyfill, {
	implementation: implementation,
	getPolyfill: getPolyfill,
	shim: shim
});

var index$3 = polyfill;

var assign$1 = Object.assign || index$3;

/* Ast structure:
 * ast = [
 * 	{
 * 		tag: 'div',
 * 		attr: {
 * 			class: [['class'], 'some classname'],
 * 			style: [['attr', 'style']],
 * 			id: 'testdiv',
 * 			'some-attr': 'some text'
 * 			content: null
 * 		},
 * 		prop: {
 * 			title: [['name']],
 * 			anotherProperty: 'text',
 * 			contentEditable: [['edit']]
 * 		}
 * 		event: {
 * 			click: ['updateInfo', ['info']],
 * 			mousedown: 'setState'
 * 		}
 * 	},
 * 	'name: ',
 * 	[['name']],
 * 	'\nJob: ',
 * 	[['job']],
 * 	[
 * 		{
 * 			tag: 'br',
 * 		}
 * 	],
 * 	{ name: 'node1', type: 'node' },
 * 	[
 * 		{
 * 			tag: 'p',
 * 			attr: {
 * 				class: 'some class name'
 * 			}
 * 		},
 * 		[
 * 			{
 * 				tag: 'span'
 * 			},
 * 			'Notice: ',
 * 			[['notice']]
 * 		],
 * 		'some text',
 * 		{ name: 'node2', type: 'node' },
 * 		{ name: 'list1', type: 'list' }
 * 	]
 * ]
 */

var unsubscribe = function (path, fn, subscriber) {
	var subscriberNode = resolveSubscriber(path, subscriber);
	var index$$1 = subscriberNode.indexOf(fn);
	if (index$$1 === -1) { return }
	ARR.remove(subscriberNode, fn);
};

var checkAttached = function () {
	return !!this.$element.parentNode
};

var update = function (state) {
	var tmpState = assign$1({}, state);
	if (tmpState.$data) {
		assign$1(this.$data, tmpState.$data);
		delete(tmpState.$data);
	}
	if (tmpState.$methods) {
		assign$1(this.$methods, tmpState.$methods);
		delete(tmpState.$methods);
	}
	assign$1(this, tmpState);
};

var destroy$1 = function() {
	var this$1 = this;

	for (var i in this$1) {
		this$1[i] = null;
		delete this$1[i];
	}
	delete this.$element;
	delete this.$data;
	delete this.$methods;
	delete this.$nodes;
	delete this.$subscribe;
	delete this.$unsubscribe;
	delete this.$attached;
	delete this.$update;
	delete this.$destroy;
};

var render = function (ast) {
	var state = {};
	var children = {};
	var nodes = {};
	var data = {};
	var innerData = {};
	var methods = {};
	var subscriber = {};
	Object.defineProperties(state, {
		$data: {
			get: function get() {
				return data
			},
			set: function set(newData) {
				index(data, newData);
			},
			configurable: true
		},
		$methods: {
			get: function get() {
				return methods
			},
			set: function set(newMethods) {
				index(methods, newMethods);
			},
			configurable: true
		},
		$nodes: {
			get: function get() {
				return nodes
			},
			configurable: true
		},
		$subscribe: {
			value: function (pathStr, handler) {
				var path = pathStr.split('.');
				initBinding({bind: [path], state: state, subscriber: subscriber, innerData: innerData, handler: handler});
			},
			configurable: true
		},
		$unsubscribe: {
			value: function (path, fn) {
				unsubscribe(path, fn, subscriber);
			},
			configurable: true
		},
		$attached: {
			get: checkAttached,
			configurable: true
		},
		$update: {
			value: update,
			configurable: true
		},
		$destroy: {
			value: destroy$1,
			configurable: true
		}
	});
	var element = create({ast: ast, state: state, innerData: innerData, nodes: nodes, children: children, subscriber: subscriber, create: create});
	Object.defineProperty(state, '$element', {
		value: element,
		configurable: true
	});
	return state
};

var mixStr = function (strs) {
	var exprs = [], len = arguments.length - 1;
	while ( len-- > 0 ) exprs[ len ] = arguments[ len + 1 ];

	var string = '';
	for (var i = 0; i < exprs.length; i++) { string += (strs[i] + exprs[i]); }
	return string + strs[strs.length - 1]
};

var version = "0.1.2-alpha.8";

/* global "master.5ef5270" */

// Import everything
var parser = eftParser;

// Construct the class
var ef = (function () {
	function ef(value) {
		var valType = typeOf(value);
		if (valType === 'string') { value = parse(value, parser); }
		else if (valType !== 'array') { throw new TypeError('Cannot create new component without proper template or AST!') }

		var ast = value;
		Object.defineProperty(this, 'render', {
			value: function (state) {
				var result = render(ast);
				if (state) { result.$update(state); }
				return result
			}
		});
	}

	ef.setPatser = function setPatser (newParser) {
		parser = newParser;
	};

	ef.parseEft = function parseEft (template) {
		return eftParser(template)
	};

	ef.t = function t () {
		var strs = [], len = arguments.length;
		while ( len-- ) strs[ len ] = arguments[ len ];

		return new ef(mixStr.apply(void 0, strs))
	};

	return ef;
}());

info(("ef.js v" + version + "." + ("master.5ef5270") + " initialized!"));

var _todoapp = new ef([{"t":"section","a":{"class":"todoapp"}},[{"t":"header","a":{"class":"header"}},[{"t":"h1"},"todos"],[{"t":"input","a":{"class":"new-todo","placeholder":"What needs to be done?","autofocus":""},"n":"input","p":{"value":[["input"]]},"e":{"keypress":["addTodo",[["input"]]]}}]],{"n":"main","t":0},{"n":"footer","t":0}]);

var _main = new ef([{"t":"section","a":{"class":"main","style":"display: none;"}},[{"t":"input","a":{"class":"toggle-all","id":"toggle-all","type":"checkbox"},"p":{"checked":[["allCompleted"]]}}],[{"t":"label","a":{"for":"toggle-all"}},"Mark all as complete"],[{"t":"ul","a":{"class":"todo-list"}},{"n":"todos","t":1}]]);

var _todo = new ef([{"t":"li","a":{"class":"todo"}},[{"t":"div","a":{"class":"view"}},[{"t":"input","a":{"class":"toggle","type":"checkbox"},"p":{"checked":[["completed"]]}}],[{"t":"label","e":{"dblclick":["edit"]}},[["title"]]],[{"t":"button","a":{"class":"destroy"},"e":{"click":["destroy"]}}]],[{"t":"input","a":{"class":"edit"},"n":"edit","p":{"value":[["update"]]},"e":{"keydown":["confirm"],"blur":["confirm"]}}]]);

var _footer = new ef([{"t":"footer","a":{"class":"footer","style":"display: none;"}},[{"t":"span","a":{"class":"todo-count"}},[{"t":"strong"},[["count"],"0"]]," item",[["s"]]," left"],[{"t":"ul","a":{"class":"filters"}},[{"t":"li"},[{"t":"a","a":{"class":[["allSelected"]],"href":"#/"}},"All"]],[{"t":"li"},[{"t":"a","a":{"class":[["activeSelected"]],"href":"#/active"}},"Active"]],[{"t":"li"},[{"t":"a","a":{"class":[["completedSelected"]],"href":"#/completed"}},"Completed"]]],[{"t":"button","a":{"class":"clear-completed","style":"display: none;"},"n":"clear","e":{"click":["clear"]}},"Clear completed"]]);

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

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

var todoapp = _todoapp.render();
var main = _main.render();
var footer = _footer.render();
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
	if (l.$data.order > r.$data.order) { return 1 }
	return -1
};

var updateList = function (hash) {
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

	if (completed.length === 0) { footer.$nodes.clear.style.display = 'none'; }
	else { footer.$nodes.clear.style.display = 'block'; }
	footer.$data.count = todos.length;
	if (todos.length > 1) { footer.$data.s = 's'; }
	else { footer.$data.s = ''; }
};

var toggleAll = function (value) {
	if (value) {
		var _todos = ARR$2.copy(todos);
		for (var i$2 = 0, list = _todos; i$2 < list.length; i$2 += 1) {
			var i = list[i$2];

			i.$data.completed = true;
		}
	} else if (completed.length === all.length) {
		var _completed = ARR$2.copy(completed);
		for (var i$3 = 0, list$1 = _completed; i$3 < list$1.length; i$3 += 1) {
			var i$1 = list$1[i$3];

			i$1.$data.completed = false;
		}
	}
	if (location.hash !== '#/') { updateList(location.hash); }
};

var clear = function () {
	for (var i$1 = 0, list = completed; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		ARR$2.remove(all, i);
		ARR$2.remove(storage, i.$data);
		main.todos.remove(i);
		i.$destroy();
	}
	completed.length = 0;
	updateCount();
	updateStorage();
	updateList(location.hash);
};

var destroy = function (ref) {
	var state = ref.state;

	ARR$2.remove(all, state);
	main.todos.remove(state);

	ARR$2.remove(storage, state.$data);
	ARR$2.remove(todos, state);
	ARR$2.remove(completed, state);

	state.$destroy();
	updateCount();
	updateStorage();
	updateList(location.hash);
};

var toggleComplete = function(checked) {
	if (checked) {
		this.$element.classList.add('completed');
		ARR$2.remove(todos, this);
		completed.push(this);
		if (location.hash === '#/active') { main.todos.remove(this); }
	} else {
		this.$element.classList.remove('completed');
		todos.push(this);
		ARR$2.remove(completed, this);
		if (location.hash === '#/completed') { main.todos.remove(this); }
	}
	updateCount();
	updateStorage();
};

var confirmEdit = function (state) {
	var newVal = state.$data.update.trim();
	state.$methods.confirm = null;
	if (!newVal) { return destroy({state: state}) }
	state.$element.classList.remove('editing');
	state.$data.title = newVal;
	state.$data.update = '';
	updateStorage();
};

var cancleEdit = function (state) {
	state.$element.classList.remove('editing');
	state.$methods.confirm = null;
	state.$data.update = '';
};

var confirm = function (ref) {
	var e = ref.e;
	var state = ref.state;

	if (e.keyCode === ENTER_KEY || e.type === 'blur') {
		e.preventDefault();
		return confirmEdit(state)
	}
	if (e.keyCode === ESCAPE_KEY) { return cancleEdit(state) }
};

var edit = function (ref) {
	var state = ref.state;

	state.$element.classList.add('editing');
	state.$data.update = state.$data.title;
	state.$methods.confirm = confirm;
	state.$nodes.edit.focus();
};

var add = function (value) {
	value.order = order += 1;
	value.completed = !!value.completed;
	var todo = _todo.render({
		$data: value,
		$methods: {
			edit: edit,
			destroy: destroy
		}
	});

	all.push(todo);
	storage.push(todo.$data);

	if (!value.completed) {
		todos.push(todo);
		if (location.hash !== '#/completed') { main.todos.push(todo); }
	}

	todo.$subscribe('completed', toggleComplete.bind(todo));

	updateCount();
	updateStorage();

	todoapp.$nodes.input.focus();
};

var addTodo = function (ref) {
	var e = ref.e;
	var state = ref.state;
	var value = ref.value;

	value = value.trim();
	if (e.keyCode !== ENTER_KEY || !value) { return }
	state.$data.input = '';
	add({
		title: value,
		completed: false
	});
};

todoapp.$methods.addTodo = addTodo;
footer.$methods.clear = clear;
main.$subscribe('allCompleted', toggleAll);

var lastStorage = localStorage.getItem('todos-ef');
if (lastStorage) {
	var lastTodos = JSON.parse(lastStorage);
	for (var i$1 = 0, list = lastTodos; i$1 < list.length; i$1 += 1) {
		var i = list[i$1];

		add(i);
	}
}

if (!(/^#\/(active|completed)?$/).test(location.hash)) { window.location = '#/'; }

updateList(location.hash);

window.addEventListener('hashchange', function () { return updateList(location.hash); });

document.querySelector('body').replaceChild(todoapp.$element, document.querySelector('.todoapp'));

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2dsZXZlbC9saWIvbG9nbGV2ZWwuanMiLCIuLi9ub2RlX21vZHVsZXMvZWYuanMvc3JjL2xpYi9kZWJ1Zy5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZnQtcGFyc2VyL3NyYy9lc2NhcGUtcGFyc2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmdC1wYXJzZXIvc3JjL2VmdC1wYXJzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZWYuanMvc3JjL2xpYi9wYXJzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZWYuanMvc3JjL2xpYi91dGlscy9hcnJheS1oZWxwZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvaXMtb2JqL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2RlZXAtYXNzaWduL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvcmVzb2x2ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZWYuanMvc3JjL2xpYi91dGlscy9iaW5kaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvZWxlbWVudC1jcmVhdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvZG9tLWhlbHBlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvbGliL3V0aWxzL2RvbS1hcnItaGVscGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvdHlwZS1vZi5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvbGliL3V0aWxzL2NyZWF0b3IuanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaXNBcmd1bWVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZm9yZWFjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWZpbmUtcHJvcGVydGllcy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2ltcGxlbWVudGF0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2Z1bmN0aW9uLWJpbmQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LmFzc2lnbi9oYXNTeW1ib2xzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL29iamVjdC5hc3NpZ24vaW1wbGVtZW50YXRpb24uanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LmFzc2lnbi9wb2x5ZmlsbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9vYmplY3QuYXNzaWduL3NoaW0uanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LmFzc2lnbi9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvbGliL3V0aWxzL3BvbHlmaWxscy5qcyIsIi4uL25vZGVfbW9kdWxlcy9lZi5qcy9zcmMvbGliL3JlbmRlcmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9saWIvdXRpbHMvbGl0ZXJhbHMtbWl4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VmLmpzL3NyYy9lZi5qcyIsIi4uL3NyYy9hcnJheS1oZWxwZXIuanMiLCIuLi9zcmMvdGVtcGxhdGVzL3RvZG9hcHAuanMiLCIuLi9zcmMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBjbGFzc0xpc3QuanM6IENyb3NzLWJyb3dzZXIgZnVsbCBlbGVtZW50LmNsYXNzTGlzdCBpbXBsZW1lbnRhdGlvbi5cbiAqIDIwMTQtMDctMjNcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBQdWJsaWMgRG9tYWluLlxuICogTk8gV0FSUkFOVFkgRVhQUkVTU0VEIE9SIElNUExJRUQuIFVTRSBBVCBZT1VSIE9XTiBSSVNLLlxuICovXG5cbi8qZ2xvYmFsIHNlbGYsIGRvY3VtZW50LCBET01FeGNlcHRpb24gKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL2NsYXNzTGlzdC5qcy9ibG9iL21hc3Rlci9jbGFzc0xpc3QuanMqL1xuXG4vKiBDb3BpZWQgZnJvbSBNRE46XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9jbGFzc0xpc3RcbiAqL1xuXG5pZiAoXCJkb2N1bWVudFwiIGluIHdpbmRvdy5zZWxmKSB7XG5cbiAgLy8gRnVsbCBwb2x5ZmlsbCBmb3IgYnJvd3NlcnMgd2l0aCBubyBjbGFzc0xpc3Qgc3VwcG9ydFxuICAvLyBJbmNsdWRpbmcgSUUgPCBFZGdlIG1pc3NpbmcgU1ZHRWxlbWVudC5jbGFzc0xpc3RcbiAgaWYgKCEoXCJjbGFzc0xpc3RcIiBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiX1wiKSlcbiAgICB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJnXCIpKSkge1xuXG4gIChmdW5jdGlvbiAodmlldykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoISgnRWxlbWVudCcgaW4gdmlldykpIHJldHVybjtcblxuICAgIHZhclxuICAgICAgICBjbGFzc0xpc3RQcm9wID0gXCJjbGFzc0xpc3RcIlxuICAgICAgLCBwcm90b1Byb3AgPSBcInByb3RvdHlwZVwiXG4gICAgICAsIGVsZW1DdHJQcm90byA9IHZpZXcuRWxlbWVudFtwcm90b1Byb3BdXG4gICAgICAsIG9iakN0ciA9IE9iamVjdFxuICAgICAgLCBzdHJUcmltID0gU3RyaW5nW3Byb3RvUHJvcF0udHJpbSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15cXHMrfFxccyskL2csIFwiXCIpO1xuICAgICAgfVxuICAgICAgLCBhcnJJbmRleE9mID0gQXJyYXlbcHJvdG9Qcm9wXS5pbmRleE9mIHx8IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAsIGxlbiA9IHRoaXMubGVuZ3RoXG4gICAgICAgIDtcbiAgICAgICAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIC8vIFZlbmRvcnM6IHBsZWFzZSBhbGxvdyBjb250ZW50IGNvZGUgdG8gaW5zdGFudGlhdGUgRE9NRXhjZXB0aW9uc1xuICAgICAgLCBET01FeCA9IGZ1bmN0aW9uICh0eXBlLCBtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuY29kZSA9IERPTUV4Y2VwdGlvblt0eXBlXTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgIH1cbiAgICAgICwgY2hlY2tUb2tlbkFuZEdldEluZGV4ID0gZnVuY3Rpb24gKGNsYXNzTGlzdCwgdG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuID09PSBcIlwiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4KFxuICAgICAgICAgICAgICBcIlNZTlRBWF9FUlJcIlxuICAgICAgICAgICAgLCBcIkFuIGludmFsaWQgb3IgaWxsZWdhbCBzdHJpbmcgd2FzIHNwZWNpZmllZFwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1xccy8udGVzdCh0b2tlbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRE9NRXgoXG4gICAgICAgICAgICAgIFwiSU5WQUxJRF9DSEFSQUNURVJfRVJSXCJcbiAgICAgICAgICAgICwgXCJTdHJpbmcgY29udGFpbnMgYW4gaW52YWxpZCBjaGFyYWN0ZXJcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFyckluZGV4T2YuY2FsbChjbGFzc0xpc3QsIHRva2VuKTtcbiAgICAgIH1cbiAgICAgICwgQ2xhc3NMaXN0ID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgdmFyXG4gICAgICAgICAgICB0cmltbWVkQ2xhc3NlcyA9IHN0clRyaW0uY2FsbChlbGVtLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpXG4gICAgICAgICAgLCBjbGFzc2VzID0gdHJpbW1lZENsYXNzZXMgPyB0cmltbWVkQ2xhc3Nlcy5zcGxpdCgvXFxzKy8pIDogW11cbiAgICAgICAgICAsIGkgPSAwXG4gICAgICAgICAgLCBsZW4gPSBjbGFzc2VzLmxlbmd0aFxuICAgICAgICA7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnB1c2goY2xhc3Nlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXBkYXRlQ2xhc3NOYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy50b1N0cmluZygpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgICwgY2xhc3NMaXN0UHJvdG8gPSBDbGFzc0xpc3RbcHJvdG9Qcm9wXSA9IFtdXG4gICAgICAsIGNsYXNzTGlzdEdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDbGFzc0xpc3QodGhpcyk7XG4gICAgICB9XG4gICAgO1xuICAgIC8vIE1vc3QgRE9NRXhjZXB0aW9uIGltcGxlbWVudGF0aW9ucyBkb24ndCBhbGxvdyBjYWxsaW5nIERPTUV4Y2VwdGlvbidzIHRvU3RyaW5nKClcbiAgICAvLyBvbiBub24tRE9NRXhjZXB0aW9ucy4gRXJyb3IncyB0b1N0cmluZygpIGlzIHN1ZmZpY2llbnQgaGVyZS5cbiAgICBET01FeFtwcm90b1Byb3BdID0gRXJyb3JbcHJvdG9Qcm9wXTtcbiAgICBjbGFzc0xpc3RQcm90by5pdGVtID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgIHJldHVybiB0aGlzW2ldIHx8IG51bGw7XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by5jb250YWlucyA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgdG9rZW4gKz0gXCJcIjtcbiAgICAgIHJldHVybiBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pICE9PSAtMTtcbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLmFkZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhclxuICAgICAgICAgIHRva2VucyA9IGFyZ3VtZW50c1xuICAgICAgICAsIGkgPSAwXG4gICAgICAgICwgbCA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgLCB0b2tlblxuICAgICAgICAsIHVwZGF0ZWQgPSBmYWxzZVxuICAgICAgO1xuICAgICAgZG8ge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG4gICAgICAgIGlmIChjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pID09PSAtMSkge1xuICAgICAgICAgIHRoaXMucHVzaCh0b2tlbik7XG4gICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2kgPCBsKTtcblxuICAgICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2xhc3NOYW1lKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXJcbiAgICAgICAgICB0b2tlbnMgPSBhcmd1bWVudHNcbiAgICAgICAgLCBpID0gMFxuICAgICAgICAsIGwgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICwgdG9rZW5cbiAgICAgICAgLCB1cGRhdGVkID0gZmFsc2VcbiAgICAgICAgLCBpbmRleFxuICAgICAgO1xuICAgICAgZG8ge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG4gICAgICAgIGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcbiAgICAgICAgd2hpbGUgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICBpbmRleCA9IGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2kgPCBsKTtcblxuICAgICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2xhc3NOYW1lKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by50b2dnbGUgPSBmdW5jdGlvbiAodG9rZW4sIGZvcmNlKSB7XG4gICAgICB0b2tlbiArPSBcIlwiO1xuXG4gICAgICB2YXJcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLmNvbnRhaW5zKHRva2VuKVxuICAgICAgICAsIG1ldGhvZCA9IHJlc3VsdCA/XG4gICAgICAgICAgZm9yY2UgIT09IHRydWUgJiYgXCJyZW1vdmVcIlxuICAgICAgICA6XG4gICAgICAgICAgZm9yY2UgIT09IGZhbHNlICYmIFwiYWRkXCJcbiAgICAgIDtcblxuICAgICAgaWYgKG1ldGhvZCkge1xuICAgICAgICB0aGlzW21ldGhvZF0odG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm9yY2UgPT09IHRydWUgfHwgZm9yY2UgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmb3JjZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAhcmVzdWx0O1xuICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5qb2luKFwiIFwiKTtcbiAgICB9O1xuXG4gICAgaWYgKG9iakN0ci5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgdmFyIGNsYXNzTGlzdFByb3BEZXNjID0ge1xuICAgICAgICAgIGdldDogY2xhc3NMaXN0R2V0dGVyXG4gICAgICAgICwgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICAsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfTtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9iakN0ci5kZWZpbmVQcm9wZXJ0eShlbGVtQ3RyUHJvdG8sIGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdFByb3BEZXNjKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7IC8vIElFIDggZG9lc24ndCBzdXBwb3J0IGVudW1lcmFibGU6dHJ1ZVxuICAgICAgICBpZiAoZXgubnVtYmVyID09PSAtMHg3RkY1RUM1NCkge1xuICAgICAgICAgIGNsYXNzTGlzdFByb3BEZXNjLmVudW1lcmFibGUgPSBmYWxzZTtcbiAgICAgICAgICBvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9iakN0cltwcm90b1Byb3BdLl9fZGVmaW5lR2V0dGVyX18pIHtcbiAgICAgIGVsZW1DdHJQcm90by5fX2RlZmluZUdldHRlcl9fKGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdEdldHRlcik7XG4gICAgfVxuXG4gICAgfSh3aW5kb3cuc2VsZikpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAvLyBUaGVyZSBpcyBmdWxsIG9yIHBhcnRpYWwgbmF0aXZlIGNsYXNzTGlzdCBzdXBwb3J0LCBzbyBqdXN0IGNoZWNrIGlmIHdlIG5lZWRcbiAgICAvLyB0byBub3JtYWxpemUgdGhlIGFkZC9yZW1vdmUgYW5kIHRvZ2dsZSBBUElzLlxuXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICB2YXIgdGVzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiX1wiKTtcblxuICAgICAgdGVzdEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImMxXCIsIFwiYzJcIik7XG5cbiAgICAgIC8vIFBvbHlmaWxsIGZvciBJRSAxMC8xMSBhbmQgRmlyZWZveCA8MjYsIHdoZXJlIGNsYXNzTGlzdC5hZGQgYW5kXG4gICAgICAvLyBjbGFzc0xpc3QucmVtb3ZlIGV4aXN0IGJ1dCBzdXBwb3J0IG9ubHkgb25lIGFyZ3VtZW50IGF0IGEgdGltZS5cbiAgICAgIGlmICghdGVzdEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYzJcIikpIHtcbiAgICAgICAgdmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBvcmlnaW5hbCA9IERPTVRva2VuTGlzdC5wcm90b3R5cGVbbWV0aG9kXTtcblxuICAgICAgICAgIERPTVRva2VuTGlzdC5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgICB2YXIgaSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgICBvcmlnaW5hbC5jYWxsKHRoaXMsIHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICBjcmVhdGVNZXRob2QoJ2FkZCcpO1xuICAgICAgICBjcmVhdGVNZXRob2QoJ3JlbW92ZScpO1xuICAgICAgfVxuXG4gICAgICB0ZXN0RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiYzNcIiwgZmFsc2UpO1xuXG4gICAgICAvLyBQb2x5ZmlsbCBmb3IgSUUgMTAgYW5kIEZpcmVmb3ggPDI0LCB3aGVyZSBjbGFzc0xpc3QudG9nZ2xlIGRvZXMgbm90XG4gICAgICAvLyBzdXBwb3J0IHRoZSBzZWNvbmQgYXJndW1lbnQuXG4gICAgICBpZiAodGVzdEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYzNcIikpIHtcbiAgICAgICAgdmFyIF90b2dnbGUgPSBET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZTtcblxuICAgICAgICBET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKHRva2VuLCBmb3JjZSkge1xuICAgICAgICAgIGlmICgxIGluIGFyZ3VtZW50cyAmJiAhdGhpcy5jb250YWlucyh0b2tlbikgPT09ICFmb3JjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZvcmNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3RvZ2dsZS5jYWxsKHRoaXMsIHRva2VuKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIH1cblxuICAgICAgdGVzdEVsZW1lbnQgPSBudWxsO1xuICAgIH0oKSk7XG4gIH1cbn1cbiIsIi8qXG4qIGxvZ2xldmVsIC0gaHR0cHM6Ly9naXRodWIuY29tL3BpbXRlcnJ5L2xvZ2xldmVsXG4qXG4qIENvcHlyaWdodCAoYykgMjAxMyBUaW0gUGVycnlcbiogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuKi9cbihmdW5jdGlvbiAocm9vdCwgZGVmaW5pdGlvbikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5sb2cgPSBkZWZpbml0aW9uKCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG5vb3AgPSBmdW5jdGlvbigpIHt9O1xuICAgIHZhciB1bmRlZmluZWRUeXBlID0gXCJ1bmRlZmluZWRcIjtcblxuICAgIGZ1bmN0aW9uIHJlYWxNZXRob2QobWV0aG9kTmFtZSkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09IHVuZGVmaW5lZFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gV2UgY2FuJ3QgYnVpbGQgYSByZWFsIG1ldGhvZCB3aXRob3V0IGEgY29uc29sZSB0byBsb2cgdG9cbiAgICAgICAgfSBlbHNlIGlmIChjb25zb2xlW21ldGhvZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kTWV0aG9kKGNvbnNvbGUsIG1ldGhvZE5hbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGUubG9nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kTWV0aG9kKGNvbnNvbGUsICdsb2cnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBub29wO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmluZE1ldGhvZChvYmosIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgdmFyIG1ldGhvZCA9IG9ialttZXRob2ROYW1lXTtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QuYmluZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZC5iaW5kKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKG1ldGhvZCwgb2JqKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBNaXNzaW5nIGJpbmQgc2hpbSBvciBJRTggKyBNb2Rlcm5penIsIGZhbGxiYWNrIHRvIHdyYXBwaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmFwcGx5KG1ldGhvZCwgW29iaiwgYXJndW1lbnRzXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoZXNlIHByaXZhdGUgZnVuY3Rpb25zIGFsd2F5cyBuZWVkIGB0aGlzYCB0byBiZSBzZXQgcHJvcGVybHlcblxuICAgIGZ1bmN0aW9uIGVuYWJsZUxvZ2dpbmdXaGVuQ29uc29sZUFycml2ZXMobWV0aG9kTmFtZSwgbGV2ZWwsIGxvZ2dlck5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gdW5kZWZpbmVkVHlwZSkge1xuICAgICAgICAgICAgICAgIHJlcGxhY2VMb2dnaW5nTWV0aG9kcy5jYWxsKHRoaXMsIGxldmVsLCBsb2dnZXJOYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzW21ldGhvZE5hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVwbGFjZUxvZ2dpbmdNZXRob2RzKGxldmVsLCBsb2dnZXJOYW1lKSB7XG4gICAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9nTWV0aG9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG1ldGhvZE5hbWUgPSBsb2dNZXRob2RzW2ldO1xuICAgICAgICAgICAgdGhpc1ttZXRob2ROYW1lXSA9IChpIDwgbGV2ZWwpID9cbiAgICAgICAgICAgICAgICBub29wIDpcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGhvZEZhY3RvcnkobWV0aG9kTmFtZSwgbGV2ZWwsIGxvZ2dlck5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVmYXVsdE1ldGhvZEZhY3RvcnkobWV0aG9kTmFtZSwgbGV2ZWwsIGxvZ2dlck5hbWUpIHtcbiAgICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgICAgcmV0dXJuIHJlYWxNZXRob2QobWV0aG9kTmFtZSkgfHxcbiAgICAgICAgICAgICAgIGVuYWJsZUxvZ2dpbmdXaGVuQ29uc29sZUFycml2ZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgbG9nTWV0aG9kcyA9IFtcbiAgICAgICAgXCJ0cmFjZVwiLFxuICAgICAgICBcImRlYnVnXCIsXG4gICAgICAgIFwiaW5mb1wiLFxuICAgICAgICBcIndhcm5cIixcbiAgICAgICAgXCJlcnJvclwiXG4gICAgXTtcblxuICAgIGZ1bmN0aW9uIExvZ2dlcihuYW1lLCBkZWZhdWx0TGV2ZWwsIGZhY3RvcnkpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBjdXJyZW50TGV2ZWw7XG4gICAgICB2YXIgc3RvcmFnZUtleSA9IFwibG9nbGV2ZWxcIjtcbiAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgIHN0b3JhZ2VLZXkgKz0gXCI6XCIgKyBuYW1lO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBwZXJzaXN0TGV2ZWxJZlBvc3NpYmxlKGxldmVsTnVtKSB7XG4gICAgICAgICAgdmFyIGxldmVsTmFtZSA9IChsb2dNZXRob2RzW2xldmVsTnVtXSB8fCAnc2lsZW50JykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgIC8vIFVzZSBsb2NhbFN0b3JhZ2UgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZVtzdG9yYWdlS2V5XSA9IGxldmVsTmFtZTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge31cblxuICAgICAgICAgIC8vIFVzZSBzZXNzaW9uIGNvb2tpZSBhcyBmYWxsYmFja1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5jb29raWUgPVxuICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdG9yYWdlS2V5KSArIFwiPVwiICsgbGV2ZWxOYW1lICsgXCI7XCI7XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnZXRQZXJzaXN0ZWRMZXZlbCgpIHtcbiAgICAgICAgICB2YXIgc3RvcmVkTGV2ZWw7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzdG9yZWRMZXZlbCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2Vbc3RvcmFnZUtleV07XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBzdG9yZWRMZXZlbCA9PT0gdW5kZWZpbmVkVHlwZSkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgdmFyIGNvb2tpZSA9IHdpbmRvdy5kb2N1bWVudC5jb29raWU7XG4gICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSBjb29raWUuaW5kZXhPZihcbiAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RvcmFnZUtleSkgKyBcIj1cIik7XG4gICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdG9yZWRMZXZlbCA9IC9eKFteO10rKS8uZXhlYyhjb29raWUuc2xpY2UobG9jYXRpb24pKVsxXTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBzdG9yZWQgbGV2ZWwgaXMgbm90IHZhbGlkLCB0cmVhdCBpdCBhcyBpZiBub3RoaW5nIHdhcyBzdG9yZWQuXG4gICAgICAgICAgaWYgKHNlbGYubGV2ZWxzW3N0b3JlZExldmVsXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHN0b3JlZExldmVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdG9yZWRMZXZlbDtcbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqXG4gICAgICAgKiBQdWJsaWMgQVBJXG4gICAgICAgKlxuICAgICAgICovXG5cbiAgICAgIHNlbGYubGV2ZWxzID0geyBcIlRSQUNFXCI6IDAsIFwiREVCVUdcIjogMSwgXCJJTkZPXCI6IDIsIFwiV0FSTlwiOiAzLFxuICAgICAgICAgIFwiRVJST1JcIjogNCwgXCJTSUxFTlRcIjogNX07XG5cbiAgICAgIHNlbGYubWV0aG9kRmFjdG9yeSA9IGZhY3RvcnkgfHwgZGVmYXVsdE1ldGhvZEZhY3Rvcnk7XG5cbiAgICAgIHNlbGYuZ2V0TGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRMZXZlbDtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuc2V0TGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWwsIHBlcnNpc3QpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGxldmVsID09PSBcInN0cmluZ1wiICYmIHNlbGYubGV2ZWxzW2xldmVsLnRvVXBwZXJDYXNlKCldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbGV2ZWwgPSBzZWxmLmxldmVsc1tsZXZlbC50b1VwcGVyQ2FzZSgpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBsZXZlbCA9PT0gXCJudW1iZXJcIiAmJiBsZXZlbCA+PSAwICYmIGxldmVsIDw9IHNlbGYubGV2ZWxzLlNJTEVOVCkge1xuICAgICAgICAgICAgICBjdXJyZW50TGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgICAgICAgaWYgKHBlcnNpc3QgIT09IGZhbHNlKSB7ICAvLyBkZWZhdWx0cyB0byB0cnVlXG4gICAgICAgICAgICAgICAgICBwZXJzaXN0TGV2ZWxJZlBvc3NpYmxlKGxldmVsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXBsYWNlTG9nZ2luZ01ldGhvZHMuY2FsbChzZWxmLCBsZXZlbCwgbmFtZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gdW5kZWZpbmVkVHlwZSAmJiBsZXZlbCA8IHNlbGYubGV2ZWxzLlNJTEVOVCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiTm8gY29uc29sZSBhdmFpbGFibGUgZm9yIGxvZ2dpbmdcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IFwibG9nLnNldExldmVsKCkgY2FsbGVkIHdpdGggaW52YWxpZCBsZXZlbDogXCIgKyBsZXZlbDtcbiAgICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzZWxmLnNldERlZmF1bHRMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAgIGlmICghZ2V0UGVyc2lzdGVkTGV2ZWwoKSkge1xuICAgICAgICAgICAgICBzZWxmLnNldExldmVsKGxldmVsLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2VsZi5lbmFibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXRMZXZlbChzZWxmLmxldmVscy5UUkFDRSwgcGVyc2lzdCk7XG4gICAgICB9O1xuXG4gICAgICBzZWxmLmRpc2FibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXRMZXZlbChzZWxmLmxldmVscy5TSUxFTlQsIHBlcnNpc3QpO1xuICAgICAgfTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoIHRoZSByaWdodCBsZXZlbFxuICAgICAgdmFyIGluaXRpYWxMZXZlbCA9IGdldFBlcnNpc3RlZExldmVsKCk7XG4gICAgICBpZiAoaW5pdGlhbExldmVsID09IG51bGwpIHtcbiAgICAgICAgICBpbml0aWFsTGV2ZWwgPSBkZWZhdWx0TGV2ZWwgPT0gbnVsbCA/IFwiV0FSTlwiIDogZGVmYXVsdExldmVsO1xuICAgICAgfVxuICAgICAgc2VsZi5zZXRMZXZlbChpbml0aWFsTGV2ZWwsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqXG4gICAgICogUGFja2FnZS1sZXZlbCBBUElcbiAgICAgKlxuICAgICAqL1xuXG4gICAgdmFyIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cbiAgICB2YXIgX2xvZ2dlcnNCeU5hbWUgPSB7fTtcbiAgICBkZWZhdWx0TG9nZ2VyLmdldExvZ2dlciA9IGZ1bmN0aW9uIGdldExvZ2dlcihuYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJzdHJpbmdcIiB8fCBuYW1lID09PSBcIlwiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHN1cHBseSBhIG5hbWUgd2hlbiBjcmVhdGluZyBhIGxvZ2dlci5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV07XG4gICAgICAgIGlmICghbG9nZ2VyKSB7XG4gICAgICAgICAgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV0gPSBuZXcgTG9nZ2VyKFxuICAgICAgICAgICAgbmFtZSwgZGVmYXVsdExvZ2dlci5nZXRMZXZlbCgpLCBkZWZhdWx0TG9nZ2VyLm1ldGhvZEZhY3RvcnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2dnZXI7XG4gICAgfTtcblxuICAgIC8vIEdyYWIgdGhlIGN1cnJlbnQgZ2xvYmFsIGxvZyB2YXJpYWJsZSBpbiBjYXNlIG9mIG92ZXJ3cml0ZVxuICAgIHZhciBfbG9nID0gKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUpID8gd2luZG93LmxvZyA6IHVuZGVmaW5lZDtcbiAgICBkZWZhdWx0TG9nZ2VyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUgJiZcbiAgICAgICAgICAgICAgIHdpbmRvdy5sb2cgPT09IGRlZmF1bHRMb2dnZXIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2cgPSBfbG9nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmF1bHRMb2dnZXI7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZhdWx0TG9nZ2VyO1xufSkpO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBsb2dsZXZlbCBmcm9tICdsb2dsZXZlbCdcbmNvbnN0IHRhZyA9ICdbRUZdJ1xuY29uc3QgbG9nZ2VyID0gbG9nbGV2ZWwuZ2V0TG9nZ2VyKCdlZicpXG5cbmNvbnN0IHRyYWNlID0gbG9nZ2VyLnRyYWNlLmJpbmQobnVsbCwgdGFnKVxuY29uc3QgZGVidWcgPSBsb2dnZXIuZGVidWcuYmluZChudWxsLCB0YWcpXG5jb25zdCBpbmZvID0gbG9nZ2VyLmluZm8uYmluZChudWxsLCB0YWcpXG5jb25zdCB3YXJuID0gbG9nZ2VyLndhcm4uYmluZChudWxsLCB0YWcpXG5jb25zdCBlcnJvciA9IGxvZ2dlci5lcnJvci5iaW5kKG51bGwsIHRhZylcblxuY29uc3Qgd2FybkF0dGFjaG1lbnQgPSBzdGF0ZSA9PiBlcnJvcignRGV0YWNoIHRoZSBjb21wb25lbnQgYmVmb3JlIGF0dGFjaGluZyBpdCB0byBhIG5ldyBjb21wb25lbnQhIENvbXBvbmVudCB0byBiZSBkZXRhY2hlZDonLCBzdGF0ZSlcbmNvbnN0IHdhcm5QYXJlbnROb2RlID0gKCkgPT4gZXJyb3IoJ0Nhbm5vdCBtb3VudCBhIGNvbXBvbmVudCB0byBpdFxcJ3MgY2hpbGQgY29tcG9uZW50IScpXG5cbmlmIChFTlYgPT09ICdwcm9kdWN0aW9uJykge1xuXHRsb2dnZXIuc2V0TGV2ZWwoJ2Vycm9yJylcbn0gZWxzZSB7XG5cdGxvZ2dlci5zZXRMZXZlbCgndHJhY2UnKVxufVxuXG5pbmZvKCdEZWJ1ZyBsb2dnaW5nIGVuYWJsZWQhJylcblxuZXhwb3J0IHsgdHJhY2UsIGRlYnVnLCBpbmZvLCB3YXJuLCBlcnJvciwgd2FybkF0dGFjaG1lbnQsIHdhcm5QYXJlbnROb2RlIH1cbiIsIi8vIFNldCB0aGUgZXNjYXBlIGNoYXJhY3RlclxuY29uc3QgY2hhciA9ICcmJ1xuXG4vLyBJbml0bGl6ZSBSZWdFeHBcbmNvbnN0IG9jdCA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9WzAtN117MSwzfWAsICdnJylcbmNvbnN0IHVjcCA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9dVxcXFxbLio/XFxcXF1gLCAnZycpXG5jb25zdCB1bmkgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfXUuezAsNH1gLCAnZycpXG5jb25zdCBoZXggPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfXguezAsMn1gLCAnZycpXG5jb25zdCBlc2MgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfWAsICdnJylcbmNvbnN0IGIgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfWJgLCAnZycpXG5jb25zdCB0ID0gbmV3IFJlZ0V4cChgXFxcXCR7Y2hhcn10YCwgJ2cnKVxuY29uc3QgbiA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9bmAsICdnJylcbmNvbnN0IHYgPSBuZXcgUmVnRXhwKGBcXFxcJHtjaGFyfXZgLCAnZycpXG5jb25zdCBmID0gbmV3IFJlZ0V4cChgXFxcXCR7Y2hhcn1mYCwgJ2cnKVxuY29uc3QgciA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9cmAsICdnJylcblxuLy8gRXNjYXBlIG9jdG9uYXJ5IHNlcXVlbmNlXG5jb25zdCBPMkMgPSAoKSA9PiB7XG5cdHRocm93IG5ldyBTeW50YXhFcnJvcignT2N0YWwgZXNjYXBlIHNlcXVlbmNlcyBhcmUgbm90IGFsbG93ZWQgaW4gRUZNTC4nKVxufVxuXG4vLyBFc2NhcGUgdW5pY29kZSBjb2RlIHBvaW50IHNlcXVlbmNlXG5jb25zdCBVQzJDID0gKHZhbCkgPT4ge1xuXHR2YWwgPSB2YWwuc3Vic3RyKDMsIHZhbC5sZW5ndGggLSA0KVxuXHR2YWwgPSBwYXJzZUludCh2YWwsIDE2KVxuXHRpZiAoIXZhbCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlJylcblx0dHJ5IHtcblx0XHRyZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQodmFsKVxuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1VuZGVmaW5lZCBVbmljb2RlIGNvZGUtcG9pbnQnKVxuXHR9XG59XG5cbi8vIEVzY2FwZSB1bmljb2RlIHNlcXVlbmNlXG5jb25zdCBVMkMgPSAodmFsKSA9PiB7XG5cdHZhbCA9IHZhbC5zdWJzdHJpbmcoMilcblx0dmFsID0gcGFyc2VJbnQodmFsLCAxNilcblx0aWYgKCF2YWwpIHRocm93IG5ldyBTeW50YXhFcnJvcignSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZScpXG5cdHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbClcbn1cblxuLy8gRXNjYXBlIGhleGFkZWNpbWFsIHNlcXVlbmNlXG5jb25zdCBYMkMgPSAodmFsKSA9PiB7XG5cdHZhbCA9IGAwMCR7dmFsLnN1YnN0cmluZygyKX1gXG5cdHZhbCA9IHBhcnNlSW50KHZhbCwgMTYpXG5cdGlmICghdmFsKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0ludmFsaWQgaGV4YWRlY2ltYWwgZXNjYXBlIHNlcXVlbmNlJylcblx0cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUodmFsKVxufVxuXG5jb25zdCBFU0NBUEUgPSAoc3RyaW5nKSA9PiB7XG5cdC8vIFNwbGl0IHN0cmluZ3Ncblx0Y29uc3Qgc3BsaXRlZCA9IHN0cmluZy5zcGxpdChjaGFyICsgY2hhcilcblx0Y29uc3QgZXNjYXBlZCA9IFtdXG5cblx0Ly8gRXNjYXBlIGFsbCBrbm93biBlc2NhcGUgY2hhcmFjdGVyc1xuXHRmb3IgKGxldCBpIG9mIHNwbGl0ZWQpIHtcblx0XHRjb25zdCBlc2NhcGVkU3RyID0gaVxuXHRcdFx0LnJlcGxhY2Uob2N0LCBPMkMpXG5cdFx0XHQucmVwbGFjZSh1Y3AsIFVDMkMpXG5cdFx0XHQucmVwbGFjZSh1bmksIFUyQylcblx0XHRcdC5yZXBsYWNlKGhleCwgWDJDKVxuXHRcdFx0LnJlcGxhY2UoYiwgJ1xcYicpXG5cdFx0XHQucmVwbGFjZSh0LCAnXFx0Jylcblx0XHRcdC5yZXBsYWNlKG4sICdcXG4nKVxuXHRcdFx0LnJlcGxhY2UodiwgJ1xcdicpXG5cdFx0XHQucmVwbGFjZShmLCAnXFxmJylcblx0XHRcdC5yZXBsYWNlKHIsICdcXHInKVxuXHRcdFx0Ly8gUmVtb3ZlIGFsbCB1c2VsZXNzIGVzY2FwZSBjaGFyYWN0ZXJzXG5cdFx0XHQucmVwbGFjZShlc2MsICcnKVxuXHRcdGVzY2FwZWQucHVzaChlc2NhcGVkU3RyKVxuXHR9XG5cdC8vIFJldHVybiBlc2NhcGVkIHN0cmluZ1xuXHRyZXR1cm4gZXNjYXBlZC5qb2luKGNoYXIpXG59XG5cbi8vIGV4cG9ydCBkZWZhdWx0IEVTQ0FQRVxubW9kdWxlLmV4cG9ydHMgPSBFU0NBUEVcbiIsImltcG9ydCBFU0NBUEUgZnJvbSAnLi9lc2NhcGUtcGFyc2VyLmpzJ1xuXG5jb25zdCB0eXBlU3ltYm9scyA9ICc+IyVALi0rJy5zcGxpdCgnJylcbmNvbnN0IHJlc2VydmVkID0gJ2F0dGFjaGVkIGRhdGEgZWxlbWVudCBub2RlcyBtZXRob2RzIHN1YnNjcmliZSB1bnN1YnNjcmliZSB1cGRhdGUgZGVzdHJveScuc3BsaXQoJyAnKS5tYXAoaSA9PiBgJCR7aX1gKVxuY29uc3QgZnVsbE11c3RhY2hlID0gL15cXHtcXHsuKlxcfVxcfSQvXG5jb25zdCBtdXN0YWNoZSA9IC9cXHtcXHsuKz9cXH1cXH0vZ1xuY29uc3Qgc3BhY2VJbmRlbnQgPSAvXihcXHQqKSggKikuKi9cblxuY29uc3QgZ2V0RXJyb3JNc2cgPSAobXNnLCBsaW5lID0gLTIpID0+IGBGYWlsZWQgdG8gcGFyc2UgZWZ0IHRlbXBsYXRlOiAke21zZ30uIGF0IGxpbmUgJHtsaW5lICsgMX1gXG5cbmNvbnN0IGlzRW1wdHkgPSBzdHJpbmcgPT4gIXN0cmluZy5yZXBsYWNlKC9cXHMvLCAnJylcblxuY29uc3QgZ2V0T2Zmc2V0ID0gKHN0cmluZywgcGFyc2luZ0luZm8pID0+IHtcblx0aWYgKHBhcnNpbmdJbmZvLm9mZnNldCAhPT0gbnVsbCkgcmV0dXJuXG5cdHBhcnNpbmdJbmZvLm9mZnNldCA9IHN0cmluZy5tYXRjaCgvXFxzKi8pWzBdXG5cdGlmIChwYXJzaW5nSW5mby5vZmZzZXQpIHBhcnNpbmdJbmZvLm9mZnNldFJlZyA9IG5ldyBSZWdFeHAoYF4ke3BhcnNpbmdJbmZvLm9mZnNldH1gKVxufVxuXG5jb25zdCByZW1vdmVPZmZzZXQgPSAoc3RyaW5nLCBwYXJzaW5nSW5mbywgaSkgPT4ge1xuXHRpZiAocGFyc2luZ0luZm8ub2Zmc2V0UmVnKSB7XG5cdFx0bGV0IHJlbW92ZWQgPSBmYWxzZVxuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHBhcnNpbmdJbmZvLm9mZnNldFJlZywgKCkgPT4ge1xuXHRcdFx0cmVtb3ZlZCA9IHRydWVcblx0XHRcdHJldHVybiAnJ1xuXHRcdH0pXG5cdFx0aWYgKCFyZW1vdmVkKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoZ2V0RXJyb3JNc2coYEV4cGVjdGVkIGluZGVudCB0byBiZSBncmF0ZXIgdGhhbiAwIGFuZCBsZXNzIHRoYW4gJHtwYXJzaW5nSW5mby5wcmV2RGVwdGggKyAxfSwgYnV0IGdvdCAtMWAsIGkpKVxuXHR9XG5cdHJldHVybiBzdHJpbmdcbn1cblxuY29uc3QgZ2V0SW5kZW50ID0gKHN0cmluZywgcGFyc2luZ0luZm8pID0+IHtcblx0aWYgKHBhcnNpbmdJbmZvLmluZGVudFJlZykgcmV0dXJuXG5cdGNvbnN0IHNwYWNlcyA9IHN0cmluZy5tYXRjaChzcGFjZUluZGVudClbMl1cblx0aWYgKHNwYWNlcykge1xuXHRcdHBhcnNpbmdJbmZvLmluZGVudFJlZyA9IG5ldyBSZWdFeHAoc3BhY2VzKVxuXHR9XG59XG5cbmNvbnN0IGdldERlcHRoID0gKHN0cmluZywgcGFyc2luZ0luZm8sIGkpID0+IHtcblx0bGV0IGRlcHRoID0gMFxuXHRpZiAocGFyc2luZ0luZm8uaW5kZW50UmVnKSBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXlxccyovLCBzdHIgPT4gc3RyLnJlcGxhY2UocGFyc2luZ0luZm8uaW5kZW50UmVnLCAnXFx0JykpXG5cdGNvbnN0IGNvbnRlbnQgPSBzdHJpbmcucmVwbGFjZSgvXlxcdCovLCAoc3RyKSA9PiB7XG5cdFx0ZGVwdGggPSBzdHIubGVuZ3RoXG5cdFx0cmV0dXJuICcnXG5cdH0pXG5cdGlmICgvXlxccy8udGVzdChjb250ZW50KSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGdldEVycm9yTXNnKCdCYWQgaW5kZW50JywgaSkpXG5cdHJldHVybiB7IGRlcHRoLCBjb250ZW50IH1cbn1cblxuY29uc3QgcmVzb2x2ZURlcHRoID0gKGFzdCwgZGVwdGgpID0+IHtcblx0bGV0IGN1cnJlbnROb2RlID0gYXN0XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgZGVwdGg7IGkrKykgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZVtjdXJyZW50Tm9kZS5sZW5ndGggLSAxXVxuXHRyZXR1cm4gY3VycmVudE5vZGVcbn1cblxuY29uc3Qgc3BsaXREZWZhdWx0ID0gKHN0cmluZykgPT4ge1xuXHRzdHJpbmcgPSBzdHJpbmcuc3Vic3RyKDIsIHN0cmluZy5sZW5ndGggLSA0KVxuXHRjb25zdCBbX3BhdGgsIC4uLl9kZWZhdWx0XSA9IHN0cmluZy5zcGxpdCgnPScpXG5cdGNvbnN0IHBhdGhBcnIgPSBfcGF0aC50cmltKCkuc3BsaXQoJy4nKVxuXHRjb25zdCBkZWZhdWx0VmFsID0gRVNDQVBFKF9kZWZhdWx0LmpvaW4oJz0nKS50cmltKCkpXG5cdGlmIChkZWZhdWx0VmFsKSByZXR1cm4gW3BhdGhBcnIsIGRlZmF1bHRWYWxdXG5cdHJldHVybiBbcGF0aEFycl1cbn1cblxuY29uc3QgcGFyc2VUYWcgPSAoc3RyaW5nKSA9PiB7XG5cdGNvbnN0IFtjb250ZW50LCAuLi5uYW1lXSA9IHN0cmluZy5zcGxpdCgnIycpXG5cdGNvbnN0IFt0YWcsIC4uLmNsYXNzZXNdID0gY29udGVudC5zcGxpdCgnLicpXG5cdGNvbnN0IGNsYXNzVmFsdWUgPSBjbGFzc2VzLmpvaW4oJy4nKVxuXHRpZiAoZnVsbE11c3RhY2hlLnRlc3QoY2xhc3NWYWx1ZSkpIHJldHVybiB7XG5cdFx0dGFnLFxuXHRcdG5hbWU6IG5hbWUuam9pbignIycpLFxuXHRcdGNsYXNzOiBzcGxpdERlZmF1bHQoY2xhc3NWYWx1ZSlcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHRhZyxcblx0XHRuYW1lOiBuYW1lLmpvaW4oJyMnKSxcblx0XHRjbGFzczogY2xhc3Nlcy5qb2luKCcgJylcblx0fVxufVxuXG5jb25zdCBwYXJzZU5vZGVQcm9wcyA9IChzdHJpbmcpID0+IHtcblx0Y29uc3Qgc3BsaXRlZCA9IHN0cmluZy5zcGxpdCgnPScpXG5cdGNvbnN0IG5hbWUgPSBzcGxpdGVkLnNoaWZ0KCkudHJpbSgpXG5cdGNvbnN0IHZhbHVlID0gc3BsaXRlZC5qb2luKCc9JykudHJpbSgpXG5cdGlmIChmdWxsTXVzdGFjaGUudGVzdCh2YWx1ZSkpIHJldHVybiB7IG5hbWUsIHZhbHVlOiBzcGxpdERlZmF1bHQodmFsdWUpIH1cblx0cmV0dXJuIHsgbmFtZSwgdmFsdWU6IEVTQ0FQRSh2YWx1ZSkgfVxufVxuXG5jb25zdCBwYXJzZVRleHQgPSAoc3RyaW5nKSA9PiB7XG5cdGNvbnN0IHBhcnRzID0gW11cblx0Y29uc3QgbXVzdGFjaGVzID0gc3RyaW5nLm1hdGNoKG11c3RhY2hlKVxuXHRpZiAobXVzdGFjaGVzKSB7XG5cdFx0Y29uc3QgdGV4dHMgPSBzdHJpbmcuc3BsaXQobXVzdGFjaGUpXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRleHRzW2ldKSBwYXJ0cy5wdXNoKEVTQ0FQRSh0ZXh0c1tpXSkpXG5cdFx0XHRpZiAobXVzdGFjaGVzW2ldKSBwYXJ0cy5wdXNoKHNwbGl0RGVmYXVsdChtdXN0YWNoZXNbaV0pKVxuXHRcdH1cblx0fSBlbHNlIHBhcnRzLnB1c2goRVNDQVBFKHN0cmluZykpXG5cdHJldHVybiBwYXJ0c1xufVxuXG5jb25zdCBzcGxpdEV2ZW50cyA9IChzdHJpbmcpID0+IHtcblx0Y29uc3QgW25hbWUsIC4uLnZhbHVlXSA9IHN0cmluZy5zcGxpdCgnOicpXG5cdGNvbnN0IGNvbnRlbnQgPSB2YWx1ZS5qb2luKCc6Jylcblx0aWYgKGNvbnRlbnQpIHtcblx0XHRpZiAoZnVsbE11c3RhY2hlLnRlc3QoY29udGVudCkpIHJldHVybiBbbmFtZS50cmltKCksIHNwbGl0RGVmYXVsdChjb250ZW50KV1cblx0XHRyZXR1cm4gW25hbWUudHJpbSgpLCBFU0NBUEUodmFsdWUuam9pbignOicpKV1cblx0fVxuXHRyZXR1cm4gW25hbWUudHJpbSgpXVxufVxuXG5jb25zdCBwYXJzZUxpbmUgPSAoe2xpbmUsIGFzdCwgcGFyc2luZ0luZm8sIGl9KSA9PiB7XG5cdGlmIChpc0VtcHR5KGxpbmUpKSByZXR1cm5cblx0Z2V0SW5kZW50KGxpbmUsIHBhcnNpbmdJbmZvKVxuXHRnZXRPZmZzZXQobGluZSwgcGFyc2luZ0luZm8pXG5cblx0bGV0IHsgZGVwdGgsIGNvbnRlbnQgfSA9IGdldERlcHRoKHJlbW92ZU9mZnNldChsaW5lLCBwYXJzaW5nSW5mbywgaSksIHBhcnNpbmdJbmZvLCBpKVxuXG5cdGlmIChjb250ZW50KSB7XG5cdFx0aWYgKGRlcHRoIDwgMCB8fCBkZXB0aCAtIHBhcnNpbmdJbmZvLnByZXZEZXB0aCA+IDEgfHwgKGRlcHRoIC0gcGFyc2luZ0luZm8ucHJldkRlcHRoID09PSAxICYmIFsnY29tbWVudCcsICd0YWcnXS5pbmRleE9mKHBhcnNpbmdJbmZvLnByZXZUeXBlKSA9PT0gLTEpIHx8IChwYXJzaW5nSW5mby5wcmV2VHlwZSAhPT0gJ2NvbW1lbnQnICYmIGRlcHRoID09PSAwICYmIHBhcnNpbmdJbmZvLnRvcEV4aXN0cykpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZyhgRXhwZWN0ZWQgaW5kZW50IHRvIGJlIGdyYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAke3BhcnNpbmdJbmZvLnByZXZEZXB0aCArIDF9LCBidXQgZ290ICR7ZGVwdGh9YCwgaSkpXG5cdFx0Y29uc3QgdHlwZSA9IGNvbnRlbnRbMF1cblx0XHRjb250ZW50ID0gY29udGVudC5zbGljZSgxKVxuXHRcdGlmICghcGFyc2luZ0luZm8udG9wRXhpc3RzICYmIHR5cGVTeW1ib2xzLmluZGV4T2YodHlwZSkgPj0gMCAmJiB0eXBlICE9PSAnPicpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZygnTm8gdG9wIGxldmVsIGVudHJ5JywgaSkpXG5cdFx0aWYgKCFjb250ZW50ICYmIHR5cGVTeW1ib2xzLmluZGV4T2YodHlwZSkgPj0gMCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGdldEVycm9yTXNnKCdFbXB0eSBjb250ZW50JywgaSkpXG5cdFx0Ly8gSnVtcCBiYWNrIHRvIHVwcGVyIGxldmVsXG5cdFx0aWYgKGRlcHRoIDwgcGFyc2luZ0luZm8ucHJldkRlcHRoIHx8IChkZXB0aCA9PT0gcGFyc2luZ0luZm8ucHJldkRlcHRoICYmIHBhcnNpbmdJbmZvLnByZXZUeXBlID09PSAndGFnJykpIHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlID0gcmVzb2x2ZURlcHRoKGFzdCwgZGVwdGgpXG5cdFx0cGFyc2luZ0luZm8ucHJldkRlcHRoID0gZGVwdGhcblxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSAnPic6IHtcblx0XHRcdFx0aWYgKCFwYXJzaW5nSW5mby50b3BFeGlzdHMpIHtcblx0XHRcdFx0XHRwYXJzaW5nSW5mby50b3BFeGlzdHMgPSB0cnVlXG5cdFx0XHRcdFx0cGFyc2luZ0luZm8ubWluRGVwdGggPSBkZXB0aFxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGluZm8gPSBwYXJzZVRhZyhjb250ZW50KVxuXHRcdFx0XHRjb25zdCBuZXdOb2RlID0gW3tcblx0XHRcdFx0XHR0OiBpbmZvLnRhZ1xuXHRcdFx0XHR9XVxuXHRcdFx0XHRpZiAoaW5mby5jbGFzcykge1xuXHRcdFx0XHRcdG5ld05vZGVbMF0uYSA9IHt9XG5cdFx0XHRcdFx0bmV3Tm9kZVswXS5hLmNsYXNzID0gaW5mby5jbGFzc1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpbmZvLm5hbWUpIG5ld05vZGVbMF0ubiA9IGluZm8ubmFtZVxuXHRcdFx0XHRwYXJzaW5nSW5mby5jdXJyZW50Tm9kZS5wdXNoKG5ld05vZGUpXG5cdFx0XHRcdHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlID0gbmV3Tm9kZVxuXHRcdFx0XHRwYXJzaW5nSW5mby5wcmV2VHlwZSA9ICd0YWcnXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlICcjJzoge1xuXHRcdFx0XHRjb25zdCB7IG5hbWUsIHZhbHVlIH0gPSBwYXJzZU5vZGVQcm9wcyhjb250ZW50KVxuXHRcdFx0XHRpZiAoIXBhcnNpbmdJbmZvLmN1cnJlbnROb2RlWzBdLmEpIHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlWzBdLmEgPSB7fVxuXHRcdFx0XHRwYXJzaW5nSW5mby5jdXJyZW50Tm9kZVswXS5hW25hbWVdID0gdmFsdWVcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAnYXR0cidcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgJyUnOiB7XG5cdFx0XHRcdGNvbnN0IHsgbmFtZSwgdmFsdWUgfSA9IHBhcnNlTm9kZVByb3BzKGNvbnRlbnQpXG5cdFx0XHRcdGlmICghcGFyc2luZ0luZm8uY3VycmVudE5vZGVbMF0ucCkgcGFyc2luZ0luZm8uY3VycmVudE5vZGVbMF0ucCA9IHt9XG5cdFx0XHRcdHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlWzBdLnBbbmFtZV0gPSB2YWx1ZVxuXHRcdFx0XHRwYXJzaW5nSW5mby5wcmV2VHlwZSA9ICdwcm9wJ1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSAnQCc6IHtcblx0XHRcdFx0Y29uc3QgeyBuYW1lLCB2YWx1ZSB9ID0gcGFyc2VOb2RlUHJvcHMoY29udGVudClcblx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZygnTWV0aG9kcyBzaG91bGQgbm90IGJlIHdyYXBwZWQgaW4gbXVzdGFjaGVzJywgaSkpXG5cdFx0XHRcdGlmICghcGFyc2luZ0luZm8uY3VycmVudE5vZGVbMF0uZSkgcGFyc2luZ0luZm8uY3VycmVudE5vZGVbMF0uZSA9IHt9XG5cdFx0XHRcdHBhcnNpbmdJbmZvLmN1cnJlbnROb2RlWzBdLmVbbmFtZV0gPSBzcGxpdEV2ZW50cyh2YWx1ZSlcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAnZXZlbnQnXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlICcuJzoge1xuXHRcdFx0XHRwYXJzaW5nSW5mby5jdXJyZW50Tm9kZS5wdXNoKC4uLnBhcnNlVGV4dChjb250ZW50KSlcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAndGV4dCdcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgJy0nOiB7XG5cdFx0XHRcdGlmIChyZXNlcnZlZC5pbmRleE9mKGNvbnRlbnQpICE9PSAtMSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGdldEVycm9yTXNnKGBSZXNlcnZlZCBuYW1lICcke2NvbnRlbnR9JyBzaG91bGQgbm90IGJlIHVzZWRgLCBpKSlcblx0XHRcdFx0cGFyc2luZ0luZm8uY3VycmVudE5vZGUucHVzaCh7XG5cdFx0XHRcdFx0bjogY29udGVudCxcblx0XHRcdFx0XHR0OiAwXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHBhcnNpbmdJbmZvLnByZXZUeXBlID0gJ25vZGUnXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlICcrJzoge1xuXHRcdFx0XHRwYXJzaW5nSW5mby5jdXJyZW50Tm9kZS5wdXNoKHtcblx0XHRcdFx0XHRuOiBjb250ZW50LFxuXHRcdFx0XHRcdHQ6IDFcblx0XHRcdFx0fSlcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAnbGlzdCdcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0cGFyc2luZ0luZm8ucHJldlR5cGUgPSAnY29tbWVudCdcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuY29uc3QgZWZ0UGFyc2VyID0gKHRlbXBsYXRlKSA9PiB7XG5cdGlmICghdGVtcGxhdGUpIHRocm93IG5ldyBUeXBlRXJyb3IoZ2V0RXJyb3JNc2coJ1RlbXBsYXRlIHJlcXVpcmVkLCBidXQgbm90aGluZyBwcmVzZW50JykpXG5cdGNvbnN0IHRwbFR5cGUgPSB0eXBlb2YgdGVtcGxhdGVcblx0aWYgKHRwbFR5cGUgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKGdldEVycm9yTXNnKGBFeHBlY3RlZCBhIHN0cmluZywgYnV0IGdvdCBhKG4pICR7dHBsVHlwZX1gKSlcblx0Y29uc3QgbGluZXMgPSB0ZW1wbGF0ZS5zcGxpdCgvXFxyP1xcbi8pXG5cdGNvbnN0IGFzdCA9IFtdXG5cdGNvbnN0IHBhcnNpbmdJbmZvID0ge1xuXHRcdGluZGVudFJlZzogbnVsbCxcblx0XHRwcmV2RGVwdGg6IDAsXG5cdFx0b2Zmc2V0OiBudWxsLFxuXHRcdG9mZnNldFJlZzogbnVsbCxcblx0XHRwcmV2VHlwZTogJ2NvbW1lbnQnLFxuXHRcdGN1cnJlbnROb2RlOiBhc3QsXG5cdFx0dG9wRXhpc3RzOiBmYWxzZSxcblx0fVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSBwYXJzZUxpbmUoe2xpbmU6IGxpbmVzW2ldLCBhc3QsIHBhcnNpbmdJbmZvLCBpfSlcblxuXHRpZiAoYXN0WzBdKSByZXR1cm4gYXN0WzBdXG5cdHRocm93IG5ldyBTeW50YXhFcnJvcihnZXRFcnJvck1zZygnTm90aGluZyB0byBiZSBwYXJzZWQnLCBsaW5lcy5sZW5ndGggLSAxKSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZWZ0UGFyc2VyXG4iLCIvLyBUcmVlIHN0cnVjdHVyZVxuLy8gTGluZXMgbm90IHN0YXJ0ZWQgd2l0aCA+IyVAListIGFyZSBjb25zaWRlcmVkIGFzIGNvbW1lbnRzXG4vLyB0aGlzIGlzIGEgY29tbWVudFxuLy8gJz4nIHN0YW5kcyBmb3IgdGFnIG5hbWVcbi8vID5kaXZcbi8vIFx0JyMnIHN0YW5kcyBmb3IgYXR0cmlidXRlc1xuLy8gXHQjY2xhc3MgPSB7e2NsYXNzfX1cbi8vIFx0I3N0eWxlID0ge3thdHRyLnN0eWxlfX1cbi8vIFx0I2lkID0gdGVzdGRpdlxuLy8gXHQjc29tZS1hdHRyID0gc29tZSB0ZXh0XG4vLyBcdCNjb250ZW50ID1cbi8vIFx0JyUnIHN0YW5kcyBmb3IgcHJvcGVydGllc1xuLy8gXHQldGl0bGUgPSB7e25hbWV9fVxuLy8gXHQlYW5vdGhlclByb3BlcnR5ID0gdGV4dFxuLy8gXHQlY29udGVudEVkaXRhYmxlID0ge3tlZGl0fX1cbi8vIFx0J0AnIHN0YW5kcyBmb3IgZXZlbnRzXG4vLyBcdEBjbGljayA9IHVwZGF0ZUluZm9cbi8vIFx0QG1vdXNlZG93biA9IHNldFN0YXRlXG4vLyBcdCcuJyBzdGFuZHMgZm9yIHRleHQgbm9kZXNcbi8vIFx0Lk5hbWU6IHt7bmFtZX19Jm5Kb2I6IHt7am9ifX1cbi8vIFx0PmJyXG4vLyBcdCctJyBzdGFuZHMgZm9yIHN0YW5kYXJkIG1vdW50aW5nIHBvaW50XG4vLyBcdC1ub2RlMVxuLy8gXHQ+cFxuLy8gXHRcdCNjbGFzcyA9IHNvbWUgY2xhc3MgbmFtZXNcbi8vIFx0XHQnLicgYWZ0ZXIgdGFnIG5hbWUgbWVhbnMgc3RhdGljIGNsYXNzIG5hbWUsIGp1c3QgbGlrZSB3aGF0IHlvdSBkbyBpbiBlbW1ldFxuLy8gXHRcdCcjJyBhdCB0aGUgZW5kIG9mIHRoZSB0YWcgYW5ub3VuY2VtZW50IHdpbGwgZ2VuZXJhdGUgYSBxdWljayBhY2Nlc3MgcG9pbnRcbi8vIFx0XHRvZiB0aGlzIGVsZW1lbnQgaW4gdGhlIHN0YXRlIHRyZWVcbi8vIFx0XHQ+c3Bhbi5ub3RpY2Ujbm90aWNlXG4vLyBcdFx0XHQuTm90aWNlOiB7e25vdGljZX19XG4vLyBcdFx0LnNvbWUgdGV4dFxuLy8gXHRcdC1ub2RlMlxuLy8gXHRcdCcrJyBzdGFuZHMgZm9yIGxpc3QgbW91bnRpbmcgcG9pbnRcbi8vIFx0XHQrbGlzdDFcblxuaW1wb3J0IGVmdFBhcnNlciBmcm9tICdlZnQtcGFyc2VyJ1xuXG5jb25zdCBwYXJzZSA9ICh0ZW1wbGF0ZSwgcGFyc2VyKSA9PiB7XG5cdGlmICghcGFyc2VyKSBwYXJzZXIgPSBlZnRQYXJzZXJcblx0cmV0dXJuIHBhcnNlcih0ZW1wbGF0ZSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VcbiIsImNvbnN0IHByb3RvID0gQXJyYXkucHJvdG90eXBlXG5cbmNvbnN0IEFSUiA9IHtcblx0Y29weShhcnIpIHtcblx0XHRyZXR1cm4gcHJvdG8uc2xpY2UuY2FsbChhcnIsIDApXG5cdH0sXG5cdGVtcHR5KGFycikge1xuXHRcdGFyci5sZW5ndGggPSAwXG5cdFx0cmV0dXJuIGFyclxuXHR9LFxuXHRlcXVhbHMobGVmdCwgcmlnaHQpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkocmlnaHQpKSByZXR1cm4gZmFsc2Vcblx0XHRpZiAobGVmdCA9PT0gcmlnaHQpIHJldHVybiB0cnVlXG5cdFx0aWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuXHRcdGZvciAobGV0IGkgaW4gbGVmdCkgaWYgKGxlZnRbaV0gIT09IHJpZ2h0W2ldKSByZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gdHJ1ZVxuXHR9LFxuXHRwb3AoYXJyKSB7XG5cdFx0cmV0dXJuIHByb3RvLnBvcC5jYWxsKGFycilcblx0fSxcblx0cHVzaChhcnIsIC4uLml0ZW1zKSB7XG5cdFx0cmV0dXJuIHByb3RvLnB1c2guYXBwbHkoYXJyLCBpdGVtcylcblx0fSxcblx0cmVtb3ZlKGFyciwgaXRlbSkge1xuXHRcdGNvbnN0IGluZGV4ID0gcHJvdG8uaW5kZXhPZi5jYWxsKGFyciwgaXRlbSlcblx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0cHJvdG8uc3BsaWNlLmNhbGwoYXJyLCBpbmRleCwgMSlcblx0XHRcdHJldHVybiBpdGVtXG5cdFx0fVxuXHR9LFxuXHRyZXZlcnNlKGFycikge1xuXHRcdHJldHVybiBwcm90by5yZXZlcnNlLmNhbGwoYXJyKVxuXHR9LFxuXHRzaGlmdChhcnIpIHtcblx0XHRyZXR1cm4gcHJvdG8uc2hpZnQuY2FsbChhcnIpXG5cdH0sXG5cdHNsaWNlKGFyciwgaW5kZXgsIGxlbmd0aCkge1xuXHRcdHJldHVybiBwcm90by5zbGljZS5jYWxsKGFyciwgaW5kZXgsIGxlbmd0aClcblx0fSxcblx0c29ydChhcnIsIGZuKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNvcnQuY2FsbChhcnIsIGZuKVxuXHR9LFxuXHRzcGxpY2UoYXJyLCAuLi5hcmdzKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNwbGljZS5hcHBseShhcnIsIGFyZ3MpXG5cdH0sXG5cdHVuc2hpZnQoYXJyLCAuLi5pdGVtcykge1xuXHRcdHJldHVybiBwcm90by51bnNoaWZ0LmFwcGx5KGFyciwgaXRlbXMpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQVJSXG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG5cdHZhciB0eXBlID0gdHlwZW9mIHg7XG5cdHJldHVybiB4ICE9PSBudWxsICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgaXNPYmogPSByZXF1aXJlKCdpcy1vYmonKTtcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignU291cmNlcyBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxuZnVuY3Rpb24gYXNzaWduS2V5KHRvLCBmcm9tLCBrZXkpIHtcblx0dmFyIHZhbCA9IGZyb21ba2V5XTtcblxuXHRpZiAodmFsID09PSB1bmRlZmluZWQgfHwgdmFsID09PSBudWxsKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKGhhc093blByb3BlcnR5LmNhbGwodG8sIGtleSkpIHtcblx0XHRpZiAodG9ba2V5XSA9PT0gdW5kZWZpbmVkIHx8IHRvW2tleV0gPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCAoJyArIGtleSArICcpJyk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRvLCBrZXkpIHx8ICFpc09iaih2YWwpKSB7XG5cdFx0dG9ba2V5XSA9IHZhbDtcblx0fSBlbHNlIHtcblx0XHR0b1trZXldID0gYXNzaWduKE9iamVjdCh0b1trZXldKSwgZnJvbVtrZXldKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhc3NpZ24odG8sIGZyb20pIHtcblx0aWYgKHRvID09PSBmcm9tKSB7XG5cdFx0cmV0dXJuIHRvO1xuXHR9XG5cblx0ZnJvbSA9IE9iamVjdChmcm9tKTtcblxuXHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdGFzc2lnbktleSh0bywgZnJvbSwga2V5KTtcblx0XHR9XG5cdH1cblxuXHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRhc3NpZ25LZXkodG8sIGZyb20sIHN5bWJvbHNbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWVwQXNzaWduKHRhcmdldCkge1xuXHR0YXJnZXQgPSB0b09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0YXNzaWduKHRhcmdldCwgYXJndW1lbnRzW3NdKTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59O1xuIiwiaW1wb3J0IGRlZXBBc3NpZ24gZnJvbSAnZGVlcC1hc3NpZ24nXG5cbi8vIFJlc29sdmUgYW4gYXJyYXkgZGVzY3JpYmVkIHBhdGggdG8gYW4gb2JqZWN0XG5jb25zdCByZXNvbHZlUGF0aCA9IChwYXRoLCBvYmopID0+IHtcblx0Zm9yIChsZXQgaSBvZiBwYXRoKSB7XG5cdFx0aWYgKCFvYmpbaV0pIG9ialtpXSA9IHt9XG5cdFx0b2JqID0gb2JqW2ldXG5cdH1cblx0cmV0dXJuIG9ialxufVxuXG5jb25zdCByZXNvbHZlUmVhY3RpdmVQYXRoID0gKHBhdGgsIG9iaikgPT4ge1xuXHRmb3IgKGxldCBpIG9mIHBhdGgpIHtcblx0XHRpZiAoIW9ialtpXSkge1xuXHRcdFx0Y29uc3Qgbm9kZSA9IHt9XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBpLCB7XG5cdFx0XHRcdGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gbm9kZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQoZGF0YSkge1xuXHRcdFx0XHRcdGRlZXBBc3NpZ24obm9kZSwgZGF0YSlcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0b2JqID0gb2JqW2ldXG5cdH1cblx0cmV0dXJuIG9ialxufVxuXG5jb25zdCByZXNvbHZlID0gKHsgcGF0aCwgX2tleSwgcGFyZW50Tm9kZSwgc3Vic2NyaWJlck5vZGUsIGRhdGFOb2RlIH0pID0+IHtcblx0aWYgKHBhdGgubGVuZ3RoID4gMCkge1xuXHRcdHBhcmVudE5vZGUgPSByZXNvbHZlUmVhY3RpdmVQYXRoKHBhdGgsIHBhcmVudE5vZGUpXG5cdFx0c3Vic2NyaWJlck5vZGUgPSByZXNvbHZlUGF0aChwYXRoLCBzdWJzY3JpYmVyTm9kZSlcblx0XHRkYXRhTm9kZSA9IHJlc29sdmVQYXRoKHBhdGgsIGRhdGFOb2RlKVxuXHR9XG5cdGlmICghc3Vic2NyaWJlck5vZGVbX2tleV0pIHN1YnNjcmliZXJOb2RlW19rZXldID0gW11cblx0aWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhTm9kZSwgX2tleSkpIGRhdGFOb2RlW19rZXldID0gJydcblx0cmV0dXJuIHsgcGFyZW50Tm9kZSwgc3Vic2NyaWJlck5vZGU6IHN1YnNjcmliZXJOb2RlW19rZXldLCBkYXRhTm9kZSB9XG59XG5cbmNvbnN0IHJlc29sdmVTdWJzY3JpYmVyID0gKHBhdGgsIHN1YnNjcmliZXIpID0+IHtcblx0Y29uc3QgcGF0aEFyciA9IHBhdGguc3BsaXQoJy4nKVxuXHRjb25zdCBrZXkgPSBwYXRoQXJyLnBvcCgpXG5cdHJldHVybiByZXNvbHZlUGF0aChwYXRoQXJyLCBzdWJzY3JpYmVyKVtrZXldXG59XG5cbmV4cG9ydCB7IHJlc29sdmVQYXRoLCByZXNvbHZlLCByZXNvbHZlU3Vic2NyaWJlciB9XG4iLCJpbXBvcnQgQVJSIGZyb20gJy4vYXJyYXktaGVscGVyLmpzJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJy4vcmVzb2x2ZXIuanMnXG5cbmNvbnN0IGluaXRCaW5kaW5nID0gKHtiaW5kLCBzdGF0ZSwgc3Vic2NyaWJlciwgaW5uZXJEYXRhLCBoYW5kbGVyfSkgPT4ge1xuXHRjb25zdCBwYXRoID0gQVJSLmNvcHkoYmluZFswXSlcblx0Y29uc3QgX2RlZmF1bHQgPSBiaW5kWzFdXG5cdGNvbnN0IF9rZXkgPSBwYXRoLnBvcCgpXG5cdGNvbnN0IHsgcGFyZW50Tm9kZSwgc3Vic2NyaWJlck5vZGUsIGRhdGFOb2RlIH0gPSByZXNvbHZlKHtcblx0XHRwYXRoLFxuXHRcdF9rZXksXG5cdFx0cGFyZW50Tm9kZTogc3RhdGUuJGRhdGEsXG5cdFx0c3Vic2NyaWJlck5vZGU6IHN1YnNjcmliZXIsXG5cdFx0ZGF0YU5vZGU6IGlubmVyRGF0YVxuXHR9KVxuXHRpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmVudE5vZGUsIF9rZXkpKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcmVudE5vZGUsIF9rZXksIHtcblx0XHRcdGdldCgpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGFOb2RlW19rZXldXG5cdFx0XHR9LFxuXHRcdFx0c2V0KHZhbHVlKSB7XG5cdFx0XHRcdGlmIChkYXRhTm9kZVtfa2V5XSA9PT0gdmFsdWUpIHJldHVyblxuXHRcdFx0XHRkYXRhTm9kZVtfa2V5XSA9IHZhbHVlXG5cdFx0XHRcdGZvciAobGV0IGogb2Ygc3Vic2NyaWJlck5vZGUpIGouY2FsbChzdGF0ZSwgdmFsdWUpXG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHRcdH0pXG5cdH1cblx0aWYgKF9kZWZhdWx0KSB7XG5cdFx0cGFyZW50Tm9kZVtfa2V5XSA9IF9kZWZhdWx0XG5cdH1cblxuXHRpZiAoaGFuZGxlcikge1xuXHRcdGlmIChwYXJlbnROb2RlW19rZXldKSBoYW5kbGVyKHBhcmVudE5vZGVbX2tleV0pXG5cdFx0c3Vic2NyaWJlck5vZGUucHVzaChoYW5kbGVyKVxuXHR9XG5cblx0cmV0dXJuIHtkYXRhTm9kZSwgc3Vic2NyaWJlck5vZGUsIF9rZXl9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXRCaW5kaW5nXG4iLCJpbXBvcnQgeyB3YXJuIH0gZnJvbSAnLi4vZGVidWcuanMnXG5pbXBvcnQgaW5pdEJpbmRpbmcgZnJvbSAnLi9iaW5kaW5nLmpzJ1xuXG5jb25zdCBnZXRFbGVtZW50ID0gKHRhZywgX25hbWUsIG5vZGVzKSA9PiB7XG5cdGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZylcblx0aWYgKF9uYW1lKSBPYmplY3QuZGVmaW5lUHJvcGVydHkobm9kZXMsIF9uYW1lLCB7XG5cdFx0dmFsdWU6IGVsZW1lbnQsXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KVxuXHRyZXR1cm4gZWxlbWVudFxufVxuXG5jb25zdCB1cGRhdGVPdGhlcnMgPSAoe2RhdGFOb2RlLCBzdWJzY3JpYmVyTm9kZSwgaGFuZGxlciwgc3RhdGUsIF9rZXksIHZhbHVlfSkgPT4ge1xuXHRpZiAoZGF0YU5vZGVbX2tleV0gPT09IHZhbHVlKSByZXR1cm5cblx0ZGF0YU5vZGVbX2tleV0gPSB2YWx1ZVxuXHRmb3IgKGxldCBpIG9mIHN1YnNjcmliZXJOb2RlKSB7XG5cdFx0aWYgKGkgIT09IGhhbmRsZXIpIGkuY2FsbChzdGF0ZSwgdmFsdWUpXG5cdH1cbn1cblxuY29uc3QgYWRkVmFsTGlzdGVuZXIgPSAoe2RhdGFOb2RlLCBzdWJzY3JpYmVyTm9kZSwgaGFuZGxlciwgc3RhdGUsIGVsZW1lbnQsIGtleSwgX2tleX0pID0+IHtcblx0aWYgKGtleSA9PT0gJ3ZhbHVlJykge1xuXHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB1cGRhdGVPdGhlcnMoe2RhdGFOb2RlLCBzdWJzY3JpYmVyTm9kZSwgaGFuZGxlciwgc3RhdGUsIF9rZXksIHZhbHVlOiBlbGVtZW50LnZhbHVlfSksIHRydWUpXG5cdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVPdGhlcnMoe2RhdGFOb2RlLCBzdWJzY3JpYmVyTm9kZSwgaGFuZGxlciwgc3RhdGUsIF9rZXksIHZhbHVlOiBlbGVtZW50LnZhbHVlfSksIHRydWUpXG5cdH0gZWxzZSBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHVwZGF0ZU90aGVycyh7ZGF0YU5vZGUsIHN1YnNjcmliZXJOb2RlLCBoYW5kbGVyLCBzdGF0ZSwgX2tleSwgdmFsdWU6IGVsZW1lbnQuY2hlY2tlZH0pLCB0cnVlKVxufVxuXG5jb25zdCBhZGRBdHRyID0gKHtlbGVtZW50LCBhdHRyLCBrZXksIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGF9KSA9PiB7XG5cdGlmICh0eXBlb2YgYXR0ciA9PT0gJ3N0cmluZycpIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYXR0cilcblx0ZWxzZSBpbml0QmluZGluZyh7YmluZDogYXR0ciwgc3RhdGUsIHN1YnNjcmliZXIsIGlubmVyRGF0YSwgaGFuZGxlcjogdmFsdWUgPT4gZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSl9KVxufVxuXG5jb25zdCBhZGRQcm9wID0gKHtlbGVtZW50LCBwcm9wLCBrZXksIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGF9KSA9PiB7XG5cdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpIGVsZW1lbnRba2V5XSA9IHByb3Bcblx0ZWxzZSB7XG5cdFx0Y29uc3QgaGFuZGxlciA9ICh2YWx1ZSkgPT4ge1xuXHRcdFx0ZWxlbWVudFtrZXldID0gdmFsdWVcblx0XHR9XG5cdFx0Y29uc3Qge2RhdGFOb2RlLCBzdWJzY3JpYmVyTm9kZSwgX2tleX0gPSBpbml0QmluZGluZyh7YmluZDogcHJvcCwgc3RhdGUsIHN1YnNjcmliZXIsIGlubmVyRGF0YSwgaGFuZGxlcn0pXG5cdFx0aWYgKGtleSA9PT0gJ3ZhbHVlJyB8fCBrZXkgPT09ICdjaGVja2VkJykgYWRkVmFsTGlzdGVuZXIoe2RhdGFOb2RlLCBzdWJzY3JpYmVyTm9kZSwgaGFuZGxlciwgc3RhdGUsIGVsZW1lbnQsIGtleSwgX2tleX0pXG5cdH1cbn1cblxuY29uc3QgYWRkRXZlbnQgPSAoe2VsZW1lbnQsIGV2ZW50LCBrZXksIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGF9KSA9PiB7XG5cdGNvbnN0IFttZXRob2QsIHZhbHVlXSA9IGV2ZW50XG5cdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdGNvbnN0IHtkYXRhTm9kZSwgX2tleX0gPSBpbml0QmluZGluZyh7YmluZDogdmFsdWUsIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGF9KVxuXHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihrZXksIChlKSA9PiB7XG5cdFx0XHRpZiAoc3RhdGUuJG1ldGhvZHNbbWV0aG9kXSkgc3RhdGUuJG1ldGhvZHNbbWV0aG9kXSh7ZSwgdmFsdWU6IGRhdGFOb2RlW19rZXldLCBzdGF0ZX0pXG5cdFx0XHRlbHNlIHdhcm4oYE1ldGhvZCBuYW1lZCAnJHttZXRob2R9JyBub3QgZm91bmQhYClcblx0XHR9KVxuXHRcdHJldHVyblxuXHR9XG5cdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihrZXksIChlKSA9PiB7XG5cdFx0aWYgKHN0YXRlLiRtZXRob2RzW21ldGhvZF0pIHN0YXRlLiRtZXRob2RzW21ldGhvZF0oe2UsIHZhbHVlLCBzdGF0ZX0pXG5cdFx0ZWxzZSB3YXJuKGBNZXRob2QgbmFtZWQgJyR7bWV0aG9kfScgbm90IGZvdW5kIWApXG5cdH0sIGZhbHNlKVxufVxuXG5jb25zdCBjcmVhdGVFbGVtZW50ID0gKHtpbmZvLCBzdGF0ZSwgaW5uZXJEYXRhLCBub2Rlcywgc3Vic2NyaWJlcn0pID0+IHtcblx0Y29uc3Qge3Q6IHRhZywgYTogYXR0ciwgcDogcHJvcCwgZTogZXZlbnQsIG46IF9uYW1lfSA9IGluZm9cblx0Y29uc3QgZWxlbWVudCA9IGdldEVsZW1lbnQodGFnLCBfbmFtZSwgbm9kZXMpXG5cdGZvciAobGV0IGkgaW4gYXR0cikgYWRkQXR0cih7ZWxlbWVudCwgYXR0cjogYXR0cltpXSwga2V5OiBpLCBzdGF0ZSwgc3Vic2NyaWJlciwgaW5uZXJEYXRhfSlcblx0Zm9yIChsZXQgaSBpbiBwcm9wKSBhZGRQcm9wKHtlbGVtZW50LCBwcm9wOiBwcm9wW2ldLCBrZXk6IGksIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGF9KVxuXHRmb3IgKGxldCBpIGluIGV2ZW50KSBhZGRFdmVudCh7ZWxlbWVudCwgZXZlbnQ6IGV2ZW50W2ldLCBrZXk6IGksIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGF9KVxuXHRyZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVFbGVtZW50XG4iLCJjb25zdCBwcm90byA9IE5vZGUucHJvdG90eXBlXG4vLyBjb25zdCBzYWZlWm9uZSA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXG5jb25zdCBET00gPSB7XG5cdC8vIGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuXHQvLyBcdGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWUuc3BsaXQoJyAnKVxuXHQvLyBcdG5vZGUuY2xhc3NMaXN0LmFkZCguLi5jbGFzc2VzKVxuXHQvLyB9LFxuXG5cdC8vIHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuXHQvLyBcdGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWUuc3BsaXQoJyAnKVxuXHQvLyBcdG5vZGUuY2xhc3NMaXN0LnJlbW92ZSguLi5jbGFzc2VzKVxuXHQvLyB9LFxuXG5cdC8vIHRvZ2dsZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkge1xuXHQvLyBcdGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWUuc3BsaXQoJyAnKVxuXHQvLyBcdGNvbnN0IGNsYXNzQXJyID0gbm9kZS5jbGFzc05hbWUuc3BsaXQoJyAnKVxuXHQvLyBcdGZvciAobGV0IGkgb2YgY2xhc3Nlcykge1xuXHQvLyBcdFx0Y29uc3QgY2xhc3NJbmRleCA9IGNsYXNzQXJyLmluZGV4T2YoaSlcblx0Ly8gXHRcdGlmIChjbGFzc0luZGV4ID4gLTEpIHtcblx0Ly8gXHRcdFx0Y2xhc3NBcnIuc3BsaWNlKGNsYXNzSW5kZXgsIDEpXG5cdC8vIFx0XHR9IGVsc2Uge1xuXHQvLyBcdFx0XHRjbGFzc0Fyci5wdXNoKGkpXG5cdC8vIFx0XHR9XG5cdC8vIFx0fVxuXHQvLyBcdG5vZGUuY2xhc3NOYW1lID0gY2xhc3NBcnIuam9pbignICcpLnRyaW0oKVxuXHQvLyB9LFxuXG5cdC8vIHJlcGxhY2VXaXRoKG5vZGUsIG5ld05vZGUpIHtcblx0Ly8gXHRjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGVcblx0Ly8gXHRpZiAocGFyZW50KSBwcm90by5yZXBsYWNlQ2hpbGQuY2FsbChwYXJlbnQsIG5ld05vZGUsIG5vZGUpXG5cdC8vIH0sXG5cblx0Ly8gc3dhcChub2RlLCBuZXdOb2RlKSB7XG5cdC8vIFx0Y29uc3Qgbm9kZVBhcmVudCA9IG5vZGUucGFyZW50Tm9kZVxuXHQvLyBcdGNvbnN0IG5ld05vZGVQYXJlbnQgPSBuZXdOb2RlLnBhcmVudE5vZGVcblx0Ly8gXHRjb25zdCBub2RlU2libGluZyA9IG5vZGUubmV4dFNpYmxpbmdcblx0Ly8gXHRjb25zdCBuZXdOb2RlU2libGluZyA9IG5ld05vZGUubmV4dFNpYmxpbmdcblx0Ly8gXHRpZiAobm9kZVBhcmVudCAmJiBuZXdOb2RlUGFyZW50KSB7XG5cdC8vIFx0XHRwcm90by5pbnNlcnRCZWZvcmUuY2FsbChub2RlUGFyZW50LCBuZXdOb2RlLCBub2RlU2libGluZylcblx0Ly8gXHRcdHByb3RvLmluc2VydEJlZm9yZS5jYWxsKG5ld05vZGVQYXJlbnQsIG5vZGUsIG5ld05vZGVTaWJsaW5nKVxuXHQvLyBcdH1cblx0Ly8gfSxcblxuXHRiZWZvcmUobm9kZSwgLi4ubm9kZXMpIHtcblx0XHRpZiAobm9kZS5wYXJlbnROb2RlKSB7XG5cdFx0XHRjb25zdCB0ZW1wRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRcdG5vZGVzLnJldmVyc2UoKVxuXHRcdFx0Zm9yIChsZXQgaSBvZiBub2Rlcykge1xuXHRcdFx0XHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKHRlbXBGcmFnbWVudCwgaSlcblx0XHRcdH1cblx0XHRcdHByb3RvLmluc2VydEJlZm9yZS5jYWxsKG5vZGUucGFyZW50Tm9kZSwgdGVtcEZyYWdtZW50LCBub2RlKVxuXHRcdH1cblx0fSxcblxuXHRhZnRlcihub2RlLCAuLi5ub2Rlcykge1xuXHRcdGlmIChub2RlLnBhcmVudE5vZGUpIHtcblx0XHRcdGNvbnN0IHRlbXBGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdFx0Zm9yIChsZXQgaSBvZiBub2Rlcykge1xuXHRcdFx0XHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKHRlbXBGcmFnbWVudCwgaSlcblx0XHRcdH1cblx0XHRcdGlmIChub2RlLm5leHRTaWJsaW5nKSB7XG5cdFx0XHRcdHByb3RvLmluc2VydEJlZm9yZS5jYWxsKG5vZGUucGFyZW50Tm9kZSwgdGVtcEZyYWdtZW50LCBub2RlLm5leHRTaWJsaW5nKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHJvdG8uYXBwZW5kQ2hpbGQuY2FsbChub2RlLnBhcmVudE5vZGUsIHRlbXBGcmFnbWVudClcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0YXBwZW5kKG5vZGUsIC4uLm5vZGVzKSB7XG5cdFx0aWYgKFsxLDksMTFdLmluZGV4T2Yobm9kZS5ub2RlVHlwZSkgPT09IC0xKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgdGVtcEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0Zm9yIChsZXQgaSBvZiBub2Rlcykge1xuXHRcdFx0cHJvdG8uYXBwZW5kQ2hpbGQuY2FsbCh0ZW1wRnJhZ21lbnQsIGkpXG5cdFx0fVxuXHRcdHByb3RvLmFwcGVuZENoaWxkLmNhbGwobm9kZSwgdGVtcEZyYWdtZW50KVxuXHR9LFxuXG5cdC8vIHByZXBlbmQobm9kZSwgLi4ubm9kZXMpIHtcblx0Ly8gXHRpZiAoWzEsOSwxMV0uaW5kZXhPZihub2RlLm5vZGVUeXBlKSA9PT0gLTEpIHtcblx0Ly8gXHRcdHJldHVyblxuXHQvLyBcdH1cblx0Ly8gXHRjb25zdCB0ZW1wRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0Ly8gXHRub2Rlcy5yZXZlcnNlKClcblx0Ly8gXHRmb3IgKGxldCBpIG9mIG5vZGVzKSB7XG5cdC8vIFx0XHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKHRlbXBGcmFnbWVudCwgaSlcblx0Ly8gXHR9XG5cdC8vIFx0aWYgKG5vZGUuZmlyc3RDaGlsZCkge1xuXHQvLyBcdFx0cHJvdG8uaW5zZXJ0QmVmb3JlLmNhbGwobm9kZSwgdGVtcEZyYWdtZW50LCBub2RlLmZpcnN0Q2hpbGQpXG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdHByb3RvLmFwcGVuZENoaWxkLmNhbGwobm9kZSwgdGVtcEZyYWdtZW50KVxuXHQvLyBcdH1cblx0Ly8gfSxcblxuXHQvLyBhcHBlbmRUbyhub2RlLCBuZXdOb2RlKSB7XG5cdC8vIFx0cHJvdG8uYXBwZW5kQ2hpbGQuY2FsbChuZXdOb2RlLCBub2RlKVxuXHQvLyB9LFxuXG5cdC8vIHByZXBlbmRUbyhub2RlLCBuZXdOb2RlKSB7XG5cdC8vIFx0aWYgKG5ld05vZGUuZmlyc3RDaGlsZCkge1xuXHQvLyBcdFx0cHJvdG8uaW5zZXJ0QmVmb3JlLmNhbGwobmV3Tm9kZSwgbm9kZSwgbm9kZS5maXJzdENoaWxkKVxuXHQvLyBcdH0gZWxzZSB7XG5cdC8vIFx0XHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKG5ld05vZGUsIG5vZGUpXG5cdC8vIFx0fVxuXHQvLyB9LFxuXG5cdC8vIGVtcHR5KG5vZGUpIHtcblx0Ly8gXHRub2RlLmlubmVySFRNTCA9ICcnXG5cdC8vIH0sXG5cblx0cmVtb3ZlKG5vZGUpIHtcblx0XHRwcm90by5yZW1vdmVDaGlsZC5jYWxsKG5vZGUucGFyZW50Tm9kZSwgbm9kZSlcblx0fSxcblxuXHQvLyBzYWZlUmVtb3ZlKG5vZGUpIHtcblx0Ly8gXHRwcm90by5hcHBlbmRDaGlsZC5jYWxsKHNhZmVab25lLCBub2RlKVxuXHQvLyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERPTVxuIiwiaW1wb3J0IERPTSBmcm9tICcuL2RvbS1oZWxwZXIuanMnXG5pbXBvcnQgQVJSIGZyb20gJy4vYXJyYXktaGVscGVyLmpzJ1xuaW1wb3J0IHsgd2FybkF0dGFjaG1lbnQgfSBmcm9tICcuLi9kZWJ1Zy5qcydcblxuY29uc3QgRE9NQVJSID0ge1xuXHRlbXB0eSgpIHtcblx0XHRmb3IgKGxldCBpIG9mIHRoaXMpIHtcblx0XHRcdERPTS5yZW1vdmUoaS4kZWxlbWVudClcblx0XHRcdGkuJGRlc3Ryb3koKVxuXHRcdH1cblx0XHRBUlIuZW1wdHkodGhpcylcblx0fSxcblx0cG9wKCkge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cdFx0Y29uc3QgcG9wZWQgPSBBUlIucG9wKHRoaXMpXG5cdFx0RE9NLnJlbW92ZShwb3BlZC4kZWxlbWVudClcblx0XHRyZXR1cm4gcG9wZWRcblx0fSxcblx0cHVzaChhbmNob3IsIC4uLml0ZW1zKSB7XG5cdFx0Y29uc3QgZWxlbWVudHMgPSBbXVxuXHRcdGZvciAobGV0IGkgb2YgaXRlbXMpIHtcblx0XHRcdGlmIChpLiRhdHRhY2hlZCkgcmV0dXJuIHdhcm5BdHRhY2htZW50KGkpXG5cdFx0XHRBUlIucHVzaChlbGVtZW50cywgaS4kZWxlbWVudClcblx0XHR9XG5cdFx0aWYgKHRoaXMubGVuZ3RoID09PSAwKSBET00uYWZ0ZXIoYW5jaG9yLCAuLi5lbGVtZW50cylcblx0XHRlbHNlIERPTS5hZnRlcih0aGlzW3RoaXMubGVuZ3RoIC0gMV0uJGVsZW1lbnQsIC4uLmVsZW1lbnRzKVxuXHRcdHJldHVybiBBUlIucHVzaCh0aGlzLCAuLi5pdGVtcylcblx0fSxcblx0cmVtb3ZlKC4uLml0ZW1zKSB7XG5cdFx0Y29uc3QgcmVtb3ZlZEl0ZW1zID0gW11cblx0XHRmb3IgKGxldCBpIG9mIGl0ZW1zKSB7XG5cdFx0XHRjb25zdCByZW1vdmVkID0gQVJSLnJlbW92ZSh0aGlzLCBpKVxuXHRcdFx0aWYgKHJlbW92ZWQpIHtcblx0XHRcdFx0RE9NLnJlbW92ZShyZW1vdmVkLiRlbGVtZW50KVxuXHRcdFx0XHRBUlIucHVzaChyZW1vdmVkSXRlbXMsIHJlbW92ZWQpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZW1vdmVkSXRlbXNcblx0fSxcblx0cmV2ZXJzZSgpIHtcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzXG5cdFx0Y29uc3QgaW5zZXJ0UG9pbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJylcblx0XHRET00uYmVmb3JlKHRoaXNbMF0uJGVsZW1lbnQsIGluc2VydFBvaW50KVxuXHRcdGNvbnN0IGVsZW1lbnRzID0gW11cblx0XHRmb3IgKGxldCBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgQVJSLnB1c2goZWxlbWVudHMsIHRoaXNbaV0uJGVsZW1lbnQpXG5cdFx0RE9NLmFmdGVyKGluc2VydFBvaW50LCAuLi5lbGVtZW50cylcblx0XHRET00ucmVtb3ZlKGluc2VydFBvaW50KVxuXHRcdHJldHVybiBBUlIucmV2ZXJzZSh0aGlzKVxuXHR9LFxuXHRzaGlmdCgpIHtcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXHRcdGNvbnN0IHNoaWZ0ZWQgPSBBUlIuc2hpZnQodGhpcylcblx0XHRET00ucmVtb3ZlKHNoaWZ0ZWQuJGVsZW1lbnQpXG5cdFx0cmV0dXJuIHNoaWZ0ZWRcblx0fSxcblx0c29ydChmbikge1xuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXNcblx0XHRjb25zdCBpbnNlcnRQb2ludCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKVxuXHRcdERPTS5iZWZvcmUodGhpc1swXS4kZWxlbWVudCwgaW5zZXJ0UG9pbnQpXG5cdFx0Y29uc3Qgc29ydGVkID0gQVJSLnNvcnQodGhpcywgZm4pXG5cdFx0Y29uc3QgZWxlbWVudHMgPSBbXVxuXHRcdGZvciAobGV0IGkgb2YgdGhpcykgQVJSLnB1c2goZWxlbWVudHMsIGkuJGVsZW1lbnQpXG5cdFx0RE9NLmFmdGVyKGluc2VydFBvaW50LCAuLi5lbGVtZW50cylcblx0XHRET00ucmVtb3ZlKGluc2VydFBvaW50KVxuXHRcdHJldHVybiBzb3J0ZWRcblx0fSxcblx0c3BsaWNlKC4uLmFyZ3MpIHtcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzXG5cdFx0Y29uc3QgaW5zZXJ0UG9pbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJylcblx0XHRET00uYmVmb3JlKHRoaXNbMF0uJGVsZW1lbnQsIGluc2VydFBvaW50KVxuXHRcdGNvbnN0IHNwbGljZWQgPSBBUlIuc3BsaWNlKHRoaXMsIC4uLmFyZ3MpXG5cdFx0Y29uc3QgZWxlbWVudHMgPSBbXVxuXHRcdGZvciAobGV0IGkgb2Ygc3BsaWNlZCkgRE9NLnJlbW92ZShpLiRlbGVtZW50KVxuXHRcdGZvciAobGV0IGkgb2YgdGhpcykgQVJSLnB1c2goZWxlbWVudHMsIGkuJGVsZW1lbnQpXG5cdFx0RE9NLmFmdGVyKGluc2VydFBvaW50LCAuLi5lbGVtZW50cylcblx0XHRET00ucmVtb3ZlKGluc2VydFBvaW50KVxuXHRcdHJldHVybiBzcGxpY2VkXG5cdH0sXG5cdHVuc2hpZnQoLi4uaXRlbXMpIHtcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLnB1c2goLi4uaXRlbXMpLmxlbmd0aFxuXHRcdGNvbnN0IGluc2VydFBvaW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpXG5cdFx0RE9NLmJlZm9yZSh0aGlzWzBdLiRlbGVtZW50LCBpbnNlcnRQb2ludClcblx0XHRjb25zdCBlbGVtZW50cyA9IFtdXG5cdFx0Zm9yIChsZXQgaSBvZiBpdGVtcykge1xuXHRcdFx0aWYgKGkuJGF0dGFjaGVkKSByZXR1cm4gd2FybkF0dGFjaG1lbnQoaSlcblx0XHRcdEFSUi5wdXNoKGVsZW1lbnRzLCBpLiRlbGVtZW50KVxuXHRcdH1cblx0XHRET00uYWZ0ZXIoaW5zZXJ0UG9pbnQsIC4uLmVsZW1lbnRzKVxuXHRcdERPTS5yZW1vdmUoaW5zZXJ0UG9pbnQpXG5cdFx0cmV0dXJuIEFSUi51bnNoaWZ0KHRoaXMsIC4uLml0ZW1zKVxuXHR9XG59XG5cbmNvbnN0IGRlZmluZUFyciA9IChhcnIsIGFuY2hvcikgPT4ge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhcnIsIHtcblx0XHRlbXB0eToge3ZhbHVlOiBET01BUlIuZW1wdHl9LFxuXHRcdHBvcDoge3ZhbHVlOiBET01BUlIucG9wfSxcblx0XHRwdXNoOiB7dmFsdWU6IERPTUFSUi5wdXNoLmJpbmQoYXJyLCBhbmNob3IpfSxcblx0XHRyZW1vdmU6IHt2YWx1ZTogRE9NQVJSLnJlbW92ZX0sXG5cdFx0cmV2ZXJzZToge3ZhbHVlOiBET01BUlIucmV2ZXJzZX0sXG5cdFx0c2hpZnQ6IHt2YWx1ZTogRE9NQVJSLnNoaWZ0fSxcblx0XHRzb3J0OiB7dmFsdWU6IERPTUFSUi5zb3J0fSxcblx0XHRzcGxpY2U6IHt2YWx1ZTogRE9NQVJSLnNwbGljZX0sXG5cdFx0dW5zaGlmdDoge3ZhbHVlOiBET01BUlIudW5zaGlmdH1cblx0fSlcblx0cmV0dXJuIGFyclxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVBcnJcbiIsImNvbnN0IHR5cGVPZiA9IChvYmopID0+IHtcblx0aWYgKEFycmF5LmlzQXJyYXkob2JqKSkgcmV0dXJuICdhcnJheSdcblx0cmV0dXJuIHR5cGVvZiBvYmpcbn1cblxuZXhwb3J0IGRlZmF1bHQgdHlwZU9mXG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuL2VsZW1lbnQtY3JlYXRvci5qcydcbmltcG9ydCBET00gZnJvbSAnLi9kb20taGVscGVyLmpzJ1xuaW1wb3J0IEFSUiBmcm9tICcuL2FycmF5LWhlbHBlci5qcydcbmltcG9ydCBkZWZpbmVBcnIgZnJvbSAnLi9kb20tYXJyLWhlbHBlci5qcydcbmltcG9ydCB0eXBlT2YgZnJvbSAnLi90eXBlLW9mLmpzJ1xuaW1wb3J0IGluaXRCaW5kaW5nIGZyb20gJy4vYmluZGluZy5qcydcbmltcG9ydCB7IHdhcm4sIHdhcm5BdHRhY2htZW50LCB3YXJuUGFyZW50Tm9kZSB9IGZyb20gJy4uL2RlYnVnLmpzJ1xuXG4vLyBSZXNlcnZlZCBuYW1lc1xuY29uc3QgcmVzZXJ2ZWQgPSAnYXR0YWNoZWQgZGF0YSBlbGVtZW50IG5vZGVzIG1ldGhvZHMgc3Vic2NyaWJlIHVuc3Vic2NyaWJlIHVwZGF0ZSBkZXN0cm95J1xuXHQuc3BsaXQoJyAnKS5tYXAoaSA9PiBgJCR7aX1gKVxuXG5jb25zdCBiaW5kVGV4dE5vZGUgPSAoe25vZGUsIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGEsIGVsZW1lbnR9KSA9PiB7XG5cdC8vIERhdGEgYmluZGluZyB0ZXh0IG5vZGVcblx0Y29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJylcblx0Y29uc3QgaGFuZGxlciA9ICh2YWx1ZSkgPT4ge1xuXHRcdHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWVcblx0fVxuXHRpbml0QmluZGluZyh7YmluZDogbm9kZSwgc3RhdGUsIHN1YnNjcmliZXIsIGlubmVyRGF0YSwgaGFuZGxlcn0pXG5cblx0Ly8gQXBwZW5kIGVsZW1lbnQgdG8gdGhlIGNvbXBvbmVudFxuXHRET00uYXBwZW5kKGVsZW1lbnQsIHRleHROb2RlKVxufVxuXG5jb25zdCB1cGRhdGVNb3VudGluZ05vZGUgPSAoeyRlbGVtZW50LCBjaGlsZHJlbiwgbmFtZSwgYW5jaG9yLCB2YWx1ZX0pID0+IHtcblx0aWYgKGNoaWxkcmVuW25hbWVdID09PSB2YWx1ZSkgcmV0dXJuXG5cdGlmICh2YWx1ZSkge1xuXHRcdGlmICh2YWx1ZS4kYXR0YWNoZWQpIHdhcm5BdHRhY2htZW50KHZhbHVlKVxuXHRcdGlmICh2YWx1ZS4kZWxlbWVudC5jb250YWlucygkZWxlbWVudCkpIHJldHVybiB3YXJuUGFyZW50Tm9kZSgpXG5cdH1cblx0Ly8gVXBkYXRlIGNvbXBvbmVudFxuXHRpZiAoY2hpbGRyZW5bbmFtZV0pIERPTS5yZW1vdmUoY2hpbGRyZW5bbmFtZV0uJGVsZW1lbnQpXG5cdGlmICh2YWx1ZSkgRE9NLmFmdGVyKGFuY2hvciwgdmFsdWUuJGVsZW1lbnQpXG5cdC8vIFVwZGF0ZSBzdG9yZWQgdmFsdWVcblx0Y2hpbGRyZW5bbmFtZV0gPSB2YWx1ZVxufVxuXG5jb25zdCBiaW5kTW91bnRpbmdOb2RlID0gKHtzdGF0ZSwgbmFtZSwgY2hpbGRyZW4sIGFuY2hvcn0pID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0YXRlLCBuYW1lLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIGNoaWxkcmVuW25hbWVdXG5cdFx0fSxcblx0XHRzZXQodmFsdWUpIHtcblx0XHRcdHVwZGF0ZU1vdW50aW5nTm9kZSh7JGVsZW1lbnQ6IHN0YXRlLiRlbGVtZW50LCBjaGlsZHJlbiwgbmFtZSwgYW5jaG9yLCB2YWx1ZX0pXG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHR9KVxufVxuXG5jb25zdCB1cGRhdGVNb3VudGluZ0xpc3QgPSAoeyRlbGVtZW50LCBjaGlsZHJlbiwgbmFtZSwgYW5jaG9yLCB2YWx1ZX0pID0+IHtcblx0aWYgKHZhbHVlKSB2YWx1ZSA9IEFSUi5jb3B5KHZhbHVlKVxuXHRlbHNlIHZhbHVlID0gW11cblx0Y29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0Ly8gVXBkYXRlIGNvbXBvbmVudHNcblx0aWYgKGNoaWxkcmVuW25hbWVdKSB7XG5cdFx0Zm9yIChsZXQgaiBvZiB2YWx1ZSkge1xuXHRcdFx0aWYgKGouJGVsZW1lbnQuY29udGFpbnMoJGVsZW1lbnQpKSByZXR1cm4gd2FyblBhcmVudE5vZGUoKVxuXHRcdFx0RE9NLmFwcGVuZChmcmFnbWVudCwgai4kZWxlbWVudClcblx0XHRcdEFSUi5yZW1vdmUoY2hpbGRyZW5bbmFtZV0sIGopXG5cdFx0fVxuXHRcdGZvciAobGV0IGogb2YgY2hpbGRyZW5bbmFtZV0pIERPTS5yZW1vdmUoai4kZWxlbWVudClcblx0fSBlbHNlIGZvciAobGV0IGogb2YgdmFsdWUpIERPTS5hcHBlbmQoZnJhZ21lbnQsIGouJGVsZW1lbnQpXG5cdC8vIFVwZGF0ZSBzdG9yZWQgdmFsdWVcblx0Y2hpbGRyZW5bbmFtZV0ubGVuZ3RoID0gMFxuXHRBUlIucHVzaChjaGlsZHJlbltuYW1lXSwgLi4udmFsdWUpXG5cdC8vIEFwcGVuZCB0byBjdXJyZW50IGNvbXBvbmVudFxuXHRET00uYWZ0ZXIoYW5jaG9yLCBmcmFnbWVudClcbn1cblxuY29uc3QgYmluZE1vdW50aW5nTGlzdCA9ICh7c3RhdGUsIG5hbWUsIGNoaWxkcmVuLCBhbmNob3J9KSA9PiB7XG5cdGNoaWxkcmVuW25hbWVdID0gZGVmaW5lQXJyKFtdLCBhbmNob3IpXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdGF0ZSwgbmFtZSwge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBjaGlsZHJlbltuYW1lXVxuXHRcdH0sXG5cdFx0c2V0KHZhbHVlKSB7XG5cdFx0XHRpZiAoY2hpbGRyZW5bbmFtZV0gJiYgQVJSLmVxdWFscyhjaGlsZHJlbltuYW1lXSwgdmFsdWUpKSByZXR1cm5cblx0XHRcdHVwZGF0ZU1vdW50aW5nTGlzdCh7JGVsZW1lbnQ6IHN0YXRlLiRlbGVtZW50LCBjaGlsZHJlbiwgbmFtZSwgYW5jaG9yLCB2YWx1ZX0pXG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHR9KVxufVxuXG5jb25zdCByZXNvbHZlQVNUID0gKHtub2RlLCBub2RlVHlwZSwgZWxlbWVudCwgc3RhdGUsIGlubmVyRGF0YSwgbm9kZXMsIGNoaWxkcmVuLCBzdWJzY3JpYmVyLCBjcmVhdGV9KSA9PiB7XG5cdHN3aXRjaCAobm9kZVR5cGUpIHtcblx0XHRjYXNlICdzdHJpbmcnOiB7XG5cdFx0XHQvLyBTdGF0aWMgdGV4dCBub2RlXG5cdFx0XHRET00uYXBwZW5kKGVsZW1lbnQsIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpKVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSAnYXJyYXknOiB7XG5cdFx0XHRpZiAodHlwZU9mKG5vZGVbMF0pID09PSAnb2JqZWN0JykgRE9NLmFwcGVuZChlbGVtZW50LCBjcmVhdGUoe2FzdDogbm9kZSwgc3RhdGUsIGlubmVyRGF0YSwgbm9kZXMsIGNoaWxkcmVuLCBzdWJzY3JpYmVyLCBjcmVhdGV9KSlcblx0XHRcdGVsc2UgYmluZFRleHROb2RlKHtub2RlLCBzdGF0ZSwgc3Vic2NyaWJlciwgaW5uZXJEYXRhLCBlbGVtZW50fSlcblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGNhc2UgJ29iamVjdCc6IHtcblx0XHRcdGlmIChyZXNlcnZlZC5pbmRleE9mKG5vZGUubikgIT09IC0xKSB7XG5cdFx0XHRcdHdhcm4oYFJlc2VydmVkIG5hbWUgJyR7bm9kZS5ufScgc2hvdWxkIG5vdCBiZSB1c2VkLCBpZ25vcmluZy5gKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpXG5cdFx0XHRpZiAobm9kZS50ID09PSAwKSBiaW5kTW91bnRpbmdOb2RlKHtzdGF0ZSwgbmFtZTogbm9kZS5uLCBjaGlsZHJlbiwgYW5jaG9yfSlcblx0XHRcdGVsc2UgaWYgKG5vZGUudCA9PT0gMSkgYmluZE1vdW50aW5nTGlzdCh7c3RhdGUsIG5hbWU6IG5vZGUubiwgY2hpbGRyZW4sIGFuY2hvcn0pXG5cdFx0XHRlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vdCBhIHN0YW5kYXJkIGVmLmpzIEFTVDogVW5rbm93biBtb3VudGluZyBwb2ludCB0eXBlICcke25vZGUudH0nYClcblx0XHRcdC8vIEFwcGVuZCBwbGFjZWhvbGRlclxuXHRcdFx0RE9NLmFwcGVuZChlbGVtZW50LCBhbmNob3IpXG5cdFx0XHRpZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcblx0XHRcdFx0RE9NLmJlZm9yZShhbmNob3IsIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoYFN0YXJ0IG9mIG1vdW50aW5nIHBvaW50ICcke25vZGUubn0nYCkpXG5cdFx0XHRcdERPTS5hZnRlcihhbmNob3IsIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoYEVuZCBvZiBtb3VudGluZyBwb2ludCAnJHtub2RlLm59J2ApKVxuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgTm90IGEgc3RhbmRhcmQgZWYuanMgQVNUOiBVbmtub3duIG5vZGUgdHlwZSAnJHtub2RlVHlwZX0nYClcblx0XHR9XG5cdH1cbn1cblxuY29uc3QgY3JlYXRlID0gKHthc3QsIHN0YXRlLCBpbm5lckRhdGEsIG5vZGVzLCBjaGlsZHJlbiwgc3Vic2NyaWJlciwgY3JlYXRlfSkgPT4ge1xuXHQvLyBGaXJzdCBjcmVhdGUgYW4gZWxlbWVudCBhY2NvcmRpbmcgdG8gdGhlIGRlc2NyaXB0aW9uXG5cdGNvbnN0IGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50KHtpbmZvOiBhc3RbMF0sIHN0YXRlLCBpbm5lckRhdGEsIG5vZGVzLCBzdWJzY3JpYmVyfSlcblxuXHQvLyBBcHBlbmQgY2hpbGQgbm9kZXNcblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBhc3QubGVuZ3RoOyBpKyspIHJlc29sdmVBU1Qoe25vZGU6IGFzdFtpXSwgbm9kZVR5cGU6IHR5cGVPZihhc3RbaV0pLGVsZW1lbnQsIHN0YXRlLCBpbm5lckRhdGEsIG5vZGVzLCBjaGlsZHJlbiwgc3Vic2NyaWJlciwgY3JlYXRlfSlcblxuXHRyZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHR2YXIgc3RyID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG5cdHZhciBpc0FyZ3MgPSBzdHIgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXHRpZiAoIWlzQXJncykge1xuXHRcdGlzQXJncyA9IHN0ciAhPT0gJ1tvYmplY3QgQXJyYXldJyAmJlxuXHRcdFx0dmFsdWUgIT09IG51bGwgJiZcblx0XHRcdHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcblx0XHRcdHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInICYmXG5cdFx0XHR2YWx1ZS5sZW5ndGggPj0gMCAmJlxuXHRcdFx0dG9TdHIuY2FsbCh2YWx1ZS5jYWxsZWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXHR9XG5cdHJldHVybiBpc0FyZ3M7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9lcy1zaGltcy9lczUtc2hpbVxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGlzQXJncyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKTtcbnZhciBpc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIGhhc0RvbnRFbnVtQnVnID0gIWlzRW51bWVyYWJsZS5jYWxsKHsgdG9TdHJpbmc6IG51bGwgfSwgJ3RvU3RyaW5nJyk7XG52YXIgaGFzUHJvdG9FbnVtQnVnID0gaXNFbnVtZXJhYmxlLmNhbGwoZnVuY3Rpb24gKCkge30sICdwcm90b3R5cGUnKTtcbnZhciBkb250RW51bXMgPSBbXG5cdCd0b1N0cmluZycsXG5cdCd0b0xvY2FsZVN0cmluZycsXG5cdCd2YWx1ZU9mJyxcblx0J2hhc093blByb3BlcnR5Jyxcblx0J2lzUHJvdG90eXBlT2YnLFxuXHQncHJvcGVydHlJc0VudW1lcmFibGUnLFxuXHQnY29uc3RydWN0b3InXG5dO1xudmFyIGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlID0gZnVuY3Rpb24gKG8pIHtcblx0dmFyIGN0b3IgPSBvLmNvbnN0cnVjdG9yO1xuXHRyZXR1cm4gY3RvciAmJiBjdG9yLnByb3RvdHlwZSA9PT0gbztcbn07XG52YXIgZXhjbHVkZWRLZXlzID0ge1xuXHQkY29uc29sZTogdHJ1ZSxcblx0JGV4dGVybmFsOiB0cnVlLFxuXHQkZnJhbWU6IHRydWUsXG5cdCRmcmFtZUVsZW1lbnQ6IHRydWUsXG5cdCRmcmFtZXM6IHRydWUsXG5cdCRpbm5lckhlaWdodDogdHJ1ZSxcblx0JGlubmVyV2lkdGg6IHRydWUsXG5cdCRvdXRlckhlaWdodDogdHJ1ZSxcblx0JG91dGVyV2lkdGg6IHRydWUsXG5cdCRwYWdlWE9mZnNldDogdHJ1ZSxcblx0JHBhZ2VZT2Zmc2V0OiB0cnVlLFxuXHQkcGFyZW50OiB0cnVlLFxuXHQkc2Nyb2xsTGVmdDogdHJ1ZSxcblx0JHNjcm9sbFRvcDogdHJ1ZSxcblx0JHNjcm9sbFg6IHRydWUsXG5cdCRzY3JvbGxZOiB0cnVlLFxuXHQkc2VsZjogdHJ1ZSxcblx0JHdlYmtpdEluZGV4ZWREQjogdHJ1ZSxcblx0JHdlYmtpdFN0b3JhZ2VJbmZvOiB0cnVlLFxuXHQkd2luZG93OiB0cnVlXG59O1xudmFyIGhhc0F1dG9tYXRpb25FcXVhbGl0eUJ1ZyA9IChmdW5jdGlvbiAoKSB7XG5cdC8qIGdsb2JhbCB3aW5kb3cgKi9cblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRmb3IgKHZhciBrIGluIHdpbmRvdykge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoIWV4Y2x1ZGVkS2V5c1snJCcgKyBrXSAmJiBoYXMuY2FsbCh3aW5kb3csIGspICYmIHdpbmRvd1trXSAhPT0gbnVsbCAmJiB0eXBlb2Ygd2luZG93W2tdID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlKHdpbmRvd1trXSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59KCkpO1xudmFyIGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlSWZOb3RCdWdneSA9IGZ1bmN0aW9uIChvKSB7XG5cdC8qIGdsb2JhbCB3aW5kb3cgKi9cblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNBdXRvbWF0aW9uRXF1YWxpdHlCdWcpIHtcblx0XHRyZXR1cm4gZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGUobyk7XG5cdH1cblx0dHJ5IHtcblx0XHRyZXR1cm4gZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGUobyk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbnZhciBrZXlzU2hpbSA9IGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG5cdHZhciBpc09iamVjdCA9IG9iamVjdCAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jztcblx0dmFyIGlzRnVuY3Rpb24gPSB0b1N0ci5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5cdHZhciBpc0FyZ3VtZW50cyA9IGlzQXJncyhvYmplY3QpO1xuXHR2YXIgaXNTdHJpbmcgPSBpc09iamVjdCAmJiB0b1N0ci5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuXHR2YXIgdGhlS2V5cyA9IFtdO1xuXG5cdGlmICghaXNPYmplY3QgJiYgIWlzRnVuY3Rpb24gJiYgIWlzQXJndW1lbnRzKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdCcpO1xuXHR9XG5cblx0dmFyIHNraXBQcm90byA9IGhhc1Byb3RvRW51bUJ1ZyAmJiBpc0Z1bmN0aW9uO1xuXHRpZiAoaXNTdHJpbmcgJiYgb2JqZWN0Lmxlbmd0aCA+IDAgJiYgIWhhcy5jYWxsKG9iamVjdCwgMCkpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdC5sZW5ndGg7ICsraSkge1xuXHRcdFx0dGhlS2V5cy5wdXNoKFN0cmluZyhpKSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKGlzQXJndW1lbnRzICYmIG9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBvYmplY3QubGVuZ3RoOyArK2opIHtcblx0XHRcdHRoZUtleXMucHVzaChTdHJpbmcoaikpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IgKHZhciBuYW1lIGluIG9iamVjdCkge1xuXHRcdFx0aWYgKCEoc2tpcFByb3RvICYmIG5hbWUgPT09ICdwcm90b3R5cGUnKSAmJiBoYXMuY2FsbChvYmplY3QsIG5hbWUpKSB7XG5cdFx0XHRcdHRoZUtleXMucHVzaChTdHJpbmcobmFtZSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdHZhciBza2lwQ29uc3RydWN0b3IgPSBlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZUlmTm90QnVnZ3kob2JqZWN0KTtcblxuXHRcdGZvciAodmFyIGsgPSAwOyBrIDwgZG9udEVudW1zLmxlbmd0aDsgKytrKSB7XG5cdFx0XHRpZiAoIShza2lwQ29uc3RydWN0b3IgJiYgZG9udEVudW1zW2tdID09PSAnY29uc3RydWN0b3InKSAmJiBoYXMuY2FsbChvYmplY3QsIGRvbnRFbnVtc1trXSkpIHtcblx0XHRcdFx0dGhlS2V5cy5wdXNoKGRvbnRFbnVtc1trXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGVLZXlzO1xufTtcblxua2V5c1NoaW0uc2hpbSA9IGZ1bmN0aW9uIHNoaW1PYmplY3RLZXlzKCkge1xuXHRpZiAoT2JqZWN0LmtleXMpIHtcblx0XHR2YXIga2V5c1dvcmtzV2l0aEFyZ3VtZW50cyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0XHQvLyBTYWZhcmkgNS4wIGJ1Z1xuXHRcdFx0cmV0dXJuIChPYmplY3Qua2V5cyhhcmd1bWVudHMpIHx8ICcnKS5sZW5ndGggPT09IDI7XG5cdFx0fSgxLCAyKSk7XG5cdFx0aWYgKCFrZXlzV29ya3NXaXRoQXJndW1lbnRzKSB7XG5cdFx0XHR2YXIgb3JpZ2luYWxLZXlzID0gT2JqZWN0LmtleXM7XG5cdFx0XHRPYmplY3Qua2V5cyA9IGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG5cdFx0XHRcdGlmIChpc0FyZ3Mob2JqZWN0KSkge1xuXHRcdFx0XHRcdHJldHVybiBvcmlnaW5hbEtleXMoc2xpY2UuY2FsbChvYmplY3QpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gb3JpZ2luYWxLZXlzKG9iamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdE9iamVjdC5rZXlzID0ga2V5c1NoaW07XG5cdH1cblx0cmV0dXJuIE9iamVjdC5rZXlzIHx8IGtleXNTaGltO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzU2hpbTtcbiIsIlxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZvckVhY2ggKG9iaiwgZm4sIGN0eCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKGZuKSAhPT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdmFyIGwgPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsID09PSArbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgZm4uY2FsbChjdHgsIG9ialtpXSwgaSwgb2JqKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrKSkge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY3R4LCBvYmpba10sIGssIG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gcmVxdWlyZSgnb2JqZWN0LWtleXMnKTtcbnZhciBmb3JlYWNoID0gcmVxdWlyZSgnZm9yZWFjaCcpO1xudmFyIGhhc1N5bWJvbHMgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2woKSA9PT0gJ3N5bWJvbCc7XG5cbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZuKSB7XG5cdHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgdG9TdHIuY2FsbChmbikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59O1xuXG52YXIgYXJlUHJvcGVydHlEZXNjcmlwdG9yc1N1cHBvcnRlZCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIG9iaiA9IHt9O1xuXHR0cnkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICd4JywgeyBlbnVtZXJhYmxlOiBmYWxzZSwgdmFsdWU6IG9iaiB9KTtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMsIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG4gICAgICAgIGZvciAodmFyIF8gaW4gb2JqKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzLCBuby1yZXN0cmljdGVkLXN5bnRheCAqL1xuXHRcdHJldHVybiBvYmoueCA9PT0gb2JqO1xuXHR9IGNhdGNoIChlKSB7IC8qIHRoaXMgaXMgSUUgOC4gKi9cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG52YXIgc3VwcG9ydHNEZXNjcmlwdG9ycyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSAmJiBhcmVQcm9wZXJ0eURlc2NyaXB0b3JzU3VwcG9ydGVkKCk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIHZhbHVlLCBwcmVkaWNhdGUpIHtcblx0aWYgKG5hbWUgaW4gb2JqZWN0ICYmICghaXNGdW5jdGlvbihwcmVkaWNhdGUpIHx8ICFwcmVkaWNhdGUoKSkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0aWYgKHN1cHBvcnRzRGVzY3JpcHRvcnMpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG5cdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0b2JqZWN0W25hbWVdID0gdmFsdWU7XG5cdH1cbn07XG5cbnZhciBkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iamVjdCwgbWFwKSB7XG5cdHZhciBwcmVkaWNhdGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB7fTtcblx0dmFyIHByb3BzID0ga2V5cyhtYXApO1xuXHRpZiAoaGFzU3ltYm9scykge1xuXHRcdHByb3BzID0gcHJvcHMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMobWFwKSk7XG5cdH1cblx0Zm9yZWFjaChwcm9wcywgZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIG1hcFtuYW1lXSwgcHJlZGljYXRlc1tuYW1lXSk7XG5cdH0pO1xufTtcblxuZGVmaW5lUHJvcGVydGllcy5zdXBwb3J0c0Rlc2NyaXB0b3JzID0gISFzdXBwb3J0c0Rlc2NyaXB0b3JzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnRpZXM7XG4iLCJ2YXIgRVJST1JfTUVTU0FHRSA9ICdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBjYWxsZWQgb24gaW5jb21wYXRpYmxlICc7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGZ1bmNUeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKHRoYXQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcztcbiAgICBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKHRhcmdldCkgIT09IGZ1bmNUeXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRVJST1JfTUVTU0FHRSArIHRhcmdldCk7XG4gICAgfVxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgdmFyIGJvdW5kO1xuICAgIHZhciBiaW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0YXJnZXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0LmFwcGx5KFxuICAgICAgICAgICAgICAgIHRoYXQsXG4gICAgICAgICAgICAgICAgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgYm91bmRMZW5ndGggPSBNYXRoLm1heCgwLCB0YXJnZXQubGVuZ3RoIC0gYXJncy5sZW5ndGgpO1xuICAgIHZhciBib3VuZEFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvdW5kTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYm91bmRBcmdzLnB1c2goJyQnICsgaSk7XG4gICAgfVxuXG4gICAgYm91bmQgPSBGdW5jdGlvbignYmluZGVyJywgJ3JldHVybiBmdW5jdGlvbiAoJyArIGJvdW5kQXJncy5qb2luKCcsJykgKyAnKXsgcmV0dXJuIGJpbmRlci5hcHBseSh0aGlzLGFyZ3VtZW50cyk7IH0nKShiaW5kZXIpO1xuXG4gICAgaWYgKHRhcmdldC5wcm90b3R5cGUpIHtcbiAgICAgICAgdmFyIEVtcHR5ID0gZnVuY3Rpb24gRW1wdHkoKSB7fTtcbiAgICAgICAgRW1wdHkucHJvdG90eXBlID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgYm91bmQucHJvdG90eXBlID0gbmV3IEVtcHR5KCk7XG4gICAgICAgIEVtcHR5LnByb3RvdHlwZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJvdW5kO1xufTtcbiIsInZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBpbXBsZW1lbnRhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgPSByZXF1aXJlKCdvYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhhc1N5bWJvbHMoKSB7XG5cdGlmICh0eXBlb2YgU3ltYm9sICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzICE9PSAnZnVuY3Rpb24nKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAodHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gJ3N5bWJvbCcpIHsgcmV0dXJuIHRydWU7IH1cblxuXHR2YXIgb2JqID0ge307XG5cdHZhciBzeW0gPSBTeW1ib2woJ3Rlc3QnKTtcblx0dmFyIHN5bU9iaiA9IE9iamVjdChzeW0pO1xuXHRpZiAodHlwZW9mIHN5bSA9PT0gJ3N0cmluZycpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzeW0pICE9PSAnW29iamVjdCBTeW1ib2xdJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzeW1PYmopICE9PSAnW29iamVjdCBTeW1ib2xdJykgeyByZXR1cm4gZmFsc2U7IH1cblxuXHQvLyB0ZW1wIGRpc2FibGVkIHBlciBodHRwczovL2dpdGh1Yi5jb20vbGpoYXJiL29iamVjdC5hc3NpZ24vaXNzdWVzLzE3XG5cdC8vIGlmIChzeW0gaW5zdGFuY2VvZiBTeW1ib2wpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdC8vIHRlbXAgZGlzYWJsZWQgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uL2dldC1vd24tcHJvcGVydHktc3ltYm9scy9pc3N1ZXMvNFxuXHQvLyBpZiAoIShzeW1PYmogaW5zdGFuY2VvZiBTeW1ib2wpKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdHZhciBzeW1WYWwgPSA0Mjtcblx0b2JqW3N5bV0gPSBzeW1WYWw7XG5cdGZvciAoc3ltIGluIG9iaikgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKGtleXMob2JqKS5sZW5ndGggIT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgJiYgT2JqZWN0LmtleXMob2JqKS5sZW5ndGggIT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmxlbmd0aCAhPT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHR2YXIgc3ltcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqKTtcblx0aWYgKHN5bXMubGVuZ3RoICE9PSAxIHx8IHN5bXNbMF0gIT09IHN5bSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRpZiAoIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmosIHN5bSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgc3ltKTtcblx0XHRpZiAoZGVzY3JpcHRvci52YWx1ZSAhPT0gc3ltVmFsIHx8IGRlc2NyaXB0b3IuZW51bWVyYWJsZSAhPT0gdHJ1ZSkgeyByZXR1cm4gZmFsc2U7IH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZXMtc2hpbXMvZXM2LXNoaW1cbnZhciBrZXlzID0gcmVxdWlyZSgnb2JqZWN0LWtleXMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnZnVuY3Rpb24tYmluZCcpO1xudmFyIGNhbkJlT2JqZWN0ID0gZnVuY3Rpb24gKG9iaikge1xuXHRyZXR1cm4gdHlwZW9mIG9iaiAhPT0gJ3VuZGVmaW5lZCcgJiYgb2JqICE9PSBudWxsO1xufTtcbnZhciBoYXNTeW1ib2xzID0gcmVxdWlyZSgnLi9oYXNTeW1ib2xzJykoKTtcbnZhciB0b09iamVjdCA9IE9iamVjdDtcbnZhciBwdXNoID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIEFycmF5LnByb3RvdHlwZS5wdXNoKTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUpO1xudmFyIG9yaWdpbmFsR2V0U3ltYm9scyA9IGhhc1N5bWJvbHMgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzIDogbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UxKSB7XG5cdGlmICghY2FuQmVPYmplY3QodGFyZ2V0KSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBvYmplY3QnKTsgfVxuXHR2YXIgb2JqVGFyZ2V0ID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHMsIHNvdXJjZSwgaSwgcHJvcHMsIHN5bXMsIHZhbHVlLCBrZXk7XG5cdGZvciAocyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyArK3MpIHtcblx0XHRzb3VyY2UgPSB0b09iamVjdChhcmd1bWVudHNbc10pO1xuXHRcdHByb3BzID0ga2V5cyhzb3VyY2UpO1xuXHRcdHZhciBnZXRTeW1ib2xzID0gaGFzU3ltYm9scyAmJiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyB8fCBvcmlnaW5hbEdldFN5bWJvbHMpO1xuXHRcdGlmIChnZXRTeW1ib2xzKSB7XG5cdFx0XHRzeW1zID0gZ2V0U3ltYm9scyhzb3VyY2UpO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHN5bXMubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0a2V5ID0gc3ltc1tpXTtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUoc291cmNlLCBrZXkpKSB7XG5cdFx0XHRcdFx0cHVzaChwcm9wcywga2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcblx0XHRcdGtleSA9IHByb3BzW2ldO1xuXHRcdFx0dmFsdWUgPSBzb3VyY2Vba2V5XTtcblx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlKHNvdXJjZSwga2V5KSkge1xuXHRcdFx0XHRvYmpUYXJnZXRba2V5XSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gb2JqVGFyZ2V0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGltcGxlbWVudGF0aW9uID0gcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xuXG52YXIgbGFja3NQcm9wZXJFbnVtZXJhdGlvbk9yZGVyID0gZnVuY3Rpb24gKCkge1xuXHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0Ly8gdjgsIHNwZWNpZmljYWxseSBpbiBub2RlIDQueCwgaGFzIGEgYnVnIHdpdGggaW5jb3JyZWN0IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyXG5cdC8vIG5vdGU6IHRoaXMgZG9lcyBub3QgZGV0ZWN0IHRoZSBidWcgdW5sZXNzIHRoZXJlJ3MgMjAgY2hhcmFjdGVyc1xuXHR2YXIgc3RyID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jztcblx0dmFyIGxldHRlcnMgPSBzdHIuc3BsaXQoJycpO1xuXHR2YXIgbWFwID0ge307XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGV0dGVycy5sZW5ndGg7ICsraSkge1xuXHRcdG1hcFtsZXR0ZXJzW2ldXSA9IGxldHRlcnNbaV07XG5cdH1cblx0dmFyIG9iaiA9IE9iamVjdC5hc3NpZ24oe30sIG1hcCk7XG5cdHZhciBhY3R1YWwgPSAnJztcblx0Zm9yICh2YXIgayBpbiBvYmopIHtcblx0XHRhY3R1YWwgKz0gaztcblx0fVxuXHRyZXR1cm4gc3RyICE9PSBhY3R1YWw7XG59O1xuXG52YXIgYXNzaWduSGFzUGVuZGluZ0V4Y2VwdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICghT2JqZWN0LmFzc2lnbiB8fCAhT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdC8vIEZpcmVmb3ggMzcgc3RpbGwgaGFzIFwicGVuZGluZyBleGNlcHRpb25cIiBsb2dpYyBpbiBpdHMgT2JqZWN0LmFzc2lnbiBpbXBsZW1lbnRhdGlvbixcblx0Ly8gd2hpY2ggaXMgNzIlIHNsb3dlciB0aGFuIG91ciBzaGltLCBhbmQgRmlyZWZveCA0MCdzIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbi5cblx0dmFyIHRocm93ZXIgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnMoeyAxOiAyIH0pO1xuXHR0cnkge1xuXHRcdE9iamVjdC5hc3NpZ24odGhyb3dlciwgJ3h5Jyk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gdGhyb3dlclsxXSA9PT0gJ3knO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0UG9seWZpbGwoKSB7XG5cdGlmICghT2JqZWN0LmFzc2lnbikge1xuXHRcdHJldHVybiBpbXBsZW1lbnRhdGlvbjtcblx0fVxuXHRpZiAobGFja3NQcm9wZXJFbnVtZXJhdGlvbk9yZGVyKCkpIHtcblx0XHRyZXR1cm4gaW1wbGVtZW50YXRpb247XG5cdH1cblx0aWYgKGFzc2lnbkhhc1BlbmRpbmdFeGNlcHRpb25zKCkpIHtcblx0XHRyZXR1cm4gaW1wbGVtZW50YXRpb247XG5cdH1cblx0cmV0dXJuIE9iamVjdC5hc3NpZ247XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmaW5lID0gcmVxdWlyZSgnZGVmaW5lLXByb3BlcnRpZXMnKTtcbnZhciBnZXRQb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzaGltQXNzaWduKCkge1xuXHR2YXIgcG9seWZpbGwgPSBnZXRQb2x5ZmlsbCgpO1xuXHRkZWZpbmUoXG5cdFx0T2JqZWN0LFxuXHRcdHsgYXNzaWduOiBwb2x5ZmlsbCB9LFxuXHRcdHsgYXNzaWduOiBmdW5jdGlvbiAoKSB7IHJldHVybiBPYmplY3QuYXNzaWduICE9PSBwb2x5ZmlsbDsgfSB9XG5cdCk7XG5cdHJldHVybiBwb2x5ZmlsbDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZWZpbmVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnZGVmaW5lLXByb3BlcnRpZXMnKTtcblxudmFyIGltcGxlbWVudGF0aW9uID0gcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xudmFyIGdldFBvbHlmaWxsID0gcmVxdWlyZSgnLi9wb2x5ZmlsbCcpO1xudmFyIHNoaW0gPSByZXF1aXJlKCcuL3NoaW0nKTtcblxudmFyIHBvbHlmaWxsID0gZ2V0UG9seWZpbGwoKTtcblxuZGVmaW5lUHJvcGVydGllcyhwb2x5ZmlsbCwge1xuXHRpbXBsZW1lbnRhdGlvbjogaW1wbGVtZW50YXRpb24sXG5cdGdldFBvbHlmaWxsOiBnZXRQb2x5ZmlsbCxcblx0c2hpbTogc2hpbVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9seWZpbGw7XG4iLCJpbXBvcnQgX2Fzc2lnbiBmcm9tICdvYmplY3QuYXNzaWduJ1xuXG5jb25zdCBhc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IF9hc3NpZ25cblxuZXhwb3J0IHsgYXNzaWduIH1cbiIsIi8qIEFzdCBzdHJ1Y3R1cmU6XG4gKiBhc3QgPSBbXG4gKiBcdHtcbiAqIFx0XHR0YWc6ICdkaXYnLFxuICogXHRcdGF0dHI6IHtcbiAqIFx0XHRcdGNsYXNzOiBbWydjbGFzcyddLCAnc29tZSBjbGFzc25hbWUnXSxcbiAqIFx0XHRcdHN0eWxlOiBbWydhdHRyJywgJ3N0eWxlJ11dLFxuICogXHRcdFx0aWQ6ICd0ZXN0ZGl2JyxcbiAqIFx0XHRcdCdzb21lLWF0dHInOiAnc29tZSB0ZXh0J1xuICogXHRcdFx0Y29udGVudDogbnVsbFxuICogXHRcdH0sXG4gKiBcdFx0cHJvcDoge1xuICogXHRcdFx0dGl0bGU6IFtbJ25hbWUnXV0sXG4gKiBcdFx0XHRhbm90aGVyUHJvcGVydHk6ICd0ZXh0JyxcbiAqIFx0XHRcdGNvbnRlbnRFZGl0YWJsZTogW1snZWRpdCddXVxuICogXHRcdH1cbiAqIFx0XHRldmVudDoge1xuICogXHRcdFx0Y2xpY2s6IFsndXBkYXRlSW5mbycsIFsnaW5mbyddXSxcbiAqIFx0XHRcdG1vdXNlZG93bjogJ3NldFN0YXRlJ1xuICogXHRcdH1cbiAqIFx0fSxcbiAqIFx0J25hbWU6ICcsXG4gKiBcdFtbJ25hbWUnXV0sXG4gKiBcdCdcXG5Kb2I6ICcsXG4gKiBcdFtbJ2pvYiddXSxcbiAqIFx0W1xuICogXHRcdHtcbiAqIFx0XHRcdHRhZzogJ2JyJyxcbiAqIFx0XHR9XG4gKiBcdF0sXG4gKiBcdHsgbmFtZTogJ25vZGUxJywgdHlwZTogJ25vZGUnIH0sXG4gKiBcdFtcbiAqIFx0XHR7XG4gKiBcdFx0XHR0YWc6ICdwJyxcbiAqIFx0XHRcdGF0dHI6IHtcbiAqIFx0XHRcdFx0Y2xhc3M6ICdzb21lIGNsYXNzIG5hbWUnXG4gKiBcdFx0XHR9XG4gKiBcdFx0fSxcbiAqIFx0XHRbXG4gKiBcdFx0XHR7XG4gKiBcdFx0XHRcdHRhZzogJ3NwYW4nXG4gKiBcdFx0XHR9LFxuICogXHRcdFx0J05vdGljZTogJyxcbiAqIFx0XHRcdFtbJ25vdGljZSddXVxuICogXHRcdF0sXG4gKiBcdFx0J3NvbWUgdGV4dCcsXG4gKiBcdFx0eyBuYW1lOiAnbm9kZTInLCB0eXBlOiAnbm9kZScgfSxcbiAqIFx0XHR7IG5hbWU6ICdsaXN0MScsIHR5cGU6ICdsaXN0JyB9XG4gKiBcdF1cbiAqIF1cbiAqL1xuXG5pbXBvcnQgY3JlYXRlIGZyb20gJy4vdXRpbHMvY3JlYXRvci5qcydcbmltcG9ydCB7IHJlc29sdmVTdWJzY3JpYmVyIH0gZnJvbSAnLi91dGlscy9yZXNvbHZlci5qcydcbmltcG9ydCBpbml0QmluZGluZyBmcm9tICcuL3V0aWxzL2JpbmRpbmcuanMnXG5pbXBvcnQgQVJSIGZyb20gJy4vdXRpbHMvYXJyYXktaGVscGVyLmpzJ1xuaW1wb3J0IHsgYXNzaWduIH0gZnJvbSAnLi91dGlscy9wb2x5ZmlsbHMuanMnXG5pbXBvcnQgZGVlcEFzc2lnbiBmcm9tICdkZWVwLWFzc2lnbidcblxuY29uc3QgdW5zdWJzY3JpYmUgPSAocGF0aCwgZm4sIHN1YnNjcmliZXIpID0+IHtcblx0Y29uc3Qgc3Vic2NyaWJlck5vZGUgPSByZXNvbHZlU3Vic2NyaWJlcihwYXRoLCBzdWJzY3JpYmVyKVxuXHRjb25zdCBpbmRleCA9IHN1YnNjcmliZXJOb2RlLmluZGV4T2YoZm4pXG5cdGlmIChpbmRleCA9PT0gLTEpIHJldHVyblxuXHRBUlIucmVtb3ZlKHN1YnNjcmliZXJOb2RlLCBmbilcbn1cblxuY29uc3QgY2hlY2tBdHRhY2hlZCA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuICEhdGhpcy4kZWxlbWVudC5wYXJlbnROb2RlXG59XG5cbmNvbnN0IHVwZGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuXHRjb25zdCB0bXBTdGF0ZSA9IGFzc2lnbih7fSwgc3RhdGUpXG5cdGlmICh0bXBTdGF0ZS4kZGF0YSkge1xuXHRcdGFzc2lnbih0aGlzLiRkYXRhLCB0bXBTdGF0ZS4kZGF0YSlcblx0XHRkZWxldGUodG1wU3RhdGUuJGRhdGEpXG5cdH1cblx0aWYgKHRtcFN0YXRlLiRtZXRob2RzKSB7XG5cdFx0YXNzaWduKHRoaXMuJG1ldGhvZHMsIHRtcFN0YXRlLiRtZXRob2RzKVxuXHRcdGRlbGV0ZSh0bXBTdGF0ZS4kbWV0aG9kcylcblx0fVxuXHRhc3NpZ24odGhpcywgdG1wU3RhdGUpXG59XG5cbmNvbnN0IGRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblx0Zm9yIChsZXQgaSBpbiB0aGlzKSB7XG5cdFx0dGhpc1tpXSA9IG51bGxcblx0XHRkZWxldGUgdGhpc1tpXVxuXHR9XG5cdGRlbGV0ZSB0aGlzLiRlbGVtZW50XG5cdGRlbGV0ZSB0aGlzLiRkYXRhXG5cdGRlbGV0ZSB0aGlzLiRtZXRob2RzXG5cdGRlbGV0ZSB0aGlzLiRub2Rlc1xuXHRkZWxldGUgdGhpcy4kc3Vic2NyaWJlXG5cdGRlbGV0ZSB0aGlzLiR1bnN1YnNjcmliZVxuXHRkZWxldGUgdGhpcy4kYXR0YWNoZWRcblx0ZGVsZXRlIHRoaXMuJHVwZGF0ZVxuXHRkZWxldGUgdGhpcy4kZGVzdHJveVxufVxuXG5jb25zdCByZW5kZXIgPSAoYXN0KSA9PiB7XG5cdGNvbnN0IHN0YXRlID0ge31cblx0Y29uc3QgY2hpbGRyZW4gPSB7fVxuXHRjb25zdCBub2RlcyA9IHt9XG5cdGNvbnN0IGRhdGEgPSB7fVxuXHRjb25zdCBpbm5lckRhdGEgPSB7fVxuXHRjb25zdCBtZXRob2RzID0ge31cblx0Y29uc3Qgc3Vic2NyaWJlciA9IHt9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0YXRlLCB7XG5cdFx0JGRhdGE6IHtcblx0XHRcdGdldCgpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGFcblx0XHRcdH0sXG5cdFx0XHRzZXQobmV3RGF0YSkge1xuXHRcdFx0XHRkZWVwQXNzaWduKGRhdGEsIG5ld0RhdGEpXG5cdFx0XHR9LFxuXHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0fSxcblx0XHQkbWV0aG9kczoge1xuXHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRyZXR1cm4gbWV0aG9kc1xuXHRcdFx0fSxcblx0XHRcdHNldChuZXdNZXRob2RzKSB7XG5cdFx0XHRcdGRlZXBBc3NpZ24obWV0aG9kcywgbmV3TWV0aG9kcylcblx0XHRcdH0sXG5cdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHR9LFxuXHRcdCRub2Rlczoge1xuXHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRyZXR1cm4gbm9kZXNcblx0XHRcdH0sXG5cdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHR9LFxuXHRcdCRzdWJzY3JpYmU6IHtcblx0XHRcdHZhbHVlOiAocGF0aFN0ciwgaGFuZGxlcikgPT4ge1xuXHRcdFx0XHRjb25zdCBwYXRoID0gcGF0aFN0ci5zcGxpdCgnLicpXG5cdFx0XHRcdGluaXRCaW5kaW5nKHtiaW5kOiBbcGF0aF0sIHN0YXRlLCBzdWJzY3JpYmVyLCBpbm5lckRhdGEsIGhhbmRsZXJ9KVxuXHRcdFx0fSxcblx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdH0sXG5cdFx0JHVuc3Vic2NyaWJlOiB7XG5cdFx0XHR2YWx1ZTogKHBhdGgsIGZuKSA9PiB7XG5cdFx0XHRcdHVuc3Vic2NyaWJlKHBhdGgsIGZuLCBzdWJzY3JpYmVyKVxuXHRcdFx0fSxcblx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdH0sXG5cdFx0JGF0dGFjaGVkOiB7XG5cdFx0XHRnZXQ6IGNoZWNrQXR0YWNoZWQsXG5cdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHR9LFxuXHRcdCR1cGRhdGU6IHtcblx0XHRcdHZhbHVlOiB1cGRhdGUsXG5cdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHR9LFxuXHRcdCRkZXN0cm95OiB7XG5cdFx0XHR2YWx1ZTogZGVzdHJveSxcblx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdH1cblx0fSlcblx0Y29uc3QgZWxlbWVudCA9IGNyZWF0ZSh7YXN0LCBzdGF0ZSwgaW5uZXJEYXRhLCBub2RlcywgY2hpbGRyZW4sIHN1YnNjcmliZXIsIGNyZWF0ZX0pXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdGF0ZSwgJyRlbGVtZW50Jywge1xuXHRcdHZhbHVlOiBlbGVtZW50LFxuXHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHR9KVxuXHRyZXR1cm4gc3RhdGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyXG4iLCJjb25zdCBtaXhTdHIgPSAoc3RycywgLi4uZXhwcnMpID0+IHtcblx0bGV0IHN0cmluZyA9ICcnXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgZXhwcnMubGVuZ3RoOyBpKyspIHN0cmluZyArPSAoc3Ryc1tpXSArIGV4cHJzW2ldKVxuXHRyZXR1cm4gc3RyaW5nICsgc3Ryc1tzdHJzLmxlbmd0aCAtIDFdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1peFN0clxuIiwiLyogZ2xvYmFsIEdJVFZFUlNJT04gKi9cblxuLy8gSW1wb3J0IGV2ZXJ5dGhpbmdcbmltcG9ydCB7IGluZm8gfSBmcm9tICcuL2xpYi9kZWJ1Zy5qcydcbmltcG9ydCBwYXJzZSBmcm9tICcuL2xpYi9wYXJzZXIuanMnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vbGliL3JlbmRlcmVyLmpzJ1xuaW1wb3J0IHR5cGVPZiBmcm9tICcuL2xpYi91dGlscy90eXBlLW9mLmpzJ1xuaW1wb3J0IG1peFN0ciBmcm9tICcuL2xpYi91dGlscy9saXRlcmFscy1taXguanMnXG5pbXBvcnQgZWZ0UGFyc2VyIGZyb20gJ2VmdC1wYXJzZXInXG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi4vcGFja2FnZS5qc29uJ1xuXG4vLyBTZXQgcGFyc2VyXG5sZXQgcGFyc2VyID0gZWZ0UGFyc2VyXG5cbi8vIENvbnN0cnVjdCB0aGUgY2xhc3NcbmNvbnN0IGVmID0gY2xhc3Mge1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuXHRcdGNvbnN0IHZhbFR5cGUgPSB0eXBlT2YodmFsdWUpXG5cdFx0aWYgKHZhbFR5cGUgPT09ICdzdHJpbmcnKSB2YWx1ZSA9IHBhcnNlKHZhbHVlLCBwYXJzZXIpXG5cdFx0ZWxzZSBpZiAodmFsVHlwZSAhPT0gJ2FycmF5JykgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNyZWF0ZSBuZXcgY29tcG9uZW50IHdpdGhvdXQgcHJvcGVyIHRlbXBsYXRlIG9yIEFTVCEnKVxuXG5cdFx0Y29uc3QgYXN0ID0gdmFsdWVcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JlbmRlcicsIHtcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoc3RhdGUpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gcmVuZGVyKGFzdClcblx0XHRcdFx0aWYgKHN0YXRlKSByZXN1bHQuJHVwZGF0ZShzdGF0ZSlcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRzdGF0aWMgc2V0UGF0c2VyKG5ld1BhcnNlcikge1xuXHRcdHBhcnNlciA9IG5ld1BhcnNlclxuXHR9XG5cblx0c3RhdGljIHBhcnNlRWZ0KHRlbXBsYXRlKSB7XG5cdFx0cmV0dXJuIGVmdFBhcnNlcih0ZW1wbGF0ZSlcblx0fVxuXG5cdHN0YXRpYyB0KC4uLnN0cnMpIHtcblx0XHRyZXR1cm4gbmV3IGVmKG1peFN0ciguLi5zdHJzKSlcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBlZlxuXG5pbmZvKGBlZi5qcyB2JHt2ZXJzaW9ufS4ke0dJVFZFUlNJT059IGluaXRpYWxpemVkIWApXG4iLCJjb25zdCBwcm90byA9IEFycmF5LnByb3RvdHlwZVxuXG5jb25zdCBBUlIgPSB7XG5cdGNvcHkoYXJyKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNsaWNlLmNhbGwoYXJyLCAwKVxuXHR9LFxuXHRlbXB0eShhcnIpIHtcblx0XHRhcnIubGVuZ3RoID0gMFxuXHRcdHJldHVybiBhcnJcblx0fSxcblx0ZXF1YWxzKGxlZnQsIHJpZ2h0KSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHJpZ2h0KSkgcmV0dXJuIGZhbHNlXG5cdFx0aWYgKGxlZnQgPT09IHJpZ2h0KSByZXR1cm4gdHJ1ZVxuXHRcdGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2Vcblx0XHRmb3IgKGxldCBpIGluIGxlZnQpIGlmIChsZWZ0W2ldICE9PSByaWdodFtpXSkgcmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIHRydWVcblx0fSxcblx0cG9wKGFycikge1xuXHRcdHJldHVybiBwcm90by5wb3AuY2FsbChhcnIpXG5cdH0sXG5cdHB1c2goYXJyLCAuLi5pdGVtcykge1xuXHRcdHJldHVybiBwcm90by5wdXNoLmFwcGx5KGFyciwgaXRlbXMpXG5cdH0sXG5cdHJlbW92ZShhcnIsIGl0ZW0pIHtcblx0XHRjb25zdCBpbmRleCA9IHByb3RvLmluZGV4T2YuY2FsbChhcnIsIGl0ZW0pXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHByb3RvLnNwbGljZS5jYWxsKGFyciwgaW5kZXgsIDEpXG5cdFx0XHRyZXR1cm4gaXRlbVxuXHRcdH1cblx0fSxcblx0cmV2ZXJzZShhcnIpIHtcblx0XHRyZXR1cm4gcHJvdG8ucmV2ZXJzZS5jYWxsKGFycilcblx0fSxcblx0c2hpZnQoYXJyKSB7XG5cdFx0cmV0dXJuIHByb3RvLnNoaWZ0LmNhbGwoYXJyKVxuXHR9LFxuXHRzbGljZShhcnIsIGluZGV4LCBsZW5ndGgpIHtcblx0XHRyZXR1cm4gcHJvdG8uc2xpY2UuY2FsbChhcnIsIGluZGV4LCBsZW5ndGgpXG5cdH0sXG5cdHNvcnQoYXJyLCBmbikge1xuXHRcdHJldHVybiBwcm90by5zb3J0LmNhbGwoYXJyLCBmbilcblx0fSxcblx0c3BsaWNlKGFyciwgLi4uYXJncykge1xuXHRcdHJldHVybiBwcm90by5zcGxpY2UuYXBwbHkoYXJyLCBhcmdzKVxuXHR9LFxuXHR1bnNoaWZ0KGFyciwgLi4uaXRlbXMpIHtcblx0XHRyZXR1cm4gcHJvdG8udW5zaGlmdC5hcHBseShhcnIsIGl0ZW1zKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFSUlxuIiwiaW1wb3J0ICdjbGFzc2xpc3QtcG9seWZpbGwnXG5cbmltcG9ydCBfdG9kb2FwcCBmcm9tICcuL3RtcGxzL3RvZG9hcHAuZWZ0J1xuaW1wb3J0IF9tYWluIGZyb20gJy4vdG1wbHMvbWFpbi5lZnQnXG5pbXBvcnQgX3RvZG8gZnJvbSAnLi90bXBscy90b2RvLmVmdCdcbmltcG9ydCBfZm9vdGVyIGZyb20gJy4vdG1wbHMvZm9vdGVyLmVmdCdcblxuaW1wb3J0IEFSUiBmcm9tICcuLi9hcnJheS1oZWxwZXIuanMnXG5cbmNvbnN0IEVOVEVSX0tFWSA9IDEzXG5jb25zdCBFU0NBUEVfS0VZID0gMjdcblxuY29uc3QgdG9kb2FwcCA9IF90b2RvYXBwLnJlbmRlcigpXG5jb25zdCBtYWluID0gX21haW4ucmVuZGVyKClcbmNvbnN0IGZvb3RlciA9IF9mb290ZXIucmVuZGVyKClcbmxldCBvcmRlciA9IDBcblxudG9kb2FwcC5tYWluID0gbWFpblxudG9kb2FwcC5mb290ZXIgPSBmb290ZXJcblxuY29uc3QgdG9kb3MgPSBbXVxuY29uc3QgY29tcGxldGVkID0gW11cbmNvbnN0IGFsbCA9IFtdXG5jb25zdCBzdG9yYWdlID0gW11cblxuY29uc3QgdXBkYXRlU3RvcmFnZSA9ICgpID0+IHtcblx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RvZG9zLWVmJywgSlNPTi5zdHJpbmdpZnkoc3RvcmFnZSkpXG59XG5cbmNvbnN0IHNvcnRMaXN0ID0gKGwsIHIpID0+IHtcblx0aWYgKGwuJGRhdGEub3JkZXIgPiByLiRkYXRhLm9yZGVyKSByZXR1cm4gMVxuXHRyZXR1cm4gLTFcbn1cblxuY29uc3QgdXBkYXRlTGlzdCA9IChoYXNoKSA9PiB7XG5cdHN3aXRjaCAoaGFzaCkge1xuXHRcdGNhc2UgJyMvYWN0aXZlJzoge1xuXHRcdFx0bWFpbi50b2RvcyA9IHRvZG9zLnNvcnQoc29ydExpc3QpXG5cdFx0XHRmb290ZXIuJGRhdGEgPSB7XG5cdFx0XHRcdGFsbFNlbGVjdGVkOiAnJyxcblx0XHRcdFx0YWN0aXZlU2VsZWN0ZWQ6ICdzZWxlY3RlZCcsXG5cdFx0XHRcdGNvbXBsZXRlZFNlbGVjdGVkOiAnJ1xuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSAnIy9jb21wbGV0ZWQnOiB7XG5cdFx0XHRtYWluLnRvZG9zID0gY29tcGxldGVkLnNvcnQoc29ydExpc3QpXG5cdFx0XHRmb290ZXIuJGRhdGEgPSB7XG5cdFx0XHRcdGFsbFNlbGVjdGVkOiAnJyxcblx0XHRcdFx0YWN0aXZlU2VsZWN0ZWQ6ICcnLFxuXHRcdFx0XHRjb21wbGV0ZWRTZWxlY3RlZDogJ3NlbGVjdGVkJ1xuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0bWFpbi50b2RvcyA9IGFsbFxuXHRcdFx0Zm9vdGVyLiRkYXRhID0ge1xuXHRcdFx0XHRhbGxTZWxlY3RlZDogJ3NlbGVjdGVkJyxcblx0XHRcdFx0YWN0aXZlU2VsZWN0ZWQ6ICcnLFxuXHRcdFx0XHRjb21wbGV0ZWRTZWxlY3RlZDogJydcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuY29uc3QgdXBkYXRlQ291bnQgPSAoKSA9PiB7XG5cdGlmIChhbGwubGVuZ3RoID09PSAwKSB7XG5cdFx0Zm9vdGVyLiRlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblx0XHRtYWluLiRlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblx0fSBlbHNlIHtcblx0XHRmb290ZXIuJGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblx0XHRtYWluLiRlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cdH1cblxuXHRpZiAoYWxsLmxlbmd0aCAhPT0gMCAmJiBhbGwubGVuZ3RoID09PSBjb21wbGV0ZWQubGVuZ3RoKSBtYWluLiRkYXRhLmFsbENvbXBsZXRlZCA9IHRydWVcblx0ZWxzZSBtYWluLiRkYXRhLmFsbENvbXBsZXRlZCA9IGZhbHNlXG5cblx0aWYgKGNvbXBsZXRlZC5sZW5ndGggPT09IDApIGZvb3Rlci4kbm9kZXMuY2xlYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXHRlbHNlIGZvb3Rlci4kbm9kZXMuY2xlYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblx0Zm9vdGVyLiRkYXRhLmNvdW50ID0gdG9kb3MubGVuZ3RoXG5cdGlmICh0b2Rvcy5sZW5ndGggPiAxKSBmb290ZXIuJGRhdGEucyA9ICdzJ1xuXHRlbHNlIGZvb3Rlci4kZGF0YS5zID0gJydcbn1cblxuY29uc3QgdG9nZ2xlQWxsID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSkge1xuXHRcdGNvbnN0IF90b2RvcyA9IEFSUi5jb3B5KHRvZG9zKVxuXHRcdGZvciAobGV0IGkgb2YgX3RvZG9zKSB7XG5cdFx0XHRpLiRkYXRhLmNvbXBsZXRlZCA9IHRydWVcblx0XHR9XG5cdH0gZWxzZSBpZiAoY29tcGxldGVkLmxlbmd0aCA9PT0gYWxsLmxlbmd0aCkge1xuXHRcdGNvbnN0IF9jb21wbGV0ZWQgPSBBUlIuY29weShjb21wbGV0ZWQpXG5cdFx0Zm9yIChsZXQgaSBvZiBfY29tcGxldGVkKSBpLiRkYXRhLmNvbXBsZXRlZCA9IGZhbHNlXG5cdH1cblx0aWYgKGxvY2F0aW9uLmhhc2ggIT09ICcjLycpIHVwZGF0ZUxpc3QobG9jYXRpb24uaGFzaClcbn1cblxuY29uc3QgY2xlYXIgPSAoKSA9PiB7XG5cdGZvciAobGV0IGkgb2YgY29tcGxldGVkKSB7XG5cdFx0QVJSLnJlbW92ZShhbGwsIGkpXG5cdFx0QVJSLnJlbW92ZShzdG9yYWdlLCBpLiRkYXRhKVxuXHRcdG1haW4udG9kb3MucmVtb3ZlKGkpXG5cdFx0aS4kZGVzdHJveSgpXG5cdH1cblx0Y29tcGxldGVkLmxlbmd0aCA9IDBcblx0dXBkYXRlQ291bnQoKVxuXHR1cGRhdGVTdG9yYWdlKClcblx0dXBkYXRlTGlzdChsb2NhdGlvbi5oYXNoKVxufVxuXG5jb25zdCBkZXN0cm95ID0gKHtzdGF0ZX0pID0+IHtcblx0QVJSLnJlbW92ZShhbGwsIHN0YXRlKVxuXHRtYWluLnRvZG9zLnJlbW92ZShzdGF0ZSlcblxuXHRBUlIucmVtb3ZlKHN0b3JhZ2UsIHN0YXRlLiRkYXRhKVxuXHRBUlIucmVtb3ZlKHRvZG9zLCBzdGF0ZSlcblx0QVJSLnJlbW92ZShjb21wbGV0ZWQsIHN0YXRlKVxuXG5cdHN0YXRlLiRkZXN0cm95KClcblx0dXBkYXRlQ291bnQoKVxuXHR1cGRhdGVTdG9yYWdlKClcblx0dXBkYXRlTGlzdChsb2NhdGlvbi5oYXNoKVxufVxuXG5jb25zdCB0b2dnbGVDb21wbGV0ZSA9IGZ1bmN0aW9uKGNoZWNrZWQpIHtcblx0aWYgKGNoZWNrZWQpIHtcblx0XHR0aGlzLiRlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbXBsZXRlZCcpXG5cdFx0QVJSLnJlbW92ZSh0b2RvcywgdGhpcylcblx0XHRjb21wbGV0ZWQucHVzaCh0aGlzKVxuXHRcdGlmIChsb2NhdGlvbi5oYXNoID09PSAnIy9hY3RpdmUnKSBtYWluLnRvZG9zLnJlbW92ZSh0aGlzKVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuJGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29tcGxldGVkJylcblx0XHR0b2Rvcy5wdXNoKHRoaXMpXG5cdFx0QVJSLnJlbW92ZShjb21wbGV0ZWQsIHRoaXMpXG5cdFx0aWYgKGxvY2F0aW9uLmhhc2ggPT09ICcjL2NvbXBsZXRlZCcpIG1haW4udG9kb3MucmVtb3ZlKHRoaXMpXG5cdH1cblx0dXBkYXRlQ291bnQoKVxuXHR1cGRhdGVTdG9yYWdlKClcbn1cblxuY29uc3QgY29uZmlybUVkaXQgPSAoc3RhdGUpID0+IHtcblx0Y29uc3QgbmV3VmFsID0gc3RhdGUuJGRhdGEudXBkYXRlLnRyaW0oKVxuXHRzdGF0ZS4kbWV0aG9kcy5jb25maXJtID0gbnVsbFxuXHRpZiAoIW5ld1ZhbCkgcmV0dXJuIGRlc3Ryb3koe3N0YXRlfSlcblx0c3RhdGUuJGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZWRpdGluZycpXG5cdHN0YXRlLiRkYXRhLnRpdGxlID0gbmV3VmFsXG5cdHN0YXRlLiRkYXRhLnVwZGF0ZSA9ICcnXG5cdHVwZGF0ZVN0b3JhZ2UoKVxufVxuXG5jb25zdCBjYW5jbGVFZGl0ID0gKHN0YXRlKSA9PiB7XG5cdHN0YXRlLiRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2VkaXRpbmcnKVxuXHRzdGF0ZS4kbWV0aG9kcy5jb25maXJtID0gbnVsbFxuXHRzdGF0ZS4kZGF0YS51cGRhdGUgPSAnJ1xufVxuXG5jb25zdCBjb25maXJtID0gKHtlLCBzdGF0ZX0pID0+IHtcblx0aWYgKGUua2V5Q29kZSA9PT0gRU5URVJfS0VZIHx8IGUudHlwZSA9PT0gJ2JsdXInKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0cmV0dXJuIGNvbmZpcm1FZGl0KHN0YXRlKVxuXHR9XG5cdGlmIChlLmtleUNvZGUgPT09IEVTQ0FQRV9LRVkpIHJldHVybiBjYW5jbGVFZGl0KHN0YXRlKVxufVxuXG5jb25zdCBlZGl0ID0gKHtzdGF0ZX0pID0+IHtcblx0c3RhdGUuJGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZWRpdGluZycpXG5cdHN0YXRlLiRkYXRhLnVwZGF0ZSA9IHN0YXRlLiRkYXRhLnRpdGxlXG5cdHN0YXRlLiRtZXRob2RzLmNvbmZpcm0gPSBjb25maXJtXG5cdHN0YXRlLiRub2Rlcy5lZGl0LmZvY3VzKClcbn1cblxuY29uc3QgYWRkID0gKHZhbHVlKSA9PiB7XG5cdHZhbHVlLm9yZGVyID0gb3JkZXIgKz0gMVxuXHR2YWx1ZS5jb21wbGV0ZWQgPSAhIXZhbHVlLmNvbXBsZXRlZFxuXHRjb25zdCB0b2RvID0gX3RvZG8ucmVuZGVyKHtcblx0XHQkZGF0YTogdmFsdWUsXG5cdFx0JG1ldGhvZHM6IHtcblx0XHRcdGVkaXQsXG5cdFx0XHRkZXN0cm95XG5cdFx0fVxuXHR9KVxuXG5cdGFsbC5wdXNoKHRvZG8pXG5cdHN0b3JhZ2UucHVzaCh0b2RvLiRkYXRhKVxuXG5cdGlmICghdmFsdWUuY29tcGxldGVkKSB7XG5cdFx0dG9kb3MucHVzaCh0b2RvKVxuXHRcdGlmIChsb2NhdGlvbi5oYXNoICE9PSAnIy9jb21wbGV0ZWQnKSBtYWluLnRvZG9zLnB1c2godG9kbylcblx0fVxuXG5cdHRvZG8uJHN1YnNjcmliZSgnY29tcGxldGVkJywgdG9nZ2xlQ29tcGxldGUuYmluZCh0b2RvKSlcblxuXHR1cGRhdGVDb3VudCgpXG5cdHVwZGF0ZVN0b3JhZ2UoKVxuXG5cdHRvZG9hcHAuJG5vZGVzLmlucHV0LmZvY3VzKClcbn1cblxuY29uc3QgYWRkVG9kbyA9ICh7ZSwgc3RhdGUsIHZhbHVlfSkgPT4ge1xuXHR2YWx1ZSA9IHZhbHVlLnRyaW0oKVxuXHRpZiAoZS5rZXlDb2RlICE9PSBFTlRFUl9LRVkgfHwgIXZhbHVlKSByZXR1cm5cblx0c3RhdGUuJGRhdGEuaW5wdXQgPSAnJ1xuXHRhZGQoe1xuXHRcdHRpdGxlOiB2YWx1ZSxcblx0XHRjb21wbGV0ZWQ6IGZhbHNlXG5cdH0pXG59XG5cbnRvZG9hcHAuJG1ldGhvZHMuYWRkVG9kbyA9IGFkZFRvZG9cbmZvb3Rlci4kbWV0aG9kcy5jbGVhciA9IGNsZWFyXG5tYWluLiRzdWJzY3JpYmUoJ2FsbENvbXBsZXRlZCcsIHRvZ2dsZUFsbClcblxuY29uc3QgbGFzdFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9kb3MtZWYnKVxuaWYgKGxhc3RTdG9yYWdlKSB7XG5cdGNvbnN0IGxhc3RUb2RvcyA9IEpTT04ucGFyc2UobGFzdFN0b3JhZ2UpXG5cdGZvciAobGV0IGkgb2YgbGFzdFRvZG9zKSBhZGQoaSlcbn1cblxuaWYgKCEoL14jXFwvKGFjdGl2ZXxjb21wbGV0ZWQpPyQvKS50ZXN0KGxvY2F0aW9uLmhhc2gpKSB3aW5kb3cubG9jYXRpb24gPSAnIy8nXG5cbnVwZGF0ZUxpc3QobG9jYXRpb24uaGFzaClcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB1cGRhdGVMaXN0KGxvY2F0aW9uLmhhc2gpKVxuXG5leHBvcnQgZGVmYXVsdCB0b2RvYXBwXG4iLCJpbXBvcnQgdG9kb2FwcCBmcm9tICcuL3RlbXBsYXRlcy90b2RvYXBwLmpzJ1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykucmVwbGFjZUNoaWxkKHRvZG9hcHAuJGVsZW1lbnQsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b2RvYXBwJykpXG4iXSwibmFtZXMiOlsidGhpcyIsImFyZ3VtZW50cyIsImNvbnN0IiwibGV0IiwiRVNDQVBFIiwibmFtZSIsInZhbHVlIiwicmVxdWlyZSQkMCIsImRlZXBBc3NpZ24iLCJpbmZvIiwiaSIsInByb3RvIiwicmVzZXJ2ZWQiLCJqIiwidG9TdHIiLCJpc0FyZ3VtZW50cyIsInJlcXVpcmUkJDEiLCJkZWZpbmVQcm9wZXJ0aWVzIiwic2xpY2UiLCJpbXBsZW1lbnRhdGlvbiIsImtleXMiLCJyZXF1aXJlJCQyIiwiaGFzU3ltYm9scyIsInRvT2JqZWN0IiwicHJvcElzRW51bWVyYWJsZSIsImRlZmluZSIsImdldFBvbHlmaWxsIiwicmVxdWlyZSQkMyIsImFzc2lnbiIsIl9hc3NpZ24iLCJpbmRleCIsImRlc3Ryb3kiLCJBUlIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLElBQUksVUFBVSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Ozs7RUFJN0IsSUFBSSxFQUFFLFdBQVcsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQzVDLFFBQVEsQ0FBQyxlQUFlLElBQUksRUFBRSxXQUFXLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFOztFQUUvRyxDQUFDLFVBQVUsSUFBSSxFQUFFOztJQUVmLFlBQVksQ0FBQzs7SUFFYixJQUFJLEVBQUUsU0FBUyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUEsT0FBTyxFQUFBOztJQUVqQztRQUNJLGFBQWEsR0FBRyxXQUFXO1FBQzNCLFNBQVMsR0FBRyxXQUFXO1FBQ3ZCLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUN0QyxNQUFNLEdBQUcsTUFBTTtRQUNmLE9BQU8sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxJQUFJLFlBQVk7UUFDaEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFB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
