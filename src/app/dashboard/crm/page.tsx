import Link from "next/link";
import { getClients, getDeals } from "@/features/crm/server/actions";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function CRMPage() {
  const [clientsResult, dealsResult] = await Promise.all([
    getClients(),
    getDeals()
  ]);

  const clients = (clientsResult.success && clientsResult.data) ? clientsResult.data : [];
  const deals = (dealsResult.success && dealsResult.data) ? dealsResult.data : [];

  const totalDealsValue = deals.reduce((acc, deal) => {
    return acc + Number(deal.amount || 0);
  }, 0);

  const activeDeals = deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage || ""));

  const now = new Date();
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your clients, deals, and sales performance.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/crm/clients/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> New Client
          </Link>
          <Link
            href="/dashboard/crm/deals/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> New Deal
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Clients</span>
          </div>
          <div className="text-2xl font-bold">{clients.length}</div>
          <Link href="/dashboard/crm/clients" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            View all clients
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active Deals</span>
          </div>
          <div className="text-2xl font-bold">{activeDeals.length}</div>
          <Link href="/dashboard/crm/deals" className="text-sm text-green-600 hover:underline mt-2 inline-block">
            View deal pipeline
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Pipeline Value</span>
          </div>
          <div className="text-2xl font-bold">
            ${totalDealsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400 mt-2">Total value of all deals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Clients</h2>
            <Link href="/dashboard/crm/clients" className="text-sm text-gray-500 hover:text-primary flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {clients.slice(0, 5).map((client) => (
              <Link 
                key={client.id} 
                href={`/dashboard/crm/clients/${client.id}`}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 mr-4">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                  <p className="text-xs text-gray-500 truncate">{client.industry || "No industry"}</p>
                </div>
                <div className="text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(client.createdAt || now), { addSuffix: true })}
                </div>
              </Link>
            ))}
            {clients.length === 0 && (
              <div className="p-8 text-center text-gray-400 italic">
                No clients found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Deals</h2>
            <Link href="/dashboard/crm/deals" className="text-sm text-gray-500 hover:text-primary flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {deals.slice(0, 5).map((deal) => (
              <Link 
                key={deal.id} 
                href={`/dashboard/crm/deals/${deal.id}`}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                      {deal.stage?.replace("_", " ")}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                      ${Number(deal.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {deal.expectedCloseDate && (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Ends {new Date(deal.expectedCloseDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {deals.length === 0 && (
              <div className="p-8 text-center text-gray-400 italic">
                No active deals found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
