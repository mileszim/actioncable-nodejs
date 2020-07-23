"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Responsible for ensuring the cable connection is in good health by validating the heartbeat pings sent from the server, and attempting
// revival reconnections if things go astray. Internal class, not intended for direct user manipulation.
const now = () => new Date().getTime();

const secondsSince = time => (now() - time) / 1000;

const clamp = (number, min, max) => Math.max(min, Math.min(max, number));

class ConnectionMonitor {
  constructor(connection) {
    this.visibilityDidChange = this.visibilityDidChange.bind(this);
    this.connection = connection;
    this.reconnectAttempts = 0;
  }

  start() {
    if (!this.isRunning()) {
      this.startedAt = now();
      delete this.stoppedAt;
      this.startPolling();
      addEventListener("visibilitychange", this.visibilityDidChange);

      _logger.default.log(`ConnectionMonitor started. pollInterval = ${this.getPollInterval()} ms`);
    }
  }

  stop() {
    if (this.isRunning()) {
      this.stoppedAt = now();
      this.stopPolling();
      removeEventListener("visibilitychange", this.visibilityDidChange);

      _logger.default.log("ConnectionMonitor stopped");
    }
  }

  isRunning() {
    return this.startedAt && !this.stoppedAt;
  }

  recordPing() {
    this.pingedAt = now();
  }

  recordConnect() {
    this.reconnectAttempts = 0;
    this.recordPing();
    delete this.disconnectedAt;

    _logger.default.log("ConnectionMonitor recorded connect");
  }

  recordDisconnect() {
    this.disconnectedAt = now();

    _logger.default.log("ConnectionMonitor recorded disconnect");
  } // Private


  startPolling() {
    this.stopPolling();
    this.poll();
  }

  stopPolling() {
    clearTimeout(this.pollTimeout);
  }

  poll() {
    this.pollTimeout = setTimeout(() => {
      this.reconnectIfStale();
      this.poll();
    }, this.getPollInterval());
  }

  getPollInterval() {
    const {
      min,
      max,
      multiplier
    } = this.constructor.pollInterval;
    const interval = multiplier * Math.log(this.reconnectAttempts + 1);
    return Math.round(clamp(interval, min, max) * 1000);
  }

  reconnectIfStale() {
    if (this.connectionIsStale()) {
      _logger.default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, pollInterval = ${this.getPollInterval()} ms, time disconnected = ${secondsSince(this.disconnectedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);

      this.reconnectAttempts++;

      if (this.disconnectedRecently()) {
        _logger.default.log("ConnectionMonitor skipping reopening recent disconnect");
      } else {
        _logger.default.log("ConnectionMonitor reopening");

        this.connection.reopen();
      }
    }
  }

  connectionIsStale() {
    return secondsSince(this.pingedAt ? this.pingedAt : this.startedAt) > this.constructor.staleThreshold;
  }

  disconnectedRecently() {
    return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
  }

  visibilityDidChange() {
    if (document.visibilityState === "visible") {
      setTimeout(() => {
        if (this.connectionIsStale() || !this.connection.isOpen()) {
          _logger.default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);

          this.connection.reopen();
        }
      }, 200);
    }
  }

}

ConnectionMonitor.pollInterval = {
  min: 3,
  max: 30,
  multiplier: 5
};
ConnectionMonitor.staleThreshold = 6; // Server::Connections::BEAT_INTERVAL * 2 (missed two pings)

var _default = ConnectionMonitor;
exports.default = _default;