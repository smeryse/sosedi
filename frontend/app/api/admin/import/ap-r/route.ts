import { NextRequest, NextResponse } from "next/server";
import { defaultAPRImporter } from "@/lib/integrations/ap-r/importer";

export async function POST(req: NextRequest) {
  // Authorization check using secret header or query param
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.APR_IMPORT_SECRET || "development-secret-key";

  if (authHeader !== `Bearer ${secretKey}` && req.nextUrl.searchParams.get("secret") !== secretKey) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing administrative secret key." },
      { status: 401 }
    );
  }

  try {
    let bodyData: { feedUrl?: string; rawContent?: string; format?: "json" | "xml" | "csv" } = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      bodyData = await req.json();
    } else if (contentType.includes("text/plain") || contentType.includes("text/xml") || contentType.includes("text/csv")) {
      const text = await req.text();
      bodyData = { rawContent: text };
    }

    const result = await defaultAPRImporter.runImport({
      feedUrl: bodyData.feedUrl,
      rawContent: bodyData.rawContent,
      format: bodyData.format,
    });

    return NextResponse.json({
      message: "AP-R catalog import completed",
      result,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to execute AP-R import pipeline", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.APR_IMPORT_SECRET || "development-secret-key";
  if (req.nextUrl.searchParams.get("secret") !== secretKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = defaultAPRImporter.getInMemoryLogs();
  const properties = defaultAPRImporter.getInMemoryProperties();

  return NextResponse.json({
    activeCount: properties.filter((p) => p.isAvailable).length,
    totalCount: properties.length,
    recentLogs: logs.slice(0, 10),
  });
}
