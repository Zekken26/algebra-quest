import { ShopItemType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertCanPurchase } from "./shop.rules";

const SHOP_ITEMS = {
  health: {
    itemType: ShopItemType.HEALTH,
    cost: 10,
    effect: "+1 heart",
  },
  hint: {
    itemType: ShopItemType.HINT,
    cost: 10,
    effect: "+1 hint token",
  },
  skip: {
    itemType: ShopItemType.SKIP,
    cost: 20,
    effect: "skip current question",
  },
} as const;

export type ShopItemKey = keyof typeof SHOP_ITEMS;

export async function purchaseItem(studentId: string, itemKey: ShopItemKey, questId?: string) {
  const item = SHOP_ITEMS[itemKey];

  return prisma.$transaction(async (tx) => {
    let progressId: string | undefined;
    const student = await tx.user.findUnique({ where: { id: studentId } });

    if (!student) {
      throw new AppError("Student was not found.", 404, "STUDENT_NOT_FOUND");
    }

    let heartsForPurchase = student.hearts;

    let maxHearts = 3;

    if (questId) {
      const progress = await tx.studentProgress.findFirst({
        where: {
          studentId,
          questId,
          quest: { section: { studentSections: { some: { studentId, status: "ACTIVE" } } } },
        },
        include: { quest: { select: { maxHearts: true } } },
      });

      if (!progress) {
        throw new AppError("Start this quest before buying quest items.", 409, "QUEST_NOT_STARTED");
      }

      progressId = progress.id;
      maxHearts = progress.quest.maxHearts;
      heartsForPurchase = progress.heartsRemaining;

      if (!progress.questUnlocked) {
        assertCanPurchase({ item: itemKey, coins: student.coins, hearts: heartsForPurchase, maxHearts, questStarted: false });
      }
    }

    assertCanPurchase({ item: itemKey, coins: student.coins, hearts: heartsForPurchase, maxHearts });

    await tx.shopPurchase.create({
      data: {
        studentId,
        questId,
        itemType: item.itemType,
        cost: item.cost,
        effect: item.effect,
      },
    });

    const userData =
      itemKey === "health"
        ? { coins: { decrement: item.cost }, hearts: Math.min(student.hearts + 1, maxHearts) }
        : itemKey === "hint"
          ? { coins: { decrement: item.cost }, hintTokens: { increment: 1 } }
          : { coins: { decrement: item.cost } };

    const updatedStudent = await tx.user.update({
      where: { id: studentId },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        xp: true,
        coins: true,
        hintTokens: true,
        hearts: true,
      },
    });

    if (questId) {
      await tx.studentProgress.update({
        where: { id: progressId! },
        data:
          itemKey === "health"
            ? { coins: updatedStudent.coins, heartsRemaining: { increment: 1 } }
            : itemKey === "hint"
              ? { coins: updatedStudent.coins, hintTokens: updatedStudent.hintTokens }
              : { coins: updatedStudent.coins },
      });
    }

    return {
      itemType: itemKey,
      cost: item.cost,
      effect: item.effect,
      user: updatedStudent,
    };
  });
}
