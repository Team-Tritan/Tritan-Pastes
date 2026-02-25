import { db } from "@/lib/db";
import { pastes } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { encrypt } from "@/lib/encryption";
import { generateId, parseExpiration } from "@/lib/utils";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");
  const expiresIn = searchParams.get("expires");

  const content = await request.text();

  if (!content || content.trim().length === 0) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const id = generateId();
  const encryptedContent = encrypt(content);
  let passwordHash: string | null = null;
  let hasPassword = false;

  if (password && password.length > 0) {
    passwordHash = await hashPassword(password);
    hasPassword = true;
  }

  const expiresAt = parseExpiration(expiresIn);

  try {
    await db.insert(pastes).values({
      id,
      content: encryptedContent,
      passwordHash,
      hasPassword,
      expiresAt,
    });

    return Response.json({ error: false, data: { id } });
  } catch (error) {
    console.error("Error creating paste:", error);
    return Response.json({ error: "internal server error" }, { status: 500 });
  }
}
