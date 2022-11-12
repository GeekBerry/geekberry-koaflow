/*
http response:
  httpVersion statusCode statusMessage
  headers
  text
 */
const assert = require('node:assert');
const HttpError = require('./HttpError');
const { parseContentType } = require('./utils');

// ============================================================================
function handleHttpErrorDecorator(func) {
  return async (context) => {
    const { response } = context;

    try {
      response.body = await func(context);
    } catch (e) {
      if (e instanceof HttpError) {
        response.statusCode = e.statusCode;
        response.body = e.body;
      } else {
        throw e;
      }
    }
  };
}

function autoContentTypeDecorator(func) {
  return async (context) => {
    await func(context);

    const { response } = context;

    if (response.hasHeader('content-type')) {
      return;
    }

    if (response.body === undefined) {
      return;
    }

    if (Buffer.isBuffer(response.body)) {
      response.setHeader('content-type', 'application/octet-stream');
      return;
    }

    // TODO: only accept object, null, string, number, boolean
    response.setHeader('content-type', 'application/json');
  };
}

function setResponseDataDecorator(func) {
  return async (context) => {
    await func(context);

    const { response } = context;

    response.contentType = parseContentType(response.getHeader('content-type'));

    switch (response.contentType.type) {
      case 'application/json':
      case 'application/json-patch+json':
      case 'application/vnd.api+json':
      case 'application/csp-report':
        response.data = JSON.stringify(response.body);
        response.data = Buffer.from(response.data);
        break;

      case 'text/plain':
      case 'text/xml':
      case 'application/xml':
        response.data = Buffer.from(response.body);
        break;

      case 'application/x-www-form-urlencoded':
        // TODO:
        break;

      case 'application/octet-stream':
        response.data = response.body;
        break;

      default:
        response.data = Buffer.alloc(0);
        break;
    }
  };
}

/**
 * @param func {function} - internal function to be decorated
 * @return {function}
 */
function sendResponseDecorator(func) {
  return async (context) => {
    const { response } = context;

    try {
      await func(context);

      assert(Buffer.isBuffer(response.data), 'response.data not Buffer');
      response.setHeader('content-length', response.data.length);
      response.write(response.data);
    } catch (e) {
      response.writeHead(500);
      throw e;
    } finally {
      await response.end();
    }
  };
}

module.exports = {
  handleHttpErrorDecorator,
  autoContentTypeDecorator,
  setResponseDataDecorator,
  sendResponseDecorator,
};
