import { Suspense } from "react";
import { PageFrame } from "@/components/tenant/page-frame";
import { AssistantChat } from "@/components/tenant/assistant-chat";

export default function AssistantPage() {
  return (
    <PageFrame
      title="AI-помощник"
      description="Практичные подсказки по жилью, группе и бытовым договорённостям — на основе ваших данных."
    >
      <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-[#6B6F66]">Загрузка чата...</div>}>
        <AssistantChat />
      </Suspense>
    </PageFrame>
  );
}
