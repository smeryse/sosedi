import { PageFrame } from "@/components/tenant/page-frame";
import { MessengerContainer } from "@/components/chat/messenger-container";

export default function MessagesPage() {
  return (
    <PageFrame
      eyebrow="Общение"
      title="Сообщения"
      description="Переписка с потенциальными соседями, группой и собственниками жилья."
    >
      <MessengerContainer />
    </PageFrame>
  );
}
