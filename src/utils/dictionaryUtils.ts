// =====================================================
// 数据字典工具函数
// =====================================================

import { DataType } from '@/types/dictionary';

/**
 * 将 JavaScript 值序列化为 JSON 存储格式
 */
export function serializeValue(value: unknown, dataType: DataType): unknown {
  switch (dataType) {
    case 'string':
      // 直接存储字符串，JSONB 会自动处理 JSON 编码
      return String(value);
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'array':
      return Array.isArray(value) ? value : JSON.parse(value as string);
    case 'object':
      return typeof value === 'object' ? value : JSON.parse(value as string);
    case 'null':
      return null;
    case 'date':
      return value instanceof Date ? value.toISOString() : new Date(value as string | number).toISOString();
    case 'regexp': {
      if (value instanceof RegExp) {
        return { pattern: value.source, flags: value.flags };
      }
      const regexpVal = value as { pattern: string; flags?: string };
      return regexpVal;
    }
    default:
      return value;
  }
}

/**
 * 将存储的 JSON 值反序列化为 JavaScript 值
 * Supabase 的 JSONB 字段会自动解析 JSON，所以这里主要处理已解析的值
 */
export function deserializeValue(value: unknown, dataType: DataType): unknown {
  switch (dataType) {
    case 'string':
      // JSONB 自动解析后直接返回字符串
      return String(value || '');
    case 'number':
      return Number(value || 0);
    case 'boolean':
      return Boolean(value);
    case 'array':
      return Array.isArray(value) ? value : [];
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
    case 'null':
      return null;
    case 'date':
      return value ? new Date(value as string | number | Date) : new Date();
    case 'regexp': {
      const regexpVal = value as { pattern?: string; flags?: string } | null | undefined;
      return regexpVal?.pattern ? new RegExp(regexpVal.pattern, regexpVal.flags || '') : /./;
    }
    default:
      return value;
  }
}

/**
 * 格式化显示值
 */
export function formatDisplayValue(value: unknown, dataType: DataType): string {
  try {
    const deserialized = deserializeValue(value, dataType);
    
    switch (dataType) {
      case 'string':
        return String(deserialized);
      case 'number':
      case 'boolean':
        return String(deserialized);
      case 'array':
      case 'object':
        return JSON.stringify(deserialized, null, 2);
      case 'null':
        return 'null';
      case 'date': {
        return new Date(deserialized as string | Date).toLocaleString();
      }
      case 'regexp': {
        const regexp = deserialized as RegExp;
        return `/${regexp.source}/${regexp.flags}`;
      }
      default:
        return String(value);
    }
  } catch (error) {
    console.error('Format display value error:', error);
    return String(value);
  }
}

/**
 * 验证值是否符合数据类型
 */
export function validateValueType(value: unknown, dataType: DataType): { valid: boolean; error?: string } {
  try {
    switch (dataType) {
      case 'string':
        // 接受任何可以转换为字符串的值
        return { valid: true };
      
      case 'number':
        if (value === '' || value === null || value === undefined) {
          return { valid: false, error: '值不能为空' };
        }
        if (isNaN(Number(value))) {
          return { valid: false, error: '值必须是有效数字' };
        }
        return { valid: true };
      
      case 'boolean':
        return { valid: true };
      
      case 'array':
        if (!Array.isArray(value)) {
          return { valid: false, error: '值必须是数组' };
        }
        return { valid: true };
      
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return { valid: false, error: '值必须是对象' };
        }
        return { valid: true };
      
      case 'null':
        return { valid: true };
      
      case 'date': {
        if (!value) {
          return { valid: false, error: '日期不能为空' };
        }
        const dateValue = new Date(value as string | Date);
        if (isNaN(dateValue.getTime())) {
          return { valid: false, error: '值必须是有效日期' };
        }
        return { valid: true };
      }
      
      case 'regexp': {
        const regexpValue = value as { pattern?: string; flags?: string } | null | undefined;
        if (!regexpValue?.pattern) {
          return { valid: false, error: '正则表达式格式无效' };
        }
        // 验证正则表达式是否有效
        try {
          new RegExp(regexpValue.pattern, regexpValue.flags || '');
        } catch {
          return { valid: false, error: '正则表达式语法无效' };
        }
        return { valid: true };
      }
      
      default:
        return { valid: false, error: '未知数据类型' };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : '值格式无效' };
  }
}

/**
 * 获取数据类型的默认值
 */
export function getDefaultValue(dataType: DataType): unknown {
  switch (dataType) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'null':
      return null;
    case 'date':
      return new Date().toISOString();
    case 'regexp':
      return { pattern: '.*', flags: '' };
    default:
      return null;
  }
}

/**
 * 数据类型选项
 */
export const DATA_TYPE_OPTIONS: Array<{ value: DataType; label: string; icon: string; color: string }> = [
  { value: 'string', label: '字符串', icon: 'Type', color: 'blue' },
  { value: 'number', label: '数字', icon: 'Hash', color: 'green' },
  { value: 'boolean', label: '布尔值', icon: 'ToggleLeft', color: 'purple' },
  { value: 'array', label: '数组', icon: 'List', color: 'orange' },
  { value: 'object', label: '对象', icon: 'Braces', color: 'pink' },
  { value: 'null', label: 'Null', icon: 'Circle', color: 'gray' },
  { value: 'date', label: '日期', icon: 'Calendar', color: 'cyan' },
  { value: 'regexp', label: '正则', icon: 'Regex', color: 'red' },
];

/**
 * 导出为 JSON 文件
 */
export function exportToJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 从 JSON 文件导入
 */
export function importFromJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('JSON 文件格式无效'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

/**
 * 生成唯一键名建议
 */
export function generateKeySuggestion(namespace: string, baseKey: string = 'newKey'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${namespace}_${baseKey}_${timestamp}_${random}`;
}

/**
 * 深度比较两个值是否相等
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

