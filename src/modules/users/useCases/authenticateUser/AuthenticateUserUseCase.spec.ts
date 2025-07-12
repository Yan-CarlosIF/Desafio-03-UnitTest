import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { hash } from "bcryptjs";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

const userExample = {
  name: "test user",
  email: "test@example.com",
};

describe("Authenticate user", () => {
  let usersRepository: InMemoryUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let password: string;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    password = await hash("123", 8);
  });

  it("should be able to authenticate a user", async () => {
    const { email } = await usersRepository.create({
      ...userExample,
      password,
    });

    const { token } = await authenticateUserUseCase.execute({
      email,
      password: "123",
    });

    expect(token).toBeTruthy();
  });

  it("should not be able to authenticate a user if the password is incorrect", async () => {
    await usersRepository.create({ ...userExample, password });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@example",
        password: "321",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate a user when email does not exist", async () => {
    await usersRepository.create({ ...userExample, password });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "wrongEmail",
        password: "123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
