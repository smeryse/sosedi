export interface Roommate {
  id: string;
  name: string;
  age: number;
  job: string;
  budget: number;
  district: string;
  compatibility: number;
  image: string;
  traits: string[];
  bio?: string;
  sleepHabit?: string;
  smokingHabit?: string;
  workStyle?: string;
  petsHabit?: string;
  isFavorite?: boolean;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  district: string;
  price: number;
  rooms: number;
  area: number;
  floor: string;
  image: string;
  match: number;
  photosCount: number;
  tags: string[];
  cianUrl?: string;
  description?: string;
  ownerName?: string;
  ownerPhone?: string;
  amenities?: string[];
  isFavorite?: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  job: string;
  role: string;
  compatibility: number;
}

export interface CoLivingGroup {
  id: string;
  name: string;
  status: 'forming' | 'ready' | 'application_sent' | 'under_review';
  members: GroupMember[];
  targetBudget: number;
  currentTotalBudget: number;
  moveInDate: string;
  compatibilityScore: number;
  targetPropertyTitle?: string;
}

export interface QuizQuestion {
  id: number;
  key: string;
  category: 'Быт' | 'Режим' | 'Общение' | 'Финансы' | 'Гости';
  question: string;
  subtitle?: string;
  options: {
    label: string;
    value: string;
    description?: string;
  }[];
}

export interface SharedExpense {
  id: string;
  title: string;
  category: 'Аренда' | 'Коммуналка' | 'Продукты' | 'Бытовые мелочи';
  totalAmount: number;
  paidBy: string;
  date: string;
  shares: {
    memberName: string;
    amount: number;
    isPaid: boolean;
  }[];
}

export interface ChoreTask {
  id: string;
  zone: 'Кухня' | 'Ванная' | 'Гостиная' | 'Мусор & Коридор';
  assignee: string;
  dueDate: string;
  isCompleted: boolean;
  frequency: 'Ежедневно' | 'Еженедельно';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  isMe: boolean;
  type?: 'text' | 'property' | 'system' | 'expense';
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  groupName: string;
  status: 'draft' | 'sent' | 'viewing' | 'approved' | 'declined';
  sentAt: string;
  viewingSlot?: string;
}
