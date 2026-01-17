"use client";

import { useUsername } from "@/hooks/useUsername";
import { Message } from "@/lib/realtime";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRef, useState } from "react";

interface ChatSubmissionProps {
  sendMsg: ({ text }: { text: string }) => void;
  isPending: boolean;
  msgs: Message[];
}

const ChatComponent = ({ sendMsg, isPending, msgs }: ChatSubmissionProps) => {
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { username } = useUsername();

  const handleChatText = () => {
    if (!input.trim()) return;

    sendMsg({ text: input });
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        {msgs?.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-xs text-zinc-600 md:text-base">
              Silence is{" "}
              <span className="font-bold text-yellow-600">Golden</span>, but
              words are{" "}
              <span className="font-bold text-green-600">Ephemeral</span>!
            </p>
          </div>
        )}

        {msgs.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start">
            <div className="group max-w-[80%]">
              <div className="mb-1 flex items-baseline gap-3">
                <span
                  className={cn(
                    "text-xs font-bold",
                    `${msg.sender === username ? "text-blue-500" : "text-green-500"}`,
                  )}
                >
                  {msg.sender === username ? "YOU" : msg.sender}
                </span>

                <span className="text-[10px] text-zinc-600">
                  {format(msg.timestamp, "HH:mm")}
                </span>

                <p className="text-sm text-zinc-300 leading-relaxed break-all">
                  {msg.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border-t border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex gap-4">
          <div className="group relative flex-1">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 animate-pulse text-blue-500">
              {">"}
            </span>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChatText();
              }}
              placeholder="Start Conversation..."
              autoFocus
              className="w-full rounded-md border border-zinc-800 bg-black py-3 pr-4 pl-8 text-sm text-zinc-100 transition-colors placeholder:text-zinc-700 focus:border-zinc-700 focus:outline-none"
            />
          </div>

          <button
            onClick={handleChatText}
            disabled={!input.trim() || isPending}
            className="cursor-pointer rounded-md bg-zinc-800 px-6 text-sm font-bold text-zinc-400 transition-all hover:bg-blue-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
