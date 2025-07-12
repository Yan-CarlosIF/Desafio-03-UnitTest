import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import { sign } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import { v4 as uuid } from "uuid";

describe("Get statement operation", () => {
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

  it("should be able to get statement operation", async () => {
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
    const user = authResponse.body.user;

    const { body: statement } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(statement.id);
    expect(response.body.user_id).toEqual(user.id);
    expect(Number(response.body.amount)).toEqual(Number(statement.amount));
  });

  it("should not be able to get statement operation if user id does not exist", async () => {
    const { body: statement } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test description",
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const fakeUser = {
      name: "fake",
      email: "fake@example.com",
      password: "321",
    };

    const secret = authConfig.jwt.secret;

    const inexistentToken = sign({ fakeUser }, secret, {
      subject: uuid(),
    });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set({
        authorization: `Bearer ${inexistentToken}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should not be able to get statement operation if statement id does not exist", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${uuid}`)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
