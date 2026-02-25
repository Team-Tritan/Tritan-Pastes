import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { decrypt } from "@/lib/encryption";
import { db } from "@/lib/db";
import { pastes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { after } from "next/server";

async function getRawContent(id: string, passwordAttempt?: string | null) {
  "use cache";
  cacheTag(`raw-paste-${id}`);
  cacheLife({
    stale: 3600,
    revalidate: 7200,
    expire: 86400 * 30, // 30 days
  });

  const paste = await db.query.pastes.findFirst({
    where: eq(pastes.id, id),
  });

  if (!paste) {
    return { status: 404, message: "Not Found" };
  }

  if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
    return { status: 404, message: "Paste Expired" };
  }

  if (paste.hasPassword && paste.passwordHash) {
    if (!passwordAttempt) {
      return { status: 401, message: "Password Required" };
    }

    const isValid = await verifyPassword(passwordAttempt, paste.passwordHash);
    if (!isValid) {
      return { status: 401, message: "Unauthorized" };
    }
  }

  try {
    const decryptedContent = decrypt(paste.content);
    return { status: 200, content: decryptedContent };
  } catch (error) {
    console.error("Decryption failed:", error);
    return { status: 500, message: "Internal Server Error" };
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const passwordHeader = request.headers.get("x-password");
  const passwordQuery = request.nextUrl.searchParams.get("p");
  const password = passwordHeader || passwordQuery;

  const result = await getRawContent(id, password);

  if (result.status === 404 && result.message === "Paste Expired") {
    // Lazily clean up expired pastes without blocking the request
    after(async () => {
      try {
        await db.delete(pastes).where(eq(pastes.id, id));
        revalidateTag(`raw-paste-${id}`, "max");
        revalidateTag(`paste-${id}`, "max");
      } catch (err) {
        console.error("Failed to cleanup expired paste:", err);
      }
    });
  }

  if (result.status !== 200) {
    return new NextResponse(result.message, { status: result.status });
  }

  return new NextResponse(result.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
