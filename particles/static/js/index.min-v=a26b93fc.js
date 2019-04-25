(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {
                    exports: {}
                };
                e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }
    return r
})()({
    1: [function (require, module, exports) {
        module.exports = require("./lib/axios")
    }, {
        "./lib/axios": 3
    }],
    2: [function (require, module, exports) {
        (function (process) {
            "use strict";
            var utils = require("./../utils");
            var settle = require("./../core/settle");
            var buildURL = require("./../helpers/buildURL");
            var parseHeaders = require("./../helpers/parseHeaders");
            var isURLSameOrigin = require("./../helpers/isURLSameOrigin");
            var createError = require("../core/createError");
            var btoa = typeof window !== "undefined" && window.btoa && window.btoa.bind(window) || require("./../helpers/btoa");
            module.exports = function xhrAdapter(config) {
                return new Promise(function dispatchXhrRequest(resolve, reject) {
                    var requestData = config.data;
                    var requestHeaders = config.headers;
                    if (utils.isFormData(requestData)) {
                        delete requestHeaders["Content-Type"]
                    }
                    var request = new XMLHttpRequest;
                    var loadEvent = "onreadystatechange";
                    var xDomain = false;
                    if (process.env.NODE_ENV !== "test" && typeof window !== "undefined" && window.XDomainRequest && !("withCredentials" in request) && !isURLSameOrigin(config.url)) {
                        request = new window.XDomainRequest;
                        loadEvent = "onload";
                        xDomain = true;
                        request.onprogress = function handleProgress() {};
                        request.ontimeout = function handleTimeout() {}
                    }
                    if (config.auth) {
                        var username = config.auth.username || "";
                        var password = config.auth.password || "";
                        requestHeaders.Authorization = "Basic " + btoa(username + ":" + password)
                    }
                    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);
                    request.timeout = config.timeout;
                    request[loadEvent] = function handleLoad() {
                        if (!request || request.readyState !== 4 && !xDomain) {
                            return
                        }
                        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
                            return
                        }
                        var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders(request.getAllResponseHeaders()) : null;
                        var responseData = !config.responseType || config.responseType === "text" ? request.responseText : request.response;
                        var response = {
                            data: responseData,
                            status: request.status === 1223 ? 204 : request.status,
                            statusText: request.status === 1223 ? "No Content" : request.statusText,
                            headers: responseHeaders,
                            config: config,
                            request: request
                        };
                        settle(resolve, reject, response);
                        request = null
                    };
                    request.onerror = function handleError() {
                        reject(createError("Network Error", config, null, request));
                        request = null
                    };
                    request.ontimeout = function handleTimeout() {
                        reject(createError("timeout of " + config.timeout + "ms exceeded", config, "ECONNABORTED", request));
                        request = null
                    };
                    if (utils.isStandardBrowserEnv()) {
                        var cookies = require("./../helpers/cookies");
                        var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : undefined;
                        if (xsrfValue) {
                            requestHeaders[config.xsrfHeaderName] = xsrfValue
                        }
                    }
                    if ("setRequestHeader" in request) {
                        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
                            if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") {
                                delete requestHeaders[key]
                            } else {
                                request.setRequestHeader(key, val)
                            }
                        })
                    }
                    if (config.withCredentials) {
                        request.withCredentials = true
                    }
                    if (config.responseType) {
                        try {
                            request.responseType = config.responseType
                        } catch (e) {
                            if (config.responseType !== "json") {
                                throw e
                            }
                        }
                    }
                    if (typeof config.onDownloadProgress === "function") {
                        request.addEventListener("progress", config.onDownloadProgress)
                    }
                    if (typeof config.onUploadProgress === "function" && request.upload) {
                        request.upload.addEventListener("progress", config.onUploadProgress)
                    }
                    if (config.cancelToken) {
                        config.cancelToken.promise.then(function onCanceled(cancel) {
                            if (!request) {
                                return
                            }
                            request.abort();
                            reject(cancel);
                            request = null
                        })
                    }
                    if (requestData === undefined) {
                        requestData = null
                    }
                    request.send(requestData)
                })
            }
        }).call(this, require("_process"))
    }, {
        "../core/createError": 9,
        "./../core/settle": 12,
        "./../helpers/btoa": 16,
        "./../helpers/buildURL": 17,
        "./../helpers/cookies": 19,
        "./../helpers/isURLSameOrigin": 21,
        "./../helpers/parseHeaders": 23,
        "./../utils": 25,
        _process: 66
    }],
    3: [function (require, module, exports) {
        "use strict";
        var utils = require("./utils");
        var bind = require("./helpers/bind");
        var Axios = require("./core/Axios");
        var defaults = require("./defaults");

        function createInstance(defaultConfig) {
            var context = new Axios(defaultConfig);
            var instance = bind(Axios.prototype.request, context);
            utils.extend(instance, Axios.prototype, context);
            utils.extend(instance, context);
            return instance
        }
        var axios = createInstance(defaults);
        axios.Axios = Axios;
        axios.create = function create(instanceConfig) {
            return createInstance(utils.merge(defaults, instanceConfig))
        };
        axios.Cancel = require("./cancel/Cancel");
        axios.CancelToken = require("./cancel/CancelToken");
        axios.isCancel = require("./cancel/isCancel");
        axios.all = function all(promises) {
            return Promise.all(promises)
        };
        axios.spread = require("./helpers/spread");
        module.exports = axios;
        module.exports.default = axios
    }, {
        "./cancel/Cancel": 4,
        "./cancel/CancelToken": 5,
        "./cancel/isCancel": 6,
        "./core/Axios": 7,
        "./defaults": 14,
        "./helpers/bind": 15,
        "./helpers/spread": 24,
        "./utils": 25
    }],
    4: [function (require, module, exports) {
        "use strict";

        function Cancel(message) {
            this.message = message
        }
        Cancel.prototype.toString = function toString() {
            return "Cancel" + (this.message ? ": " + this.message : "")
        };
        Cancel.prototype.__CANCEL__ = true;
        module.exports = Cancel
    }, {}],
    5: [function (require, module, exports) {
        "use strict";
        var Cancel = require("./Cancel");

        function CancelToken(executor) {
            if (typeof executor !== "function") {
                throw new TypeError("executor must be a function.")
            }
            var resolvePromise;
            this.promise = new Promise(function promiseExecutor(resolve) {
                resolvePromise = resolve
            });
            var token = this;
            executor(function cancel(message) {
                if (token.reason) {
                    return
                }
                token.reason = new Cancel(message);
                resolvePromise(token.reason)
            })
        }
        CancelToken.prototype.throwIfRequested = function throwIfRequested() {
            if (this.reason) {
                throw this.reason
            }
        };
        CancelToken.source = function source() {
            var cancel;
            var token = new CancelToken(function executor(c) {
                cancel = c
            });
            return {
                token: token,
                cancel: cancel
            }
        };
        module.exports = CancelToken
    }, {
        "./Cancel": 4
    }],
    6: [function (require, module, exports) {
        "use strict";
        module.exports = function isCancel(value) {
            return !!(value && value.__CANCEL__)
        }
    }, {}],
    7: [function (require, module, exports) {
        "use strict";
        var defaults = require("./../defaults");
        var utils = require("./../utils");
        var InterceptorManager = require("./InterceptorManager");
        var dispatchRequest = require("./dispatchRequest");

        function Axios(instanceConfig) {
            this.defaults = instanceConfig;
            this.interceptors = {
                request: new InterceptorManager,
                response: new InterceptorManager
            }
        }
        Axios.prototype.request = function request(config) {
            if (typeof config === "string") {
                config = utils.merge({
                    url: arguments[0]
                }, arguments[1])
            }
            config = utils.merge(defaults, {
                method: "get"
            }, this.defaults, config);
            config.method = config.method.toLowerCase();
            var chain = [dispatchRequest, undefined];
            var promise = Promise.resolve(config);
            this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
                chain.unshift(interceptor.fulfilled, interceptor.rejected)
            });
            this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
                chain.push(interceptor.fulfilled, interceptor.rejected)
            });
            while (chain.length) {
                promise = promise.then(chain.shift(), chain.shift())
            }
            return promise
        };
        utils.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
            Axios.prototype[method] = function (url, config) {
                return this.request(utils.merge(config || {}, {
                    method: method,
                    url: url
                }))
            }
        });
        utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
            Axios.prototype[method] = function (url, data, config) {
                return this.request(utils.merge(config || {}, {
                    method: method,
                    url: url,
                    data: data
                }))
            }
        });
        module.exports = Axios
    }, {
        "./../defaults": 14,
        "./../utils": 25,
        "./InterceptorManager": 8,
        "./dispatchRequest": 10
    }],
    8: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");

        function InterceptorManager() {
            this.handlers = []
        }
        InterceptorManager.prototype.use = function use(fulfilled, rejected) {
            this.handlers.push({
                fulfilled: fulfilled,
                rejected: rejected
            });
            return this.handlers.length - 1
        };
        InterceptorManager.prototype.eject = function eject(id) {
            if (this.handlers[id]) {
                this.handlers[id] = null
            }
        };
        InterceptorManager.prototype.forEach = function forEach(fn) {
            utils.forEach(this.handlers, function forEachHandler(h) {
                if (h !== null) {
                    fn(h)
                }
            })
        };
        module.exports = InterceptorManager
    }, {
        "./../utils": 25
    }],
    9: [function (require, module, exports) {
        "use strict";
        var enhanceError = require("./enhanceError");
        module.exports = function createError(message, config, code, request, response) {
            var error = new Error(message);
            return enhanceError(error, config, code, request, response)
        }
    }, {
        "./enhanceError": 11
    }],
    10: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");
        var transformData = require("./transformData");
        var isCancel = require("../cancel/isCancel");
        var defaults = require("../defaults");
        var isAbsoluteURL = require("./../helpers/isAbsoluteURL");
        var combineURLs = require("./../helpers/combineURLs");

        function throwIfCancellationRequested(config) {
            if (config.cancelToken) {
                config.cancelToken.throwIfRequested()
            }
        }
        module.exports = function dispatchRequest(config) {
            throwIfCancellationRequested(config);
            if (config.baseURL && !isAbsoluteURL(config.url)) {
                config.url = combineURLs(config.baseURL, config.url)
            }
            config.headers = config.headers || {};
            config.data = transformData(config.data, config.headers, config.transformRequest);
            config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers || {});
            utils.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function cleanHeaderConfig(method) {
                delete config.headers[method]
            });
            var adapter = config.adapter || defaults.adapter;
            return adapter(config).then(function onAdapterResolution(response) {
                throwIfCancellationRequested(config);
                response.data = transformData(response.data, response.headers, config.transformResponse);
                return response
            }, function onAdapterRejection(reason) {
                if (!isCancel(reason)) {
                    throwIfCancellationRequested(config);
                    if (reason && reason.response) {
                        reason.response.data = transformData(reason.response.data, reason.response.headers, config.transformResponse)
                    }
                }
                return Promise.reject(reason)
            })
        }
    }, {
        "../cancel/isCancel": 6,
        "../defaults": 14,
        "./../helpers/combineURLs": 18,
        "./../helpers/isAbsoluteURL": 20,
        "./../utils": 25,
        "./transformData": 13
    }],
    11: [function (require, module, exports) {
        "use strict";
        module.exports = function enhanceError(error, config, code, request, response) {
            error.config = config;
            if (code) {
                error.code = code
            }
            error.request = request;
            error.response = response;
            return error
        }
    }, {}],
    12: [function (require, module, exports) {
        "use strict";
        var createError = require("./createError");
        module.exports = function settle(resolve, reject, response) {
            var validateStatus = response.config.validateStatus;
            if (!response.status || !validateStatus || validateStatus(response.status)) {
                resolve(response)
            } else {
                reject(createError("Request failed with status code " + response.status, response.config, null, response.request, response))
            }
        }
    }, {
        "./createError": 9
    }],
    13: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");
        module.exports = function transformData(data, headers, fns) {
            utils.forEach(fns, function transform(fn) {
                data = fn(data, headers)
            });
            return data
        }
    }, {
        "./../utils": 25
    }],
    14: [function (require, module, exports) {
        (function (process) {
            "use strict";
            var utils = require("./utils");
            var normalizeHeaderName = require("./helpers/normalizeHeaderName");
            var DEFAULT_CONTENT_TYPE = {
                "Content-Type": "application/x-www-form-urlencoded"
            };

            function setContentTypeIfUnset(headers, value) {
                if (!utils.isUndefined(headers) && utils.isUndefined(headers["Content-Type"])) {
                    headers["Content-Type"] = value
                }
            }

            function getDefaultAdapter() {
                var adapter;
                if (typeof XMLHttpRequest !== "undefined") {
                    adapter = require("./adapters/xhr")
                } else if (typeof process !== "undefined") {
                    adapter = require("./adapters/http")
                }
                return adapter
            }
            var defaults = {
                adapter: getDefaultAdapter(),
                transformRequest: [function transformRequest(data, headers) {
                    normalizeHeaderName(headers, "Content-Type");
                    if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
                        return data
                    }
                    if (utils.isArrayBufferView(data)) {
                        return data.buffer
                    }
                    if (utils.isURLSearchParams(data)) {
                        setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
                        return data.toString()
                    }
                    if (utils.isObject(data)) {
                        setContentTypeIfUnset(headers, "application/json;charset=utf-8");
                        return JSON.stringify(data)
                    }
                    return data
                }],
                transformResponse: [function transformResponse(data) {
                    if (typeof data === "string") {
                        try {
                            data = JSON.parse(data)
                        } catch (e) {}
                    }
                    return data
                }],
                timeout: 0,
                xsrfCookieName: "XSRF-TOKEN",
                xsrfHeaderName: "X-XSRF-TOKEN",
                maxContentLength: -1,
                validateStatus: function validateStatus(status) {
                    return status >= 200 && status < 300
                }
            };
            defaults.headers = {
                common: {
                    Accept: "application/json, text/plain, */*"
                }
            };
            utils.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
                defaults.headers[method] = {}
            });
            utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
                defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE)
            });
            module.exports = defaults
        }).call(this, require("_process"))
    }, {
        "./adapters/http": 2,
        "./adapters/xhr": 2,
        "./helpers/normalizeHeaderName": 22,
        "./utils": 25,
        _process: 66
    }],
    15: [function (require, module, exports) {
        "use strict";
        module.exports = function bind(fn, thisArg) {
            return function wrap() {
                var args = new Array(arguments.length);
                for (var i = 0; i < args.length; i++) {
                    args[i] = arguments[i]
                }
                return fn.apply(thisArg, args)
            }
        }
    }, {}],
    16: [function (require, module, exports) {
        "use strict";
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        function E() {
            this.message = "String contains an invalid character"
        }
        E.prototype = new Error;
        E.prototype.code = 5;
        E.prototype.name = "InvalidCharacterError";

        function btoa(input) {
            var str = String(input);
            var output = "";
            for (var block, charCode, idx = 0, map = chars; str.charAt(idx | 0) || (map = "=", idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
                charCode = str.charCodeAt(idx += 3 / 4);
                if (charCode > 255) {
                    throw new E
                }
                block = block << 8 | charCode
            }
            return output
        }
        module.exports = btoa
    }, {}],
    17: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");

        function encode(val) {
            return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]")
        }
        module.exports = function buildURL(url, params, paramsSerializer) {
            if (!params) {
                return url
            }
            var serializedParams;
            if (paramsSerializer) {
                serializedParams = paramsSerializer(params)
            } else if (utils.isURLSearchParams(params)) {
                serializedParams = params.toString()
            } else {
                var parts = [];
                utils.forEach(params, function serialize(val, key) {
                    if (val === null || typeof val === "undefined") {
                        return
                    }
                    if (utils.isArray(val)) {
                        key = key + "[]"
                    } else {
                        val = [val]
                    }
                    utils.forEach(val, function parseValue(v) {
                        if (utils.isDate(v)) {
                            v = v.toISOString()
                        } else if (utils.isObject(v)) {
                            v = JSON.stringify(v)
                        }
                        parts.push(encode(key) + "=" + encode(v))
                    })
                });
                serializedParams = parts.join("&")
            }
            if (serializedParams) {
                url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams
            }
            return url
        }
    }, {
        "./../utils": 25
    }],
    18: [function (require, module, exports) {
        "use strict";
        module.exports = function combineURLs(baseURL, relativeURL) {
            return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL
        }
    }, {}],
    19: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");
        module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
            return {
                write: function write(name, value, expires, path, domain, secure) {
                    var cookie = [];
                    cookie.push(name + "=" + encodeURIComponent(value));
                    if (utils.isNumber(expires)) {
                        cookie.push("expires=" + new Date(expires).toGMTString())
                    }
                    if (utils.isString(path)) {
                        cookie.push("path=" + path)
                    }
                    if (utils.isString(domain)) {
                        cookie.push("domain=" + domain)
                    }
                    if (secure === true) {
                        cookie.push("secure")
                    }
                    document.cookie = cookie.join("; ")
                },
                read: function read(name) {
                    var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
                    return match ? decodeURIComponent(match[3]) : null
                },
                remove: function remove(name) {
                    this.write(name, "", Date.now() - 864e5)
                }
            }
        }() : function nonStandardBrowserEnv() {
            return {
                write: function write() {},
                read: function read() {
                    return null
                },
                remove: function remove() {}
            }
        }()
    }, {
        "./../utils": 25
    }],
    20: [function (require, module, exports) {
        "use strict";
        module.exports = function isAbsoluteURL(url) {
            return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
        }
    }, {}],
    21: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");
        module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
            var msie = /(msie|trident)/i.test(navigator.userAgent);
            var urlParsingNode = document.createElement("a");
            var originURL;

            function resolveURL(url) {
                var href = url;
                if (msie) {
                    urlParsingNode.setAttribute("href", href);
                    href = urlParsingNode.href
                }
                urlParsingNode.setAttribute("href", href);
                return {
                    href: urlParsingNode.href,
                    protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
                    host: urlParsingNode.host,
                    search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
                    hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
                    hostname: urlParsingNode.hostname,
                    port: urlParsingNode.port,
                    pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
                }
            }
            originURL = resolveURL(window.location.href);
            return function isURLSameOrigin(requestURL) {
                var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
                return parsed.protocol === originURL.protocol && parsed.host === originURL.host
            }
        }() : function nonStandardBrowserEnv() {
            return function isURLSameOrigin() {
                return true
            }
        }()
    }, {
        "./../utils": 25
    }],
    22: [function (require, module, exports) {
        "use strict";
        var utils = require("../utils");
        module.exports = function normalizeHeaderName(headers, normalizedName) {
            utils.forEach(headers, function processHeader(value, name) {
                if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
                    headers[normalizedName] = value;
                    delete headers[name]
                }
            })
        }
    }, {
        "../utils": 25
    }],
    23: [function (require, module, exports) {
        "use strict";
        var utils = require("./../utils");
        var ignoreDuplicateOf = ["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"];
        module.exports = function parseHeaders(headers) {
            var parsed = {};
            var key;
            var val;
            var i;
            if (!headers) {
                return parsed
            }
            utils.forEach(headers.split("\n"), function parser(line) {
                i = line.indexOf(":");
                key = utils.trim(line.substr(0, i)).toLowerCase();
                val = utils.trim(line.substr(i + 1));
                if (key) {
                    if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
                        return
                    }
                    if (key === "set-cookie") {
                        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val])
                    } else {
                        parsed[key] = parsed[key] ? parsed[key] + ", " + val : val
                    }
                }
            });
            return parsed
        }
    }, {
        "./../utils": 25
    }],
    24: [function (require, module, exports) {
        "use strict";
        module.exports = function spread(callback) {
            return function wrap(arr) {
                return callback.apply(null, arr)
            }
        }
    }, {}],
    25: [function (require, module, exports) {
        "use strict";
        var bind = require("./helpers/bind");
        var isBuffer = require("is-buffer");
        var toString = Object.prototype.toString;

        function isArray(val) {
            return toString.call(val) === "[object Array]"
        }

        function isArrayBuffer(val) {
            return toString.call(val) === "[object ArrayBuffer]"
        }

        function isFormData(val) {
            return typeof FormData !== "undefined" && val instanceof FormData
        }

        function isArrayBufferView(val) {
            var result;
            if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
                result = ArrayBuffer.isView(val)
            } else {
                result = val && val.buffer && val.buffer instanceof ArrayBuffer
            }
            return result
        }

        function isString(val) {
            return typeof val === "string"
        }

        function isNumber(val) {
            return typeof val === "number"
        }

        function isUndefined(val) {
            return typeof val === "undefined"
        }

        function isObject(val) {
            return val !== null && typeof val === "object"
        }

        function isDate(val) {
            return toString.call(val) === "[object Date]"
        }

        function isFile(val) {
            return toString.call(val) === "[object File]"
        }

        function isBlob(val) {
            return toString.call(val) === "[object Blob]"
        }

        function isFunction(val) {
            return toString.call(val) === "[object Function]"
        }

        function isStream(val) {
            return isObject(val) && isFunction(val.pipe)
        }

        function isURLSearchParams(val) {
            return typeof URLSearchParams !== "undefined" && val instanceof URLSearchParams
        }

        function trim(str) {
            return str.replace(/^\s*/, "").replace(/\s*$/, "")
        }

        function isStandardBrowserEnv() {
            if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
                return false
            }
            return typeof window !== "undefined" && typeof document !== "undefined"
        }

        function forEach(obj, fn) {
            if (obj === null || typeof obj === "undefined") {
                return
            }
            if (typeof obj !== "object") {
                obj = [obj]
            }
            if (isArray(obj)) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    fn.call(null, obj[i], i, obj)
                }
            } else {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        fn.call(null, obj[key], key, obj)
                    }
                }
            }
        }

        function merge() {
            var result = {};

            function assignValue(val, key) {
                if (typeof result[key] === "object" && typeof val === "object") {
                    result[key] = merge(result[key], val)
                } else {
                    result[key] = val
                }
            }
            for (var i = 0, l = arguments.length; i < l; i++) {
                forEach(arguments[i], assignValue)
            }
            return result
        }

        function extend(a, b, thisArg) {
            forEach(b, function assignValue(val, key) {
                if (thisArg && typeof val === "function") {
                    a[key] = bind(val, thisArg)
                } else {
                    a[key] = val
                }
            });
            return a
        }
        module.exports = {
            isArray: isArray,
            isArrayBuffer: isArrayBuffer,
            isBuffer: isBuffer,
            isFormData: isFormData,
            isArrayBufferView: isArrayBufferView,
            isString: isString,
            isNumber: isNumber,
            isObject: isObject,
            isUndefined: isUndefined,
            isDate: isDate,
            isFile: isFile,
            isBlob: isBlob,
            isFunction: isFunction,
            isStream: isStream,
            isURLSearchParams: isURLSearchParams,
            isStandardBrowserEnv: isStandardBrowserEnv,
            forEach: forEach,
            merge: merge,
            extend: extend,
            trim: trim
        }
    }, {
        "./helpers/bind": 15,
        "is-buffer": 27
    }],
    26: [function (require, module, exports) {
        (function (window, document, exportName, undefined) {
            "use strict";
            var VENDOR_PREFIXES = ["", "webkit", "Moz", "MS", "ms", "o"];
            var TEST_ELEMENT = document.createElement("div");
            var TYPE_FUNCTION = "function";
            var round = Math.round;
            var abs = Math.abs;
            var now = Date.now;

            function setTimeoutContext(fn, timeout, context) {
                return setTimeout(bindFn(fn, context), timeout)
            }

            function invokeArrayArg(arg, fn, context) {
                if (Array.isArray(arg)) {
                    each(arg, context[fn], context);
                    return true
                }
                return false
            }

            function each(obj, iterator, context) {
                var i;
                if (!obj) {
                    return
                }
                if (obj.forEach) {
                    obj.forEach(iterator, context)
                } else if (obj.length !== undefined) {
                    i = 0;
                    while (i < obj.length) {
                        iterator.call(context, obj[i], i, obj);
                        i++
                    }
                } else {
                    for (i in obj) {
                        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj)
                    }
                }
            }

            function deprecate(method, name, message) {
                var deprecationMessage = "DEPRECATED METHOD: " + name + "\n" + message + " AT \n";
                return function () {
                    var e = new Error("get-stack-trace");
                    var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@") : "Unknown Stack Trace";
                    var log = window.console && (window.console.warn || window.console.log);
                    if (log) {
                        log.call(window.console, deprecationMessage, stack)
                    }
                    return method.apply(this, arguments)
                }
            }
            var assign;
            if (typeof Object.assign !== "function") {
                assign = function assign(target) {
                    if (target === undefined || target === null) {
                        throw new TypeError("Cannot convert undefined or null to object")
                    }
                    var output = Object(target);
                    for (var index = 1; index < arguments.length; index++) {
                        var source = arguments[index];
                        if (source !== undefined && source !== null) {
                            for (var nextKey in source) {
                                if (source.hasOwnProperty(nextKey)) {
                                    output[nextKey] = source[nextKey]
                                }
                            }
                        }
                    }
                    return output
                }
            } else {
                assign = Object.assign
            }
            var extend = deprecate(function extend(dest, src, merge) {
                var keys = Object.keys(src);
                var i = 0;
                while (i < keys.length) {
                    if (!merge || merge && dest[keys[i]] === undefined) {
                        dest[keys[i]] = src[keys[i]]
                    }
                    i++
                }
                return dest
            }, "extend", "Use `assign`.");
            var merge = deprecate(function merge(dest, src) {
                return extend(dest, src, true)
            }, "merge", "Use `assign`.");

            function inherit(child, base, properties) {
                var baseP = base.prototype,
                    childP;
                childP = child.prototype = Object.create(baseP);
                childP.constructor = child;
                childP._super = baseP;
                if (properties) {
                    assign(childP, properties)
                }
            }

            function bindFn(fn, context) {
                return function boundFn() {
                    return fn.apply(context, arguments)
                }
            }

            function boolOrFn(val, args) {
                if (typeof val == TYPE_FUNCTION) {
                    return val.apply(args ? args[0] || undefined : undefined, args)
                }
                return val
            }

            function ifUndefined(val1, val2) {
                return val1 === undefined ? val2 : val1
            }

            function addEventListeners(target, types, handler) {
                each(splitStr(types), function (type) {
                    target.addEventListener(type, handler, false)
                })
            }

            function removeEventListeners(target, types, handler) {
                each(splitStr(types), function (type) {
                    target.removeEventListener(type, handler, false)
                })
            }

            function hasParent(node, parent) {
                while (node) {
                    if (node == parent) {
                        return true
                    }
                    node = node.parentNode
                }
                return false
            }

            function inStr(str, find) {
                return str.indexOf(find) > -1
            }

            function splitStr(str) {
                return str.trim().split(/\s+/g)
            }

            function inArray(src, find, findByKey) {
                if (src.indexOf && !findByKey) {
                    return src.indexOf(find)
                } else {
                    var i = 0;
                    while (i < src.length) {
                        if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) {
                            return i
                        }
                        i++
                    }
                    return -1
                }
            }

            function toArray(obj) {
                return Array.prototype.slice.call(obj, 0)
            }

            function uniqueArray(src, key, sort) {
                var results = [];
                var values = [];
                var i = 0;
                while (i < src.length) {
                    var val = key ? src[i][key] : src[i];
                    if (inArray(values, val) < 0) {
                        results.push(src[i])
                    }
                    values[i] = val;
                    i++
                }
                if (sort) {
                    if (!key) {
                        results = results.sort()
                    } else {
                        results = results.sort(function sortUniqueArray(a, b) {
                            return a[key] > b[key]
                        })
                    }
                }
                return results
            }

            function prefixed(obj, property) {
                var prefix, prop;
                var camelProp = property[0].toUpperCase() + property.slice(1);
                var i = 0;
                while (i < VENDOR_PREFIXES.length) {
                    prefix = VENDOR_PREFIXES[i];
                    prop = prefix ? prefix + camelProp : property;
                    if (prop in obj) {
                        return prop
                    }
                    i++
                }
                return undefined
            }
            var _uniqueId = 1;

            function uniqueId() {
                return _uniqueId++
            }

            function getWindowForElement(element) {
                var doc = element.ownerDocument || element;
                return doc.defaultView || doc.parentWindow || window
            }
            var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
            var SUPPORT_TOUCH = "ontouchstart" in window;
            var SUPPORT_POINTER_EVENTS = prefixed(window, "PointerEvent") !== undefined;
            var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
            var INPUT_TYPE_TOUCH = "touch";
            var INPUT_TYPE_PEN = "pen";
            var INPUT_TYPE_MOUSE = "mouse";
            var INPUT_TYPE_KINECT = "kinect";
            var COMPUTE_INTERVAL = 25;
            var INPUT_START = 1;
            var INPUT_MOVE = 2;
            var INPUT_END = 4;
            var INPUT_CANCEL = 8;
            var DIRECTION_NONE = 1;
            var DIRECTION_LEFT = 2;
            var DIRECTION_RIGHT = 4;
            var DIRECTION_UP = 8;
            var DIRECTION_DOWN = 16;
            var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
            var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
            var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
            var PROPS_XY = ["x", "y"];
            var PROPS_CLIENT_XY = ["clientX", "clientY"];

            function Input(manager, callback) {
                var self = this;
                this.manager = manager;
                this.callback = callback;
                this.element = manager.element;
                this.target = manager.options.inputTarget;
                this.domHandler = function (ev) {
                    if (boolOrFn(manager.options.enable, [manager])) {
                        self.handler(ev)
                    }
                };
                this.init()
            }
            Input.prototype = {
                handler: function () {},
                init: function () {
                    this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
                    this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
                    this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler)
                },
                destroy: function () {
                    this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
                    this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
                    this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler)
                }
            };

            function createInputInstance(manager) {
                var Type;
                var inputClass = manager.options.inputClass;
                if (inputClass) {
                    Type = inputClass
                } else if (SUPPORT_POINTER_EVENTS) {
                    Type = PointerEventInput
                } else if (SUPPORT_ONLY_TOUCH) {
                    Type = TouchInput
                } else if (!SUPPORT_TOUCH) {
                    Type = MouseInput
                } else {
                    Type = TouchMouseInput
                }
                return new Type(manager, inputHandler)
            }

            function inputHandler(manager, eventType, input) {
                var pointersLen = input.pointers.length;
                var changedPointersLen = input.changedPointers.length;
                var isFirst = eventType & INPUT_START && pointersLen - changedPointersLen === 0;
                var isFinal = eventType & (INPUT_END | INPUT_CANCEL) && pointersLen - changedPointersLen === 0;
                input.isFirst = !!isFirst;
                input.isFinal = !!isFinal;
                if (isFirst) {
                    manager.session = {}
                }
                input.eventType = eventType;
                computeInputData(manager, input);
                manager.emit("hammer.input", input);
                manager.recognize(input);
                manager.session.prevInput = input
            }

            function computeInputData(manager, input) {
                var session = manager.session;
                var pointers = input.pointers;
                var pointersLength = pointers.length;
                if (!session.firstInput) {
                    session.firstInput = simpleCloneInputData(input)
                }
                if (pointersLength > 1 && !session.firstMultiple) {
                    session.firstMultiple = simpleCloneInputData(input)
                } else if (pointersLength === 1) {
                    session.firstMultiple = false
                }
                var firstInput = session.firstInput;
                var firstMultiple = session.firstMultiple;
                var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
                var center = input.center = getCenter(pointers);
                input.timeStamp = now();
                input.deltaTime = input.timeStamp - firstInput.timeStamp;
                input.angle = getAngle(offsetCenter, center);
                input.distance = getDistance(offsetCenter, center);
                computeDeltaXY(session, input);
                input.offsetDirection = getDirection(input.deltaX, input.deltaY);
                var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
                input.overallVelocityX = overallVelocity.x;
                input.overallVelocityY = overallVelocity.y;
                input.overallVelocity = abs(overallVelocity.x) > abs(overallVelocity.y) ? overallVelocity.x : overallVelocity.y;
                input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
                input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
                input.maxPointers = !session.prevInput ? input.pointers.length : input.pointers.length > session.prevInput.maxPointers ? input.pointers.length : session.prevInput.maxPointers;
                computeIntervalInputData(session, input);
                var target = manager.element;
                if (hasParent(input.srcEvent.target, target)) {
                    target = input.srcEvent.target
                }
                input.target = target
            }

            function computeDeltaXY(session, input) {
                var center = input.center;
                var offset = session.offsetDelta || {};
                var prevDelta = session.prevDelta || {};
                var prevInput = session.prevInput || {};
                if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
                    prevDelta = session.prevDelta = {
                        x: prevInput.deltaX || 0,
                        y: prevInput.deltaY || 0
                    };
                    offset = session.offsetDelta = {
                        x: center.x,
                        y: center.y
                    }
                }
                input.deltaX = prevDelta.x + (center.x - offset.x);
                input.deltaY = prevDelta.y + (center.y - offset.y)
            }

            function computeIntervalInputData(session, input) {
                var last = session.lastInterval || input,
                    deltaTime = input.timeStamp - last.timeStamp,
                    velocity, velocityX, velocityY, direction;
                if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
                    var deltaX = input.deltaX - last.deltaX;
                    var deltaY = input.deltaY - last.deltaY;
                    var v = getVelocity(deltaTime, deltaX, deltaY);
                    velocityX = v.x;
                    velocityY = v.y;
                    velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
                    direction = getDirection(deltaX, deltaY);
                    session.lastInterval = input
                } else {
                    velocity = last.velocity;
                    velocityX = last.velocityX;
                    velocityY = last.velocityY;
                    direction = last.direction
                }
                input.velocity = velocity;
                input.velocityX = velocityX;
                input.velocityY = velocityY;
                input.direction = direction
            }

            function simpleCloneInputData(input) {
                var pointers = [];
                var i = 0;
                while (i < input.pointers.length) {
                    pointers[i] = {
                        clientX: round(input.pointers[i].clientX),
                        clientY: round(input.pointers[i].clientY)
                    };
                    i++
                }
                return {
                    timeStamp: now(),
                    pointers: pointers,
                    center: getCenter(pointers),
                    deltaX: input.deltaX,
                    deltaY: input.deltaY
                }
            }

            function getCenter(pointers) {
                var pointersLength = pointers.length;
                if (pointersLength === 1) {
                    return {
                        x: round(pointers[0].clientX),
                        y: round(pointers[0].clientY)
                    }
                }
                var x = 0,
                    y = 0,
                    i = 0;
                while (i < pointersLength) {
                    x += pointers[i].clientX;
                    y += pointers[i].clientY;
                    i++
                }
                return {
                    x: round(x / pointersLength),
                    y: round(y / pointersLength)
                }
            }

            function getVelocity(deltaTime, x, y) {
                return {
                    x: x / deltaTime || 0,
                    y: y / deltaTime || 0
                }
            }

            function getDirection(x, y) {
                if (x === y) {
                    return DIRECTION_NONE
                }
                if (abs(x) >= abs(y)) {
                    return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT
                }
                return y < 0 ? DIRECTION_UP : DIRECTION_DOWN
            }

            function getDistance(p1, p2, props) {
                if (!props) {
                    props = PROPS_XY
                }
                var x = p2[props[0]] - p1[props[0]],
                    y = p2[props[1]] - p1[props[1]];
                return Math.sqrt(x * x + y * y)
            }

            function getAngle(p1, p2, props) {
                if (!props) {
                    props = PROPS_XY
                }
                var x = p2[props[0]] - p1[props[0]],
                    y = p2[props[1]] - p1[props[1]];
                return Math.atan2(y, x) * 180 / Math.PI
            }

            function getRotation(start, end) {
                return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY)
            }

            function getScale(start, end) {
                return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY)
            }
            var MOUSE_INPUT_MAP = {
                mousedown: INPUT_START,
                mousemove: INPUT_MOVE,
                mouseup: INPUT_END
            };
            var MOUSE_ELEMENT_EVENTS = "mousedown";
            var MOUSE_WINDOW_EVENTS = "mousemove mouseup";

            function MouseInput() {
                this.evEl = MOUSE_ELEMENT_EVENTS;
                this.evWin = MOUSE_WINDOW_EVENTS;
                this.pressed = false;
                Input.apply(this, arguments)
            }
            inherit(MouseInput, Input, {
                handler: function MEhandler(ev) {
                    var eventType = MOUSE_INPUT_MAP[ev.type];
                    if (eventType & INPUT_START && ev.button === 0) {
                        this.pressed = true
                    }
                    if (eventType & INPUT_MOVE && ev.which !== 1) {
                        eventType = INPUT_END
                    }
                    if (!this.pressed) {
                        return
                    }
                    if (eventType & INPUT_END) {
                        this.pressed = false
                    }
                    this.callback(this.manager, eventType, {
                        pointers: [ev],
                        changedPointers: [ev],
                        pointerType: INPUT_TYPE_MOUSE,
                        srcEvent: ev
                    })
                }
            });
            var POINTER_INPUT_MAP = {
                pointerdown: INPUT_START,
                pointermove: INPUT_MOVE,
                pointerup: INPUT_END,
                pointercancel: INPUT_CANCEL,
                pointerout: INPUT_CANCEL
            };
            var IE10_POINTER_TYPE_ENUM = {
                2: INPUT_TYPE_TOUCH,
                3: INPUT_TYPE_PEN,
                4: INPUT_TYPE_MOUSE,
                5: INPUT_TYPE_KINECT
            };
            var POINTER_ELEMENT_EVENTS = "pointerdown";
            var POINTER_WINDOW_EVENTS = "pointermove pointerup pointercancel";
            if (window.MSPointerEvent && !window.PointerEvent) {
                POINTER_ELEMENT_EVENTS = "MSPointerDown";
                POINTER_WINDOW_EVENTS = "MSPointerMove MSPointerUp MSPointerCancel"
            }

            function PointerEventInput() {
                this.evEl = POINTER_ELEMENT_EVENTS;
                this.evWin = POINTER_WINDOW_EVENTS;
                Input.apply(this, arguments);
                this.store = this.manager.session.pointerEvents = []
            }
            inherit(PointerEventInput, Input, {
                handler: function PEhandler(ev) {
                    var store = this.store;
                    var removePointer = false;
                    var eventTypeNormalized = ev.type.toLowerCase().replace("ms", "");
                    var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
                    var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
                    var isTouch = pointerType == INPUT_TYPE_TOUCH;
                    var storeIndex = inArray(store, ev.pointerId, "pointerId");
                    if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
                        if (storeIndex < 0) {
                            store.push(ev);
                            storeIndex = store.length - 1
                        }
                    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
                        removePointer = true
                    }
                    if (storeIndex < 0) {
                        return
                    }
                    store[storeIndex] = ev;
                    this.callback(this.manager, eventType, {
                        pointers: store,
                        changedPointers: [ev],
                        pointerType: pointerType,
                        srcEvent: ev
                    });
                    if (removePointer) {
                        store.splice(storeIndex, 1)
                    }
                }
            });
            var SINGLE_TOUCH_INPUT_MAP = {
                touchstart: INPUT_START,
                touchmove: INPUT_MOVE,
                touchend: INPUT_END,
                touchcancel: INPUT_CANCEL
            };
            var SINGLE_TOUCH_TARGET_EVENTS = "touchstart";
            var SINGLE_TOUCH_WINDOW_EVENTS = "touchstart touchmove touchend touchcancel";

            function SingleTouchInput() {
                this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
                this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
                this.started = false;
                Input.apply(this, arguments)
            }
            inherit(SingleTouchInput, Input, {
                handler: function TEhandler(ev) {
                    var type = SINGLE_TOUCH_INPUT_MAP[ev.type];
                    if (type === INPUT_START) {
                        this.started = true
                    }
                    if (!this.started) {
                        return
                    }
                    var touches = normalizeSingleTouches.call(this, ev, type);
                    if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
                        this.started = false
                    }
                    this.callback(this.manager, type, {
                        pointers: touches[0],
                        changedPointers: touches[1],
                        pointerType: INPUT_TYPE_TOUCH,
                        srcEvent: ev
                    })
                }
            });

            function normalizeSingleTouches(ev, type) {
                var all = toArray(ev.touches);
                var changed = toArray(ev.changedTouches);
                if (type & (INPUT_END | INPUT_CANCEL)) {
                    all = uniqueArray(all.concat(changed), "identifier", true)
                }
                return [all, changed]
            }
            var TOUCH_INPUT_MAP = {
                touchstart: INPUT_START,
                touchmove: INPUT_MOVE,
                touchend: INPUT_END,
                touchcancel: INPUT_CANCEL
            };
            var TOUCH_TARGET_EVENTS = "touchstart touchmove touchend touchcancel";

            function TouchInput() {
                this.evTarget = TOUCH_TARGET_EVENTS;
                this.targetIds = {};
                Input.apply(this, arguments)
            }
            inherit(TouchInput, Input, {
                handler: function MTEhandler(ev) {
                    var type = TOUCH_INPUT_MAP[ev.type];
                    var touches = getTouches.call(this, ev, type);
                    if (!touches) {
                        return
                    }
                    this.callback(this.manager, type, {
                        pointers: touches[0],
                        changedPointers: touches[1],
                        pointerType: INPUT_TYPE_TOUCH,
                        srcEvent: ev
                    })
                }
            });

            function getTouches(ev, type) {
                var allTouches = toArray(ev.touches);
                var targetIds = this.targetIds;
                if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
                    targetIds[allTouches[0].identifier] = true;
                    return [allTouches, allTouches]
                }
                var i, targetTouches, changedTouches = toArray(ev.changedTouches),
                    changedTargetTouches = [],
                    target = this.target;
                targetTouches = allTouches.filter(function (touch) {
                    return hasParent(touch.target, target)
                });
                if (type === INPUT_START) {
                    i = 0;
                    while (i < targetTouches.length) {
                        targetIds[targetTouches[i].identifier] = true;
                        i++
                    }
                }
                i = 0;
                while (i < changedTouches.length) {
                    if (targetIds[changedTouches[i].identifier]) {
                        changedTargetTouches.push(changedTouches[i])
                    }
                    if (type & (INPUT_END | INPUT_CANCEL)) {
                        delete targetIds[changedTouches[i].identifier]
                    }
                    i++
                }
                if (!changedTargetTouches.length) {
                    return
                }
                return [uniqueArray(targetTouches.concat(changedTargetTouches), "identifier", true), changedTargetTouches]
            }
            var DEDUP_TIMEOUT = 2500;
            var DEDUP_DISTANCE = 25;

            function TouchMouseInput() {
                Input.apply(this, arguments);
                var handler = bindFn(this.handler, this);
                this.touch = new TouchInput(this.manager, handler);
                this.mouse = new MouseInput(this.manager, handler);
                this.primaryTouch = null;
                this.lastTouches = []
            }
            inherit(TouchMouseInput, Input, {
                handler: function TMEhandler(manager, inputEvent, inputData) {
                    var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH,
                        isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;
                    if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
                        return
                    }
                    if (isTouch) {
                        recordTouches.call(this, inputEvent, inputData)
                    } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
                        return
                    }
                    this.callback(manager, inputEvent, inputData)
                },
                destroy: function destroy() {
                    this.touch.destroy();
                    this.mouse.destroy()
                }
            });

            function recordTouches(eventType, eventData) {
                if (eventType & INPUT_START) {
                    this.primaryTouch = eventData.changedPointers[0].identifier;
                    setLastTouch.call(this, eventData)
                } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
                    setLastTouch.call(this, eventData)
                }
            }

            function setLastTouch(eventData) {
                var touch = eventData.changedPointers[0];
                if (touch.identifier === this.primaryTouch) {
                    var lastTouch = {
                        x: touch.clientX,
                        y: touch.clientY
                    };
                    this.lastTouches.push(lastTouch);
                    var lts = this.lastTouches;
                    var removeLastTouch = function () {
                        var i = lts.indexOf(lastTouch);
                        if (i > -1) {
                            lts.splice(i, 1)
                        }
                    };
                    setTimeout(removeLastTouch, DEDUP_TIMEOUT)
                }
            }

            function isSyntheticEvent(eventData) {
                var x = eventData.srcEvent.clientX,
                    y = eventData.srcEvent.clientY;
                for (var i = 0; i < this.lastTouches.length; i++) {
                    var t = this.lastTouches[i];
                    var dx = Math.abs(x - t.x),
                        dy = Math.abs(y - t.y);
                    if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
                        return true
                    }
                }
                return false
            }
            var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, "touchAction");
            var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;
            var TOUCH_ACTION_COMPUTE = "compute";
            var TOUCH_ACTION_AUTO = "auto";
            var TOUCH_ACTION_MANIPULATION = "manipulation";
            var TOUCH_ACTION_NONE = "none";
            var TOUCH_ACTION_PAN_X = "pan-x";
            var TOUCH_ACTION_PAN_Y = "pan-y";
            var TOUCH_ACTION_MAP = getTouchActionProps();

            function TouchAction(manager, value) {
                this.manager = manager;
                this.set(value)
            }
            TouchAction.prototype = {
                set: function (value) {
                    if (value == TOUCH_ACTION_COMPUTE) {
                        value = this.compute()
                    }
                    if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
                        this.manager.element.style[PREFIXED_TOUCH_ACTION] = value
                    }
                    this.actions = value.toLowerCase().trim()
                },
                update: function () {
                    this.set(this.manager.options.touchAction)
                },
                compute: function () {
                    var actions = [];
                    each(this.manager.recognizers, function (recognizer) {
                        if (boolOrFn(recognizer.options.enable, [recognizer])) {
                            actions = actions.concat(recognizer.getTouchAction())
                        }
                    });
                    return cleanTouchActions(actions.join(" "))
                },
                preventDefaults: function (input) {
                    var srcEvent = input.srcEvent;
                    var direction = input.offsetDirection;
                    if (this.manager.session.prevented) {
                        srcEvent.preventDefault();
                        return
                    }
                    var actions = this.actions;
                    var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
                    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
                    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];
                    if (hasNone) {
                        var isTapPointer = input.pointers.length === 1;
                        var isTapMovement = input.distance < 2;
                        var isTapTouchTime = input.deltaTime < 250;
                        if (isTapPointer && isTapMovement && isTapTouchTime) {
                            return
                        }
                    }
                    if (hasPanX && hasPanY) {
                        return
                    }
                    if (hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL) {
                        return this.preventSrc(srcEvent)
                    }
                },
                preventSrc: function (srcEvent) {
                    this.manager.session.prevented = true;
                    srcEvent.preventDefault()
                }
            };

            function cleanTouchActions(actions) {
                if (inStr(actions, TOUCH_ACTION_NONE)) {
                    return TOUCH_ACTION_NONE
                }
                var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
                var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
                if (hasPanX && hasPanY) {
                    return TOUCH_ACTION_NONE
                }
                if (hasPanX || hasPanY) {
                    return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y
                }
                if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
                    return TOUCH_ACTION_MANIPULATION
                }
                return TOUCH_ACTION_AUTO
            }

            function getTouchActionProps() {
                if (!NATIVE_TOUCH_ACTION) {
                    return false
                }
                var touchMap = {};
                var cssSupports = window.CSS && window.CSS.supports;
                ["auto", "manipulation", "pan-y", "pan-x", "pan-x pan-y", "none"].forEach(function (val) {
                    touchMap[val] = cssSupports ? window.CSS.supports("touch-action", val) : true
                });
                return touchMap
            }
            var STATE_POSSIBLE = 1;
            var STATE_BEGAN = 2;
            var STATE_CHANGED = 4;
            var STATE_ENDED = 8;
            var STATE_RECOGNIZED = STATE_ENDED;
            var STATE_CANCELLED = 16;
            var STATE_FAILED = 32;

            function Recognizer(options) {
                this.options = assign({}, this.defaults, options || {});
                this.id = uniqueId();
                this.manager = null;
                this.options.enable = ifUndefined(this.options.enable, true);
                this.state = STATE_POSSIBLE;
                this.simultaneous = {};
                this.requireFail = []
            }
            Recognizer.prototype = {
                defaults: {},
                set: function (options) {
                    assign(this.options, options);
                    this.manager && this.manager.touchAction.update();
                    return this
                },
                recognizeWith: function (otherRecognizer) {
                    if (invokeArrayArg(otherRecognizer, "recognizeWith", this)) {
                        return this
                    }
                    var simultaneous = this.simultaneous;
                    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
                    if (!simultaneous[otherRecognizer.id]) {
                        simultaneous[otherRecognizer.id] = otherRecognizer;
                        otherRecognizer.recognizeWith(this)
                    }
                    return this
                },
                dropRecognizeWith: function (otherRecognizer) {
                    if (invokeArrayArg(otherRecognizer, "dropRecognizeWith", this)) {
                        return this
                    }
                    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
                    delete this.simultaneous[otherRecognizer.id];
                    return this
                },
                requireFailure: function (otherRecognizer) {
                    if (invokeArrayArg(otherRecognizer, "requireFailure", this)) {
                        return this
                    }
                    var requireFail = this.requireFail;
                    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
                    if (inArray(requireFail, otherRecognizer) === -1) {
                        requireFail.push(otherRecognizer);
                        otherRecognizer.requireFailure(this)
                    }
                    return this
                },
                dropRequireFailure: function (otherRecognizer) {
                    if (invokeArrayArg(otherRecognizer, "dropRequireFailure", this)) {
                        return this
                    }
                    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
                    var index = inArray(this.requireFail, otherRecognizer);
                    if (index > -1) {
                        this.requireFail.splice(index, 1)
                    }
                    return this
                },
                hasRequireFailures: function () {
                    return this.requireFail.length > 0
                },
                canRecognizeWith: function (otherRecognizer) {
                    return !!this.simultaneous[otherRecognizer.id]
                },
                emit: function (input) {
                    var self = this;
                    var state = this.state;

                    function emit(event) {
                        self.manager.emit(event, input)
                    }
                    if (state < STATE_ENDED) {
                        emit(self.options.event + stateStr(state))
                    }
                    emit(self.options.event);
                    if (input.additionalEvent) {
                        emit(input.additionalEvent)
                    }
                    if (state >= STATE_ENDED) {
                        emit(self.options.event + stateStr(state))
                    }
                },
                tryEmit: function (input) {
                    if (this.canEmit()) {
                        return this.emit(input)
                    }
                    this.state = STATE_FAILED
                },
                canEmit: function () {
                    var i = 0;
                    while (i < this.requireFail.length) {
                        if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                            return false
                        }
                        i++
                    }
                    return true
                },
                recognize: function (inputData) {
                    var inputDataClone = assign({}, inputData);
                    if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
                        this.reset();
                        this.state = STATE_FAILED;
                        return
                    }
                    if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
                        this.state = STATE_POSSIBLE
                    }
                    this.state = this.process(inputDataClone);
                    if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
                        this.tryEmit(inputDataClone)
                    }
                },
                process: function (inputData) {},
                getTouchAction: function () {},
                reset: function () {}
            };

            function stateStr(state) {
                if (state & STATE_CANCELLED) {
                    return "cancel"
                } else if (state & STATE_ENDED) {
                    return "end"
                } else if (state & STATE_CHANGED) {
                    return "move"
                } else if (state & STATE_BEGAN) {
                    return "start"
                }
                return ""
            }

            function directionStr(direction) {
                if (direction == DIRECTION_DOWN) {
                    return "down"
                } else if (direction == DIRECTION_UP) {
                    return "up"
                } else if (direction == DIRECTION_LEFT) {
                    return "left"
                } else if (direction == DIRECTION_RIGHT) {
                    return "right"
                }
                return ""
            }

            function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
                var manager = recognizer.manager;
                if (manager) {
                    return manager.get(otherRecognizer)
                }
                return otherRecognizer
            }

            function AttrRecognizer() {
                Recognizer.apply(this, arguments)
            }
            inherit(AttrRecognizer, Recognizer, {
                defaults: {
                    pointers: 1
                },
                attrTest: function (input) {
                    var optionPointers = this.options.pointers;
                    return optionPointers === 0 || input.pointers.length === optionPointers
                },
                process: function (input) {
                    var state = this.state;
                    var eventType = input.eventType;
                    var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
                    var isValid = this.attrTest(input);
                    if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
                        return state | STATE_CANCELLED
                    } else if (isRecognized || isValid) {
                        if (eventType & INPUT_END) {
                            return state | STATE_ENDED
                        } else if (!(state & STATE_BEGAN)) {
                            return STATE_BEGAN
                        }
                        return state | STATE_CHANGED
                    }
                    return STATE_FAILED
                }
            });

            function PanRecognizer() {
                AttrRecognizer.apply(this, arguments);
                this.pX = null;
                this.pY = null
            }
            inherit(PanRecognizer, AttrRecognizer, {
                defaults: {
                    event: "pan",
                    threshold: 10,
                    pointers: 1,
                    direction: DIRECTION_ALL
                },
                getTouchAction: function () {
                    var direction = this.options.direction;
                    var actions = [];
                    if (direction & DIRECTION_HORIZONTAL) {
                        actions.push(TOUCH_ACTION_PAN_Y)
                    }
                    if (direction & DIRECTION_VERTICAL) {
                        actions.push(TOUCH_ACTION_PAN_X)
                    }
                    return actions
                },
                directionTest: function (input) {
                    var options = this.options;
                    var hasMoved = true;
                    var distance = input.distance;
                    var direction = input.direction;
                    var x = input.deltaX;
                    var y = input.deltaY;
                    if (!(direction & options.direction)) {
                        if (options.direction & DIRECTION_HORIZONTAL) {
                            direction = x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
                            hasMoved = x != this.pX;
                            distance = Math.abs(input.deltaX)
                        } else {
                            direction = y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
                            hasMoved = y != this.pY;
                            distance = Math.abs(input.deltaY)
                        }
                    }
                    input.direction = direction;
                    return hasMoved && distance > options.threshold && direction & options.direction
                },
                attrTest: function (input) {
                    return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input))
                },
                emit: function (input) {
                    this.pX = input.deltaX;
                    this.pY = input.deltaY;
                    var direction = directionStr(input.direction);
                    if (direction) {
                        input.additionalEvent = this.options.event + direction
                    }
                    this._super.emit.call(this, input)
                }
            });

            function PinchRecognizer() {
                AttrRecognizer.apply(this, arguments)
            }
            inherit(PinchRecognizer, AttrRecognizer, {
                defaults: {
                    event: "pinch",
                    threshold: 0,
                    pointers: 2
                },
                getTouchAction: function () {
                    return [TOUCH_ACTION_NONE]
                },
                attrTest: function (input) {
                    return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN)
                },
                emit: function (input) {
                    if (input.scale !== 1) {
                        var inOut = input.scale < 1 ? "in" : "out";
                        input.additionalEvent = this.options.event + inOut
                    }
                    this._super.emit.call(this, input)
                }
            });

            function PressRecognizer() {
                Recognizer.apply(this, arguments);
                this._timer = null;
                this._input = null
            }
            inherit(PressRecognizer, Recognizer, {
                defaults: {
                    event: "press",
                    pointers: 1,
                    time: 251,
                    threshold: 9
                },
                getTouchAction: function () {
                    return [TOUCH_ACTION_AUTO]
                },
                process: function (input) {
                    var options = this.options;
                    var validPointers = input.pointers.length === options.pointers;
                    var validMovement = input.distance < options.threshold;
                    var validTime = input.deltaTime > options.time;
                    this._input = input;
                    if (!validMovement || !validPointers || input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime) {
                        this.reset()
                    } else if (input.eventType & INPUT_START) {
                        this.reset();
                        this._timer = setTimeoutContext(function () {
                            this.state = STATE_RECOGNIZED;
                            this.tryEmit()
                        }, options.time, this)
                    } else if (input.eventType & INPUT_END) {
                        return STATE_RECOGNIZED
                    }
                    return STATE_FAILED
                },
                reset: function () {
                    clearTimeout(this._timer)
                },
                emit: function (input) {
                    if (this.state !== STATE_RECOGNIZED) {
                        return
                    }
                    if (input && input.eventType & INPUT_END) {
                        this.manager.emit(this.options.event + "up", input)
                    } else {
                        this._input.timeStamp = now();
                        this.manager.emit(this.options.event, this._input)
                    }
                }
            });

            function RotateRecognizer() {
                AttrRecognizer.apply(this, arguments)
            }
            inherit(RotateRecognizer, AttrRecognizer, {
                defaults: {
                    event: "rotate",
                    threshold: 0,
                    pointers: 2
                },
                getTouchAction: function () {
                    return [TOUCH_ACTION_NONE]
                },
                attrTest: function (input) {
                    return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN)
                }
            });

            function SwipeRecognizer() {
                AttrRecognizer.apply(this, arguments)
            }
            inherit(SwipeRecognizer, AttrRecognizer, {
                defaults: {
                    event: "swipe",
                    threshold: 10,
                    velocity: .3,
                    direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
                    pointers: 1
                },
                getTouchAction: function () {
                    return PanRecognizer.prototype.getTouchAction.call(this)
                },
                attrTest: function (input) {
                    var direction = this.options.direction;
                    var velocity;
                    if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
                        velocity = input.overallVelocity
                    } else if (direction & DIRECTION_HORIZONTAL) {
                        velocity = input.overallVelocityX
                    } else if (direction & DIRECTION_VERTICAL) {
                        velocity = input.overallVelocityY
                    }
                    return this._super.attrTest.call(this, input) && direction & input.offsetDirection && input.distance > this.options.threshold && input.maxPointers == this.options.pointers && abs(velocity) > this.options.velocity && input.eventType & INPUT_END
                },
                emit: function (input) {
                    var direction = directionStr(input.offsetDirection);
                    if (direction) {
                        this.manager.emit(this.options.event + direction, input)
                    }
                    this.manager.emit(this.options.event, input)
                }
            });

            function TapRecognizer() {
                Recognizer.apply(this, arguments);
                this.pTime = false;
                this.pCenter = false;
                this._timer = null;
                this._input = null;
                this.count = 0
            }
            inherit(TapRecognizer, Recognizer, {
                defaults: {
                    event: "tap",
                    pointers: 1,
                    taps: 1,
                    interval: 300,
                    time: 250,
                    threshold: 9,
                    posThreshold: 10
                },
                getTouchAction: function () {
                    return [TOUCH_ACTION_MANIPULATION]
                },
                process: function (input) {
                    var options = this.options;
                    var validPointers = input.pointers.length === options.pointers;
                    var validMovement = input.distance < options.threshold;
                    var validTouchTime = input.deltaTime < options.time;
                    this.reset();
                    if (input.eventType & INPUT_START && this.count === 0) {
                        return this.failTimeout()
                    }
                    if (validMovement && validTouchTime && validPointers) {
                        if (input.eventType != INPUT_END) {
                            return this.failTimeout()
                        }
                        var validInterval = this.pTime ? input.timeStamp - this.pTime < options.interval : true;
                        var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
                        this.pTime = input.timeStamp;
                        this.pCenter = input.center;
                        if (!validMultiTap || !validInterval) {
                            this.count = 1
                        } else {
                            this.count += 1
                        }
                        this._input = input;
                        var tapCount = this.count % options.taps;
                        if (tapCount === 0) {
                            if (!this.hasRequireFailures()) {
                                return STATE_RECOGNIZED
                            } else {
                                this._timer = setTimeoutContext(function () {
                                    this.state = STATE_RECOGNIZED;
                                    this.tryEmit()
                                }, options.interval, this);
                                return STATE_BEGAN
                            }
                        }
                    }
                    return STATE_FAILED
                },
                failTimeout: function () {
                    this._timer = setTimeoutContext(function () {
                        this.state = STATE_FAILED
                    }, this.options.interval, this);
                    return STATE_FAILED
                },
                reset: function () {
                    clearTimeout(this._timer)
                },
                emit: function () {
                    if (this.state == STATE_RECOGNIZED) {
                        this._input.tapCount = this.count;
                        this.manager.emit(this.options.event, this._input)
                    }
                }
            });

            function Hammer(element, options) {
                options = options || {};
                options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
                return new Manager(element, options)
            }
            Hammer.VERSION = "2.0.7";
            Hammer.defaults = {
                domEvents: false,
                touchAction: TOUCH_ACTION_COMPUTE,
                enable: true,
                inputTarget: null,
                inputClass: null,
                preset: [
                    [RotateRecognizer, {
                        enable: false
                    }],
                    [PinchRecognizer, {
                            enable: false
                        },
                        ["rotate"]
                    ],
                    [SwipeRecognizer, {
                        direction: DIRECTION_HORIZONTAL
                    }],
                    [PanRecognizer, {
                            direction: DIRECTION_HORIZONTAL
                        },
                        ["swipe"]
                    ],
                    [TapRecognizer],
                    [TapRecognizer, {
                            event: "doubletap",
                            taps: 2
                        },
                        ["tap"]
                    ],
                    [PressRecognizer]
                ],
                cssProps: {
                    userSelect: "none",
                    touchSelect: "none",
                    touchCallout: "none",
                    contentZooming: "none",
                    userDrag: "none",
                    tapHighlightColor: "rgba(0,0,0,0)"
                }
            };
            var STOP = 1;
            var FORCED_STOP = 2;

            function Manager(element, options) {
                this.options = assign({}, Hammer.defaults, options || {});
                this.options.inputTarget = this.options.inputTarget || element;
                this.handlers = {};
                this.session = {};
                this.recognizers = [];
                this.oldCssProps = {};
                this.element = element;
                this.input = createInputInstance(this);
                this.touchAction = new TouchAction(this, this.options.touchAction);
                toggleCssProps(this, true);
                each(this.options.recognizers, function (item) {
                    var recognizer = this.add(new item[0](item[1]));
                    item[2] && recognizer.recognizeWith(item[2]);
                    item[3] && recognizer.requireFailure(item[3])
                }, this)
            }
            Manager.prototype = {
                set: function (options) {
                    assign(this.options, options);
                    if (options.touchAction) {
                        this.touchAction.update()
                    }
                    if (options.inputTarget) {
                        this.input.destroy();
                        this.input.target = options.inputTarget;
                        this.input.init()
                    }
                    return this
                },
                stop: function (force) {
                    this.session.stopped = force ? FORCED_STOP : STOP
                },
                recognize: function (inputData) {
                    var session = this.session;
                    if (session.stopped) {
                        return
                    }
                    this.touchAction.preventDefaults(inputData);
                    var recognizer;
                    var recognizers = this.recognizers;
                    var curRecognizer = session.curRecognizer;
                    if (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) {
                        curRecognizer = session.curRecognizer = null
                    }
                    var i = 0;
                    while (i < recognizers.length) {
                        recognizer = recognizers[i];
                        if (session.stopped !== FORCED_STOP && (!curRecognizer || recognizer == curRecognizer || recognizer.canRecognizeWith(curRecognizer))) {
                            recognizer.recognize(inputData)
                        } else {
                            recognizer.reset()
                        }
                        if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                            curRecognizer = session.curRecognizer = recognizer
                        }
                        i++
                    }
                },
                get: function (recognizer) {
                    if (recognizer instanceof Recognizer) {
                        return recognizer
                    }
                    var recognizers = this.recognizers;
                    for (var i = 0; i < recognizers.length; i++) {
                        if (recognizers[i].options.event == recognizer) {
                            return recognizers[i]
                        }
                    }
                    return null
                },
                add: function (recognizer) {
                    if (invokeArrayArg(recognizer, "add", this)) {
                        return this
                    }
                    var existing = this.get(recognizer.options.event);
                    if (existing) {
                        this.remove(existing)
                    }
                    this.recognizers.push(recognizer);
                    recognizer.manager = this;
                    this.touchAction.update();
                    return recognizer
                },
                remove: function (recognizer) {
                    if (invokeArrayArg(recognizer, "remove", this)) {
                        return this
                    }
                    recognizer = this.get(recognizer);
                    if (recognizer) {
                        var recognizers = this.recognizers;
                        var index = inArray(recognizers, recognizer);
                        if (index !== -1) {
                            recognizers.splice(index, 1);
                            this.touchAction.update()
                        }
                    }
                    return this
                },
                on: function (events, handler) {
                    if (events === undefined) {
                        return
                    }
                    if (handler === undefined) {
                        return
                    }
                    var handlers = this.handlers;
                    each(splitStr(events), function (event) {
                        handlers[event] = handlers[event] || [];
                        handlers[event].push(handler)
                    });
                    return this
                },
                off: function (events, handler) {
                    if (events === undefined) {
                        return
                    }
                    var handlers = this.handlers;
                    each(splitStr(events), function (event) {
                        if (!handler) {
                            delete handlers[event]
                        } else {
                            handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1)
                        }
                    });
                    return this
                },
                emit: function (event, data) {
                    if (this.options.domEvents) {
                        triggerDomEvent(event, data)
                    }
                    var handlers = this.handlers[event] && this.handlers[event].slice();
                    if (!handlers || !handlers.length) {
                        return
                    }
                    data.type = event;
                    data.preventDefault = function () {
                        data.srcEvent.preventDefault()
                    };
                    var i = 0;
                    while (i < handlers.length) {
                        handlers[i](data);
                        i++
                    }
                },
                destroy: function () {
                    this.element && toggleCssProps(this, false);
                    this.handlers = {};
                    this.session = {};
                    this.input.destroy();
                    this.element = null
                }
            };

            function toggleCssProps(manager, add) {
                var element = manager.element;
                if (!element.style) {
                    return
                }
                var prop;
                each(manager.options.cssProps, function (value, name) {
                    prop = prefixed(element.style, name);
                    if (add) {
                        manager.oldCssProps[prop] = element.style[prop];
                        element.style[prop] = value
                    } else {
                        element.style[prop] = manager.oldCssProps[prop] || ""
                    }
                });
                if (!add) {
                    manager.oldCssProps = {}
                }
            }

            function triggerDomEvent(event, data) {
                var gestureEvent = document.createEvent("Event");
                gestureEvent.initEvent(event, true, true);
                gestureEvent.gesture = data;
                data.target.dispatchEvent(gestureEvent)
            }
            assign(Hammer, {
                INPUT_START: INPUT_START,
                INPUT_MOVE: INPUT_MOVE,
                INPUT_END: INPUT_END,
                INPUT_CANCEL: INPUT_CANCEL,
                STATE_POSSIBLE: STATE_POSSIBLE,
                STATE_BEGAN: STATE_BEGAN,
                STATE_CHANGED: STATE_CHANGED,
                STATE_ENDED: STATE_ENDED,
                STATE_RECOGNIZED: STATE_RECOGNIZED,
                STATE_CANCELLED: STATE_CANCELLED,
                STATE_FAILED: STATE_FAILED,
                DIRECTION_NONE: DIRECTION_NONE,
                DIRECTION_LEFT: DIRECTION_LEFT,
                DIRECTION_RIGHT: DIRECTION_RIGHT,
                DIRECTION_UP: DIRECTION_UP,
                DIRECTION_DOWN: DIRECTION_DOWN,
                DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
                DIRECTION_VERTICAL: DIRECTION_VERTICAL,
                DIRECTION_ALL: DIRECTION_ALL,
                Manager: Manager,
                Input: Input,
                TouchAction: TouchAction,
                TouchInput: TouchInput,
                MouseInput: MouseInput,
                PointerEventInput: PointerEventInput,
                TouchMouseInput: TouchMouseInput,
                SingleTouchInput: SingleTouchInput,
                Recognizer: Recognizer,
                AttrRecognizer: AttrRecognizer,
                Tap: TapRecognizer,
                Pan: PanRecognizer,
                Swipe: SwipeRecognizer,
                Pinch: PinchRecognizer,
                Rotate: RotateRecognizer,
                Press: PressRecognizer,
                on: addEventListeners,
                off: removeEventListeners,
                each: each,
                merge: merge,
                extend: extend,
                assign: assign,
                inherit: inherit,
                bindFn: bindFn,
                prefixed: prefixed
            });
            var freeGlobal = typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {};
            freeGlobal.Hammer = Hammer;
            if (typeof define === "function" && define.amd) {
                define(function () {
                    return Hammer
                })
            } else if (typeof module != "undefined" && module.exports) {
                module.exports = Hammer
            } else {
                window[exportName] = Hammer
            }
        })(window, document, "Hammer")
    }, {}],
    27: [function (require, module, exports) {
        module.exports = function (obj) {
            return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
        };

        function isBuffer(obj) {
            return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj)
        }

        function isSlowBuffer(obj) {
            return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0))
        }
    }, {}],
    28: [function (require, module, exports) {
        "use strict";
        module.exports = pixelmatch;

        function pixelmatch(img1, img2, output, width, height, options) {
            if (!options) options = {};
            var threshold = options.threshold === undefined ? .1 : options.threshold;
            var maxDelta = 35215 * threshold * threshold,
                diff = 0;
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var pos = (y * width + x) * 4;
                    var delta = colorDelta(img1, img2, pos, pos);
                    if (delta > maxDelta) {
                        if (!options.includeAA && (antialiased(img1, x, y, width, height, img2) || antialiased(img2, x, y, width, height, img1))) {
                            if (output) drawPixel(output, pos, 255, 255, 0)
                        } else {
                            if (output) drawPixel(output, pos, 255, 0, 0);
                            diff++
                        }
                    } else if (output) {
                        var val = blend(grayPixel(img1, pos), .1);
                        drawPixel(output, pos, val, val, val)
                    }
                }
            }
            return diff
        }

        function antialiased(img, x1, y1, width, height, img2) {
            var x0 = Math.max(x1 - 1, 0),
                y0 = Math.max(y1 - 1, 0),
                x2 = Math.min(x1 + 1, width - 1),
                y2 = Math.min(y1 + 1, height - 1),
                pos = (y1 * width + x1) * 4,
                zeroes = 0,
                positives = 0,
                negatives = 0,
                min = 0,
                max = 0,
                minX, minY, maxX, maxY;
            for (var x = x0; x <= x2; x++) {
                for (var y = y0; y <= y2; y++) {
                    if (x === x1 && y === y1) continue;
                    var delta = colorDelta(img, img, pos, (y * width + x) * 4, true);
                    if (delta === 0) zeroes++;
                    else if (delta < 0) negatives++;
                    else if (delta > 0) positives++;
                    if (zeroes > 2) return false;
                    if (!img2) continue;
                    if (delta < min) {
                        min = delta;
                        minX = x;
                        minY = y
                    }
                    if (delta > max) {
                        max = delta;
                        maxX = x;
                        maxY = y
                    }
                }
            }
            if (!img2) return true;
            if (negatives === 0 || positives === 0) return false;
            return !antialiased(img, minX, minY, width, height) && !antialiased(img2, minX, minY, width, height) || !antialiased(img, maxX, maxY, width, height) && !antialiased(img2, maxX, maxY, width, height)
        }

        function colorDelta(img1, img2, k, m, yOnly) {
            var a1 = img1[k + 3] / 255,
                a2 = img2[m + 3] / 255,
                r1 = blend(img1[k + 0], a1),
                g1 = blend(img1[k + 1], a1),
                b1 = blend(img1[k + 2], a1),
                r2 = blend(img2[m + 0], a2),
                g2 = blend(img2[m + 1], a2),
                b2 = blend(img2[m + 2], a2),
                y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);
            if (yOnly) return y;
            var i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2),
                q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);
            return .5053 * y * y + .299 * i * i + .1957 * q * q
        }

        function rgb2y(r, g, b) {
            return r * .29889531 + g * .58662247 + b * .11448223
        }

        function rgb2i(r, g, b) {
            return r * .59597799 - g * .2741761 - b * .32180189
        }

        function rgb2q(r, g, b) {
            return r * .21147017 - g * .52261711 + b * .31114694
        }

        function blend(c, a) {
            return 255 + (c - 255) * a
        }

        function drawPixel(output, pos, r, g, b) {
            output[pos + 0] = r;
            output[pos + 1] = g;
            output[pos + 2] = b;
            output[pos + 3] = 255
        }

        function grayPixel(img, i) {
            var a = img[i + 3] / 255,
                r = blend(img[i + 0], a),
                g = blend(img[i + 1], a),
                b = blend(img[i + 2], a);
            return rgb2y(r, g, b)
        }
    }, {}],
    29: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const addImages_1 = require("../util/addImages");
        const CameraCapture_1 = require("../util/CameraCapture");
        const ParticlesAmbient_1 = require("./ParticlesAmbient");
        const DetectColorBars_1 = require("./DetectColorBars");
        const DetectPhotoMatch_1 = require("./DetectPhotoMatch");
        const Sparkles_1 = require("./Sparkles");
        const ARState_1 = require("./ARState");
        const SELECTORS = {
            AR_CONTAINER: ".ar-container",
            NO_CAMERA: ".ar-no-camera",
            INSTRUCTIONS: "div.ar-instructions",
            FILTER: ".ar-filter",
            ALSO_ABOUT: ".ar-also-about",
            AR_PHOTOS: ".ar-photo",
            AR_INTRO: ".ar-intro",
            AR_MESSAGES: ".ar-messages",
            AR_PARTICLES: ".ar-particles",
            FLASH: ".ar-flash",
            LOGO_CONTAINER: ".ar-logo-container",
            DEBUG_CONTAINER: ".ar-debug-container",
            DEBUG_LEVEL_1: ".debug-level-1",
            DEBUG_LEVEL_2: ".debug-level-2",
            DEBUG_PHOTO_CONTAINER: ".debug-photo",
            INFO_BAR: ".js-info-bar",
            INFO_BAR_TEXT: ".js-info-text",
            INFO_BAR_BUTTON: ".js-info-icon"
        };
        const PERFORMANCE_FRAMES_COUNT = 20;
        const LAG_WARNING_THRESHOLD_MS = 400;
        const CLASSES = {
            ACTIVE: "-active",
            MESSAGE: ".ar-prompt",
            LOGOS_BLACK: ".intro-logos",
            BUTTON: ".instruction-button",
            PHOTO_BUTTON: ".photo-button",
            BOTTOM_LOGOS: ".bottom-logos",
            TIPS_BUTTON: ".tips-button",
            INTRO_TIPS: ".tips",
            AR_CANVAS: ".ar-canvas",
            EXIT_MESSAGE: ".msg-button",
            NO_CAMERA_LINK: ".no-camera-link",
            TIPS_LINK: ".tips-link",
            MSG_MESSAGE: ".message",
            MSG_LINK: ".msg-link",
            MSG_LOGOS: ".msg-logos",
            ANOTHER_PHOTO_LINK: ".another-photo-link"
        };
        class ARExperience {
            constructor(mobile) {
                this.animationStarted = false;
                this.bottomPadding = 80;
                this.canvasHeight = 256;
                this.canvasWidth = 256;
                this.detectionIsComplete = false;
                this.containerHeight = 0;
                this.containerWidth = 0;
                this.barsDetected = false;
                this.done = false;
                this.frameCount = 0;
                this.instructionScreen = false;
                this.introText = true;
                this.largeScreen = window.innerWidth > 1023;
                this.logoSize = 24;
                this.onCamera = true;
                this.particleOrder = ParticlesAmbient_1.ParticleOrder.Random;
                this.performanceArray = [];
                this.timeUntilTipsBar = 15e3;
                this.timeUntilErrorPopup = 25e3;
                this.vidHeight = 0;
                this.vidWidth = 0;
                this.hasSeenInfoBar = false;
                this.portraitMode = true;
                this.landscapeAtStart = false;
                this.midMessage = true;
                this.isMobile = mobile;
                this.startExperience = this.startExperience.bind(this);
                this.onResize = this.onResize.bind(this);
                this.animate = this.animate.bind(this);
                this.onCameraCaptureSuccess = this.onCameraCaptureSuccess.bind(this);
                this.helper = this.helper.bind(this);
                this.snapPicture = this.snapPicture.bind(this);
                this.onBarsDetected = this.onBarsDetected.bind(this);
                this.handleTipsButton = this.handleTipsButton.bind(this);
                this.handleTipsClose = this.handleTipsClose.bind(this);
                this.log = this.log.bind(this)
            }
            init() {
                this.alsoAbout = document.querySelector(SELECTORS.ALSO_ABOUT);
                this.container = document.querySelector(SELECTORS.AR_CONTAINER);
                this.bottomLogos = document.querySelector(CLASSES.BOTTOM_LOGOS);
                this.arIntro = document.querySelector(SELECTORS.AR_INTRO);
                this.orientationMsg = document.querySelector(".ar-orientation");
                this.debugContainer = document.querySelector(SELECTORS.DEBUG_CONTAINER);
                if (this.debugContainer) {
                    this.debugLevel1 = this.debugContainer.querySelector(SELECTORS.DEBUG_LEVEL_1);
                    this.debugLevel2 = this.debugContainer.querySelector(SELECTORS.DEBUG_LEVEL_2);
                    this.debugPhotoContainer = this.debugContainer.querySelector(SELECTORS.DEBUG_PHOTO_CONTAINER)
                }
                this.debug = this.debugContainer ? true : false;
                this.debug = false;
                this.opacityDiv = document.querySelector(SELECTORS.FILTER);
                this.messageLogos = document.querySelector(CLASSES.MSG_LOGOS);
                this.instructions = document.querySelector(SELECTORS.INSTRUCTIONS);
                this.particleDiv = document.querySelector(SELECTORS.AR_PARTICLES);
                this.introLogos = document.querySelector(CLASSES.LOGOS_BLACK);
                this.messageDiv = document.querySelector(SELECTORS.AR_MESSAGES);
                this.messageDivMessage = this.messageDiv.querySelector(CLASSES.MSG_MESSAGE);
                this.infoBar = document.querySelector(SELECTORS.INFO_BAR);
                this.infoBarButton = this.infoBar.querySelector(SELECTORS.INFO_BAR_BUTTON);
                this.infoBarText = this.infoBar.querySelector(SELECTORS.INFO_BAR_TEXT);
                this.vh = window.innerHeight;
                this.messageDivLink = this.messageDiv.querySelector(CLASSES.MSG_LINK);
                this.containerHeight = this.container.offsetHeight;
                this.containerWidth = this.container.offsetWidth;
                this.state = new ARState_1.ARState;
                this.kickoffAnimations();
                if (this.debug) {
                    this.timeUntilErrorPopup = 1e8;
                    this.debugContainer.style.display = "block"
                }
            }
            log(msg, level, reset) {
                if (this.debug) {
                    console.log(msg);
                    if (level && level === 2) {
                        if (reset) {
                            this.debugLevel2.innerHTML = msg + "<br />"
                        } else {
                            this.debugLevel2.innerHTML = msg + "<br />" + this.debugLevel2.innerHTML
                        }
                    } else {
                        this.debugLevel1.innerHTML = msg
                    }
                }
            }
            resetDebugger() {
                if (this.debug) {
                    this.log("READY");
                    this.log("", 2, true);
                    this.debugPhotoContainer.innerHTML = ""
                }
            }
            kickoffAnimations() {
                const link = this.alsoAbout.querySelector(CLASSES.ANOTHER_PHOTO_LINK);
                let logoPosition = (this.vh - this.bottomPadding).toString();
                this.bottomLogos.style.top = logoPosition + "px";
                this.messageLogos.style.top = logoPosition + "px";
                if (!this.largeScreen) {
                    if (this.vh > window.innerWidth) {
                        const pos = this.vh - this.bottomPadding * 2;
                        logoPosition = pos.toString()
                    } else {
                        const pos = this.vh + this.bottomPadding;
                        logoPosition = pos.toString()
                    }
                    link.style.top = "0"
                }
                this.logoContainer = document.querySelector(SELECTORS.LOGO_CONTAINER);
                const logoAnimationData = {
                    container: this.logoContainer,
                    renderer: "svg",
                    loop: false,
                    autoplay: false,
                    path: "../../nytimes/static/images/AR/ar-loader-2.json"
                };
                const animateLogos = bodymovin.loadAnimation(logoAnimationData);
                animateLogos.play();
                setTimeout(() => {
                    if (window.innerHeight > window.innerWidth || this.largeScreen) {
                        setTimeout(this.startExperience, 500);
                        this.logoContainer.remove();
                        const drop = this.vh - this.bottomPadding - this.logoSize;
                        this.introLogos.style.top = drop + "px";
                        this.introLogos.style.visibility = "visible";
                        this.introLogos.style.transform = "scale(.4)"
                    } else {
                        setTimeout(this.startExperience, 500);
                        this.logoContainer.remove();
                        const drop = this.vh - this.bottomPadding + 9;
                        this.introLogos.style.top = drop + "px";
                        this.introLogos.style.visibility = "visible";
                        this.introLogos.style.transform = "scale(.4)"
                    }
                }, 1300)
            }
            setMobileLandscape() {
                this.orientationMsg.style.display = "flex";
                this.portraitMode = false;
                this.landscapeAtStart = true;
                this.introLogos.remove();
                this.arIntro.style.display = "none";
                this.bottomLogos.style.display = "flex";
                this.container.style.backgroundColor = "#000"
            }
            resetMobileLandscape() {
                this.orientationMsg.style.display = "none";
                this.portraitMode = true;
                this.landscapeAtStart = true;
                this.introLogos.remove();
                this.bottomLogos.style.display = "flex";
                this.container.style.backgroundColor = "#000"
            }
            startExperience() {
                this.infoBarButton.addEventListener("click", this.handleTipsButton);
                addImages_1.loadImages();
                this.cameraCapture = new CameraCapture_1.CameraCapture({
                    offScreen: true
                });
                this.cameraCapture.start().then(video_element => {
                    this.opacityDiv.style.visibility = "visible";
                    this.onCameraCaptureSuccess(video_element);
                    if (window.matchMedia("(orientation: landscape)").matches && window.innerWidth < 1024) {
                        this.setMobileLandscape()
                    } else {
                        this.introLogos.remove();
                        this.bottomLogos.style.display = "flex";
                        this.arIntro.style.display = "inline-block";
                        this.container.style.backgroundColor = "#000"
                    }
                }, _failed_reason => {
                    const msg = this.container.querySelector(SELECTORS.NO_CAMERA);
                    const alerting = msg.querySelector(".no-camera-text");
                    if (navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
                        const link = msg.querySelector(CLASSES.NO_CAMERA_LINK);
                        alerting.innerHTML = "If you’re using Chrome on iOS, we can’t access " + '<span class="no-break">your camera.</span>';
                        link.innerHTML = "Choose a photo here instead"
                    }
                    msg.style.display = "block"
                })
            }
            onBarsDetected(photoName) {
                this.barsDetected = true;
                this.detectionIsComplete = false;
                if (this.snapPicture(photoName)) {
                    this.hasSeenInfoBar = true;
                    this.handleTipsClose();
                    this.infoBarButton.removeEventListener("click", this.handleTipsButton);
                    this.log("BARS HIT: " + photoName + " + PHOTO HIT");
                    this.beginFinalAnimation(photoName)
                } else {
                    this.log("BARS HIT: " + photoName + " + PHOTO MISS");
                    this.barsDetected = false
                }
            }
            handleTipsButton() {
                this.infoBar.classList.remove(CLASSES.ACTIVE);
                this.instructions.style.visibility = "visible";
                this.instructions.style.top = "0px";
                this.instructions.style.opacity = "1";
                this.opacityDiv.style.opacity = "1";
                this.instructionScreen = true;
                this.onCamera = false
            }
            handleTipsClose() {
                this.instructions.style.top = "100vh";
                this.instructions.style.opacity = "0";
                this.instructionScreen = false;
                this.onCamera = true;
                this.opacityDiv.style.opacity = "0.5";
                this.helper()
            }
            onCameraCaptureSuccess(video_element) {
                this.videoStream = video_element;
                this.vidHeight = this.videoStream.videoHeight;
                this.vidWidth = this.videoStream.videoWidth;
                const aspect = this.videoStream.videoHeight / this.videoStream.videoWidth;
                if (aspect > 1) {
                    this.canvasWidth = 256;
                    this.canvasHeight = Math.round(this.canvasWidth * aspect)
                } else {
                    this.canvasWidth = Math.round(this.canvasWidth * (1 / aspect));
                    this.canvasHeight = 256
                }
                this.canvas = document.querySelector(CLASSES.AR_CANVAS);
                this.canvasContext = this.canvas.getContext("2d");
                this.canvas.width = this.canvasWidth;
                this.canvas.height = this.canvasHeight;
                this.vidCanvas = document.createElement("canvas");
                this.vidCanvas.className = "ar-video-canvas";
                this.vidCanvasContext = this.vidCanvas.getContext("2d");
                this.vidCanvas.width = this.canvasWidth;
                this.vidCanvas.height = this.canvasHeight;
                this.detectBars = new DetectColorBars_1.DetectColorBars(this.state, this.canvas, this.vidCanvas, this.videoStream, this.onBarsDetected, this.log);
                const button = this.instructions.querySelector(CLASSES.BUTTON);
                button.addEventListener("click", this.handleTipsClose);
                const tipsButton = this.arIntro.querySelector(CLASSES.TIPS_BUTTON);
                tipsButton.addEventListener("click", this.handleTipsButton);
                const buttonDiv = document.querySelector(SELECTORS.ALSO_ABOUT);
                const cameraButton = buttonDiv.querySelector(CLASSES.PHOTO_BUTTON);
                cameraButton.addEventListener("click", () => {
                    const elem = document.querySelector(SELECTORS.ALSO_ABOUT);
                    this.arIntro.style.display = "none";
                    this.onCamera = true;
                    elem.style.display = "none";
                    this.currentPhoto.style.visibility = "hidden";
                    this.currentStories.style.visibility = "hidden";
                    this.barsDetected = false;
                    this.animationStarted = false;
                    this.detectionIsComplete = false;
                    this.done = false;
                    this.sparkles.destroy();
                    this.image.style.visibility = "hidden";
                    this.bottomLogos.style.display = "flex";
                    cameraButton.style.display = "none";
                    this.helper();
                    this.resetDebugger();
                    this.infoBarButton.addEventListener("click", this.handleTipsButton)
                });
                const msgButton = this.messageDiv.querySelector(CLASSES.EXIT_MESSAGE);
                msgButton.addEventListener("click", () => {
                    this.messageDiv.style.display = "none";
                    this.messageLogos.style.display = "none";
                    this.helper()
                });
                window.addEventListener("resize", this.onResize, false);
                window.addEventListener("deviceorientation", e => {
                    this.beta = e.beta
                });
                window.addEventListener("pageshow", function (event) {
                    if (event.persisted) {
                        window.location.reload()
                    }
                });
                setTimeout(() => {
                    if (this.introText && !this.landscapeAtStart) {
                        this.midMessage = false;
                        this.arIntro.querySelector(CLASSES.TIPS_BUTTON).remove();
                        this.arIntro.querySelector(CLASSES.INTRO_TIPS).remove();
                        const prompt = this.arIntro.querySelector(CLASSES.MESSAGE);
                        prompt.style.display = "block";
                        this.arIntro.style.display = "none";
                        this.introText = false
                    }
                    if (!this.landscapeAtStart) {
                        this.helper()
                    }
                }, 5e3);
                this.log("READY");
                this.animate();
                this.sparkles = new Sparkles_1.DoSparkles(this.vidCanvasContext, this.videoStream, this.canvas, this.canvasContext, this.pixels, this.done, null, this.particleDiv);
                window.setInterval(() => {
                    if (!this.barsDetected) {
                        this.sparkles = new Sparkles_1.DoSparkles(this.vidCanvasContext, this.videoStream, this.canvas, this.canvasContext, this.pixels, this.done, null, this.particleDiv)
                    }
                }, 500)
            }
            helper() {
                this.onCamera = true;
                this.instructionScreen = false;
                this.startTime = +new Date
            }
            onResize() {
                this.vh = window.innerHeight;
                const link = this.alsoAbout.querySelector(CLASSES.ANOTHER_PHOTO_LINK);
                let logoPosition = (this.vh - this.bottomPadding).toString();
                this.bottomLogos.style.top = logoPosition + "px";
                this.messageLogos.style.top = logoPosition + "px";
                if (!this.largeScreen) {
                    if (this.vh > window.innerWidth) {
                        const pos = this.vh - this.bottomPadding * 2;
                        logoPosition = pos.toString()
                    } else {
                        const pos = this.vh + this.bottomPadding;
                        logoPosition = pos.toString()
                    }
                    link.style.top = "0"
                }
                if (!window.matchMedia("(orientation: landscape)").matches && window.innerWidth < 1024) {
                    if (!this.portraitMode) {
                        this.resetMobileLandscape()
                    }
                    this.portraitMode = true
                } else if (window.matchMedia("(orientation: landscape)").matches && window.innerWidth < 1024) {
                    if (this.portraitMode) {
                        this.setMobileLandscape()
                    }
                    this.portraitMode = false
                } else if (window.innerWidth > 1024) {
                    if (!this.portraitMode) {
                        this.resetMobileLandscape()
                    }
                }
            }
            animate() {
                const now = +new Date;
                if (!this.performanceChecked) {
                    this.performance = now
                }
                this.frameCount++;
                if (this.videoStream.readyState === this.videoStream.HAVE_ENOUGH_DATA) {
                    if (!this.introText && this.onCamera && !this.instructionScreen && this.portraitMode && !this.barsDetected) {
                        if (now - this.startTime > this.timeUntilTipsBar && !this.hasSeenInfoBar) {
                            this.infoBar.classList.add(CLASSES.ACTIVE);
                            this.infoBarText.addEventListener("click", this.handleTipsButton);
                            this.hasSeenInfoBar = true
                        } else if (now - this.startTime > this.timeUntilErrorPopup) {
                            this.onCamera = false;
                            this.messageDivMessage.innerHTML = "Oops, no luck. Close this message and " + '<span class="no-break">try again.</span>';
                            this.messageDiv.style.display = "block";
                            this.messageLogos.style.display = "flex"
                        }
                    }
                    if (!this.performanceChecked && !this.barsDetected && !this.introText && this.portraitMode) {
                        if (this.performanceArray.length >= PERFORMANCE_FRAMES_COUNT) {
                            this.performanceChecked = true;
                            let sum = 0;
                            for (let i = 0; i < PERFORMANCE_FRAMES_COUNT; i++) {
                                sum += this.performanceArray[i]
                            }
                            const avg = sum / PERFORMANCE_FRAMES_COUNT;
                            if (avg > LAG_WARNING_THRESHOLD_MS) {
                                this.onCamera = false;
                                this.messageDivMessage.innerHTML = `Oops, there's some lag on your device. Close this message\n                and <span class="no-break">try again.</span>`;
                                this.messageDiv.style.display = "block";
                                this.messageLogos.style.display = "flex"
                            }
                        }
                    }
                    if (this.onCamera && !this.instructionScreen) {
                        if (!this.barsDetected && this.portraitMode) {
                            this.detectBars.detectImage()
                        }
                    }
                }
                if (this.performanceArray.length < PERFORMANCE_FRAMES_COUNT) {
                    const performanceTime = +new Date;
                    this.performanceArray.push(performanceTime - this.performance)
                }
                requestAnimationFrame(this.animate)
            }
            getFinalImage() {
                this.image.style.opacity = "1";
                this.image.style.transform = "scale(1.5)";
                this.image.style.visibility = "visible";
                return this.image.getElementsByTagName("img")[0]
            }
            revealImage(name) {
                setTimeout(() => {
                    const photo = ".story-" + name;
                    this.currentStories = this.alsoAbout.querySelector(photo);
                    this.currentStories.style.visibility = "visible";
                    this.currentStories.style.opacity = "1";
                    this.currentStories.style.top = "0";
                    const button = this.alsoAbout.querySelector(CLASSES.PHOTO_BUTTON);
                    button.style.display = "flex"
                }, 500);
                const image = this.getFinalImage();
                this.currentPhoto = image;
                this.currentPhoto.style.opacity = "1";
                this.currentPhoto.style.visibility = "visible";
                this.currentPhoto.style.zIndex = "14";
                this.alsoAbout.style.display = "flex"
            }
            beginFinalAnimation(photo) {
                const fullName = SELECTORS.AR_PHOTOS + "-" + photo;
                this.image = document.querySelector(fullName);
                if (this.introText) {
                    this.arIntro.querySelector(CLASSES.TIPS_BUTTON).remove();
                    this.arIntro.querySelector(CLASSES.INTRO_TIPS).remove();
                    const prompt = this.arIntro.querySelector(CLASSES.MESSAGE);
                    prompt.style.display = "block";
                    this.introText = false
                } else {
                    this.arIntro.style.display = "block"
                }
                this.bottomLogos.style.display = "none";
                this.barsDetected = true;
                this.onCamera = false;
                this.detectionIsComplete = true;
                setTimeout(() => {
                    const flash = document.querySelector(SELECTORS.FLASH);
                    flash.style.display = "block";
                    setTimeout(() => {
                        flash.style.display = "none";
                        this.revealImage(photo)
                    }, 300)
                }, 2e3);
                this.done = true;
                if (this.particles) {
                    this.sparkles.destroy()
                }
                this.sparkles = new Sparkles_1.DoSparkles(this.vidCanvasContext, this.videoStream, this.canvas, this.canvasContext, this.pixels, this.done, this.state.getProperty("photoBounds"), this.particleDiv)
            }
            snapPicture(name) {
                if (!this.detectionIsComplete && !this.animationStarted) {
                    this.detectPhotoMatch = new DetectPhotoMatch_1.DetectPhotoMatch(this.state, this.canvas.height, this.canvas.width, this.vidCanvas, this.debug, this.debugPhotoContainer, this.log);
                    return this.detectPhotoMatch.snapPicture(name)
                }
            }
        }
        exports.ARExperience = ARExperience
    }, {
        "../util/CameraCapture": 50,
        "../util/addImages": 53,
        "./ARState": 31,
        "./DetectColorBars": 36,
        "./DetectPhotoMatch": 37,
        "./ParticlesAmbient": 41,
        "./Sparkles": 45
    }],
    30: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const SELECTORS = {
            AR_CONTAINER: ".ar-container"
        };
        class ARConfig {
            constructor() {
                this.matchers = [{
                    photo: "christmas-tree",
                    first: "blue",
                    max: "red",
                    test: function (barsize) {
                        return barsize.red > barsize.yellow && barsize.red > barsize.blue && barsize.red > barsize.green && barsize.green && barsize.yellow && barsize.blue / barsize.green > .6 && barsize.blue / barsize.yellow > .6
                    }
                }, {
                    photo: "sailors",
                    first: "red",
                    max: "red",
                    test: function (barsize) {
                        return barsize.green < barsize.red && barsize.yellow < barsize.red && barsize.blue < barsize.red
                    }
                }, {
                    photo: "twins",
                    first: "red",
                    max: "yellow",
                    test: function (barsize) {
                        return barsize.green / barsize.yellow > .4 && barsize.red / barsize.yellow < .3 && barsize.blue / barsize.yellow < .3 && barsize.green > barsize.red && barsize.green > barsize.blue
                    }
                }, {
                    photo: "uncle-sam",
                    first: "yellow",
                    max: "blue",
                    test: function (barsize) {
                        return barsize.blue > barsize.yellow && barsize.blue > barsize.red && barsize.blue > barsize.green
                    }
                }, {
                    photo: "bed-stuy",
                    first: "yellow",
                    max: "yellow",
                    test: function (barsize) {
                        return barsize.green < barsize.yellow && barsize.green < barsize.blue && barsize.green < barsize.red && barsize.red < barsize.yellow && barsize.blue < barsize.yellow
                    }
                }, {
                    photo: "rockefeller",
                    first: "green",
                    max: "green",
                    test: function (barsize) {
                        return barsize.green > barsize.red && barsize.green > barsize.yellow && barsize.green > barsize.blue && barsize.yellow < barsize.blue && barsize.yellow < barsize.green && barsize.red > barsize.blue
                    }
                }, {
                    photo: "bicycles",
                    first: "blue",
                    max: "green",
                    test: function (barsize) {
                        return barsize.yellow / barsize.green < barsize.blue / barsize.green && barsize.red / barsize.green < barsize.blue / barsize.green
                    }
                }];
                this.lookup = {}
            }
            init() {
                const container = document.querySelector(SELECTORS.AR_CONTAINER);
                const disabled_photos_str = container.dataset.photosToDisable;
                if (disabled_photos_str) {
                    this.photos_to_disable = disabled_photos_str.split(",")
                }
                this.buildLookup()
            }
            buildLookup() {
                for (let i = 0; i < this.matchers.length; i++) {
                    const matcher = this.matchers[i];
                    if (this.photos_to_disable && this.photos_to_disable.indexOf(matcher.photo) !== -1) {
                        continue
                    }
                    const first = matcher.first;
                    const max = matcher.max;
                    if (!this.lookup[first]) {
                        this.lookup[first] = {}
                    }
                    this.lookup[first][max] = matcher
                }
            }
            getMatcherForColors(first, max) {
                if (!this.lookup[first] || !this.lookup[first][max]) {
                    return null
                }
                return this.lookup[first][max]
            }
        }
        exports.ARConfig = ARConfig
    }, {}],
    31: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        class ARState {
            constructor(initialState = {}) {
                this.state = initialState
            }
            setState(changes) {
                this.state = Object.assign({}, this.state, changes)
            }
            getState() {
                return this.state
            }
            getProperty(name) {
                return this.state[name]
            }
        }
        exports.ARState = ARState
    }, {}],
    32: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const CardCarousel_1 = require("./CardCarousel");
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const loadImageAsync_1 = require("../util/loadImageAsync");
        const CLASSES = {
            ACTIVE: "-active",
            DARK_THEME: "-dark",
            PAGE_CONTAINER: ".js-about-page",
            CAROUSEL_CONTAINER: ".js-card-carousel",
            HEADER_TEXT_CONTAINTER: ".js-header-text",
            HEADER_IMAGES: ".js-header-images",
            HEADER_IMAGE: "about--header-image",
            DOCUMENTARY_CONTAINER: ".js-doc-container",
            HEADER_IMAGE_LARGE: ".js-header-image-large"
        };
        class About {
            constructor(core) {
                this.isDarkThemeActive = false;
                this.isMobileHeaderActive = false;
                this.isDesktopHeaderActive = false;
                this.prevScroll = 0;
                this.core = core;
                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;
                this.pageContainer = document.querySelector(CLASSES.PAGE_CONTAINER);
                this.headerTextContainer = document.querySelector(CLASSES.HEADER_TEXT_CONTAINTER);
                this.headerImagesContainer = document.querySelector(CLASSES.HEADER_IMAGES);
                this.documentaryContainer = document.querySelector(CLASSES.DOCUMENTARY_CONTAINER);
                this.handleScroll = this.handleScroll.bind(this);
                this.animateHeader = this.animateHeader.bind(this);
                this.animateIntroImages = this.animateIntroImages.bind(this);
                this.setupAnimatedIntro = this.setupAnimatedIntro.bind(this);
                this.animateDarkBackground = this.animateDarkBackground.bind(this);
                this.handleResize = this.handleResize.bind(this);
                this.setupByWindowSize = this.setupByWindowSize.bind(this);
                this.setDomSizes = this.setDomSizes.bind(this)
            }
            init() {
                const carousel = document.querySelector(CLASSES.CAROUSEL_CONTAINER);
                if (carousel) {
                    this.cardCarousel = new CardCarousel_1.CardCarousel(carousel)
                }
                if (!this.headerImagesContainer) {
                    return
                }
                this.headerHeight = this.headerTextContainer.getBoundingClientRect().height;
                this.headerImagesBottom = this.headerImagesContainer.getBoundingClientRect().bottom;
                this.headerImagesHeight = this.headerImagesContainer.getBoundingClientRect().height;
                this.setupByWindowSize();
                window.addEventListener("resize", this.handleResize);
                window.addEventListener("scroll", this.handleScroll);
                window.addEventListener("load", () => {
                    this.setDomSizes();
                    if (this.documentaryContainer) {
                        this.setupDocumentaryContainer()
                    }
                })
            }
            handleResize() {
                requestAnimationFrame(this.setDomSizes);
                requestAnimationFrame(() => {
                    clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = setTimeout(() => {
                        this.setupByWindowSize()
                    }, 250)
                })
            }
            setDomSizes() {
                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;
                this.headerHeight = this.headerTextContainer.getBoundingClientRect().height;
                this.headerImagesBottom = this.headerImagesContainer.getBoundingClientRect().bottom;
                this.headerImagesHeight = this.headerImagesContainer.getBoundingClientRect().height
            }
            handleScroll() {
                requestAnimationFrame(this.animateHeader);
                requestAnimationFrame(this.animateIntroImages);
                requestAnimationFrame(this.animateDarkBackground)
            }
            setupByWindowSize() {
                if (window.innerWidth < 768) {
                    if (!this.isMobileHeaderActive) {
                        this.setupAnimatedHeader();
                        if (this.isDesktopHeaderActive) {
                            this.tearDownDesktopHeader()
                        }
                    }
                } else if (this.isMobileHeaderActive) {
                    this.tearDownMobileCarousel();
                    this.setupAnimatedIntroImages()
                } else if (!this.isDesktopHeaderActive) {
                    this.setupAnimatedIntroImages()
                }
            }
            setupAnimatedHeader() {
                this.headerTextContainer.style.position = "fixed";
                this.headerTextContainer.style.top = "64px";
                this.placeholderDiv = document.createElement("div");
                this.placeholderDiv.style.height = `${this.headerHeight}px`;
                this.headerTextContainer.parentNode.insertBefore(this.placeholderDiv, this.headerTextContainer.nextSibling);
                this.animateHeader();
                if (window.scrollY > this.headerHeight) {
                    this.headerTextContainer.style.opacity = "0"
                }
                this.isMobileHeaderActive = true
            }
            tearDownMobileCarousel() {
                this.headerTextContainer.removeAttribute("style");
                this.headerTextContainer.parentNode.removeChild(this.placeholderDiv);
                this.isMobileHeaderActive = false
            }
            animateHeader() {
                if (this.windowWidth >= 768) {
                    return
                }
                if (window.scrollY <= 10) {
                    this.headerTextContainer.style.opacity = "1";
                    return
                }
                this.headerTextContainer.style.opacity = `${this.headerHeight/(window.scrollY-10)/100}`
            }
            setupDocumentaryContainer() {
                const rect = this.documentaryContainer.getBoundingClientRect();
                this.documentaryContainerTop = rect.top + window.scrollY - window.innerHeight / 3;
                this.documentaryContainerBottom = rect.bottom + window.scrollY + window.innerHeight / 3
            }
            animateDarkBackground() {
                if (!this.isDarkThemeActive) {
                    if (window.scrollY > this.documentaryContainerTop && !(window.scrollY + window.innerHeight > this.documentaryContainerBottom)) {
                        this.pageContainer.classList.add(CLASSES.DARK_THEME);
                        this.isDarkThemeActive = true
                    }
                } else {
                    if (window.scrollY + window.innerHeight > this.documentaryContainerBottom || window.scrollY < this.documentaryContainerTop) {
                        this.pageContainer.classList.remove(CLASSES.DARK_THEME);
                        this.isDarkThemeActive = false
                    }
                }
            }
            setupAnimatedIntroImages() {
                if (window.innerWidth >= 1024) {
                    const imagePlaceholder = document.querySelector(CLASSES.HEADER_IMAGE_LARGE);
                    this.extraIntroImage = new Image;
                    this.extraIntroImage.src = imagePlaceholder.dataset.src;
                    this.extraIntroImage.classList.add(CLASSES.HEADER_IMAGE);
                    this.headerImagesContainer.appendChild(this.extraIntroImage);
                    this.extraIntroImage.onload = this.setupAnimatedIntro
                } else {
                    this.setupAnimatedIntro()
                }
            }
            setupAnimatedIntro() {
                const images = nodeListToArray_1.nodeListToArray(this.headerImagesContainer.querySelectorAll("img"));
                Promise.resolve(images.map(image => {
                    return loadImageAsync_1.loadImageAsync(image)
                })).then(() => {
                    const imageWidths = images.reduce((acc, val) => acc + val.getBoundingClientRect().width, 0);
                    this.headerImagesContainer.style.width = `${imageWidths+parseInt(getComputedStyle(images[0]).marginRight,10)*(images.length-1)}px`;
                    this.headerImagesContainer.classList.add(CLASSES.ACTIVE);
                    this.animateIntroImages();
                    this.isDesktopHeaderActive = true
                })
            }
            tearDownDesktopHeader() {
                this.headerImagesContainer.removeAttribute("style");
                this.headerImagesContainer.classList.remove(CLASSES.ACTIVE);
                this.headerImagesContainer.removeChild(this.extraIntroImage);
                this.isDesktopHeaderActive = false
            }
            animateIntroImages() {
                if (this.windowWidth < 768 || window.scrollY > this.headerImagesBottom + window.innerHeight / 2) {
                    return
                }
                if (window.scrollY <= 10) {
                    this.headerImagesContainer.style.transform = "translateX: 0";
                    return
                }
                this.headerImagesContainer.style.transform = `translateX(-${window.scrollY/4}px)`
            }
        }
        exports.About = About
    }, {
        "../util/loadImageAsync": 59,
        "../util/nodeListToArray": 61,
        "./CardCarousel": 34
    }],
    33: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const SELECTORS = {
            BLOCK_AUDIO_ELEMENT: ".js-block-audio-file",
            BLOCK_AUDIO_CONTROL: ".js-block-audio-control",
            TIME_STAMP_ELEMENT: ".js-block-audio-time-stamp",
            PERCENT_PLAYED_ELEMENT: ".js-audio-played-percent"
        };
        const CLASSES = {
            playing: "-playing",
            hidden: "-hidden"
        };
        class AudioPlayer {
            constructor(audioContainer) {
                this.container = audioContainer;
                this.blockAudioEl = audioContainer.querySelector(SELECTORS.BLOCK_AUDIO_ELEMENT);
                this.blockAudioControl = audioContainer.querySelector(SELECTORS.BLOCK_AUDIO_CONTROL);
                this.timeStampEl = audioContainer.querySelector(SELECTORS.TIME_STAMP_ELEMENT);
                this.percentPlayedEl = audioContainer.querySelector(SELECTORS.PERCENT_PLAYED_ELEMENT);
                this.blockAudioSetup = this.blockAudioSetup.bind(this);
                this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
                this.init()
            }
            init() {
                const AudioCtx = window.AudioContext || window.webkitAudioContext || false;
                this.blockAudioContext = new AudioCtx;
                this.blockAudioContext.resume();
                this.blockAudioSetup()
            }
            blockAudioSetup() {
                this.blockAudioTrack = this.blockAudioContext.createMediaElementSource(this.blockAudioEl);
                this.blockAudioTrack.connect(this.blockAudioContext.destination);
                this.blockAudioControl.addEventListener("click", this.handleAudioControl.bind(this, this.blockAudioEl));
                this.blockAudioEl.addEventListener("timeupdate", this.handleTimeUpdate)
            }
            handleAudioControl(audioEl, e) {
                e.preventDefault();
                const audioTarget = e.currentTarget;
                if (audioTarget.dataset.playing === "false") {
                    this.blockAudioContext.resume();
                    audioEl.play();
                    this.setAudioControlActive(audioTarget)
                } else if (audioTarget.dataset.playing === "true") {
                    audioEl.pause();
                    this.setAudioControlInactive(audioTarget)
                }
            }
            setAudioControlActive(el) {
                el.dataset.playing = "true";
                el.setAttribute("aria-checked", "true");
                el.setAttribute("aria-label", "Pause");
                el.classList.add(CLASSES.playing)
            }
            setAudioControlInactive(el) {
                el.dataset.playing = "false";
                el.setAttribute("aria-checked", "false");
                el.setAttribute("aria-label", "Play");
                el.classList.remove(CLASSES.playing)
            }
            calculateCurrentValue(currentTime) {
                const currentMinute = Math.round(currentTime / 60) % 60;
                const currentSecondsLong = currentTime % 60;
                const currentSeconds = Math.round(currentSecondsLong);
                const currentTimeFormatted = `${currentMinute<10?`0${currentMinute}`:currentMinute}:${currentSeconds<10?`0${currentSeconds}`:currentSeconds}`;
                return currentTimeFormatted
            }
            setPercentPlayed() {
                const time = this.blockAudioEl.currentTime;
                const duration = this.blockAudioEl.duration;
                const percentage = time / duration * 100;
                this.percentPlayedEl.style.width = `${percentage}%`
            }
            handleTimeUpdate() {
                this.timeStampEl.innerText = this.calculateCurrentValue(this.blockAudioEl.currentTime);
                this.setPercentPlayed()
            }
        }
        exports.AudioPlayer = AudioPlayer
    }, {}],
    34: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const Hammer = require("hammerjs");
        const CLASSES = {
            ACTIVE: "-active",
            INACTIVE: "-inactive",
            CARD_LIST: ".js-card-list",
            CARD: ".js-card"
        };
        class CardCarousel {
            constructor(container) {
                this.currentActiveIndex = 0;
                this.isActive = false;
                this.container = container;
                this.cardsList = this.container.querySelector(CLASSES.CARD_LIST);
                this.cards = nodeListToArray_1.nodeListToArray(this.container.querySelectorAll(CLASSES.CARD));
                this.windowSize = window.innerWidth;
                this.handleNext = this.handleNext.bind(this);
                this.handlePrevious = this.handlePrevious.bind(this);
                this.handleResize = this.handleResize.bind(this);
                this.getDomSizes = this.getDomSizes.bind(this);
                this.setupByWindowSize = this.setupByWindowSize.bind(this);
                this.handleSwipe = this.handleSwipe.bind(this);
                this.tearDown = this.tearDown.bind(this);
                this.init()
            }
            init() {
                window.addEventListener("resize", this.handleResize);
                this.getDomSizes();
                this.setupByWindowSize()
            }
            handleResize() {
                requestAnimationFrame(this.getDomSizes);
                requestAnimationFrame(this.setupByWindowSize)
            }
            setupByWindowSize() {
                if (window.innerWidth < this.containerWidth) {
                    if (!this.isActive) {
                        this.setup()
                    }
                } else if (this.isActive) {
                    this.tearDown()
                }
            }
            setup() {
                this.createButtons();
                this.cardsList.style.width = `${this.containerWidth}px`;
                this.container.classList.add(CLASSES.ACTIVE);
                this.cards[0].classList.add(CLASSES.ACTIVE);
                this.hammer = new Hammer.Manager(this.container.querySelector(CLASSES.CARD_LIST));
                this.hammer.add(new Hammer.Swipe({
                    direction: Hammer.DIRECTION_HORIZONTAL
                }));
                this.hammer.on("swipe", this.handleSwipe);
                this.isActive = true
            }
            tearDown() {
                this.leftArrow.removeEventListener("click", this.handlePrevious);
                this.rightArrow.removeEventListener("click", this.handleNext);
                this.container.removeChild(this.leftArrow);
                this.container.removeChild(this.rightArrow);
                this.cards.forEach(card => {
                    card.classList.remove(CLASSES.ACTIVE)
                });
                this.cardsList.style.width = "auto";
                this.cardsList.style.touchAction = "none";
                this.cardsList.style.transform = `translateX(0)`;
                this.cardsList.classList.remove(CLASSES.ACTIVE);
                this.container.classList.remove(CLASSES.ACTIVE);
                this.hammer.destroy();
                this.isActive = false
            }
            getDomSizes() {
                this.windowSize = window.innerWidth;
                this.cardWidth = parseInt(getComputedStyle(this.cards[0]).width, 10);
                this.cardMargin = parseInt(getComputedStyle(this.cards[0]).marginRight, 10);
                this.cardListPadding = parseInt(getComputedStyle(this.cardsList).paddingLeft, 10) * 2;
                this.containerWidth = this.cards.length * this.cardWidth + this.cardMargin * 2 * this.cards.length + this.cardListPadding;
                this.maxTranslate = this.containerWidth - this.windowSize
            }
            createButtons() {
                this.leftArrow = document.createElement("button");
                this.leftArrow.classList.add("card-carousel-arrow", "card-carousel-arrow-left", "-inactive");
                this.leftArrow.innerHTML = '<span class="-off-screen">Previous<span>';
                this.rightArrow = document.createElement("button");
                this.rightArrow.classList.add("card-carousel-arrow", "card-carousel-arrow-right");
                this.rightArrow.innerHTML = '<span class="-off-screen">Next</span>';
                this.container.appendChild(this.leftArrow);
                this.container.appendChild(this.rightArrow);
                this.leftArrow.addEventListener("click", this.handlePrevious);
                this.rightArrow.addEventListener("click", this.handleNext)
            }
            handlePrevious() {
                this.rightArrow.classList.remove(CLASSES.INACTIVE);
                if (this.currentActiveIndex < 1) {
                    this.leftArrow.classList.add(CLASSES.INACTIVE);
                    return
                }
                const translateAmount = (this.cardWidth + this.cardMargin) * (this.currentActiveIndex - 1);
                if (translateAmount > this.maxTranslate) {
                    this.currentActiveIndex--;
                    this.handlePrevious();
                    this.leftArrow.classList.add(CLASSES.INACTIVE);
                    return
                }
                this.cardsList.style.transform = `translateX(-${translateAmount}px)`;
                this.currentActiveIndex--;
                this.setActiveCard(this.currentActiveIndex);
                this.container.dispatchEvent(new CustomEvent("update", {
                    bubbles: true,
                    detail: {
                        activeIndex: this.currentActiveIndex
                    }
                }));
                if (this.currentActiveIndex < 1) {
                    this.leftArrow.classList.add(CLASSES.INACTIVE)
                }
            }
            handleNext() {
                this.leftArrow.classList.remove(CLASSES.INACTIVE);
                if (this.currentActiveIndex >= this.cards.length - 1) {
                    return
                }
                const translateAmount = (this.cardWidth + this.cardMargin * 2) * (this.currentActiveIndex + 1);
                this.cardsList.style.transform = `translateX(-${translateAmount>this.maxTranslate?this.maxTranslate:translateAmount}px)`;
                this.currentActiveIndex = translateAmount > this.maxTranslate ? this.cards.length - 1 : this.currentActiveIndex + 1;
                this.setActiveCard(this.currentActiveIndex);
                this.container.dispatchEvent(new CustomEvent("update", {
                    bubbles: true,
                    detail: {
                        activeIndex: this.currentActiveIndex
                    }
                }));
                if (this.currentActiveIndex === this.cards.length || translateAmount > this.maxTranslate) {
                    this.rightArrow.classList.add(CLASSES.INACTIVE)
                }
            }
            setActiveCard(activeIndex) {
                this.cards.forEach((card, index) => {
                    if (activeIndex === index) {
                        card.classList.add(CLASSES.ACTIVE)
                    } else {
                        card.classList.remove(CLASSES.ACTIVE)
                    }
                })
            }
            handleSwipe(e) {
                const direction = e.offsetDirection;
                if (direction === 4) {
                    this.handlePrevious()
                }
                if (direction === 2) {
                    this.handleNext()
                }
            }
        }
        exports.CardCarousel = CardCarousel
    }, {
        "../util/nodeListToArray": 61,
        hammerjs: 26
    }],
    35: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const Home_1 = require("./Home");
        const AR_1 = require("./AR");
        const About_1 = require("./About");
        const PhotoPage_1 = require("./PhotoPage");
        const Story_1 = require("./Story");
        const Header_1 = require("./Header");
        // const ShareModal_1 = require("./ShareModal");
        exports.MOBILE_BREAKPOINT = "only screen and (max-width: 767px), only screen and (max-height: 415px)";
        exports.TABLET_BREAKPOINT = "only screen and (max-width: 1025px)";
        exports.LANDSCAPE_QUERY = "screen and (orientation: landscape)";
        class Core {
            constructor() {
                this.mobileMediaQuery = window.matchMedia(exports.MOBILE_BREAKPOINT);
                this.tabletMediaQuery = window.matchMedia(exports.TABLET_BREAKPOINT);
                this.landscapeMediaQuery = window.matchMedia(exports.LANDSCAPE_QUERY);
                this.handleTouch = this.handleTouch.bind(this);
                this.checkMobile = this.checkMobile.bind(this);
                this.page = document.body.dataset["page"]
            }
            init() {
                window.addEventListener("resize", this.checkMobile);
                window.addEventListener("touchstart", this.handleTouch);
                this.checkMobile();
                if (!this.page) {
                    return
                }
                if (this.page === "activate") {
                    this.aRExperience = new AR_1.ARExperience(this.isMobile);
                    this.aRExperience.init();
                    return
                }
                new Header_1.Header(this);
                switch (this.page) {
                    case "home":
                        this.home = new Home_1.HomePage(this);
                        this.home.init();
                        break;
                    case "story":
                        this.story = new Story_1.StoryPage(this);
                        this.story.init();
                        // new ShareModal_1.ShareModal;
                        break;
                    case "how-it-works":
                    case "about":
                        this.about = new About_1.About(this);
                        this.about.init();
                        break;
                    case "photo":
                        this.photoPage = new PhotoPage_1.PhotoPage(this);
                        this.photoPage.init();
                        break;
                    default:
                        console.log("Core: Cannot handle this.page:", this.page);
                        break
                }
            }
            handleTouch() {
                document.documentElement.classList.add("touch");
                window.removeEventListener("touchstart", this.handleTouch)
            }
            checkMobile() {
                this.viewportHeight = document.documentElement.clientHeight;
                this.viewportWidth = document.documentElement.clientWidth;
                this.isMobile = this.mobileMediaQuery.matches;
                this.isTablet = this.tabletMediaQuery.matches;
                this.isLandscape = this.landscapeMediaQuery.matches;
                this.isTouchDevice = "ontouchstart" in document.documentElement ? true : false
            }
        }
        exports.default = Core
    }, {
        "./AR": 29,
        "./About": 32,
        "./Header": 39,
        "./Home": 40,
        "./PhotoPage": 42,
        // "./ShareModal": 44,
        "./Story": 47
    }],
    36: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const rgbToHsv_1 = require("../util/rgbToHsv");
        const isGoogleColor_1 = require("../util/isGoogleColor");
        const ARConfig_1 = require("./ARConfig");
        const DEBUG_COLOR_OVERLAY = false;
        const DEBUG_MARKER_OVERLAY = false;
        class DetectColorBars {
            constructor(state, canvas, vidCanvas, videoStream, onDetected, logMethod) {
                this.barOrderUnchanged = false;
                this.visitedPixels = [];
                this.colorBarStartPoint = [];
                this.colorBarEndPoint = [];
                this.markerStability = 0;
                this.stableFrames = 0;
                this.currentColorOrder = [];
                this.state = state;
                this.canvas = canvas;
                this.vidCanvas = vidCanvas;
                this.videoStream = videoStream;
                this.onDetected = onDetected;
                this.detectImage = this.detectImage.bind(this);
                this.checkForColor = this.checkForColor.bind(this);
                this.getColor = this.getColor.bind(this);
                this.config = new ARConfig_1.ARConfig;
                this.log = logMethod;
                this.init()
            }
            init() {
                this.config.init();
                this.vidCanvasContext = this.vidCanvas.getContext("2d");
                this.canvasContext = this.canvas.getContext("2d");
                this.updatePixels()
            }
            updatePixels() {
                this.pixels = this.vidCanvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height).data
            }
            checkForColor(i, j, markerInfo) {
                if (i >= this.canvas.width || i < 0 || j >= this.canvas.height || j < this.canvas.height * (1 / 3)) {
                    return
                }

                function findMode(list) {
                    return list.sort((a, b) => list.filter(x => x === a).length - list.filter(y => y === b).length).pop()
                }
                const color = this.getColor(i, j);
                const [h, s, v] = rgbToHsv_1.rgbToHsv(color.r / 255, color.g / 255, color.b / 255);
                this.visitedPixels[i][j] = 1;
                const googleColor = isGoogleColor_1.isGoogleColor(h, s, v);
                if (googleColor !== "none") {
                    markerInfo.colorBleeding.push(googleColor);
                    markerInfo.xValues.push(i);
                    markerInfo.yValues.push(j);
                    if (!markerInfo.colorOrder.some(x => x === googleColor)) {
                        markerInfo.colorOrder.push(googleColor)
                    }
                    markerInfo.first = markerInfo.colorOrder[0];
                    markerInfo.coloredPixels.push([i, j]);
                    const len = markerInfo.colorOrder.length - 1;
                    if (markerInfo.colorOrder[len] === googleColor) {
                        this.getWidthOfColors(googleColor, i, markerInfo.colorSizes)
                    }
                    if (i + 1 < this.canvas.width && !this.visitedPixels[i + 1][j]) {
                        this.checkForColor(i + 1, j, markerInfo)
                    }
                    if (j + 1 < this.canvas.height && !this.visitedPixels[i][j + 1]) {
                        this.checkForColor(i, j + 1, markerInfo)
                    }
                    if (j - 1 >= 0 && !this.visitedPixels[i][j - 1]) {
                        this.checkForColor(i, j - 1, markerInfo)
                    }
                    if (i + 3 < this.canvas.width && !this.visitedPixels[i + 2][j]) {
                        this.checkForColor(i + 2, j, markerInfo)
                    }
                    if (i + 5 < this.canvas.width && !this.visitedPixels[i + 3][j]) {
                        this.checkForColor(i + 3, j, markerInfo)
                    }
                }
            }
            getWidthOfColors(googleColor, x, counter) {
                if (googleColor === "yellow") {
                    if (!counter.yellow.some(i => i === x)) {
                        counter.yellow.push(x)
                    }
                }
                if (googleColor === "blue") {
                    if (!counter.blue.some(i => i === x)) {
                        counter.blue.push(x)
                    }
                }
                if (googleColor === "green") {
                    if (!counter.green.some(i => i === x)) {
                        counter.green.push(x)
                    }
                }
                if (googleColor === "red") {
                    if (!counter.red.some(i => i === x)) {
                        counter.red.push(x)
                    }
                }
            }
            getColor(x, y) {
                const base = (y * this.canvas.width + x) * 4;
                const c = {
                    r: this.pixels[base + 0],
                    g: this.pixels[base + 1],
                    b: this.pixels[base + 2],
                    a: this.pixels[base + 3]
                };
                return c
            }
            checkColorOrder(markerInfo) {
                let color_combo = markerInfo.colorOrder.toString();
                const combos_to_switch = {
                    "red,yellow,blue,green": ["red", "yellow", "green", "blue"],
                    "green,red,yellow,blue": ["blue", "red", "yellow", "green"],
                    "blue,green,red,yellow": ["green", "blue", "red", "yellow"],
                    "yellow,blue,green,red": ["yellow", "green", "blue", "red"],
                    "yellow,blue,blue,red": ["yellow", "green", "blue", "red"],
                    "yellow,green,green,red": ["yellow", "green", "blue", "red"],
                    "green,green,red,yellow": ["green", "blue", "red", "yellow"],
                    "blue,blue,red,yellow": ["green", "blue", "red", "yellow"],
                    "red,yellow,blue,blue": ["red", "yellow", "green", "blue"],
                    "red,yellow,green,green": ["red", "yellow", "green", "blue"],
                    "green,red,yellow,green": ["blue", "red", "yellow", "green"],
                    "blue,red,yellow,blue": ["blue", "red", "yellow", "green"]
                };
                const bad_combos = Object.keys(combos_to_switch);
                for (const bad_combo of bad_combos) {
                    if (color_combo === bad_combo) {
                        const replacement = combos_to_switch[bad_combo];
                        this.log(`Bad combo: ${bad_combo} | ` + `switched for ${replacement.join(",")}`);
                        markerInfo.colorOrder = replacement;
                        color_combo = replacement.join(",");
                        this.switchBlueAndGreenInMarkerInfo(markerInfo);
                        break
                    }
                }
                return color_combo
            }
            switchBlueAndGreenInMarkerInfo(markerInfo) {
                const temp = markerInfo.colorSizes.blue;
                markerInfo.colorSizes.blue = markerInfo.colorSizes.green;
                markerInfo.colorSizes.green = temp
            }
            debugColorDetection() {
                if (!DEBUG_COLOR_OVERLAY) {
                    return
                }
                for (let i = 0; i < this.canvas.width; i++) {
                    for (let j = 0; j < this.canvas.height; j++) {
                        const index = (j * this.canvas.width + i) * 4;
                        const r = this.pixels[index];
                        const g = this.pixels[index + 1];
                        const b = this.pixels[index + 2];
                        const hsv = rgbToHsv_1.rgbToHsv(r / 255, g / 255, b / 255);
                        const color = isGoogleColor_1.isGoogleColor(hsv[0], hsv[1], hsv[2]);
                        if (color === "blue") {
                            this.canvasContext.fillStyle = "#0000ff"
                        } else if (color === "green") {
                            this.canvasContext.fillStyle = "#00ff00"
                        } else if (color === "red") {
                            this.canvasContext.fillStyle = "#ff0000"
                        } else if (color === "yellow") {
                            this.canvasContext.fillStyle = "#ffff00"
                        }
                        if (color !== "none") {
                            this.canvasContext.fillRect(i, j, 1, 1)
                        }
                    }
                }
            }
            debugMarkerInfo(markerInfo, color) {
                if (!DEBUG_MARKER_OVERLAY) {
                    return
                }
                for (let k = 0; k < markerInfo.coloredPixels.length; k++) {
                    const a = markerInfo.coloredPixels[k];
                    this.canvasContext.fillStyle = color;
                    this.canvasContext.fillRect(a[0], a[1], 1, 1)
                }
            }
            applyColorCorrection() {
                let accum = [0, 0, 0];
                let bright = [0, 0, 0];
                for (let i = 0; i < this.canvas.width; i++) {
                    for (let j = 0; j < this.canvas.height; j++) {
                        const index = (j * this.canvas.width + i) * 4;
                        const r = this.pixels[index];
                        const g = this.pixels[index + 1];
                        const b = this.pixels[index + 2];
                        accum[0] += r;
                        accum[1] += g;
                        accum[2] += b;
                        bright[0] = Math.max(bright[0], r);
                        bright[1] = Math.max(bright[1], g);
                        bright[2] = Math.max(bright[2], b)
                    }
                }
                const minChannel = Math.min(accum[0], accum[1], accum[2]);
                const NO_DIV_BY_ZERO = 1;
                const mults = [minChannel / Math.max(accum[0], NO_DIV_BY_ZERO), minChannel / Math.max(accum[1], NO_DIV_BY_ZERO), minChannel / Math.max(accum[2], NO_DIV_BY_ZERO)];
                const brightest = Math.max(bright[0] * mults[0], bright[1] * mults[1], bright[2] * mults[2]);
                if (brightest < 255) {
                    mults[0] *= 255 / brightest;
                    mults[1] *= 255 / brightest;
                    mults[2] *= 255 / brightest
                }
                for (let i = 0; i < this.canvas.width; i++) {
                    for (let j = 0; j < this.canvas.height; j++) {
                        const index = (j * this.canvas.width + i) * 4;
                        this.pixels[index] *= mults[0];
                        this.pixels[index + 1] *= mults[1];
                        this.pixels[index + 2] *= mults[2]
                    }
                }
            }
            shouldPatchColors(prevXs, prevYs, currXs, currYs) {
                const prevYsLastIndex = prevYs.length - 1;
                const prevXSum = prevXs.reduce(function (a, b) {
                    return a + b
                });
                const prevXAvg = prevXSum / prevXs.length;
                const currXSum = currXs.reduce(function (a, b) {
                    return a + b
                });
                const currXAvg = currXSum / currXs.length;
                return currXAvg > prevXAvg && Math.abs(currYs[0] - prevYs[prevYsLastIndex]) < 5
            }
            detectColorBlocks() {
                const colorBlocks = [];
                for (let i = 0; i < this.canvas.width; i++) {
                    for (let j = this.canvas.height - 1; j >= this.canvas.height * (1 / 3); j--) {
                        if (this.visitedPixels[i][j]) {
                            continue
                        }
                        const colorBlock = [];
                        const colorsInBlock = [];
                        const allColors = [];
                        const xValues = [];
                        const yValues = [];
                        const counter = {
                            yellow: [],
                            green: [],
                            red: [],
                            blue: []
                        };
                        const markerInfo = {
                            colorSizes: counter,
                            coloredPixels: colorBlock,
                            colorOrder: colorsInBlock,
                            colorBleeding: allColors,
                            xValues: xValues,
                            yValues: yValues,
                            first: ""
                        };
                        this.checkForColor(i, j, markerInfo);
                        markerInfo.xValues.sort();
                        markerInfo.yValues.sort();
                        this.debugMarkerInfo(markerInfo, "orange");
                        const order = markerInfo.colorOrder;
                        const pixels = markerInfo.coloredPixels;
                        const colors = markerInfo.colorBleeding;
                        if (markerInfo.coloredPixels.length > 20) {
                            let stringArray = this.checkColorOrder(markerInfo);
                            if (stringArray === "red,yellow,green,blue" || stringArray === "blue,red,yellow,green" || stringArray === "green,blue,red,yellow" || stringArray === "yellow,green,blue,red") {
                                colorBlocks.push(markerInfo)
                            } else if (this.prevMarker !== undefined) {
                                if (this.shouldPatchColors(this.prevMarker.xValues, this.prevMarker.yValues, markerInfo.xValues, markerInfo.yValues)) {
                                    const numOfColors = this.prevMarker.colorOrder.length + markerInfo.colorOrder.length;
                                    if (numOfColors === 4) {
                                        const previousColors = this.prevMarker.colorOrder.toString();
                                        stringArray = previousColors + "," + stringArray;
                                        markerInfo.colorOrder = this.prevMarker.colorOrder.concat(order);
                                        markerInfo.coloredPixels = this.prevMarker.coloredPixels.concat(pixels);
                                        stringArray = this.checkColorOrder(markerInfo);
                                        if (stringArray === "red,yellow,green,blue" || stringArray === "blue,red,yellow,green" || stringArray === "green,blue,red,yellow" || stringArray === "yellow,green,blue,red") {
                                            markerInfo.colorOrder = this.prevMarker.colorOrder.concat(order);
                                            markerInfo.coloredPixels = this.prevMarker.coloredPixels.concat(pixels);
                                            markerInfo.colorBleeding = this.prevMarker.colorBleeding.concat(colors);
                                            if (markerInfo.colorSizes.blue.length === 0) {
                                                markerInfo.colorSizes.blue = this.prevMarker.colorSizes.blue
                                            }
                                            if (markerInfo.colorSizes.red.length === 0) {
                                                markerInfo.colorSizes.red = this.prevMarker.colorSizes.red
                                            }
                                            if (markerInfo.colorSizes.yellow.length === 0) {
                                                markerInfo.colorSizes.yellow = this.prevMarker.colorSizes.yellow
                                            }
                                            if (markerInfo.colorSizes.green.length === 0) {
                                                markerInfo.colorSizes.green = this.prevMarker.colorSizes.green
                                            }
                                            colorBlocks.push(markerInfo);
                                            this.prevMarker = undefined
                                        }
                                    } else {
                                        const previousColors = this.prevMarker.colorOrder.toString();
                                        stringArray = previousColors + "," + stringArray;
                                        markerInfo.colorOrder = this.prevMarker.colorOrder.concat(order);
                                        markerInfo.coloredPixels = this.prevMarker.coloredPixels.concat(pixels);
                                        this.prevMarker.xValues.concat(markerInfo.xValues);
                                        this.prevMarker.yValues.concat(markerInfo.yValues);
                                        if (markerInfo.colorSizes.blue.length === 0) {
                                            markerInfo.colorSizes.blue = this.prevMarker.colorSizes.blue
                                        }
                                        if (markerInfo.colorSizes.red.length === 0) {
                                            markerInfo.colorSizes.red = this.prevMarker.colorSizes.red
                                        }
                                        if (markerInfo.colorSizes.yellow.length === 0) {
                                            markerInfo.colorSizes.yellow = this.prevMarker.colorSizes.yellow
                                        }
                                        if (markerInfo.colorSizes.green.length === 0) {
                                            markerInfo.colorSizes.green = this.prevMarker.colorSizes.green
                                        }
                                        this.prevMarker = markerInfo
                                    }
                                } else {
                                    this.prevMarker = markerInfo
                                }
                                this.debugMarkerInfo(markerInfo, "purple")
                            } else {
                                this.prevMarker = markerInfo
                            }
                        }
                    }
                }
                return colorBlocks
            }
            detectImage() {
                if (DEBUG_COLOR_OVERLAY || DEBUG_MARKER_OVERLAY) {
                    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
                }
                this.visitedPixels = Array.from(Array(this.canvas.width), _ => Array(this.canvas.height).fill(0));
                const tempContext = this.vidCanvasContext;
                tempContext.filter = "blur(1px)";
                this.vidCanvasContext.drawImage(this.videoStream, 0, 0, this.canvas.width, this.canvas.height);
                this.updatePixels();
                this.applyColorCorrection();
                const colorBlocks = this.detectColorBlocks();
                if (this.barOrderUnchanged && colorBlocks.length === 0) {
                    this.markerStability += 1
                }
                for (let i = 0; i < colorBlocks.length; i++) {
                    let stringArray0;
                    let stringArray1;
                    if (this.barOrderUnchanged) {
                        this.stableFrames += 1;
                        stringArray0 = this.currentColorOrder.toString();
                        stringArray1 = colorBlocks[i].colorOrder.toString()
                    }
                    if (this.markerStability > 0 && stringArray0 === stringArray1) {
                        this.stableFrames = 1
                    }
                    if (this.barOrderUnchanged && stringArray0 !== stringArray1) {
                        this.barOrderUnchanged = false;
                        this.stableFrames = 0
                    }
                    if (!this.barOrderUnchanged) {
                        this.currentColorOrder = colorBlocks[i].colorOrder;
                        this.barOrderUnchanged = true;
                        this.stableFrames += 1;
                        this.markerStability = 0
                    }
                    this.colorBarTopY = colorBlocks[i].coloredPixels[0][1];
                    this.colorBarBottomY = colorBlocks[i].coloredPixels[0][1];
                    this.colorBarStartPoint = colorBlocks[i].coloredPixels[0];
                    this.colorBarEndPoint = [0, 0];
                    for (let j = 0; j < colorBlocks[i].coloredPixels.length; j++) {
                        const a = colorBlocks[i].coloredPixels[j];
                        if (a[0] > this.colorBarEndPoint[0]) {
                            this.colorBarEndPoint = a
                        }
                        if (a[1] < this.colorBarTopY) {
                            this.colorBarTopY = a[1]
                        }
                        if (a[1] > this.colorBarBottomY) {
                            this.colorBarBottomY = a[1]
                        }
                    }
                    this.state.setState({
                        markerBounds: {
                            colorBarTopY: this.colorBarTopY,
                            colorBarBottomY: this.colorBarBottomY
                        },
                        colors: {
                            colorBarStartPoint: this.colorBarStartPoint,
                            colorBarEndPoint: this.colorBarEndPoint
                        }
                    });
                    let max = "";
                    let maxVal = 0;
                    const yellowDelta = this.rangeDelta(colorBlocks[i].colorSizes.yellow, "yellow");
                    const greenDelta = this.rangeDelta(colorBlocks[i].colorSizes.green, "green");
                    const blueDelta = this.rangeDelta(colorBlocks[i].colorSizes.blue, "blue");
                    const redDelta = this.rangeDelta(colorBlocks[i].colorSizes.red, "red");
                    if (yellowDelta < 1 || greenDelta < 1 || blueDelta < 1 || redDelta < 1) {
                        return
                    }
                    if (yellowDelta > maxVal) {
                        max = "yellow";
                        maxVal = yellowDelta
                    }
                    if (greenDelta > maxVal) {
                        max = "green";
                        maxVal = greenDelta
                    }
                    if (blueDelta > maxVal) {
                        max = "blue";
                        maxVal = blueDelta
                    }
                    if (redDelta > maxVal) {
                        max = "red";
                        maxVal = redDelta
                    }
                    if (maxVal < 60) {
                        return
                    }
                    if (this.stableFrames === 1) {
                        this.barOrderUnchanged = false;
                        const order = colorBlocks[i].colorOrder;
                        const first = colorBlocks[i].first;
                        this.log("ORDER: " + order.join(","), 2);
                        const bar_sizes = {
                            yellow: yellowDelta,
                            blue: blueDelta,
                            green: greenDelta,
                            red: redDelta
                        };
                        const photo = this.checkMatch(first, max, bar_sizes);
                        if (photo) {
                            this.onDetected(photo)
                        }
                    }
                }
            }
            rangeDelta(range, color) {
                const max = Math.max.apply(null, range);
                const min = Math.min.apply(null, range);
                return max - min
            }
            checkMatch(first, max, bar_sizes) {
                const matcher = this.config.getMatcherForColors(first, max);
                this.log(`FIRST: ${first} | MAX: ${max} |\n      R: ${bar_sizes.red} B: ${bar_sizes.blue}\n      G: ${bar_sizes.green} Y: ${bar_sizes.yellow}`, 2);
                if (!matcher) {
                    this.log(`NO MATCHER FOR FIRST: ${first} | MAX: ${max}`)
                } else if (matcher.test(bar_sizes)) {
                    this.log("BARS HIT: " + matcher.photo);
                    return matcher.photo
                } else {
                    this.log("BARS MISS: " + matcher.photo);
                    return ""
                }
            }
        }
        exports.DetectColorBars = DetectColorBars
    }, {
        "../util/isGoogleColor": 57,
        "../util/rgbToHsv": 63,
        "./ARConfig": 30
    }],
    37: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const pixelmatch = require("pixelmatch");
        const addImages_1 = require("../util/addImages");
        class DetectPhotoMatch {
            constructor(state, canvasHeight, canvasWidth, vidCanvas, debug, debugPhotoContainer, logMethod) {
                this.state = state;
                this.canvasHeight = canvasHeight;
                this.canvasWidth = canvasWidth;
                this.vidCanvas = vidCanvas;
                this.isMobile = window.innerWidth < 768;
                this.colors = this.state.getProperty("colors");
                this.markerBounds = this.state.getProperty("markerBounds");
                this.photoBounds = this.state.getProperty("photoBounds");
                this.debug = debug;
                this.debugPhotoContainer = debugPhotoContainer;
                this.log = logMethod;
                this.snapPicture = this.snapPicture.bind(this)
            }
            snapPicture(name) {
                const photo = addImages_1.getImages(name);
                let ratio = photo.aspectRatio;
                const width = this.colors.colorBarEndPoint[0] - this.colors.colorBarStartPoint[0];
                const height = ratio * width;
                this.photoBounds = {
                    leftX: this.colors.colorBarStartPoint[0],
                    rightX: this.colors.colorBarEndPoint[0],
                    topY: this.markerBounds.colorBarBottomY - height,
                    bottomY: this.markerBounds.colorBarBottomY
                };
                if (height === 0 || width < 20) {
                    return false
                }
                if (this.photoBounds.topY < 0) {
                    this.photoBounds.topY = 0
                }
                if (this.photoBounds.bottomY >= this.canvasHeight) {
                    this.photoBounds.bottomY = this.canvasHeight - 1
                }
                if (this.photoBounds.leftX < 0) {
                    this.photoBounds.leftX = 0
                }
                if (this.photoBounds.rightX >= this.canvasWidth) {
                    this.photoBounds.rightX = this.canvasWidth - 1
                }
                this.state.setState({
                    photoBounds: this.photoBounds
                });
                const photoCanvas = document.createElement("canvas");
                if (this.debug && this.debugPhotoContainer) {
                    photoCanvas.width = width;
                    photoCanvas.height = height;
                    this.debugPhotoContainer.appendChild(photoCanvas)
                }
                const photoCanvasCtx = photoCanvas.getContext("2d");
                const snapshotCanvas = document.createElement("canvas");
                const snapshotCanvasCtx = snapshotCanvas.getContext("2d");
                snapshotCanvas.width = width;
                snapshotCanvas.height = height;
                snapshotCanvasCtx.drawImage(photo.image, 0, 0, photo.image.width, photo.image.height, 0, 0, width, height);
                photoCanvasCtx.drawImage(this.vidCanvas, this.photoBounds.leftX, this.photoBounds.topY, width, height, 0, 0, width, height);
                const img1 = snapshotCanvasCtx.getImageData(0, 0, width, height);
                const img1Data = Array.prototype.slice.call(img1.data);
                const img2 = photoCanvasCtx.getImageData(0, 0, width, height);
                const img2Data = Array.prototype.slice.call(img2.data);
                const pixelDiff = pixelmatch(img1Data, img2Data, null, width, height, {
                    threshold: .2,
                    includeAA: true
                });
                let percentage_diff = pixelDiff / (width * height) * 100;
                this.log(`PHOTO COMPARE: ${Math.round(percentage_diff)}% difference`, 2);
                if (!this.isMobile) {
                    if (percentage_diff < 80) {
                        return true
                    } else {
                        return false
                    }
                }
                if (name === "sailors") {
                    if (percentage_diff < 75) {
                        return true
                    } else {
                        return false
                    }
                }
                if (percentage_diff < 70) {
                    return true
                } else {
                    return false
                }
            }
        }
        exports.DetectPhotoMatch = DetectPhotoMatch
    }, {
        "../util/addImages": 53,
        pixelmatch: 28
    }],
    38: [function (require, module, exports) {
        "use strict";
        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function (resolve) {
                        resolve(result.value)
                    }).then(fulfilled, rejected)
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next())
            })
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const mathUtil_1 = require("../util/mathUtil");
        const transitionToPromise_1 = require("../util/transitionToPromise");
        const Point_1 = require("../util/Point");
        const DISTANCE_MIN = 50;
        const DISTANCE_MAX = 100;
        const DISTANCE_SPEED_MAX = .1;
        const SPIN_SPEED_MAX = .1;
        const PARALLAX_AMOUNT = 70;
        const STOP_TIME = .6;
        class DriftMotion {
            constructor(elements, isMouseReactive) {
                this.isAlive = true;
                this.lastTick = new Date;
                this.mouseRatio = new Point_1.Point(0, 0);
                this.mouseRatioAmt = 0;
                this.distanceMult = 1;
                this.distanceRampUp = 1;
                this.speedMult = 1;
                const rand = (low, high) => {
                    return low + Math.random() * (high - low)
                };
                const randBi = (low, high) => {
                    return rand(low, high) * (Math.random() < .5 ? 1 : -1)
                };
                const parallaxValues = [];
                for (let i = 0; i < elements.length; i++) {
                    parallaxValues.push(rand(.2, 1) * PARALLAX_AMOUNT)
                }
                parallaxValues.sort();
                this.drifters = elements.map(element => {
                    const distanceRange = DISTANCE_MAX - DISTANCE_MIN;
                    return {
                        element: element,
                        parallax: parallaxValues.shift(),
                        distanceMin: DISTANCE_MIN + distanceRange * rand(0, .4),
                        distanceMax: DISTANCE_MAX - distanceRange * rand(0, .4),
                        distanceSpeed: DISTANCE_SPEED_MAX * rand(.5, 1),
                        spinSpeed: SPIN_SPEED_MAX * randBi(.5, 1),
                        elapsed: rand(0, 1e3)
                    }
                });
                if (isMouseReactive) {
                    this.handleMouseLeave = this.handleMouseLeave.bind(this);
                    this.handleMouseMove = this.handleMouseMove.bind(this);
                    document.addEventListener("mouseleave", this.handleMouseLeave);
                    document.addEventListener("mousemove", this.handleMouseMove)
                }
                this.tick = this.tick.bind(this);
                requestAnimationFrame(this.tick)
            }
            handleMouseLeave(event) {
                this.mouseRatioAmt = 0
            }
            handleMouseMove(event) {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                const newMouseRatio = new Point_1.Point(mathUtil_1.unipolarToBipolar(mouseX / windowWidth), mathUtil_1.unipolarToBipolar(mouseY / windowHeight));
                if (windowWidth < windowHeight) {
                    newMouseRatio.y *= windowHeight / windowWidth
                } else {
                    newMouseRatio.x *= windowWidth / windowHeight
                }
                this.mouseRatioAmt = Math.min(this.mouseRatioAmt + .05, 1);
                this.mouseRatio.lerp(newMouseRatio, this.mouseRatioAmt)
            }
            tick() {
                if (!this.isAlive) {
                    return
                }
                const now = new Date;
                let elapsed = (now.getTime() - this.lastTick.getTime()) * (1 / 1e3);
                elapsed = Math.min(elapsed, .1);
                this.lastTick = now;
                this.distanceRampUp = Math.min(this.distanceRampUp + elapsed * .1, 1);
                const distanceMult = this.distanceMult * this.distanceRampUp;
                this.drifters.forEach(drifter => {
                    drifter.elapsed += elapsed * this.speedMult;
                    let distance = mathUtil_1.lerp(drifter.distanceMin, drifter.distanceMax, mathUtil_1.sin01(drifter.distanceSpeed * drifter.elapsed));
                    distance *= distanceMult;
                    const angle = drifter.spinSpeed * drifter.elapsed;
                    const offset = new Point_1.Point(distance * Math.cos(angle), distance * Math.sin(angle));
                    offset.x -= this.mouseRatio.x * drifter.parallax;
                    offset.y -= this.mouseRatio.y * drifter.parallax;
                    drifter.element.style.transform = `translate(${offset.x}px, ${offset.y}px)`
                });
                requestAnimationFrame(this.tick)
            }
            stop() {
                this.drifters.forEach(drifter => __awaiter(this, void 0, void 0, function* () {
                    drifter.element.style.transition = `transform ${STOP_TIME} ease-in-out`;
                    yield transitionToPromise_1.delayOneFrame();
                    transitionToPromise_1.animate(drifter.element, {
                        transform: "translate(0, 0)"
                    })
                }));
                this.destroy()
            }
            destroy() {
                this.isAlive = false;
                this.drifters = [];
                document.removeEventListener("mouseleave", this.handleMouseLeave);
                document.removeEventListener("mousemove", this.handleMouseMove)
            }
        }
        exports.default = DriftMotion
    }, {
        "../util/Point": 51,
        "../util/mathUtil": 60,
        "../util/transitionToPromise": 65
    }],
    39: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const SELECTORS = {
            HEADER_CONTAINER: ".js-sticky-header",
            HEADER_NAV_EL: ".js-header-nav",
            BACKGROUND_SCRIM: ".js-background-scrim"
        };
        const CLASSES = {
            IS_MOBILE: "-mobile",
            ACTIVE: "-active",
            SHOW_NAV: "-scroll-show",
            HIDE_NAV: "-scroll-hide"
        };
        class Header {
            constructor(core) {
                this.popupMenu = false;
                this.hasFocus = false;
                this.hasHover = false;
                this.keyCode = Object.freeze({
                    TAB: 9,
                    RETURN: 13,
                    ESC: 27,
                    SPACE: 32,
                    PAGEUP: 33,
                    PAGEDOWN: 34,
                    END: 35,
                    HOME: 36,
                    LEFT: 37,
                    UP: 38,
                    RIGHT: 39,
                    DOWN: 40
                });
                this.menuitems = [];
                this.menuHasFocus = false;
                this.menuHasHover = false;
                this.stickyNavActive = false;
                this.mobileNavActive = false;
                this.verticalScrollThreshold = 80;
                this.isUserScrolling = false;
                this.throttleTimeout = 0;
                this.scrollTolerance = 20;
                this.setFocusToNextItem = function (currentItem) {
                    let index;
                    if (currentItem === this.lastMenuItem) {
                        this.firstMenuItem.focus()
                    } else {
                        index = this.menuitems.indexOf(currentItem);
                        this.menuitems[index + 1].focus()
                    }
                };
                this.core = core;
                this.headerNav = document.querySelector(SELECTORS.HEADER_NAV_EL);
                this.headerContainer = document.querySelector(SELECTORS.HEADER_CONTAINER);
                this.backgroundScrim = document.querySelector(SELECTORS.BACKGROUND_SCRIM);
                if (!this.headerNav) {
                    return
                }
                this.headerNavUl = this.headerNav.querySelector("ul");
                this.isMobile = core.isMobile;
                this.checkMobile = core.checkMobile;
                this.handleResize = this.handleResize.bind(this);
                this.checkMenuStatus = this.checkMenuStatus.bind(this);
                this.handleScroll = this.handleScroll.bind(this);
                this.setStickyState = this.setStickyState.bind(this);
                this.handleKeydown = this.handleKeydown.bind(this);
                this.handleClick = this.handleClick.bind(this);
                this.handleBlur = this.handleBlur.bind(this);
                this.handleFocus = this.handleFocus.bind(this);
                this.openPopupMenu = this.openPopupMenu.bind(this);
                this.closePopupMenu = this.closePopupMenu.bind(this);
                this.init()
            }
            init() {
                if (this.isMobile) {
                    this.setUpMobileMenu();
                    this.attachHandleFocus();
                    this.setupPopupMenu();
                    this.mobileNavActive = true
                }
                if (!document.body.classList.contains("body-home")) {
                    this.setUpStickyMenu()
                }
                window.addEventListener("resize", this.handleResize)
            }
            handleResize() {
                requestAnimationFrame(this.checkMenuStatus)
            }
            checkMenuStatus() {
                this.checkMobile();
                if (this.core.isMobile && !this.mobileNavActive) {
                    this.setUpMobileMenu();
                    this.attachHandleFocus();
                    this.setupPopupMenu();
                    this.mobileNavActive = true;
                    return
                }
                if (!this.core.isMobile && this.mobileNavActive) {
                    this.destroyMobileMenu();
                    this.destroyPopupMenu();
                    this.mobileNavActive = false
                }
            }
            setUpMobileMenu() {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "18");
                svg.setAttribute("height", "12");
                svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
                svg.innerHTML = `<path d="M0 0h18v2H0V0zm0 5h18v2H0V5zm0 7v-2h18v2H0z"\n        fill="#5F6368"\n        fill-rule="evenodd"/>`;
                this.headerNav.classList.add(CLASSES.IS_MOBILE);
                this.headerNavUl.setAttribute("aria-expanded", "false");
                nodeListToArray_1.nodeListToArray(this.headerNavUl.querySelectorAll("a")).forEach(link => {
                    link.setAttribute("tabindex", "-1");
                    link.addEventListener("keydown", this.handleInMenuKeydown.bind(this))
                });
                this.mobileTrigger = document.createElement("button");
                this.mobileTrigger.classList.add("header--menu-trigger");
                this.mobileTrigger.setAttribute("aria-label", "Menu");
                this.mobileTrigger.setAttribute("aria-haspopup", "true");
                this.mobileTrigger.setAttribute("aria-controls", "menu");
                this.mobileTrigger.appendChild(svg);
                this.headerNav.parentElement.appendChild(this.mobileTrigger)
            }
            destroyMobileMenu() {
                this.headerNav.classList.remove(CLASSES.IS_MOBILE);
                this.headerNavUl.removeAttribute("aria-expanded");
                this.headerNav.parentElement.removeChild(this.mobileTrigger);
                this.menuitems.forEach(link => {
                    link.removeAttribute("tabindex");
                    link.removeEventListener("keydown", this.handleInMenuKeydown)
                })
            }
            setUpStickyMenu() {
                window.addEventListener("scroll", this.handleScroll)
            }
            destroyStickyMenu() {
                window.removeEventListener("scroll", this.handleScroll);
                this.headerContainer.classList.remove(CLASSES.SHOW_NAV, CLASSES.HIDE_NAV);
                this.verticalScrollThreshold = 0;
                this.isUserScrolling = false;
                this.throttleTimeout = 0;
                this.scrollTimer = null
            }
            handleScroll() {
                requestAnimationFrame(this.setStickyState)
            }
            setStickyState() {
                if (this.core.isMobile && document.body.classList.contains("body-photo")) {
                    return
                }
                const currentScroll = window.scrollY;
                this.scrollTop = currentScroll;
                if (this.scrollTop <= 120) {
                    this.headerContainer.classList.remove(CLASSES.SHOW_NAV, CLASSES.HIDE_NAV);
                    if (this.mobileNavActive) {
                        this.closePopupMenu(true)
                    }
                }
                if (this.scrollTopOld && this.scrollTop) {
                    if (this.scrollTopOld < this.scrollTop) {
                        if (this.scrollTop >= this.verticalScrollThreshold) {
                            this.headerContainer.classList.add(CLASSES.SHOW_NAV, CLASSES.HIDE_NAV);
                            if (this.mobileNavActive) {
                                this.closePopupMenu(true)
                            }
                            if (this.scrollTimer !== null) {
                                this.isUserScrolling = true;
                                clearTimeout(this.scrollTimer)
                            }
                            this.scrollTimer = setTimeout(() => {
                                this.isUserScrolling = false
                            }, this.throttleTimeout)
                        }
                    } else {
                        if (this.scrollTop < this.scrollTopOld - this.scrollTolerance) {
                            this.headerContainer.classList.remove(CLASSES.HIDE_NAV)
                        }
                    }
                }
                this.scrollTopOld = this.scrollTop
            }
            attachHandleFocus() {
                this.mobileTrigger.addEventListener("keydown", this.handleKeydown);
                this.mobileTrigger.addEventListener("click", this.handleClick);
                this.mobileTrigger.addEventListener("focus", this.handleFocus);
                this.mobileTrigger.addEventListener("blur", this.handleBlur);
                this.backgroundScrim.addEventListener("click", this.handleClick)
            }
            handleKeydown(event) {
                event.preventDefault();
                let flag = false;
                switch (event.keyCode) {
                    case this.keyCode.SPACE:
                    case this.keyCode.RETURN:
                    case this.keyCode.DOWN:
                        this.openPopupMenu();
                        this.setFocusToFirstItem();
                        flag = true;
                        break;
                    case this.keyCode.UP:
                        this.openPopupMenu();
                        this.setFocusToLastItem();
                        flag = true;
                        break;
                    default:
                        break
                }
                if (flag) {
                    event.stopPropagation();
                    event.preventDefault()
                }
            }
            handleClick(e) {
                e.preventDefault();
                if (this.mobileTrigger.getAttribute("aria-expanded") === "true") {
                    this.closePopupMenu(true)
                } else {
                    this.openPopupMenu();
                    this.setFocusToFirstItem()
                }
            }
            handleFocus(e) {
                e.preventDefault();
                this.hasFocus = true
            }
            handleBlur(e) {
                e.preventDefault();
                this.hasFocus = false
            }
            setupPopupMenu() {
                this.headerNavUl.tabIndex = -1;
                this.menuitems = nodeListToArray_1.nodeListToArray(this.headerNavUl.querySelectorAll("a"));
                this.firstMenuItem = this.menuitems[0];
                this.lastMenuItem = this.menuitems[this.menuitems.length - 1]
            }
            destroyPopupMenu() {
                this.headerNavUl.removeAttribute("tabindex");
                this.menuitems = [];
                this.firstMenuItem = null;
                this.lastMenuItem = null;
                this.headerNav.removeAttribute("style")
            }
            setFocusToFirstItem() {
                this.firstMenuItem.focus()
            }
            setFocusToLastItem() {
                this.lastMenuItem.focus()
            }
            openPopupMenu() {
                const rect = this.headerContainer.getBoundingClientRect();
                this.headerNav.classList.add(CLASSES.ACTIVE);
                this.headerNav.style.top = `${rect.height}px`;
                this.mobileTrigger.setAttribute("aria-expanded", "true");
                this.backgroundScrim.style.opacity = "0.5";
                this.backgroundScrim.style.pointerEvents = "auto"
            }
            closePopupMenu(force) {
                if (force || !this.hasFocus && !this.hasHover) {
                    this.headerNav.classList.remove(CLASSES.ACTIVE);
                    this.mobileTrigger.removeAttribute("aria-expanded");
                    this.backgroundScrim.style.opacity = "0";
                    this.backgroundScrim.style.pointerEvents = "none"
                }
            }
            setFocusToPreviousItem(currentItem) {
                let index;
                if (currentItem === this.firstMenuItem) {
                    this.lastMenuItem.focus()
                } else {
                    index = this.menuitems.indexOf(currentItem);
                    this.menuitems[index - 1].focus()
                }
            }
            handleInMenuKeydown(event) {
                let flag = false;
                let char = event.key;
                const target = event.currentTarget;
                if (event.ctrlKey || event.altKey || event.metaKey || event.keyCode === this.keyCode.SPACE || event.keyCode === this.keyCode.RETURN) {
                    return
                }
                if (event.shiftKey) {
                    if (event.keyCode === this.keyCode.TAB) {
                        this.mobileTrigger.focus();
                        this.closePopupMenu(true)
                    }
                } else {
                    switch (event.keyCode) {
                        case this.keyCode.ESC:
                            this.mobileTrigger.focus();
                            this.closePopupMenu(true);
                            flag = true;
                            break;
                        case this.keyCode.UP:
                            this.setFocusToPreviousItem(target);
                            flag = true;
                            break;
                        case this.keyCode.DOWN:
                            this.setFocusToNextItem(target);
                            flag = true;
                            break;
                        case this.keyCode.HOME:
                        case this.keyCode.PAGEUP:
                            this.setFocusToFirstItem();
                            flag = true;
                            break;
                        case this.keyCode.END:
                        case this.keyCode.PAGEDOWN:
                            this.setFocusToLastItem();
                            flag = true;
                            break;
                        case this.keyCode.TAB:
                            this.mobileTrigger.focus();
                            this.closePopupMenu(true);
                            break;
                        default:
                            break
                    }
                }
                if (flag) {
                    event.stopPropagation();
                    event.preventDefault()
                }
            }
        }
        exports.Header = Header
    }, {
        "../util/nodeListToArray": 61
    }],
    40: [function (require, module, exports) {
        "use strict";
        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function (resolve) {
                        resolve(result.value)
                    }).then(fulfilled, rejected)
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next())
            })
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const Hammer = require("hammerjs");
        const DriftMotion_1 = require("./DriftMotion");
        const animateScrollTo_1 = require("../util/animateScrollTo");
        const constants_1 = require("../util/constants");
        const loadImageAsync_1 = require("../util/loadImageAsync");
        const mathUtil_1 = require("../util/mathUtil");
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const prefersReducedMotion_1 = require("../util/prefersReducedMotion");
        const transitionToPromise_1 = require("../util/transitionToPromise");
        const PhotoSelectCarousel_1 = require("./PhotoSelectCarousel");
        const SELECTORS = {
            HOME_HEADLINE: ".js-home-headline",
            EXTRA_THUMBNAILS_CONTAINER: ".js-extra-thumbnails-container",
            INTRO_THUMBNAIL: ".js-intro-thumbnail",
            MAIN_THUMBNAILS_CONTAINER: ".js-main-thumbnails-container",
            MAIN_THUMBNAIL: ".js-main-thumbnail",
            DRIFT_ELEMENTS: ".js-drifter",
            EXPLORE_BUTTON: ".js-explore-button",
            SCROLL_BUTTON: ".js-scroll-button",
            PHOTO_SELECTION_VIEW_WRAPPER: ".js-photo-selection-view-wrapper",
            HOME_INTRO: ".js-home-intro",
            HEADER_CONTAINER: ".js-sticky-header",
            PAGE_CONTENT: ".js-page-content"
        };
        const CLASSES = {
            MAIN_THUMBNAIL: "js-main-thumbnail",
            HIDE_LOGO: "-hide-logo"
        };
        const MOBILE_MARGIN = 60;
        const DESKTOP_MARGIN = 120;
        class HomePage {
            constructor(core) {
                this.lastScrollTop = 0;
                this.scrollVelocity = 0;
                this.state = "cloud";
                this.imagesLoadedCount = 0;
                this.core = core;
                this.margin = this.core.isMobile ? MOBILE_MARGIN : DESKTOP_MARGIN;
                this.header = document.querySelector(SELECTORS.HEADER_CONTAINER);
                this.homeHeader = document.querySelector(SELECTORS.HOME_HEADLINE);
                this.exploreButton = document.querySelector(SELECTORS.EXPLORE_BUTTON);
                this.scrollButton = document.querySelector(SELECTORS.SCROLL_BUTTON);
                this.homeIntroContainer = document.querySelector(SELECTORS.HOME_INTRO);
                this.extraThumbnailsContainer = document.querySelector(SELECTORS.EXTRA_THUMBNAILS_CONTAINER);
                this.mainThumbnailsContainer = document.querySelector(SELECTORS.MAIN_THUMBNAILS_CONTAINER);
                this.pageContent = document.querySelector(SELECTORS.PAGE_CONTENT);
                const introThumbnailElements = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.INTRO_THUMBNAIL));
                this.introThumbnails = introThumbnailElements.map((element, index) => {
                    const imageElement = element.getElementsByTagName("img")[0];
                    const side = element.getBoundingClientRect().left > this.core.viewportWidth / 2 ? "right" : "left";
                    if (!prefersReducedMotion_1.prefersReducedMotion()) {
                        imageElement.style.transform = "translate3d(0, 0, 0) scale(0)"
                    }
                    imageElement.style.opacity = "0";
                    return {
                        element: element,
                        imageElement: imageElement,
                        index: index,
                        side: side,
                        translateX: 0
                    }
                });
                const mainPhotoThumbnailElements = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.MAIN_THUMBNAIL));
                let totalWidth = 0;
                this.mainThumbnails = mainPhotoThumbnailElements.map((element, index) => {
                    const imageElement = element.getElementsByTagName("img")[0];
                    const prevImageWidth = index === 0 ? 0 : mainPhotoThumbnailElements[index - 1].clientWidth + this.margin;
                    totalWidth += prevImageWidth;
                    return {
                        element: element,
                        imageElement: imageElement,
                        width: element.clientWidth,
                        translateX: totalWidth
                    }
                });
                const bindFuncs = ["addDesktopHandlers", "addMobileHandlers", "startPhotoSelection", "handleResize", "handleBreakpointChange", "handleScroll", "handleTouchStart", "handleTouchEnd", "swipeToCarousel", "handleTouchMove"];
                bindFuncs.forEach(func => {
                    const self = this;
                    self[func] = self[func].bind(self)
                })
            }
            init() {
                history.scrollRestoration = "manual";
                window.scrollTo(0, 0);
                if (!prefersReducedMotion_1.prefersReducedMotion()) {
                    const driftElements = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.DRIFT_ELEMENTS));
                    const isMouseReactive = true;
                    this.cloudDriftMotion = new DriftMotion_1.default(driftElements, isMouseReactive);
                    this.cloudDriftMotion.distanceMult = .5;
                    this.cloudDriftMotion.speedMult = 2
                }
                this.photoSelectCarousel = new PhotoSelectCarousel_1.PhotoSelectCarousel(document.querySelector(SELECTORS.PHOTO_SELECTION_VIEW_WRAPPER), this.core);
                this.wasMobile = this.core.isMobile;
                window.addEventListener("touchmove", this.handleTouchMove, {
                    passive: false
                });
                this.introAnimation();
                const waitToAddHandlers = () => {
                    if (this.imagesLoadedCount !== this.introThumbnails.length) {
                        requestAnimationFrame(waitToAddHandlers)
                    } else {
                        window.removeEventListener("touchmove", this.handleTouchMove);
                        if (this.core.isMobile) {
                            this.addMobileHandlers();
                            document.body.style.overflowY = "visible"
                        } else {
                            this.addDesktopHandlers()
                        }
                    }
                };
                waitToAddHandlers();
                window.addEventListener("resize", this.handleResize);
                window.onpopstate = (() => window.location.reload(true));
                window.addEventListener("pageshow", function (event) {
                    if (event.persisted) {
                        window.location.reload()
                    }
                })
            }
            handleResize() {
                this.mainThumbnailsContainer.style.opacity = "0";
                this.extraThumbnailsContainer.style.opacity = "0";
                if (this.resizeRaf) {
                    cancelAnimationFrame(this.resizeRaf)
                }
                this.resizeRaf = requestAnimationFrame(() => {
                    clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = setTimeout(() => {
                        this.mainThumbnailsContainer.style.opacity = "1";
                        this.extraThumbnailsContainer.style.opacity = "1";
                        this.handleBreakpointChange()
                    }, 250)
                })
            }
            handleBreakpointChange() {
                if (this.wasMobile !== this.core.isMobile) {
                    this.wasMobile = this.core.isMobile;
                    this.reset();
                    this.photoSelectCarousel.reset()
                }
            }
            reset() {
                this.mainThumbnails.forEach(thumbnail => {
                    thumbnail.imageElement.style.transition = "none"
                });
                this.photoSelectCarousel.reset();
                if (this.core.isMobile) {
                    this.removeHandlers();
                    this.photoSelectCarousel.removeDesktopHandlers();
                    this.addMobileHandlers();
                    document.body.style.overflowY = "visible";
                    this.homeIntroContainer.style.display = "block";
                    this.homeHeader.style.opacity = "1";
                    this.extraThumbnailsContainer.style.zIndex = "1";
                    this.introThumbnails.forEach(thumbnail => {
                        thumbnail.imageElement.style.transition = `opacity .4s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        const scale = 1;
                        transitionToPromise_1.animate(thumbnail.imageElement, {
                            transform: `translate3d(0, 0, 0) scale(${scale})`,
                            opacity: "1"
                        })
                    })
                } else {
                    this.removeMobileHandlers();
                    this.addDesktopHandlers();
                    this.introThumbnails.forEach(thumbnail => {
                        thumbnail.imageElement.style.transition = `opacity .4s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        const scale = thumbnail.element.classList.contains(CLASSES.MAIN_THUMBNAIL) ? .25 : 1;
                        transitionToPromise_1.animate(thumbnail.imageElement, {
                            transform: `translate3d(0, 0, 0) scale(${scale})`,
                            opacity: "1"
                        })
                    });
                    if (this.state === "carousel") {
                        document.removeEventListener("wheel", this.startPhotoSelection);
                        this.photoSelectCarousel.photoSelectLinks.forEach(element => {
                            element.removeEventListener("focus", this.startPhotoSelection)
                        });
                        this.homeHeader.style.opacity = "0";
                        this.exploreButton.style.opacity = "0";
                        this.scrollButton.style.opacity = "0";
                        this.extraThumbnailsContainer.style.zIndex = "2";
                        this.extraThumbnailsContainer.style.transition = `transform 2s ${constants_1.CONSTANTS.DEFAULT_EASE},\n            opacity 2s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        this.homeIntroContainer.style.display = "none";
                        document.body.style.overflowY = "visible";
                        this.photoSelectCarousel.perFrame()
                    }
                }
            }
            introAnimation() {
                return __awaiter(this, void 0, void 0, function* () {
                    this.mainThumbnailsContainer.style.opacity = "1";
                    this.extraThumbnailsContainer.style.opacity = "1";
                    const homeHeaderParams = {
                        opacity: "1"
                    };
                    if (!prefersReducedMotion_1.prefersReducedMotion()) {
                        homeHeaderParams["transform"] = "translateY(calc(-50%))"
                    }
                    transitionToPromise_1.animate(this.homeHeader, homeHeaderParams);
                    this.introThumbnails.forEach((thumbnail, index) => {
                        const scale = thumbnail.element.classList.contains(CLASSES.MAIN_THUMBNAIL) && !this.core.isMobile ? .25 : 1;
                        const img = thumbnail.imageElement;
                        if (!prefersReducedMotion_1.prefersReducedMotion()) {
                            img.style.transform = "translate3d(0, 0, 0) scale(0.001)"
                        }
                        loadImageAsync_1.loadImageAsync(img).then(() => {
                            const params = {
                                transition: `opacity 2s ${constants_1.CONSTANTS.DEFAULT_EASE}\n              ${50+thumbnail.index*10}ms`,
                                transform: `translate3d(0, 0, 0) scale(${scale})`,
                                opacity: "1"
                            };
                            if (!prefersReducedMotion_1.prefersReducedMotion()) {
                                params["transition"] += `, transform 1.5s ${constants_1.CONSTANTS.DEFAULT_EASE}\n            ${50+thumbnail.index*10}ms`
                            }
                            transitionToPromise_1.animate(img, params).then(() => {
                                this.imagesLoadedCount++
                            })
                        })
                    });
                    return Promise.resolve()
                })
            }
            handleTouchMove(event) {
                event.preventDefault()
            }
            addDesktopHandlers() {
                document.addEventListener("wheel", this.startPhotoSelection);
                this.exploreButton.addEventListener("click", this.startPhotoSelection);
                this.scrollButton.addEventListener("click", this.startPhotoSelection);
                this.photoSelectCarousel.photoSelectLinks.forEach(element => {
                    element.addEventListener("focus", this.startPhotoSelection)
                });
                this.introThumbnails.forEach(thumbnail => {
                    thumbnail.element.addEventListener("click", this.startPhotoSelection)
                });
                this.touchHammer = new Hammer.Manager(this.homeIntroContainer);
                this.touchHammer.add(new Hammer.Swipe({
                    direction: Hammer.DIRECTION_VERTICAL
                }));
                this.touchHammer.on("swipe", this.startPhotoSelection)
            }
            removeHandlers() {
                document.removeEventListener("wheel", this.startPhotoSelection);
                this.exploreButton.removeEventListener("click", this.startPhotoSelection);
                this.scrollButton.removeEventListener("click", this.startPhotoSelection);
                this.photoSelectCarousel.photoSelectLinks.forEach(element => {
                    element.removeEventListener("focus", this.startPhotoSelection)
                });
                this.introThumbnails.forEach(thumbnail => {
                    thumbnail.element.removeEventListener("click", this.startPhotoSelection)
                })
            }
            addMobileHandlers() {
                this.touchHammer = new Hammer.Manager(this.homeIntroContainer);
                this.touchHammer.add(new Hammer.Swipe({
                    direction: Hammer.DIRECTION_VERTICAL
                }));
                this.touchHammer.on("swipe", this.swipeToCarousel);
                window.addEventListener("touchstart", this.handleTouchStart);
                window.addEventListener("scroll", this.handleScroll);
                window.addEventListener("touchend", this.handleTouchEnd);
                this.scrollButton.addEventListener("click", this.swipeToCarousel)
            }
            removeMobileHandlers() {
                window.removeEventListener("touchstart", this.handleTouchStart);
                window.removeEventListener("scroll", this.handleScroll);
                window.removeEventListener("touchend", this.handleTouchEnd);
                this.scrollButton.removeEventListener("click", this.swipeToCarousel)
            }
            getScrollTop() {
                return window.pageYOffset || document.documentElement.scrollTop
            }
            handleTouchStart() {
                this.scrollVelocity = 0;
                this.lastScrollTop = this.getScrollTop()
            }
            handleScroll(event) {
                const scrollTop = this.getScrollTop();
                if (this.getScrollTop() < window.innerHeight * .5 && this.state !== "carousel") {
                    this.header.classList.add(CLASSES.HIDE_LOGO)
                } else {
                    this.header.classList.remove(CLASSES.HIDE_LOGO)
                }
                this.scrollVelocity = mathUtil_1.lerp(this.scrollVelocity, scrollTop - this.lastScrollTop, .5);
                this.lastScrollTop = scrollTop
            }
            handleTouchEnd() {
                if (this.scrollVelocity > 0) {
                    if (this.getScrollTop() < window.innerHeight * .5) {
                        this.swipeToCarousel()
                    }
                }
            }
            swipeToCarousel() {
                this.photoSelectCarousel.mobileWillSwipeToCarousel();
                this.state = "carousel";
                this.header.classList.remove(CLASSES.HIDE_LOGO);
                animateScrollTo_1.animateScrollTo(document.documentElement.offsetHeight, 300, "easeOutQuad", undefined)
            }
            startPhotoSelection() {
                return __awaiter(this, void 0, void 0, function* () {
                    this.header.classList.remove(CLASSES.HIDE_LOGO);
                    this.homeIntroContainer.style.height = "100vh";
                    document.removeEventListener("wheel", this.startPhotoSelection);
                    this.photoSelectCarousel.photoSelectLinks.forEach(element => {
                        element.removeEventListener("focus", this.startPhotoSelection)
                    });
                    if (this.cloudDriftMotion) {
                        this.cloudDriftMotion.stop()
                    }
                    this.state = "carousel";
                    const time = prefersReducedMotion_1.prefersReducedMotion() ? "0s" : "2s";
                    if (prefersReducedMotion_1.prefersReducedMotion()) {
                        [this.homeHeader, this.exploreButton, this.scrollButton].forEach(elem => {
                            const _elem = elem;
                            _elem.style.transition = "opacity 0s"
                        });
                        yield transitionToPromise_1.delayOneFrame()
                    }
                    this.homeHeader.style.opacity = "0";
                    this.exploreButton.style.opacity = "0";
                    this.scrollButton.style.opacity = "0";
                    this.extraThumbnailsContainer.style.zIndex = "2";
                    this.extraThumbnailsContainer.style.transition = `transform ${time} ${constants_1.CONSTANTS.DEFAULT_EASE},\n        opacity ${time} ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                    const mainFourThumbnails = this.mainThumbnails.filter(thumbnail => {
                        if (thumbnail.element.classList.contains("thumbnail-uncle-sam") || thumbnail.element.classList.contains("thumbnail-bed-stuy") || thumbnail.element.classList.contains("thumbnail-twins") || thumbnail.element.classList.contains("thumbnail-moon-walk")) {
                            return thumbnail
                        } else {
                            transitionToPromise_1.animate(thumbnail.element, {
                                opacity: "0"
                            })
                        }
                    });
                    const mainThumbnailsAnimateIn = Promise.all(mainFourThumbnails.map(thumbnail => __awaiter(this, void 0, void 0, function* () {
                        thumbnail.imageElement.style.filter = "none";
                        thumbnail.imageElement.style.transition = `transform ${time} ${constants_1.CONSTANTS.DEFAULT_EASE_HARD}`;
                        thumbnail.element.style.transformOrigin = "left center";
                        thumbnail.element.style.transition = `opacity ${time} ${constants_1.CONSTANTS.DEFAULT_EASE},\n            transform ${time} ${constants_1.CONSTANTS.DEFAULT_EASE},\n            left ${time} ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        yield Promise.all([transitionToPromise_1.animate(thumbnail.element, {
                            transform: `translate3d(0, calc(-50% + 5px), 0)\n                scale(1)`,
                            left: `${thumbnail.translateX}px`
                        }), transitionToPromise_1.animate(thumbnail.imageElement, {
                            transform: `translate3d(0, 0, 0) scale(1)`
                        })])
                    })));
                    const outTime = prefersReducedMotion_1.prefersReducedMotion() ? "0s" : ".5s";
                    const extraThumbnailsAnimateOut = Promise.all(this.introThumbnails.map(thumbnail => __awaiter(this, void 0, void 0, function* () {
                        const matrixString = getComputedStyle(thumbnail.element).transform;
                        const transformY = matrixString.substring(matrixString.lastIndexOf(" ") + 1, matrixString.lastIndexOf(")"));
                        thumbnail.imageElement.style.transition = `transform ${outTime} ${constants_1.CONSTANTS.DEFAULT_EASE},\n          opacity ${outTime} ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        if (!thumbnail.element.classList.contains(CLASSES.MAIN_THUMBNAIL) && thumbnail.side === "left") {
                            transitionToPromise_1.animate(thumbnail.imageElement, {
                                transform: `translate3d(-${this.core.viewportWidth}px,\n                  ${transformY}px, 0)`,
                                opacity: "0"
                            })
                        } else if (!thumbnail.element.classList.contains(CLASSES.MAIN_THUMBNAIL) && thumbnail.side === "right") {
                            transitionToPromise_1.animate(thumbnail.imageElement, {
                                transform: `translate3d(${this.core.viewportWidth}px,\n                  ${transformY}px, 0)`,
                                opacity: "0"
                            })
                        }
                    })));
                    if (!prefersReducedMotion_1.prefersReducedMotion()) {
                        yield Promise.all([mainThumbnailsAnimateIn, extraThumbnailsAnimateOut])
                    }
                    this.homeIntroContainer.style.display = "none";
                    this.photoSelectCarousel.startPhotoCarousel();
                    document.body.style.overflowY = "visible"
                })
            }
        }
        exports.HomePage = HomePage
    }, {
        "../util/animateScrollTo": 54,
        "../util/constants": 55,
        "../util/loadImageAsync": 59,
        "../util/mathUtil": 60,
        "../util/nodeListToArray": 61,
        "../util/prefersReducedMotion": 62,
        "../util/transitionToPromise": 65,
        "./DriftMotion": 38,
        "./PhotoSelectCarousel": 43,
        hammerjs: 26
    }],
    41: [function (require, module, exports) {
        "use strict";
        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function (resolve) {
                        resolve(result.value)
                    }).then(fulfilled, rejected)
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next())
            })
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const constants_1 = require("../util/constants");
        const mathUtil_1 = require("../util/mathUtil");
        const svgAnimateInReverse_1 = require("../util/svgAnimateInReverse");
        const transitionToPromise_1 = require("../util/transitionToPromise");
        const loadImageAsync_1 = require("../util/loadImageAsync");
        const Rectangle_1 = require("../util/Rectangle");
        const CLASSES = {
            PARTICLE: "particle"
        };
        const SVG_SIZE = 40;
        const DOT_RANDOM_START_DELAY = .75;
        const DURATION_RANDOM_MIN = 1.7;
        const DURATION_RANDOM_MAX = 2.5;
        const OUTLINE_DELAY = 0;
        const OUTLINE_STROKE_MAX_KEYTIME = .2;
        const OUTLINE_STROKE_MAX = 4;
        const OUTLINE_STROKE_MIN = 2.2;
        const OUTLINE_RADIUS = 17.5;
        const OUTLINE_EXPAND_TIME = .16;
        const OUTLINE_COLLAPSE_DELAY = .01;
        const OUTLINE_COLLAPSE_TIME = .26;
        const FILL_RADIUS = 10;
        const FILL_DELAY = .08;
        const FILL_EXPAND_TIME = .28;
        const REVERSE_RANDOM_DELAY = .3;
        const REVERSE_SPEED_MULT = .8;
        var ParticleOrder;
        (function (ParticleOrder) {
            ParticleOrder[ParticleOrder["LeftToRight"] = 0] = "LeftToRight";
            ParticleOrder[ParticleOrder["Random"] = 1] = "Random"
        })(ParticleOrder = exports.ParticleOrder || (exports.ParticleOrder = {}));
        class ParticlesAmbient {
            constructor(container, dotSizeRadius = FILL_RADIUS) {
                this.particles = [];
                this.isAlive = true;
                this.particlesContainer = container;
                this.dotSizeRadius = dotSizeRadius;
                this.runDotsInReverse = this.runDotsInReverse.bind(this);
                this.fadeOutDots = this.fadeOutDots.bind(this);
                this.destroy = this.destroy.bind(this)
            }
            getPlacementTime() {
                return DOT_RANDOM_START_DELAY + (FILL_DELAY + FILL_EXPAND_TIME) * DURATION_RANDOM_MAX
            }
            initWithPlacements(placementJson, imageMustLoad = undefined, customBounds = undefined, containerStyle = undefined, order = ParticleOrder.Random) {
                return __awaiter(this, void 0, void 0, function* () {
                    this.bounds = new Rectangle_1.Rectangle(0, 0, this.particlesContainer.offsetWidth, this.particlesContainer.offsetHeight);
                    if (imageMustLoad) {
                        yield loadImageAsync_1.loadImageAsync(imageMustLoad);
                        this.bounds.width = imageMustLoad.offsetWidth;
                        this.bounds.height = imageMustLoad.offsetHeight;
                        if (!containerStyle) {
                            Object.assign(this.particlesContainer.style, {
                                position: "absolute",
                                left: "0px",
                                top: "0px",
                                width: "100%",
                                height: "100%"
                            })
                        }
                    }
                    if (!this.isAlive) {
                        return
                    }
                    if (customBounds) {
                        this.bounds = customBounds
                    }
                    if (containerStyle) {
                        Object.assign(this.particlesContainer.style, containerStyle)
                    }
                    let placementObj;
                    try {
                        placementObj = JSON.parse(placementJson)
                    } catch (err) {
                        console.warn("placementJson could not be parsed:", placementJson);
                        return
                    }
                    if (!(placementObj instanceof Array)) {
                        console.warn("placementJson not an Array:", placementObj);
                        return
                    }
                    const placementAr = placementObj;
                    if (order === ParticleOrder.LeftToRight) {
                        placementAr.sort((a, b) => {
                            return a[0] - b[0]
                        })
                    }
                    placementAr.forEach((placement, index) => __awaiter(this, void 0, void 0, function* () {
                        const xRatio = placement[0];
                        const yRatio = placement[1];
                        let delaySeconds;
                        if (order !== ParticleOrder.Random) {
                            const noise = .27;
                            delaySeconds = DOT_RANDOM_START_DELAY * mathUtil_1.lerp(index / placementAr.length, Math.random(), noise);
                            if (Math.random() < .27) {
                                delaySeconds = DOT_RANDOM_START_DELAY * Math.random()
                            }
                        } else {
                            delaySeconds = Math.random() * DOT_RANDOM_START_DELAY
                        }
                        const svgStyle = {
                            left: xRatio * 100 + "%",
                            top: yRatio * 100 + "%"
                        };
                        this.addOneParticleElement(delaySeconds, svgStyle)
                    }))
                })
            }
            addOneParticleElement(delaySeconds, svgStyle = {}) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield transitionToPromise_1.delay(delaySeconds);
                    if (!this.isAlive) {
                        return
                    }
                    const durationMult = mathUtil_1.lerp(DURATION_RANDOM_MIN, DURATION_RANDOM_MAX, Math.random());
                    const scale = this.dotSizeRadius / FILL_RADIUS;
                    const createElem = (tag, parent) => {
                        const elem = document.createElementNS(constants_1.CONSTANTS.SVG_NS, tag);
                        if (parent) {
                            parent.appendChild(elem)
                        }
                        return elem
                    };
                    const setAttributes = (elem, attrs) => {
                        Object.keys(attrs).forEach(key => {
                            elem.setAttributeNS(null, key, attrs[key])
                        })
                    };
                    const ease = constants_1.CONSTANTS.DEFAULT_EASE_SVG;
                    const easeIn = constants_1.CONSTANTS.DEFAULT_EASE_SVG_IN;
                    const assignAnimateAttrs = attrs => {
                        const output = {
                            attributeType: "XML",
                            keySplines: ease,
                            keyTimes: "0; 1",
                            calcMode: "spline",
                            fill: "freeze"
                        };
                        return Object.assign(output, attrs)
                    };
                    const svg = createElem("svg", undefined);
                    svg.classList.add(CLASSES.PARTICLE);
                    const group = createElem("g", svg);
                    const circle = createElem("circle", group);
                    setAttributes(circle, {
                        cx: SVG_SIZE / 2 + "px",
                        cy: SVG_SIZE / 2 + "px",
                        r: "0",
                        fill: "#ffffff"
                    });
                    const circleAnim = createElem("animate", circle);
                    setAttributes(circleAnim, assignAnimateAttrs({
                        attributeName: "r",
                        values: `0; ${FILL_RADIUS*scale}`,
                        begin: FILL_DELAY * durationMult + "s",
                        dur: FILL_EXPAND_TIME * durationMult + "s"
                    }));
                    const outline = createElem("circle", group);
                    setAttributes(outline, {
                        cx: SVG_SIZE / 2 + "px",
                        cy: SVG_SIZE / 2 + "px",
                        r: "0",
                        fill: "none",
                        stroke: "#ffffff",
                        "stroke-width": "0"
                    });
                    const radiusTime = OUTLINE_EXPAND_TIME + OUTLINE_COLLAPSE_DELAY + OUTLINE_COLLAPSE_TIME;
                    const radiusAnim = createElem("animate", outline);
                    setAttributes(radiusAnim, assignAnimateAttrs({
                        attributeName: "r",
                        values: `0; ${OUTLINE_RADIUS*scale}; ${OUTLINE_RADIUS*scale}; 0`,
                        begin: OUTLINE_DELAY * durationMult + "s",
                        dur: radiusTime * durationMult + "s",
                        keySplines: [ease, ease, easeIn].join("; "),
                        keyTimes: [0, OUTLINE_EXPAND_TIME / radiusTime, (OUTLINE_EXPAND_TIME + OUTLINE_COLLAPSE_DELAY) / radiusTime, 1].join("; ")
                    }));
                    const strokeAnim = createElem("animate", outline);
                    setAttributes(strokeAnim, assignAnimateAttrs({
                        attributeName: "stroke-width",
                        values: `0; ${OUTLINE_STROKE_MAX*scale}; ${OUTLINE_STROKE_MIN*scale}`,
                        begin: OUTLINE_DELAY * durationMult + "s",
                        dur: OUTLINE_EXPAND_TIME * durationMult + "s",
                        keySplines: [easeIn, ease].join("; "),
                        keyTimes: `0; ${OUTLINE_STROKE_MAX_KEYTIME}; 1`
                    }));
                    Object.assign(svg.style, {
                        position: "absolute",
                        overflow: "visible"
                    });
                    Object.assign(svg.style, svgStyle);
                    const particle = {
                        x: 0,
                        y: 0,
                        element: svg,
                        group: group
                    };
                    this.particles.push(particle);
                    if (this.particlesContainer) {
                        this.particlesContainer.appendChild(svg)
                    }
                })
            }
            runDotsInReverse() {
                this.isAlive = false;
                this.particles.forEach(particle => {
                    const elem = particle.element;
                    const delaySeconds = Math.random() * REVERSE_RANDOM_DELAY;
                    const doFlipSplines = false;
                    setTimeout(() => {
                        const revElem = svgAnimateInReverse_1.svgAnimateInReverse(elem, REVERSE_SPEED_MULT, doFlipSplines);
                        setTimeout(() => {
                            revElem.remove()
                        }, 1e3)
                    }, delaySeconds * 1e3)
                });
                this.particles = []
            }
            fadeOutDots() {
                this.isAlive = false;
                this.particles.forEach(particle => __awaiter(this, void 0, void 0, function* () {
                    particle.element.style.transition = "opacity 600ms ease-in-out";
                    yield transitionToPromise_1.animate(particle.element, {
                        opacity: "0"
                    });
                    this.particlesContainer.removeChild(particle.element)
                }))
            }
            destroy() {
                this.isAlive = false;
                while (this.particles.length) {
                    let particle = this.particles.shift();
                    this.particlesContainer.removeChild(particle.element)
                }
            }
        }
        exports.ParticlesAmbient = ParticlesAmbient
    }, {
        "../util/Rectangle": 52,
        "../util/constants": 55,
        "../util/loadImageAsync": 59,
        "../util/mathUtil": 60,
        "../util/svgAnimateInReverse": 64,
        "../util/transitionToPromise": 65
    }],
    42: [function (require, module, exports) {
        "use strict";
        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function (resolve) {
                        resolve(result.value)
                    }).then(fulfilled, rejected)
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next())
            })
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const transitionToPromise_1 = require("../util/transitionToPromise");
        const isMobile_1 = require("../util/isMobile");
        const loadImageAsync_1 = require("../util/loadImageAsync");
        const ParticlesAmbient_1 = require("./ParticlesAmbient");
        const constants_1 = require("../util/constants");
        const SELECTORS = {
            ALSO_ABOUT: ".photo-page-also-about",
            IMAGE_BACK: ".photo-back-image img",
            IMAGE_FRONT: ".photo-front-image img",
            PHOTO_CONTAINER: ".photo-container",
            PHOTO_REVEAL: ".photo-reveal",
            PHOTO_SELECTED: ".photo-selected",
            PICTURE_BACK: ".photo-back-image",
            PICTURE_FRONT: ".photo-front-image",
            STORY_LINK: ".photo-page-story-link",
            EXPLORE_OTHER: ".js-explore-other",
            HEADER: ".js-sticky-header"
        };
        const CLASSES = {
            PHOTO_SELECTED_INTRO: "photo-selected-intro",
            PHOTO_SELECTED_FLIP: "photo-selected-flip",
            STORY_LINK_ACTIVE: "photo-page-story-link-active",
            SHOW_NAV: "-scroll-show",
            HIDE_NAV: "-scroll-hide",
            HIDE_LOGO: "-hide-logo"
        };
        const INTRO_ZOOM_TIME = 1;
        const DELAY_BEFORE_PHOTO_EXIT = .1;
        const DELAY_BEFORE_TEXT_EXIT = .6;
        const MAX_TEXT_ANIMATION_LINES = 250;
        const ADD_PARTICLES_DELAY = 1.2;
        const PARTICLES_FADE_OUT_TIME = 1.3;
        const PARTICLES_HANG_TIME = 1.4;
        const LANDSCAPE_QUERY = "screen and (orientation: landscape)";
        class PhotoPage {
            constructor(core) {
                this.photoFlip = 0;
                this.core = core;
                this.imageScale = this.core.isMobile ? 1 : 1.25;
                this.photo = document.querySelector(SELECTORS.PHOTO_SELECTED);
                this.imageFront = document.querySelector(SELECTORS.IMAGE_FRONT);
                this.imageBack = document.querySelector(SELECTORS.IMAGE_BACK);
                this.onImagesLoaded = this.onImagesLoaded.bind(this);
                this.onImagesLoadedMenuOnly = this.onImagesLoadedMenuOnly.bind(this);
                this.scaleImageToFillScreen = this.scaleImageToFillScreen.bind(this);
                this.showStoryLinks = this.showStoryLinks.bind(this);
                this.onLinkClick = this.onLinkClick.bind(this)
            }
            init() {
                this.header = document.querySelector(SELECTORS.HEADER);
                window.addEventListener("pageshow", function (event) {
                    if (event.persisted) {
                        window.location.reload()
                    }
                });
                window.onpopstate = (() => window.location.reload(true));
                if (!this.photo || !this.imageFront || !this.imageBack) {
                    console.error("PhotoPage: Missing assets. photo:", this.photo, "front:", this.imageFront, "back:", this.imageBack);
                    return Promise.reject("Missing assets")
                }
                if (window.location.hash === "#menu") {
                    history.scrollRestoration = "manual";
                    window.scrollTo(0, 0);
                    Promise.resolve(loadImageAsync_1.loadImageAsync(this.imageFront)).then(this.onImagesLoadedMenuOnly)
                } else {
                    Promise.all([loadImageAsync_1.loadImageAsync(this.imageFront), loadImageAsync_1.loadImageAsync(this.imageBack)]).then(this.onImagesLoaded)
                }
            }
            onImagesLoadedMenuOnly() {
                const imgWidth = this.imageFront.naturalWidth;
                const imgHeight = this.imageFront.naturalHeight;
                const fullHeight = isMobile_1.isMobile() ? screen.height : window.innerHeight;
                this.photo.setAttribute("style", `transform: ${this.makeFinalPhotoTransformString()}`), this.imageScale = Math.max(window.innerWidth / imgWidth, fullHeight / imgHeight);
                Object.assign(this.photo.style, {
                    display: "block",
                    width: imgWidth * this.imageScale + "px",
                    height: imgHeight * this.imageScale + "px"
                });
                this.photo.classList.remove(CLASSES.PHOTO_SELECTED_INTRO);
                this.showStoryLinks()
            }
            onImagesLoaded() {
                const imagesLoadedEvent = new Event("loaded");
                this.photo.dispatchEvent(imagesLoadedEvent);
                const imgWidth = this.imageFront.naturalWidth;
                const imgHeight = this.imageFront.naturalHeight;
                let widthBasis = .4;
                let heightBasis = .7;
                if (this.core.isMobile) {
                    widthBasis = .7;
                    heightBasis = .8
                }
                const ratio = Math.min(window.innerWidth * widthBasis / imgWidth, window.innerHeight * heightBasis / imgHeight);
                Object.assign(this.photo.style, {
                    display: "block",
                    width: imgWidth * ratio + "px",
                    height: imgHeight * ratio + "px"
                });
                this.runImageIntro().then(this.scaleImageToFillScreen).then(this.showStoryLinks)
            }
            makePhotoTransformString() {
                return `translate(-50%, calc(-50% + 5px)) scale(${this.imageScale})\n        rotateX(${this.photoFlip}deg)`
            }
            makeFinalPhotoTransformString() {
                let translateX = "-50%";
                let translateY = "-50%";
                if (this.photo.classList.contains("photo-moon-walk")) {
                    translateX = "-55%"
                }
                if (window.matchMedia(LANDSCAPE_QUERY).matches) {
                    if (this.photo.classList.contains("photo-twins") || this.photo.classList.contains("photo-rockefeller") || this.photo.classList.contains("photo-uncle-sam")) {
                        translateY = "-30%"
                    }
                }
                return `translate(${translateX}, ${translateY}) scale(${this.imageScale})\n        rotateX(${this.photoFlip}deg)`
            }
            addParticlesToPicture(picture, dataStr) {
                const particleSize = constants_1.CONSTANTS.PARTICLE_RADIUS_PX / this.imageScale;
                const particles = new ParticlesAmbient_1.ParticlesAmbient(picture, particleSize);
                if (dataStr) {
                    particles.initWithPlacements(dataStr, undefined, undefined, undefined, ParticlesAmbient_1.ParticleOrder.LeftToRight)
                }
                return particles
            }
            runImageIntro() {
                return new Promise(resolve => __awaiter(this, void 0, void 0, function* () {
                    yield transitionToPromise_1.delayOneFrame();
                    yield transitionToPromise_1.delay(INTRO_ZOOM_TIME);
                    this.photo.classList.remove(CLASSES.PHOTO_SELECTED_INTRO);
                    this.photo.classList.add(CLASSES.PHOTO_SELECTED_FLIP);
                    yield transitionToPromise_1.delayOneFrame();
                    this.photoFlip = -180;
                    transitionToPromise_1.animate(this.photo, {
                        transform: this.makePhotoTransformString()
                    });
                    yield transitionToPromise_1.delay(ADD_PARTICLES_DELAY);
                    const backData = this.imageBack.dataset || {};
                    const backParticleJson = backData["particles"] || "";
                    const pictureBack = document.querySelector(SELECTORS.PICTURE_BACK);
                    const backParticles = this.addParticlesToPicture(pictureBack, backParticleJson);
                    setTimeout(backParticles.fadeOutDots, PARTICLES_FADE_OUT_TIME * 1e3);
                    yield transitionToPromise_1.delay(PARTICLES_HANG_TIME);
                    this.photoFlip = -360;
                    transitionToPromise_1.animate(this.photo, {
                        transform: this.makePhotoTransformString()
                    });
                    yield transitionToPromise_1.delay(ADD_PARTICLES_DELAY);
                    const frontData = this.imageFront.dataset || {};
                    const frontParticleJson = frontData["particles"] || "";
                    const pictureFront = document.querySelector(SELECTORS.PICTURE_FRONT);
                    const frontParticles = this.addParticlesToPicture(pictureFront, frontParticleJson);
                    setTimeout(frontParticles.fadeOutDots, PARTICLES_FADE_OUT_TIME * 1e3);
                    yield transitionToPromise_1.delay(PARTICLES_HANG_TIME);
                    pictureBack.remove();
                    this.photo.classList.remove(CLASSES.PHOTO_SELECTED_FLIP);
                    yield transitionToPromise_1.delayOneFrame();
                    resolve(true)
                }))
            }
            scaleImageToFillScreen() {
                return __awaiter(this, void 0, void 0, function* () {
                    const fullHeight = isMobile_1.isMobile() ? screen.height : window.innerHeight;
                    this.imageScale = Math.max(window.innerWidth / this.imageFront.offsetWidth, fullHeight / this.imageFront.offsetHeight);
                    return new Promise(resolve => {
                        transitionToPromise_1.animate(this.photo, {
                            transform: this.makeFinalPhotoTransformString()
                        }).then(() => {
                            resolve()
                        })
                    })
                })
            }
            getTextAndLinks() {
                const elems = document.querySelectorAll([SELECTORS.ALSO_ABOUT, SELECTORS.STORY_LINK, SELECTORS.EXPLORE_OTHER].join(", "));
                return nodeListToArray_1.nodeListToArray(elems)
            }
            showStoryLinks() {
                return __awaiter(this, void 0, void 0, function* () {
                    const elems = this.getTextAndLinks();
                    const currentState = history.state;
                    const currentLoc = window.location.pathname;
                    history.replaceState(currentState, document.title, currentLoc + "#menu");
                    elems.forEach((node, index) => {
                        node.style["display"] = "block";
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                transitionToPromise_1.animate(node, {
                                    opacity: "1",
                                    transform: "translate(0%, 0%)"
                                })
                            })
                        }, index * 80)
                    });
                    this.header.classList.remove(CLASSES.SHOW_NAV, CLASSES.HIDE_NAV, CLASSES.HIDE_LOGO);
                    const links = document.querySelectorAll(`${SELECTORS.STORY_LINK} a`);
                    nodeListToArray_1.nodeListToArray(links).forEach(link => {
                        link.onclick = this.onLinkClick
                    })
                })
            }
            onLinkClick(event) {
                return __awaiter(this, void 0, void 0, function* () {
                    event.preventDefault();
                    const link = event.target;
                    link.classList.add(CLASSES.STORY_LINK_ACTIVE);
                    const urlDestination = link.getAttribute("href");
                    const elems = this.getTextAndLinks();
                    elems.forEach(node => {
                        const _style = node.style;
                        _style["pointer-events"] = "none"
                    });
                    const promises = [];
                    this.imageScale *= 1.2;
                    promises.push(new Promise(resolve => {
                        transitionToPromise_1.animate(this.photo, {
                            opacity: "0.0",
                            transform: this.makePhotoTransformString()
                        }).then(resolve)
                    }));
                    setTimeout(() => {
                        elems.forEach(node => {
                            const anim = transitionToPromise_1.animate(node, {
                                opacity: "0"
                            });
                            promises.push(anim)
                        })
                    }, DELAY_BEFORE_TEXT_EXIT * 1e3);
                    Promise.all(promises).then(() => {
                        window.location.assign(urlDestination)
                    })
                })
            }
        }
        exports.PhotoPage = PhotoPage
    }, {
        "../util/constants": 55,
        "../util/isMobile": 58,
        "../util/loadImageAsync": 59,
        "../util/nodeListToArray": 61,
        "../util/transitionToPromise": 65,
        "./ParticlesAmbient": 41
    }],
    43: [function (require, module, exports) {
        "use strict";
        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function (resolve) {
                        resolve(result.value)
                    }).then(fulfilled, rejected)
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next())
            })
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const Hammer = require("hammerjs");
        const constants_1 = require("../util/constants");
        const transitionToPromise_1 = require("../util/transitionToPromise");
        const mathUtil_1 = require("../util/mathUtil");
        const Point_1 = require("../util/Point");
        const prefersReducedMotion_1 = require("../util/prefersReducedMotion");
        const axios_1 = require("axios");
        const PhotoPage_1 = require("./PhotoPage");
        const SELECTORS = {
            PHOTO_SELECTION_VIEW_WRAPPER: ".js-photo-selection-view-wrapper",
            PHOTO_SELECTION_CONTAINER: ".js-photo-selection-container",
            PHOTO_SELECT: ".js-photo-select",
            PHOTO_SELECT_LINK: ".js-photo-select a",
            BACKGROUND_SCRIM: ".js-background-scrim",
            PAGE_CONTENT: ".js-page-content",
            SUBHEADLINE: ".js-subheadline",
            FOOTER: ".js-footer-container",
            HEADER_CONTAINER: ".js-sticky-header"
        };
        const CLASSES = {
            ACTIVE: "-active",
            INACTIVE: "-inactive",
            SHOW_NAV: "-scroll-show",
            HIDE_NAV: "-scroll-hide"
        };
        const MOBILE_MARGIN = 60;
        const DESKTOP_MARGIN = 120;
        const MOMENTUM_ENERGY = .94;
        const IDLE_DRIFT_MAX = .8;
        const IDLE_DRIFT_ACCEL = .007;
        const IDLE_DRIFT_DECEL = .05;
        const PHOTO_HOVER_SCALE = 1.03;
        class PhotoSelectCarousel {
            constructor(container, core) {
                this.isMouseOverCarousel = false;
                this.currentActiveIndex = 0;
                this.currentTranslate = 0;
                this.isDragging = false;
                this.dragDistance = 0;
                this.prevMouseLoc = new Point_1.Point;
                this.mouseLoc = new Point_1.Point;
                this.momentum = 0;
                this.idleDrift = 0;
                this.core = core;
                this.container = container;
                this.footer = document.querySelector(SELECTORS.FOOTER);
                this.pageContent = document.querySelector(SELECTORS.PAGE_CONTENT);
                this.subheadline = document.querySelector(SELECTORS.SUBHEADLINE);
                this.headerContainer = document.querySelector(SELECTORS.HEADER_CONTAINER);
                this.margin = this.core.isMobile ? this.core.viewportWidth * .08 : DESKTOP_MARGIN;
                const photoSelectWidth = this.core.isMobile ? this.core.viewportWidth * .25 : this.core.viewportWidth * .5;
                this.sideOffset = (this.core.viewportWidth - photoSelectWidth + this.margin) * .125;
                this.photoSelectionContainer = document.querySelector(SELECTORS.PHOTO_SELECTION_CONTAINER);
                this.backgroundScrim = document.querySelector(SELECTORS.BACKGROUND_SCRIM);
                const photoSelectElements = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.PHOTO_SELECT));
                let totalLeftDistance = 0;
                let translateXAmount = 0;
                this.photoSelects = photoSelectElements.map((element, index) => {
                    if (!this.core.isMobile) {
                        if (index !== 0) {
                            translateXAmount += photoSelectElements[index - 1].clientWidth;
                            totalLeftDistance += translateXAmount + this.core.viewportWidth * .11
                        }
                        element.style.transform = `translateX(${translateXAmount}px)`
                    } else {
                        translateXAmount += element.clientWidth;
                        totalLeftDistance += translateXAmount + this.core.viewportWidth * .11
                    }
                    this.photoSelectLinks = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.PHOTO_SELECT_LINK));
                    const anchorElement = element.getElementsByTagName("a")[0];
                    const imageElement = element.getElementsByTagName("img")[0];
                    return {
                        element: element,
                        width: element.clientWidth,
                        translateX: translateXAmount,
                        anchorElement: anchorElement,
                        imageElement: imageElement
                    }
                });
                this.photoSelectionContainer.style.width = totalLeftDistance + "px";
                this.createButtons = this.createButtons.bind(this);
                this.onMouseMove = this.onMouseMove.bind(this);
                this.onTouchmove = this.onTouchmove.bind(this);
                this.perFrame = this.perFrame.bind(this);
                this.onContainerMouseDown = this.onContainerMouseDown.bind(this);
                this.onContainerTouchstart = this.onContainerTouchstart.bind(this);
                this.onMouseUp = this.onMouseUp.bind(this);
                this.onTouchend = this.onTouchend.bind(this);
                this.handleCarouselSwipe = this.handleCarouselSwipe.bind(this);
                this.handleNext = this.handleNext.bind(this);
                this.handlePrevious = this.handlePrevious.bind(this);
                this.handlePhotoPageLoaded = this.handlePhotoPageLoaded.bind(this);
                this.container.style["display"] = "none";
                this.init()
            }
            init() {
                this.setActiveCard(0);
                this.createButtons();
                if (this.core.isMobile) {
                    this.addMobileHandlers()
                } else {
                    this.addDesktopHandlers()
                }
            }
            reset() {
                window.cancelAnimationFrame(this.raf);
                let totalLeftDistance = 0;
                this.margin = this.core.isMobile ? MOBILE_MARGIN : DESKTOP_MARGIN;
                this.photoSelects.forEach((photo, index) => {
                    if (!this.core.isMobile) {
                        if (index !== 0) {
                            totalLeftDistance += this.photoSelects[index - 1].element.clientWidth
                        }
                        photo.element.style.transform = `translateX(${totalLeftDistance}px)`
                    } else {
                        photo.element.style.transform = `none`;
                        totalLeftDistance += this.margin + photo.element.clientWidth
                    }
                    photo.translateX = totalLeftDistance
                });
                this.photoSelectionContainer.style.width = totalLeftDistance + "px";
                if (this.core.isMobile) {
                    this.photoSelectionContainer.style.transform = "none"
                } else {
                    this.photoSelectionContainer.style.transform = "translateY(-50%)";
                    this.photoSelectionContainer.style.opacity = "1"
                }
            }
            scaleImageIn(image) {
                image.imageElement.style.transform = `scale(${PHOTO_HOVER_SCALE})`
            }
            scaleImageOut(image) {
                image.imageElement.style.transform = "scale(1)"
            }
            addDesktopHandlers() {
                const container = document.querySelector(SELECTORS.PHOTO_SELECTION_CONTAINER);
                container.addEventListener("mousedown", this.onContainerMouseDown);
                document.addEventListener("mousemove", this.onMouseMove);
                document.addEventListener("mouseup", this.onMouseUp);
                container.addEventListener("touchstart", this.onContainerTouchstart);
                document.addEventListener("touchmove", this.onTouchmove);
                document.addEventListener("touchend", this.onTouchend);
                this.photoSelects.forEach(image => {
                    image.imageElement.addEventListener("dragstart", event => {
                        event.preventDefault()
                    })
                })
            }
            removeDesktopHandlers() {
                const container = document.querySelector(SELECTORS.PHOTO_SELECTION_CONTAINER);
                container.removeEventListener("mousedown", this.onContainerMouseDown);
                document.removeEventListener("mousemove", this.onMouseMove);
                document.removeEventListener("mouseup", this.onMouseUp)
            }
            onContainerMouseDown(event) {
                this.isDragging = true;
                this.momentum = 0;
                this.dragDistance = 0;
                this.mouseLoc.set(event.clientX, event.clientY);
                this.prevMouseLoc.copy(this.mouseLoc)
            }
            onContainerTouchstart(event) {
                this.isDragging = true;
                this.momentum = 0;
                this.dragDistance = 0;
                this.mouseLoc.set(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
                this.prevMouseLoc.copy(this.mouseLoc)
            }
            onMouseUp(event) {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.idleDrift = 0
                }
            }
            onTouchend(event) {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.idleDrift = 0
                }
            }
            addMobileHandlers() {
                this.photoSelects.forEach(image => {
                    image.imageElement.addEventListener("click", event => {
                        event.preventDefault();
                        this.transitionPhoto(image);
                        return false
                    });
                    image.imageElement.addEventListener("dragstart", event => {
                        event.preventDefault()
                    })
                });
                this.mobileHammerCarousel = new Hammer.Manager(this.photoSelectionContainer);
                this.mobileHammerCarousel.add(new Hammer.Swipe({
                    direction: Hammer.DIRECTION_HORIZONTAL
                }));
                this.mobileHammerCarousel.on("swipe", this.handleCarouselSwipe)
            }
            removeMobileHandlers() {
                this.mobileHammerCarousel.destroy()
            }
            handleCarouselSwipe(event) {
                const direction = event.offsetDirection;
                if (direction === 4) {
                    this.handlePrevious()
                }
                if (direction === 2) {
                    this.handleNext()
                }
            }
            handlePrevious() {
                this.rightArrow.classList.remove(CLASSES.INACTIVE);
                if (this.currentActiveIndex < 1) {
                    this.leftArrow.classList.add(CLASSES.INACTIVE);
                    return
                }
                const translateAmount = this.photoSelects[this.currentActiveIndex - 1].width + MOBILE_MARGIN + 2;
                this.currentTranslate += translateAmount;
                if (this.currentTranslate > this.photoSelectionContainer.clientWidth) {
                    this.currentActiveIndex--;
                    this.handlePrevious();
                    this.leftArrow.classList.add(CLASSES.INACTIVE);
                    return
                }
                this.photoSelectionContainer.style.transform = `translateX(${this.currentTranslate+this.sideOffset}px)`;
                this.currentActiveIndex--;
                this.setActiveCard(this.currentActiveIndex);
                if (this.currentActiveIndex < 1) {
                    this.leftArrow.classList.add(CLASSES.INACTIVE)
                }
            }
            handleNext() {
                this.leftArrow.classList.remove(CLASSES.INACTIVE);
                if (this.currentActiveIndex >= this.photoSelects.length - 1) {
                    return
                }
                const translateAmount = this.photoSelects[this.currentActiveIndex].width + MOBILE_MARGIN + 2;
                this.currentTranslate = (this.currentTranslate - translateAmount) * -1 > this.photoSelectionContainer.clientWidth ? this.photoSelectionContainer.clientWidth * -1 : this.currentTranslate - translateAmount;
                this.photoSelectionContainer.style.transform = `translateX(${this.currentTranslate+this.sideOffset}px)`;
                this.currentActiveIndex = translateAmount > this.photoSelectionContainer.clientWidth ? this.photoSelects.length - 1 : this.currentActiveIndex + 1;
                this.setActiveCard(this.currentActiveIndex);
                if (this.currentActiveIndex === this.photoSelects.length) {
                    this.rightArrow.classList.add(CLASSES.INACTIVE)
                }
            }
            setActiveCard(activeIndex) {
                this.photoSelects.forEach((photo, index) => {
                    if (activeIndex === index) {
                        photo.element.classList.add(CLASSES.ACTIVE)
                    } else {
                        photo.element.classList.remove(CLASSES.ACTIVE)
                    }
                })
            }
            onMouseMove(event) {
                this.mouseLoc.set(event.clientX, event.clientY)
            }
            onTouchmove(event) {
                this.mouseLoc.set(event.targetTouches[0].clientX, event.targetTouches[0].clientY)
            }
            mobileWillSwipeToCarousel() {
                this.container.style.display = "block"
            }
            startPhotoCarousel() {
                this.container.style.display = "block";
                this.photoSelectionContainer.style.opacity = "1";
                this.subheadline.style.opacity = "1";
                this.photoSelects.forEach(image => {
                    image.element.addEventListener("mouseover", image.mouseOverListener = (() => {
                        this.scaleImageIn(image);
                        this.isMouseOverCarousel = true
                    }));
                    image.element.addEventListener("mouseout", image.mouseOutListener = (() => {
                        this.scaleImageOut(image);
                        this.isMouseOverCarousel = false
                    }));
                    image.anchorElement.addEventListener("click", image.clickListener = (event => {
                        event.preventDefault();
                        this.transitionPhoto(image);
                        return false
                    }))
                });
                if (!this.core.isMobile) {
                    this.lastFrame = new Date;
                    this.perFrame()
                }
            }
            perFrame() {
                const now = new Date;
                const elapsedMS = now.getTime() - this.lastFrame.getTime();
                this.lastFrame = now;
                let timeMult = elapsedMS * (60 / 1e3);
                timeMult = Math.min(timeMult, 4);
                let moveX = 0;
                if (this.isDragging) {
                    moveX = this.mouseLoc.x - this.prevMouseLoc.x;
                    const moveY = this.mouseLoc.y - this.prevMouseLoc.y;
                    if (moveX !== 0) {
                        this.momentum = mathUtil_1.lerp(this.momentum, moveX, .8)
                    }
                    this.dragDistance += this.mouseLoc.distanceTo(this.prevMouseLoc);
                    this.prevMouseLoc.copy(this.mouseLoc)
                } else {
                    if (Math.abs(this.momentum) > .01) {
                        moveX = this.momentum * timeMult;
                        this.momentum *= mathUtil_1.lerp(1, MOMENTUM_ENERGY, timeMult)
                    } else {
                        if (this.isMouseOverCarousel) {
                            this.idleDrift = Math.max(0, this.idleDrift - IDLE_DRIFT_DECEL * timeMult)
                        } else {
                            this.idleDrift = Math.min(IDLE_DRIFT_MAX, this.idleDrift + IDLE_DRIFT_ACCEL * timeMult)
                        }
                        moveX = -(this.idleDrift * timeMult)
                    }
                }
                if (moveX !== 0) {
                    const windowWidth = window.innerWidth;
                    const carouselWidth = this.photoSelects.reduce((sum, image) => {
                        return sum + image.width
                    }, 0);
                    this.photoSelects.forEach((image, index) => {
                        image.element.style.transition = "none";
                        let newTranslateX = image.translateX + moveX;
                        newTranslateX = mathUtil_1.wrapCloseToTarget(newTranslateX, carouselWidth, windowWidth / 2);
                        image.element.style.transform = `translateX(${newTranslateX}px)`;
                        image.translateX = newTranslateX
                    })
                }
                this.raf = requestAnimationFrame(this.perFrame)
            }
            transitionPhoto(photoSelect) {
                return __awaiter(this, void 0, void 0, function* () {
                    this.photoSelects.forEach(image => {
                        image.element.removeEventListener("mouseover", image.mouseOverListener);
                        image.element.removeEventListener("mouseout", image.mouseOutListener);
                        image.anchorElement.removeEventListener("click", image.clickListener)
                    });
                    this.headerContainer.classList.add(CLASSES.SHOW_NAV, CLASSES.HIDE_NAV);
                    const selectedPhotoContainer = photoSelect.element;
                    const selectedPhotoRect = selectedPhotoContainer.getBoundingClientRect();
                    const selectedPhotoLeftOffset = selectedPhotoRect.left;
                    const selectedPhotoElement = photoSelect.imageElement;
                    const imageRect = selectedPhotoElement.getBoundingClientRect();
                    const selectedPhotoLink = photoSelect.anchorElement;
                    if (prefersReducedMotion_1.prefersReducedMotion()) {
                        window.location.href = selectedPhotoLink.getAttribute("href");
                        return
                    }
                    if (!this.core.isMobile) {
                        window.cancelAnimationFrame(this.raf);
                        const halfContainerWidth = window.innerWidth / 2;
                        this.photoSelectionContainer.style.transition = `opacity .5s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        this.setUpPhotoDetail(selectedPhotoLink.getAttribute("href"));
                        const imgWidth = photoSelect.imageElement.naturalWidth;
                        const imgHeight = photoSelect.imageElement.naturalHeight;
                        const ratio = Math.min(window.innerWidth * .4 / imgWidth, window.innerHeight * .7 / imgHeight);
                        const width = imgWidth * ratio;
                        const newScale = width / photoSelect.imageElement.width;
                        const oldImageElementTransition = photoSelect.imageElement.style.getPropertyValue("transition");
                        photoSelect.element.style.transition = "transform 1s " + constants_1.CONSTANTS.DEFAULT_EASE;
                        photoSelect.imageElement.style.transition = "transform 1s " + constants_1.CONSTANTS.DEFAULT_EASE;
                        photoSelect.imageElement.style.transformOrigin = "50% 50%";
                        const imageSelectRect = photoSelect.imageElement.getBoundingClientRect();
                        const distance = halfContainerWidth - (imageSelectRect.left + imageSelectRect.width / 2);
                        Promise.all([transitionToPromise_1.animate(photoSelect.element, {
                            transform: `translateX(${halfContainerWidth}px)`
                        }), transitionToPromise_1.animate(photoSelect.imageElement, {
                            transform: `translateX(-50%) scale(${PHOTO_HOVER_SCALE})`
                        })]).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.backgroundScrim.style.zIndex = "inherit";
                            photoSelect.imageElement.style.transition = oldImageElementTransition;
                            Promise.all([transitionToPromise_1.animate(photoSelect.imageElement, {
                                transform: `translateX(-50%) scale(${newScale*1.15})`
                            }), transitionToPromise_1.animate(this.photoSelectionContainer, {
                                opacity: "0.4"
                            }), transitionToPromise_1.animate(this.backgroundScrim, {
                                opacity: "1"
                            }), transitionToPromise_1.animate(this.subheadline, {
                                opacity: "0"
                            })]).then(() => __awaiter(this, void 0, void 0, function* () {
                                document.body.insertBefore(this.photoContent, this.footer);
                                const photopage = new PhotoPage_1.PhotoPage(this.core);
                                photopage.init();
                                photopage.photo.addEventListener("loaded", this.handlePhotoPageLoaded)
                            }))
                        }));
                        this.photoSelects.forEach(photo => __awaiter(this, void 0, void 0, function* () {
                            if (photo === photoSelect) {
                                return
                            }
                            const matrixString = getComputedStyle(photo.element).transform;
                            const matrix = new WebKitCSSMatrix(matrixString);
                            const translateAmount = distance + matrix.m41;
                            photo.element.style.transition = `transform 1s ${constants_1.CONSTANTS.DEFAULT_EASE},\n            opacity .2s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                            transitionToPromise_1.animate(photo.element, {
                                transform: `translateX(${translateAmount}px)`
                            }).then(() => {
                                photo.element.style.opacity = "0"
                            })
                        }))
                    } else {
                        yield this.setUpPhotoDetail(selectedPhotoLink.getAttribute("href"));
                        const matrixString = getComputedStyle(this.photoSelectionContainer).transform;
                        const matrix = new WebKitCSSMatrix(matrixString);
                        const translateAmount = matrix.m41 + this.core.viewportWidth / 2 - (selectedPhotoLeftOffset + selectedPhotoContainer.clientWidth / 2);
                        if (this.core.isMobile && !this.core.isLandscape) {
                            this.backgroundScrim.style.zIndex = "inherit";
                            this.photoSelectionContainer.style.transition = `opacity .5s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                            yield Promise.all([transitionToPromise_1.animate(this.photoSelectionContainer, {
                                opacity: "0.4"
                            }), transitionToPromise_1.animate(this.backgroundScrim, {
                                opacity: "1"
                            }), transitionToPromise_1.animate(this.subheadline, {
                                opacity: "0"
                            })]).then(() => __awaiter(this, void 0, void 0, function* () {
                                document.body.insertBefore(this.photoContent, this.footer);
                                const photopage = new PhotoPage_1.PhotoPage(this.core);
                                photopage.init();
                                photopage.photo.addEventListener("loaded", this.handlePhotoPageLoaded)
                            }))
                        } else {
                            yield this.setUpPhotoDetail(selectedPhotoLink.getAttribute("href"));
                            const translateY = this.core.isMobile ? "" : "translateY(-50%)";
                            this.photoSelectionContainer.style.transition = `opacity .5s ${constants_1.CONSTANTS.DEFAULT_EASE},\n          transform .5s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                            transitionToPromise_1.animate(this.photoSelectionContainer, {
                                transform: `${translateY} translateX(${translateAmount}px)`
                            }).then(() => __awaiter(this, void 0, void 0, function* () {
                                this.backgroundScrim.style.zIndex = "inherit";
                                yield Promise.all([transitionToPromise_1.animate(this.photoSelectionContainer, {
                                    opacity: "0.4"
                                }), transitionToPromise_1.animate(this.backgroundScrim, {
                                    opacity: "1"
                                }), transitionToPromise_1.animate(this.subheadline, {
                                    opacity: "0"
                                })]).then(() => __awaiter(this, void 0, void 0, function* () {
                                    document.body.insertBefore(this.photoContent, this.footer);
                                    const photopage = new PhotoPage_1.PhotoPage(this.core);
                                    photopage.init();
                                    photopage.photo.addEventListener("loaded", this.handlePhotoPageLoaded)
                                }))
                            }))
                        }
                    }
                })
            }
            createButtons() {
                this.leftArrow = document.createElement("button");
                this.leftArrow.classList.add("home-carousel-arrow", "home-carousel-arrow-left", "-inactive");
                this.leftArrow.innerHTML = '<span class="-off-screen">Previous<span>';
                this.rightArrow = document.createElement("button");
                this.rightArrow.classList.add("home-carousel-arrow", "home-carousel-arrow-right");
                this.rightArrow.innerHTML = '<span class="-off-screen">Next</span>';
                this.container.appendChild(this.leftArrow);
                this.container.appendChild(this.rightArrow);
                this.leftArrow.addEventListener("click", this.handlePrevious);
                this.rightArrow.addEventListener("click", this.handleNext)
            }
            handlePhotoPageLoaded() {
                this.pageContent.setAttribute("style", "position: absolute; top: 0; left: 0; right: 0;");
                document.body.classList.add("body-photo");
                document.body.classList.remove("body-home");
                document.querySelector(".js-sticky-header").classList.add(CLASSES.HIDE_NAV, CLASSES.SHOW_NAV);
                this.pageContent.style.opacity = "0.4";
                this.pageContent.style.transition = `opacity 500ms ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                transitionToPromise_1.animate(this.pageContent, {
                    opacity: "0"
                }).then(() => document.body.removeChild(this.pageContent))
            }
            setUpPhotoDetail(href) {
                return __awaiter(this, void 0, void 0, function* () {
                    const axiosInstance = axios_1.default.create({
                        headers: {
                            "Content-Type": "application/json;charset=UTF-8"
                        }
                    });
                    yield axiosInstance.get(href).then(response => {
                        const responseHtml = response.data;
                        const wrapper = document.createElement("div");
                        wrapper.innerHTML = responseHtml;
                        this.photoContent = wrapper.querySelector("#content");
                        if (this.photoContent === null) {
                            return false
                        }
                        const currentState = history.state;
                        const currentLoc = window.location.pathname;
                        history.pushState(currentState, currentLoc, `${href}`)
                    })
                })
            }
        }
        exports.PhotoSelectCarousel = PhotoSelectCarousel
    }, {
        "../util/Point": 51,
        "../util/constants": 55,
        "../util/mathUtil": 60,
        "../util/nodeListToArray": 61,
        "../util/prefersReducedMotion": 62,
        "../util/transitionToPromise": 65,
        "./PhotoPage": 42,
        axios: 1,
        hammerjs: 26
    }],
    44: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const SELECTORS = {
            CONTENT: ".js-share-modal-content",
            COPY_BUTTON: ".js-copy-button",
            COPY_TEXTAREA: ".js-copy-text",
            SCRIM: ".js-share-modal-scrim",
            SHARE_TEXT: 'meta[property="og:description"]',
            SHARE_TITLE: 'meta[property="og:title"]',
            TRIGGER: ".js-share-link",
            CLOSE_BUTTON: ".js-share-modal-close"
        };
        const CLASSES = {
            ACTIVE: "-active",
            MODAL_READY: "-ready",
            SUCCESS: "-success",
            HIDE: "-hide"
        };
        /*class ShareModal {
            constructor() {
                this.keyCode = Object.freeze({
                    ESC: 27
                });
                this.modalTrigger = document.querySelector(SELECTORS.TRIGGER);
                if (this.modalTrigger.hash) {
                    this.modalContainer = document.querySelector(this.modalTrigger.hash)
                } else {
                    return
                }
                this.handleKeydown = this.handleKeydown.bind(this);
                this.init()
            }
            init() {
                this.setupModal();
                this.modalTrigger.addEventListener("click", this.handleTrigger.bind(this))
            }
            setupModal() {
                this.modalContainer.classList.add(CLASSES.MODAL_READY);
                this.scrim = this.modalContainer.querySelector(SELECTORS.SCRIM);
                this.closeButton = this.modalContainer.querySelector(SELECTORS.CLOSE_BUTTON);
                this.scrim.addEventListener("click", this.closeModal.bind(this));
                this.modalContent = this.modalContainer.querySelector(SELECTORS.CONTENT);
                this.copyButtons = nodeListToArray_1.nodeListToArray(this.modalContainer.querySelectorAll(SELECTORS.COPY_BUTTON));
                this.copyText = this.modalContainer.querySelector(SELECTORS.COPY_TEXTAREA);
                this.copyButtons.forEach(button => button.addEventListener("click", this.handleCopyButton.bind(this)));
                this.closeButton.addEventListener("click", this.handleCloseTrigger.bind(this))
            }
            handleKeydown(e) {
                switch (e.keyCode) {
                    case this.keyCode.ESC:
                        this.closeModal();
                        break
                }
            }
            handleTrigger(e) {
                e.preventDefault();
                this.modalContainer.classList.add(CLASSES.ACTIVE);
                this.closeButton.focus();
                document.addEventListener("keydown", this.handleKeydown)
            }
            handleCloseTrigger(e) {
                e.preventDefault();
                this.closeModal()
            }
            closeModal() {
                this.modalContainer.classList.remove(CLASSES.ACTIVE);
                this.modalTrigger.focus();
                document.removeEventListener("keydown", this.handleKeydown)
            }
            triggerNativeShare(e) {
                e.preventDefault();
                navigator.share({
                    title: document.querySelector(SELECTORS.SHARE_TITLE).textContent,
                    text: this.modalContainer.querySelector(SELECTORS.SHARE_TEXT).textContent,
                    url: window.location.href
                })
            }
            handleCopyButton(e) {
                e.preventDefault();
                const range = document.createRange();
                range.selectNode(this.copyText);
                window.getSelection().addRange(range);
                this.copyText.select();
                const successMessage = document.createElement("span");
                successMessage.classList.add(CLASSES.SUCCESS);
                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    this.copyText.setSelectionRange(0, 999999)
                }
                try {
                    document.execCommand("copy");
                    successMessage.innerText = "Copied to clipboard"
                } catch (_a) {
                    successMessage.innerText = "Copy failed";
                    return
                }
                this.modalContent.appendChild(successMessage);
                window.getSelection().removeAllRanges();
                setTimeout(() => successMessage.classList.add(CLASSES.HIDE), 2e3);
                setTimeout(() => this.modalContent.removeChild(successMessage), 3e3)
            }
        }
        exports.ShareModal = ShareModal*/
    }, {
        "../util/nodeListToArray": 61
    }],
    45: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const imageUtils_1 = require("../util/imageUtils");
        const ParticlesAmbient_1 = require("./ParticlesAmbient");
        class DoSparkles {
            constructor(vidCanvasContext, videoStream, canvas, canvasContext, pixels, done, photoBounds, particleDiv) {
                this.particleSize = 5;
                this.vidCanvasContext = vidCanvasContext;
                this.videoStream = videoStream;
                this.canvas = canvas;
                this.canvasContext = canvasContext;
                this.pixels = pixels;
                this.done = done;
                this.photoBounds = photoBounds;
                this.particleDiv = particleDiv;
                this.randomValues = [];
                this.addEdgeDetectionParticles = this.addEdgeDetectionParticles.bind(this);
                this.init()
            }
            init() {
                this.vidCanvasContext.drawImage(this.videoStream, 0, 0, this.canvas.width, this.canvas.height);
                this.pixels = this.vidCanvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
                const pixels = imageUtils_1.grayscale(this.pixels);
                this.corners = imageUtils_1.detectEdges(pixels, this.canvas.width, this.canvas.height);
                this.amount = 15;
                this.particleOrder = ParticlesAmbient_1.ParticleOrder.Random;
                if (!this.done) {
                    this.undetectedParticles()
                } else {
                    this.detectedParticles()
                }
            }
            destroy() {
                this.particles.destroy()
            }
            shuffle(a) {
                let x = [];
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    x = a[i];
                    a[i] = a[j];
                    a[j] = x
                }
                return a
            }
            undetectedParticles() {
                for (let i = 0; i < this.corners.length; i += 1) {
                    const pair = [this.corners[i][0] / this.canvas.width, this.corners[i][1] / this.canvas.height];
                    this.randomValues.push(pair)
                }
                const selected = [];
                for (let i = 0; i < this.randomValues.length; i++) {
                    let add = true;
                    for (let j = 0; j < selected.length; j++) {
                        if (imageUtils_1.getDistance(this.randomValues[i][0], this.randomValues[i][1], selected[j][0], selected[j][1]) < .1) {
                            add = false
                        }
                    }
                    if (add) {
                        selected.push(this.randomValues[i])
                    }
                }
                const shuffled = this.shuffle(selected);
                let final = [];
                if (shuffled.length > this.amount) {
                    for (let k = 0; k < this.amount; k++) {
                        final.push(shuffled[k])
                    }
                }
                const particles = this.addEdgeDetectionParticles(this.particleDiv, JSON.stringify(final));
                setTimeout(particles.fadeOutDots, 500)
            }
            detectedParticles() {
                for (let i = 0; i < this.corners.length; i += 1) {
                    if (this.corners[i][0] < this.photoBounds.rightX && this.corners[i][0] > this.photoBounds.leftX) {
                        if (this.corners[i][1] > this.photoBounds.topY && this.corners[i][1] < this.photoBounds.bottomY) {
                            const pair = [this.corners[i][0] / this.canvas.width, this.corners[i][1] / this.canvas.height];
                            this.randomValues.push(pair)
                        }
                    }
                }
                const selected = [];
                for (let i = 0; i < this.randomValues.length; i++) {
                    let add = true;
                    for (let j = 0; j < selected.length; j++) {
                        if (imageUtils_1.getDistance(this.randomValues[i][0], this.randomValues[i][1], selected[j][0], selected[j][1]) < .08) {
                            add = false
                        }
                    }
                    if (add) {
                        selected.push(this.randomValues[i])
                    }
                }
                const shuffled = this.shuffle(selected);
                let final = [];
                if (shuffled.length > this.amount) {
                    for (let k = 0; k < this.amount; k++) {
                        final.push(shuffled[k])
                    }
                }
                this.particles = this.addEdgeDetectionParticles(this.particleDiv, JSON.stringify(final))
            }
            addEdgeDetectionParticles(picture, dataStr) {
                const particles = new ParticlesAmbient_1.ParticlesAmbient(picture, this.particleSize);
                if (dataStr) {
                    particles.initWithPlacements(dataStr, undefined, undefined, undefined, this.particleOrder)
                }
                return particles
            }
        }
        exports.DoSparkles = DoSparkles
    }, {
        "../util/imageUtils": 56,
        "./ParticlesAmbient": 41
    }],
    46: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const SELECTORS = {
            STORIES_NAV_CONTAINER: ".js-stories-nav",
            STORIES_TITLES: ".js-stories-titles",
            STORIES_TITLE: ".js-stories-title",
            STORIES_IMAGES: ".js-stories-images",
            STORIES_IMAGE: ".js-stories-image"
        };
        const CLASSES = {
            ACTIVE: "-active",
            LEVEL_ONE: "-level-1",
            LEVEL_TWO: "-level-2",
            LEVEL_THREE: "-level-3"
        };
        class StoriesNav {
            constructor() {
                this.containerWidth = 0;
                this.storyWidth = 0;
                this.storyMargin = 0;
                this.currentIndex = 0;
                this.maxTranslate = 0;
                this.windowSize = window.innerWidth;
                this.storiesNavEl = document.querySelector(SELECTORS.STORIES_NAV_CONTAINER);
                this.storyTitleContainer = document.querySelector(SELECTORS.STORIES_TITLES);
                this.storiesTitles = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.STORIES_TITLE));
                this.storyImageContainer = document.querySelector(SELECTORS.STORIES_IMAGES);
                this.storiesImages = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.STORIES_IMAGE));
                this.getDomSizes = this.getDomSizes.bind(this);
                this.handleResize = this.handleResize.bind(this);
                this.handleTitleMouseenter = this.handleTitleMouseenter.bind(this);
                this.tearDown = this.tearDown.bind(this);
                this.init()
            }
            init() {
                this.setUpCarousel();
                window.addEventListener("resize", this.handleResize)
            }
            tearDown() {
                this.storiesImages.forEach(image => {
                    image.classList.remove(CLASSES.LEVEL_ONE, CLASSES.LEVEL_TWO, CLASSES.LEVEL_THREE)
                });
                this.storiesNavEl.classList.remove(CLASSES.ACTIVE);
                this.storiesTitles.forEach((title, index) => {
                    title.removeEventListener("mouseenter", this.storiesEventListeners[index])
                });
                this.containerWidth = 0;
                this.storyWidth = 0;
                this.storyMargin = 0;
                this.currentIndex = 0;
                this.maxTranslate = 0
            }
            handleResize() {
                requestAnimationFrame(this.getDomSizes)
            }
            setUpCarousel() {
                this.getDomSizes();
                this.storiesNavEl.classList.add(CLASSES.ACTIVE);
                this.setActiveIndex(this.currentIndex);
                this.storiesEventListeners = [];
                this.storiesTitles.forEach((title, index) => {
                    this.storiesEventListeners[index] = this.handleTitleMouseenter.bind(this, index);
                    title.addEventListener("mouseenter", this.storiesEventListeners[index])
                })
            }
            handleTitleMouseenter(index) {
                this.setActiveIndex(index)
            }
            getDomSizes() {
                this.windowSize = window.innerWidth
            }
            setActiveIndex(nextIndex) {
                this.storiesImages.forEach((image, index) => {
                    image.classList.remove(CLASSES.LEVEL_ONE, CLASSES.LEVEL_TWO, CLASSES.LEVEL_THREE)
                });
                const totalStoriesImages = this.storiesImages.length;
                this.storiesImages[nextIndex].classList.add(CLASSES.LEVEL_ONE);
                this.storiesImages[(nextIndex + 1) % totalStoriesImages].classList.add(CLASSES.LEVEL_TWO);
                this.storiesImages[(nextIndex + 2) % totalStoriesImages].classList.add(CLASSES.LEVEL_THREE);
                this.currentIndex = nextIndex
            }
        }
        exports.StoriesNav = StoriesNav
    }, {
        "../util/nodeListToArray": 61
    }],
    47: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const loadImageAsync_1 = require("../util/loadImageAsync");
        const nodeListToArray_1 = require("../util/nodeListToArray");
        const prefersReducedMotion_1 = require("../util/prefersReducedMotion");
        const transitionToPromise_1 = require("../util/transitionToPromise");
        const Point_1 = require("../util/Point");
        const Rectangle_1 = require("../util/Rectangle");
        const AudioPlayer_1 = require("./AudioPlayer");
        const CardCarousel_1 = require("./CardCarousel");
        const DriftMotion_1 = require("./DriftMotion");
        const ParticlesAmbient_1 = require("./ParticlesAmbient");
        const StoriesNav_1 = require("./StoriesNav");
        const constants_1 = require("../util/constants");
        const WavyLine_1 = require("./WavyLine");
        const SELECTORS = {
            CARD_CAROUSEL: ".js-card-carousel",
            CLOUD_MODULE_MESSAGE: ".js-cloud-module-message",
            BACKGROUND_AUDIO_ELEMENT: ".js-background-audio",
            BACKGROUND_AUDIO_CONTROL: ".js-audio-control",
            AUDIO_CONTROL_LABEL: ".js-audio-control-label",
            AUDIO_BLOCKS: ".js-block-audio",
            HEADER: ".js-sticky-header",
            INTRO_BACKGROUND: ".js-intro-background",
            INTRO_BACKGROUND_IMAGE: ".js-intro-background-image",
            WORK_WITH_US_LABEL: "#js-work-with-us",
            HINT_PARTICLE_LABEL: "#js-hint",
            INTRO_BACKGROUND_LOADER: ".js-intro-background-loader",
            INTRO_PARTICLES: ".js-intro-particles-container",
            RECAP_DRIFTERS: ".js-drifter",
            RECAP_TEXT: ".js-recap-text",
            STORY: ".story",
            STORY_BLOCKS: ".js-story-block",
            STORY_BLOCK_ANIMATE_REVEAL: ".js-animate-reveal",
            STORY_MAIN: ".story--main",
            STORY_PARTICLES_CONTAINER: ".js-particles-container",
            STORY_RECAP_IMAGES: ".js-recap-images",
            STORIES_TITLE: ".js-stories-title"
        };
        const CLASSES = {
            PLAYING: "-playing",
            HIDDEN: "-hidden",
            ACTIVE: "-active",
            CLOUD_MODULE_MESSAGE: "cloud-module-message",
            SOURCE_LABEL: "source-label"
        };
        const SHOW_INTRO_BG_ABOVE = 199;
        const HIDE_INTRO_BG_BELOW = 200;
        const BACKGROUND_SIZE_VMAX = 100;
        const DO_BOINGY_CENTER_LINE = false;
        const DRIFT_DISTANCE = .6;
        const DRIFT_SPEED = 2;
        const AUTOSCROLL_ENABLED = false;
        const AUTOSCROLL_SPEED = .8;
        const AUTOSCROLL_DELAY = 3;
        const AUTOSCROLL_RAMP_UP_TIME = 2;
        class StoryPage {
            constructor(core) {
                this.audioHasStarted = false;
                this.isHeroImageLoaded = false;
                this.isShowingHeroImage = false;
                this.storyBlocks = [];
                this.isMobileCarouselActive = false;
                this.isDesktopCarouselActive = false;
                this.isAutoscrollRunning = false;
                this.autoscrollTime = 0;
                this.autoscrollY = 0;
                this.lastTop = 0;
                this.core = core;
                this.pageStartDate = new Date;
                this.backgroundAudioEl = document.querySelector(SELECTORS.BACKGROUND_AUDIO_ELEMENT);
                this.backgroundAudioControl = document.querySelector(SELECTORS.BACKGROUND_AUDIO_CONTROL);
                this.storiesTitles = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.STORIES_TITLE));
                this.audioControlLabel = document.querySelector(SELECTORS.AUDIO_CONTROL_LABEL);
                this.audioBlocks = nodeListToArray_1.nodeListToArray(document.querySelectorAll(SELECTORS.AUDIO_BLOCKS));
                this.recapElem = document.querySelector(SELECTORS.STORY_RECAP_IMAGES);
                this.wavyLine = new WavyLine_1.WavyLine;
                this.handleScroll = this.handleScroll.bind(this);
                this.backgroundAudioSetup = this.backgroundAudioSetup.bind(this);
                this.heroImageDidLoad = this.heroImageDidLoad.bind(this);
                this.autoscrollLoop = this.autoscrollLoop.bind(this);
                this.handleScroll = this.handleScroll.bind(this);
                this.handleCarouselUpdate = this.handleCarouselUpdate.bind(this);
                this.handleResize = this.handleResize.bind(this);
                this.setupByWindowSize = this.setupByWindowSize.bind(this);
                this.tearDownMobileCarousel = this.tearDownMobileCarousel.bind(this);
                this.handleAudioControlFocus = this.handleAudioControlFocus.bind(this);
                this.handleAudioControlBlur = this.handleAudioControlBlur.bind(this)
            }
            init() {

                
                this.initRecapImages();
                const heroLoader = document.querySelector(SELECTORS.INTRO_BACKGROUND_LOADER);
                const heroImg = heroLoader.querySelector("img");
                loadImageAsync_1.loadImageAsync(heroImg).then(() => {
                    this.heroImageDidLoad()
                });
                const storyBlockElems = document.querySelectorAll(SELECTORS.STORY_BLOCKS);
                this.storyBlocks = nodeListToArray_1.nodeListToArray(storyBlockElems).map(elem => {
                    return {
                        elem: elem,
                        isShowing: false,
                        isRecap: false
                    }
                });
                const recapTextElem = document.querySelector(SELECTORS.RECAP_TEXT);
                if (recapTextElem) {
                    this.storyBlocks.push({
                        elem: recapTextElem,
                        isShowing: false,
                        isRecap: true
                    })
                }
                const storyMain = document.querySelector(SELECTORS.STORY_MAIN);
                const pt0 = new Point_1.Point(0, 0);
                this.wavyLine.init(storyMain, pt0, pt0);
                this.updateWavyLinePosition()
            }
            heroImageDidLoad() {
                this.isHeroImageLoaded = true;
                const heroLoader = document.querySelector(SELECTORS.INTRO_BACKGROUND_LOADER);
                const heroImg = heroLoader.querySelector("img");
                const url = heroImg.currentSrc;
                heroLoader.remove();
                window.addEventListener("scroll", this.handleScroll);
                this.handleScroll();
                const introBg = document.querySelector(SELECTORS.INTRO_BACKGROUND_IMAGE);
                let _style = introBg.style;
                _style["background-image"] = 'url("' + url + '")';
                const top = window.pageYOffset || document.documentElement.scrollTop;
                if (top < 100 && AUTOSCROLL_ENABLED) {
                    if (prefersReducedMotion_1.prefersReducedMotion()) {
                        return
                    }
                    this.isAutoscrollRunning = true;
                    this.lastAutoscrollDate = new Date;
                    requestAnimationFrame(this.autoscrollLoop)
                }
            }
            autoscrollLoop() {
                if (!this.isAutoscrollRunning) {
                    return
                }
                const now = new Date;
                const elapsed = (now.getTime() - this.lastAutoscrollDate.getTime()) / 1e3;
                this.lastAutoscrollDate = now;
                this.autoscrollTime += elapsed;
                if (this.autoscrollTime >= AUTOSCROLL_DELAY) {
                    const ramp = Math.min(1, (this.autoscrollTime - AUTOSCROLL_DELAY) / AUTOSCROLL_RAMP_UP_TIME);
                    this.autoscrollY += AUTOSCROLL_SPEED * ramp;
                    window.scrollTo(0, Math.round(this.autoscrollY))
                }
                requestAnimationFrame(this.autoscrollLoop)
            }
            handleScroll() {
                const top = window.pageYOffset || document.documentElement.scrollTop;
                if (Math.abs(top - this.lastTop) > 1) {
                    this.isAutoscrollRunning = false
                }
                this.updateHeroOpacity(top);
                this.updateStoryBlocks();
                this.updateRecapImages();
                this.lastTop = top
            }
            updateHeroOpacity(top) {
                const introBg = document.querySelector(SELECTORS.INTRO_BACKGROUND_IMAGE);
                const workWithUs = document.querySelector(SELECTORS.WORK_WITH_US_LABEL);
                const hintParticle = document.querySelector(SELECTORS.HINT_PARTICLE_LABEL);
                if (top < SHOW_INTRO_BG_ABOVE && !this.isShowingHeroImage) {
                    this.isShowingHeroImage = true;
                    transitionToPromise_1.animate(workWithUs, {
                        opacity: "0.0"
                    })
                    transitionToPromise_1.animate(hintParticle, {
                        opacity: "1.0"
                    })
                    transitionToPromise_1.animate(introBg, {
                        // opacity: ".6"
                        opacity: "0.0"
                    }).then(() => {
                        if (!this.isShowingHeroImage) {
                            return
                        }
                        const particleContainer = document.querySelector(SELECTORS.INTRO_PARTICLES);
                        if (!particleContainer) {
                            return
                        }
                        const particleJson = particleContainer.dataset.particles;
                        if (particleJson) {
                            this.introParticles = new ParticlesAmbient_1.ParticlesAmbient(particleContainer, constants_1.CONSTANTS.PARTICLE_RADIUS_PX);
                            const target = document.querySelector(SELECTORS.INTRO_BACKGROUND);
                            const sz = target.offsetHeight;
                            const bounds = new Rectangle_1.Rectangle((window.innerWidth - sz) / 2, 0, sz, sz);
                            const containerStyle = {
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: BACKGROUND_SIZE_VMAX + "vmax",
                                height: BACKGROUND_SIZE_VMAX + "vmax"
                            };
                            this.introParticles.initWithPlacements(particleJson, undefined, bounds, containerStyle)
                        }
                    })
                } else if (top >= HIDE_INTRO_BG_BELOW && this.isShowingHeroImage) {
                    this.isShowingHeroImage = false;
                    if (this.introParticles) {
                        this.introParticles.runDotsInReverse()
                    }
                    this.introParticles = undefined;
                    transitionToPromise_1.animate(introBg, {
                        opacity: "0.0"
                    })
                    transitionToPromise_1.animate(workWithUs, {
                        opacity: "1.0"
                    })
                    transitionToPromise_1.animate(hintParticle, {
                        opacity: "0.0"
                    })
                }
                this.setupByWindowSize();
                window.addEventListener("resize", this.handleResize)
            }
            updateStoryBlocks() {
                let pluckY = 0;
                let pluckDir = 0;
                const wavyTop = this.wavyLine.svg.getBoundingClientRect().top;
                let newestCloudMessage = undefined;
                this.storyBlocks.forEach(block => {
                    if (block.isShowing) {
                        return
                    }
                    const rect = block.elem.getBoundingClientRect();
                    const thresholdY = window.innerHeight * (block.isRecap ? .67 : .5);
                    if (rect.top > thresholdY) {
                        return
                    }
                    block.isShowing = true;
                    block.elem.classList.add(CLASSES.ACTIVE);
                    newestCloudMessage = block.isRecap ? "Search complete" : "Connecting to Google Cloud...";
                    const animateElems = block.elem.querySelectorAll(SELECTORS.STORY_BLOCK_ANIMATE_REVEAL);
                    let index = 0;
                    animateElems.forEach(_anim => {
                        const anim = _anim;
                        const style = anim.style;
                        const MOVE_DISTANCE = 120;
                        if (!prefersReducedMotion_1.prefersReducedMotion()) {
                            if (index === 0 && !block.isRecap) {
                                const isLeftSide = block.elem.classList.contains("grid-left-side");
                                const offsetX = MOVE_DISTANCE * (isLeftSide ? -1 : 1);
                                style.transform = `translate(${offsetX}px, 0)`;
                                const animRect = anim.getBoundingClientRect();
                                pluckY = animRect.top - wavyTop + animRect.height / 2;
                                pluckDir = isLeftSide ? -1 : 1
                            } else {
                                const offsetY = MOVE_DISTANCE * (block.isRecap ? .6 : 1);
                                style.transform = `translate(0, ${offsetY}px)`
                            }
                        }
                        let delay = index * .26 + .06;
                        if (block.isRecap) {
                            delay = 0
                        }
                        requestAnimationFrame(() => {
                            style.transition = `all 1100ms ${constants_1.CONSTANTS.DEFAULT_EASE} ${delay}s`;
                            transitionToPromise_1.animate(anim, {
                                opacity: "1.0",
                                transform: "translate(0, 0)"
                            })
                        });
                        anim.querySelectorAll(SELECTORS.STORY_PARTICLES_CONTAINER).forEach(_container => {
                            const container = _container;
                            const particleJson = container.dataset.particles;
                            if (particleJson) {
                                const particles = new ParticlesAmbient_1.ParticlesAmbient(container, constants_1.CONSTANTS.PARTICLE_RADIUS_PX);
                                const img = block.elem.querySelector("img");
                                particles.initWithPlacements(particleJson, img)
                            }
                        });
                        index++
                    })
                });
                if (pluckDir !== 0 && !prefersReducedMotion_1.prefersReducedMotion() && DO_BOINGY_CENTER_LINE) {
                    const now = new Date;
                    const elapsed_ms = now.getTime() - this.pageStartDate.getTime();
                    if (elapsed_ms > 3e3) {
                        setTimeout(() => {
                            const amplitude = .57;
                            const duration = 1.1;
                            this.wavyLine.doPluckAnimation(pluckY, pluckDir * amplitude, 150, 700, duration)
                        }, 150)
                    }
                }
            }
            handleResize() {
                requestAnimationFrame(this.setupByWindowSize)
            }
            setupByWindowSize() {
                if (window.innerWidth < 1024) {
                    if (!this.isMobileCarouselActive) {
                        this.setupMobileCarousel();
                        if (this.isDesktopCarouselActive) {
                            this.tearDownDesktopCarousel()
                        }
                    }
                } else if (this.isMobileCarouselActive) {
                    this.tearDownMobileCarousel();
                    this.setupDesktopCarousel()
                } else if (!this.isDesktopCarouselActive) {
                    this.setupDesktopCarousel()
                }
                this.updateWavyLinePosition()
            }
            updateWavyLinePosition() {
                const storyMain = document.querySelector(SELECTORS.STORY_MAIN);
                const storyMainRect = storyMain.getBoundingClientRect();
                const atX = storyMainRect.width / 2 - WavyLine_1.PLUCK_DISTANCE;
                const pt0 = new Point_1.Point(atX, 0);
                const pt1 = new Point_1.Point(atX, storyMainRect.height);
                this.wavyLine.setEndpoints(pt0, pt1);
                this.wavyLine.redraw()
            }
            initRecapImages() {
                if (prefersReducedMotion_1.prefersReducedMotion()) {
                    this.updateRecapImages(true);
                    return
                }
                const scaleAmount = this.core.isMobile ? .9 : .25;
                this.recapElem.querySelectorAll("img").forEach(img => {
                    img.style.transform = `scale(${scaleAmount})`
                });
                const drifters = this.recapElem.querySelectorAll(SELECTORS.RECAP_DRIFTERS);
                drifters.forEach((elem, index) => {
                    const offsetPercent = this.core.isMobile ? .01 : 3;
                    const offset = offsetPercent * (index === 0 ? 1 : -1);
                    const _elem = elem;
                    _elem.style.left = offset + "%"
                })
            }
            updateRecapImages(forceCreate = false) {
                if (this.recapLine) {
                    return
                }
                const recapRect = this.recapElem.getBoundingClientRect();
                if (recapRect.top > window.innerHeight * .8) {
                    if (!forceCreate) {
                        return
                    }
                }
                this.recapLine = new WavyLine_1.WavyLine;
                const imgs = nodeListToArray_1.nodeListToArray(this.recapElem.querySelectorAll("img"));
                const time = 1;
                imgs.forEach(img => {
                    img.style.transition = `transform ${time}s ease-in-out`;
                    transitionToPromise_1.animate(img, {
                        transform: "scale(1.0)"
                    })
                });
                requestAnimationFrame(() => {
                    const drifters = nodeListToArray_1.nodeListToArray(this.recapElem.querySelectorAll(SELECTORS.RECAP_DRIFTERS));
                    drifters.forEach(drifter => {
                        drifter.style.transition = `left ${time}s ${constants_1.CONSTANTS.DEFAULT_EASE}`;
                        transitionToPromise_1.animate(drifter, {
                            left: "0"
                        })
                    });
                    const pluckDuration = 1.05;
                    this.recapLine.init(this.recapElem, imgs[0], imgs[1]);
                    this.recapLine.attach0ratio.y = .45 + Math.random() * .05;
                    this.recapLine.attach1ratio.y = .45 + Math.random() * .05;
                    this.recapLine.decayRate = 3;
                    const amplitude = prefersReducedMotion_1.prefersReducedMotion() ? 0 : 1.5;
                    this.recapLine.doPluckAnimation("50%", amplitude, 150, 700, pluckDuration);
                    if (!prefersReducedMotion_1.prefersReducedMotion()) {
                        const isMouseReactive = false;
                        this.recapDriftMotion = new DriftMotion_1.default(drifters, isMouseReactive);
                        this.recapDriftMotion.distanceMult = this.core.isMobile ? .2 : DRIFT_DISTANCE;
                        this.recapDriftMotion.distanceRampUp = 0;
                        this.recapDriftMotion.speedMult = this.core.isMobile ? 1 : DRIFT_SPEED;
                        this.recapLine.redrawEveryFrame = true
                    }
                })
            }
            setupMobileCarousel() {
                this.carousel = new CardCarousel_1.CardCarousel(document.querySelector(SELECTORS.CARD_CAROUSEL));
                this.carousel.container.addEventListener("update", this.handleCarouselUpdate);
                this.storiesTitles[0].classList.add(CLASSES.ACTIVE);
                this.isMobileCarouselActive = true
            }
            tearDownMobileCarousel() {
                this.carousel.container.removeEventListener("update", this.handleCarouselUpdate);
                this.carousel.tearDown();
                this.storiesTitles.forEach(title => {
                    title.classList.remove(CLASSES.ACTIVE)
                });
                this.isMobileCarouselActive = false
            }
            handleCarouselUpdate(e) {
                this.storiesTitles.forEach((title, index) => {
                    if (index === e.detail.activeIndex) {
                        title.classList.add(CLASSES.ACTIVE)
                    } else {
                        title.classList.remove(CLASSES.ACTIVE)
                    }
                })
            }
            setupDesktopCarousel() {
                this.storiesNav = new StoriesNav_1.StoriesNav;
                this.isDesktopCarouselActive = true
            }
            tearDownDesktopCarousel() {
                this.storiesNav.tearDown();
                this.isDesktopCarouselActive = false
            }
            handleAudioControlFocus() {
                if (this.backgroundAudioControl.dataset.playing === "true") {
                    this.audioControlLabel.innerText = "Sound Off"
                } else {
                    this.audioControlLabel.innerText = "Sound On"
                }
                return true
            }
            handleAudioControlBlur() {
                if (this.backgroundAudioControl.dataset.playing === "true") {
                    this.audioControlLabel.innerText = "Sound On"
                } else {
                    this.audioControlLabel.innerText = "Sound Off"
                }
                return true
            }
            backgroundAudioSetup() {
                this.backgroundAudioTrack = this.backgroundAudioContext.createMediaElementSource(this.backgroundAudioEl);
                this.backgroundAudioTrack.connect(this.backgroundAudioContext.destination);
                this.backgroundAudioEl.loop = true;
                this.backgroundAudioControl.addEventListener("click", this.handleAudioControl.bind(this, this.backgroundAudioEl));
                const audioPromise = this.backgroundAudioEl.play();
                audioPromise.then(() => {
                    this.audioHasStarted = true;
                    this.setAudioControlActive(this.backgroundAudioControl)
                }).catch(e => {
                    console.log("error playing audio", e)
                })
            }
            handleAudioControl(audioEl, e) {
                e.preventDefault();
                const audioTarget = e.currentTarget;
                if (audioTarget.dataset.playing === "false") {
                    this.backgroundAudioContext.resume();
                    audioEl.play();
                    this.setAudioControlActive(audioTarget)
                } else if (audioTarget.dataset.playing === "true") {
                    audioEl.pause();
                    this.setAudioControlInactive(audioTarget)
                }
            }
            setAudioControlActive(el) {
                el.dataset.playing = "true";
                el.setAttribute("aria-checked", "true");
                el.querySelector(SELECTORS.AUDIO_CONTROL_LABEL).innerHTML = "Sound On";
                el.classList.add(CLASSES.PLAYING)
            }
            setAudioControlInactive(el) {
                el.dataset.playing = "false";
                el.setAttribute("aria-checked", "false");
                el.querySelector(SELECTORS.AUDIO_CONTROL_LABEL).innerHTML = "Sound Off";
                el.classList.remove(CLASSES.PLAYING)
            }
            showCloudMessageElem(messageText) {
                if (this.cloudMessageElem) {
                    const oldMessage = this.cloudMessageElem;
                    transitionToPromise_1.animate(oldMessage, {
                        opacity: "0"
                    }).then(() => {
                        oldMessage.remove()
                    })
                }
                const message = document.createElement("div");
                message.classList.add(CLASSES.SOURCE_LABEL, CLASSES.CLOUD_MODULE_MESSAGE);
                message.innerText = messageText;
                const storyElem = document.querySelector(SELECTORS.HEADER);
                storyElem.appendChild(message);
                transitionToPromise_1.animate(message, {
                    opacity: "1"
                });
                this.cloudMessage = messageText;
                this.cloudMessageElem = message
            }
        }
        exports.StoryPage = StoryPage
    }, {
        "../util/Point": 51,
        "../util/Rectangle": 52,
        "../util/constants": 55,
        "../util/loadImageAsync": 59,
        "../util/nodeListToArray": 61,
        "../util/prefersReducedMotion": 62,
        "../util/transitionToPromise": 65,
        "./AudioPlayer": 33,
        "./CardCarousel": 34,
        "./DriftMotion": 38,
        "./ParticlesAmbient": 41,
        "./StoriesNav": 46,
        "./WavyLine": 48
    }],
    48: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const constants_1 = require("../util/constants");
        const mathUtil_1 = require("../util/mathUtil");
        const Point_1 = require("../util/Point");
        exports.PLUCK_DISTANCE = 50;
        const PLUCK_TIME = 2.2;
        const VIBRATION_SPEED = 27;
        const CLASSES = {
            WAVY_LINE: "wavy-line"
        };
        class WavyLine {
            constructor() {
                this.redrawEveryFrame = false;
                this.attach0ratio = new Point_1.Point(.5, .5);
                this.attach1ratio = new Point_1.Point(.5, .5);
                this.decayRate = 2;
                this.height = 0;
                this.heightMult = 0;
                this.lastDraw = new Date;
                this.pluckY = 0;
                this.pluckRadiusStart = 0;
                this.pluckRadiusEnd = 0;
                this.pluckTime = Infinity;
                this.pluckDuration = PLUCK_TIME;
                this.perFrame = this.perFrame.bind(this)
            }
            init(container, attach0, attach1) {
                this.container = container;
                this.svg = document.createElementNS(constants_1.CONSTANTS.SVG_NS, "svg");
                this.svg.classList.add(CLASSES.WAVY_LINE);
                this.path = document.createElementNS(constants_1.CONSTANTS.SVG_NS, "path");
                this.svg.appendChild(this.path);
                container.appendChild(this.svg);
                this.attach0 = attach0;
                this.attach1 = attach1;
                this.updateAttachPoints();
                this.redraw()
            }
            updateAttachPoints() {
                const computePoint = (attach, attachRatio) => {
                    if (attach instanceof Point_1.Point) {
                        return attach
                    }
                    const containerRect = this.container.getBoundingClientRect();
                    const elemRect = attach.getBoundingClientRect();
                    return new Point_1.Point(elemRect.left - containerRect.left - exports.PLUCK_DISTANCE / 2 + elemRect.width * attachRatio.x, elemRect.top - containerRect.top + elemRect.height * attachRatio.y)
                };
                this.setEndpoints(computePoint(this.attach0, this.attach0ratio), computePoint(this.attach1, this.attach1ratio))
            }
            setEndpoints(pt0, pt1) {
                this.height = pt0.distanceTo(pt1);
                this.svg.setAttributeNS(null, "width", (exports.PLUCK_DISTANCE * 2).toString());
                this.svg.setAttributeNS(null, "height", this.height.toString());
                const angle = Math.atan2(pt1.y - pt0.y, pt1.x - pt0.x) + Math.PI * 1.5;
                const transform = `translate(${pt0.x}px, ${pt0.y}px) rotate(${angle}rad)`;
                this.svg.style.transform = transform
            }
            redraw() {
                if (this.attach0 instanceof HTMLElement || this.attach1 instanceof HTMLElement) {
                    this.updateAttachPoints()
                }
                const atX = exports.PLUCK_DISTANCE;
                let pathStr = `M${atX} 0 `;
                if (this.pluckTime < this.pluckDuration) {
                    const time01 = this.pluckTime / this.pluckDuration;
                    const decay = Math.pow(1 - time01, this.decayRate);
                    const amt = Math.sin(time01 * time01 * VIBRATION_SPEED) * decay;
                    const pluckX = atX + amt * exports.PLUCK_DISTANCE * this.heightMult;
                    let pluckY;
                    if (typeof this.pluckY === "number") {
                        pluckY = this.pluckY
                    } else {
                        const percent = parseFloat(this.pluckY);
                        pluckY = percent / 100 * this.height
                    }
                    const radius = mathUtil_1.lerp(this.pluckRadiusStart, this.pluckRadiusEnd, Math.pow(time01, .5));
                    const radius_2 = radius / 2;
                    pathStr += `L${atX} ${pluckY-radius} `;
                    pathStr += `C${atX} ${pluckY-radius_2} `;
                    pathStr += `${pluckX} ${pluckY-radius_2} `;
                    pathStr += `${pluckX} ${pluckY} `;
                    pathStr += `S${atX} ${pluckY+radius_2} `;
                    pathStr += `${atX} ${pluckY+radius} `;
                    pathStr += `L${exports.PLUCK_DISTANCE} ${this.height}`
                } else {
                    pathStr += `L${exports.PLUCK_DISTANCE} ${this.height}`
                }
                this.path.setAttributeNS(null, "d", pathStr)
            }
            doPluckAnimation(atY, heightMult, radiusStart, radiusEnd, duration = PLUCK_TIME) {
                if (this.pluckTime >= this.pluckDuration) {
                    requestAnimationFrame(this.perFrame)
                }
                this.heightMult = heightMult;
                this.lastDraw = new Date;
                this.pluckY = atY;
                this.pluckRadiusStart = radiusStart;
                this.pluckRadiusEnd = radiusEnd;
                this.pluckTime = 0;
                this.pluckDuration = duration
            }
            perFrame() {
                const now = new Date;
                const elapsed = (now.getTime() - this.lastDraw.getTime()) / 1e3;
                this.pluckTime += elapsed;
                this.lastDraw = now;
                this.redraw();
                if (this.redrawEveryFrame || this.pluckTime < this.pluckDuration) {
                    requestAnimationFrame(this.perFrame)
                }
            }
        }
        exports.WavyLine = WavyLine
    }, {
        "../util/Point": 51,
        "../util/constants": 55,
        "../util/mathUtil": 60
    }],
    49: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const Core_1 = require("./components/Core");
        const core = new Core_1.default;
        core.init()
    }, {
        "./components/Core": 35
    }],
    50: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const DEFAULT_PARAMS = {
            constraints: {
                video: {
                    facingMode: "environment",
                    width: {
                        min: 320,
                        ideal: 1280,
                        max: 1920
                    }
                }
            },
            controls: false,
            offScreen: true
        };
        class CameraCapture {
            constructor(inParams = {}) {
                this.params = DEFAULT_PARAMS;
                Object.assign(inParams, this.params);
                let _params = this.params;
                this.video = document.createElement("video");
                this.video.className = "ar-video";
                ["autoplay", "playsinline"].forEach(attr => {
                    this.video.setAttribute(attr, "")
                });
                if (_params["controls"]) {
                    this.video.setAttribute("controls", "")
                }
                if (_params["offScreen"]) {
                    let _style = this.video.style
                }
                document.body.appendChild(this.video)
            }
            start() {
                return new Promise((resolve, reject) => {
                    if (!navigator.mediaDevices.getUserMedia) {
                        console.error("no getUserMedia");
                        reject(["Device has no getUserMedia method", navigator.mediaDevices]);
                        return
                    }
                    let _params = this.params;
                    navigator.mediaDevices.getUserMedia(_params.constraints).then(localMediaStream => {
                        this.video.oncanplay = (() => {
                            try {
                                this.video.play()
                            } catch (err) {
                                reject(["Could not play", err])
                            }
                        });
                        this.video.onplay = (() => {
                            resolve(this.video)
                        });
                        try {
                            this.video.srcObject = localMediaStream
                        } catch (err) {
                            reject(["Could not set srcObject", err])
                        }
                    }).catch(function (err) {
                        console.log("Error");
                        reject([err.name, err.message])
                    })
                })
            }
        }
        exports.CameraCapture = CameraCapture
    }, {}],
    51: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        class Point {
            constructor(inX, inY) {
                this.x = inX || 0;
                this.y = inY || 0
            }
            set(newX, newY) {
                this.x = newX;
                this.y = newY
            }
            copy(pt) {
                this.x = pt.x;
                this.y = pt.y
            }
            lerp(newPt, ratio) {
                this.x += (newPt.x - this.x) * ratio;
                this.y += (newPt.y - this.y) * ratio
            }
            distanceTo(pt) {
                const dx = this.x - pt.x;
                const dy = this.y - pt.y;
                return Math.sqrt(dx * dx + dy * dy)
            }
            distanceFromOriginLine(angle) {
                return this.y * Math.cos(angle) - this.x * Math.sin(angle)
            }
            distanceFromOriginLine_fast(cos, sin) {
                return this.y * cos - this.x * sin
            }
        }
        exports.Point = Point
    }, {}],
    52: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        class Rectangle {
            constructor(inX, inY, inWidth, inHeight) {
                this.x = inX;
                this.y = inY;
                this.width = inWidth;
                this.height = inHeight
            }
        }
        exports.Rectangle = Rectangle
    }, {}],
    53: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const baseURL = "../../nytimes/static/images/AR/blurred/";
        const uncleSam = {
            aspectRatio: 1.3,
            image: new Image
        };
        const sailors = {
            aspectRatio: .7,
            image: new Image
        };
        const bicycles = {
            aspectRatio: .7,
            image: new Image
        };
        const twins = {
            aspectRatio: 1.7,
            image: new Image
        };
        const rockefeller = {
            aspectRatio: 1.3,
            image: new Image
        };
        const bedStuy = {
            aspectRatio: .7,
            image: new Image
        };
        const xmasTree = {
            aspectRatio: .7,
            image: new Image
        };

        function loadImages() {
            uncleSam.image.src = baseURL + "uncle-sam.png";
            sailors.image.src = baseURL + "sailors.png";
            bicycles.image.src = baseURL + "bicycles.png";
            twins.image.src = baseURL + "twins.png";
            rockefeller.image.src = baseURL + "rockefeller.png";
            bedStuy.image.src = baseURL + "bed-stuy.png";
            xmasTree.image.src = baseURL + "christmas-tree.png"
        }
        exports.loadImages = loadImages;

        function getImages(photo) {
            if (photo === "uncle-sam") {
                return uncleSam
            }
            if (photo === "christmas-tree") {
                return xmasTree
            }
            if (photo === "twins") {
                return twins
            }
            if (photo === "bed-stuy") {
                return bedStuy
            }
            if (photo === "bicycles") {
                return bicycles
            }
            if (photo === "rockefeller") {
                return rockefeller
            }
            if (photo === "sailors") {
                return sailors
            }
        }
        exports.getImages = getImages
    }, {}],
    54: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function animateScrollTo(destination, duration = 200, easing = "linear", callback) {
            let easings = {};
            easings = {
                linear(t) {
                    return t
                },
                easeInQuad(t) {
                    return t * t
                },
                easeOutQuad(t) {
                    return t * (2 - t)
                },
                easeInOutQuad(t) {
                    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
                },
                easeInCubic(t) {
                    return t * t * t
                },
                easeOutCubic(t) {
                    return --t * t * t + 1
                },
                easeInOutCubic(t) {
                    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
                },
                easeInQuart(t) {
                    return t * t * t * t
                },
                easeOutQuart(t) {
                    return 1 - --t * t * t * t
                },
                easeInOutQuart(t) {
                    return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t
                },
                easeInQuint(t) {
                    return t * t * t * t * t
                },
                easeOutQuint(t) {
                    return 1 + --t * t * t * t * t
                },
                easeInOutQuint(t) {
                    return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
                }
            };
            const start = window.pageYOffset;
            const startTime = "now" in window.performance ? performance.now() : (new Date).getTime();
            const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName("body")[0].clientHeight;
            const destinationOffset = typeof destination === "number" ? destination : destination.offsetTop;
            const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
            if ("requestAnimationFrame" in window === false) {
                window.scroll(0, destinationOffsetToScroll);
                if (callback) {
                    callback()
                }
                return
            }

            function scroll() {
                const now = "now" in window.performance ? performance.now() : (new Date).getTime();
                const time = Math.min(1, (now - startTime) / duration);
                const timeFunction = easings[easing](time);
                window.scroll(0, Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start));
                if (window.pageYOffset === destinationOffsetToScroll) {
                    if (callback) {
                        callback()
                    }
                    return
                }
                requestAnimationFrame(scroll)
            }
            scroll()
        }
        exports.animateScrollTo = animateScrollTo
    }, {}],
    55: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.CONSTANTS = {
            DEFAULT_EASE: "cubic-bezier(0.21, 0.01, 0.21, 0.96)",
            DEFAULT_EASE_HARD: "cubic-bezier(0.480, 0.005, 0.165, 0.995)",
            DEFAULT_EASE_SVG: "0.21 0.01 0.21 0.96",
            DEFAULT_EASE_SVG_IN: "0.79 0.04 0.79 0.99",
            PARTICLE_RADIUS_PX: 5,
            PIXEL_EFFECT_ANGLE: 22,
            SVG_NS: "http://www.w3.org/2000/svg"
        }
    }, {}],
    56: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function grayscale(pixels) {
            let p = 0;
            let w = 0;
            let grayPixels = new Uint8ClampedArray(pixels.length);
            for (let i = 0; i < pixels.length; i++) {
                const value = pixels[w] * .299 + pixels[w + 1] * .587 + pixels[w + 2] * .114;
                grayPixels[p++] = value;
                grayPixels[p++] = value;
                grayPixels[p++] = value;
                grayPixels[p++] = value;
                w += 4
            }
            return grayPixels
        }
        exports.grayscale = grayscale;

        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
        }
        exports.getDistance = getDistance;

        function detectEdges(pixels, width, height) {
            const threshold = 20;
            const edges = [];
            let left;
            let top;
            let right;
            let bottom;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (x + y * width) * 4;
                    const pixel = pixels[index + 2];
                    left = pixels[index - 4];
                    right = pixels[index + 2];
                    top = pixels[index - width * 4];
                    bottom = pixels[index + width * 4];
                    if (pixel > left + threshold) {
                        edges.push([x, y])
                    } else if (pixel < left - threshold) {
                        edges.push([x, y])
                    } else if (pixel > right + threshold) {
                        edges.push([x, y])
                    } else if (pixel < right - threshold) {
                        edges.push([x, y])
                    } else if (pixel > top + threshold) {
                        edges.push([x, y])
                    } else if (pixel < top - threshold) {
                        edges.push([x, y])
                    } else if (pixel > bottom + threshold) {
                        edges.push([x, y])
                    } else if (pixel < bottom - threshold) {
                        edges.push([x, y])
                    }
                }
            }
            return edges
        }
        exports.detectEdges = detectEdges
    }, {}],
    57: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        const DETECT_MIN_SATURATION_YELLOW = .3;
        const DETECT_MIN_VALUE_YELLOW = .2;
        const DETECT_MAX_VALUE_YELLOW = .9;
        const DETECT_MIN_SATURATION_BLUE = .2;
        const DETECT_MIN_VALUE_BLUE = .075;
        const DETECT_MIN_SATURATION_GREEN = .2;
        const DETECT_MIN_VALUE_GREEN = .1;
        const DETECT_MIN_SATURATION_RED = .3;
        const DETECT_MIN_VALUE_RED = .1;

        function isYellow(h, s, v) {
            if (.04 < h && h < .14) {
                if (s >= DETECT_MIN_SATURATION_YELLOW) {
                    if (v >= DETECT_MIN_VALUE_YELLOW && v <= DETECT_MAX_VALUE_YELLOW) {
                        return true
                    }
                }
            }
            return false
        }

        function isBlue(h, s, v) {
            if (.52 < h && h < .8) {
                if (s >= DETECT_MIN_SATURATION_BLUE) {
                    if (v >= DETECT_MIN_VALUE_BLUE) {
                        return true
                    }
                }
            }
            return false
        }

        function isGreen(h, s, v) {
            if (.15 < h && h < .5) {
                if (s >= DETECT_MIN_SATURATION_GREEN) {
                    if (v >= DETECT_MIN_VALUE_GREEN) {
                        return true
                    }
                }
            }
            return false
        }

        function isRed(h, s, v) {
            if (h !== 0 && (h < .04 || h > .9)) {
                if (s >= DETECT_MIN_SATURATION_RED) {
                    if (v >= DETECT_MIN_VALUE_RED) {
                        return true
                    }
                }
            }
            return false
        }

        function isGoogleColor(h, s, v) {
            if (isYellow(h, s, v)) {
                return "yellow"
            } else if (isGreen(h, s, v)) {
                return "green"
            } else if (isBlue(h, s, v)) {
                return "blue"
            } else if (isRed(h, s, v)) {
                return "red"
            }
            return "none"
        }
        exports.isGoogleColor = isGoogleColor
    }, {}],
    58: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function isMobile() {
            return /Mobi|Android/i.test(navigator.userAgent)
        }
        exports.isMobile = isMobile
    }, {}],
    59: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function loadImageAsync(img) {
            return new Promise(resolve => {
                if (img.complete && img.naturalWidth > 0) {
                    resolve()
                } else {
                    img.addEventListener("load", () => {
                        resolve()
                    })
                }
            })
        }
        exports.loadImageAsync = loadImageAsync
    }, {}],
    60: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function lerp(from, to, progress) {
            return from + (to - from) * progress
        }
        exports.lerp = lerp;

        function unipolarToBipolar(n) {
            return n * 2 - 1
        }
        exports.unipolarToBipolar = unipolarToBipolar;

        function sin01(n) {
            return (Math.sin(n) + 1) * .5
        }
        exports.sin01 = sin01;

        function wrapCloseToTarget(value, modulus, target) {
            const diff = target - value;
            return value + Math.round(diff / modulus) * modulus
        }
        exports.wrapCloseToTarget = wrapCloseToTarget
    }, {}],
    61: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function nodeListToArray(nodeList) {
            const arrayFromNodeList = [];
            for (let i = 0; i < nodeList.length; i++) {
                arrayFromNodeList.push(nodeList[i])
            }
            return arrayFromNodeList
        }
        exports.nodeListToArray = nodeListToArray
    }, {}],
    62: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function prefersReducedMotion() {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches
        }
        exports.prefersReducedMotion = prefersReducedMotion
    }, {}],
    63: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function rgbToHsv(r, g, b) {
            const _min = Math.min(r, g, b);
            const _max = Math.max(r, g, b);
            const delta = _max - _min;
            if (delta === 0) {
                return [0, 0, _max]
            }
            let h6 = 0;
            const s = delta / _max;
            const v = _max;
            if (r === _max) {
                h6 = (g - b) / delta
            } else if (g === _max) {
                h6 = 2 + (b - r) / delta
            } else {
                h6 = 4 + (r - g) / delta
            }
            let h = h6 / 6;
            if (h < 0) {
                h += 1
            }
            return [h, s, v]
        }
        exports.rgbToHsv = rgbToHsv
    }, {}],
    64: [function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function reverseElementAnimation(elem, speedMult, doFlipSplines) {
            const keyTimes = elem.getAttribute("keyTimes");
            if (keyTimes) {
                const timeStrs = keyTimes.trim().split(/[\s;]+/g);
                const invertedValues = timeStrs.map(str => {
                    return (1 - parseFloat(str)).toString()
                });
                invertedValues.reverse();
                elem.setAttribute("keyTimes", invertedValues.join("; "))
            }
            const values = elem.getAttribute("values");
            if (values) {
                const valueStrs = values.trim().split(/[\s;]+/g);
                valueStrs.reverse();
                elem.setAttribute("values", valueStrs.join("; "))
            }
            if (doFlipSplines) {
                const keySplines = elem.getAttribute("keySplines");
                if (keySplines) {
                    const splines = keySplines.split(/;/g);
                    const invSplines = splines.map(numList => {
                        const numStrs = numList.trim().split(/\s+/g);
                        const inv = numStrs.map(num => {
                            return 1 - parseFloat(num)
                        });
                        return [inv[2], inv[3], inv[0], inv[1]].join(" ")
                    });
                    invSplines.reverse();
                    elem.setAttribute("keySplines", invSplines.join("; "))
                }
            }
            const dur = elem.getAttribute("dur");
            if (dur) {
                const durMatch = dur.match(/^([\d\.]+)(.+)$/);
                if (durMatch) {
                    const duration = parseFloat(durMatch[1]);
                    const units = durMatch[2];
                    elem.setAttribute("dur", duration * speedMult + units)
                }
            }
            elem.childNodes.forEach(child => {
                reverseElementAnimation(child, speedMult, doFlipSplines)
            })
        }

        function svgAnimateInReverse(elem, speedMult = 1, doFlipSplines = true) {
            reverseElementAnimation(elem, speedMult, doFlipSplines);
            const parent = elem.parentNode;
            if (parent) {
                const clone = elem.cloneNode(true);
                parent.replaceChild(clone, elem);
                elem.remove();
                return clone
            }
            return elem
        }
        exports.svgAnimateInReverse = svgAnimateInReverse
    }, {}],
    65: [function (require, module, exports) {
        "use strict";
        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value))
                    } catch (e) {
                        reject(e)
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function (resolve) {
                        resolve(result.value)
                    }).then(fulfilled, rejected)
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next())
            })
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function transitionEndPromise(element) {
            return new Promise(resolve => {
                const finished = function (event) {
                    if (event.target !== element) {
                        return
                    }
                    element.removeEventListener("transitionend", finished);
                    resolve()
                };
                element.addEventListener("transitionend", finished)
            })
        }
        exports.transitionEndPromise = transitionEndPromise;

        function requestAnimationFramePromise() {
            return new Promise(resolve => requestAnimationFrame(resolve))
        }
        exports.requestAnimationFramePromise = requestAnimationFramePromise;

        function animate(element, styles) {
            return __awaiter(this, void 0, void 0, function* () {
                Object.assign(element.style, styles);
                return transitionEndPromise(element).then(() => requestAnimationFramePromise())
            })
        }
        exports.animate = animate;

        function asyncForEach(array, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let index = 0; index < array.length; index++) {
                    yield callback(array[index], index, array)
                }
            })
        }
        exports.asyncForEach = asyncForEach;

        function delay(seconds) {
            return new Promise(resolve => {
                setTimeout(resolve, seconds * 1e3)
            })
        }
        exports.delay = delay;

        function delayOneFrame() {
            return new Promise(resolve => {
                requestAnimationFrame(resolve)
            })
        }
        exports.delayOneFrame = delayOneFrame
    }, {}],
    66: [function (require, module, exports) {
        var process = module.exports = {};
        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
            throw new Error("setTimeout has not been defined")
        }

        function defaultClearTimeout() {
            throw new Error("clearTimeout has not been defined")
        }(function () {
            try {
                if (typeof setTimeout === "function") {
                    cachedSetTimeout = setTimeout
                } else {
                    cachedSetTimeout = defaultSetTimout
                }
            } catch (e) {
                cachedSetTimeout = defaultSetTimout
            }
            try {
                if (typeof clearTimeout === "function") {
                    cachedClearTimeout = clearTimeout
                } else {
                    cachedClearTimeout = defaultClearTimeout
                }
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout
            }
        })();

        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                return setTimeout(fun, 0)
            }
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0)
            }
            try {
                return cachedSetTimeout(fun, 0)
            } catch (e) {
                try {
                    return cachedSetTimeout.call(null, fun, 0)
                } catch (e) {
                    return cachedSetTimeout.call(this, fun, 0)
                }
            }
        }

        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                return clearTimeout(marker)
            }
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker)
            }
            try {
                return cachedClearTimeout(marker)
            } catch (e) {
                try {
                    return cachedClearTimeout.call(null, marker)
                } catch (e) {
                    return cachedClearTimeout.call(this, marker)
                }
            }
        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue)
            } else {
                queueIndex = -1
            }
            if (queue.length) {
                drainQueue()
            }
        }

        function drainQueue() {
            if (draining) {
                return
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;
            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run()
                    }
                }
                queueIndex = -1;
                len = queue.length
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout)
        }
        process.nextTick = function (fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i]
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue)
            }
        };

        function Item(fun, array) {
            this.fun = fun;
            this.array = array
        }
        Item.prototype.run = function () {
            this.fun.apply(null, this.array)
        };
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = "";
        process.versions = {};

        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;
        process.listeners = function (name) {
            return []
        };
        process.binding = function (name) {
            throw new Error("process.binding is not supported")
        };
        process.cwd = function () {
            return "/"
        };
        process.chdir = function (dir) {
            throw new Error("process.chdir is not supported")
        };
        process.umask = function () {
            return 0
        }
    }, {}]
}, {}, [49]);