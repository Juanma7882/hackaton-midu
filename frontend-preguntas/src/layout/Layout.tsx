import { Outlet, useNavigate } from "react-router-dom";

const FONT_FAMILY =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div
      className="w-full min-h-screen flex flex-col bg-[var(--bg-page)] cursor-crosshair"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <header className="w-full shrink-0 flex justify-center items-center my-2 py-3 border-b border-[var(--border-default)]">
        <button
          onClick={() => navigate("/")}
          type="button"
          className="cursor-pointer"
        >
        <span className="text-[var(--text-primary)] text-4xl font-bold">{"> Interview"}</span>
        <span className="text-[var(--color-primary)] text-4xl font-bold">_Quiz</span>
        </button>
      </header>
      <main className="flex-1 flex justify-center items-start">
        <Outlet />
      </main>
    </div>
  );
}