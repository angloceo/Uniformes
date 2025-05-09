import type { SVGProps } from 'react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

// Colegio Anglo Español Shield SVG
// This is a simplified representation. For a more accurate logo, an actual SVG file should be used.
const ColegioShieldSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Outer Circle (Blue) */}
    <circle cx="35" cy="35" r="30" fill="#005A9C"/>
    {/* Inner Design (Simplified representation of Statue of Liberty + Fort in Red) */}
    {/* Fort Base */}
    <path d="M20 55 H50 V60 H20 Z" fill="#D81E28"/>
    <path d="M22 50 H48 V55 H22 Z" fill="#D81E28"/>
    {/* Statue Silhouette (highly simplified) */}
    <path d="M35 20 L30 40 L25 50 L30 50 L35 30 L40 50 L45 50 L40 40 Z" fill="#D81E28"/>
    {/* Torch (Yellow/Orange) */}
    <circle cx="35" cy="15" r="3" fill="#FFA500"/>
    {/* Inner white arc for effect (optional) */}
    <path d="M35 10 A25 25 0 0 0 35 60" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" transform="rotate(20 35 35)"/>
    <path d="M35 10 A25 25 0 0 1 35 60" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" transform="rotate(-20 35 35)"/>
  </svg>
);


interface AppLogoProps {
  showColegioLogo?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string; // For main title like "Colegio Anglo Español" or app name
  subTextClassName?: string; // For motto or app description
}

export function AppLogo({ 
  showColegioLogo = false, 
  className, 
  iconClassName, 
  textClassName,
  subTextClassName
}: AppLogoProps) {
  if (showColegioLogo) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <ColegioShieldSvg className={cn("h-10 w-10", iconClassName)} />
        <div className="flex flex-col">
          <span className={cn("font-semibold text-primary", textClassName || "text-lg")}>
            Colegio Anglo Español
          </span>
          <span className={cn("text-muted-foreground", subTextClassName || "text-xs")}>
            Fortaleza para la Libertad
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Default app icon (simple placeholder for "Uniformes Anglo Español") */}
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
      <span className={cn("font-semibold text-foreground", textClassName || "text-lg")}>
        {siteConfig.name}
      </span>
      {siteConfig.description && !textClassName && ( // Show description if no specific text class implies a title-only context
         <span className={cn("text-xs text-muted-foreground hidden sm:block", subTextClassName)}>
           {/* Shorten description or use a subtitle if too long */}
         </span>
      )}
    </div>
  );
}
