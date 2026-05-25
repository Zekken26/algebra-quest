import { AppError } from "../../utils/AppError";

const SHOP_COSTS = {
  health: 10,
  hint: 10,
  skip: 20,
} as const;

export type ShopRuleItem = keyof typeof SHOP_COSTS;

export function getShopItemCost(item: ShopRuleItem) {
  return SHOP_COSTS[item];
}

export function assertCanPurchase(input: {
  item: ShopRuleItem;
  coins: number;
  hearts: number;
  maxHearts: number;
  questStarted?: boolean;
}) {
  const cost = getShopItemCost(input.item);

  if (input.coins < cost) {
    throw new AppError("You do not have enough coins for this item.", 400, "INSUFFICIENT_COINS");
  }

  if (input.item === "health" && input.hearts >= input.maxHearts) {
    throw new AppError("Your hearts are already full.", 400, "HEARTS_ALREADY_FULL");
  }

  if (input.questStarted === false) {
    throw new AppError("Start this quest before buying quest items.", 409, "QUEST_NOT_STARTED");
  }
}
