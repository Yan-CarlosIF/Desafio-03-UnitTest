import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile", () => {
  let usersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show user profile", async () => {
    const createdUser = await usersRepository.create({
      name: "test user",
      email: "test@email.com",
      password: "123",
    });

    const user = await showUserProfileUseCase.execute(createdUser.id);

    expect(user).toEqual(createdUser);
  });

  it("should not be able to show a user if his id does not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("Inexistent id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
