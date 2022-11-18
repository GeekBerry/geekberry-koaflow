/*
Http Request:
  method url httpVersion
  headers
  data

[rfc7231](https://rfc2cn.com/rfc7231.html)
[Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
[MIME_types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

[RFC 8259 8.1](https://www.rfc-editor.org/rfc/rfc8259#section-8.1)
 */
const assert = require('node:assert');
const url = require('node:url');
const { parseQuery, parseContentType } = require('./utils');

// ============================================================================
function receiveRequestDataDecorator(func) {
  return async (request, response) => {
    await func(request, response);

    // TODO: check content-length
    // TODO: limited receive size
    request.data = await new Promise((resolve, reject) => {
      const chunkArray = [];

      request.once('aborted', () => reject(new Error('request aborted')));
      request.once('error', reject);
      request.on('data', chunk => chunkArray.push(chunk));
      request.once('end', () => {
        resolve(Buffer.concat(chunkArray));
      });
    });
  };
}

function setRequestQueryDecorator(func) {
  return async (request, response) => {
    await func(request, response);

    const { pathname, query } = url.parse(request.url);
    request.path = pathname;
    request.query = parseQuery(query);
  };
}

/**
 * > Note: ignore charset
 */
function setRequestBodyDecorator(func) {
  return async (request, response) => {
    await func(request, response);

    assert(Buffer.isBuffer(request.data), 'request.data must be Buffer');

    request.contentType = parseContentType(request.headers['content-type']);

    switch (request.contentType.type) {
      case 'application/json':
      case 'application/json-patch+json':
      case 'application/vnd.api+json':
      case 'application/csp-report':
        // @see according to "RFC 8259 8.1", json "MUST be encoded using UTF-8 [RFC3629]"
        request.body = request.data.toString();
        request.body = JSON.parse(request.body);
        break;

      case 'text/plain':
      case 'text/xml':
      case 'application/xml':
        request.body = request.data.toString();
        break;

      case 'application/x-www-form-urlencoded':
        request.body = request.data.toString();
        request.body = parseQuery(request.body);
        break;

      case 'application/octet-stream':
        request.body = request.data;
        break;

      default:
        // TODO: warn
        break;
    }
  };
}

module.exports = {
  receiveRequestDataDecorator,
  setRequestQueryDecorator,
  setRequestBodyDecorator,
};
