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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Agent */}
          <Link 
            href="/dashboard/agent" 
            className="flex flex-col p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-200 group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:bg-blue-200 transition-colors">
              🤖
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">AI Agent</h2>
            <p className="text-sm text-gray-500">Chat with your intelligent assistant to manage tasks and query knowledge.</p>
          </Link>

          {/* CRM */}
          <Link 
            href="/dashboard/crm" 
            className="flex flex-col p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-green-200 group"
          >
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:bg-green-200 transition-colors">
              💼
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">CRM</h2>
            <p className="text-sm text-gray-500">Manage Clients, Deals, and track sales activities.</p>
          </Link>

          {/* Knowledge Base */}
          <Link 
            href="/dashboard/knowledge" 
            className="flex flex-col p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-purple-200 group"
          >
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:bg-purple-200 transition-colors">
              📚
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Knowledge Base</h2>
            <p className="text-sm text-gray-500">Manage documents, upload files, and configure RAG sources.</p>
          </Link>

          {/* Analytics */}
          <Link 
            href="/dashboard/analytics" 
            className="flex flex-col p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-orange-200 group"
          >
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:bg-orange-200 transition-colors">
              📊
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Analytics</h2>
            <p className="text-sm text-gray-500">View insights on sales performance, deal stages, and trends.</p>
          </Link>

          {/* Settings (Admin) */}
          <Link 
            href="/admin/settings" 
            className="flex flex-col p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-gray-300 group"
          >
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:bg-gray-200 transition-colors">
              ⚙️
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">Settings</h2>
            <p className="text-sm text-gray-500">Configure system preferences, API keys, and models.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
