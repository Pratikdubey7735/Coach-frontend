"use client";

import { useEffect, useState } from "react";

const LINES = [
  { text: "auth.service", status: "ok", color: "#3DDC84" },
  { text: "session.store", status: "ok", color: "#3DDC84" },
  { text: "rate.limiter", status: "watch", color: "#4D9FFF" },
  { text: "audit.log", status: "ok", color: "#3DDC84" },
];

export default function LoginTerminal() {
  const [visible, setVisible] = useState<number>(0);

  useEffect(() => {
    if (visible >= LINES.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 260);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="rounded-lg border border-[#1E2633] bg-[#0F1420] p-4 font-mono text-[11px]">
      <div className="mb-2 flex items-center justify-between text-[#3D4552]">
        <span className="uppercase tracking-wider">system status</span>
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D6A]/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#4D9FFF]/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#3DDC84]/60" />
        </div>
      </div>
      <div className="space-y-1.5">
        {LINES.slice(0, visible).map((line, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-[#5B6675] animate-[fadeIn_0.3s_ease]"
          >
            <span>{line.text}</span>
            <span style={{ color: line.color }}>{line.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}