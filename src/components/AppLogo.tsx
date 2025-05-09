import type { SVGProps } from 'react';
import { siteConfig } from '@/config/site';

// Placeholder for Colegio Anglo Español logo if provided as SVG
const ColegioLogoSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" {...props}>
    <rect width="100" height="100" rx="10" fill="hsl(var(--primary))" />
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fill="hsl(var(--primary-foreground))">
      CAE
    </text>
  </svg>
);


interface AppLogoProps {
  show ColegioLogo?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function AppLogo({ showColegioLogo = false, className, iconClassName, textClassName }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showColegioLogo ? (
        <ColegioLogoSvg className={cn("h-8 w-8", iconClassName)} />
      ) : (
        // Default app icon (simple placeholder)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("h-7 w-7 text-primary", iconClassName)}
          aria-hidden="true"
        >
          <path d="M9 20H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4"/>
          <polyline points="9 16 11 18 15 14"/>
          <path d="M12 4v10"/>
          <path d="m15 11-3-3-3 3"/>
        </svg>
      )}
      <span className={cn("font-semibold text-lg text-foreground", textClassName)}>
        {siteConfig.name}
      </span>
    </div>
  );
}

// Helper for cn if not globally available in this context (it should be via imports)
// For safety, can be defined here too, or ensure proper setup.
// This is just a placeholder in case it's needed for some reason.
// Ideally, cn is imported from "@/lib/utils"
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
