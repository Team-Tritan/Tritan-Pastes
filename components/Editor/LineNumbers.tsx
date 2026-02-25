"use client";

import { useRef, useEffect, forwardRef } from "react";

interface LineNumbersProps {
  lineCount: number;
  scrollTop?: number;
}

const LineNumbers = forwardRef<HTMLDivElement, LineNumbersProps>(({ lineCount }, ref) => {
  const internalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && typeof ref === "object") {
      ref.current = internalRef.current;
    }
  }, [ref]);

  const lines = Math.max(lineCount, 40);

  return (
    <div
      ref={internalRef}
      className="hidden min-w-[3.5rem] select-none overflow-hidden border-r border-zinc-800 px-4 pt-4 text-right text-[12px] leading-6 text-zinc-600 sm:block"
      aria-hidden
    >
      {Array.from({ length: lines }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
});

LineNumbers.displayName = "LineNumbers";

export default LineNumbers;
