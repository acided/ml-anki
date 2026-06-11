import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { QUESTIONS } from "./data/questions.js";
import WikiPage from "./components/WikiPage.jsx";
import CardsPage from "./components/CardsPage.jsx";

const STORAGE_KEY = "ml-prep:statuses:v1";

export default function App() {
  // Общий прогресс для обеих страниц: { [id]: { status, seen, again, last } }
  const [statuses, setStatuses, resetStatuses] = useLocalStorage(STORAGE_KEY, {});

  const known = QUESTIONS.filter((q) => statuses[q.id]?.status === "known").length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="full">ML&nbsp;Prep</span>
          <span className="tag">exam</span>
        </div>
        <nav className="nav">
          <NavLink to="/wiki">wiki</NavLink>
          <NavLink to="/cards">cards</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/wiki" replace />} />
        <Route
          path="/wiki"
          element={<WikiPage statuses={statuses} setStatuses={setStatuses} known={known} />}
        />
        <Route
          path="/cards"
          element={
            <CardsPage
              statuses={statuses}
              setStatuses={setStatuses}
              known={known}
              resetStatuses={resetStatuses}
            />
          }
        />
        <Route path="*" element={<Navigate to="/wiki" replace />} />
      </Routes>

      <footer className="footer">
        {known}/{QUESTIONS.length} выучено · прогресс сохраняется локально в браузере
        <div className="team-label">© буль буль продакшн · © acided</div>
      </footer>
    </div>
  );
}
