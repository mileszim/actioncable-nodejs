"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWebSocketURL = createWebSocketURL;
exports.default = void 0;

var _connection = _interopRequireDefault(require("./connection"));

var _subscriptions = _interopRequireDefault(require("./subscriptions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The ActionCable.Consumer establishes the connection to a server-side Ruby Connection object. Once established,
// the ActionCable.ConnectionMonitor will ensure that its properly maintained through heartbeats and checking for stale updates.
// The Consumer instance is also the gateway to establishing subscriptions to desired channels through the #createSubscription
// method.
//
// The following example shows how this can be set up:
//
//   App = {}
//   App.cable = ActionCable.createConsumer("ws://example.com/accounts/1")
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel")
//
// For more details on how you'd configure an actual channel subscription, see ActionCable.Subscription.
//
// When a consumer is created, it automatically connects with the server.
//
// To disconnect from the server, call
//
//   App.cable.disconnect()
//
// and to restart the connection:
//
//   App.cable.connect()
//
// Any channel subscriptions which existed prior to disconnecting will
// automatically resubscribe.
class Consumer {
  constructor(url) {
    this._url = url;
    this.subscriptions = new _subscriptions.default(this);
    this.connection = new _connection.default(this);
  }

  get url() {
    return createWebSocketURL(this._url);
  }

  send(data) {
    return this.connection.send(data);
  }

  connect() {
    return this.connection.open();
  }

  disconnect() {
    return this.connection.close({
      allowReconnect: false
    });
  }

  ensureActiveConnection() {
    if (!this.connection.isActive()) {
      return this.connection.open();
    }
  }

}

exports.default = Consumer;

function createWebSocketURL(url) {
  if (typeof url === "function") {
    url = url();
  }

  if (url && !/^wss?:/i.test(url)) {
    return url.replace("http", "ws");
  } else {
    return url;
  }
}