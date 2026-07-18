# План реализации «Соседей»

## Текущее состояние — 18 июля 2026

Аудит выполнен. Реализованы брендовая дизайн-система, AppShell, tenant/owner кабинеты, публичные страницы, demo repository, каталоги людей и жилья, избранное, анкета, группы, заявки, сообщения, бюджет, задачи, AI mock, Supabase migration/RLS/seed и эксплуатационная документация.

Исходный репозиторий был Next.js + Supabase App Template с базовыми auth/tutorial-страницами. Его структура сохранена; продуктовые маршруты добавлены в `app/app`, `app/owner` и публичные страницы. Проверены все ключевые маршруты через Playwright route smoke, а dashboard — на 1440×900 и 390×844.

## Выполнено

1. Полностью прочитаны `DO_APP.md` и связанные Markdown-документы, просмотрены все изображения и архивные assets.
2. Созданы `docs/reference-audit.md` и этот план.
3. Добавлены Manrope, CSS tokens, canonical green shell, responsive sidebar/header/mobile nav и брендированные UI primitives.
4. Собран эталонный dashboard с картой-fallback, рекомендациями, группой, AI-блоком и задачами.
5. Добавлен typed repository layer: `DemoRepository` с localStorage и серверный Supabase read adapter.
6. Добавлены миграция, таблицы доменов, индексы, triggers, RLS, storage policies и seed.
7. Добавлены auth guard/middleware allowlist и русские auth forms; demo-режим работает без env.
8. Добавлены compatibility engine, 20 вопросов, explainable breakdown и unit tests.
9. Реализованы страницы соседей, сравнения, избранного и рекомендаций.
10. Реализованы жильё, карта-fallback, объект и group-property fit.
11. Реализованы группы, приглашение (demo flow), общий чат, заявки и timeline.
12. Реализованы сообщения, уведомления, бюджет, расходы, уборка и задачи.
13. Реализованы кабинет собственника, объекты, заявки, сообщения, аналитика, профиль и настройки.
14. Добавлен AI provider interface с mock/Groq/OpenRouter adapters.
15. Добавлены landing, about, safety, FAQ и branded auth layout.
16. Добавлены route smoke, visual smoke, validation tests и документация.

## Что ещё нужно для production

- Перенести записи группы, заявки, избранного и ответов анкеты из demo repository в server actions/route handlers с Zod, session, role/ownership checks.
- Подключить generated Supabase Database Types и permission tests на локальном Supabase.
- Подключить реальный MapLibre tile provider, Storage upload validation, realtime conversations, email/push и rate limiting.
- Провести полноценный accessibility/performance audit и visual regression matrix.
- Внешние KYC, платежи и AI остаются интеграционными задачами; mock не выдаётся за готовую внешнюю услугу.

## Критерии проверки

- Нет `any`, `ts-ignore` и отключённых правил ESLint.
- Demo-сценарии имеют реальное состояние, loading/empty/error/success/disabled состояния там, где это нужно.
- SQL содержит UUID, timestamps, constraints, indexes, triggers, RLS и storage policies.
- После крупных этапов запускаются `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- Визуальный контроль выполняется на 1440×900 и 390×844; route smoke проверяет HTTP 200 для публичных и основных внутренних маршрутов.

## Принятые решения

- Без Supabase env включается отдельный demo repository, а не набор условных заглушек внутри компонентов.
- Картографический fallback остаётся информативным и не притворяется внешней картой.
- Mock AI отвечает детерминированно и не делает сетевых запросов.
- Каноническими считаются первые три зелёных референса: `0.png`, `1.png`, `2.png`; последующие экраны используются как page-specific references.
