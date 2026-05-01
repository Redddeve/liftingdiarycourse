'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({ date }: { date: Date }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSelect(selected: Date | undefined) {
    if (!selected) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(selected, 'yyyy-MM-dd'));
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-56 justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(date, 'do MMM yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onSelect} autoFocus />
      </PopoverContent>
    </Popover>
  );
}
