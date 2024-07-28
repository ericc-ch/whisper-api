import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { logger } from "hono/logger";

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

type Env = {
  AUTH_USERNAME: string;
  AUTH_PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings & Env }>();

app.use("/*", logger());

app.use("/*", (c, next) => {
  const middleware = basicAuth({
    username: c.env.AUTH_USERNAME,
    password: c.env.AUTH_PASSWORD,
  });

  return middleware(c, next);
});

app.get("/sst", (c) => {
  return c.text("Hello Hono!");
});

export default app;
