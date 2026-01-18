import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { redis } from "../../../lib/redis";
import { authProxy } from "./auth";
import { bodySchema, querySchema } from "@/validator/msg.validator";
import { Message, realtime } from "@/lib/realtime";
import { allowedParticipantsSchema } from "@/validator/chat.validator";

const rooms = new Elysia({ prefix: "/room" })
  .post(
    "/create",
    async ({ body }) => {
      const roomId = nanoid();
      const { allowedParticipants } = body;

      if (!allowedParticipants || allowedParticipants < 2) {
        throw new Error("invalid-capacity");
      }

      await redis.hset(`meta_room_id: ${roomId}`, {
        connected: [],
        allowedParticipants,
        createdAt: Date.now(),
      });

      await redis.expire(
        `meta_room_id: ${roomId}`,
        Number(process.env.ROOM_TTL_SECONDS),
      );

      return { roomId };
    },
    {
      body: allowedParticipantsSchema,
    },
  )
  .use(authProxy)
  .get(
    "/ttl",
    async ({ auth }) => {
      const { roomId } = auth;

      const ttl = await redis.ttl(`meta_room_id: ${roomId}`);

      return { ttl: ttl > 0 ? ttl : 0 };
    },
    { query: querySchema },
  )
  .get(
    "/meta",
    async ({ auth }) => {
      const { roomId } = auth;

      const roomMeta = await redis.hgetall(`meta_room_id: ${roomId}`);

      return {
        allowedParticipants: roomMeta?.allowedParticipants,
        connected: (roomMeta?.connected as string[])?.length,
      };
    },
    { query: querySchema },
  )
  .delete(
    "/",
    async ({ auth }) => {
      const { roomId } = auth;
      await realtime.channel(roomId).emit("chat.destroy", {
        isDestoyed: true,
      });

      await Promise.all([
        redis.del(roomId),
        redis.del(`meta_room_id: ${roomId}`),
        redis.del(`msgs: ${roomId}`),
      ]);
    },
    {
      query: querySchema,
    },
  );

const msgs = new Elysia({ prefix: "/msgs" })
  .use(authProxy)
  .post(
    "/",
    async ({ body, auth }) => {
      const { sender, text } = body;
      const { roomId, token } = auth;

      const roomExists = await redis.exists(`meta_room_id: ${roomId}`);

      if (!roomExists) {
        throw new Error("Room does not exist");
      }

      const msg: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
      };

      await redis.rpush(`msgs: ${roomId}`, {
        ...msg,
        token: token,
      });

      await realtime.channel(roomId).emit("chat.message", msg);

      const remainingTTL = await redis.ttl(`meta_room_id: ${roomId}`);

      await Promise.all([
        redis.expire(`msgs: ${roomId}`, remainingTTL),
        redis.expire(roomId, remainingTTL),
      ]);
    },
    {
      query: querySchema,
      body: bodySchema,
    },
  )
  .get(
    "/",
    async ({ auth }) => {
      const { roomId, token } = auth;

      const msgs = await redis.lrange<Message>(`msgs: ${roomId}`, 0, -1);

      return {
        msgs: msgs.map((msg) => ({
          ...msg,
          token: msg.token === token ? token : undefined,
        })),
      };
    },
    {
      query: querySchema,
    },
  );

const app = new Elysia({ prefix: "/api" }).use(rooms).use(msgs);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;
