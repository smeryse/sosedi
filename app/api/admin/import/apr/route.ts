import { NextResponse, type NextRequest } from "next/server";
import { defaultAPRImporter } from "@/lib/integrations/ap-r/importer";

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace("Bearer ", "");
    const expectedToken = process.env.ADMIN_IMPORT_SECRET || process.env.APR_CRON_SECRET || "sosedi-admin-secret-dev";

    if (process.env.NODE_ENV === "production" && adminToken !== expectedToken) {
      return NextResponse.json(
        { error: "Доступ запрещён. Требуется x-admin-token." },
        { status: 401 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty if triggered by simple cron GET/POST
    }

    const { feedUrl, rawContent, format, markMissingAsInactive, dryRun } = body;

    const result = await defaultAPRImporter.runImport({
      feedUrl,
      rawContent,
      format,
      markMissingAsInactive,
      dryRun: Boolean(dryRun),
    });

    return NextResponse.json({
      success: result.status !== "failed",
      summary: result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка запуска импорта AP-R";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.headers.get("x-admin-token") || req.nextUrl.searchParams.get("token");
    const expectedToken = process.env.ADMIN_IMPORT_SECRET || process.env.APR_CRON_SECRET || "sosedi-admin-secret-dev";

    if (process.env.NODE_ENV === "production" && adminToken !== expectedToken) {
      return NextResponse.json(
        { error: "Доступ запрещён. Требуется x-admin-token." },
        { status: 401 }
      );
    }

    const logs = defaultAPRImporter.getInMemoryLogs();
    const items = defaultAPRImporter.getInMemoryProperties();

    return NextResponse.json({
      totalStoredItems: items.length,
      activeItemsCount: items.filter((i) => i.isAvailable).length,
      staleItemsCount: items.filter((i) => !i.isAvailable).length,
      recentLogs: logs.slice(0, 10),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка получения статуса импорта";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
