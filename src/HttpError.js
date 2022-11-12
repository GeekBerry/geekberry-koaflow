class HttpError extends Error {
  constructor(statusCode = 600, body) {
    super();
    this.statusCode = statusCode;
    this.body = body;
  }
}

module.exports = HttpError;
