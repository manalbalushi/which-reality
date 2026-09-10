import { IconName } from "@/lib/types";

type Props = { name: IconName; className?: string; style?: React.CSSProperties };

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CategoryIcon({ name, className, style }: Props) {
  const props = { ...common, viewBox: "0 0 24 24", className, style };
  switch (name) {
    case "perfume":
      return (
        <svg {...props}>
          <path d="M9 8h6l1 2v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9l1-2Z" />
          <path d="M10 8V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" />
          <path d="M9 13h6" />
        </svg>
      );
    case "candle":
      return (
        <svg {...props}>
          <rect x="8" y="9" width="8" height="12" rx="1.5" />
          <path d="M12 9V5" />
          <path d="M12 5c1 0 1.5-1 1-2-.5 1-1.5 1-1 2Z" />
        </svg>
      );
    case "coffee":
      return (
        <svg {...props}>
          <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" />
          <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M8 5c0 1-1 1-1 2M12 5c0 1-1 1-1 2" />
        </svg>
      );
    case "chocolate":
      return (
        <svg {...props}>
          <rect x="4" y="6" width="16" height="12" rx="1.5" />
          <path d="M4 12h16M10 6v12M14 6v12" />
        </svg>
      );
    case "dates":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="12" rx="5" ry="7" />
          <path d="M12 5c0-1.5 1-2.5 2-3" />
        </svg>
      );
    case "stationery":
      return (
        <svg {...props}>
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M15 3v3h3" />
          <path d="M9 12h6M9 15h6M9 9h3" />
        </svg>
      );
    case "accessories":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3" />
          <path d="M9.5 10.5 6 20M14.5 10.5 18 20" />
        </svg>
      );
    case "hair":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "travel":
      return (
        <svg {...props}>
          <rect x="5" y="8" width="14" height="11" rx="1.5" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "selfcare":
      return (
        <svg {...props}>
          <path d="M12 3c3 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-7 6-10Z" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 10v10h12V10" />
        </svg>
      );
    case "omani":
      return (
        <svg {...props}>
          <path d="M12 3 6 9v6a6 6 0 0 0 12 0V9l-6-6Z" />
        </svg>
      );
    case "baby":
      return (
        <svg {...props}>
          <circle cx="12" cy="9" r="4" />
          <path d="M6 20c0-4 3-6 6-6s6 2 6 6" />
        </svg>
      );
    case "beauty":
      return (
        <svg {...props}>
          <path d="M12 3v4M8 5l2 3M16 5l-2 3" />
          <path d="M6 21c0-5 3-9 6-9s6 4 6 9" />
        </svg>
      );
    case "bag":
      return (
        <svg {...props}>
          <path d="M6 8h12l-1 12H7L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "basket":
      return (
        <svg {...props}>
          <path d="M4 10h16l-2 9H6l-2-9Z" />
          <path d="M8 10 12 4l4 6" />
          <path d="M9 13v3M12 13v3M15 13v3" />
        </svg>
      );
    case "tote":
      return (
        <svg {...props}>
          <rect x="5" y="8" width="14" height="12" rx="1" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        </svg>
      );
    case "pouch":
      return (
        <svg {...props}>
          <path d="M7 9c0-3 2-6 5-6s5 3 5 6" />
          <path d="M5 9h14l-1.5 11h-11L5 9Z" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="M3 8 12 4l9 4-9 4-9-4Z" />
          <path d="M3 8v9l9 4 9-4V8" />
          <path d="M12 12v9" />
        </svg>
      );
    case "tray":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="14" rx="9" ry="3" />
          <path d="M6 14V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
        </svg>
      );
    case "gift":
      return (
        <svg {...props}>
          <rect x="4" y="9" width="16" height="11" rx="1" />
          <path d="M4 13h16" />
          <path d="M12 9v11" />
          <path d="M12 9C9 9 8 4 12 4c4 0 3 5 0 5Z" />
        </svg>
      );
    case "sparkle":
    default:
      return (
        <svg {...props}>
          <path d="M12 3c.6 3 2 4.4 5 5-3 .6-4.4 2-5 5-.6-3-2-4.4-5-5 3-.6 4.4-2 5-5Z" />
          <path d="M19 15c.3 1.4.9 2 2.3 2.3-1.4.3-2 .9-2.3 2.3-.3-1.4-.9-2-2.3-2.3 1.4-.3 2-.9 2.3-2.3Z" />
        </svg>
      );
  }
}

export function UIIcon({
  name,
  className,
}: {
  name:
    | "search"
    | "user"
    | "cart"
    | "menu"
    | "close"
    | "whatsapp"
    | "chevron-down"
    | "chevron-right"
    | "check"
    | "plus"
    | "minus"
    | "star"
    | "trash"
    | "arrow-right";
  className?: string;
}) {
  const props = { ...common, viewBox: "0 0 24 24", className };
  switch (name) {
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      );
    case "cart":
      return (
        <svg {...props}>
          <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
          <circle cx="10" cy="21" r="1.3" />
          <circle cx="17" cy="21" r="1.3" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.39-1.37a9.9 9.9 0 0 0 4.65 1.14h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.77 14.02c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.12.1-1.8-.12-.42-.13-.95-.3-1.65-.6-2.9-1.25-4.79-4.15-4.94-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.11.31.02.5-.09.2-.14.31-.27.48-.14.17-.29.37-.41.5-.14.14-.28.29-.12.57.16.29.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.63-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 13 4 4 10-10" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2.5 14.9 9l7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.6 9.1 9 12 2.5Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
        </svg>
      );
    case "arrow-right":
    default:
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
  }
}
