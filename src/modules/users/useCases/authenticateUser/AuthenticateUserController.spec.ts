import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";

describe("Authenticate User", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "test@email.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "123",
    });

    const { token } = response.body;

    expect(token).toBeTruthy();
    expect(response.status).toBe(200);
  });

  it("should not be able to authenticate a user if the password is incorrect", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "321",
    });

    const { token } = response.body;

    expect(token).toBeUndefined();
    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user when email does not exist", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrongEmail",
      password: "123",
    });

    const { token } = response.body;

    expect(token).toBeUndefined();
    expect(response.status).toBe(401);
  });
});
