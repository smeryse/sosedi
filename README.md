# Соседи

Платформа для поиска соседей и совместной аренды жилья.

## Архитектура

```
sosedi/
├── backend/          # FastAPI (Python 3.12)
│   ├── app/
│   │   ├── api/      # REST-эндпоинты
│   │   ├── core/     # config, database, security
│   │   └── domain/   # Pydantic-модели
│   ├── alembic/      # Миграции БД
│   └── tests/        # pytest-тесты
├── frontend/         # Next.js 15 (React 19)
│   ├── app/          # Страницы
│   ├── components/   # UI-компоненты
│   └── lib/          # API-клиент, хуки
├── db/migrations/    # SQL-миграции
└── docker-compose.yml
```

| Компонент | Технология | Порт |
|---|---|---|
| Backend | FastAPI + asyncpg | `:8000` |
| Frontend | Next.js | `:3000` |
| Database | PostgreSQL 16 | `:5432` |
| Object Storage | MinIO (S3) | `:9000` |
| AI | Ollama | `:11434` |

## Быстрый старт

### 1. База данных

```bash
# Создать пользователя и БД (один раз)
sudo -u postgres psql -c "CREATE ROLE sosedi LOGIN PASSWORD 'sosedi'"
sudo -u postgres psql -c "CREATE DATABASE sosedi OWNER sosedi"

# Накатить миграции
cd backend && .venv/bin/alembic upgrade head
```

### 2. Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e .
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Compose (весь стек сразу)

```bash
docker compose up -d
```

### 5. Скрипт для разработки

```bash
./run.sh backend   # FastAPI на :8000
./run.sh frontend  # Next.js на :3000
./run.sh db        # Миграции БД
```

## API Endpoints

| Метод | Путь | Описание |
|---|---|---|
| GET | `/health` | Проверка сервера |
| POST | `/auth/signup` | Регистрация |
| POST | `/auth/login` | Вход |
| GET | `/auth/session` | Текущая сессия |
| POST | `/auth/logout` | Выход |
| POST | `/auth/forgot-password` | Сброс пароля |
| POST | `/auth/reset-password` | Новый пароль по токену |

## Тестирование

```bash
cd backend
.venv/bin/python -m pytest tests/ -v
```

## Переменные окружения

Скопировать `.env.example` в `.env` и настроить:

```bash
cp .env.example .env
```

Ключевые переменные:

- `DATABASE_URL` — подключение к PostgreSQL
- `LOCAL_AI_ENABLED` — включить AI-чат (Ollama)
- `S3_ENDPOINT` — S3-совместимое хранилище (MinIO)
