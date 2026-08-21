// Service Worker registration wrapper with strict guards.
// Never registers in dev, iframes, Lovable preview/dev hosts, or when ?sw=off.
// In any refused context, unregisters any stale /sw.js so the old cache is evicted.

import { toast } from "sonner";

const SW_URL = "/sw.js";
const UPDATE_MIN_INTERVAL_MS = 60 * 1000;
const RELOAD_FLAG = "trectur_sw_reloaded";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true; // cross-origin iframe access threw -> we're in an iframe
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterStale(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url =
            r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || "";
          return url.endsWith(SW_URL);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* ignore */
  }
}

export function registerPWA(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  if (isRefusedContext()) {
    // Make sure any previously installed app SW is removed in this context.
    void unregisterStale();
    return;
  }

  let registration: ServiceWorkerRegistration | null = null;
  let lastUpdateCheck = 0;

  // Recarrega uma única vez quando a versão nova assume o controle.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {
      /* ignore */
    }
    window.location.reload();
  });

  const checkForUpdate = () => {
    if (!registration) return;
    if (!navigator.onLine) return;
    if (Date.now() - lastUpdateCheck < UPDATE_MIN_INTERVAL_MS) return;
    lastUpdateCheck = Date.now();
    void registration.update().catch(() => {
      /* ignore */
    });
  };

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_URL, { scope: "/" })
      .then((reg) => {
        registration = reg;
        lastUpdateCheck = Date.now();

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              toast("Nova versão disponível", {
                description: "Atualize para ver os horários mais recentes.",
                duration: 10000,
                action: {
                  label: "Atualizar agora",
                  onClick: () => window.location.reload(),
                },
              });
            }
          });
        });
      })
      .catch(() => {
        /* ignore */
      });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForUpdate();
  });
  window.addEventListener("focus", checkForUpdate);
  window.addEventListener("online", checkForUpdate);
}
