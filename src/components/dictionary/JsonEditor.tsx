import { CodeMirrorJsonEditor } from '@/components/editors/CodeMirrorJsonEditor';

interface JsonEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
  placeholder?: string;
}

export function JsonEditor({ value, onChange, className, placeholder }: JsonEditorProps) {
  return (
    <CodeMirrorJsonEditor
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
    />
  );
}

