import { SHOP } from "@/lib/products";

/** Google mapa lokacije prodavnice (bez API ključa), stilizovana da paše tamnoj temi. */
export function MapEmbed({ className = "h-96" }: { className?: string }) {
  const q = encodeURIComponent(SHOP.address);
  return (
    <div className={`relative overflow-hidden border border-line bg-surface ${className}`}>
      <iframe
        title="Lokacija prodavnice One Perfume na mapi"
        src={`https://www.google.com/maps?q=${q}&hl=sr&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0 opacity-90 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.6)_contrast(0.95)]"
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 left-3 bg-bg/90 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-soft"
      >
        Otvori u Google Maps →
      </a>
    </div>
  );
}
