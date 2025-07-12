import "dotenv/config";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export default {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: "1d",
  },
};
