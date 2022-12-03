// const assert = require('chai').assert;
// const sort = require('../app.mjs').sort;
import assert from "assert";
import * as app from "../app.mjs";
import { Builder, By, Key } from "selenium-webdriver";

describe("Sort", function () {
  it("function should return type array", function () {
    const result = app.sort(app.minus, 10, 5);
    assert.equal(typeof result, "object");
  });

  it("minValue should smaller than maxValue", function () {
    const result = app.sort(app.minus, 10, 5);
    assert.equal(result.toString(), [5, 10].toString());
  });

  it("the array that the funtion returns should only contain integer", function () {
    const result = app.sort(app.minus, 5, 10);
    assert.equal(Number.isInteger(result[0]), true);
  });

  it("the function can return 2 numbers successfully", function () {
    const result = app.sort(app.minus, 5, 10);
    assert.equal(result.toString(), [5, 10].toString());
  });
});

describe("selenium", function () {
  it("Add a new item", async function () {
    const driver = await new Builder().forBrowser("firefox").build();
    //login
    await driver.get("http://localhost:3000/");
    await driver.findElement(By.id("floatingInputGroup1")).sendKeys("88888888");
    await driver.findElement(By.id("floatingPassword")).sendKeys("88888888");
    await driver.findElement(By.id("login")).click();

    //Add item
    await driver.findElement(By.id("selector")).click();
    await driver.findElement(By.id("item")).sendKeys("ricenoodle");
    await driver.findElement(By.id("add")).click();

    //friends
    const compareText = await driver
      .findElement(By.xpath("//li[last()]"))
      .getText()
      .then(function (value) {
        return value;
      });
    assert.equal(compareText, "88888888: ricenoodle");
  });

  it("Add a new item without using the default udername", async function () {
    const driver = await new Builder().forBrowser("firefox").build();
    //login
    await driver.get("http://localhost:3000/");
    await driver.findElement(By.id("floatingInputGroup1")).sendKeys("88888888");
    await driver.findElement(By.id("floatingPassword")).sendKeys("88888888");
    await driver.findElement(By.id("login")).click();

    //Add item
    await driver.findElement(By.id("selector")).click();
    await driver.findElement(By.id("username")).clear();
    await driver.findElement(By.id("username")).sendKeys("Yino");
    await driver.findElement(By.id("item")).sendKeys("ricenoodle");
    await driver.findElement(By.id("add")).click();

    //friends
    const compareText = await driver
      .findElement(By.xpath("//li[last()]"))
      .getText()
      .then(function (value) {
        return value;
      });
    assert.equal(compareText, "Yino: ricenoodle");
  });

  it("Generate given number of numbers in a specific interval", async function () {
    const driver = await new Builder().forBrowser("firefox").build();
    //login
    await driver.get("http://localhost:3000/");
    await driver.findElement(By.id("floatingInputGroup1")).sendKeys("88888888");
    await driver.findElement(By.id("floatingPassword")).sendKeys("88888888");
    await driver.findElement(By.id("login")).click();

    //random
    await driver.findElement(By.id("random")).click();
    await driver.findElement(By.id("lowerbond")).sendKeys("5");
    await driver.findElement(By.id("upperbond")).sendKeys("20");
    await driver.findElement(By.id("number")).sendKeys("3");

    await driver.findElement(By.id("generate")).click();
    let wrongOutput = 0;
    for (let i = 0; i < 3; i++) {
      const num = await driver
        .findElement(By.id(i + ""))
        .getText()
        .then(function (value) {
          return value;
        });
      if (num < 5 || num > 20) {
        wrongOutput = 1;
      }
    }
    assert.equal(wrongOutput, 0);
  });

  it("If we enter 2 as lowernond and 3 as upper bond, the resukt should be 3", async function () {
    const driver = await new Builder().forBrowser("firefox").build();
    //login
    await driver.get("http://localhost:3000/");
    await driver.findElement(By.id("floatingInputGroup1")).sendKeys("88888888");
    await driver.findElement(By.id("floatingPassword")).sendKeys("88888888");
    await driver.findElement(By.id("login")).click();

    //random
    await driver.findElement(By.id("random")).click();
    await driver.findElement(By.id("lowerbond")).sendKeys("2");
    await driver.findElement(By.id("upperbond")).sendKeys("3");
    await driver.findElement(By.id("number")).sendKeys("1");

    await driver.findElement(By.id("generate")).click();
    const num = await driver
      .findElement(By.id(0 + ""))
      .getText()
      .then(function (value) {
        return value;
      });

    assert.equal(num, 3);
  });
});
