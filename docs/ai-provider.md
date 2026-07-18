# AI-провайдер

`lib/ai/provider.ts` — небольшой OpenAI-compatible адаптер с единым интерфейсом `AIProvider`. Переключатель `AI_PROVIDER` поддерживает `mock`, `groq` и `openrouter`. Mock используется по умолчанию, отвечает детерминированно и не требует сети.

Для Groq задайте `GROQ_API_KEY` и при необходимости `GROQ_MODEL`; для OpenRouter — `OPENROUTER_API_KEY` и `OPENROUTER_MODEL`. Вызывать провайдер следует только из server action/route handler, а ошибки внешнего API превращать в безопасное сообщение для пользователя.
