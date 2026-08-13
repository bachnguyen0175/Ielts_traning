// Shared line-icon set.
//
// One consistent drawing style across the app: 24×24 box, currentColor stroke,
// 1.6 weight, round caps/joins. Size and colour come from the call site via
// className. SVG only — never emoji (ui-ux-pro-max pre-delivery checklist).

type IconProps = { className?: string };

const S = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function ChartIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M3 3v18h18" />
      <path d="m7 14 3.5-4 3 2.5L20 7" />
    </svg>
  );
}

export function CardsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <rect x="3" y="6" width="13" height="14" rx="2" />
      <path d="M8 3h10a3 3 0 0 1 3 3v10" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function LibraryIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M4 4v16" />
      <path d="M8.5 4v16" />
      <path d="m13 5.5 4.5-1.2 3 15.4-4.5 1.1z" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function XIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function HeadphonesIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="13.5" width="4.5" height="7" rx="2" />
      <rect x="17" y="13.5" width="4.5" height="7" rx="2" />
    </svg>
  );
}

export function BookIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
      <path d="M4 19.5A1.5 1.5 0 0 1 5.5 21H19" />
    </svg>
  );
}

export function PenIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5z" />
    </svg>
  );
}

export function MicIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
    </svg>
  );
}

export function UploadIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M12 15V3.5" />
      <path d="m7.5 8 4.5-4.5L16.5 8" />
      <path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15" />
    </svg>
  );
}

export function FileIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function TargetIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function AlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4M12 17.2h.01" />
    </svg>
  );
}

export function InfoIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8h.01" />
    </svg>
  );
}

export function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function PlayIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M7 4.8v14.4l12-7.2z" />
    </svg>
  );
}

export function SparkIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...S} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5 13.4 11 16 12l-2.6 1-1.4 2.5-1.4-2.5L8 12l2.6-1z" />
    </svg>
  );
}
