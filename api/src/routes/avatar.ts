import { Hono } from "hono";
import { generateAvatarPNG } from "../lib/avatar-generator";
import type { HonoEnv } from "../types";

export const avatarRouter = new Hono<HonoEnv>().get("/:id", async (c) => {
  const id = c.req.param("id");
  if (id.length > 128) return c.json({ error: "invalid id" }, 400);

  try {
    const pngBytes = await generateAvatarPNG(id);
    return c.body(pngBytes as unknown as Uint8Array<ArrayBuffer>, 200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  } catch (err) {
    console.error("Failed to generate avatar PNG:", err);
    return c.json({ error: "failed to generate avatar" }, 500);
  }
});
