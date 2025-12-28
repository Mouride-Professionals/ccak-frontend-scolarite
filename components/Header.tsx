import { GlobalSearch } from '@/components/search/GlobalSearch';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* <Logo /> */}
          <nav>{/* Navigation */}</nav>
        </div>
        
        {/* Recherche globale */}
        <div className="flex-1 max-w-xl mx-8">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-4">
          {/* User menu, notifications, etc. */}
        </div>
      </div>
    </header>
  );
}