interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main dash/lightning bolt representing speed */}
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill="url(#logo-gradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data nodes/dots representing research data */}
      <circle cx="18" cy="6" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="4" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
      
      <defs>
        <linearGradient id="logo-gradient" x1="3" y1="2" x2="13" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoIcon({ className = '', size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern geometric D shape with data connection theme */}
      <path
        d="M8 4h8c6.627 0 12 5.373 12 12s-5.373 12-12 12H8V4z"
        fill="url(#icon-gradient-1)"
      />
      
      {/* Inner cutout creating depth */}
      <path
        d="M12 8h4c4.418 0 8 3.582 8 8s-3.582 8-8 8h-4V8z"
        fill="url(#icon-gradient-2)"
      />
      
      {/* Connection nodes */}
      <circle cx="24" cy="12" r="2" fill="white" opacity="0.9" />
      <circle cx="24" cy="20" r="2" fill="white" opacity="0.7" />
      <circle cx="28" cy="16" r="1.5" fill="white" opacity="0.6" />
      
      {/* Connection lines */}
      <path
        d="M16 16L24 12M16 16L24 20M24 12L28 16M24 20L28 16"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      
      <defs>
        <linearGradient id="icon-gradient-1" x1="8" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="icon-gradient-2" x1="12" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E293B" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0F172A" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
