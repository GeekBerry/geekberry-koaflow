const assert = require('node:assert');

/**
 * @param path {string}
 * @return {RegExp}
 * @example
 *
 * > pathToRegex('/user/:userName');
 /^\/user\/(?<userName>[^/]*)$/i

 * pathToRegex('/api/*');
 /^\/api\/(.*)$/i

 */
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
  constructor({ path, methodSet, executor }) {
    path = path instanceof RegExp ? path.source : path;

    assert(typeof path === 'string', 'path must be string');
    assert(methodSet instanceof Set, 'methodSet must be instanceof Set');
    assert(typeof executor === 'function', 'executor must be function');

    this.path = path;
    this.methodSet = methodSet;
    this.executor = executor;
    this.regex = pathToRegex(path);
  }

  prefix(path) {
    path = path instanceof RegExp ? path.source : path;

    return new this.constructor({
      path: `${path}${this.path}`,
      methodSet: this.methodSet,
      executor: this.executor,
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
