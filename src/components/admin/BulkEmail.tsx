import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const COURSE_OPTIONS = [
  { id: "intro-to-hood-economics", label: "Intro to Hood Economics" },
  { id: "street-entrepreneurship-101", label: "Street Entrepreneurship 101" },
  { id: "community-leadership", label: "Community Leadership" },
  { id: "financial-literacy", label: "Financial Literacy" },
  { id: "digital-skills-bootcamp", label: "Digital Skills Bootcamp" },
];

export function BulkEmail() {
  const [courseId, setCourseId] = useState(COURSE_OPTIONS[0].id);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const { error } = await supabase.functions.invoke("send-waitlist-email", {
        body: { type: "bulk", courseId, subject, message },
      });

      if (error) throw error;
      setStatus("success");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send email");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold text-white">Bulk Email</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COURSE_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Message</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg px-4 py-2 transition-colors"
        >
          {status === "sending" ? "Sending..." : "Send Email"}
        </button>

        {status === "success" && (
          <p className="text-green-400 text-sm">Email sent successfully.</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">Error: {errorMsg}</p>
        )}
      </form>
    </div>
  );
}
