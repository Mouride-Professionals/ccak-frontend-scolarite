import Link from "next/link";

export default function DeliberationNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#DAE4EB] px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#00365F]/10">
            <svg
              className="h-12 w-12 text-[#00365F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="mb-3 text-2xl font-semibold text-[#00365F]">
          Session de délibération introuvable
        </h2>
        <p className="mb-8 text-zinc-600">
          La session que vous recherchez n&apos;existe pas ou a été supprimée.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
