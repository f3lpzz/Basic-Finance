import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  value: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onDateRangeChange }) => {
  const [dateRange, setDateRange] = useState<DateRange>(value);
  const [customDaysToday, setCustomDaysToday] = useState('30');
  const [customDaysYesterday, setCustomDaysYesterday] = useState('30');
  const [open, setOpen] = useState(false);

  // Update internal state when value prop changes
  React.useEffect(() => {
    setDateRange(value);
  }, [value]);

  const getDisplayText = () => {
    if (!value.from || !value.to) return 'Selecionar período';
    
    const today = new Date();
    // Normalize today to start of day for consistent comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const from = value.from;
    const to = value.to;
    
    // Normalize dates to compare only date parts (ignore time)
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getTime() === date2.getTime();
    };
    
    // Check predefined periods
    if (isSameDay(from, todayStart) && isSameDay(to, todayStart)) {
      return 'Hoje';
    }
    
    if (isSameDay(from, yesterdayStart) && isSameDay(to, yesterdayStart)) {
      return 'Ontem';
    }
    
    // Check for 7 days ago (from 7 days ago to today)
    const sevenDaysAgo = subDays(todayStart, 7);
    if (isSameDay(from, sevenDaysAgo) && isSameDay(to, todayStart)) {
      return '7 dias atrás';
    }
    
    // Check for 14 days ago
    const fourteenDaysAgo = subDays(todayStart, 14);
    if (isSameDay(from, fourteenDaysAgo) && isSameDay(to, todayStart)) {
      return '14 dias atrás';
    }
    
    // Check for 30 days ago
    const thirtyDaysAgo = subDays(todayStart, 30);
    if (isSameDay(from, thirtyDaysAgo) && isSameDay(to, todayStart)) {
      return '30 dias atrás';
    }
    
    // Check if it's current month
    const currentMonthStart = startOfMonth(todayStart);
    const currentMonthEnd = endOfMonth(todayStart);
    if (isSameDay(from, currentMonthStart) && isSameDay(to, currentMonthEnd)) {
      return 'Este mês';
    }
    
    // Check if it's last month
    const lastMonth = subMonths(todayStart, 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);
    if (isSameDay(from, lastMonthStart) && isSameDay(to, lastMonthEnd)) {
      return 'Último mês';
    }
    
    // Check for this week (Sunday to today)
    const thisWeekStart = startOfWeek(todayStart, { weekStartsOn: 0 });
    if (isSameDay(from, thisWeekStart) && isSameDay(to, todayStart)) {
      return 'Esta semana (dom. até hoje)';
    }
    
    // Check for last week (Sunday to Saturday)
    const lastWeekStart = startOfWeek(subDays(todayStart, 7), { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(subDays(todayStart, 7), { weekStartsOn: 0 });
    if (isSameDay(from, lastWeekStart) && isSameDay(to, lastWeekEnd)) {
      return 'Semana passada (de dom. a sáb.)';
    }
    
    // Check for all time (starting from 2020)
    const allTimeStart = new Date(2020, 0, 1);
    if (isSameDay(from, allTimeStart) && isSameDay(to, todayStart)) {
      return 'Todo o período';
    }
    
    // Default format for custom ranges
    return `${format(from, 'd \'de\' MMM', { locale: ptBR })} - ${format(to, 'd \'de\' MMM. yyyy', { locale: ptBR })}`;
  };

  const handlePredefinedPeriod = (period: string) => {
    const today = new Date();
    // Normalize today to start of day for consistent comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let newRange: DateRange = { from: undefined, to: undefined };

    switch (period) {
      case 'today':
        newRange = { from: todayStart, to: todayStart };
        break;
      case 'yesterday':
        const yesterday = subDays(todayStart, 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      case 'thisWeek':
        newRange = { from: startOfWeek(todayStart, { weekStartsOn: 0 }), to: todayStart };
        break;
      case 'last7Days':
        newRange = { from: subDays(todayStart, 7), to: todayStart };
        break;
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(todayStart, 7), { weekStartsOn: 0 });
        const lastWeekEnd = endOfWeek(subDays(todayStart, 7), { weekStartsOn: 0 });
        newRange = { from: lastWeekStart, to: lastWeekEnd };
        break;
      case 'last14Days':
        newRange = { from: subDays(todayStart, 14), to: todayStart };
        break;
      case 'thisMonth':
        newRange = { from: startOfMonth(todayStart), to: endOfMonth(todayStart) };
        break;
      case 'last30Days':
        newRange = { from: subDays(todayStart, 30), to: todayStart };
        break;
      case 'lastMonth':
        const lastMonth = subMonths(todayStart, 1);
        newRange = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        break;
      case 'allTime':
        newRange = { from: new Date(2020, 0, 1), to: todayStart };
        break;
    }

    setDateRange(newRange);
    onDateRangeChange(newRange);
    setOpen(false); // Close the sheet after selection
  };

  const handleCustomDays = (type: 'today' | 'yesterday') => {
    const today = new Date();
    const days = parseInt(type === 'today' ? customDaysToday : customDaysYesterday);
    
    if (isNaN(days) || days <= 0) return;

    const baseDate = type === 'today' ? today : subDays(today, 1);
    const newRange = { from: subDays(baseDate, days - 1), to: baseDate };
    
    setDateRange(newRange);
    onDateRangeChange(newRange);
    setOpen(false); // Close the sheet after selection
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      // Don't call onDateRangeChange here - wait for user to click Apply
    }
  };

  const handleApplyCustomRange = () => {
    if (dateRange.from && dateRange.to) {
      onDateRangeChange(dateRange);
      setOpen(false);
    }
  };

  const predefinedOptions = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: 'thisWeek', label: 'Esta semana (dom. até hoje)' },
    { key: 'last7Days', label: '7 dias atrás' },
    { key: 'lastWeek', label: 'Semana passada (de dom. a sáb.)' },
    { key: 'last14Days', label: '14 dias atrás' },
    { key: 'thisMonth', label: 'Este mês' },
    { key: 'last30Days', label: '30 dias atrás' },
    { key: 'lastMonth', label: 'Último mês' },
    { key: 'allTime', label: 'Todo o período' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Personalizar</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Predefined periods */}
          <div className="space-y-2">
            {predefinedOptions.map((option) => (
              <Button
                key={option.key}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePredefinedPeriod(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Custom days */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={customDaysToday}
                onChange={(e) => setCustomDaysToday(e.target.value)}
                className="w-16"
                min="1"
              />
              <span className="text-sm">dias até hoje</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCustomDays('today')}
              >
                Aplicar
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={customDaysYesterday}
                onChange={(e) => setCustomDaysYesterday(e.target.value)}
                className="w-16"
                min="1"
              />
              <span className="text-sm">dias até ontem</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCustomDays('yesterday')}
              >
                Aplicar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Calendar */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Selecionar período</h4>
            <div className="border rounded-md p-1">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleCalendarSelect}
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
                classNames={{
                  day_range_start: "bg-primary text-primary-foreground rounded-full",
                  day_range_end: "bg-primary text-primary-foreground rounded-full", 
                  day_range_middle: "bg-primary/20 text-foreground rounded-none",
                  day_selected: "bg-primary text-primary-foreground rounded-full"
                }}
              />
            </div>
            
            {/* Apply button for custom date range */}
            <div className="flex justify-end">
              <Button 
                onClick={handleApplyCustomRange}
                disabled={!dateRange.from || !dateRange.to}
                className="w-full"
              >
                Aplicar período personalizado
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};