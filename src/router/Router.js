const assert = require('node:assert');
const http = require('node:http');
const RouterLayer = require('./Layer');
const composeDecorator = require('../composeDecorator');

class Router {
  constructor() {
    this.layerArray = [];
  }

  register(path, methods, ...middlewareArray) {
    // TODO: path to be array
    const layer = new RouterLayer({
      path,
      methodSet: new Set(methods),
      func: composeDecorator(...middlewareArray, () => undefined),
    });

    this.layerArray.push(layer);
  }

  sub(path, subRouter) {
    assert(subRouter instanceof Router, 'subRouter must be instanceof Router');

    subRouter.layerArray.forEach(layer => {
      this.layerArray.push(layer.prefix(path));
    });
  }

  exec(request, ...args) {
    for (const layer of this.layerArray) {
      if (layer.methodSet.has(request.method)) {
        const params = layer.match(request.path);

        if (params) {
          request.params = params;
          return layer.func(request, ...args);
        }
      }
    }

    return undefined;
  }

  // -------------------------- common http method ----------------------------
  all(path, ...middlewareArray) {
    this.register(path, http.METHODS, ...middlewareArray);
  }

  head(path, ...middlewareArray) {
    this.register(path, ['HEAD'], ...middlewareArray);
  }

  options(path, ...middlewareArray) {
    this.register(path, ['OPTIONS'], ...middlewareArray);
  }

  get(path, ...middlewareArray) {
    this.register(path, ['GET'], ...middlewareArray);
  }

  query(path, ...middlewareArray) {
    this.register(path, ['QUERY'], ...middlewareArray);
  }

  put(path, ...middlewareArray) {
    this.register(path, ['PUT'], ...middlewareArray);
  }

  patch(path, ...middlewareArray) {
    this.register(path, ['PATCH'], ...middlewareArray);
  }

  post(path, ...middlewareArray) {
    this.register(path, ['POST'], ...middlewareArray);
  }

  delete(path, ...middlewareArray) {
    this.register(path, ['DELETE'], ...middlewareArray);
  }
}

module.exports = Router;
