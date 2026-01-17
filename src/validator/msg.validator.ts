import * as z from "zod";

export const querySchema = z.object({
  roomId: z.string(),
});

export const bodySchema = z.object({
  sender: z.string().max(100),
  text: z.string().max(1000),
});
