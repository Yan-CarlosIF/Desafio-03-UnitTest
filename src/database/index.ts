import { Connection, createConnection, getConnectionOptions } from "typeorm";

(async () => await createConnection())();

export default async (): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  const connection = await createConnection(
    Object.assign(defaultOptions, {
      database: process.env.NODE_ENV === "test" ? "fin_api_test" : "fin_api",
    })
  ).catch((error) => {
    throw new Error(error);
  });

  return connection;
};
