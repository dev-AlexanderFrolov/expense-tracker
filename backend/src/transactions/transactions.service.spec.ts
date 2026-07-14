import { NotFoundException } from "@nestjs/common";
import { TransactionType } from "@expense-tracker/shared";
import { CategoriesService } from "../categories/categories.service";
import { TransactionsService } from "./transactions.service";
import { TransactionsRepository } from "./transactions.repository";

describe("TransactionsService", () => {
  const userId = "user-1";
  const categoryId = "category-1";

  const transactionsRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  } as unknown as TransactionsRepository;

  const categoriesService = {
    assertOwnedByUser: jest.fn(),
  } as unknown as CategoriesService;

  const service = new TransactionsService(transactionsRepository, categoriesService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("проверяет владельца категории при создании транзакции", async () => {
    (categoriesService.assertOwnedByUser as jest.Mock).mockResolvedValue(undefined);
    (transactionsRepository.create as jest.Mock).mockResolvedValue({
      id: "tx-1",
      amount: 100,
      type: "EXPENSE",
      description: null,
      date: new Date("2026-07-14T00:00:00.000Z"),
      categoryId,
      userId,
      createdAt: new Date("2026-07-14T00:00:00.000Z"),
    });

    await service.create(userId, {
      amount: 100,
      type: TransactionType.EXPENSE,
      date: "2026-07-14T00:00:00.000Z",
      categoryId,
    });

    expect(categoriesService.assertOwnedByUser).toHaveBeenCalledWith(userId, categoryId);
    expect(transactionsRepository.create).toHaveBeenCalled();
  });

  it("не создаёт транзакцию, если категория не принадлежит пользователю", async () => {
    (categoriesService.assertOwnedByUser as jest.Mock).mockRejectedValue(
      new NotFoundException("Категория не найдена"),
    );

    await expect(
      service.create(userId, {
        amount: 100,
        type: TransactionType.EXPENSE,
        date: "2026-07-14T00:00:00.000Z",
        categoryId,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(transactionsRepository.create).not.toHaveBeenCalled();
  });

  it("проверяет владельца категории при обновлении categoryId", async () => {
    (transactionsRepository.findById as jest.Mock).mockResolvedValue({
      id: "tx-1",
      userId,
      amount: 100,
      type: "EXPENSE",
      description: null,
      date: new Date("2026-07-14T00:00:00.000Z"),
      categoryId: "old-category",
      createdAt: new Date("2026-07-14T00:00:00.000Z"),
    });
    (categoriesService.assertOwnedByUser as jest.Mock).mockResolvedValue(undefined);
    (transactionsRepository.update as jest.Mock).mockResolvedValue({
      id: "tx-1",
      amount: 100,
      type: "EXPENSE",
      description: null,
      date: new Date("2026-07-14T00:00:00.000Z"),
      categoryId,
      userId,
      createdAt: new Date("2026-07-14T00:00:00.000Z"),
    });

    await service.update(userId, "tx-1", { categoryId });

    expect(categoriesService.assertOwnedByUser).toHaveBeenCalledWith(userId, categoryId);
  });
});
