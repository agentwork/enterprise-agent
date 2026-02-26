import Link from "next/link";
import { logout } from "@/features/auth/server/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Console</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link
            href="/admin"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/settings"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
          >
            Settings
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-700">
             <form action={logout}>
                <button type="submit" className="w-full text-left py-2.5 px-4 rounded hover:bg-red-800 text-red-400">
                    Sign Out
                </button>
             </form>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
