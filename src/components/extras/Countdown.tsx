"use client";
import { useState, useEffect } from "react";

interface Props {
  endTime: number;
  onFinished?: () => void;
}

const Countdown = ({ endTime, onFinished }: Props) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (endTime === 0) {
      setTimeLeft("∞ INFINITE SESSION");
      setIsFinished(false);
      return;
    }

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("VOTING ENDED");
        setIsFinished(true);

        if (onFinished) onFinished();
      } else {
        const h = Math.floor(distance / 3600);
        const m = Math.floor((distance % 3600) / 60);
        const s = distance % 60;

        const pad = (num: number) => num.toString().padStart(2, "0");
        setTimeLeft(`${pad(h)}h : ${pad(m)}m : ${pad(s)}s`);
        setIsFinished(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onFinished]);

  return (
    <div className="flex flex-col items-center lg:items-end">
      <span className="text-xs font-bold uppercase text-custom-orange animate-pulse tracking-widest mb-1">
        {endTime === 0 ? "Status" : "Time Remaining"}
      </span>
      <div className="text-3xl font-black font-mono text-white bg-zinc-900 px-4 py-2 border-l-4 border-custom-orange shadow-lg">
        {timeLeft}
      </div>
      {!isFinished && endTime !== 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_8px_#4ADE80]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#4ADE80]">
            Scoreboard is live!
          </span>
        </div>
      )}
      {isFinished && (
        <span className="mt-2 text-[11px] font-black uppercase tracking-widest text-custom-pink">
          Voting has concluded
        </span>
      )}

      {endTime === 0 && (
        <p className="text-[10px] text-zinc-500 mt-1 italic uppercase font-bold tracking-tighter">
          Scoreboard active indefinitely
        </p>
      )}
    </div>
  );
};

export default Countdown;
