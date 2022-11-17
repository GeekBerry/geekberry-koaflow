const assert = require('node:assert');

function pathToRegex(path) {
  const string = path.split('/')
    .map(part => {
      if (part === '*') {
        return '(.*)';
      }
      if (part.startsWith(':')) {
        return `(?<${part.slice(1)}>[^/]*)`;
      }
      return part;
    })
    .join('/');

  return new RegExp(`^${string}$`, 'i');
}

class Layer {
  constructor({ path, methodSet, func }) {
    path = path instanceof RegExp ? path.source : path;

    assert(typeof path === 'string', 'path must be string');
    assert(methodSet instanceof Set, 'methodSet must be instanceof Set');
    assert(typeof func === 'function', 'func must be function');

    this.path = path;
    this.methodSet = methodSet;
    this.func = func;
    this.regex = pathToRegex(path);
  }

  prefix(path) {
    path = path instanceof RegExp ? path.source : path;

    return new this.constructor({
      path: `${path}${this.path}`,
      methodSet: this.methodSet,
      func: this.func,
    });
  }

  match(path) {
    assert(typeof path === 'string', 'path must be string');

    const match = path.match(this.regex);
    if (!match) {
      return null;
    }

    return { ...match.groups || {} };
  }
}

module.exports = Layer;
