import { notFound } from "next/navigation";
import PasteViewer from "./PasteViewer";
import PasswordForm from "./PasswordForm";
import Link from "next/link";
import { getCachedPaste } from "@/lib/data";
import { verifyPassword } from "@/lib/password";
import { decrypt } from "@/lib/encryption";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { pastes } from "@/lib/db/schema";
import { after } from "next/server";
import { revalidateTag } from "next/cache";

interface PasteViewProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ p?: string }>;
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="space-y-3 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <Link
          href="/"
          className="text-xs text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300"
        >
          ← back to home
        </Link>
      </div>
    </div>
  );
}

export default async function PasteView({ params, searchParams }: PasteViewProps) {
  const { id } = await params;
  const { p: password } = await searchParams;

  return <ServerFetch id={id} password={password} />;
}

async function ServerFetch({ id, password }: { id: string; password?: string }) {
  const paste = await getCachedPaste(id);

  if (!paste) {
    notFound();
  }

  if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
    // Delete expired paste and remove from cache lazily after response
    after(async () => {
      await db.delete(pastes).where(eq(pastes.id, id));
      revalidateTag(`paste-${id}`, "max");
      revalidateTag(`raw-paste-${id}`, "max");
    });
    return <ErrorState error="Paste has expired" />;
  }

  if (paste.hasPassword && !paste.passwordHash) {
    return <PasswordForm id={id} />;
  }

  if (paste.hasPassword && paste.passwordHash) {
    if (!password) {
      return <PasswordForm id={id} />;
    }

    const isValid = await verifyPassword(password, paste.passwordHash);
    if (!isValid) {
      return <ErrorState error="Invalid password" />;
    }
  }

  try {
    const decryptedContent = decrypt(paste.content);
    return (
      <PasteViewer
        paste={{
          id: paste.id,
          content: decryptedContent,
          createdAt: paste.createdAt.toISOString(),
          expiresAt: paste.expiresAt?.toISOString(),
        }}
      />
    );
  } catch (error) {
    console.error("Decryption failed:", error);
    return <ErrorState error="Failed to decrypt paste content" />;
  }
}
