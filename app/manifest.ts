import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "Соседи — жильё и совместная аренда",
    short_name: "Соседи",
    description:
      "Поиск жилья и совместимых соседей, заявки и общение в одном приложении.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#F5F3EA",
    theme_color: "#111111",
    lang: "ru",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/pwa-icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Найти жильё",
        short_name: "Жильё",
        url: "/app/housing",
        icons: [{ src: "/pwa-icon/192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Найти соседей",
        short_name: "Соседи",
        url: "/app/roommates",
        icons: [{ src: "/pwa-icon/192", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
