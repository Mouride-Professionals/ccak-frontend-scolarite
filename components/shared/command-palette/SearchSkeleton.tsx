"use client";

export default function SearchSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="h-8 w-8 shrink-0 rounded-md bg-zinc-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/5 rounded bg-zinc-200" />
            <div className="h-3 w-1/4 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
