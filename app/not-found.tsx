import { AlertCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 font-mono text-zinc-400">
      <Header variant="simple" />

      <div className="flex flex-1 items-center justify-center">
        <div className="mx-4 max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-zinc-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-zinc-200">paste not found</h1>
            <p className="text-sm text-zinc-500">
              the paste you're looking for doesn't exist, has expired, or has been deleted.
            </p>
          </div>

          <Link
            href="/"
            className="inline-block bg-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300"
          >
            new paste?
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
