"use client";

import { useMutation } from "@tanstack/react-query";
import { client } from "../lib/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsername } from "@/hooks/useUsername";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { errMessages } from "@/constants/err";

export default function Home() {
  return (
    <Suspense>
      <Page />
    </Suspense>
  );
}

function Page() {
  const route = useRouter();

  const [allowedParticipants, setallowedParticipants] = useState<number>(2);

  const { username } = useUsername();
  const searchParams = useSearchParams();

  const isDestroyed = searchParams.get("destroyed") === "true";
  const err = searchParams.get("err");

  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post({
        allowedParticipants,
      });

      if (res.status === 200) {
        route.push(`/chat_room/${res.data?.roomId}`);
        toast.success("Creating Room...Please wait!");
      } else {
        toast.error("Room config was invalid!");
      }
    },
    onError: () => {
      toast.error("Error creating room");
    },
  });

  useEffect(() => {
    if (isDestroyed) {
      toast("Room Nuked! All messages have been purged from existence.", {
        id: "destroyed",
        duration: 4000,
        style: {
          border: "1px solid oklch(62.3% 0.214 259.815)",
          padding: "16px",
          color: "oklch(62.3% 0.214 259.815)",
          backgroundColor: "oklch(95% 0.05 259.815)",
          fontWeight: "bold",
        },
      });
    } else if (err && errMessages[err as keyof typeof errMessages]) {
      toast.error(errMessages[err as keyof typeof errMessages], { id: err });
    }
  }, [isDestroyed, err]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-blue-500">
            &copy;ephemeral_conversations
          </h1>
          <p className="text-sm text-red-500">
            End-to-end encrypted chats that self-destruct...
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="flex items-center text-zinc-500">
                Chat Handle
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-400">
                  {username}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="ppl_allowed"
                className="flex items-center text-zinc-500"
              >
                Max Participants
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-400">
                  <input
                    value={allowedParticipants}
                    onChange={(e) =>
                      setallowedParticipants(e.target.valueAsNumber)
                    }
                    placeholder="Enter allowed participants..."
                    type="number"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isPending || allowedParticipants < 2}
              onClick={() => createRoom()}
              className="mt-2 w-full cursor-pointer rounded-md bg-zinc-100 p-3 text-black transition-colors hover:bg-zinc-50 hover:not-only:text-black disabled:opacity-50"
            >
              LAUNCH ROOM
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
