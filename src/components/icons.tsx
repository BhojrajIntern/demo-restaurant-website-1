/* Inline SVG icons (decorative — pair them with visible text or an aria-label). */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24, rest: P) => ({ width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, ...rest });
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const CartIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 7Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></svg>;
export const PhoneIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>;
export const MenuIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><path d="M4 8h16M4 16h16" /></svg>;
export const CloseIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.8}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const ArrowRight = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.8}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const ArrowLeft = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.8}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const ArrowUp = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.8}><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
export const ArrowDown = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.8}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
export const CheckIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={2.4}><path d="M5 12.5 10 17 19 7" /></svg>;
export const CalendarIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>;
export const BagIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><path d="M4 8h16l-1 12H5L4 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
export const BikeIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h6l2-6h-5l-3 6M14 6h3l1.5 5" /></svg>;
export const StoreIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" /></svg>;
export const PinIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>;
export const ClockIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
export const MailIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
export const UsersIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" /></svg>;
export const SearchIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.8}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const BowlIcon = ({ size, ...p }: P) => <svg {...base(size, p)} {...stroke} strokeWidth={1.5}><path d="M3 11h18a9 9 0 0 1-18 0Z" /><path d="M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5" /></svg>;
export const PlayIcon = ({ size, ...p }: P) => <svg {...base(size, p)} fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
export const PauseIcon = ({ size, ...p }: P) => <svg {...base(size, p)} fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>;
export const WhatsAppIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)} fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" /></svg>
);
export const InstagramIcon = ({ size, ...p }: P) => <svg {...base(size, p)} fill="none" stroke="currentColor" strokeWidth={1.7}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" /></svg>;
export const FacebookIcon = ({ size, ...p }: P) => <svg {...base(size, p)} fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" /></svg>;
export const YouTubeIcon = ({ size, ...p }: P) => <svg {...base(size, p)} fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" /></svg>;

export function LogoMark({ className = "logo-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="es-logo-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c9472b" />
          <stop offset="1" stopColor="#f3bd63" />
        </linearGradient>
      </defs>
      <path fill="url(#es-logo-grad)" d="M20 2c2 6.5 9 10 9 19a9 9 0 0 1-18 0c0-4.3 2.2-7 4-9 .3 3 1.6 5 3.6 5.6C17 13 16.5 7.6 20 2Z" />
      <path fill="#140f0c" opacity=".55" d="M20 22c1.2 2.6 4 3.6 4 7a4 4 0 0 1-8 0c0-2.2 1.4-3.4 2-4.6.4 1.2 1.1 1.8 2 1.8-.6-1.5-.6-2.8 0-4.2Z" />
      <circle cx="20" cy="38" r="1.6" fill="#e9a23b" />
    </svg>
  );
}
