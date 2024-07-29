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

const megabytes = (size: number) => size * 1024 * 1024;

app.post("/stt", async (c) => {
  const body = await c.req.parseBody();

  const file = body["file"];
  if (!(file instanceof File))
    return c.json(
      {
        message: '"file" must be a File',
      },
      400
    );

  if (file.size > megabytes(100))
    return c.json({ message: "File is too large" }, 400);

  const audio = await file.arrayBuffer();

  const response = await c.env.AI.run("@cf/openai/whisper-tiny-en", {
    audio: [...new Uint8Array(audio)],
  });

  return c.json(response);
});

export default app;
