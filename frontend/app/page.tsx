"use client";

import { JetBrains_Mono } from "next/font/google";
const inter = JetBrains_Mono({ subsets: ["latin"], weight: "400" });

import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Copy,
  Lock,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
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

const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export default function PastebinLanding() {
  const [pageQuote, setPageQuote] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [expirationTime, setExpirationTime] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [expireAfterViewing, setExpireAfterViewing] = useState<boolean>(false);

  useEffect(() => {
    setPageQuote(getRandomQuote());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedLink("");

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: code,
          password: password || null,
          expiresAt: expirationTime
            ? new Date(expirationTime).toISOString()
            : null,
          expireAfterViewing: expireAfterViewing,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create paste");
      }

      const res = await response.json();
      setGeneratedLink(`${window.location.origin}/${res.data.id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${inter.className} min-h-screen bg-transparent text-gray-300 flex items-center justify-center`}
    >
      <ShootingStarsBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 py-16 relative z-10"
      >
        <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-400">
          Encrypted Pastes
        </h1>

        <p className="text-xl text-center mb-8">
          Securely share code, text, and messages with anyone. You have the
          control.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto border border-violet-500/70 rounded-2xl shadow-lg shadow-violet-900/50 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full min-h-[200px] bg-gray-900/30 border-2 border-violet-700/50 text-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-300 group-hover:border-violet-400"
                placeholder={pageQuote}
                required
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-800/10 to-gray-700/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label
                  htmlFor="password"
                  className="flex items-center mb-2 text-violet-200"
                >
                  <Lock className="mr-2 w-5 h-5 text-violet-500 group-hover:text-violet-400 transition" />
                  Optional Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/30 border-2 border-violet-700/50 text-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-300 group-hover:border-violet-400"
                  placeholder="Secure your paste"
                />
              </div>

              <div className="group">
                <label
                  htmlFor="expiration"
                  className="flex items-center mb-2 text-violet-200"
                >
                  <Clock className="mr-2 w-5 h-5 text-violet-500 group-hover:text-violet-400 transition" />
                  Expiration
                </label>
                <input
                  type="datetime-local"
                  id="expiration"
                  value={expirationTime}
                  onChange={(e) => setExpirationTime(e.target.value)}
                  className="w-full bg-gray-900/30 border-2 border-violet-700/50 text-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-300 group-hover:border-violet-400"
                />
              </div>
            </div>

            <div className="group flex items-center mb-4">
              <span className="mr-3 text-violet-200">Expire after viewing</span>
              <label
                htmlFor="toggleExpire"
                className="relative inline-block w-10 h-6"
              >
                <input
                  type="checkbox"
                  id="toggleExpire"
                  className="sr-only peer"
                  checked={expireAfterViewing}
                  onChange={() => setExpireAfterViewing(!expireAfterViewing)}
                />
                <div className="w-full h-full bg-violet-700 rounded-full transition-colors duration-300 peer-checked:bg-violet-600"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-violet-700 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-violet-500/50 active:shadow-none"
            >
              <UploadCloud className="mr-2 animate-bounce-slow" /> Create Paste
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 bg-pink-700/70 text-gray-200/90 p-3 rounded-xl animate-shake border border-pink-800/50"
            >
              {error}
            </motion.div>
          )}

          {generatedLink && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 bg-violet-900/70 text-gray-300 p-3 rounded-xl flex justify-between items-center border border-violet-700/50 animate-slide-in"
            >
              <span className="truncate max-w-[70%]">{generatedLink}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-violet-700 hover:bg-violet-600 px-3 py-1 rounded-md transition duration-300 flex items-center"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-400 animate-ping-slow" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={clearAllFields}
                  className="bg-violet-700 hover:bg-violet-600 px-3 py-1 rounded-md transition duration-300 flex items-center"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-4 text-sm w-full text-center text-[#725fdf]"
      >
        <a
          href="https://f0rk.systems/reso/tools_quickpost_bin"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#a78bfa] transition-colors"
        >
          CLI Tool Available
        </a>
      </motion.footer>
    </motion.div>
  );
}
