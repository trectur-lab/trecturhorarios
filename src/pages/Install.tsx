import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8">
          <ArrowLeft size={20} />
          Voltar aos horários
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Instalar Trectur</h1>
          <p className="text-white/70">
            Tenha os horários de ônibus sempre à mão, mesmo offline!
          </p>
        </div>

        {isInstalled ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-semibold mb-2">App já instalado!</h2>
            <p className="text-white/70">
              O Trectur já está instalado no seu dispositivo.
            </p>
          </div>
        ) : isIOS ? (
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Como instalar no iPhone/iPad:</h2>
            <ol className="space-y-4 text-white/80">
              <li className="flex gap-3">
                <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima)</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="text-center">
            <Button
              onClick={handleInstall}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
            >
              <Download className="mr-2" size={24} />
              Instalar Agora
            </Button>
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Como instalar no Android:</h2>
            <ol className="space-y-4 text-white/80">
              <li className="flex gap-3">
                <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <span>Toque no menu do navegador (três pontos no canto)</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <span>Confirme a instalação</span>
              </li>
            </ol>
          </div>
        )}

        <div className="mt-8 bg-white/5 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Benefícios do app:</h3>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>✓ Acesso rápido direto da tela inicial</li>
            <li>✓ Funciona mesmo sem internet</li>
            <li>✓ Carregamento mais rápido</li>
            <li>✓ Experiência de app nativo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
