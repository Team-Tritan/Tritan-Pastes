"use client";

import { JetBrains_Mono } from "next/font/google";
const inter = JetBrains_Mono({ subsets: ["latin"], weight: "400" });

import { motion } from "framer-motion";
import { Loader } from "lucide-react";
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
  const [isPasswordProtected, setIsPasswordProtected] =
    React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const prettifyJson = (jsonStr: string) => {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  };

  const highlightJson = (jsonStr: string) => {
    return jsonStr
      .replace(
        /"(.*?)":/g,
        `<span class="text-blue-400">"$1"</span>:` // Keys in blue
      )
      .replace(
        /: "(.*?)"/g,
        `: <span class="text-green-400">"$1"</span>` // Strings in green
      )
      .replace(
        /: (\d+)/g,
        `: <span class="text-yellow-400">$1</span>` // Numbers in yellow
      )
      .replace(
        /: (true|false)/g,
        `: <span class="text-purple-400">$1</span>` // Booleans in purple
      )
      .replace(
        /: null/g,
        `: <span class="text-gray-400">null</span>` // Null in gray
      );
  };

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

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch paste");
        }

        setPaste(data.data as Paste);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${inter.className} min-h-screen bg-transparent text-gray-300 flex items-center justify-center relative`}
    >
      <ShootingStarsBackground />
      {/* Removed preset gradient background */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 py-16 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto border border-violet-500/70 rounded-2xl shadow-lg shadow-violet-900/50 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          {isPasswordProtected && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-gray-300">
                  Password Protected
                </h2>
                <div className="bg-black/30 border-2 border-violet-700/50 text-gray-300 rounded-xl p-4">
                  <label className="block text-sm text-gray-300">
                    Enter Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 mt-2 bg-transparent border border-zinc-800 rounded-xl focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-violet-600 text-gray-300 rounded-xl px-4 py-2"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
          {isLoading && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">
                Paste Content
              </h2>
              <div className="bg-black/30 border-2 border-violet-700/50 text-gray-300 rounded-xl p-4 flex items-center justify-center">
                <Loader className="animate-spin text-gray-300 w-6 h-6" />
              </div>
            </div>
          )}
          {error && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">
                Paste Content
              </h2>
              <div className="bg-pink-700/70 text-gray-200/90 p-3 rounded-xl animate-shake border border-pink-800/50">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          {paste && !isLoading && !isPasswordProtected && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">
                Paste Content
              </h2>
              <p className="text-sm text-gray-300">
                This paste was created at{" "}
                {new Date(paste.createdAt).toLocaleString()}.
              </p>
              <div className="bg-black/30 border-2 border-violet-700/50 text-gray-300 rounded-xl p-4">
                {isJson(paste.content) ? (
                  <pre className="whitespace-pre-wrap break-words text-sm">
                    <code
                      className="font-mono"
                      dangerouslySetInnerHTML={{
                        __html: highlightJson(prettifyJson(paste.content)),
                      }}
                    />
                  </pre>
                ) : (
                  <pre className="whitespace-pre-wrap break-words text-sm">
                    {paste.content}
                  </pre>
                )}
              </div>
            </div>
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
