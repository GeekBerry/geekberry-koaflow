const assert = require('node:assert');

function composeDecorator(...decoratorArray) {
  decoratorArray.forEach((func, index) => {
    assert(typeof func === 'function', `args[${index}] not function`);
  });

  return decoratorArray
    .reverse()
    .reduce((func, decorate) => decorate(func));
}

module.exports = composeDecorator;
