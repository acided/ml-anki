# ML Exam Prep

Подготовка к экзамену по ML: **Wiki** (50 вопросов, развёрнутый + краткий ответ) и **Cards**
(Anki-карточки с in-session SRS: Again / Good / Easy). Прогресс сохраняется в `localStorage`
и переживает рефреш.

Стек: Vite + React 18 + React Router (HashRouter). Тема: dark.

## Локальный запуск

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` — production-сборка в `dist/`. `npm run preview` — посмотреть собранное.

## Управление

- **Wiki**: тап по вопросу → модалка с двумя ответами; ← → между вопросами; галочка «выучил».
- **Cards**: `space`/`enter` перевернуть карту; `1` Again, `2` Good, `3` Easy.
  - Again → карта вернётся через ~3 показа; Good → через ~9; Easy → уйдёт из сессии.
  - Перезапуск «только невыученные» гоняет то, что ещё не Easy.

## Деплой на GitHub Pages + свой домен

### 1. Впиши свой домен

Открой `public/CNAME`, замени `your-domain.com` на свой (например `mlprep.example.com`).
Если домен **без** www — оставь как есть; если apex (`example.com`) — тоже просто домен одной строкой.

> Хостишь **без** своего домена, на `username.github.io/REPO`? Тогда:
> 1) удали `public/CNAME`, 2) в `vite.config.js` поменяй `base: '/'` на `base: '/REPO/'`.

### 2. Залей в репозиторий

```bash
git init
git add .
git commit -m "init: ml exam prep"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 3. Включи Pages через Actions

В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Workflow `.github/workflows/deploy.yml` уже в проекте — он сам соберёт и задеплоит при каждом
push в `main`. Первый деплой запустится автоматически (вкладка **Actions**).

### 4. Привяжи домен (DNS)

У регистратора/DNS-провайдера:

- **Subdomain** (`mlprep.example.com`): CNAME-запись → `USERNAME.github.io`
- **Apex** (`example.com`): A-записи на IP GitHub Pages:
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  (+ опционально AAAA для IPv6)

В **Settings → Pages → Custom domain** впиши домен, дождись проверки DNS, включи **Enforce HTTPS**
(может занять до ~24 ч, пока выпустится сертификат).

## Где править контент

Все вопросы и ответы — в одном файле: `src/data/questions.js`.
Каждая запись: `q` (вопрос), `detailed` (развёрнутый), `short` (краткий, идёт на оборот карточки), `cat` (категория).

## Сброс прогресса

Кнопка «сбросить весь прогресс» внизу страницы Cards, либо вручную — очистить ключи
`ml-prep:*` в localStorage (DevTools → Application → Local Storage).
