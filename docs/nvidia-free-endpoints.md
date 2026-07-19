# NVIDIA NIM Free Endpoints Catalog & Status Audit

Дата проведения аудита: 2026-07-19
Проект: Платформа совместной аренды «Соседи»

---

## 1. Подтверждённые целевые NVIDIA Free Endpoints

### 1.1 `nvidia/nemotron-3-embed-1b` (Vector Embeddings)
- **Model ID**: `nvidia/nemotron-3-embed-1b`
- **Endpoint URL**: `https://integrate.api.nvidia.com/v1/embeddings` (OpenAI-compatible)
- **Base URL**: `https://integrate.api.nvidia.com/v1`
- **Тип доступности**: Hosted Free Endpoint (Trial Credit / Free Tier API Key)
- **Формат входа**:
  ```json
  {
    "input": ["..."],
    "model": "nvidia/nemotron-3-embed-1b",
    "input_type": "passage" | "query",
    "encoding_format": "float",
    "truncate": "NONE"
  }
  ```
- **Размерность вектора**: `2048`
- **Лимит токенов**: Фактическое ограничение hosted API составляет максимум **4096 токенов**. Канонические документы формируются гарантированно короче этого лимита, передаётся `"truncate": "NONE"`.
- **Лицензия / Условия**: NVIDIA AI Foundation License / Trial API.
- **Статус в приложении**: Включено (Feature Flag `NVIDIA_EMBEDDINGS_ENABLED=true`).

---

### 1.2 `nvidia/rerank-qa-mistral-4b` (Reranking)
- **Model ID**: `nvidia/rerank-qa-mistral-4b`
- **Endpoint URL**: `HTTPS POST https://ai.api.nvidia.com/v1/retrieval/nvidia/reranking`
- **Base URL**: `https://ai.api.nvidia.com/v1/retrieval/nvidia`
- **Тип доступности**: Hosted Free Endpoint (Trial API)
- **Формат входа**:
  ```json
  {
    "model": "nvidia/rerank-qa-mistral-4b",
    "query": { "text": "..." },
    "passages": [
      { "text": "..." }
    ]
  }
  ```
- **Ограничения**: До 512 токенов на passage, рекомендуется не более 30 кандидатов на один вызов.
- **Лицензия / Условия**: NVIDIA AI Foundation License.
- **Статус в приложении**: Реализуется через единый POST URL `https://ai.api.nvidia.com/v1/retrieval/nvidia/reranking`.

---

### 1.3 `nvidia/nemotron-3.5-content-safety` (Content & Visual Moderation)
- **Model ID**: `nvidia/nemotron-3.5-content-safety`
- **Endpoint URL**: `https://integrate.api.nvidia.com/v1/chat/completions` (OpenAI-compatible)
- **Base URL**: `https://integrate.api.nvidia.com/v1`
- **Тип доступности**: Hosted Free Endpoint (Trial API)
- **Особенности работы с русским языком**: Русский язык не входит в список официально заявленных языков модели. Реализуется локальный русскоязычный evaluation benchmark, feature flag и гибридный fallback на детерминированные локальные правила и ручную административную модерацию.
- **Загрузка изображений**:
  - Изображения **> 180 КБ**: загружаются через **NVCF Asset API** (`POST https://api.nvcf.nvidia.com/v2/nvcf/assets`) с получением `asset_id`.
  - Изображения **<= 180 КБ**: передаются через короткий signed URL или base64 data URI.
- **Лицензия / Условия**: NVIDIA AI Foundation License.
- **Статус в приложении**: Включено с гибридным fallback.

---

### 1.4 `nvidia/bnr` (Background Noise Removal)
- **Model ID / Target**: `nvidia/bnr`
- **Endpoint gRPC**: `grpc.nvcf.nvidia.com:443`
- **Function ID (NVCF)**: Переменная окружения `NVIDIA_BNR_FUNCTION_ID`.
- **Формат входного аудио**: Декодирование в **mono PCM float32** с частотой дискретизации **16 кГц** или **48 кГц**.
- **Клиент**: Точный gRPC/protobuf клиент из официального репозитория `NVIDIA-Maxine/nim-clients`.
- **Архитектура**: Выполняется изолированным микросервисом `services/nvidia-audio-worker` на Python.
- **Статус в приложении**: Реализуется отдельным финальным шагом.

---

## 2. Безопасность и Доступ к Таблицам

- Таблица `ai_provider_requests` полностью закрыта RLS от клиентского доступа (0 permissions for public/authenticated, запись/чтение выполняется строго из `security definer` или service role backend context).
- API-ключ `NVIDIA_API_KEY` доступен строго серверному коду.
