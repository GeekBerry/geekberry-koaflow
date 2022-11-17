const http = require('node:http');
const { composeDecorator } = require('./utils');
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
        (request, response) => undefined,
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
    return (func) => {
      const executor = composeDecorator(
        ...this.middlewareArray,
        (context) => this.router.executor(context),
      );

      return async (request, response) => {
        await func(request, response); // receive data and parse request

        const context = { request, response, app: this };

        return executor(context);
      };
    };
  }
}

module.exports = Application;
