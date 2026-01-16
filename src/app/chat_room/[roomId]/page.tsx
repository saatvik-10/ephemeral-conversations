"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { cn, formatTimeRemaining } from "../../../../lib/utils";

const Page = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  const [copyStatus, setCopyStatus] = useState<string>("COPY");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const handleCopyRoomId = () => {
    const roomUrl = window.location.href;
    navigator.clipboard.writeText(roomUrl);

    setCopyStatus("COPIED!");

    setTimeout(() => setCopyStatus("COPY"), 3 * 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex h-screen max-h-screen w-7xl flex-col overflow-hidden p-4">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 p-4 shadow-xs shadow-white">
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
                  timeRemaining !== null && timeRemaining < 60
                    ? "text-red-500"
                    : "text-amber-500",
                )}
              >
                {timeRemaining != null
                  ? formatTimeRemaining(timeRemaining)
                  : "--:--"}
              </span>
            </div>
          </div>

          <button className="hover:text-whote group flex cursor-pointer items-center gap-2 rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50">
            NUKE NOW
          </button>
        </div>
      </div>
    </main>
  );
};

export default Page;
