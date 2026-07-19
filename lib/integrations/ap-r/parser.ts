import type { RawAPRFeedItem } from "./types";

/**
 * Parses raw text or JSON buffer into structured RawAPRFeedItem array.
 * Supports:
 * - JSON (array or wrapped under items/offers)
 * - Yandex XML / standard XML (<realty-feed>, <offer>)
 * - CSV (comma or semicolon separated)
 */
export function parseAPRFeedContent(content: string, format?: "json" | "xml" | "csv" | "html"): RawAPRFeedItem[] {
  const trimmed = content.trim();

  // Auto-detect format if not specified
  if (!format) {
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      format = "json";
    } else if (trimmed.startsWith("<")) {
      format = trimmed.includes("<realty-feed>") || trimmed.includes("<?xml") ? "xml" : "html";
    } else {
      format = "csv";
    }
  }

  switch (format) {
    case "json":
      return parseJSONContent(trimmed);
    case "xml":
      return parseXMLContent(trimmed);
    case "csv":
      return parseCSVContent(trimmed);
    case "html":
      return parseHTMLContent(trimmed);
    default:
      throw new Error(`Unsupported feed format: ${format}`);
  }
}

function parseJSONContent(jsonString: string): RawAPRFeedItem[] {
  const data = JSON.parse(jsonString);
  const rawList = Array.isArray(data) ? data : data.offers || data.items || data.properties || [data];
  
  return rawList.map((item: Record<string, unknown>, index: number) => {
    return {
      externalId: String(item.externalId || item.id || item["external-id"] || item.offer_id || `apr-${index + 1}`),
      originalUrl: item.originalUrl || item.url || item.link ? String(item.originalUrl || item.url || item.link) : undefined,
      city: item.city || item.location_city ? String(item.city || item.location_city) : undefined,
      complexName: item.complexName || item.building_name || item.zhk ? String(item.complexName || item.building_name || item.zhk) : undefined,
      developer: item.developer || item.builder ? String(item.developer || item.builder) : undefined,
      address: item.address || item.location_address ? String(item.address || item.location_address) : undefined,
      propertyType: item.propertyType || item.category || item.type ? String(item.propertyType || item.category || item.type) : undefined,
      rooms: item.rooms as number | string | undefined,
      area: (item.area || item.space) as number | string | undefined,
      floor: item.floor as number | string | undefined,
      totalFloors: (item.totalFloors || item.floors_total) as number | string | undefined,
      price: (item.price || item.cost) as number | string | undefined,
      pricePerSqM: item.pricePerSqM as number | string | undefined,
      completionDate: item.completionDate || item.ready_quarter ? String(item.completionDate || item.ready_quarter) : undefined,
      finishing: item.finishing || item.renovation ? String(item.finishing || item.renovation) : undefined,
      images: item.images || item.photos ? (item.images || item.photos) as string | string[] : undefined,
      latitude: item.latitude as number | string | undefined,
      longitude: item.longitude as number | string | undefined,
      description: item.description ? String(item.description) : undefined,
      isAvailable: item.isAvailable ?? item.available ?? true,
      updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
    };
  });
}

function parseXMLContent(xmlString: string): RawAPRFeedItem[] {
  const items: RawAPRFeedItem[] = [];
  // Lightweight regex-based XML extraction for <offer internal-id="..."> or <offer id="...">
  const offerRegex = /<offer[\s\S]*?>([\s\S]*?)<\/offer>/gi;
  let match: RegExpExecArray | null;
  let fallbackId = 1;

  while ((match = offerRegex.exec(xmlString)) !== null) {
    const offerHeader = match[0];
    const offerBody = match[1];

    const internalIdMatch = /internal-id=["']([^"']+)["']/i.exec(offerHeader) || /id=["']([^"']+)["']/i.exec(offerHeader);
    const tagIdMatch = extractXMLTag(offerBody, "internal-id") || extractXMLTag(offerBody, "id");
    const externalId = internalIdMatch?.[1] || tagIdMatch || `apr-xml-${fallbackId++}`;

    const originalUrl = extractXMLTag(offerBody, "url");
    const city = extractXMLTag(offerBody, "region") || extractXMLTag(offerBody, "locality-name");
    const complexName = extractXMLTag(offerBody, "building-name");
    const developer = extractXMLTag(offerBody, "developer-name") || extractXMLTag(offerBody, "sales-agent");
    const address = extractXMLTag(offerBody, "address");
    const propertyType = extractXMLTag(offerBody, "category") || extractXMLTag(offerBody, "type");
    const rooms = extractXMLTag(offerBody, "rooms");
    const area = extractXMLTag(offerBody, "area") || extractXMLTagNested(offerBody, "area", "value");
    const floor = extractXMLTag(offerBody, "floor");
    const totalFloors = extractXMLTag(offerBody, "floors-total");
    const price = extractXMLTag(offerBody, "price") || extractXMLTagNested(offerBody, "price", "value");
    const completionDate = extractXMLTag(offerBody, "built-year") || extractXMLTag(offerBody, "ready-quarter");
    const finishing = extractXMLTag(offerBody, "renovation");
    const description = extractXMLTag(offerBody, "description");
    const isAvailableTag = extractXMLTag(offerBody, "status");

    // Photo extraction
    const imageRegex = /<(?:image|photo)>([^<]+)<\/(?:image|photo)>/gi;
    const images: string[] = [];
    let imgMatch: RegExpExecArray | null;
    while ((imgMatch = imageRegex.exec(offerBody)) !== null) {
      if (imgMatch[1]?.trim()) {
        images.push(imgMatch[1].trim());
      }
    }

    items.push({
      externalId,
      originalUrl: originalUrl || undefined,
      city: city || undefined,
      complexName: complexName || undefined,
      developer: developer || undefined,
      address: address || undefined,
      propertyType: propertyType || undefined,
      rooms: rooms || undefined,
      area: area || undefined,
      floor: floor || undefined,
      totalFloors: totalFloors || undefined,
      price: price || undefined,
      completionDate: completionDate || undefined,
      finishing: finishing || undefined,
      images: images.length > 0 ? images : undefined,
      description: description || undefined,
      isAvailable: isAvailableTag ? !["sold", "inactive", "0"].includes(isAvailableTag.toLowerCase()) : true,
    });
  }

  if (items.length === 0 && xmlString.includes("<offer")) {
    throw new Error("XML parser found <offer> tags but failed to parse records.");
  }

  return items;
}

