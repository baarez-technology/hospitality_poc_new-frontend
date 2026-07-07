import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

/**
 * Calendar Component - Glimmora Design System
 * Premium enterprise calendar with warm luxury aesthetics,
 * refined typography, and subtle micro-interactions.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        /**
         * react-day-picker v9 uses UI keys (see UI.js):
         * months, month, month_caption, caption_label, nav, button_previous, button_next,
         * month_grid, weekdays, weekday, weeks, week, day, day_button, ...
         */
        months: "flex flex-col",
        month: "space-y-4",

        // Premium month caption with refined typography
        month_caption: "flex justify-center pt-1.5 pb-2 relative items-center",
        caption_label: cn(
          "text-[15px] font-semibold tracking-tight text-neutral-800",
          "select-none"
        ),

        // Navigation container
        nav: "space-x-1 flex items-center",

        // Navigation buttons with hover animations
        button_previous: cn(
          "group absolute left-0.5 inline-flex items-center justify-center",
          "h-8 w-8 rounded-full",
          "text-neutral-500 bg-transparent",
          "transition-all duration-200 ease-out",
          "hover:bg-gradient-to-br hover:from-terra-50 hover:to-copper-50/50",
          "hover:text-terra-700 hover:scale-105",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/20 focus-visible:ring-offset-1"
        ),
        button_next: cn(
          "group absolute right-0.5 inline-flex items-center justify-center",
          "h-8 w-8 rounded-full",
          "text-neutral-500 bg-transparent",
          "transition-all duration-200 ease-out",
          "hover:bg-gradient-to-br hover:from-terra-50 hover:to-copper-50/50",
          "hover:text-terra-700 hover:scale-105",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/20 focus-visible:ring-offset-1"
        ),
        chevron: cn(
          "h-4 w-4 transition-transform duration-200",
          "group-hover:scale-110"
        ),

        // Month grid
        month_grid: "w-full border-collapse",

        // Weekday headers with refined styling
        weekdays: "grid grid-cols-7 mb-1",
        weekday: cn(
          "text-center text-[10px] font-bold uppercase tracking-widest",
          "text-neutral-400 py-2",
          "select-none"
        ),

        // Weeks container
        weeks: "grid gap-0.5",
        week: "grid grid-cols-7 gap-0.5",

        // Day cell container
        day: "p-0 text-center",

        // Day button with premium hover and focus states
        day_button: cn(
          "relative inline-flex items-center justify-center",
          "h-9 w-9 rounded-xl",
          "text-[13px] font-medium text-neutral-700",
          "transition-all duration-200 ease-out",
          "select-none cursor-pointer",
          // Hover state with warm gradient
          "hover:bg-gradient-to-br hover:from-terra-50/80 hover:to-copper-50/40",
          "hover:text-neutral-900 hover:scale-[1.02]",
          // Active state
          "active:scale-[0.96]",
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/25 focus-visible:ring-offset-1"
        ),

        // Today indicator with warm glow
        today: cn(
          "relative text-terra-700 font-semibold",
          // Subtle ring indicator
          "after:absolute after:inset-1.5 after:rounded-lg",
          "after:border after:border-terra-300/60",
          "after:pointer-events-none"
        ),

        // Outside days (previous/next month)
        outside: cn(
          "text-neutral-300",
          "hover:text-neutral-400 hover:bg-neutral-50/50"
        ),

        // Disabled state
        disabled: cn(
          "text-neutral-300 opacity-40 cursor-not-allowed",
          "hover:bg-transparent hover:scale-100"
        ),

        // Selected state with terra gradient and glow
        selected: cn(
          "bg-gradient-to-br from-terra-500 to-terra-600",
          "text-white font-semibold",
          "shadow-[0_2px_8px_-2px_rgba(165,120,101,0.5),0_0_0_1px_rgba(165,120,101,0.1)]",
          "hover:from-terra-600 hover:to-terra-700 hover:scale-[1.02]",
          // Remove today indicator when selected
          "after:border-0"
        ),

        // Range selection styles
        range_start: cn(
          "bg-gradient-to-br from-terra-500 to-terra-600",
          "text-white font-semibold rounded-l-xl rounded-r-lg",
          "shadow-[0_2px_8px_-2px_rgba(165,120,101,0.4)]"
        ),
        range_end: cn(
          "bg-gradient-to-br from-terra-500 to-terra-600",
          "text-white font-semibold rounded-r-xl rounded-l-lg",
          "shadow-[0_2px_8px_-2px_rgba(165,120,101,0.4)]"
        ),
        range_middle: cn(
          "bg-gradient-to-r from-terra-100/70 via-terra-50 to-terra-100/70",
          "text-terra-800 rounded-none",
          "hover:from-terra-100 hover:via-terra-100 hover:to-terra-100"
        ),

        hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              "group-hover:-translate-x-0.5",
              className
            )}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              "group-hover:translate-x-0.5",
              className
            )}
            {...props}
          />
        ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
