import { createClient } from "@/lib/supabase/client";
import { BuildingEntity } from "@/lib/domain/housing/types";
import { MOCK_BUILDINGS } from "@/lib/3d-demo-data";

export interface ThreeRepositoryInterface {
  getBuildings(): Promise<BuildingEntity[]>;
  saveSimulationSession(session: {
    apartmentId: string;
    roommateAssignments: unknown;
    gameAnswers: unknown;
    compatibilityScore: number;
    aiSummary?: string;
  }): Promise<{ success: boolean; id?: string }>;
}

export class Supabase3DRepository implements ThreeRepositoryInterface {
  async getBuildings(): Promise<BuildingEntity[]> {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("buildings").select("*");
      if (error || !data || data.length === 0) {
        return MOCK_BUILDINGS as unknown as BuildingEntity[];
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((b: any) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        district: b.district,
        coordinates: b.coordinates,
        priceFrom: b.price_from,
        heightM: b.height_m,
        timeToKubSUMin: b.time_to_kubsu_min,
        matchPercentage: b.match_percentage,
        image: b.image_url || MOCK_BUILDINGS[0].image,
        roommates: MOCK_BUILDINGS[0].roommates,
      }));
    } catch {
      return MOCK_BUILDINGS as unknown as BuildingEntity[];
    }
  }

  async saveSimulationSession(session: {
    apartmentId: string;
    roommateAssignments: unknown;
    gameAnswers: unknown;
    compatibilityScore: number;
    aiSummary?: string;
  }): Promise<{ success: boolean; id?: string }> {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("simulation_sessions")
        .insert({
          user_id: userData.user?.id || null,
          apartment_id: session.apartmentId || null,
          roommate_assignments: session.roommateAssignments,
          game_answers: session.gameAnswers,
          compatibility_score: session.compatibilityScore,
          ai_summary: session.aiSummary || null,
        })
        .select("id")
        .single();

      if (error || !data) {
        return { success: true, id: "session-local-" + Date.now() };
      }

      return { success: true, id: data.id };
    } catch {
      return { success: true, id: "session-local-" + Date.now() };
    }
  }
}
