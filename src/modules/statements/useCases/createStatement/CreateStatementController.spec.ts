import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import { sign } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import { v4 as uuid } from "uuid";

describe("Create statement", () => {
  let connection: Connection;
  let token: string;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "test@email.com",
      password: "123",
    });

    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "123",
    });

    token = authResponse.body.token;

    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const withdrawResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(withdrawResponse.status).toBe(201);
    expect(depositResponse.status).toBe(201);
  });

  it("should not be able to withdraw a amount greater than your balance", async () => {
    const withdrawResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(withdrawResponse.status).toBe(400);
    expect(withdrawResponse.body.message).toBe("Insufficient funds");
  });

  it("should not be able to create a new statement if token is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer invalidToken`,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!");
  });

  it("should not be able to create a new statement if user does not exist", async () => {
    const fakeUser = {
      name: "Test user2",
      email: "test@example.com",
      password: "321",
    };

    const secret = authConfig.jwt.secret;

    const token = sign({ fakeUser }, secret, {
      subject: uuid(),
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});
