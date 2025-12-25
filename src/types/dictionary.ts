// =====================================================
// 数据字典类型定义
// =====================================================

export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'date'
  | 'regexp';

export interface DictionaryNamespace {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DictionaryEntry {
  id: string;
  namespace_id: string;
  key: string;
  value: any;
  data_type: DataType;
  description: string | null;
  tags: string[];
  is_encrypted: boolean;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DictionaryEntryVersion {
  id: string;
  entry_id: string;
  version_number: number;
  key: string;
  value: any;
  data_type: DataType;
  description: string | null;
  tags: string[] | null;
  metadata: Record<string, any> | null;
  changed_by: string | null;
  change_type: 'create' | 'update' | 'delete';
  change_summary: string | null;
  created_at: string;
}

export interface DictionaryAccessLog {
  id: string;
  entry_id: string | null;
  namespace_id: string | null;
  action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'import';
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ExportData {
  namespace: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
  };
  entries: Array<{
    key: string;
    value: any;
    data_type: DataType;
    description: string | null;
    tags: string[];
    metadata: Record<string, any>;
  }>;
}

export interface ImportResult {
  namespace_id: string;
  imported: number;
  skipped: number;
}

// Form 数据类型
export interface NamespaceFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface EntryFormData {
  key: string;
  value: any;
  data_type: DataType;
  description: string;
  tags: string[];
  metadata: Record<string, any>;
}
