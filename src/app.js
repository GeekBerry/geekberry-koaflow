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
      const requestListener = this._getRequestListener();

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
  _getRequestListener() {
    const contextHandle = composeDecorator(
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

    return (request, response) => {
      const context = { request, response };

      return contextHandle(context);
    };
  }

  _getMiddlewareDecorator() {
    const middlewareHandle = composeDecorator(
      ...this.middlewareArray,
      (context) => this.router.exec(context),
    );

    return (func) => {
      return async (context) => {
        await func(context);

        return middlewareHandle(context);
      };
    };
  }
}

module.exports = Application;
