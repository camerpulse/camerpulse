import React from 'react'
import { cn } from '@/lib/utils'

interface MonumentBackgroundProps {
  className?: string
}

export const MonumentBackground: React.FC<MonumentBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0", className)}>
      {/* Monument Background SVG */}
      <svg
        viewBox="0 0 1200 800"
        className="w-full h-full opacity-[0.03] object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Reunification Monument - Left side */}
        <g transform="translate(100, 150) scale(0.8)">
          {/* Base */}
          <rect x="50" y="400" width="200" height="100" fill="currentColor" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          {/* Spiral structure */}
          <path d="M 150 400 Q 120 350 150 300 Q 180 250 150 200 Q 120 150 150 100" 
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7"/>
          <path d="M 150 400 Q 180 350 150 300 Q 120 250 150 200 Q 180 150 150 100" 
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7"/>
          {/* Top unity symbol */}
          <circle cx="150" cy="80" r="20" fill="currentColor" opacity="0.8"/>
          <text x="40" y="550" fontSize="16" fill="currentColor" opacity="0.5">Reunification Monument</text>
        </g>

        {/* La Nouvelle Liberté - Center */}
        <g transform="translate(450, 100) scale(0.9)">
          {/* Base pedestal */}
          <rect x="100" y="450" width="150" height="80" fill="currentColor" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          {/* Main figure - stylized liberty figure */}
          <ellipse cx="175" cy="420" rx="30" ry="40" fill="currentColor" opacity="0.7"/>
          {/* Arms raised */}
          <path d="M 145 380 L 125 340" stroke="currentColor" strokeWidth="4" opacity="0.7"/>
          <path d="M 205 380 L 225 340" stroke="currentColor" strokeWidth="4" opacity="0.7"/>
          {/* Body */}
          <rect x="160" y="380" width="30" height="70" fill="currentColor" opacity="0.7"/>
          {/* Liberty torch */}
          <circle cx="225" cy="330" r="8" fill="currentColor" opacity="0.8"/>
          <path d="M 225 320 L 230 310 L 220 310 Z" fill="currentColor" opacity="0.9"/>
          <text x="110" y="580" fontSize="16" fill="currentColor" opacity="0.5">La Nouvelle Liberté</text>
        </g>

        {/* Unknown Soldier Monument - Right side */}
        <g transform="translate(800, 180) scale(0.7)">
          {/* Base */}
          <rect x="75" y="420" width="150" height="60" fill="currentColor" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          {/* Eternal flame pedestal */}
          <rect x="125" y="350" width="50" height="70" fill="currentColor" opacity="0.7"/>
          {/* Flame */}
          <path d="M 150 350 Q 140 330 150 310 Q 160 320 150 300 Q 140 290 150 270" 
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.8"/>
          {/* Memorial wreath */}
          <circle cx="150" cy="380" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <circle cx="150" cy="380" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
          {/* Star emblem */}
          <path d="M 150 260 L 155 275 L 170 275 L 158 285 L 163 300 L 150 290 L 137 300 L 142 285 L 130 275 L 145 275 Z" 
                fill="currentColor" opacity="0.8"/>
          <text x="70" y="530" fontSize="16" fill="currentColor" opacity="0.5">Unknown Soldier Monument</text>
        </g>

        {/* Decorative elements */}
        {/* National stars scattered */}
        <g opacity="0.2">
          <path d="M 300 50 L 302 55 L 307 55 L 303 58 L 305 63 L 300 60 L 295 63 L 297 58 L 293 55 L 298 55 Z" fill="currentColor"/>
          <path d="M 700 80 L 702 85 L 707 85 L 703 88 L 705 93 L 700 90 L 695 93 L 697 88 L 693 85 L 698 85 Z" fill="currentColor"/>
          <path d="M 200 600 L 202 605 L 207 605 L 203 608 L 205 613 L 200 610 L 195 613 L 197 608 L 193 605 L 198 605 Z" fill="currentColor"/>
          <path d="M 900 650 L 902 655 L 907 655 L 903 658 L 905 663 L 900 660 L 895 663 L 897 658 L 893 655 L 898 655 Z" fill="currentColor"/>
        </g>

        {/* Inspirational text overlay */}
        <text x="600" y="750" fontSize="24" textAnchor="middle" fill="currentColor" opacity="0.3" fontWeight="bold">
          PAIX • TRAVAIL • PATRIE
        </text>
      </svg>
    </div>
  )
}