import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import { sign } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import { v4 as uuid } from "uuid";

describe("Get balance", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get user account's balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "test@email.com",
      password: "123",
    });

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "123",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(responseBalance.status).toBe(200);
    expect(responseBalance.body.balance).toBe(100);
  });

  it("should not be able to get the balance if user's id does not exist", async () => {
    const fakeUser = {
      name: "fake",
      email: "fake@example.com",
      password: "321",
    };

    const secret = authConfig.jwt.secret;

    const token = sign({ fakeUser }, secret, {
      subject: uuid(),
    });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});
