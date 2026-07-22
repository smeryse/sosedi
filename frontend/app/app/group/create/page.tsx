import { PageFrame } from "@/components/tenant/page-frame";
import { GroupCreator } from "@/components/tenant/group-creator";

export default function CreateGroupPage() { return <PageFrame backHref="/app/group" title="Создать группу" description="Сначала задайте рамки поиска. Потом пригласите людей, с которыми хотите жить."><GroupCreator /></PageFrame>; }
