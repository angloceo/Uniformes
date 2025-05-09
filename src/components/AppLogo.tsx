import type { SVGProps } from 'react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

// New Uniform-themed SVG icon
const UniformIconSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
    data-ai-hint="shirt clothing"
  >
    <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
  </svg>
);

interface AppLogoProps {
  showColegioLogoText?: boolean; // If true, shows "Colegio Anglo Español" and motto
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subTextClassName?: string; 
}

export function AppLogo({ 
  showColegioLogoText = false, 
  className, 
  iconClassName, 
  textClassName,
  subTextClassName
}: AppLogoProps) {
  const mainText = showColegioLogoText ? "Colegio Anglo Español" : siteConfig.name;
  const subTextContent = showColegioLogoText ? "Fortaleza para la Libertad" : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UniformIconSvg 
        className={cn("h-7 w-7 text-primary", iconClassName)} 
        aria-hidden="true" 
      />
      <div className="flex flex-col">
        <span 
          className={cn(
          "font-semibold", 
          showColegioLogoText ? "text-primary" : "text-foreground", 
          textClassName || "text-lg"
        )}
          translate="no"
        >
          {mainText}
        </span>
        {subTextContent && (
          <span className={cn("text-muted-foreground", subTextClassName || "text-xs")} translate="no">
            {subTextContent}
          </span>
        )}
      </div>
    </div>
  );
}

