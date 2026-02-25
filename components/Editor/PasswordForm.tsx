"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import Header from "@/components/Header";

interface PasswordFormProps {
  id: string;
}

export default function PasswordForm({ id }: PasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    router.push(`/${id}?p=${encodeURIComponent(password)}`);
  };

  return (
    <>
      <Header variant="simple" />
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="mx-4 w-full max-w-sm space-y-4 border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="mb-1 flex items-center gap-2 text-zinc-300">
            <Lock className="h-4 w-4" />
            <span className="text-sm">password protected</span>
          </div>
          <p className="text-[11px] text-zinc-500">this paste requires a password to view.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
            placeholder="enter password..."
            autoFocus
           />
           <button
            type="submit"
             className="flex w-full items-center justify-center gap-1.5 bg-zinc-200 px-4 py-2 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-300"
          >
            unlock
          </button>
        </form>
      </div>
    </>
  );
}
