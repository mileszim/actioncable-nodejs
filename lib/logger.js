"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _adapters = _interopRequireDefault(require("./adapters"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The logger is disabled by default. You can enable it with:
//
//   ActionCable.logger.enabled = true
//
//   Example:
//
//   import * as ActionCable from '@rails/actioncable'
//
//   ActionCable.logger.enabled = true
//   ActionCable.logger.log('Connection Established.')
//
var _default = {
  log(...messages) {
    if (this.enabled) {
      messages.push(Date.now());

      _adapters.default.logger.log("[ActionCable]", ...messages);
    }
  }

};
exports.default = _default;