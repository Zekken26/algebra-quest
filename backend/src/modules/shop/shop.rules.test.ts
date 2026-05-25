import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../utils/AppError";
import { assertCanPurchase, getShopItemCost } from "./shop.rules";

test("uses expected shop costs", () => {
  assert.equal(getShopItemCost("health"), 10);
  assert.equal(getShopItemCost("hint"), 10);
  assert.equal(getShopItemCost("skip"), 20);
});

test("blocks purchases without enough coins", () => {
  assert.throws(
    () => assertCanPurchase({ item: "skip", coins: 10, hearts: 2, maxHearts: 3, questStarted: true }),
    (error) => error instanceof AppError && error.code === "INSUFFICIENT_COINS",
  );
});

test("blocks health purchase when hearts are full", () => {
  assert.throws(
    () => assertCanPurchase({ item: "health", coins: 50, hearts: 3, maxHearts: 3, questStarted: true }),
    (error) => error instanceof AppError && error.code === "HEARTS_ALREADY_FULL",
  );
});

test("blocks quest item purchases before the quest starts", () => {
  assert.throws(
    () => assertCanPurchase({ item: "hint", coins: 50, hearts: 2, maxHearts: 3, questStarted: false }),
    (error) => error instanceof AppError && error.code === "QUEST_NOT_STARTED",
  );
});
