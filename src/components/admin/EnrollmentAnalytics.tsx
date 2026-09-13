import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CourseEnrollment {
  course_id: string;
  count: number;
}

export function EnrollmentAnalytics() {
  const [data, setData] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnrollments() {
      const { data: rows, error: err } = await supabase
        .from("enrollments")
        .select("course_code");

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      for (const row of rows ?? []) {
        counts[row.course_code] = (counts[row.course_code] ?? 0) + 1;
      }

      const sorted = Object.entries(counts)
        .map(([course_id, count]) => ({ course_id, count }))
        .sort((a, b) => b.count - a.count);

      setData(sorted);
      setLoading(false);
    }

    fetchEnrollments();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Enrollment Analytics</h2>

      {loading && (
        <p className="text-gray-400 text-sm">Loading enrollments...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm">Error: {error}</p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Course ID</th>
                <th className="px-6 py-3">Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    No enrollment data yet.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.course_id}
                    className="border-t border-gray-700 hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-3 font-mono">{row.course_id}</td>
                    <td className="px-6 py-3 font-semibold text-white">{row.count}</td>
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
