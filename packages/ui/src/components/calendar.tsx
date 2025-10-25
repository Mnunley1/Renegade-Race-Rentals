import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center mb-6',
        caption_label: 'text-base font-semibold text-gray-900',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 bg-transparent p-0 hover:bg-gray-100 rounded-lg border border-gray-200'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex mb-3',
        head_cell:
          'text-gray-600 rounded-lg w-10 font-medium text-sm uppercase tracking-wide',
        row: 'flex w-full mt-1',
        cell: 'h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-10 w-10 p-0 font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-[#EF1C25] text-white hover:bg-[#EF1C25] hover:text-white focus:bg-[#EF1C25] focus:text-white rounded-lg font-semibold',
        day_today:
          'bg-gray-200 text-gray-900 font-bold rounded-lg border-2 border-[#EF1C25]',
        day_outside:
          'day-outside text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled:
          'text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent',
        day_range_middle:
          'aria-selected:bg-[#EF1C25]/20 aria-selected:text-[#EF1C25] rounded-lg font-medium',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className='h-4 w-4 text-gray-600' />,
        IconRight: () => <ChevronRight className='h-4 w-4 text-gray-600' />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
