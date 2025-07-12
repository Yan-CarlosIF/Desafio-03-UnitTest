import { Connection } from "typeorm";
import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";

describe("Show user profile", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user's profile", async () => {
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

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: "Test user",
      email: "test@email.com",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});
