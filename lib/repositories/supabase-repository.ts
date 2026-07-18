import type { DemoProperty, DemoRoommate } from "@/data/demo";
import { createClient } from "@/lib/supabase/server";
import type { DemoAnswer, DemoApplication, DemoGroup, DemoState, Repository } from "./types";

/** Server-side repository. Browser code must use the demo repository or server actions. */
export class SupabaseRepository implements Repository {
  async listRoommates(query = "") {
    const supabase = await createClient();
    let request = supabase
      .from("profiles")
      .select("id, display_name, age, job_title, budget_max, city")
      .eq("is_public", true)
      .is("archived_at", null)
      .limit(24);
    if (query) request = request.ilike("display_name", `%${query}%`);
    const { data, error } = await request;
    if (error) throw new Error("Не удалось загрузить каталог соседей.");
    return (data ?? []).map(
      (profile): DemoRoommate => ({
        id: profile.id,
        name: profile.display_name,
        age: profile.age ?? 25,
        job: profile.job_title ?? "Специалист",
        budget: profile.budget_max ?? 25_000,
        district: profile.city,
        compatibility: 87,
        image: "/demo/people/maria.jpg",
        traits: ["Профиль заполнен"],
      }),
    );
  }

  async listProperties(query = "") {
    const supabase = await createClient();
    let request = supabase
      .from("properties")
      .select("id, title, district, monthly_rent, rooms, area")
      .eq("status", "published")
      .is("archived_at", null)
      .limit(24);
    if (query) request = request.ilike("title", `%${query}%`);
    const { data, error } = await request;
    if (error) throw new Error("Не удалось загрузить каталог жилья.");
    return (data ?? []).map(
      (property): DemoProperty => ({
        id: property.id,
        title: property.title,
        address: property.district ? `Краснодар, ${property.district}` : "Краснодар",
        district: property.district ?? "Центральный",
        price: property.monthly_rent,
        rooms: property.rooms,
        area: Number(property.area),
        floor: "5/12",
        image: "/demo/properties/center-loft.jpg",
        match: 86,
        photosCount: 12,
        tags: ["Проверенное жильё", "Мебель", "Техника"],
      }),
    );
  }

  async getState(): Promise<DemoState> {
    throw new Error("Состояние Supabase repository ещё не загружено.");
  }

  async toggleFavorite(): Promise<DemoState> {
    throw new Error("Избранное меняется через серверный action после авторизации.");
  }

  async saveAnswer(answer: DemoAnswer): Promise<DemoState> {
    void answer;
    throw new Error("Анкета сохраняется через серверный action после авторизации.");
  }

  async createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<DemoGroup> {
    void input;
    throw new Error("Группа создаётся через серверный action после авторизации.");
  }

  async submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">): Promise<DemoApplication> {
    void input;
    throw new Error("Заявка отправляется через серверный action после авторизации.");
  }
}
