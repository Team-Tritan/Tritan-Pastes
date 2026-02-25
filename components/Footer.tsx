import { Clock } from "lucide-react";

interface FooterProps {
  createdAt?: string;
  expiresAt?: string;
  contentType?: string;
}

export default function Footer({ createdAt, expiresAt, contentType }: FooterProps) {
  return (
    <footer className="flex items-center justify-between border-t border-zinc-800 px-5 py-2 text-[10px] text-zinc-500">
      <div className="flex items-center gap-4">
        {createdAt && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {new Date(createdAt).toLocaleString()}
          </span>
        )}
        {expiresAt && (
          <span className="text-zinc-400">
            expires {new Date(expiresAt).toLocaleString()}
          </span>
        )}
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
        {contentType && <span className="hidden md:block">{contentType} · utf-8</span>}
      </div>
    </footer>
  );
}
