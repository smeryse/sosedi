import { PageFrame } from "@/components/tenant/page-frame";
import { MessengerContainer } from "@/components/chat/messenger-container";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageFrame
      title="Сообщения"
      description="Переписка с потенциальными соседями, группой и собственниками жилья."
    >
      <MessengerContainer activeThreadId={id} />
    </PageFrame>
  );
}
