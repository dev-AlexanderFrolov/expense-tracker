import { validateEnv } from "./env.validation";

describe("validateEnv", () => {
  it("принимает корректные переменные окружения", () => {
    const result = validateEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/expense_tracker",
      JWT_SECRET: "change-me-secret",
      JWT_EXPIRES_IN: "1d",
    });

    expect(result.DATABASE_URL).toContain("postgresql://");
    expect(result.JWT_SECRET).toBe("change-me-secret");
  });

  it("отклоняет отсутствующий JWT_SECRET", () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/expense_tracker",
        JWT_EXPIRES_IN: "1d",
      }),
    ).toThrow(/валидации переменных окружения/i);
  });

  it("отклоняет слишком короткий JWT_SECRET", () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/expense_tracker",
        JWT_SECRET: "short",
        JWT_EXPIRES_IN: "1d",
      }),
    ).toThrow(/валидации переменных окружения/i);
  });
});
