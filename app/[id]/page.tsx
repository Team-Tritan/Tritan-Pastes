import { Suspense } from "react";
import ViewPage from "@/components/Editor/ViewPage";

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="h-5 w-5 animate-spin rounded-full border border-zinc-700 border-t-zinc-400" />
    </div>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 font-mono text-zinc-400">
      <Suspense fallback={<Loading />}>
        <ViewPage params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
