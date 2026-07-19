"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, HelpCircle, ShieldCheck, Sparkles } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { createClient } from "@/lib/supabase/client";
import { cn, hasEnvVars } from "@/lib/utils";

interface AuthScreenProps {
  initialMode?: "login" | "signup";
}

const inputClass =
  "h-12 w-full rounded-[14px] border border-black/10 bg-white px-4 text-sm font-medium text-[#111] outline-none transition placeholder:text-black/30 hover:border-black/20 focus:border-[#9FC900] focus:ring-4 focus:ring-[#B7EB00]/15 sm:h-[52px]";

export function AuthScreen({ initialMode = "login" }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => setMode(initialMode), [initialMode]);

  const changeMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setError(null);
    router.replace(nextMode === "login" ? "/auth/login" : "/auth/sign-up");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Пожалуйста, введите корректный адрес электронной почты.");
      return;
    }

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
      window.setTimeout(() => router.push("/app"), 350);
      return;
    }

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
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
    } catch {
      setError(
        mode === "login"
          ? "Не удалось войти. Проверьте email и пароль."
          : "Не удалось создать аккаунт. Попробуйте ещё раз.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-[#F6F5F1] p-3 text-[#111] sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100svh-24px)] w-full max-w-[1500px] gap-5 lg:min-h-[calc(100svh-56px)] lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <section className="relative min-h-[410px] overflow-hidden rounded-[28px] bg-black lg:min-h-[calc(100svh-56px)] lg:rounded-[32px]">
          <Image
            src="/brand/auth-hero.jpg"
            alt="Соседи проводят вечер вместе в квартире"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/25" />
          <div className="pointer-events-none absolute -bottom-32 -right-52 size-[360px] rounded-[110px] border-[34px] border-[#B7EB00] sm:size-[430px] sm:border-[40px] lg:-bottom-36 lg:-right-[290px]" />

          <Link
            href="/"
            aria-label="Соседи — главная"
            className="absolute left-7 top-7 z-10 font-heading text-[30px] font-bold tracking-[-0.05em] text-white sm:left-10 sm:top-9 sm:text-[34px]"
          >
            соседи<span className="text-[#B7EB00]">.</span>
          </Link>

          <div className="absolute inset-x-7 bottom-7 z-10 max-w-[650px] sm:inset-x-10 sm:bottom-10 lg:bottom-12 lg:left-12 lg:right-12">
            <h1 className="max-w-[620px] font-heading text-[clamp(2.3rem,4.2vw,4.35rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white">
              {isLogin ? (
                <>Хорошие соседи —<br />лучшее решение</>
              ) : (
                <>Начните с людей,<br />с которыми хочется жить</>
              )}
            </h1>
            <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-white/80 sm:text-base">
              {isLogin
                ? "Подбираем совместимых людей, жильё и условия для комфортной жизни."
                : "Найдите соседей, жильё и общие правила без случайностей."}
            </p>

            {isLogin ? (
              <div className="mt-6 flex items-center gap-3.5">
                <div className="flex -space-x-2.5">
                  {["maria", "artem", "ekaterina", "ilya"].map((person) => (
                    <AvatarImage
                      key={person}
                      src={`/demo/people/${person}.jpg`}
                      name="Пользователь Соседей"
                      size={40}
                      className="size-9 ring-2 ring-black sm:size-10"
                    />
                  ))}
                </div>
                <p className="max-w-[210px] text-xs leading-snug text-white/70">
                  <strong className="block text-sm font-bold text-white">12 500+ человек</strong>
                  уже нашли своих соседей
                </p>
              </div>
            ) : (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md">
                <ShieldCheck className="size-4 text-[#B7EB00]" />
                Проверенные профили и квартиры
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-[720px] flex-col lg:min-h-[calc(100svh-56px)]">
          <div className="flex min-h-14 items-center justify-end px-2 lg:min-h-12">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition hover:text-black"
            >
              <HelpCircle className="size-4" /> Нужна помощь?
            </Link>
          </div>

          <div
            className={cn(
              "my-auto w-full rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_70px_rgba(20,24,10,0.06)] backdrop-blur-sm",
              isLogin ? "sm:p-8 xl:p-10" : "sm:p-6 xl:p-7",
            )}
          >
            <div className="mx-auto w-full max-w-[520px]">
              <div>
                <h2 className="font-heading text-[clamp(2rem,3vw,2.75rem)] font-bold leading-none tracking-[-0.04em]">
                  {isLogin ? "Добро пожаловать" : "Создайте аккаунт"}
                </h2>
                <p className="mt-2 text-sm text-black/50 sm:text-base">
                  {isLogin ? "Войдите, чтобы продолжить поиск" : "Заполните данные, чтобы начать поиск"}
                </p>
              </div>

              <div className={cn("grid grid-cols-2 rounded-[16px] bg-[#EFEEE9] p-1", isLogin ? "mt-6" : "mt-4")}>
                <button
                  type="button"
                  aria-pressed={isLogin}
                  onClick={() => changeMode("login")}
                  className={cn(
                    "relative h-11 rounded-[12px] text-sm font-semibold transition",
                    isLogin ? "bg-black text-white shadow-sm" : "text-black/50 hover:text-black",
                  )}
                >
                  Вход
                </button>
                <button
                  type="button"
                  aria-pressed={!isLogin}
                  onClick={() => changeMode("signup")}
                  className={cn(
                    "relative h-11 rounded-[12px] text-sm font-semibold transition",
                    !isLogin ? "bg-white text-black shadow-sm after:absolute after:inset-x-5 after:bottom-0 after:h-0.5 after:bg-[#B7EB00]" : "text-black/50 hover:text-black",
                  )}
                >
                  Регистрация
                </button>
              </div>

              <form onSubmit={handleSubmit} className={cn(isLogin ? "mt-5 space-y-4" : "mt-4 space-y-3")}>
                {!isLogin && (
                  <label className="block text-sm font-semibold">
                    Имя
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Иван Иванов"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className={cn(inputClass, "mt-2")}
                    />
                  </label>
                )}

                <label className="block text-sm font-semibold">
                  Email
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={cn(inputClass, "mt-2")}
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Пароль
                  <span className="relative mt-2 block">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      placeholder={isLogin ? "Введите пароль" : "Не менее 8 символов"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={cn(inputClass, "pr-12")}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </span>
                </label>

                {!isLogin && (
                  <label className="block text-sm font-semibold">
                    Повторите пароль
                    <span className="relative mt-2 block">
                      <input
                        type={showRepeatPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Повторите пароль"
                        value={repeatPassword}
                        onChange={(event) => setRepeatPassword(event.target.value)}
                        className={cn(inputClass, "pr-12")}
                      />
                      <button
                        type="button"
                        aria-label={showRepeatPassword ? "Скрыть пароль" : "Показать пароль"}
                        onClick={() => setShowRepeatPassword((visible) => !visible)}
                        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black"
                      >
                        {showRepeatPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </span>
                  </label>
                )}

                {isLogin ? (
                  <div className="flex items-center justify-between gap-4 pt-1 text-xs sm:text-sm">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-black/60">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="size-4 accent-[#B7EB00]"
                      />
                      Запомнить меня
                    </label>
                    <Link href="/auth/forgot-password" className="font-semibold text-[#86A900] transition hover:text-black">
                      Забыли пароль?
                    </Link>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-black/60">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(event) => setAcceptTerms(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-[#B7EB00]"
                    />
                    <span>
                      Я соглашаюсь с{" "}
                      <Link href="/safety" className="font-semibold text-[#86A900] hover:underline">правилами сервиса</Link>
                      {" "}и{" "}
                      <Link href="/safety" className="font-semibold text-[#86A900] hover:underline">политикой конфиденциальности</Link>
                    </span>
                  </label>
                )}

                {error && (
                  <p role="alert" className="rounded-[12px] bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex h-[54px] w-full items-center justify-center rounded-[14px] bg-[#B7EB00] px-14 text-sm font-bold transition hover:bg-[#A9DB00] hover:shadow-[0_12px_28px_rgba(166,210,0,0.22)] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? "Загрузка…" : isLogin ? "Войти в аккаунт" : "Создать аккаунт"}
                  <span className="absolute right-2 grid size-10 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-4" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    const demoEmail = process.env.DEMO_ANNA_EMAIL || "anna.demo@sosedi.local";
                    const demoPassword = process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!";

                    if (!hasEnvVars) {
                      window.setTimeout(() => router.push("/app"), 350);
                      return;
                    }

                    try {
                      const supabase = createClient();
                      const { error: authError } = await supabase.auth.signInWithPassword({
                        email: demoEmail,
                        password: demoPassword,
                      });
                      if (authError) throw authError;
                      router.push("/app");
                    } catch {
                      router.push("/app");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#7B9E00]/40 bg-[#EBF7B6]/30 text-sm font-bold text-[#111111] transition hover:bg-[#EBF7B6] hover:border-[#7B9E00] cursor-pointer"
                >
                  <Sparkles className="size-4 text-[#7B9E00]" />
                  Войти в демо-аккаунт
                </button>
              </form>

              <div className={cn("flex items-center gap-4 text-[11px] font-medium text-black/30", isLogin ? "my-4" : "my-3")}>
                <span className="h-px flex-1 bg-black/10" />
                или продолжить с
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white text-sm font-semibold transition hover:border-black/20 hover:bg-[#F6F5F1]"
                >
                  <svg className="size-5 fill-[#0077FF]" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.644c-.624 0-.816-.495-1.936-1.616-1.008-.984-1.456-1.112-1.704-1.112-.344 0-.448.096-.448.56v1.448c0 .4-.128.648-1.2.648-1.776 0-3.752-1.08-5.144-3.088-2.104-2.984-2.672-5.224-2.672-5.68 0-.248.096-.48.56-.48h1.644c.416 0 .568.192.728.648.792 2.296 2.128 4.304 2.68 4.304.208 0 .312-.096.312-.624V9.672c-.064-1.128-.656-1.224-.656-1.632 0-.2.168-.4.432-.4h2.712c.36 0 .488.192.488.608v3.272c0 .352.152.48.256.48.208 0 .384-.128.768-.512 1.184-1.328 2.032-3.376 2.032-3.376.112-.248.312-.4.728-.4h1.644c.488 0 .6.248.488.608-.2.92-2.144 3.704-2.144 3.704-.176.272-.248.4 0 .736.176.248.744.728 1.128 1.176.704.792 1.24 1.456 1.384 1.912.136.456-.08.696-.536.696z" />
                  </svg>
                  VK ID
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white text-sm font-semibold transition hover:border-black/20 hover:bg-[#F6F5F1]"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-[#FC3F1D] text-[11px] font-black text-white">Я</span>
                  Яндекс ID
                </button>
              </div>

              <div className={cn("flex items-center justify-between gap-4 rounded-[16px] bg-[#F1F0EB] px-4 py-3.5", isLogin ? "mt-4" : "mt-3")}>
                <p className="text-sm font-semibold">{isLogin ? "Ещё нет аккаунта?" : "Уже есть аккаунт?"}</p>
                <button
                  type="button"
                  onClick={() => changeMode(isLogin ? "signup" : "login")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[12px] border border-black/10 bg-white px-4 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-black/20"
                >
                  {isLogin ? "Создать профиль" : "Войти"}
                  <ArrowRight className="size-3.5 text-[#86A900]" />
                </button>
              </div>
            </div>
          </div>

          <p className="py-4 text-center text-[11px] font-medium text-black/40">
            © {new Date().getFullYear()} Соседи
          </p>
        </section>
      </div>
    </div>
  );
}
