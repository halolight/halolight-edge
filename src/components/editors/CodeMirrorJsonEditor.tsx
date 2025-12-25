import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeMirrorJsonEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeMirrorJsonEditor({
  value,
  onChange,
  className,
  placeholder = '输入 JSON 数据...',
  height = '200px',
  readOnly = false,
}: CodeMirrorJsonEditorProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      const formatted = JSON.stringify(value, null, 2);
      setText(formatted);
      setError(null);
      setIsValid(true);
    } catch {
      setText(String(value));
    }
  }, [value]);

  const handleChange = (newText: string) => {
    setText(newText);

    if (!newText.trim()) {
      setError(null);
      setIsValid(true);
      onChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(newText);
      setError(null);
      setIsValid(true);
      onChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON 格式无效');
      setIsValid(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative overflow-hidden rounded-md border">
        <CodeMirror
          value={text}
          height={height}
          extensions={[json()]}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          className={cn('text-sm', !isValid && 'border-destructive')}
        />
        {isValid && text && !readOnly && (
          <div className="absolute right-2 top-2 z-10">
            <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
