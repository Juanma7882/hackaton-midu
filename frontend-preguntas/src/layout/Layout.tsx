import { Outlet, useNavigate } from "react-router-dom";

const FONT_FAMILY =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div
      className="w-full min-h-screen flex flex-col bg-[var(--bg-page)]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <header className="w-full shrink-0 flex justify-center items-center my-2 py-3 border-b border-[var(--border-default)]">
        <button onClick={() => navigate("/")} type="button" className="cursor-pointer text-xl md:text-5xl font-bold tracking-tight drop-shadow-[0_0_15px_rgba(33,255,0,0.4)] font-mono">
          <span className="text-[var(--text-primary)]">Interview</span>
          <span className="text-[var(--color-primary)]">_Quiz</span>
        </button>
      </header>
      <main className="flex-1 flex justify-center items-start">
        <Outlet />
      </main>
    </div>
  );
}