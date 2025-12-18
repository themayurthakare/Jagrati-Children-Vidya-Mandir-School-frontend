import React, { createContext, useState, useEffect } from "react";

// Context + provider used only inside admin dashboard subtree
export const SessionContext = createContext({
  sessions: [],
  selectedSession: null,
  setSelectedSession: () => {},
  reloadSessions: () => {},
});

export const SessionProvider = ({
  apiBase = "http://localhost:8080",
  children,
}) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${apiBase}/api/sessions/getAll`);
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      // normalize to { id, name } items
      const normalized = (Array.isArray(data) ? data : []).map((s) => ({
        id: s.sessionId ?? s.id ?? s.value ?? s.session_id ?? s.sessionId,
        name: s.name ?? s.sessionName ?? s.label ?? String(s),
        raw: s,
      }));
      setSessions(normalized);
      // if no selection yet, pick the first
      if (normalized.length > 0 && selectedSession == null) {
        setSelectedSession(normalized[0]);
      }
    } catch (err) {
      console.error("Session fetch error:", err);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadSessions = () => fetchSessions();

  return (
    <SessionContext.Provider
      value={{ sessions, selectedSession, setSelectedSession, reloadSessions }}
    >
      {children}
    </SessionContext.Provider>
  );
};
