const http = require('node:http');
const composeDecorator = require('./composeDecorator');
const Router = require('./router');

const {
  receiveRequestDataDecorator,
  setRequestQueryDecorator,
  setRequestBodyDecorator,
} = require('./request');

const {
  handleHttpErrorDecorator,
  autoContentTypeDecorator,
  setResponseDataDecorator,
  sendResponseDecorator,
} = require('./response');

// ============================================================================

class Application {
  constructor() {
    this.router = new Router();
    this.middlewareArray = [];
    this.server = null;
  }

  use(...middlewareArray) {
    this.middlewareArray.push(...middlewareArray);
  }

  listen(...args) {
    if (!this.server) {
      const requestListener = composeDecorator(
        sendResponseDecorator,
        setResponseDataDecorator,
        autoContentTypeDecorator,
        handleHttpErrorDecorator,
        this._getMiddlewareDecorator(),
        setRequestBodyDecorator,
        setRequestQueryDecorator,
        receiveRequestDataDecorator,
        () => undefined,
      );

      this.server = http.createServer(requestListener);
      this.server.listen(...args);
    }

    return this.server;
  }

  async close() {
    if (this.server) {
      await this.server.close();
      this.server = null;
    }
  }

  // --------------------------------------------------------------------------
  _getMiddlewareDecorator() {
    const middlewareHandle = composeDecorator(
      ...this.middlewareArray,
      this._getRouterDecorator(),
      () => undefined,
    );

    return (func) => {
      return async (...args) => {
        await func(...args);

        return middlewareHandle(...args);
      };
    };
  }

  _getRouterDecorator() {
    return (func) => {
      return async (...args) => {
        await func(...args);

        return this.router.exec(...args);
      };
    };
  }
}

module.exports = Application;
