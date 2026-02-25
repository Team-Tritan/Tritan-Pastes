import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  SECRET_KEY: str(),
  DATABASE_URL: str(),
});
