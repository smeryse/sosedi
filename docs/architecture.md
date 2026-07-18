# Архитектура «Соседей"

## Слои

- `app/` — маршруты Next.js App Router. `/app` — кабинет жильца, `/owner` — кабинет собственника, `/auth` — вход и восстановление.
- `components/app-shell/` — единый sidebar, header и мобильная навигация из канонических зелёных референсов.
- `components/tenant/` — карточки каталогов, формы группы/заявки, анкета совместимости и чаты.
- `lib/repositories/` — интерфейс данных. Без Supabase используется `DemoRepository` с localStorage; при заданных public Supabase переменных выбирается серверный адаптер.
- `lib/compatibility/` — чистый детерминированный движок hard constraints и объяснимых soft scores.
- `supabase/` — миграция схемы, RLS и seed. Service role используется только отдельным серверным скриптом.

## Поток данных

Публичные страницы не требуют сессии. В demo-режиме страницы кабинета работают на фикстурах и localStorage, поэтому сценарии можно пройти без внешних ключей. В production middleware и layout проверяют Supabase claims; операции записи должны вызываться server actions/route handlers и проходить RLS.

## Границы

Карты пока имеют лёгкий статический fallback. Слой `maplibre-gl` добавляется на странице каталога после подключения tile provider. Реальный AI подключается через `lib/ai/provider.ts`; по умолчанию используется mock без сетевых запросов.
