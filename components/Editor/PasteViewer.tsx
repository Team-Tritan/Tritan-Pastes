"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Refractor, registerLanguage } from "react-refractor";
import bash from "refractor/bash";
import c from "refractor/c";
import cpp from "refractor/cpp";
import csharp from "refractor/csharp";
import css from "refractor/css";
import go from "refractor/go";
import java from "refractor/java";
import javascript from "refractor/javascript";
import json from "refractor/json";
import jsx from "refractor/jsx";
import kotlin from "refractor/kotlin";
import markdown from "refractor/markdown";
import markup from "refractor/markup";
import php from "refractor/php";
import python from "refractor/python";
import ruby from "refractor/ruby";
import rust from "refractor/rust";
import sql from "refractor/sql";
import swift from "refractor/swift";
import toml from "refractor/toml";
import tsx from "refractor/tsx";
import typescript from "refractor/typescript";
import yaml from "refractor/yaml";
import { Paste } from "@/lib/types/paste";
import Header from "@/components/Header";
import Footer from "../Footer";

registerLanguage(bash);
registerLanguage(c);
registerLanguage(cpp);
registerLanguage(csharp);
registerLanguage(css);
registerLanguage(go);
registerLanguage(java);
registerLanguage(javascript);
registerLanguage(json);
registerLanguage(jsx);
registerLanguage(kotlin);
registerLanguage(markdown);
registerLanguage(markup);
registerLanguage(php);
registerLanguage(python);
registerLanguage(ruby);
registerLanguage(rust);
registerLanguage(sql);
registerLanguage(swift);
registerLanguage(toml);
registerLanguage(tsx);
registerLanguage(typescript);
registerLanguage(yaml);

interface PasteViewerProps {
  paste: Paste;
}

export default function PasteViewer({ paste }: PasteViewerProps) {
  const [copied, setCopied] = useState(false);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const displayContent = useMemo(() => {
    if (paste.language === "json") {
      try {
        return JSON.stringify(JSON.parse(paste.content), null, 2);
      } catch {
        return paste.content;
      }
    }
    return paste.content;
  }, [paste.language, paste.content]);

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
          {paste.language ? (
            <Refractor
              language={paste.language}
              value={displayContent}
              className="!bg-transparent whitespace-pre-wrap break-words text-[13px] leading-6 !p-0 !m-0"
            />
          ) : (
            <pre className="whitespace-pre-wrap break-words text-[13px] leading-6 text-zinc-300">
              {displayContent}
            </pre>
          )}
        </div>
      </div>

      <Footer
        createdAt={paste.createdAt}
        expiresAt={paste.expiresAt}
        contentType={paste.language ?? "plain text"}
      />
    </>
  );
}
