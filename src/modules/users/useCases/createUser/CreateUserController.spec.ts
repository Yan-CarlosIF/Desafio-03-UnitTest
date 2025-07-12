import { Connection } from "typeorm";
import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";

describe("Create a user", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "test@email.com",
      password: "123",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to create a new user with an existing email", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test user2",
      email: "test@email.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("User already exists");
  });
});
