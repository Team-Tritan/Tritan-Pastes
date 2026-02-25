import { db } from "@/lib/db";
import { pastes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getCachedPaste(id: string) {
  "use cache";
  cacheTag(`paste-${id}`);
  cacheLife({
    stale: 3600,
    revalidate: 7200,
    expire: 86400 * 30,
  });

  const paste = await db.query.pastes.findFirst({
    where: eq(pastes.id, id),
  });

  return paste;
}
