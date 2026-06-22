/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { JetBrains_Mono } from "next/font/google";
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

import { motion } from "framer-motion";
import { Loader, Copy, CheckCircle, Lock, Clock } from "lucide-react";
import React, { use } from "react";
import ShootingStarsBackground from "../stars";

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
  const [isPasswordProtected, setIsPasswordProtected] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [copied, setCopied] = React.useState<boolean>(false);

  const isJson = (str: string) => {
    try { JSON.parse(str); return true; } catch { return false; }
  };

  const prettifyJson = (jsonStr: string) =>
    JSON.stringify(JSON.parse(jsonStr), null, 2);

  const highlightJson = (jsonStr: string) =>
    jsonStr
      .replace(/"(.*?)":/g, `<span class="text-purple-400 font-medium">"$1"</span>:`)
      .replace(/: "(.*?)"/g, `: <span class="text-purple-300">"$1"</span>`)
      .replace(/: (\d+)/g, `: <span class="text-violet-400">$1</span>`)
      .replace(/: (true|false)/g, `: <span class="text-violet-500">$1</span>`)
      .replace(/: null/g, `: <span class="text-gray-500">null</span>`);

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
        if (!response.ok) throw new Error(data.message || "Failed to fetch paste");
        setPaste(data.data as Paste);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
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
  const wordCount = paste?.content.trim() ? paste.content.trim().split(/\s+/).length : 0;
  const contentIsJson = paste ? isJson(paste.content) : false;

  return (
    <div
      className={`${mono.className} h-screen bg-[#0a0a0f] text-gray-300 flex flex-col overflow-hidden`}
      style={{ fontFamily: "JetBrains Mono, monospace" }}
    >
      <ShootingStarsBackground />

      {/* Top Bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 flex items-center justify-between px-5 py-3 border-b border-violet-900/40 bg-[#0a0a0f]/80 backdrop-blur-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="/" className="text-violet-400 text-lg font-medium tracking-tight hover:text-violet-300 transition-colors">
            ∷ tritan paste
          </a>
          {paste && (
            <>
              <span className="text-violet-800/60">/</span>
              <span className="text-violet-600/80 text-xs">{id}</span>
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {paste && (
            <>
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 text-[11px] text-violet-600 mr-2">
                <span>{lineCount} ln</span>
                <span>{wordCount} w</span>
                <span>{charCount} ch</span>
              </div>

              {/* Copy button */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-violet-800/40 bg-transparent text-violet-500 hover:border-violet-600/60 hover:text-violet-400 transition-all duration-200"
              >
                {copied
                  ? <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Copied</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>

              {/* New paste */}
              <a
                href="/"
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white transition-all duration-200 shadow-lg shadow-violet-900/40 hover:shadow-violet-700/40 active:scale-95"
              >
                + New Paste
              </a>
            </>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative z-10 flex-1 flex overflow-hidden"
      >
        {/* Loading */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="animate-spin text-violet-600 w-5 h-5" />
          </div>
        )}

        {/* Password gate */}
        {isPasswordProtected && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-sm mx-4"
            >
              <form onSubmit={handlePasswordSubmit} className="bg-[#0f0f1a]/95 border border-violet-800/50 rounded-xl shadow-2xl shadow-violet-950/60 backdrop-blur-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Password Protected</span>
                </div>
                <p className="text-[11px] text-violet-700">This paste requires a password to view.</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-violet-800/40 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 placeholder-violet-800 transition"
                  placeholder="Enter password..."
                  autoFocus
                />
                {error && (
                  <p className="text-[11px] text-rose-400">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-600 text-white transition-all duration-200 shadow-lg shadow-violet-900/40 active:scale-95"
                >
                  Unlock
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Error */}
        {error && !isPasswordProtected && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-3"
            >
              <p className="text-rose-400 text-sm">{error}</p>
              <a href="/" className="text-violet-500 hover:text-violet-400 text-xs underline underline-offset-2 transition-colors">
                ← back to home
              </a>
            </motion.div>
          </div>
        )}

        {/* Paste content */}
        {paste && !isLoading && !isPasswordProtected && (
          <>
            {/* Line numbers */}
            <div
              className="hidden sm:block select-none text-right text-[12px] leading-6 text-violet-800/50 px-4 pt-4 pb-4 border-r border-violet-900/30 bg-[#08080e]/40 min-w-[3.5rem] overflow-hidden"
              aria-hidden
            >
              {Array.from({ length: Math.max(lineCount, 40) }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {contentIsJson ? (
                <pre className="text-[13px] leading-6 whitespace-pre-wrap break-words">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightJson(prettifyJson(paste.content)),
                    }}
                  />
                </pre>
              ) : (
                <pre className="text-[13px] leading-6 whitespace-pre-wrap break-words text-gray-200">
                  {paste.content}
                </pre>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-20 flex items-center justify-between px-5 py-1.5 border-t border-violet-900/30 bg-[#0a0a0f]/80 backdrop-blur-md text-[10px] text-violet-700"
      >
        <div className="flex items-center gap-4">
          {paste && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {new Date(paste.createdAt).toLocaleString()}
            </span>
          )}
          {paste?.expiresAt && (
            <span className="text-violet-500">
              ⚡ expires {new Date(paste.expiresAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://f0rk.systems/reso/tools_quickpost_bin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-violet-400 transition-colors underline underline-offset-2"
          >
            CLI tool
          </a>
          {paste && (
            <span className="hidden md:block">
              {contentIsJson ? "json" : "plain text"} · utf-8
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}