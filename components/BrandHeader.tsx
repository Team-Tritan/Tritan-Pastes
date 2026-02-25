import Link from "next/link";

export default function BrandHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
      <Link href="/" className="flex items-center gap-1.5 transition-colors hover:opacity-80">
        <span className="text-sm tracking-tight text-zinc-200">tritan</span>
        <span className="text-xs text-zinc-500">pastes</span>
      </Link>
    </header>
  );
}
