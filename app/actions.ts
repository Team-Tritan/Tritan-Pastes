"use server";

import { db } from "@/lib/db";
import { pastes } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { encrypt } from "@/lib/encryption";
import { generateId, parseExpiration } from "@/lib/utils";

export async function createPasteAction(data: {
  content: string;
  password?: string | null;
  expiresIn?: string | null;
  expireAfterViewing?: boolean;
}) {
  const { content, password, expiresIn } = data;

  if (!content || typeof content !== "string") {
    return { error: "Content is required" };
  }

  const id = generateId();
  const encryptedContent = encrypt(content);
  let passwordHash: string | null = null;
  let hasPassword = false;

  if (password && typeof password === "string" && password.length > 0) {
    passwordHash = await hashPassword(password);
    hasPassword = true;
  }

  const expiresAt = parseExpiration(expiresIn ?? null);

  try {
    await db.insert(pastes).values({
      id,
      content: encryptedContent,
      passwordHash,
      hasPassword,
      expiresAt,
    });

    return { data: { id } };
  } catch (error) {
    console.error("Error creating paste:", error);
    return { error: "Internal server error" };
  }
}
