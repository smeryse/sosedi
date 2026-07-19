"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { OwnerEditorLayout, OwnerEditorTool } from "@/components/owner/editor/owner-editor-layout";
import { Parametric3DScene } from "@/components/owner/editor/parametric-3d-scene";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OwnerPropertyEditorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [activeTool, setActiveTool] = useState<OwnerEditorTool>("select");

  return (
    <OwnerEditorLayout
      propertyName={`Объект #${resolvedParams.id}`}
      onBack={() => router.push("/owner/properties")}
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      canUndo={false}
      canRedo={false}
      onUndo={() => {}}
      onRedo={() => {}}
      onSave={() => console.log("Draft saved")}
      onPublish={() => alert("3D модель опубликована успешно!")}
    >
      <Parametric3DScene />
    </OwnerEditorLayout>
  );
}
