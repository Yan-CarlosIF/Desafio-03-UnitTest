import { hash } from "bcryptjs";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

const userExample = {
  name: "test user",
  email: "test@example.com",
};

describe("Get statement operation", () => {
  let usersRepository: InMemoryUsersRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let statementsRepository: InMemoryStatementsRepository;
  let user: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );

    user = await usersRepository.create({
      ...userExample,
      password: await hash("123", 8),
    });
  });

  it("should be able to get statement operation", async () => {
    const statement = await statementsRepository.create({
      user_id: user.id,
      amount: 100,
      type: "deposit" as OperationType,
      description: "test description",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(statementOperation).toEqual(statement);
  });

  it("should not be able to get statement operation if user id does not exist", async () => {
    const statement = await statementsRepository.create({
      user_id: user.id,
      amount: 100,
      type: "deposit" as OperationType,
      description: "test description",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "nonExistentId",
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation if statement id does not exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "nonExistentId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
