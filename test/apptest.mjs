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
    await driver.findElement(By.id('floatingInputGroup1')).sendKeys("88888888");
    await driver.findElement(By.id('floatingPassword')).sendKeys('88888888');
    await driver.findElement(By.id('login')).click();

    //Add item
    await driver.findElement(By.id('selector')).click();
    await driver.findElement(By.id('item')).sendKeys("ricenoodle");
    await driver.findElement(By.id('add')).click();

    //friends
    const compareText = await driver.findElement(By.xpath('//li[last()]')).getText().then(function(value){
      return value;
    });
    assert.equal(compareText, "88888888: ricenoodle");

    
  });


  
});
