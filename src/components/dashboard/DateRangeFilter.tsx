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
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onDateRangeChange }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [customDaysToday, setCustomDaysToday] = useState('30');
  const [customDaysYesterday, setCustomDaysYesterday] = useState('30');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [open, setOpen] = useState(false);

  const getDisplayText = () => {
    if (!dateRange.from || !dateRange.to) return 'Selecionar período';
    
    const today = new Date();
    const from = dateRange.from;
    const to = dateRange.to;
    
    // Check predefined periods
    if (isToday(from) && isToday(to)) {
      return 'Hoje';
    }
    
    if (isYesterday(from) && isYesterday(to)) {
      return 'Ontem';
    }
    
    // Check if it's current month
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    if (from.getTime() === currentMonthStart.getTime() && to.getTime() === currentMonthEnd.getTime()) {
      return `Este mês: ${format(from, 'd', { locale: ptBR })} a ${format(to, 'd \'de\' MMM. yyyy', { locale: ptBR })}`;
    }
    
    // Default format for custom ranges
    return `${format(from, 'd \'de\' MMM', { locale: ptBR })} - ${format(to, 'd \'de\' MMM. yyyy', { locale: ptBR })}`;
  };

  const handlePredefinedPeriod = (period: string) => {
    const today = new Date();
    let newRange: DateRange = { from: undefined, to: undefined };

    switch (period) {
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      case 'thisWeek':
        newRange = { from: startOfWeek(today, { weekStartsOn: 0 }), to: today };
        break;
      case 'last7Days':
        newRange = { from: subDays(today, 7), to: today };
        break;
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 0 });
        const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 0 });
        newRange = { from: lastWeekStart, to: lastWeekEnd };
        break;
      case 'last14Days':
        newRange = { from: subDays(today, 14), to: today };
        break;
      case 'thisMonth':
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case 'last30Days':
        newRange = { from: subDays(today, 30), to: today };
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        newRange = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        break;
      case 'allTime':
        newRange = { from: new Date(2020, 0, 1), to: today };
        break;
    }

    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleCustomDays = (type: 'today' | 'yesterday') => {
    const today = new Date();
    const days = parseInt(type === 'today' ? customDaysToday : customDaysYesterday);
    
    if (isNaN(days) || days <= 0) return;

    const baseDate = type === 'today' ? today : subDays(today, 1);
    const newRange = { from: subDays(baseDate, days - 1), to: baseDate };
    
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      onDateRangeChange(range);
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

          {/* Compare toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="compare">Comparar</Label>
            <Switch
              id="compare"
              checked={compareEnabled}
              onCheckedChange={setCompareEnabled}
            />
          </div>

          <Separator />

          {/* Calendar */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Selecionar período</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Data de início</Label>
                <div className="border rounded-md p-1">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => handleCalendarSelect({ from: date, to: dateRange.to })}
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Data de término</Label>
                <div className="border rounded-md p-1">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => handleCalendarSelect({ from: dateRange.from, to: date })}
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};