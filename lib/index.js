"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createConsumer = createConsumer;
Object.defineProperty(exports, "Connection", {
  enumerable: true,
  get: function () {
    return _connection.default;
  }
});
Object.defineProperty(exports, "ConnectionMonitor", {
  enumerable: true,
  get: function () {
    return _connection_monitor.default;
  }
});
Object.defineProperty(exports, "Consumer", {
  enumerable: true,
  get: function () {
    return _consumer.default;
  }
});
Object.defineProperty(exports, "createWebSocketURL", {
  enumerable: true,
  get: function () {
    return _consumer.createWebSocketURL;
  }
});
Object.defineProperty(exports, "INTERNAL", {
  enumerable: true,
  get: function () {
    return _internal.default;
  }
});
Object.defineProperty(exports, "Subscription", {
  enumerable: true,
  get: function () {
    return _subscription.default;
  }
});
Object.defineProperty(exports, "Subscriptions", {
  enumerable: true,
  get: function () {
    return _subscriptions.default;
  }
});
Object.defineProperty(exports, "adapters", {
  enumerable: true,
  get: function () {
    return _adapters.default;
  }
});
Object.defineProperty(exports, "logger", {
  enumerable: true,
  get: function () {
    return _logger.default;
  }
});

var _connection = _interopRequireDefault(require("./connection"));

var _connection_monitor = _interopRequireDefault(require("./connection_monitor"));

var _consumer = _interopRequireWildcard(require("./consumer"));

var _internal = _interopRequireDefault(require("./internal"));

var _subscription = _interopRequireDefault(require("./subscription"));

var _subscriptions = _interopRequireDefault(require("./subscriptions"));

var _adapters = _interopRequireDefault(require("./adapters"));

var _logger = _interopRequireDefault(require("./logger"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createConsumer(url = process.env.WEBSOCKET_URL || _internal.default.default_mount_path) {
  return new _consumer.default(url);
}