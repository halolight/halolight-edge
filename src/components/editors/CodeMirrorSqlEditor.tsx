import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { cn } from '@/lib/utils';

interface CodeMirrorSqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeMirrorSqlEditor({
  value,
  onChange,
  className,
  placeholder = '输入 SQL 语句...',
  height = '300px',
  readOnly = false,
}: CodeMirrorSqlEditorProps) {
  return (
    <div className={cn('overflow-hidden rounded-md border', className)}>
      <CodeMirror
        value={value}
        height={height}
        extensions={[sql()]}
        onChange={onChange}
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
        className="text-sm"
      />
    </div>
  );
}
