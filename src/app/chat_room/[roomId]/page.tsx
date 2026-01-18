"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn, formatTimeRemaining } from "../../../lib/utils";
import ChatComponent from "@/components/ChatComponent";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { useUsername } from "@/hooks/useUsername";
import { Message } from "@/lib/realtime";
import { useRealtime } from "@/lib/realtime-client";
import { useRouter } from "next/navigation";

const Page = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  const route = useRouter();
  const { username } = useUsername();

  const [copyStatus, setCopyStatus] = useState<string>("COPY");
  const [timeRemaining, setTimeRemaining] = useState<number>();
  const [totalMembers, setTotalMembers] = useState<number>();

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({
        query: { roomId },
      });
      return res.data;
    },
  });

  const { data: metaData } = useQuery({
    queryKey: ["meta", roomId],
    queryFn: async () => {
      const res = await client.room.meta.get({
        query: { roomId },
      });
      return res.data;
    },
  });

  useEffect(() => {
    if (ttlData?.ttl !== undefined) {
      setTimeRemaining(ttlData.ttl);
    }
  }, [ttlData?.ttl]);

  useEffect(() => {
    if (metaData?.connected !== undefined) {
      setTotalMembers(metaData.connected);
    }
  }, [metaData?.connected]);

  useEffect(() => {
    if (timeRemaining === undefined || timeRemaining <= 0) {
      if (timeRemaining === 0) {
        route.push("/?destroyed=true");
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === undefined || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, route]);

  const { data: msgs = [], refetch } = useQuery<Message[]>({
    queryKey: ["msgs", roomId],
    queryFn: async () => {
      const res = await client.msgs.get({
        query: { roomId },
      });
      return (res.data?.msgs as []) || [];
    },
  });

  const { mutate: sendMsg, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      try {
        await client.msgs.post(
          {
            sender: username,
            text,
          },
          { query: { roomId } },
        );
      } catch (err) {
        console.log("Error sending message", err);
      }
    },
  });

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      }

      if (event === "chat.destroy") {
        route.push("/?destroyed=true");
      }
    },
  });

  const handleCopyRoomId = () => {
    const roomUrl = window.location.href;
    navigator.clipboard.writeText(roomUrl);

    setCopyStatus("COPIED!");

    setTimeout(() => setCopyStatus("COPY"), 3 * 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex h-screen max-h-screen w-7xl flex-col overflow-hidden p-4">
        <div className="flex items-center justify-between rounded-lg border-b border-zinc-800 bg-zinc-900/30 p-4 shadow-xs shadow-white">
          <div className="flex items-center justify-center">
            <div className="flex flex-col">
              <span className="text-x text-zinc-500 uppercase">Room ID</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-500">{roomId}</span>

                <button
                  onClick={handleCopyRoomId}
                  className={cn(
                    "cursor-pointer rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-600 hover:text-zinc-200",
                    copyStatus === "COPIED!" && "bg-green-800 text-green-200",
                  )}
                >
                  {copyStatus}
                </button>
              </div>
            </div>

            <div className="mx-4 h-8 w-px bg-zinc-800" />

            <div className="flex flex-col items-center">
              <span className="text-xs text-zinc-500 uppercase">
                EVAPORATING IN
              </span>

              <span
                className={cn(
                  "flex items-center gap-2 text-sm font-bold",
                  timeRemaining !== null && timeRemaining! < 60
                    ? "text-red-500"
                    : "text-amber-500",
                )}
              >
                {timeRemaining != null
                  ? formatTimeRemaining(timeRemaining)
                  : "--:--"}
              </span>
            </div>
            <div className="mx-4 h-8 w-px bg-zinc-800" />

            <div className="flex flex-col items-center">
              <span className="text-xs text-zinc-500 uppercase">Allowed</span>

              <span className="flex items-center gap-2 text-sm font-bold">
                {totalMembers}/{metaData?.allowedParticipants as number}
              </span>
            </div>
          </div>

          <button className="hover:text-whote group flex cursor-pointer items-center gap-2 rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50">
            NUKE NOW
          </button>
        </div>

        <ChatComponent isPending={isPending} sendMsg={sendMsg} msgs={msgs} />
      </div>
    </main>
  );
};

export default Page;
