"use client";

import * as Popover from "@radix-ui/react-popover";
import { Settings, ChevronDown, FileText, UploadCloud } from "lucide-react";
import Link from "next/link";
import OptionsDropdown from "./OptionsDropdown";

interface HeaderProps {
  lineCount: number;
  wordCount: number;
  charCount: number;
  fileName: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  password: string;
  expirationTime: string;
  expireAfterViewing: boolean;
  onPasswordChange: (value: string) => void;
  onExpirationChange: (value: string) => void;
  onToggleExpireAfterViewing: () => void;
  onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export default function Header({
  lineCount,
  wordCount,
  charCount,
  fileName,
  open,
  setOpen,
  password,
  expirationTime,
  expireAfterViewing,
  onPasswordChange,
  onExpirationChange,
  onToggleExpireAfterViewing,
  onFileImport,
  onSubmit,
}: HeaderProps) {
  const hasActiveOptions = password || expirationTime || expireAfterViewing;

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
      <Link href="/" className="flex items-center gap-1.5 transition-colors hover:opacity-80">
        <span className="text-sm tracking-tight text-zinc-200">tritan</span>
        <span className="text-xs text-zinc-500">pastes</span>
      </Link>

      <div className="flex items-center gap-2">
        <div className="mr-2 hidden items-center gap-3 text-[11px] text-zinc-500 md:flex">
          <span>{lineCount} ln</span>
          <span>{wordCount} w</span>
          <span>{charCount} ch</span>
        </div>

        <div className="relative">
          <input
            type="file"
            accept=".txt,.js,.ts,.jsx,.tsx,.py,.go,.rs,.json,.html,.css,.md,.yaml,.yml,.sh,.bash,.sql,.xml,.csv,.log,.c,.cpp,.h,.java"
            onChange={onFileImport}
            className="hidden"
            id="file-import"
          />
          <label
            htmlFor="file-import"
            className="flex cursor-pointer items-center gap-1.5 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
          >
            <FileText className="h-3.5 w-3.5" />
            {fileName ? <span className="max-w-[80px] truncate">{fileName}</span> : "import"}
          </label>
        </div>

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors ${
                open || hasActiveOptions
                  ? "border-zinc-600 bg-zinc-800/50 text-zinc-200"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              options
              {hasActiveOptions && <span className="ml-0.5 h-1.5 w-1.5 rounded-sm bg-zinc-300" />}
              <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <OptionsDropdown
              password={password}
              expirationTime={expirationTime}
              expireAfterViewing={expireAfterViewing}
              onPasswordChange={onPasswordChange}
              onExpirationChange={onExpirationChange}
              onToggleExpireAfterViewing={onToggleExpireAfterViewing}
            />
          </Popover.Portal>
        </Popover.Root>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center gap-1.5 bg-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-300"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          create
        </button>
      </div>
    </header>
  );
}
