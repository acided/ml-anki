// In-session spaced repetition (без дат, всё внутри одной сессии зубрёжки).
// Очередь — массив id карточек. Ответ переставляет/удаляет текущую карту.

// Насколько далеко отодвигать карту по каждой кнопке:
const GAP = {
  again: 3, // всплывёт снова очень скоро
  good: 9, // вернётся попозже
  // easy -> убираем из очереди совсем (graduated)
};

// Построить стартовую очередь.
// mode: 'all' — все id; 'unknown' — только не в статусе 'known'.
export function buildQueue(questions, statuses, mode) {
  const ids = questions.map((q) => q.id);
  if (mode === "unknown") {
    const filtered = ids.filter((id) => statuses[id]?.status !== "known");
    return filtered.length ? filtered : ids; // если всё выучено — гоняем всё
  }
  return ids;
}

// Применить ответ к очереди. Возвращает новую очередь.
// queue[0] — текущая карта.
export function applyAnswer(queue, grade) {
  const [current, ...rest] = queue;
  if (grade === "easy") {
    return rest; // выходит из сессии
  }
  const gap = GAP[grade];
  const pos = Math.min(gap, rest.length); // не дальше конца
  const next = [...rest];
  next.splice(pos, 0, current);
  return next;
}

// Обновить долговременный статус карты (хранится в localStorage).
export function nextStatus(prev, grade) {
  const base = prev || { status: "new", seen: 0, again: 0 };
  const seen = base.seen + 1;
  const again = base.again + (grade === "again" ? 1 : 0);
  let status = base.status;
  if (grade === "easy") status = "known";
  else if (grade === "good") status = base.status === "known" ? "known" : "learning";
  else status = "learning"; // again
  return { status, seen, again, last: grade };
}
