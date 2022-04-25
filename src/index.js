const http = require("http");
const CarController = require("./controllers/carController");

const DEFAULT_PORT = 3000;
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const routes = {
  "/getAvailableCar:post": async (request, response) => {
    return CarController.getAvailableCar(request, response);
  },
  "/finalPrice:post": async (request, response) => {
    return CarController.calculateFinalPrice(request, response);
  },
  "/rent:post": async (request, response) => {
    return CarController.rent(request, response);
  },
  default: (_, response) => {
    response.write("default route");
    return response.end();
  },
};

const handler = function (request, response) {
  const { method, url } = request;
  const routeKey = `${url}:${method.toLowerCase()}`;
  const chosen = routes[routeKey] || routes.default;

  response.writeHead(200, DEFAULT_HEADERS);
  return chosen(request, response);
};

const app = http
  .createServer(handler)
  .listen(DEFAULT_PORT, () => console.log(`app listen on port`, DEFAULT_PORT));

module.exports = app;
