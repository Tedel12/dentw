"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function Watermark({ doctorId }: { doctorId: string }) {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setTimestamp(format(new Date(), "dd/MM/yyyy HH:mm:ss"));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-wrap opacity-[0.05] select-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="w-1/4 p-8 transform -rotate-12 whitespace-nowrap text-sm font-black text-slate-900 uppercase tracking-widest">
          DR-ID: {doctorId} • {timestamp}
        </div>
      ))}
    </div>
  );
}
