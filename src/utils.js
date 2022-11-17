/*
[rfc7231](https://rfc2cn.com/rfc7231.html)
[Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
[MIME_types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
 */
const assert = require('node:assert');
const querystring = require('node:querystring');

// ----------------------------------------------------------------------------

/**
 * @param decoratorArray [function]
 * @return {function}

 * @example
 ```javascript
 function inc(func) {
   return (v) => {
     return func(v) + 1;
   };
 }

 function double(func) {
   return (v) => {
     return func(v) * 2;
   };
 }

 inc(double(v => v))(5); // => 11
 composeDecorator(inc, double, v => v)(5); // 11
 double(inc(v => v))(5); // => 12
 composeDecorator(double, inc, v => v)(5); // 12
 ```
 */
function composeDecorator(...decoratorArray) {
  decoratorArray.forEach((func, index) => {
    assert(typeof func === 'function', `args[${index}] not function`);
  });

  return decoratorArray
    .reverse()
    .reduce((func, decorate) => decorate(func));
}

// ----------------------------------------------------------------------------

/**
 * TODO: use `require('qs')` to parse
 * @param string {string}
 * @return {object}
 *
 * @example
 * > parseQuery()
 {}
 * > parseQuery('a=1&b=2')
 { a: '1', b: '2' }
 */
function parseQuery(string) {
  return { ...querystring.decode(string) };
}

/**
 * > Note: assume content is normative
 * TODO: check by rfc7231
 * @param string {string}
 * @return {{parameter: {}, type: string}}
 *
 * @example
 * > parseContentType('')
 { type: '', parameter: {} }

 * > parseContentType('application/json')
 { type: 'application/json', parameter: {} }

 * > parseContentType('text/html; charset=utf-8')
 { type: 'text/html', parameter: { charset: 'utf-8' } }
 */
function parseContentType(string = '') {
  assert(typeof string === 'string', 'content-type not string');

  const [type, ...paramArray] = string.split(';');

  const parameter = {};
  paramArray.forEach(pairString => {
    const [key, value] = pairString.split('=');
    parameter[key.trim()] = value.trim();
  });

  return { type, parameter };
}

module.exports = {
  composeDecorator,
  parseQuery,
  parseContentType,
};
