import { MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book on WhatsApp"
      title={`Book on WhatsApp · ${SITE.phone}`}
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-3 pr-4 py-3 shadow-luxe hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium hidden sm:inline">Book on WhatsApp</span>
    </a>
  );
}
