import { PageFrame } from "@/components/tenant/page-frame";
import { AssistantChat } from "@/components/tenant/assistant-chat";

export default function AssistantPage() { return <PageFrame eyebrow="Помощь" title="AI-помощник" description="Практичные подсказки по жилью, группе и бытовым договорённостям — на основе ваших данных."><AssistantChat /></PageFrame>; }
