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
      <header className="w-full shrink-0 flex justify-center items-center my-4">
        <button onClick={() => navigate("/")} type="button" className="cursor-pointer text-2xl font-bold text-center text-[var(--text-primary)]">InterviewQuiz</button>
      </header>
      <main className="flex-1 flex justify-center items-start">
        <Outlet />
      </main>
    </div>
  );
}