import { Suspense } from "react";
import EnrollmentCoursesPageClient from "./EnrollmentCoursesPageClient";

export default function EnrollmentCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
            <p className="mt-3 text-sm text-zinc-500">Chargement des cours...</p>
          </div>
        </div>
      }
    >
      <EnrollmentCoursesPageClient />
    </Suspense>
  );
}
