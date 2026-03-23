import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="bg-black w-full min-h-screen flex flex-col">
      <header className="w-full py-4 shrink-0">
        <h1 className="text-white text-2xl font-bold text-center">InterviewQuiz</h1>
      </header>
      <main className="flex-1 flex justify-center items-center">
        <Outlet />
      </main>
    </div>
  );
}