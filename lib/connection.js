"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _adapters = _interopRequireDefault(require("./adapters"));

var _connection_monitor = _interopRequireDefault(require("./connection_monitor"));

var _internal = _interopRequireDefault(require("./internal"));

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Encapsulate the cable connection held by the consumer. This is an internal class not intended for direct user manipulation.
const {
  message_types,
  protocols
} = _internal.default;
const supportedProtocols = protocols.slice(0, protocols.length - 1);
const indexOf = [].indexOf;

class Connection {
  constructor(consumer) {
    this.open = this.open.bind(this);
    this.consumer = consumer;
    this.subscriptions = this.consumer.subscriptions;
    this.monitor = new _connection_monitor.default(this);
    this.disconnected = true;
  }

  send(data) {
    if (this.isOpen()) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  }

  open() {
    if (this.isActive()) {
      _logger.default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);

      return false;
    } else {
      _logger.default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);

      if (this.webSocket) {
        this.uninstallEventHandlers();
      }

      this.webSocket = new _adapters.default.WebSocket(this.consumer.url, protocols);
      this.installEventHandlers();
      this.monitor.start();
      return true;
    }
  }

  close({
    allowReconnect
  } = {
    allowReconnect: true
  }) {
    if (!allowReconnect) {
      this.monitor.stop();
    }

    if (this.isActive()) {
      return this.webSocket.close();
    }
  }

  reopen() {
    _logger.default.log(`Reopening WebSocket, current state is ${this.getState()}`);

    if (this.isActive()) {
      try {
        return this.close();
      } catch (error) {
        _logger.default.log("Failed to reopen WebSocket", error);
      } finally {
        _logger.default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);

        setTimeout(this.open, this.constructor.reopenDelay);
      }
    } else {
      return this.open();
    }
  }

  getProtocol() {
    if (this.webSocket) {
      return this.webSocket.protocol;
    }
  }

  isOpen() {
    return this.isState("open");
  }

  isActive() {
    return this.isState("open", "connecting");
  } // Private


  isProtocolSupported() {
    return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
  }

  isState(...states) {
    return indexOf.call(states, this.getState()) >= 0;
  }

  getState() {
    if (this.webSocket) {
      for (let state in _adapters.default.WebSocket) {
        if (_adapters.default.WebSocket[state] === this.webSocket.readyState) {
          return state.toLowerCase();
        }
      }
    }

    return null;
  }

  installEventHandlers() {
    for (let eventName in this.events) {
      const handler = this.events[eventName].bind(this);
      this.webSocket[`on${eventName}`] = handler;
    }
  }

  uninstallEventHandlers() {
    for (let eventName in this.events) {
      this.webSocket[`on${eventName}`] = function () {};
    }
  }

}

Connection.reopenDelay = 500;
Connection.prototype.events = {
  message(event) {
    if (!this.isProtocolSupported()) {
      return;
    }

    const {
      identifier,
      message,
      reason,
      reconnect,
      type
    } = JSON.parse(event.data);

    switch (type) {
      case message_types.welcome:
        this.monitor.recordConnect();
        return this.subscriptions.reload();

      case message_types.disconnect:
        _logger.default.log(`Disconnecting. Reason: ${reason}`);

        return this.close({
          allowReconnect: reconnect
        });

      case message_types.ping:
        return this.monitor.recordPing();

      case message_types.confirmation:
        return this.subscriptions.notify(identifier, "connected");

      case message_types.rejection:
        return this.subscriptions.reject(identifier);

      default:
        return this.subscriptions.notify(identifier, "received", message);
    }
  },

  open() {
    _logger.default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);

    this.disconnected = false;

    if (!this.isProtocolSupported()) {
      _logger.default.log("Protocol is unsupported. Stopping monitor and disconnecting.");

      return this.close({
        allowReconnect: false
      });
    }
  },

  close(event) {
    _logger.default.log("WebSocket onclose event");

    if (this.disconnected) {
      return;
    }

    this.disconnected = true;
    this.monitor.recordDisconnect();
    return this.subscriptions.notifyAll("disconnected", {
      willAttemptReconnect: this.monitor.isRunning()
    });
  },

  error() {
    _logger.default.log("WebSocket onerror event");
  }

};
var _default = Connection;
exports.default = _default;