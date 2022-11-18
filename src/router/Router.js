const assert = require('node:assert');
const http = require('node:http');
const Layer = require('./Layer');
const { composeFlow } = require('../utils');

class Router {
  constructor() {
    this.layerArray = [];
  }

  register(path, methods, ...flowArray) {
    // TODO: allowed path to be array

    const methodSet = new Set(methods);

    const executor = flowArray.length ? composeFlow(...flowArray) : () => undefined;

    const layer = new Layer({ path, methodSet, executor });

    this.layerArray.push(layer);
  }

  sub(path, subRouter) {
    assert(subRouter instanceof Router, 'subRouter must be instanceof Router');

    subRouter.layerArray.forEach(layer => {
      this.layerArray.push(layer.prefix(path));
    });
  }

  executor(context) {
    for (const layer of this.layerArray) {
      if (layer.methodSet.has(context.request.method)) {
        const params = layer.match(context.request.path);

        if (params) {
          context.request.params = params;
          return layer.executor(context);
        }
      }
    }

    return undefined;
  }

  // -------------------------- common http method ----------------------------
  all(path, ...flowArray) {
    this.register(path, http.METHODS, ...flowArray);
  }

  head(path, ...flowArray) {
    this.register(path, ['HEAD'], ...flowArray);
  }

  options(path, ...flowArray) {
    this.register(path, ['OPTIONS'], ...flowArray);
  }

  get(path, ...flowArray) {
    this.register(path, ['GET'], ...flowArray);
  }

  query(path, ...flowArray) {
    this.register(path, ['QUERY'], ...flowArray);
  }

  put(path, ...flowArray) {
    this.register(path, ['PUT'], ...flowArray);
  }

  patch(path, ...flowArray) {
    this.register(path, ['PATCH'], ...flowArray);
  }

  post(path, ...flowArray) {
    this.register(path, ['POST'], ...flowArray);
  }

  delete(path, ...flowArray) {
    this.register(path, ['DELETE'], ...flowArray);
  }
}

module.exports = Router;
