const assert = require('node:assert');
const http = require('node:http');
const Layer = require('./Layer');
const { composeDecorator } = require('../utils');

class Router {
  constructor() {
    this.layerArray = [];
  }

  register(path, methods, ...middlewareArray) {
    // TODO: allowed path to be array
    const layer = new Layer({
      path,
      methodSet: new Set(methods),
      executor: composeDecorator(
        ...middlewareArray,
        (context) => undefined,
      ),
    });

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
