import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'medchain_user',
    password: process.env.MYSQL_PASSWORD || 'medchain_password',
    database: process.env.MYSQL_DATABASE || 'medchain_db',
  },
});