import { useState, useEffect } from 'react';
import { Roommate, Property, CoLivingGroup, SharedExpense, ChoreTask, ChatMessage, RentalApplication } from '../types';
import { mockRoommates as initialRoommates, mockProperties as initialProperties, mockGroup as initialGroup, mockExpenses as initialExpenses, mockChores as initialChores, mockChats as initialChats } from './mockData';
import { PEOPLE_IMAGES } from './peopleAssets';

// Simple pub-sub mechanism for reactive global state
class GlobalStateStore {
  private listeners: Set<() => void> = new Set();

  public roommates: Roommate[] = [...initialRoommates];
  public properties: Property[] = [...initialProperties];
  public group: CoLivingGroup = { ...initialGroup };
  public expenses: SharedExpense[] = [...initialExpenses];
  public chores: ChoreTask[] = [...initialChores];
  public chats: ChatMessage[] = [...initialChats];
  public answers: Record<string, string> = {};
  public isQuizCompleted: boolean = false;
  public applications: RentalApplication[] = [
    { id: '34872', propertyId: 'center-loft', groupName: 'Квартира в центре', status: 'viewing', sentAt: '12 мая 2026' },
  ];

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Actions
  public addExpense(title: string, category: 'Аренда' | 'Коммуналка' | 'Продукты' | 'Бытовые мелочи', amount: number, paidBy: string) {
    const shareAmount = Math.round(amount / 3);
    const newExpense: SharedExpense = {
      id: `exp-${Date.now()}`,
      title,
      category,
      totalAmount: amount,
      paidBy,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      shares: [
        { memberName: 'Мария К.', amount: shareAmount, isPaid: paidBy === 'Мария К.' },
        { memberName: 'Артём С.', amount: shareAmount, isPaid: paidBy === 'Артём С.' },
        { memberName: 'Екатерина В.', amount: shareAmount, isPaid: paidBy === 'Екатерина В.' },
      ],
    };
    this.expenses = [newExpense, ...this.expenses];
    
    // Auto-add system message in chat about this expense
    this.addSystemMessage(`Опубликован новый общий счёт: «${title}» на сумму ${amount.toLocaleString('ru-RU')} ₽.`);
    this.notify();
  }

  public toggleExpensePaid(expenseId: string, memberName: string) {
    this.expenses = this.expenses.map((exp) => {
      if (exp.id === expenseId) {
        return {
          ...exp,
          shares: exp.shares.map((s) =>
            s.memberName === memberName ? { ...s, isPaid: !s.isPaid } : s
          ),
        };
      }
      return exp;
    });
    this.notify();
  }

  public addChore(zone: 'Кухня' | 'Ванная' | 'Гостиная' | 'Мусор & Коридор', assignee: string, frequency: 'Ежедневно' | 'Еженедельно') {
    const newChore: ChoreTask = {
      id: `chore-${Date.now()}`,
      zone,
      assignee,
      dueDate: frequency === 'Ежедневно' ? 'Каждый день' : 'В течение недели',
      isCompleted: false,
      frequency,
    };
    this.chores = [...this.chores, newChore];
    this.notify();
  }

  public toggleChoreCompleted(id: string) {
    this.chores = this.chores.map((c) =>
      c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
    );
    this.notify();
  }

