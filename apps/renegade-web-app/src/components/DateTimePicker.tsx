import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renegade/ui';

interface DateTimePickerProps {
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
}

export function DateTimePicker({
  startDate,
  endDate,
  startTime = '10:30',
  endTime = '12:30',
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: DateTimePickerProps) {
  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);

  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className='flex w-full max-w-4xl min-w-0 flex-col gap-6'>
      {/* Individual Date and Time Pickers */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Pick-up Section */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'>
            Pick-up Details
          </h3>
          <div className='flex gap-4'>
            <div className='flex flex-1 flex-col gap-3'>
              <Label
                htmlFor='date-from'
                className='px-1 text-sm font-medium text-gray-700'
              >
                Date
              </Label>
              <Popover open={openFrom} onOpenChange={setOpenFrom}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    id='date-from'
                    className='w-full justify-between font-normal h-11 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-[#EF1C25] focus:ring-1 focus:ring-[#EF1C25]'
                  >
                    {startDate
                      ? startDate.toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Select date'}
                    <ChevronDown className='h-4 w-4 text-gray-500' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto overflow-hidden p-0 bg-white border border-gray-200 shadow-xl rounded-xl'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={startDate}
                    onSelect={date => {
                      onStartDateChange?.(date);
                      setOpenFrom(false);
                    }}
                    disabled={date => date < new Date()}
                    className='p-4'
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className='flex flex-col gap-3'>
              <Label
                htmlFor='time-from'
                className='px-1 text-sm font-medium text-gray-700'
              >
                Time
              </Label>
              <Select value={startTime} onValueChange={onStartTimeChange}>
                <SelectTrigger className='h-11 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-[#EF1C25] focus:ring-1 focus:ring-[#EF1C25]'>
                  <SelectValue placeholder='Select time' />
                </SelectTrigger>
                <SelectContent className='max-h-80 overflow-y-auto min-w-[10rem]'>
                  {timeOptions.map(time => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Drop-off Section */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2'>
            Drop-off Details
          </h3>
          <div className='flex gap-4'>
            <div className='flex flex-1 flex-col gap-3'>
              <Label
                htmlFor='date-to'
                className='px-1 text-sm font-medium text-gray-700'
              >
                Date
              </Label>
              <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    id='date-to'
                    className='w-full justify-between font-normal h-11 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-[#EF1C25] focus:ring-1 focus:ring-[#EF1C25]'
                  >
                    {endDate
                      ? endDate.toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Select date'}
                    <ChevronDown className='h-4 w-4 text-gray-500' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto overflow-hidden p-0 bg-white border border-gray-200 shadow-xl rounded-xl'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={endDate}
                    onSelect={date => {
                      onEndDateChange?.(date);
                      setOpenTo(false);
                    }}
                    disabled={
                      startDate ? { before: startDate } : { before: new Date() }
                    }
                    className='p-4'
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className='flex flex-col gap-3'>
              <Label
                htmlFor='time-to'
                className='px-1 text-sm font-medium text-gray-700'
              >
                Time
              </Label>
              <Select value={endTime} onValueChange={onEndTimeChange}>
                <SelectTrigger className='h-11 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-[#EF1C25] focus:ring-1 focus:ring-[#EF1C25]'>
                  <SelectValue placeholder='Select time' />
                </SelectTrigger>
                <SelectContent className='max-h-80 overflow-y-auto min-w-[10rem]'>
                  {timeOptions.map(time => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
