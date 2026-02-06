import { Search } from "lucide-react";

export default function SearchUsersInput({ searchInput, setSearchInput }) {
  return (
    <div className="relative w-full max-w-sm p-4">
      <Search
        size={18}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none
             placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
             transition-shadow duration-200 hover:shadow-sm"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </div>
  );
}
