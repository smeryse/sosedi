import { describe, it, expect, beforeEach } from "vitest";
import { CommandHistoryManager, Command } from "./command-history";

interface CounterState {
  count: number;
}

describe("CommandHistoryManager", () => {
  let manager: CommandHistoryManager<CounterState>;
  let initialState: CounterState;

  beforeEach(() => {
    manager = new CommandHistoryManager<CounterState>(10);
    initialState = { count: 0 };
  });

  it("should execute and undo a command", () => {
    const addFiveCommand: Command<CounterState> = {
      id: "cmd-1",
      description: "Add 5",
      timestamp: Date.now(),
      execute: (state) => ({ count: state.count + 5 }),
      undo: (state) => ({ count: state.count - 5 }),
    };

    const state1 = manager.execute(addFiveCommand, initialState);
    expect(state1.count).toBe(5);
    expect(manager.canUndo).toBe(true);

    const { newState: state2 } = manager.undo(state1);
    expect(state2.count).toBe(0);
    expect(manager.canRedo).toBe(true);

    const { newState: state3 } = manager.redo(state2);
    expect(state3.count).toBe(5);
  });

  it("should support transaction batching for drag operations", () => {
    manager.startBatch();

    const cmd1: Command<CounterState> = {
      id: "drag-1",
      description: "Move 1",
      timestamp: Date.now(),
      execute: (s) => ({ count: s.count + 1 }),
      undo: (s) => ({ count: s.count - 1 }),
    };

    const cmd2: Command<CounterState> = {
      id: "drag-2",
      description: "Move 2",
      timestamp: Date.now(),
      execute: (s) => ({ count: s.count + 2 }),
      undo: (s) => ({ count: s.count - 2 }),
    };

    let state = manager.execute(cmd1, initialState);
    state = manager.execute(cmd2, state);

    state = manager.commitBatch("Batch Drag Action", state);
    expect(state.count).toBe(3);

    const { newState: undone } = manager.undo(state);
    expect(undone.count).toBe(0); // Batch undone in single operation
  });
});
