const http = require('http');
const composeDecorator = require('./composeDecorator');

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
  // ==========================================================================
  constructor() {
    this.decoratorArray = [];
  }

  decorate(...decoratorArray) {
    this.decoratorArray.unshift(...decoratorArray);
  }

  listen(...args) {
    const requestListener = composeDecorator(
      sendResponseDecorator,
      setResponseDataDecorator,
      autoContentTypeDecorator,
      handleHttpErrorDecorator,
      ...this.decoratorArray,
      setRequestBodyDecorator,
      setRequestQueryDecorator,
      receiveRequestDataDecorator,
      () => undefined,
    );

    const server = http.createServer(requestListener);

    return server.listen(...args);
  }
}

module.exports = Application;
