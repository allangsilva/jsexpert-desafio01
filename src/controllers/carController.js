const path = require("path");
const CarService = require("../service/carService");

const carsDatabase = path.join(__dirname, "./../../database", "cars.json");

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

class CarController {
  constructor() {
    this.carService = new CarService({ cars: carsDatabase });
  }

  async getAvailableCar(request, response) {
    for await (const data of request) {
      try {
        const carCategory = JSON.parse(data);
        const car = await this.carService.getAvailableCar(carCategory);
        response.write(JSON.stringify(car));
        return response.end();
      } catch (error) {
        console.log("error", error);
        response.writeHead(500, DEFAULT_HEADERS);
        response.write(JSON.stringify({ message: "Something went wrong!" }));
        return response.end(500);
      }
    }
  }

  async calculateFinalPrice(request, response) {
    for await (const data of request) {
      try {
        const { carCategory, customer, numberOfDays } = JSON.parse(data);
        const finalPrice = await this.carService.calculateFinalPrice(
          customer,
          carCategory,
          numberOfDays
        );
        response.write(JSON.stringify(finalPrice));
        return response.end();
      } catch (error) {
        console.log("error", error);
        response.writeHead(500, DEFAULT_HEADERS);
        response.write(JSON.stringify({ message: "Something went wrong!" }));
        return response.end(500);
      }
    }
  }

  async rent(request, response) {
    for await (const data of request) {
      try {
        const { carCategory, customer, numberOfDays } = JSON.parse(data);
        const order = await this.carService.rent(
          customer,
          carCategory,
          numberOfDays
        );
        response.write(JSON.stringify(order));
        return response.end();
      } catch (error) {
        console.log("error", error);
        response.writeHead(500, DEFAULT_HEADERS);
        response.write(JSON.stringify({ message: "Something went wrong!" }));
        return response.end(500);
      }
    }
  }
}

module.exports = new CarController();
