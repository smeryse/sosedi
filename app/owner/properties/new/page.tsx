import { PageFrame } from "@/components/tenant/page-frame";
import { PropertyForm } from "@/components/owner/property-form";

export default function NewOwnerPropertyPage() {
  return (
    <PageFrame
      backHref="/owner/properties"
      title="Добавить объект"
      description="Создайте понятное объявление с точными условиями и фотографиями."
    >
      <PropertyForm />
    </PageFrame>
  );
}
