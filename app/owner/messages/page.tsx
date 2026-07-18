import { PageFrame } from "@/components/tenant/page-frame";
import { MessengerContainer } from "@/components/chat/messenger-container";

export default function OwnerMessagesPage() {
  return (
    <PageFrame
      eyebrow="Кабинет собственника"
      title="Сообщения"
      description="Диалоги с арендаторами и группами кандидатов по вашим объектам."
    >
      <MessengerContainer activeThreadId="group" />
    </PageFrame>
  );
}
