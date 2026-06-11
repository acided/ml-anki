import { useState, useMemo, useEffect, useCallback } from "react";
import { QUESTIONS, CATEGORIES } from "../data/questions.js";

export default function WikiPage({ statuses, setStatuses, known }) {
  const [cat, setCat] = useState("Все");
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState(null); // индекс в отфильтрованном списке

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return QUESTIONS.filter((item) => {
      if (cat !== "Все" && item.cat !== cat) return false;
      if (q && !item.q.toLowerCase().includes(q) && !item.detailed.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [cat, query]);

  const toggleKnown = useCallback(
    (id) => {
      setStatuses((prev) => {
        const cur = prev[id]?.status;
        const next = { ...prev };
        if (cur === "known") {
          next[id] = { ...(prev[id] || {}), status: "learning" };
        } else {
          next[id] = { ...(prev[id] || { seen: 0, again: 0 }), status: "known" };
        }
        return next;
      });
    },
    [setStatuses]
  );

  const pct = Math.round((known / QUESTIONS.length) * 100);

  return (
    <main className="page">
      <div className="page-head">
        <div className="eyebrow">база знаний · 50 вопросов</div>
        <h1>Wiki</h1>
        <p>Тапни вопрос — откроется развёрнутый и краткий ответ. Отметь галочкой, что выучил.</p>
        <div className="progress-shell">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-meta">
            <span>выучено {known} из {QUESTIONS.length}</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <button className={`chip ${cat === "Все" ? "on" : ""}`} onClick={() => setCat("Все")}>
          Все
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <input
        className="search"
        placeholder="Поиск по вопросам…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="wiki-list">
        {filtered.length === 0 && <div className="empty">Ничего не найдено</div>}
        {filtered.map((item, i) => {
          const done = statuses[item.id]?.status === "known";
          return (
            <button
              key={item.id}
              className={`qrow ${done ? "done" : ""}`}
              onClick={() => setOpenIdx(i)}
            >
              <span className="qnum">{String(item.id).padStart(2, "0")}</span>
              <span className="qbody">
                <span className="qtext">{item.q}</span>
                <div className="qmeta">{item.cat}</div>
              </span>
              <span
                className={`check ${done ? "on" : ""}`}
                role="checkbox"
                aria-checked={done}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleKnown(item.id);
                }}
              >
                {done ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {openIdx !== null && filtered[openIdx] && (
        <QuestionModal
          list={filtered}
          idx={openIdx}
          setIdx={setOpenIdx}
          statuses={statuses}
          toggleKnown={toggleKnown}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </main>
  );
}

function QuestionModal({ list, idx, setIdx, statuses, toggleKnown, onClose }) {
  const item = list[idx];
  const done = statuses[item.id]?.status === "known";
  const hasPrev = idx > 0;
  const hasNext = idx < list.length - 1;

  const go = useCallback(
    (dir) => {
      setIdx((cur) => {
        const n = cur + dir;
        if (n < 0 || n > list.length - 1) return cur;
        return n;
      });
    },
    [setIdx, list.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, go]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <span className="qnum">{String(item.id).padStart(2, "0")}</span>
          <span className="cat-tag">{item.cat}</span>
          <button className="modal-x" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <h2>{item.q}</h2>

        <div className="answer-block">
          <div className="answer-label full">● Развёрнутый</div>
          <div className="answer-text">{item.detailed}</div>
        </div>

        <div className="answer-block short-block">
          <div className="answer-label brief">● Кратко и чётко</div>
          <div className="answer-text">{item.short}</div>
        </div>

        <div className="modal-foot">
          <button
            className={`btn ${done ? "ghost" : "primary"}`}
            onClick={() => toggleKnown(item.id)}
          >
            {done ? "Снять отметку" : "Выучил ✓"}
          </button>
          <div className="btn-nav">
            <button className="btn icon" disabled={!hasPrev} onClick={() => go(-1)}>
              ←
            </button>
            <button className="btn icon" disabled={!hasNext} onClick={() => go(1)}>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
