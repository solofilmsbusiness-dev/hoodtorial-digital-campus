import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
  id: string;
  code: string;
  percent_off: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function fetchCoupons() {
    const { data, error: err } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setCoupons(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchCoupons(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const { error: err } = await supabase.from("coupons").insert({
      code: code.toUpperCase().trim(),
      percent_off: parseInt(percentOff, 10),
      expires_at: expiresAt || null,
    });

    if (err) {
      setCreateError(err.message);
    } else {
      setCode("");
      setPercentOff("");
      setExpiresAt("");
      await fetchCoupons();
    }
    setCreating(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("coupons").update({ active: !current }).eq("id", id);
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !current } : c))
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Coupon Manager</h2>

      {/* Create form */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Create Coupon</h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SAVE20"
              className="bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-white text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">% Off</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              placeholder="20"
              className="bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-white text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Expires At</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
        {createError && <p className="text-red-400 text-xs mt-2">{createError}</p>}
      </div>

      {/* Coupons table */}
      {loading && <p className="text-gray-400 text-sm">Loading coupons...</p>}
      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">% Off</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No coupons yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono font-semibold text-white">{c.code}</td>
                    <td className="px-4 py-3">{c.percent_off}%</td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.active
                            ? "bg-green-900/50 text-green-400"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(c.id, c.active)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {c.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
