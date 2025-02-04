"use client";
import React, { use } from "react";
import { Loader } from "lucide-react";

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
    return isJson(jsonStr)
      ? JSON.stringify(JSON.parse(jsonStr), null, 2)
      : jsonStr;
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
    <div className="min-h-screen bg-black text-indigo-200 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950/50 to-black opacity-75 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto bg-black/70 border border-indigo-800/50 rounded-2xl shadow-2xl shadow-indigo-900/50 p-8">
          {isPasswordProtected && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Password Protected</h2>
                <div className="bg-black/40 border-2 border-indigo-800/50 text-indigo-200 rounded-xl p-4">
                  <label className="block text-sm">Enter Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 mt-2 text-indigo-200 bg-transparent border border-zinc-800 rounded-xl onfocus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-indigo-600 text-indigo-200 rounded-xl px-4 py-2"
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
              <h2 className="text-xl font-semibold">Paste Content</h2>
              <div className="bg-black/40 border-2 border-indigo-800/50 text-indigo-200 rounded-xl p-4 flex items-center justify-center">
                <Loader className="animate-spin text-indigo-200 w-6 h-6" />
              </div>
            </div>
          )}
          {error && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Paste Content</h2>
              <div className="bg-black/40 border-2 border-indigo-800/50 text-indigo-200 rounded-xl p-4">
                <p className="text-sm text-indigo-200">{error}</p>
              </div>
            </div>
          )}
          {paste && !isLoading && !isPasswordProtected && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Paste Content</h2>
              <p className="text-sm text-indigo-200">
                This paste was created at {paste.createdAt}.
              </p>
              <div className="bg-black/40 border-2 border-indigo-800/50 text-indigo-200 rounded-xl p-4">
                <pre className="whitespace-pre-wrap break-words text-sm">
                  {prettifyJson(paste.content)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
