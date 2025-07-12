import { hash } from "bcryptjs";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../../entities/Statement";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

const userExample = {
  name: "test user",
  email: "test@example.com",
};

describe("Get balance", () => {
  let usersRepository: InMemoryUsersRepository;
  let getBalanceUseCase: GetBalanceUseCase;
  let statementsRepository: InMemoryStatementsRepository;
  let user: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );

    user = await usersRepository.create({
      ...userExample,
      password: await hash("123", 8),
    });
  });

  it("should be able to get user account's balance", async () => {
    await statementsRepository.create({
      user_id: user.id,
      amount: 100,
      type: "deposit" as OperationType,
      description: "test description",
    });

    const { balance } = await getBalanceUseCase.execute({ user_id: user.id });

    expect(balance).toEqual(100);
  });

  it("should not be able to get the balance if user's id does not exist", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "nonExistentId" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
