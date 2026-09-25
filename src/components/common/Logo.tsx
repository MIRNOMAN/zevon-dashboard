import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function ZevonLogo({ className, showSubtitle = true }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      aria-label="ZEVON - Enterprise Dashboard"
      className={cn(
        "group flex items-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none rounded-lg py-1 pr-2",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 56"
        className="h-8 sm:h-9 md:h-10 w-auto text-current transition-colors duration-200"
        fill="none"
      >
        {/* Main Wordmark Group: Large 'Z' + Smaller 'EVON' + 'BD' */}
        <g fill="currentColor">
          {/* Prominent Large 'Z' in Gold Accent */}
          <text
            x="2"
            y="36"
            fontFamily="'Montserrat', 'Helvetica Neue', 'Outfit', sans-serif"
            fontSize="44"
            fontWeight="900"
            letterSpacing="0.5"
            className="text-amber-400 fill-amber-400"
          >
            Z
          </text>

          {/* Medium 'EVON' in White */}
          <text
            x="36"
            y="34"
            fontFamily="'Montserrat', 'Helvetica Neue', 'Outfit', sans-serif"
            fontSize="28"
            fontWeight="900"
            letterSpacing="3"
            className="text-white fill-white"
          >
            EVON
          </text>

          {/* 'BD' Suffix */}
          <text
            x="146"
            y="34"
            fontFamily="'Montserrat', 'Helvetica Neue', 'Outfit', sans-serif"
            fontSize="19"
            fontWeight="900"
            letterSpacing="1.5"
            opacity="0.85"
            className="text-amber-400 fill-amber-400"
          >
            BD
          </text>

          {/* Subtitle Tagline */}
          {showSubtitle && (
            <text
              x="5"
              y="50"
              opacity="0.75"
              fontFamily="'Montserrat', 'Inter', sans-serif"
              fontSize="7.5"
              fontWeight="700"
              letterSpacing="3.6"
              className="text-slate-400 fill-slate-400"
            >
              APPAREL &amp; LIFESTYLE
            </text>
          )}
        </g>
      </svg>
    </Link>
  );
}

export default ZevonLogo;
