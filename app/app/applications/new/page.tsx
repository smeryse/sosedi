import { PageFrame } from "@/components/tenant/page-frame";
import { ApplicationForm } from "@/components/tenant/application-form";
import { Suspense } from "react";

export default function NewApplicationPage() { return <PageFrame backHref="/app/applications" title="Новая заявка" description="Проверьте данные группы и напишите короткое, человеческое сообщение собственнику."><Suspense fallback={<div className="surface-card h-64 animate-pulse" />}><ApplicationForm /></Suspense></PageFrame>; }