  public sendChatMessage(text: string, senderId = 'me', senderName = 'Артём С.', isMe = true) {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderAvatar: isMe ? PEOPLE_IMAGES.artem : PEOPLE_IMAGES.maria,
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMe,
    };
    this.chats = [...this.chats, newMsg];
    this.notify();
  }

  public addSystemMessage(text: string) {
    const newMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'ИИ-Ассистент Соседей 🤖',
      senderAvatar: '',
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMe: false,
      type: 'system',
    };
    this.chats = [...this.chats, newMsg];
    this.notify();
  }

  public inviteRoommate(roommateId: string) {
    const roommate = this.roommates.find((r) => r.id === roommateId);
    if (!roommate) return;

    // Check if already in group
    const isMember = this.group.members.some((m) => m.id === roommateId);
    if (isMember) return;

    const newMember = {
      id: roommate.id,
      name: `${roommate.name} ${roommate.name.endsWith('а') ? 'В.' : 'С.'}`,
      avatar: roommate.image,
      job: roommate.job,
      role: 'Участник',
      compatibility: roommate.compatibility,
    };

    this.group = {
      ...this.group,
      members: [...this.group.members, newMember],
      currentTotalBudget: this.group.currentTotalBudget + roommate.budget,
    };

    this.addSystemMessage(`${roommate.name} добавлен(а) в группу сожительства.`);
    this.notify();
  }

  public submitGroupApplication() {
    this.group = {
      ...this.group,
      status: 'under_review',
    };
    this.addSystemMessage('Совместная заявка отправлена собственнику квартиры. Ожидайте ответа в чате.');
    if (!this.applications.some((application) => application.propertyId === this.properties[0]?.id)) {
      this.applications = [{ id: String(Date.now()).slice(-5), propertyId: this.properties[0]?.id ?? 'center-loft', groupName: this.group.name, status: 'sent', sentAt: 'Сегодня' }, ...this.applications];
    }
    this.notify();
  }

  public createGroup(name: string, targetBudget: number, moveInDate: string) {
    this.group = { ...this.group, name, targetBudget, moveInDate, status: 'forming' };
    this.addSystemMessage(`Создана группа «${name}». Можно приглашать участников.`);
    this.notify();
  }

  public replaceGroupMember(memberId: string, roommateId: string) {
    const roommate = this.roommates.find((person) => person.id === roommateId);
    if (!roommate) return;
    this.group = {
      ...this.group,
      members: this.group.members.map((member) => member.id === memberId ? {
        id: roommate.id,
        name: roommate.name,
        avatar: roommate.image,
        job: roommate.job,
        role: 'Участник',
        compatibility: roommate.compatibility,
      } : member),
    };
    this.addSystemMessage(`${roommate.name} теперь участвует в группе.`);
    this.notify();
  }

  public chooseViewing(applicationId: string, slot: string) {
    this.applications = this.applications.map((application) => application.id === applicationId ? { ...application, status: 'viewing', viewingSlot: slot } : application);
    this.addSystemMessage(`Просмотр подтверждён: ${slot}.`);
    this.notify();
  }

  public completeQuiz(answers: Record<string, string>) {
    this.answers = answers;
    this.isQuizCompleted = true;
    // Boost matching percentages slightly to simulate calculation
    this.roommates = this.roommates.map((r) => ({
      ...r,
      compatibility: Math.min(100, r.compatibility + Math.round(Math.random() * 4)),
    }));
    this.addSystemMessage('Вы успешно заполнили анкету совместимости. Алгоритм «Соседи» обновил подборку кандидатов.');
    this.notify();
  }

  public toggleFavoriteProperty(propertyId: string) {
    this.properties = this.properties.map((property) =>
      property.id === propertyId
        ? { ...property, isFavorite: !property.isFavorite }
        : property
    );
    this.notify();
  }

  public toggleFavoriteRoommate(roommateId: string) {
    this.roommates = this.roommates.map((roommate) =>
      roommate.id === roommateId
        ? { ...roommate, isFavorite: !roommate.isFavorite }
        : roommate
    );
    this.notify();
  }
}

export const store = new GlobalStateStore();

// React hook to use store values
export function useGlobalState() {
  const [roommates, setRoommates] = useState(store.roommates);
  const [properties, setProperties] = useState(store.properties);
  const [group, setGroup] = useState(store.group);
  const [expenses, setExpenses] = useState(store.expenses);
  const [chores, setChores] = useState(store.chores);
  const [chats, setChats] = useState(store.chats);
  const [isQuizCompleted, setIsQuizCompleted] = useState(store.isQuizCompleted);
  const [applications, setApplications] = useState(store.applications);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setRoommates(store.roommates);
      setProperties(store.properties);
      setGroup(store.group);
      setExpenses(store.expenses);
      setChores(store.chores);
      setChats(store.chats);
      setIsQuizCompleted(store.isQuizCompleted);
      setApplications([...store.applications]);
    });
    return unsubscribe;
  }, []);

  return {
    roommates,
    properties,
    group,
    expenses,
    chores,
    chats,
    isQuizCompleted,
    applications,
    addExpense: (title: string, category: 'Аренда' | 'Коммуналка' | 'Продукты' | 'Бытовые мелочи', amount: number, paidBy: string) => store.addExpense(title, category, amount, paidBy),
    toggleExpensePaid: (expenseId: string, memberName: string) => store.toggleExpensePaid(expenseId, memberName),
    addChore: (zone: 'Кухня' | 'Ванная' | 'Гостиная' | 'Мусор & Коридор', assignee: string, frequency: 'Ежедневно' | 'Еженедельно') => store.addChore(zone, assignee, frequency),
    toggleChoreCompleted: (id: string) => store.toggleChoreCompleted(id),
    sendChatMessage: (text: string) => store.sendChatMessage(text),
    inviteRoommate: (roommateId: string) => store.inviteRoommate(roommateId),
    submitGroupApplication: () => store.submitGroupApplication(),
    createGroup: (name: string, targetBudget: number, moveInDate: string) => store.createGroup(name, targetBudget, moveInDate),
    replaceGroupMember: (memberId: string, roommateId: string) => store.replaceGroupMember(memberId, roommateId),
    chooseViewing: (applicationId: string, slot: string) => store.chooseViewing(applicationId, slot),
    completeQuiz: (answers: Record<string, string>) => store.completeQuiz(answers),
    toggleFavoriteProperty: (propertyId: string) => store.toggleFavoriteProperty(propertyId),
    toggleFavoriteRoommate: (roommateId: string) => store.toggleFavoriteRoommate(roommateId),
  };
}
