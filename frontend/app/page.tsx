/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { JetBrains_Mono } from "next/font/google";
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Copy,
  Lock,
  UploadCloud,
  XCircle,
  Eye,
  Settings,
  ChevronDown,
} from "lucide-react";
import { FormEvent, useEffect, useState, useRef } from "react";
import ShootingStarsBackground from "./stars";

const quotes = [
  "femboys.... mmmgh",
  "you can't fix me",
  "i love you dada",
  "paste all over me",
  "meow :3",
  "i'm just a foxgirl",
  "please avenge me",
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

export default function PastebinLanding() {
  const [pageQuote, setPageQuote] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [expirationTime, setExpirationTime] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [expireAfterViewing, setExpireAfterViewing] = useState<boolean>(false);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedLink("");

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: code,
          password: password || null,
          expiresAt: expirationTime ? new Date(expirationTime).toISOString() : null,
          expireAfterViewing,
        }),
      });

      if (!response.ok) throw new Error("Failed to create paste");
      const res = await response.json();
      setGeneratedLink(`${window.location.origin}/${res.data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAllFields = () => {
    setCode("");
    setPassword("");
    setExpirationTime("");
    setGeneratedLink("");
    setError("");
    setCopied(false);
    setExpireAfterViewing(false);
  };

  const wordCount = code.trim() ? code.trim().split(/\s+/).length : 0;
  const charCount = code.length;
  const lineCount = code ? code.split("\n").length : 0;

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
          <span className="text-violet-400 text-lg font-medium tracking-tight">
            ∷ tritan paste
          </span>
          <span className="text-violet-700/60 text-xs hidden sm:block">encrypted & ephemeral</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-[11px] text-violet-600 mr-2">
            <span>{lineCount} ln</span>
            <span>{wordCount} w</span>
            <span>{charCount} ch</span>
          </div>

          {/* Options Dropdown */}
          <div className="relative" ref={optionsRef}>
            <button
              type="button"
              onClick={() => setOptionsOpen(!optionsOpen)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                optionsOpen || password || expirationTime || expireAfterViewing
                  ? "border-violet-500/70 bg-violet-900/30 text-violet-300"
                  : "border-violet-800/40 bg-transparent text-violet-500 hover:border-violet-600/60 hover:text-violet-400"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Options
              {(password || expirationTime || expireAfterViewing) && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-0.5" />
              )}
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${optionsOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {optionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#0f0f1a]/95 border border-violet-800/50 rounded-xl shadow-2xl shadow-violet-950/60 backdrop-blur-xl p-4 space-y-4"
                >
                  {/* Password */}
                  <div>
                    <label className="flex items-center gap-2 text-[11px] text-violet-400 mb-1.5 uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/30 border border-violet-800/40 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 placeholder-violet-800 transition"
                      placeholder="Leave empty for no password"
                    />
                  </div>

                  {/* Expiration */}
                  <div>
                    <label className="flex items-center gap-2 text-[11px] text-violet-400 mb-1.5 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      Expires at
                    </label>
                    <input
                      type="datetime-local"
                      value={expirationTime}
                      onChange={(e) => setExpirationTime(e.target.value)}
                      className="w-full bg-black/30 border border-violet-800/40 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition [color-scheme:dark]"
                    />
                  </div>

                  {/* Expire after view */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11px] text-violet-400 uppercase tracking-wider cursor-pointer">
                      <Eye className="w-3 h-3" />
                      Expire after viewing
                    </label>
                    <button
                      type="button"
                      onClick={() => setExpireAfterViewing(!expireAfterViewing)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                        expireAfterViewing ? "bg-violet-600" : "bg-violet-900/60 border border-violet-700/50"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          expireAfterViewing ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit as any}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white transition-all duration-200 shadow-lg shadow-violet-900/40 hover:shadow-violet-700/40 active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Create Paste
          </button>
        </div>
      </motion.header>

      {/* Main Editor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative z-10 flex-1 flex overflow-hidden"
      >
        {/* Line numbers */}
        <div
          className="hidden sm:block select-none text-right text-[12px] leading-6 text-violet-800/50 px-4 pt-4 pb-4 border-r border-violet-900/30 bg-[#08080e]/40 min-w-[3.5rem] overflow-hidden"
          aria-hidden
        >
          {Array.from({ length: Math.max(lineCount, 40) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 h-full resize-none bg-transparent text-gray-200 text-[13px] leading-6 p-4 focus:outline-none placeholder-violet-900/50 caret-violet-400 selection:bg-violet-800/40"
          placeholder={pageQuote}
          spellCheck={false}
          autoFocus
        />
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-20 flex items-center justify-between px-5 py-1.5 border-t border-violet-900/30 bg-[#0a0a0f]/80 backdrop-blur-md text-[10px] text-violet-700"
      >
        <div className="flex items-center gap-4">
          {expireAfterViewing && <span className="text-violet-500">⚡ burns after reading</span>}
          {password && <span className="text-violet-500">🔒 password protected</span>}
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <span>{lineCount} ln · {charCount} ch</span>
        </div>
        <div className="hidden md:block">
          plain text · utf-8
        </div>
      </motion.div>

      {/* Result / Error Toast */}
      <AnimatePresence>
        {(generatedLink || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-12 left-1/2 z-50"
          >
            {error ? (
              <div className="flex items-center gap-3 bg-[#1a0a0f] border border-rose-800/60 text-rose-300 text-xs px-5 py-3 rounded-xl shadow-2xl shadow-rose-950/40">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                {error}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[#0f0a1a]/95 border border-violet-700/50 text-gray-300 text-xs px-4 py-3 rounded-xl shadow-2xl shadow-violet-950/60 backdrop-blur-xl max-w-md">
                <span className="truncate text-violet-300">{generatedLink}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg bg-violet-800/40 hover:bg-violet-700/60 transition"
                  >
                    {copied
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <Copy className="w-4 h-4 text-violet-300" />
                    }
                  </button>
                  <button
                    onClick={clearAllFields}
                    className="p-1.5 rounded-lg bg-violet-800/40 hover:bg-violet-700/60 transition"
                  >
                    <XCircle className="w-4 h-4 text-violet-300" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}