import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_BUILDINGS, CityBuilding } from "../../3d-demo-data";
import { calculateFairRentSplit } from "../../domain/housing/rent-calculator";
import { calculateMultiAxisCompatibility, MultiAxisScore } from "../../domain/compatibility/calculator";
import { RoomEntity, RoommateEntity, RentCalculationResult, RoomId } from "../../domain/housing/types";
import { GraphicsTier } from "../../3d/performance-manager";
import { ConciergeVerdict, ResilientConciergeProvider } from "../../infrastructure/ai/concierge-provider";
import { logAnalyticsEvent } from "../../infrastructure/analytics/logger";

const DEFAULT_ROOMS_3B: RoomEntity[] = [
  { id: "room-master", apartmentId: "apt-1", name: "Главная спальня (Мастер)", type: "private", areaM2: 22, hasBalcony: true, windowSize: "large", noiseLevel: "quiet", weight: 26 },
  { id: "room-second", apartmentId: "apt-1", name: "Вторая спальня (Рабочая)", type: "private", areaM2: 18, hasWorkplace: true, windowSize: "medium", noiseLevel: "moderate", weight: 20 },
  { id: "room-third", apartmentId: "apt-1", name: "Уютная спальня (Малая)", type: "private", areaM2: 14, windowSize: "standard", noiseLevel: "quiet", weight: 16 },
  { id: "room-living", apartmentId: "apt-1", name: "Просторная гостиная", type: "common", areaM2: 24, windowSize: "large", noiseLevel: "moderate", weight: 0 },
  { id: "room-kitchen", apartmentId: "apt-1", name: "Кухня", type: "common", areaM2: 14, windowSize: "medium", noiseLevel: "moderate", weight: 0 },
  { id: "room-bathroom", apartmentId: "apt-1", name: "Ванная комната", type: "common", areaM2: 8, windowSize: "standard", noiseLevel: "quiet", weight: 0 },
];

