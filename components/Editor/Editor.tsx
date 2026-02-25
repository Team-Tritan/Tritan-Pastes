"use client";

import { useState, useRef, useCallback, useMemo, useTransition } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { createPasteAction } from "@/app/actions";
import Header from "@/components/Header";
import LineNumbers from "./LineNumbers";
import Toast from "./Toast";

const EXT_TO_LANGUAGE: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  json: "json",
  py: "python",
  rb: "ruby",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  css: "css",
  html: "markup",
  htm: "markup",
  xml: "markup",
  svg: "markup",
  md: "markdown",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  rs: "rust",
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  cs: "csharp",
  php: "php",
  swift: "swift",
  kt: "kotlin",
};

function extToLanguage(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? (EXT_TO_LANGUAGE[ext] ?? null) : null;
}

const PLACEHOLDER = "paste something here...";

export default function Editor() {
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [expirationTime, setExpirationTime] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [expireAfterViewing, setExpireAfterViewing] = useState<boolean>(false);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounterRef = useRef<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(() => (code ? code.split("\n").length : 0), [code]);
  const wordCount = useMemo(() => (code.trim() ? code.trim().split(/\s+/).length : 0), [code]);
  const charCount = useMemo(() => code.length, [code]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useHotkey("Mod+O", (event) => {
    event.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  });

  useHotkey("Mod+S", (event) => {
    event.preventDefault();
    if (!isPending) handleSubmit();
  });

  useHotkey("Mod+C", (event) => {
    if (generatedLink) {
      event.preventDefault();
      copyToClipboard();
    }
  });

  const handleSubmit = useCallback(async () => {
    setError("");
    setGeneratedLink("");

    startTransition(async () => {
      try {
        const res = await createPasteAction({
          content: code,
          password: password || null,
          expiresIn: expirationTime ? new Date(expirationTime).toISOString() : null,
          expireAfterViewing,
          language: fileName ? extToLanguage(fileName) : null,
        });

        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setGeneratedLink(`${window.location.origin}/${res.data.id}`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create paste");
      }
    });
  }, [code, password, expirationTime, expireAfterViewing, fileName]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedLink]);

  const clearAllFields = useCallback(() => {
    setCode("");
    setPassword("");
    setExpirationTime("");
    setGeneratedLink("");
    setError("");
    setCopied(false);
    setExpireAfterViewing(false);
    setFileName("");
  }, []);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result as string);
      setFileName(file.name);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
    e.target.value = "";
  }, [readFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (e.dataTransfer.items.length > 0) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }, [readFile]);

  const handleTextareaScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const toggleExpireAfterViewing = useCallback(() => {
    setExpireAfterViewing((prev) => !prev);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
  }, []);

  const handleExpirationChange = useCallback((value: string) => {
    setExpirationTime(value);
  }, []);

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-zinc-950 font-mono text-zinc-400"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center border-2 border-dashed border-zinc-600 bg-zinc-950/90">
          <p className="text-sm text-zinc-400">drop file to import</p>
        </div>
      )}
      <Header
        variant="editor"
        lineCount={lineCount}
        wordCount={wordCount}
        charCount={charCount}
        fileName={fileName}
        open={optionsOpen}
        setOpen={setOptionsOpen}
        password={password}
        expirationTime={expirationTime}
        expireAfterViewing={expireAfterViewing}
        onPasswordChange={handlePasswordChange}
        onExpirationChange={handleExpirationChange}
        onToggleExpireAfterViewing={toggleExpireAfterViewing}
        onFileImport={handleFileImport}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />

      <div className="flex flex-1 overflow-hidden">
        <LineNumbers lineCount={lineCount} ref={lineNumbersRef} />

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleTextareaScroll}
          className="h-full flex-1 resize-none bg-transparent p-4 text-[13px] leading-6 text-zinc-300 placeholder-zinc-600 caret-zinc-100 selection:bg-zinc-800 focus:outline-none"
          placeholder={PLACEHOLDER}
          spellCheck={false}
          autoFocus
        />
      </div>

      <footer className="flex items-center justify-between border-t border-zinc-800 px-5 py-2 text-[10px] text-zinc-500">
        <div className="flex items-center gap-4">
          {expireAfterViewing && <span className="text-zinc-400">burn after reading</span>}
          {password && <span className="text-zinc-400">password protected</span>}
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://f0rk.systems/reso/tools_quickpost_bin"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-zinc-300"
          >
            cli tool
          </a>
          <div className="flex items-center gap-4 md:hidden">
            <span>
              {lineCount} ln · {charCount} ch
            </span>
          </div>
          <div className="hidden md:block">plain text · utf-8</div>
        </div>
      </footer>

      <Toast
        generatedLink={generatedLink}
        error={error}
        copied={copied}
        onCopy={copyToClipboard}
        onClear={clearAllFields}
      />

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileImport}
        className="hidden"
        accept="text/*"
      />
    </div>
  );
}
