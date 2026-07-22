"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALL_DISMISSED_KEY = "sosedi-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function wasInstallDismissed() {
  try {
    return window.sessionStorage.getItem(INSTALL_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberInstallDismissal() {
  try {
    window.sessionStorage.setItem(INSTALL_DISMISSED_KEY, "true");
  } catch {
    // Installation can still be dismissed when storage is unavailable.
  }
}

export function PwaManager() {
  const [online, setOnline] = useState(true);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setOnline(window.navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();

      if (!isStandalone() && !wasInstallDismissed()) {
        setInstallPrompt(promptEvent);
      }
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    let removeLoadListener: (() => void) | undefined;

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/", updateViaCache: "none" })
          .catch(() => undefined);
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
        removeLoadListener = () => window.removeEventListener("load", register);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      removeLoadListener?.();
    };
  }, []);

  const dismissInstall = () => {
    rememberInstallDismissal();
    setInstallPrompt(null);
  };

  const install = async () => {
    const prompt = installPrompt;
    if (!prompt) return;

    setInstallPrompt(null);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "dismissed") {
        rememberInstallDismissal();
      }
    } catch {
      rememberInstallDismissal();
    }
  };

  if (!online) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-24 left-4 z-[70] flex min-h-11 items-center gap-2 rounded-full bg-[#111111] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_40px_rgba(17,17,17,0.22)] lg:bottom-6 lg:left-6"
      >
        <WifiOff className="size-4 text-[#D6FF3F]" aria-hidden="true" />
        Нет сети. Новые данные загрузятся после восстановления подключения.
      </div>
    );
  }

  if (!installPrompt) return null;

  return (
    <aside
      aria-label="Установка приложения"
      className="fixed bottom-24 left-4 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-[20px] border border-black/10 bg-[#FFFFFC]/95 p-2 pl-4 text-[#111111] shadow-[0_18px_50px_rgba(17,17,17,0.16)] backdrop-blur-xl lg:bottom-6 lg:left-6"
    >
      <Download className="size-4 shrink-0 text-[#7B9E00]" aria-hidden="true" />
      <p className="hidden text-xs font-bold sm:block">Установить «Соседи»</p>
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-11 items-center rounded-full bg-[#D6FF3F] px-4 text-xs font-black transition hover:bg-[#C9F238]"
      >
        Установить
      </button>
      <button
        type="button"
        onClick={dismissInstall}
        aria-label="Скрыть предложение"
        className="grid size-11 shrink-0 place-items-center rounded-full text-black/55 transition hover:bg-black/5 hover:text-black"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </aside>
  );
}
