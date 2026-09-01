import type { SVGProps } from "react";

/** Stroke-based icon set, 24×24, inheriting currentColor. */
type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const PulseMark = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 12h3.5l2-6 3.5 12 2.5-7 1.6 3.4H21" />
  </svg>
);

export const Phone = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.2 3.5h3l1.4 3.5-2 1.4a12.5 12.5 0 0 0 5 5l1.4-2 3.5 1.4v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);

export const PhoneRinging = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7.2 8.4h2.4l1.1 2.8-1.6 1.1a10 10 0 0 0 4 4l1.1-1.6 2.8 1.1v2.4a1.6 1.6 0 0 1-1.8 1.6A13.6 13.6 0 0 1 5.6 10.2 1.6 1.6 0 0 1 7.2 8.4Z" />
    <path d="M15.5 3.6a6 6 0 0 1 4.9 4.9M15 7.1a2.6 2.6 0 0 1 1.9 1.9" />
  </svg>
);

export const Calendar = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </svg>
);

export const Clock = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const Check = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12.5 10 17.5 19 7" />
  </svg>
);

export const CheckCircle = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.4 12.2 11 14.8l4.6-5.2" />
  </svg>
);

export const AlertTriangle = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 4.6 21 19.4H3L12 4.6Z" />
    <path d="M12 10v3.6M12 16.6h.01" />
  </svg>
);

export const XMark = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Search = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const Sun = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.6v2M12 19.4v2M4.4 12h-2M21.6 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4" />
  </svg>
);

export const Moon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" />
  </svg>
);

export const ArrowRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const ChevronLeft = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
);

export const ChevronRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const Star = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.6Z" />
  </svg>
);

export const MapPin = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s6.5-5.4 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </svg>
);

export const Globe = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
  </svg>
);

export const Shield = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.2 19 6v6c0 4.2-2.9 7.4-7 8.8-4.1-1.4-7-4.6-7-8.8V6l7-2.8Z" />
    <path d="m9 12.2 2.2 2.2L15.2 10" />
  </svg>
);

export const Sparkle = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
    <path d="M18.6 16.4 19.3 18.4l2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </svg>
);

export const Mail = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m3.6 7.4 7.3 5.2a2 2 0 0 0 2.2 0l7.3-5.2" />
  </svg>
);

export const User = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8.2" r="3.7" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </svg>
);

export const Refresh = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 11.5a8 8 0 1 0-1.4 5.3" />
    <path d="M20 4.6v5h-5" />
  </svg>
);

export const LogOut = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14.5 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3" />
    <path d="M10 8.5 6 12l4 3.5M6 12h9" />
  </svg>
);

export const Lock = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4.8" y="10.5" width="14.4" height="9.5" rx="2.2" />
    <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
  </svg>
);

export const Waveform = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 10.5v3M8 7v10M12 4.5v15M16 8v8M20 10.5v3" />
  </svg>
);

export const Stethoscope = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 3.5v5a4 4 0 0 0 8 0v-5" />
    <path d="M4.4 3.5h3M12.6 3.5h3M10 12.5v2.2a4.3 4.3 0 0 0 8.6 0v-1.4" />
    <circle cx="18.6" cy="11.6" r="1.9" />
  </svg>
);
