const { expect } = require("chai");
const { describe, it, afterEach, beforeEach, before } = require("mocha");
const path = require("path");
const sinon = require("sinon");
const request = require("supertest");

const app = require("../../src/index");
const CarController = require("../../src/controllers/carController");

const mocks = {
  validCar: require("../mocks/valid-car.json"),
  validCarCategory: require("../mocks/valid-carCategory.json"),
  validCustomer: require("../mocks/valid-customer.json"),
};

const carsDatabase = path.join(__dirname, "./../../database", "cars.json");

describe("CarService Suite Test", () => {
  let sandbox = {};
  let carService = {};

  before(() => {
    carService = CarController.carService;
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("POST /getAvailableCar - should return an available car based on car category", async () => {
    const car = mocks.validCar;
    const carCategory = Object.create(mocks.validCarCategory);
    carCategory.carIds = [car.id];

    sandbox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .returns(car);

    sandbox.spy(carService, carService.chooseRandomCar.name);

    const response = await request(app)
      .post("/getAvailableCar")
      .send(carCategory)
      .expect(200);

    const expected = car;

    expect(response.body).to.be.deep.equal(expected);
    expect(carService.chooseRandomCar.calledOnce).to.be.ok;
    expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok;
  });

  it("POST /finalPrice - should return the final price of order", async () => {
    const customer = Object.create(mocks.validCustomer);
    customer.age = 50;

    const carCategory = {
      ...mocks.validCarCategory,
      price: 37.6,
    };

    const numberOfDays = 5;

    sandbox
      .stub(carService, "taxesBasedOnAge")
      .get(() => [{ from: 40, to: 50, then: 1.3 }]);

    const body = { carCategory, customer, numberOfDays };

    const response = await request(app)
      .post("/finalPrice")
      .send(body)
      .expect(200);

    const expected = carService.currencyFormat.format(244.4);

    expect(response.body).to.be.equal(expected);
  });

  it("POST /rent - should return an order", async () => {
    const car = mocks.validCar;

    const customer = Object.create(mocks.validCustomer);
    customer.age = 50;

    const carCategory = {
      ...mocks.validCarCategory,
      price: 37.6,
      carIds: [car.id],
    };

    const dueDate = "10 de novembro de 2020";

    const now = new Date(2020, 10, 5);
    sandbox.useFakeTimers(now.getTime());

    const numberOfDays = 5;

    sandbox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car);

    sandbox
      .stub(carService, "taxesBasedOnAge")
      .get(() => [{ from: 40, to: 50, then: 1.3 }]);

    const body = { carCategory, customer, numberOfDays };

    const response = await request(app).post("/rent").send(body).expect(200);

    const expectedAmount = carService.currencyFormat.format(244.4);
    const expected = {
      customer: { ...customer },
      car,
      amount: expectedAmount,
      dueDate,
    };

    expect(response.body).to.be.deep.equal(expected);
  });
});
