"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { createClient } from "@/lib/supabase/client";
import { cn, hasEnvVars } from "@/lib/utils";

interface AuthScreenProps {
  initialMode?: "login" | "signup";
}

export function AuthScreen({ initialMode = "login" }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (password !== repeatPassword) {
        setError("Пароли не совпадают.");
        return;
      }
      if (password.length < 8) {
        setError("Пароль должен содержать не менее 8 символов.");
        return;
      }
      if (!acceptTerms) {
        setError("Необходимо согласиться с правилами сервиса.");
        return;
      }
    }

    setLoading(true);

    if (!hasEnvVars) {
      // Demo Mode fallback
      setTimeout(() => {
        router.push("/app");
      }, 400);
      return;
    }

    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push("/app");
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (authError) throw authError;
        router.push("/auth/sign-up-success");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Ошибка авторизации.");
      } else {
        setError("Произошла неизвестная ошибка.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="grid min-h-[720px] w-full grid-cols-1 overflow-hidden rounded-[28px] border border-[#E5E5E0] bg-white shadow-xl lg:grid-cols-12">
        {/* Left Hero Panel */}
        <div className="relative min-h-[380px] overflow-hidden bg-[#111111] p-6 sm:p-10 lg:col-span-6 lg:min-h-[720px] xl:col-span-6">
          {/* Background Image & Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{ backgroundImage: "url('/brand/auth-hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />

          {/* Header Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-[26px] font-black tracking-tight text-white">
                соседи
              </span>
              <span className="h-2 w-2 rounded-full bg-[#B3DB00]" />
            </Link>
          </div>

          {/* Bottom Hero Content */}
          <div className="absolute bottom-6 left-6 right-6 z-10 sm:bottom-10 sm:left-10 sm:right-10">
            <h1 className="text-2xl font-extrabold leading-[1.2] text-white sm:text-3xl lg:text-[34px] xl:text-[38px]">
              Хорошие соседи — лучшее решение
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-white/80 sm:text-sm lg:max-w-[440px]">
              Подбираем совместимых людей, жильё и условия, чтобы совместная жизнь была комфортной.
            </p>

            {/* Social Proof */}
            <div className="mt-6 flex items-center gap-3 border-t border-white/15 pt-5">
              <div className="flex -space-x-2.5">
                <AvatarImage
                  src="/demo/people/maria.jpg"
                  name="Мария"
                  size={36}
                  className="size-[36px] ring-2 ring-black"
                />
                <AvatarImage
                  src="/demo/people/ekaterina.jpg"
                  name="Екатерина"
                  size={36}
                  className="size-[36px] ring-2 ring-black"
                />
                <AvatarImage
                  src="/demo/people/artem.jpg"
                  name="Артём"
                  size={36}
                  className="size-[36px] ring-2 ring-black"
                />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-white">
                  12 500+ человек
                </p>
                <p className="text-[11px] font-medium text-white/70">
                  уже нашли своих соседей
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form Area */}
        <div className="flex flex-col justify-between bg-[#FAFAFA] p-6 sm:p-8 lg:col-span-6 lg:p-10 xl:col-span-6">
          {/* Top Help Link */}
          <div className="flex justify-end">
            <Link
              href="/faq"
              className="text-[12px] font-semibold text-[#6B6F66] transition-colors hover:text-[#111111]"
            >
              Нужна помощь?
            </Link>
          </div>

          {/* Main Auth Form Container */}
          <div className="mx-auto my-auto w-full max-w-[430px] space-y-6 py-4">
            {/* Title & Subtitle */}
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#111111] sm:text-3xl">
                Добро пожаловать
              </h2>
              <p className="mt-1 text-[13px] font-medium text-[#6B6F66]">
                Войдите в аккаунт или создайте новый
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="grid grid-cols-2 rounded-[18px] bg-[#EAEAEA] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={cn(
                  "h-10 rounded-[14px] text-[13px] font-extrabold transition-all duration-200",
                  mode === "login"
                    ? "bg-white text-[#111111] shadow-sm"
                    : "text-[#6B6F66] hover:text-[#111111]",
                )}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={cn(
                  "h-10 rounded-[14px] text-[13px] font-extrabold transition-all duration-200",
                  mode === "signup"
                    ? "bg-white text-[#111111] shadow-sm"
                    : "text-[#6B6F66] hover:text-[#111111]",
                )}
              >
                Регистрация
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-[#111111]">
                    Имя
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Иван Иванов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#E2E2DC] bg-[#F5F5F2] px-4 text-[13px] font-medium text-[#111111] outline-none transition-all focus:border-[#B3DB00] focus:bg-white placeholder:text-[#9A9B93]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-[#111111]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-[16px] border border-[#E2E2DC] bg-[#F5F5F2] px-4 text-[13px] font-medium text-[#111111] outline-none transition-all focus:border-[#B3DB00] focus:bg-white placeholder:text-[#9A9B93]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-[#111111]">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder={
                      mode === "login" ? "Введите пароль" : "Придумайте пароль"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#E2E2DC] bg-[#F5F5F2] pl-4 pr-11 text-[13px] font-medium text-[#111111] outline-none transition-all focus:border-[#B3DB00] focus:bg-white placeholder:text-[#9A9B93]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#878881] hover:text-[#111111]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-[#111111]">
                    Повторите пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showRepeatPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Повторите пароль"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="h-12 w-full rounded-[16px] border border-[#E2E2DC] bg-[#F5F5F2] pl-4 pr-11 text-[13px] font-medium text-[#111111] outline-none transition-all focus:border-[#B3DB00] focus:bg-white placeholder:text-[#9A9B93]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#878881] hover:text-[#111111]"
                    >
                      {showRepeatPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Options row */}
              {mode === "login" ? (
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-[#D0D0CA] text-[#B3DB00] accent-[#B3DB00]"
                    />
                    <span className="text-[12px] font-medium text-[#444540]">
                      Запомнить меня
                    </span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[12px] font-semibold text-[#6B6F66] hover:text-[#111111]"
                  >
                    Забыли пароль?
                  </Link>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="inline-flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-[#D0D0CA] text-[#B3DB00] accent-[#B3DB00]"
                    />
                    <span className="text-[11.5px] leading-tight font-medium text-[#444540]">
                      Я соглашаюсь с{" "}
                      <Link href="/safety" className="font-bold text-[#7B9E00] hover:underline">
                        правилами сервиса
                      </Link>{" "}
                      и{" "}
                      <Link href="/safety" className="font-bold text-[#7B9E00] hover:underline">
                        политикой конфиденциальности
                      </Link>
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-[12px] font-bold text-red-600">
                  {error}
                </p>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex h-13 w-full items-center justify-center rounded-full bg-[#B3DB00] px-6 text-[14px] font-extrabold text-[#111111] transition-all duration-200 hover:bg-[#A5CB00] active:scale-[0.99] disabled:opacity-70"
              >
                <span>
                  {loading
                    ? "Загрузка..."
                    : mode === "login"
                      ? "Войти в аккаунт"
                      : "Создать аккаунт"}
                </span>
                <span className="absolute right-2.5 grid size-9 place-items-center rounded-full bg-[#111111] text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" />
                </span>
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E2DC]" />
              </div>
              <span className="relative bg-[#FAFAFA] px-3 text-[11px] font-semibold text-[#878881]">
                или продолжить с
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/app")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E2E2DC] bg-white text-[12px] font-extrabold text-[#111111] shadow-sm transition-colors hover:bg-[#F5F5F2]"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => router.push("/app")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E2E2DC] bg-white text-[12px] font-extrabold text-[#111111] shadow-sm transition-colors hover:bg-[#F5F5F2]"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.98.04-2.17.65-2.88 1.48-.63.73-1.19 1.9-.1 3.04 1.1.09 2.21-.57 2.89-1.42z" />
                </svg>
                Apple
              </button>

              <button
                type="button"
                onClick={() => router.push("/app")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E2E2DC] bg-white text-[12px] font-extrabold text-[#111111] shadow-sm transition-colors hover:bg-[#F5F5F2]"
              >
                <svg className="size-4 fill-[#0077FF]" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.644c-.624 0-.816-.495-1.936-1.616-1.008-.984-1.456-1.112-1.704-1.112-.344 0-.448.096-.448.56v1.448c0 .4-.128.648-1.2.648-1.776 0-3.752-1.08-5.144-3.088-2.104-2.984-2.672-5.224-2.672-5.68 0-.248.096-.48.56-.48h1.644c.416 0 .568.192.728.648.792 2.296 2.128 4.304 2.68 4.304.208 0 .312-.096.312-.624V9.672c-.064-1.128-.656-1.224-.656-1.632 0-.2.168-.4.432-.4h2.712c.36 0 .488.192.488.608v3.272c0 .352.152.48.256.48.208 0 .384-.128.768-.512 1.184-1.328 2.032-3.376 2.032-3.376.112-.248.312-.4.728-.4h1.644c.488 0 .6.248.488.608-.2.92-2.144 3.704-2.144 3.704-.176.272-.248.4 0 .736.176.248.744.728 1.128 1.176.704.792 1.24 1.456 1.384 1.912.136.456-.08.696-.536.696z" />
                </svg>
                VK
              </button>
            </div>

            {/* Bottom Callout Card */}
            <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-[22px] bg-[#EFEFEA] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[13px] font-extrabold text-[#111111]">
                  {mode === "login"
                    ? "Ещё нет аккаунта?"
                    : "Уже есть аккаунт?"}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-[#6B6F66]">
                  {mode === "login"
                    ? "Создайте профиль и начните поиск идеальных соседей уже сегодня."
                    : "Войдите в систему для доступа к вашим диалогам и группам."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                }}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-[11.5px] font-extrabold text-[#111111] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {mode === "login" ? "Создать профиль" : "Войти"}
                <ArrowRight className="size-3.5 text-[#111111]" />
              </button>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] font-medium text-[#878881]">
            © {new Date().getFullYear()} Соседи · Платформа безопасной совместной аренды
          </div>
        </div>
      </div>
    </div>
  );
}
