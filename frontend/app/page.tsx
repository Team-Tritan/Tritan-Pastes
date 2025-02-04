"use client";

import React, { useState, FormEvent } from "react";
import {
  UploadCloud,
  Lock,
  Clock,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function PastebinLanding() {
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [expirationTime, setExpirationTime] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [ip, setIP] = useState<string>("");
  const [expireAfterViewing, setExpireAfterViewing] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedLink("");

    try {
      await fetch("https://ip.xvh.lol")
        .then((res) => res.json())
        .then((i) => {
          setIP(i.ip);
        });

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
          ip,
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
    <div className="min-h-screen bg-black text-indigo-200 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950/50 to-black opacity-75 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-400">
          Encrypted Pastes
        </h1>

        <p className="text-xl text-center mb-8">
          Securely share code, text, and messages with anyone. You have the
          control.
        </p>

        <div
          className="max-w-2xl mx-auto bg-black/70 border border-indigo-800/50 rounded-2xl shadow-2xl shadow-indigo-900/50 p-8 
        transform transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-600/50 
        animate-fade-in"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label htmlFor="code" className="block mb-2 text-indigo-300">
                Paste Content
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full min-h-[200px] bg-black/40 border-2 border-indigo-800/50 text-indigo-200 
                rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                transition duration-300 group-hover:border-indigo-600"
                placeholder="fxx likes men..... :o"
                required
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900/10 to-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label
                  htmlFor="password"
                  className="flex items-center mb-2 text-indigo-300"
                >
                  <Lock className="mr-2 w-5 h-5 text-indigo-500 group-hover:text-indigo-400 transition" />
                  Optional Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border-2 border-indigo-800/50 text-indigo-200 
                  rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500
                  transition duration-300 group-hover:border-indigo-600"
                  placeholder="Secure your paste"
                />
              </div>

              <div className="group">
                <label
                  htmlFor="expiration"
                  className="flex items-center mb-2 text-indigo-300"
                >
                  <Clock className="mr-2 w-5 h-5 text-indigo-500 group-hover:text-indigo-400 transition" />
                  Expiration
                </label>
                <input
                  type="datetime-local"
                  id="expiration"
                  value={expirationTime}
                  onChange={(e) => setExpirationTime(e.target.value)}
                  className="w-full bg-black/40 border-2 border-indigo-800/50 text-indigo-200 
                  rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500
                  transition duration-300 group-hover:border-indigo-600"
                />
              </div>
            </div>

            <div className="group">
              <label className="flex items-center mb-2 text-indigo-300">
                <input
                  type="checkbox"
                  checked={expireAfterViewing}
                  onChange={() => setExpireAfterViewing(!expireAfterViewing)}
                  className="mr-2 w-5 h-5 text-indigo-500 group-hover:text-indigo-400 transition"
                />
                Expire after viewing
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl 
              transition duration-300 flex items-center justify-center 
              transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-indigo-500/50 active:shadow-none"
            >
              <UploadCloud className="mr-2 animate-bounce-slow" /> Create Paste
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-900/70 text-red-300 p-3 rounded-xl animate-shake border border-red-800/50">
              {error}
            </div>
          )}

          {generatedLink && (
            <div className="mt-4 bg-indigo-900/70 text-indigo-200 p-3 rounded-xl flex justify-between items-center border border-indigo-800/50 animate-slide-in">
              <span className="truncate max-w-[70%]">{generatedLink}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1 rounded-md transition duration-300 flex items-center"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-400 animate-ping-slow" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={clearAllFields}
                  className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1 rounded-md transition duration-300 flex items-center"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
