const Transaction = require("../entities/transaction");
const BaseRepository = require("../repository/base/baseRepository");
const Tax = require("./../entities/tax");

class CarService {
  constructor({ cars }) {
    this.carRepository = new BaseRepository({ file: cars });
    this.taxesBasedOnAge = Tax.taxesBasedOnAge;

    this.currencyFormat = new Intl.NumberFormat("pt-br", {
      style: "currency",
      currency: "BRL",
    });
  }

  getRandomPositionFromArray(list) {
    const listLength = list.length;

    return Math.floor(Math.random() * listLength);
  }

  chooseRandomCar(carCategory) {
    const randomCarId = this.getRandomPositionFromArray(carCategory.carIds);
    return carCategory.carIds[randomCarId];
  }

  async getAvailableCar(carCategory) {
    const carId = this.chooseRandomCar(carCategory);
    return this.carRepository.find(carId);
  }

  calculateFinalPrice(customer, carCategory, numberOfDays) {
    const { age } = customer;
    const { price } = carCategory;

    const { then: tax } = this.taxesBasedOnAge.find(
      (t) => age >= t.from && age <= t.to
    );

    const finalPrice = tax * price * numberOfDays;
    return this.currencyFormat.format(finalPrice);
  }

  async rent(customer, carCategory, numberOfDays) {
    const car = await this.getAvailableCar(carCategory);
    const finalPrice = await this.calculateFinalPrice(
      customer,
      carCategory,
      numberOfDays
    );

    const today = new Date();
    today.setDate(today.getDate() + numberOfDays);

    const options = {
      year: "numeric",
      day: "numeric",
      month: "long",
    };

    const dueDate = today.toLocaleDateString("pt-br", options);

    return new Transaction({ customer, car, amount: finalPrice, dueDate });
  }
}

module.exports = CarService;
