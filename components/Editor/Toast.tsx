"use client";

import { CheckCircle, Copy, XCircle, X } from "lucide-react";
import { useCallback } from "react";

interface ToastProps {
  generatedLink: string;
  error: string;
  copied: boolean;
  onCopy: () => void;
  onClear: () => void;
}

export default function Toast({ generatedLink, error, copied, onCopy, onClear }: ToastProps) {
  const closeToast = useCallback(() => {
    onClear();
  }, [onClear]);

  if (!generatedLink && !error) return null;

  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs">
      {error ? (
        <>
          <XCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span className="text-red-400">{error}</span>
          <button onClick={closeToast} className="ml-2 hover:text-zinc-200">
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <span className="max-w-[200px] truncate text-zinc-400 sm:max-w-md">{generatedLink}</span>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={onCopy} className="p-1.5 transition-colors hover:bg-zinc-800">
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-zinc-500" />
              )}
            </button>
            <button onClick={onClear} className="p-1.5 transition-colors hover:bg-zinc-800">
              <X className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
