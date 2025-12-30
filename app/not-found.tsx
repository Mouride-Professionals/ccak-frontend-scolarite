import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#DAE4EB] px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src="/logo.svg" alt="CCAK Logo" className="h-24 w-24" />
        </div>

        {/* 404 */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-[#00365F]">404</h1>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#008D36]"></div>
        </div>

        {/* Message */}
        <h2 className="mb-3 text-2xl font-semibold text-[#00365F]">Page introuvable</h2>
        <p className="mb-8 text-zinc-600">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#008D36] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Additional info */}
        <p className="mt-8 text-sm text-zinc-500">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter
          l&apos;administrateur.
        </p>
      </div>
    </div>
  );
}
