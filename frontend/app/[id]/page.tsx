/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { JetBrains_Mono } from "next/font/google";
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

import { motion } from "framer-motion";
import { Loader, Copy, CheckCircle, Lock, Clock, Terminal } from "lucide-react";
import React, { use } from "react";
import ShootingStarsBackground from "../stars";
import Link from "next/link";

interface Paste {
  id: string;
  content: string;
  expiresAt?: string;
  createdAt: string;
}
interface PasswordAuthRequest {
  password: string;
}
interface PasteViewProps {
  params: Promise<{ id: string }>;
}
interface ApiResponse {
  status: number;
  error: boolean;
  message: string;
  data?: Paste;
}

export default function PasteView({ params }: PasteViewProps) {
  const { id } = use(params);
  const [paste, setPaste] = React.useState<Paste | null>(null);
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [isPasswordProtected, setIsPasswordProtected] =
    React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [copied, setCopied] = React.useState<boolean>(false);

  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };
  const prettifyJson = (jsonStr: string) =>
    JSON.stringify(JSON.parse(jsonStr), null, 2);
  const highlightJson = (jsonStr: string) =>
    jsonStr
      .replace(
        /"(.*?)":/g,
        `<span class="text-[#c7c9f1] font-medium">"$1"</span>:`,
      )
      .replace(/: "(.*?)"/g, `: <span class="text-[#a78bfa]">"$1"</span>`)
      .replace(/: (\d+)/g, `: <span class="text-[#8b5cf6]">$1</span>`)
      .replace(/: (true|false)/g, `: <span class="text-[#8b5cf6]">$1</span>`)
      .replace(/: null/g, `: <span class="text-[#52525b]">null</span>`);

  React.useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(`/api/pastes/${id}`);
        const data: ApiResponse = await response.json();
        if (response.status === 401) {
          setIsPasswordProtected(true);
          setIsLoading(false);
          return;
        }
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch paste");
        setPaste(data.data as Paste);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setIsLoading(false);
      }
    };
    fetchPaste();
  }, [id]);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pastes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password } as PasswordAuthRequest),
      });
      const data: ApiResponse = await response.json();
      if (response.ok) {
        setPaste(data.data as Paste);
        setIsPasswordProtected(false);
        setIsLoading(false);
      } else {
        setError(data.message || "Invalid password");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!paste) return;
    navigator.clipboard.writeText(paste.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = paste ? paste.content.split("\n").length : 0;
  const charCount = paste ? paste.content.length : 0;
  const wordCount = paste?.content.trim()
    ? paste.content.trim().split(/\s+/).length
    : 0;
  const contentIsJson = paste ? isJson(paste.content) : false;

  return (
    <div
      className={`${mono.className} h-screen bg-[#09090b] text-[#a1a1aa] flex flex-col overflow-hidden`}
    >
      <ShootingStarsBackground />

      {/* Top Bar - Modernized */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.15)] bg-[#0a0a12]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Terminal className="w-5 h-5 text-[#8b5cf6]" />
          <Link
            href="/"
            className="text-[#f4f4f5] font-bold tracking-tight hover:text-[#c7c9f1] transition-colors"
          >
            tritan.paste
          </Link>
          {paste && (
            <>
              <div className="w-px h-4 bg-[rgba(139,92,246,0.2)]" />
              <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">
                {id}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {paste && (
            <>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-[#52525b] uppercase tracking-widest mr-2">
                <span>{lineCount} LN</span>
                <span>{wordCount} WD</span>
                <span>{charCount} CH</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] hover:bg-[rgba(139,92,246,0.1)] transition-all"
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-[#c7c9f1]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#8b5cf6]" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-[rgba(139,92,246,0.22)] border border-[rgba(139,92,246,0.4)] text-white hover:bg-[rgba(139,92,246,0.32)] transition-all"
              >
                + New Paste
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex overflow-hidden relative z-10"
      >
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="animate-spin text-[#8b5cf6] w-6 h-6" />
          </div>
        )}

        {isPasswordProtected && !isLoading && (
          <div className="flex-1 flex items-center justify-center p-6">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handlePasswordSubmit}
              className="w-full max-w-sm p-8 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0a0a12] shadow-2xl backdrop-blur-xl"
            >
              <Lock className="w-8 h-8 text-[#8b5cf6] mb-6" />
              <h3 className="text-lg font-bold text-[#f4f4f5] mb-2">
                Protected Paste
              </h3>
              <p className="text-xs text-[#71717a] mb-6">
                Enter access key to decrypt content.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#09090b] border border-[rgba(139,92,246,0.2)] rounded-lg px-4 py-3 text-sm text-[#f4f4f5] outline-none mb-4 focus:border-[#8b5cf6]"
                placeholder="Password..."
                autoFocus
              />
              {error && (
                <p className="text-[11px] text-[#f87171] mb-4">{error}</p>
              )}
              <button className="w-full py-3 rounded-lg bg-[#8b5cf6] text-white font-semibold text-sm hover:bg-[#7c3aed] transition-colors">
                Unlock
              </button>
            </motion.form>
          </div>
        )}

        {paste && !isLoading && (
          <>
            <div className="hidden sm:block text-right text-[11px] leading-7 text-[#52525b] px-5 pt-5 border-r border-[rgba(139,92,246,0.1)] bg-[rgba(10,10,18,0.4)] min-w-[4rem]">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-6 text-[13px] text-[#d4d4d8] whitespace-pre-wrap font-mono">
              {contentIsJson ? (
                <pre>
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightJson(prettifyJson(paste.content)),
                    }}
                  />
                </pre>
              ) : (
                paste.content
              )}
            </div>
          </>
        )}
      </motion.main>

      {/* Footer */}
      <footer className="relative z-20 flex items-center justify-between px-6 py-2 border-t border-[rgba(139,92,246,0.1)] bg-[rgba(10,10,18,0.9)] text-[10px] text-[#52525b] uppercase tracking-widest font-mono">
        <div className="flex gap-6">
          {paste && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {new Date(paste.createdAt).toLocaleDateString()}
            </span>
          )}
          {paste?.expiresAt && (
            <span className="text-[#c7c9f1]">⚡ Auto-burn enabled</span>
          )}
        </div>
        <div>
          {paste && (
            <span>{contentIsJson ? "JSON" : "PLAIN TEXT"} · UTF-8</span>
          )}
        </div>
      </footer>
    </div>
  );
}
