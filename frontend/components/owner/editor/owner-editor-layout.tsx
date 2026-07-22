"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Square,
  DoorClosed,
  Bed,
  Ruler,
  Undo2,
  Redo2,
  Save,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OwnerEditorTool = "select" | "wall" | "door" | "window" | "furniture" | "measure";

interface OwnerEditorLayoutProps {
  propertyName: string;
  onBack: () => void;
  activeTool: OwnerEditorTool;
  setActiveTool: (tool: OwnerEditorTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
  children: React.ReactNode;
}

export function OwnerEditorLayout({
  propertyName,
  onBack,
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onPublish,
  children,
}: OwnerEditorLayoutProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const handleSave = () => {
    setSaveStatus("saving");
    onSave();
    setTimeout(() => setSaveStatus("saved"), 600);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 text-white font-sans flex flex-col select-none overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>{propertyName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                Редактор собственника
              </span>
            </h1>
            <span className="text-[11px] text-slate-400">Планировка и размеры помещений</span>
          </div>
        </div>

        {/* Plan mode status */}
        <div className="flex bg-slate-800 p-1 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-extrabold text-[#CCFF00] items-center gap-1.5 shadow-sm">
          <Eye className="size-4 text-[#CCFF00]" />
          <span>Планировка 2D</span>
        </div>

        {/* Right Actions (Undo/Redo, Save, Publish) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Отменить (Undo)"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Повторить (Redo)"
            >
              <Redo2 className="size-4" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Save className="size-3.5 text-blue-400" />
            <span>{saveStatus === "saving" ? "Сохранение..." : "Черновик"}</span>
          </button>

          <button
            onClick={onPublish}
            className="px-3.5 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-xs font-extrabold text-gray-900 flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Sparkles className="size-3.5" />
            <span>Сохранить план</span>
          </button>
        </div>
      </header>

      {/* Main Canvas + Left Toolbar Container */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Vertical Tool Palette */}
        <aside className="w-16 bg-slate-900/95 border-r border-slate-800 p-2 flex flex-col gap-2 z-30">
          {[
            { id: "select", label: "Выбор", icon: ArrowLeft },
            { id: "wall", label: "Стена", icon: Square },
            { id: "door", label: "Дверь", icon: DoorClosed },
            { id: "furniture", label: "Мебель", icon: Bed },
            { id: "measure", label: "Замер", icon: Ruler },
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as OwnerEditorTool)}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 rounded-xl text-[10px] font-bold gap-1 transition-all border",
                  isActive
                    ? "bg-[#CCFF00] text-gray-900 border-[#CCFF00] shadow-md"
                    : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Viewport Render Area */}
        <main className="relative flex-1 bg-slate-950 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