const DEFAULT_ROOMMATES_3B: RoommateEntity[] = [
  { id: "roman", name: "Роман", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", role: "Дизайнер", assignedRoomId: "room-master", calculatedPrice: 17333 },
  { id: "ilya", name: "Илья", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", role: "Разработчик", assignedRoomId: "room-second", calculatedPrice: 13333 },
  { id: "arina", name: "Арина", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", role: "Маркетолог", assignedRoomId: "room-third", calculatedPrice: 9334 },
];

export interface Commercial3DDemoStoreState {
  // Navigation Slice
  activeStep: 1 | 2 | 3 | 4 | 5;
  setActiveStep: (step: 1 | 2 | 3 | 4 | 5) => void;

  // Search & Filters Slice
  selectedBuildingId: string;
  setSelectedBuildingId: (id: string) => void;
  districtFilter: string;
  setDistrictFilter: (d: string) => void;
  maxRent: number;
  setMaxRent: (val: number) => void;
  timeToDestinationMin: number;
  setTimeToDestinationMin: (val: number) => void;
  has3DModelFilter: boolean;
  setHas3DModelFilter: (val: boolean) => void;
  petsAllowedFilter: boolean;
  setPetsAllowedFilter: (val: boolean) => void;
  peopleFilter: string;
  setPeopleFilter: (val: string) => void;

  // Quality of Life Map Slice
  activeQualityMode: "transport" | "comfort" | "neighbors";
  setActiveQualityMode: (mode: "transport" | "comfort" | "neighbors") => void;

  // 3D Viewer & Graphics Slice
  activeRoomId: RoomId;
  setActiveRoomId: (room: RoomId) => void;
  isMeasuring: boolean;
  setIsMeasuring: (val: boolean | ((prev: boolean) => boolean)) => void;
  isDay: boolean;
  setIsDay: (val: boolean | ((prev: boolean) => boolean)) => void;
  graphicsTier: GraphicsTier;
  setGraphicsTier: (tier: GraphicsTier) => void;

  // Feature Flags & Owner Editor Slice
  featureFlags: {
    useSceneRegistry: boolean;
    useOwnerEditor: boolean;
    useMapcnUI: boolean;
    useParametricViewer: boolean;
  };
  ownerEditorTool: "select" | "wall" | "door" | "window" | "furniture" | "measure";
  setOwnerEditorTool: (tool: "select" | "wall" | "door" | "window" | "furniture" | "measure") => void;

  // 3-Bedroom Assignment & Rent Calculation Slice
  totalApartmentRent: number;
  rooms3B: RoomEntity[];
  roommates3B: RoommateEntity[];
  rentResult: RentCalculationResult;
  assignRoommateToRoom: (roommateId: string, roomId: string) => void;

  // Simulation & AI Slice
  gameAnswers: Record<number, string>;
  gameStepIndex: number;
  setGameAnswer: (situationId: number, optionId: string) => void;
  setGameStepIndex: (idx: number) => void;
  resetGame: () => void;
  compatibilityResult: MultiAxisScore;
  aiVerdict: ConciergeVerdict | null;
  loadAIVerdict: () => Promise<ConciergeVerdict>;

  // Selectors
  getSelectedBuilding: () => CityBuilding;
}

const memoryStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

export const useCommercial3DStore = create<Commercial3DDemoStoreState>()(
  persist(
    (set, get) => {
      const initialRentResult = calculateFairRentSplit(40000, DEFAULT_ROOMS_3B, DEFAULT_ROOMMATES_3B);
      const initialCompatibility = calculateMultiAxisCompatibility({ 1: "write-chat", 2: "warned", 3: "common-budget", 4: "headphones", 5: "agreed-hours" });

      return {
        activeStep: 1,
        setActiveStep: (step) => {
          logAnalyticsEvent("step_changed", { step });
          set({ activeStep: step });
        },

        selectedBuildingId: "stavropolskaya-123",
        setSelectedBuildingId: (id) => {
          logAnalyticsEvent("building_selected", { id });
          set({ selectedBuildingId: id });
        },

        districtFilter: "Все районы",
        setDistrictFilter: (d) => set({ districtFilter: d }),
        maxRent: 25000,
        setMaxRent: (val) => set({ maxRent: val }),
        timeToDestinationMin: 18,
        setTimeToDestinationMin: (val) => set({ timeToDestinationMin: val }),
        has3DModelFilter: true,
        setHas3DModelFilter: (val) => set({ has3DModelFilter: val }),
        petsAllowedFilter: false,
        setPetsAllowedFilter: (val) => set({ petsAllowedFilter: val }),
        peopleFilter: "2-4 человека",
        setPeopleFilter: (val) => set({ peopleFilter: val }),

        activeQualityMode: "neighbors",
        setActiveQualityMode: (mode) => set({ activeQualityMode: mode }),

        activeRoomId: "room-master",
        setActiveRoomId: (room) => {
          logAnalyticsEvent("room_selected", { room: room || "none" });
          set({ activeRoomId: room });
        },

        isMeasuring: false,
        setIsMeasuring: (val) => set((state) => ({ isMeasuring: typeof val === "function" ? val(state.isMeasuring) : val })),

        isDay: true,
        setIsDay: (val) => set((state) => ({ isDay: typeof val === "function" ? val(state.isDay) : val })),

        graphicsTier: "auto",
        setGraphicsTier: (tier) => set({ graphicsTier: tier }),

        featureFlags: {
          useSceneRegistry: true,
          useOwnerEditor: true,
          useMapcnUI: true,
          useParametricViewer: false,
        },
        ownerEditorTool: "select",
        setOwnerEditorTool: (tool) => set({ ownerEditorTool: tool }),

        totalApartmentRent: 40000,
        rooms3B: DEFAULT_ROOMS_3B,
        roommates3B: DEFAULT_ROOMMATES_3B,
        rentResult: initialRentResult,

        assignRoommateToRoom: (roommateId, roomId) => {
          const { roommates3B, rooms3B, totalApartmentRent } = get();

          const assigner = roommates3B.find((r) => r.id === roommateId);
          if (!assigner) return;
          const previousRoomId = assigner.assignedRoomId;

          // Swap logic: if targeted room is occupied by another roommate, move that roommate to assigner's previous room
          const updatedRoommates = roommates3B.map((rm) => {
            if (rm.id === roommateId) {
              return { ...rm, assignedRoomId: roomId };
            }
            if (rm.assignedRoomId === roomId) {
              return { ...rm, assignedRoomId: previousRoomId };
            }
            return rm;
          });

          const newRentResult = calculateFairRentSplit(totalApartmentRent, rooms3B, updatedRoommates);
          if (!newRentResult.isValid) return;

          const finalRoommates = updatedRoommates.map((rm) => {
            const price = newRentResult.assignments.find((a) => a.roommateId === rm.id)?.calculatedPrice || rm.calculatedPrice;
            return { ...rm, calculatedPrice: price };
          });

          logAnalyticsEvent("roommate_assigned", { roommateId, roomId });
          set({ roommates3B: finalRoommates, rentResult: newRentResult });
        },

        gameAnswers: { 1: "write-chat", 2: "warned", 3: "common-budget", 4: "headphones", 5: "agreed-hours" },
        gameStepIndex: 0,

        setGameAnswer: (situationId, optionId) => {
          set((state) => {
            const newAnswers = { ...state.gameAnswers, [situationId]: optionId };
            const newCompat = calculateMultiAxisCompatibility(newAnswers);
            return { gameAnswers: newAnswers, compatibilityResult: newCompat };
          });
        },

        setGameStepIndex: (idx) => set({ gameStepIndex: idx }),
        resetGame: () => set({ gameAnswers: {}, gameStepIndex: 0, compatibilityResult: calculateMultiAxisCompatibility({}) }),

        compatibilityResult: initialCompatibility,
        aiVerdict: null,

        loadAIVerdict: async () => {
          const { roommates3B, rooms3B, gameAnswers, compatibilityResult } = get();
          const provider = new ResilientConciergeProvider();

          const context = {
            roommates: roommates3B.map((rm) => {
              const room = rooms3B.find((r) => r.id === rm.assignedRoomId);
              return { name: rm.name, role: rm.role, roomName: room?.name || "Спальня", price: rm.calculatedPrice };
            }),
            answers: gameAnswers,
            compatibilityScore: compatibilityResult.overallScore,
          };

          const verdict = await provider.generateVerdict(context);
          logAnalyticsEvent("ai_verdict_viewed", { score: verdict.score });
          set({ aiVerdict: verdict });
          return verdict;
        },

        getSelectedBuilding: () => {
          const { selectedBuildingId } = get();
          return MOCK_BUILDINGS.find((b) => b.id === selectedBuildingId) || MOCK_BUILDINGS[0];
        },
      };
    },
    {
      name: "sosedi-commercial-3d-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? sessionStorage : memoryStorage)),
    }
  )
);
