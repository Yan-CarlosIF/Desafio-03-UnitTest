import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { User } from "../../../users/entities/User";
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

const userExample = {
  name: "test user",
  email: "test@example.com",
};

describe("Create statement", () => {
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let createStatementUseCase: CreateStatementUseCase;
  let user: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    user = await usersRepository.create({
      ...userExample,
      password: await hash("123", 8),
    });
  });

  it("should be able to create a new statement", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "test description",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "test description2",
    });

    const { balance } = await statementsRepository.getUserBalance({
      user_id: user.id,
    });

    expect(statement).toHaveProperty("id");
    expect(balance).toEqual(0);
  });

  it("should not be able to withdraw a amount greater than your balance", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "test description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a new statement if user id does not exist", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "nonExistentId",
        type: "deposit" as OperationType,
        amount: 100,
        description: "test description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
