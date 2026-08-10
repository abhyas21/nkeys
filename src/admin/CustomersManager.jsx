import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Mail, Phone, Calendar } from "lucide-react";

export default function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCustomers(data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Customers Directory</h2>
        <p className="text-xs text-stone-500 mt-1">Directory of registered store accounts</p>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-xs font-bold uppercase text-stone-500">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {customers.map((cust) => (
              <tr key={cust.id}>
                <td className="py-3 font-bold">{cust.name}</td>
                <td className="py-3 text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} />
                    <span>{cust.email}</span>
                  </span>
                </td>
                <td className="py-3 text-stone-600 dark:text-stone-400">
                  {cust.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} />
                      <span>{cust.phone}</span>
                    </span>
                  ) : "-"}
                </td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    cust.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-stone-50 text-stone-700"
                  }`}>
                    {cust.role}
                  </span>
                </td>
                <td className="py-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(cust.created_at).toLocaleDateString()}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
