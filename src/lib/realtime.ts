import { chatValidatorSchema } from "@/validator/chat.validator";
import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { redis } from "./redis";
import z from "zod";

export const realtime = new Realtime({ chatValidatorSchema, redis });

export type RealTimeEvents = InferRealtimeEvents<typeof realtime>;
export type Message = z.infer<typeof chatValidatorSchema.chat.message>;
