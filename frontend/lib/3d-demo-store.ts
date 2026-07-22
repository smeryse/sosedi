import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_BUILDINGS, CityBuilding, GAME_SITUATIONS } from "./3d-demo-data";

export interface RoomDefinition3B {
  id: string;
  name: string;
  areaM2: number;
  type: "private" | "common";
  hasBalcony?: boolean;
  hasWorkplace?: boolean;
  hasPrivateBath?: boolean;
  windowSize: "large" | "medium" | "standard";
  noiseLevel: "quiet" | "moderate";
  weight: number;
}

export interface RoommateAssignment3B {
  id: string;
  name: string;
  avatar: string;
  role: string;
  roomId: string; // "room-master" | "room-[#2]" | "room-[#3]"
  assignedPrice: number;
}

interface ThreeDemoState {
  // Navigation
  activeStep: 1 | 2 | 3 | 4 | 5;
  setActiveStep: (step: 1 | 2 | 3 | 4 | 5) => void;

  // Screen 1: Search & Map
  selectedBuildingId: string;
  setSelectedBuildingId: (id: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  maxTime: number;
  setMaxTime: (val: number) => void;
  peopleFilter: string;
  setPeopleFilter: (val: string) => void;

  // Screen 2: Quality of Life
  activeQualityMode: "transport" | "comfort" | "neighbors";
  setActiveQualityMode: (mode: "transport" | "comfort" | "neighbors") => void;

  // Screen 3: Apartment Tour
  activeRoomId: "living" | "kitchen" | "bedroom";
  setActiveRoomId: (room: "living" | "kitchen" | "bedroom") => void;
  isMeasuring: boolean;
  setIsMeasuring: (val: boolean | ((prev: boolean) => boolean)) => void;
  isDay: boolean;
  setIsDay: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Screen 4: 3-Bedroom Assignment & Calculation
  totalApartmentRent: number;
  rooms3B: RoomDefinition3B[];
  roommates3B: RoommateAssignment3B[];
  assignRoommateToRoom: (roommateId: string, roomId: string) => void;

  // Screen 5: Mini-game & AI Concierge
  gameAnswers: Record<number, string>;
  gameStepIndex: number;
  setGameAnswer: (situationId: number, optionId: string) => void;
  setGameStepIndex: (idx: number) => void;
  resetGame: () => void;
  calculateCompatibility: () => {
    score: number;
    advice: string;
    highlights: string[];
  };

  // Helper getters
  getSelectedBuilding: () => CityBuilding;
}

const DEFAULT_ROOMS_3B: RoomDefinition3B[] = [
  {
    id: "room-master",
    name: "Главная спальня",
    areaM2: 22,
    type: "private",
    hasBalcony: true,
    windowSize: "large",
    noiseLevel: "quiet",
    weight: 22 + 4, // 26
  },
  {
    id: "room-second",
    name: "Вторая спальня",
    areaM2: 18,
    type: "private",
    hasWorkplace: true,
    windowSize: "medium",
    noiseLevel: "moderate",
    weight: 18 + 2, // 20
  },
  {
    id: "room-third",
    name: "Уютная спальня",
    areaM2: 14,
    type: "private",
    windowSize: "standard",
    noiseLevel: "quiet",
    weight: 14, // 14
  },
  {
    id: "room-living-shared",
    name: "Просторная гостиная",
    areaM2: 24,
    type: "common",
    windowSize: "large",
    noiseLevel: "moderate",
    weight: 0,
  },
  {
    id: "room-kitchen-shared",
    name: "Кухня",
    areaM2: 14,
    type: "common",
    windowSize: "medium",
    noiseLevel: "moderate",
    weight: 0,
  },
  {
    id: "room-bath-shared",
    name: "Ванная комната",
    areaM2: 8,
    type: "common",
    windowSize: "standard",
    noiseLevel: "quiet",
    weight: 0,
  },
];

const DEFAULT_ROOMMATES_3B: RoommateAssignment3B[] = [
  {
    id: "roman",
    name: "Роман",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "Дизайнер",
    roomId: "room-master",
    assignedPrice: 17333,
  },
  {
    id: "ilya",
    name: "Илья",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Разработчик",
    roomId: "room-second",
    assignedPrice: 13333,
  },
  {
    id: "arina",
    name: "Арина",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    role: "Маркетолог",
    roomId: "room-third",
    assignedPrice: 9334,
  },
];

// Calculate dynamic prices for 3 private rooms so they sum strictly to totalApartmentRent (40 000 ₽)
function recalculatePrices(
  roommates: RoommateAssignment3B[],
  rooms: RoomDefinition3B[],
  totalRent: number
): RoommateAssignment3B[] {
  const privateRooms = rooms.filter((r) => r.type === "private");
  const totalWeight = privateRooms.reduce((sum, r) => sum + r.weight, 0);

  // Map room ID to proportional price
  const roomPrices: Record<string, number> = {};
  let currentSum = 0;

  privateRooms.forEach((room, idx) => {
    if (idx === privateRooms.length - 1) {
      // Last room gets remainder to ensure exact total match
      roomPrices[room.id] = Math.round(totalRent - currentSum);
    } else {
      const price = Math.round((room.weight / totalWeight) * totalRent);
      roomPrices[room.id] = price;
      currentSum += price;
    }
  });

  return roommates.map((rm) => ({
    ...rm,
    assignedPrice: roomPrices[rm.roomId] || Math.round(totalRent / 3),
  }));
}

export const useThreeDemoStore = create<ThreeDemoState>()(
  persist(
    (set, get) => ({
      activeStep: 1,
      setActiveStep: (step) => set({ activeStep: step }),

      selectedBuildingId: "stavropolskaya-123",
      setSelectedBuildingId: (id) => set({ selectedBuildingId: id }),

      maxPrice: 25000,
      setMaxPrice: (val) => set({ maxPrice: val }),

      maxTime: 18,
      setMaxTime: (val) => set({ maxTime: val }),

      peopleFilter: "2-4 человека",
      setPeopleFilter: (val) => set({ peopleFilter: val }),

      activeQualityMode: "neighbors",
      setActiveQualityMode: (mode) => set({ activeQualityMode: mode }),

      activeRoomId: "living",
      setActiveRoomId: (room) => set({ activeRoomId: room }),

      isMeasuring: true,
      setIsMeasuring: (val) =>
        set((state) => ({
          isMeasuring: typeof val === "function" ? val(state.isMeasuring) : val,
        })),

      isDay: true,
      setIsDay: (val) =>
        set((state) => ({
          isDay: typeof val === "function" ? val(state.isDay) : val,
        })),

      totalApartmentRent: 40000,
      rooms3B: DEFAULT_ROOMS_3B,
      roommates3B: recalculatePrices(DEFAULT_ROOMMATES_3B, DEFAULT_ROOMS_3B, 40000),

      assignRoommateToRoom: (roommateId, roomId) => {
        const { roommates3B, rooms3B, totalApartmentRent } = get();
        // Swap rooms if another roommate is currently in target room
        const updatedRoommates = roommates3B.map((rm) => {
          if (rm.id === roommateId) {
            return { ...rm, roomId };
          }
          if (rm.roomId === roomId) {
            const previousRoom = roommates3B.find((r) => r.id === roommateId)?.roomId || "room-master";
            return { ...rm, roomId: previousRoom };
          }
          return rm;
        });

        const calculated = recalculatePrices(updatedRoommates, rooms3B, totalApartmentRent);
        set({ roommates3B: calculated });
      },

      gameAnswers: { 1: "write-chat", 2: "warned", 3: "common-budget", 4: "headphones", 5: "agreed-hours" },
      gameStepIndex: 0,

      setGameAnswer: (situationId, optionId) =>
        set((state) => ({
          gameAnswers: { ...state.gameAnswers, [situationId]: optionId },
        })),

      setGameStepIndex: (idx) => set({ gameStepIndex: idx }),

      resetGame: () => set({ gameAnswers: {}, gameStepIndex: 0 }),

      calculateCompatibility: () => {
        const { gameAnswers } = get();
        let totalScore = 0;
        let count = 0;
        const highlights: string[] = [];

        GAME_SITUATIONS.forEach((sit) => {
          const answerId = gameAnswers[sit.id];
          const selectedOption = sit.options.find((opt) => opt.id === answerId);
          if (selectedOption) {
            totalScore += selectedOption.impact;
            count += 1;
          }
        });

        const avgScore = count > 0 ? Math.round(totalScore / count) : 85;

        // Custom advice based on specific answers
        let advice = "«Отличная уживаемость! Вы и ваши соседи гармонично подходите друг другу.»";
        if (gameAnswers[2] === "warned") {
          highlights.push("Гости по предварительному согласованию");
        } else if (gameAnswers[2] === "against") {
          highlights.push("Строгий тихий режим без вечерних гостей");
        }

        if (gameAnswers[1] === "schedule" || gameAnswers[1] === "write-chat") {
          highlights.push("Дисциплина и порядок на кухне");
        }

        if (gameAnswers[3] === "common-budget") {
          highlights.push("Общий бытовой бюджет для мелочей");
        }

        if (avgScore >= 90) {
          advice = "«Выдающийся результат! Ваша группа имеет высочайший потенциал комфортного совместного проживания без конфликтов.»";
        } else if (avgScore >= 80) {
          advice = "«Хороший баланс. Согласуйте правила приема гостей за 2 часа в общем чате до заселения.»";
        } else {
          advice = "«У вас есть различия в бытовых привычках. Рекомендуется обсудить график уборки и тихие часы до подписания договора.»";
        }

        return { score: avgScore, advice, highlights };
      },

      getSelectedBuilding: () => {
        const { selectedBuildingId } = get();
        return MOCK_BUILDINGS.find((b) => b.id === selectedBuildingId) || MOCK_BUILDINGS[0];
      },
    }),
    {
      name: "sosedi-3d-demo-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? sessionStorage : (null as unknown as Storage))),
    }
  )
);
