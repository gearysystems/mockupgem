function allowCORSMiddleware(req, res, next) {
  // TODO: Should probably check that its an OPTIONS request
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

module.exports = {
  allowCORSMiddleware: allowCORSMiddleware,
}
