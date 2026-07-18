#!/usr/bin/env bash
# scripts/sync-supabase.sh
# Автоматизация синхронизации с Supabase
# Запуск: ./scripts/sync-supabase.sh

set -euo pipefail

PROJECT_DIR="/Users/romanmolodyko/sosedi"
cd "$PROJECT_DIR"

echo "🔄 Supabase Sync Script"
echo "========================"

# Проверка CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI не найден. Установите: npm i -g supabase"
    exit 1
fi

echo "✅ Supabase CLI: $(supabase --version)"

# 1. Логин (если не залогинен)
echo ""
echo "📋 Шаг 1: Проверка авторизации..."
if ! supabase projects list &> /dev/null; then
    echo "🔐 Требуется логин (откроется браузер)..."
    supabase login
else
    echo "✅ Уже авторизован"
fi

# 2. Выбор/привязка проекта
echo ""
echo "📋 Шаг 2: Выбор проекта..."
echo "Доступные проекты:"
supabase projects list

read -p "Введите project-ref (или нажмите Enter для создания нового): " PROJECT_REF

if [[ -z "$PROJECT_REF" ]]; then
    read -p "Имя нового проекта: " PROJECT_NAME
    echo "🆕 Создание проекта '$PROJECT_NAME'..."
    supabase projects create "$PROJECT_NAME" --region eu-central-1
    # После создания нужно получить ref
    echo "⏳ Ждите создания проекта, затем введите ref:"
    read -p "Project ref: " PROJECT_REF
fi

echo "🔗 Привязка к проекту: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

# 3. Пуш миграций
echo ""
echo "📋 Шаг 3: Применение миграций..."
supabase db push

# 4. Генерация типов
echo ""
echo "📋 Шаг 4: Генерация TypeScript типов..."
supabase gen types typescript --project-ref "$PROJECT_REF" > lib/supabase/database.types.ts
echo "✅ Типы сохранены в lib/supabase/database.types.ts"

# 5. Показать ключи для .env.local
echo ""
echo "📋 Шаг 5: Ключи для .env.local"
echo "================================"
echo "Откройте: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo ""
echo "Скопируйте в .env.local:"
cat <<EOF

NEXT_PUBLIC_SUPABASE_URL=https://$PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key-from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-dashboard>
EOF

echo ""
echo "🎉 Готово! Дальше:"
echo "  1. Обновите .env.local реальными ключами"
echo "  2. npm run dev"
echo "  3. Проверьте /auth/login → регистрация → /app"

# Опционально: сиды
read -p "Применить сиды (demo данные)? [y/N]: " APPLY_SEEDS
if [[ "$APPLY_SEEDS" =~ ^[Yy]$ ]]; then
    echo "🌱 Применение сидов..."
    supabase db seed --project-ref "$PROJECT_REF"
    echo "✅ Сиды применены"
fi