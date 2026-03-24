import { Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen flex flex-col bg-[var(--bg-page)]">
      <header className="w-full py-4 shrink-0 flex justify-center items-center">
        <button onClick={() => navigate("/")} type="button" className="cursor-pointer text-2xl font-bold text-center text-[var(--text-primary)]">InterviewQuiz</button>
      </header>
      <main className="flex-1 flex justify-center items-center">
        <Outlet />
      </main>
    </div>
  );
}