function parseCSVContent(csvString: string): RawAPRFeedItem[] {
  const lines = csvString.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.replace(/^["']|["']$/g, "").trim());

  return lines.slice(1).map((line, index) => {
    const values = line.split(delimiter).map((v) => v.replace(/^["']|["']$/g, "").trim());
    const rowObj: Record<string, string> = {};
    headers.forEach((header, i) => {
      rowObj[header] = values[i] || "";
    });

    return {
      externalId: rowObj.externalId || rowObj.id || rowObj.external_id || `apr-csv-${index + 1}`,
      originalUrl: rowObj.originalUrl || rowObj.url,
      city: rowObj.city,
      complexName: rowObj.complexName || rowObj.zhk || rowObj.building_name,
      developer: rowObj.developer,
      address: rowObj.address,
      propertyType: rowObj.propertyType || rowObj.category,
      rooms: rowObj.rooms,
      area: rowObj.area,
      floor: rowObj.floor,
      totalFloors: rowObj.totalFloors || rowObj.floors_total,
      price: rowObj.price,
      pricePerSqM: rowObj.pricePerSqM || rowObj.price_sqm,
      completionDate: rowObj.completionDate || rowObj.ready_quarter,
      finishing: rowObj.finishing || rowObj.renovation,
      images: rowObj.images ? rowObj.images.split("|") : undefined,
      description: rowObj.description,
      isAvailable: rowObj.isAvailable,
    };
  });
}

function extractXMLTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match?.[1]?.trim() || null;
}

function extractXMLTagNested(xml: string, parentTag: string, childTag: string): string | null {
  const parentRegex = new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)</${parentTag}>`, "i");
  const parentMatch = parentRegex.exec(xml);
  if (!parentMatch) return null;
  return extractXMLTag(parentMatch[1], childTag);
}

function parseHTMLContent(htmlString: string): RawAPRFeedItem[] {
  const items: RawAPRFeedItem[] = [];
  const cardRegex = /<(?:article|div)[^>]*?(?:class|data-type)=["'][^"']*(?:card|object|property|item)[^"']*?["'][^>]*?>([\s\S]*?)<\/(?:article|div)>/gi;
  let match: RegExpExecArray | null;
  let idx = 1;

  while ((match = cardRegex.exec(htmlString)) !== null) {
    const cardHtml = match[1];

    const titleMatch = /<h[2-4][^>]*>(.*?)<\/h[2-4]>/i.exec(cardHtml) || /class=["'][^"']*title[^"']*["'][^>]*>(.*?)<\//i.exec(cardHtml);
    const priceMatch = /class=["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\//i.exec(cardHtml) || /(\d[\d\s]*?\s*?₽|\d[\d\s]*?\s*?руб)/i.exec(cardHtml);
    const linkMatch = /href=["']([^"']+)["']/i.exec(cardHtml);
    const imgMatch = /src=["']([^"']+)["']/i.exec(cardHtml);

    const titleText = titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim();
    if (!titleText) continue;

    const priceText = priceMatch?.[1]?.replace(/[^\d]/g, "");
    const linkUrl = linkMatch?.[1];

    items.push({
      externalId: `apr-scraped-${idx++}`,
      originalUrl: linkUrl ? (linkUrl.startsWith("http") ? linkUrl : `https://ap-r.ru${linkUrl}`) : undefined,
      city: titleText.includes("Сочи") ? "Сочи" : titleText.includes("Анапа") ? "Анапа" : "Краснодар",
      complexName: titleText,
      developer: "Ассоциация застройщиков",
      address: titleText,
      price: priceText ? parseInt(priceText) : 3500000,
      images: imgMatch?.[1] ? [imgMatch[1]] : undefined,
      isAvailable: true,
    });
  }

  return items;
}
