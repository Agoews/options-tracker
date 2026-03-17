"use client";

import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={["p-3 text-sm text-[var(--foreground)]", className].filter(Boolean).join(" ")}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex items-center justify-between px-1",
        caption_label: "font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "h-7 w-7 rounded-md border border-white/10 bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors",
        button_next:
          "h-7 w-7 rounded-md border border-white/10 bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-8 text-center text-xs text-white/40 font-normal",
        week: "flex mt-1",
        day: "p-0",
        day_button:
          "h-8 w-8 rounded-md text-center text-sm hover:bg-white/10 transition-colors aria-selected:bg-[var(--foreground)] aria-selected:text-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        today: "font-semibold underline",
        outside: "opacity-30",
        disabled: "opacity-20 cursor-not-allowed",
        hidden: "invisible",
      }}
      {...props}
    />
  );
}
