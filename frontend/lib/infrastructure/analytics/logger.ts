export type AnalyticsEventType =
  | "map_opened"
  | "filter_changed"
  | "building_selected"
  | "3d_tour_opened"
  | "model_loaded_success"
  | "model_loaded_error"
  | "room_selected"
  | "roommate_assigned"
  | "simulator_started"
  | "simulator_completed"
  | "ai_verdict_viewed"
  | "step_changed"
  | "session_saved";

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function logAnalyticsEvent(event: AnalyticsEventType, metadata?: Record<string, unknown>): void {
  const payload: AnalyticsEvent = {
    event,
    timestamp: new Date().toISOString(),
    metadata,
  };

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Analytics 3D]`, payload.event, payload.metadata || "");
  }
}
