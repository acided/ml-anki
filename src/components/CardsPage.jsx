import { useState, useEffect, useCallback } from "react";
import { QUESTIONS } from "../data/questions.js";
import { buildQueue, applyAnswer, nextStatus } from "../lib/srs.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

const SESSION_KEY = "ml-prep:session:v1";

export default function CardsPage({ statuses, setStatuses, known, resetStatuses }) {
  const [session, setSession] = useLocalStorage(SESSION_KEY, null);
  const [flipped, setFlipped] = useState(false);

  const startSession = useCallback(
    (mode) => {
      const queue = buildQueue(QUESTIONS, statuses, mode);
      setSession({ queue, mode, total: queue.length, counts: { again: 0, good: 0, easy: 0 } });
      setFlipped(false);
    },
    [statuses, setSession]
  );

  // Первичная инициализация сессии.
  useEffect(() => {
    if (session === null) startSession("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentId = session?.queue?.[0];
  const card = currentId != null ? QUESTIONS.find((q) => q.id === currentId) : null;
  const done = session && session.queue.length === 0;

  const grade = useCallback(
    (g) => {
      if (!card) return;
      setStatuses((prev) => ({ ...prev, [card.id]: nextStatus(prev[card.id], g) }));
      setSession((s) => ({
        ...s,
        queue: applyAnswer(s.queue, g),
        counts: { ...s.counts, [g]: s.counts[g] + 1 },
      }));
      setFlipped(false);
    },
    [card, setStatuses, setSession]
  );

  // Клавиатура: Space/Enter — flip; 1/2/3 — оценка.
  useEffect(() => {
    const onKey = (e) => {
      if (!card) return;
      if ((e.key === " " || e.key === "Enter") && !flipped) {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped) {
        if (e.key === "1") grade("again");
        if (e.key === "2") grade("good");
        if (e.key === "3") grade("easy");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, flipped, grade]);

  if (!session) {
    return <main className="page" />;
  }

  return (
    <main className="page">
      <div className="page-head">
        <div className="eyebrow">
          anki · режим: {session.mode === "unknown" ? "только невыученные" : "все карты"}
        </div>
        <h1>Cards</h1>
        <p>Вспомни ответ, переверни карту и честно оцени себя. Сложные вернутся в этой же сессии.</p>
      </div>

      {done ? (
        <DoneCard
          session={session}
          known={known}
          onRestartAll={() => startSession("all")}
          onRestartUnknown={() => startSession("unknown")}
        />
      ) : (
        <div className="cards-wrap">
          <div className="card-counter">
            <span>
              в очереди: <b>{session.queue.length}</b>
            </span>
            <span>
              выучено: <b>{known}</b>/{QUESTIONS.length}
            </span>
          </div>

          <div
            className={`flashcard ${flipped ? "flipped" : ""}`}
            onClick={() => !flipped && setFlipped(true)}
          >
            <div className="flashcard-inner">
              <div className="face front">
                <div className="face-label">вопрос #{String(card.id).padStart(2, "0")}</div>
                <div className="face-q">{card.q}</div>
                <div className="face-foot">
                  <span>{card.cat}</span>
                  <span>нажми, чтобы перевернуть →</span>
                </div>
              </div>
              <div className="face back">
                <div className="face-label">краткий ответ</div>
                <div className="face-a">{card.short}</div>
                <div className="face-foot">
                  <span>#{String(card.id).padStart(2, "0")}</span>
                  <span>оцени ниже ↓</span>
                </div>
              </div>
            </div>
          </div>

          {flipped ? (
            <div className="srs-row">
              <button className="srs-btn again" onClick={() => grade("again")}>
                <span className="k">Again</span>
                <span className="sub">не вспомнил</span>
                <span className="key">1</span>
              </button>
              <button className="srs-btn good" onClick={() => grade("good")}>
                <span className="k">Good</span>
                <span className="sub">с усилием</span>
                <span className="key">2</span>
              </button>
              <button className="srs-btn easy" onClick={() => grade("easy")}>
                <span className="k">Easy</span>
                <span className="sub">знаю твёрдо</span>
                <span className="key">3</span>
              </button>
            </div>
          ) : (
            <div className="flip-hint">space / enter — перевернуть · 1·2·3 — оценка</div>
          )}

          <div className="cards-controls">
            <button className="btn ghost" onClick={() => startSession("unknown")}>
              перезапуск: только невыученные
            </button>
            <button className="btn ghost" onClick={() => startSession("all")}>
              перезапуск: все
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          className="reset-link"
          onClick={() => {
            if (confirm("Сбросить весь прогресс (Wiki + Cards)?")) {
              resetStatuses();
              startSession("all");
            }
          }}
        >
          сбросить весь прогресс
        </button>
      </div>
    </main>
  );
}

function DoneCard({ session, known, onRestartAll, onRestartUnknown }) {
  const { counts, total } = session;
  return (
    <div className="cards-wrap">
      <div className="done-card">
        <div className="big">🎯</div>
        <h2>Сессия пройдена</h2>
        <p>
          Прогнал {total} {plural(total)} в этой сессии.
        </p>
        <div className="done-stats">
          <span>
            <b style={{ color: "var(--again)" }}>{counts.again}</b>
            again
          </span>
          <span>
            <b style={{ color: "var(--good)" }}>{counts.good}</b>
            good
          </span>
          <span>
            <b style={{ color: "var(--easy)" }}>{counts.easy}</b>
            easy
          </span>
        </div>
        <p style={{ marginBottom: 22 }}>
          Всего выучено: {known} из {QUESTIONS.length}
        </p>
        <div className="cards-controls">
          <button className="btn primary" onClick={onRestartUnknown}>
            Добить невыученные
          </button>
          <button className="btn" onClick={onRestartAll}>
            Пройти все заново
          </button>
        </div>
      </div>
    </div>
  );
}

function plural(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "карту";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "карты";
  return "карт";
}
