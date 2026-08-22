// Nesta versão o app NÃO registra nenhum service worker de cache de código.
// O arquivo /sw.js publicado é um kill-switch: ele limpa os caches antigos,
// recarrega a página e se desregistra sozinho.
//
// Aqui apenas garantimos que qualquer service worker antigo seja removido
// também nos contextos em que o kill-switch não chega (dev, preview, iframe).

const SW_URL = "/sw.js";

async function unregisterAll(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url =
            r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || "";
          return url.endsWith(SW_URL) || url.endsWith("/service-worker.js");
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
  void unregisterAll();
}
