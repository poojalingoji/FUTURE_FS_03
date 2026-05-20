export const SITE = {
  name: "LuxeGlow Salon & Spa",
  tagline: "Luxury Beauty & Wellness Experience",
  // WhatsApp uses wa.me (NOT api.whatsapp.com)
  whatsappNumber: "917019621683",
  whatsappMessage: "Hello, I would like to book an appointment at LuxeGlow Salon & Spa.",
  phone: "+91 70196 21683",
  email: "hello@luxeglow.salon",
  address: "12 Marine Drive, Mumbai, Maharashtra 400020",
  hours: "Mon – Sun · 10:00 AM – 9:00 PM",
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
};

export const waLink = (msg?: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    msg ?? SITE.whatsappMessage,
  )}`;

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
