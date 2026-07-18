# Развёртывание

1. Создайте Supabase project и задайте `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Примените миграции (`supabase db push`) и при необходимости seed.
3. Для создания demo пользователей запускайте `npm run seed:users` только локально/на доверенной машине с service role key.
4. В Vercel/другом хостинге задайте только нужные переменные из `.env.example`, проверьте redirect URLs Supabase Auth и включите HTTPS.
5. Перед релизом выполните `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` и e2e smoke.
