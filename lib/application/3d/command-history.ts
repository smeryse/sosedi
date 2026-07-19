export interface Command<T> {
  id: string;
  description: string;
  timestamp: number;
  execute(state: T): T;
  undo(state: T): T;
}

export class CommandHistoryManager<T> {
  private undoStack: Command<T>[] = [];
  private redoStack: Command<T>[] = [];
  private maxCapacity: number;
  private batchCommands: Command<T>[] | null = null;

  constructor(maxCapacity = 50) {
    this.maxCapacity = maxCapacity;
  }

  public execute(command: Command<T>, currentState: T): T {
    if (this.batchCommands) {
      this.batchCommands.push(command);
      return command.execute(currentState);
    }

    const newState = command.execute(currentState);
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxCapacity) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo stack on new action
    return newState;
  }

  public startBatch(): void {
    this.batchCommands = [];
  }

  public commitBatch(batchDescription = "Batch Action", currentState: T): T {
    if (!this.batchCommands || this.batchCommands.length === 0) {
      this.batchCommands = null;
      return currentState;
    }

    const commandsToGroup = [...this.batchCommands];
    this.batchCommands = null;

    const compositeCommand: Command<T> = {
      id: `batch-${Date.now()}`,
      description: batchDescription,
      timestamp: Date.now(),
      execute: (state: T) => {
        return commandsToGroup.reduce((acc, cmd) => cmd.execute(acc), state);
      },
      undo: (state: T) => {
        return [...commandsToGroup].reverse().reduce((acc, cmd) => cmd.undo(acc), state);
      },
    };

    this.undoStack.push(compositeCommand);
    if (this.undoStack.length > this.maxCapacity) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    return currentState;
  }

  public cancelBatch(): void {
    this.batchCommands = null;
  }

  public undo(currentState: T): { newState: T; undoneCommand: Command<T> | null } {
    if (!this.canUndo) return { newState: currentState, undoneCommand: null };

    const command = this.undoStack.pop()!;
    const newState = command.undo(currentState);
    this.redoStack.push(command);
    return { newState, undoneCommand: command };
  }

  public redo(currentState: T): { newState: T; redoneCommand: Command<T> | null } {
    if (!this.canRedo) return { newState: currentState, redoneCommand: null };

    const command = this.redoStack.pop()!;
    const newState = command.execute(currentState);
    this.undoStack.push(command);
    return { newState, redoneCommand: command };
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.batchCommands = null;
  }
}
