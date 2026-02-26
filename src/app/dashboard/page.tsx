import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/features/auth/server/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded shadow-md">
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-lg font-medium">Welcome, {user.email}!</p>
          <p className="text-sm text-gray-500">User ID: {user.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/agent" className="p-4 border rounded-md hover:bg-gray-50 flex flex-col items-center justify-center text-center group">
            <h2 className="text-xl font-bold text-blue-600 mb-2 group-hover:text-blue-800">Agent Chat</h2>
            <p className="text-sm text-gray-600">Interact with the Enterprise AI Agent</p>
          </Link>
          <div className="p-4 border rounded-md bg-gray-50 opacity-50 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-gray-400 mb-2">CRM (Coming Soon)</h2>
            <p className="text-sm text-gray-400">Manage clients and deals</p>
          </div>
        </div>

        <form action={logout} className="flex justify-center">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
