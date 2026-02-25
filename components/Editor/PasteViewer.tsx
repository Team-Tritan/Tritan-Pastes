"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Refractor, registerLanguage } from "react-refractor";
import json from "refractor/json";
import { Paste } from "@/lib/types/paste";
import Header from "@/components/Header";
import Footer from "../Footer";

registerLanguage(json);

interface PasteViewerProps {
  paste: Paste;
}

export default function PasteViewer({ paste }: PasteViewerProps) {
  const [copied, setCopied] = useState(false);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isJson = useCallback((str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }, []);

  const prettifyJson = useCallback(
    (jsonStr: string) => JSON.stringify(JSON.parse(jsonStr), null, 2),
    [],
  );

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(paste.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [paste.content]);

  const downloadPaste = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([paste.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${paste.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, [paste.content, paste.id]);

  useHotkey("Mod+C", (event) => {
    event.preventDefault();
    copyToClipboard();
  });

  useHotkey("Mod+S", (event) => {
    event.preventDefault();
    downloadPaste();
  });

  const handleContentScroll = useCallback(() => {
    if (lineNumbersRef.current && contentRef.current) {
      lineNumbersRef.current.scrollTop = contentRef.current.scrollTop;
    }
  }, []);

  const lineCount = useMemo(() => paste.content.split("\n").length, [paste.content]);
  const charCount = useMemo(() => paste.content.length, [paste.content]);
  const wordCount = useMemo(
    () => (paste.content.trim() ? paste.content.trim().split(/\s+/).length : 0),
    [paste.content],
  );
  const contentIsJson = useMemo(() => isJson(paste.content), [paste.content, isJson]);

  return (
    <>
      <Header
        variant="viewer"
        lineCount={lineCount}
        wordCount={wordCount}
        charCount={charCount}
        copied={copied}
        onCopyClick={copyToClipboard}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="hidden min-w-[3.5rem] select-none overflow-hidden border-r border-zinc-800 px-4 pb-6 pt-4 text-right text-[12px] leading-6 text-zinc-600 sm:block"
          aria-hidden
        >
          {Array.from({ length: Math.max(lineCount, 40) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div
          ref={contentRef}
          onScroll={handleContentScroll}
          className="flex-1 overflow-auto p-4 pb-6"
        >
          {contentIsJson ? (
            <Refractor
              language="json"
              value={prettifyJson(paste.content)}
              className="!bg-transparent whitespace-pre-wrap break-words text-[13px] leading-6 !p-0 !m-0"
            />
          ) : (
            <pre className="whitespace-pre-wrap break-words text-[13px] leading-6 text-zinc-300">
              {paste.content}
            </pre>
          )}
        </div>
      </div>

      <Footer
        createdAt={paste.createdAt}
        expiresAt={paste.expiresAt}
        contentType={contentIsJson ? "json" : "plain text"}
      />
    </>
  );
}
