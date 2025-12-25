import { DataType } from '@/types/dictionary';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { JsonEditor } from './JsonEditor';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { deserializeValue, serializeValue } from '@/utils/dictionaryUtils';

interface ValueEditorProps {
  dataType: DataType;
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
}

export function ValueEditor({ dataType, value, onChange, className }: ValueEditorProps) {
  const deserializedValue = deserializeValue(value, dataType);

  const handleChange = (newValue: unknown) => {
    const serialized = serializeValue(newValue, dataType);
    onChange(serialized);
  };

  switch (dataType) {
    case 'string':
      return (
        <Textarea
          value={deserializedValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="输入字符串..."
          className={cn('min-h-[100px]', className)}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={deserializedValue || 0}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          placeholder="输入数字..."
          className={className}
        />
      );

    case 'boolean':
      return (
        <div className={cn('flex items-center space-x-2', className)}>
          <Checkbox
            id="boolean-value"
            checked={deserializedValue || false}
            onCheckedChange={(checked) => handleChange(checked)}
          />
          <Label htmlFor="boolean-value" className="cursor-pointer">
            {deserializedValue ? 'True' : 'False'}
          </Label>
        </div>
      );

    case 'array':
    case 'object':
      return (
        <JsonEditor
          value={deserializedValue}
          onChange={handleChange}
          className={className}
          placeholder={dataType === 'array' ? '例如: ["item1", "item2"]' : '例如: {"key": "value"}'}
        />
      );

    case 'null':
      return (
        <div className={cn('rounded-md bg-muted p-4 text-center text-muted-foreground', className)}>
          null
        </div>
      );

    case 'date': {
      const dateValue = deserializedValue
        ? new Date(deserializedValue as string | number | Date)
        : new Date();
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateValue && 'text-muted-foreground',
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, 'PPP HH:mm:ss') : '选择日期'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => date && handleChange(date)}
              initialFocus
            />
            <div className="border-t p-3">
              <Input
                type="time"
                value={format(dateValue, 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(dateValue);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  handleChange(newDate);
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    case 'regexp': {
      const regexpValue = (deserializedValue as { pattern: string; flags: string }) || {
        pattern: '',
        flags: '',
      };
      return (
        <div className={cn('space-y-2', className)}>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label>Pattern</Label>
              <Input
                value={regexpValue.pattern || ''}
                onChange={(e) => handleChange({ ...regexpValue, pattern: e.target.value })}
                placeholder="正则表达式模式..."
                className="font-mono"
              />
            </div>
            <div>
              <Label>Flags</Label>
              <Input
                value={regexpValue.flags || ''}
                onChange={(e) => handleChange({ ...regexpValue, flags: e.target.value })}
                placeholder="gim"
                className="font-mono"
                maxLength={5}
              />
            </div>
          </div>
          <div className="rounded bg-muted p-2 font-mono text-sm text-muted-foreground">
            /{regexpValue.pattern}/{regexpValue.flags}
          </div>
        </div>
      );
    }

    default:
      return (
        <Input
          value={String(deserializedValue || '')}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="输入值..."
          className={className}
        />
      );
  }
}
