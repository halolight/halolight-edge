-- =====================================================
-- 数据字典系统重构
-- 支持 JavaScript 数据类型的键值对存储
-- =====================================================

-- 删除旧的数据字典表
DROP TABLE IF EXISTS data_fields CASCADE;
DROP TABLE IF EXISTS data_tables CASCADE;

-- =====================================================
-- 命名空间/分组表
-- =====================================================
CREATE TABLE IF NOT EXISTS dictionary_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 字典条目表（支持所有 JS 数据类型）
-- =====================================================
CREATE TABLE IF NOT EXISTS dictionary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id UUID NOT NULL REFERENCES dictionary_namespaces(id) ON DELETE CASCADE,
  key VARCHAR(500) NOT NULL,
  value JSONB NOT NULL,
  data_type VARCHAR(50) NOT NULL CHECK (
    data_type IN ('string', 'number', 'boolean', 'array', 'object', 'null', 'date', 'regexp')
  ),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_encrypted BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(namespace_id, key)
);

-- =====================================================
-- 版本历史表
-- =====================================================
CREATE TABLE IF NOT EXISTS dictionary_entry_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  key VARCHAR(500) NOT NULL,
  value JSONB NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  description TEXT,
  tags TEXT[],
  metadata JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type VARCHAR(20) CHECK (change_type IN ('create', 'update', 'delete')),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, version_number)
);

-- =====================================================
-- API 访问日志表
-- =====================================================
CREATE TABLE IF NOT EXISTS dictionary_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES dictionary_entries(id) ON DELETE SET NULL,
  namespace_id UUID REFERENCES dictionary_namespaces(id) ON DELETE SET NULL,
  action VARCHAR(20) CHECK (action IN ('read', 'create', 'update', 'delete', 'export', 'import')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 索引优化
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dictionary_namespaces_name ON dictionary_namespaces(name);
CREATE INDEX IF NOT EXISTS idx_dictionary_namespaces_created_at ON dictionary_namespaces(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dictionary_entries_namespace ON dictionary_entries(namespace_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_entries_key ON dictionary_entries(key);
CREATE INDEX IF NOT EXISTS idx_dictionary_entries_data_type ON dictionary_entries(data_type);
CREATE INDEX IF NOT EXISTS idx_dictionary_entries_tags ON dictionary_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dictionary_entries_value ON dictionary_entries USING GIN(value);
CREATE INDEX IF NOT EXISTS idx_dictionary_entries_created_at ON dictionary_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dictionary_versions_entry ON dictionary_entry_versions(entry_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_versions_created_at ON dictionary_entry_versions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dictionary_logs_entry ON dictionary_access_logs(entry_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_logs_namespace ON dictionary_access_logs(namespace_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_logs_action ON dictionary_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_dictionary_logs_created_at ON dictionary_access_logs(created_at DESC);

-- =====================================================
-- RLS (Row Level Security) 策略
-- =====================================================
ALTER TABLE dictionary_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_entry_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_access_logs ENABLE ROW LEVEL SECURITY;

-- 命名空间策略
DROP POLICY IF EXISTS "Anyone can view namespaces" ON dictionary_namespaces;
CREATE POLICY "Anyone can view namespaces" 
  ON dictionary_namespaces FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage namespaces" ON dictionary_namespaces;
CREATE POLICY "Authenticated users can manage namespaces" 
  ON dictionary_namespaces FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- 字典条目策略
DROP POLICY IF EXISTS "Anyone can view entries" ON dictionary_entries;
CREATE POLICY "Anyone can view entries" 
  ON dictionary_entries FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage entries" ON dictionary_entries;
CREATE POLICY "Authenticated users can manage entries" 
  ON dictionary_entries FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- 版本历史策略
DROP POLICY IF EXISTS "Anyone can view versions" ON dictionary_entry_versions;
CREATE POLICY "Anyone can view versions" 
  ON dictionary_entry_versions FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can create versions" ON dictionary_entry_versions;
CREATE POLICY "System can create versions" 
  ON dictionary_entry_versions FOR INSERT 
  WITH CHECK (true);

-- 访问日志策略
DROP POLICY IF EXISTS "Admins can view logs" ON dictionary_access_logs;
CREATE POLICY "Admins can view logs" 
  ON dictionary_access_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "System can create logs" ON dictionary_access_logs;
CREATE POLICY "System can create logs" 
  ON dictionary_access_logs FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- 触发器：自动更新 updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_dictionary_namespaces_updated_at ON dictionary_namespaces;
CREATE TRIGGER update_dictionary_namespaces_updated_at 
  BEFORE UPDATE ON dictionary_namespaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dictionary_entries_updated_at ON dictionary_entries;
CREATE TRIGGER update_dictionary_entries_updated_at 
  BEFORE UPDATE ON dictionary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 触发器：自动创建版本历史
-- =====================================================
CREATE OR REPLACE FUNCTION create_entry_version()
RETURNS TRIGGER AS $$
DECLARE
  v_version_number INTEGER;
BEGIN
  -- 获取下一个版本号
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM dictionary_entry_versions
  WHERE entry_id = NEW.id;

  -- 插入版本记录
  INSERT INTO dictionary_entry_versions (
    entry_id, version_number, key, value, data_type, 
    description, tags, metadata, changed_by, change_type
  ) VALUES (
    NEW.id, v_version_number, NEW.key, NEW.value, NEW.data_type,
    NEW.description, NEW.tags, NEW.metadata, NEW.created_by,
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_dictionary_entry_version ON dictionary_entries;
CREATE TRIGGER create_dictionary_entry_version
  AFTER INSERT OR UPDATE ON dictionary_entries
  FOR EACH ROW EXECUTE FUNCTION create_entry_version();

-- =====================================================
-- 触发器：记录删除操作到版本历史
-- =====================================================
CREATE OR REPLACE FUNCTION log_entry_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_version_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM dictionary_entry_versions
  WHERE entry_id = OLD.id;

  INSERT INTO dictionary_entry_versions (
    entry_id, version_number, key, value, data_type,
    description, tags, metadata, changed_by, change_type, change_summary
  ) VALUES (
    OLD.id, v_version_number, OLD.key, OLD.value, OLD.data_type,
    OLD.description, OLD.tags, OLD.metadata, auth.uid(), 'delete',
    'Entry deleted'
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_dictionary_entry_deletion ON dictionary_entries;
CREATE TRIGGER log_dictionary_entry_deletion
  BEFORE DELETE ON dictionary_entries
  FOR EACH ROW EXECUTE FUNCTION log_entry_deletion();

-- =====================================================
-- 辅助函数：获取条目完整历史
-- =====================================================
CREATE OR REPLACE FUNCTION get_entry_history(p_entry_id UUID)
RETURNS TABLE (
  version_number INTEGER,
  key VARCHAR,
  value JSONB,
  data_type VARCHAR,
  change_type VARCHAR,
  changed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.version_number,
    v.key,
    v.value,
    v.data_type,
    v.change_type,
    v.changed_by,
    v.created_at
  FROM dictionary_entry_versions v
  WHERE v.entry_id = p_entry_id
  ORDER BY v.version_number DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 辅助函数：导出命名空间数据为 JSON
-- =====================================================
CREATE OR REPLACE FUNCTION export_namespace_data(p_namespace_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'namespace', jsonb_build_object(
      'id', n.id,
      'name', n.name,
      'description', n.description,
      'icon', n.icon,
      'color', n.color
    ),
    'entries', COALESCE(jsonb_agg(
      jsonb_build_object(
        'key', e.key,
        'value', e.value,
        'data_type', e.data_type,
        'description', e.description,
        'tags', e.tags,
        'metadata', e.metadata
      )
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM dictionary_namespaces n
  LEFT JOIN dictionary_entries e ON e.namespace_id = n.id
  WHERE n.id = p_namespace_id
  GROUP BY n.id, n.name, n.description, n.icon, n.color;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 辅助函数：批量导入数据
-- =====================================================
CREATE OR REPLACE FUNCTION import_namespace_data(p_data JSONB, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_namespace_id UUID;
  v_entry JSONB;
  v_imported_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
BEGIN
  -- 创建或获取命名空间
  INSERT INTO dictionary_namespaces (name, description, icon, color, created_by)
  VALUES (
    p_data->'namespace'->>'name',
    p_data->'namespace'->>'description',
    COALESCE(p_data->'namespace'->>'icon', 'folder'),
    COALESCE(p_data->'namespace'->>'color', 'blue'),
    p_user_id
  )
  ON CONFLICT (name) DO UPDATE 
  SET description = EXCLUDED.description
  RETURNING id INTO v_namespace_id;

  -- 导入条目
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_data->'entries')
  LOOP
    BEGIN
      INSERT INTO dictionary_entries (
        namespace_id, key, value, data_type, description, tags, metadata, created_by
      ) VALUES (
        v_namespace_id,
        v_entry->>'key',
        v_entry->'value',
        v_entry->>'data_type',
        v_entry->>'description',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(v_entry->'tags', '[]'::jsonb))),
        COALESCE(v_entry->'metadata', '{}'::jsonb),
        p_user_id
      )
      ON CONFLICT (namespace_id, key) DO UPDATE
      SET 
        value = EXCLUDED.value,
        data_type = EXCLUDED.data_type,
        description = EXCLUDED.description,
        tags = EXCLUDED.tags,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
      
      v_imported_count := v_imported_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_skipped_count := v_skipped_count + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'namespace_id', v_namespace_id,
    'imported', v_imported_count,
    'skipped', v_skipped_count
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 初始数据：创建示例命名空间
-- =====================================================
INSERT INTO dictionary_namespaces (name, description, icon, color) VALUES
  ('应用配置', '应用程序全局配置项', 'settings', 'blue'),
  ('常量定义', '系统常量和枚举值', 'hash', 'purple'),
  ('API配置', 'API接口相关配置', 'api', 'green')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 初始数据：创建示例条目
-- =====================================================
DO $$
DECLARE
  v_app_config_id UUID;
  v_constants_id UUID;
  v_api_config_id UUID;
BEGIN
  SELECT id INTO v_app_config_id FROM dictionary_namespaces WHERE name = '应用配置';
  SELECT id INTO v_constants_id FROM dictionary_namespaces WHERE name = '常量定义';
  SELECT id INTO v_api_config_id FROM dictionary_namespaces WHERE name = 'API配置';

  -- 应用配置示例
  INSERT INTO dictionary_entries (namespace_id, key, value, data_type, description, tags) VALUES
    (v_app_config_id, 'appName', to_jsonb('HaloLight'::text), 'string', '应用程序名称', ARRAY['基础配置']),
    (v_app_config_id, 'version', to_jsonb('1.0.0'::text), 'string', '当前版本号', ARRAY['基础配置']),
    (v_app_config_id, 'maxUploadSize', to_jsonb(10485760), 'number', '最大上传文件大小（字节）', ARRAY['限制']),
    (v_app_config_id, 'enableDebug', to_jsonb(false), 'boolean', '是否启用调试模式', ARRAY['开发']),
    (v_app_config_id, 'supportedLanguages', '["zh-CN", "en-US", "ja-JP"]'::jsonb, 'array', '支持的语言列表', ARRAY['国际化']),
    (v_app_config_id, 'themeConfig', '{"primaryColor": "#3b82f6", "darkMode": true}'::jsonb, 'object', '主题配置对象', ARRAY['UI'])
  ON CONFLICT (namespace_id, key) DO NOTHING;

  -- 常量定义示例
  INSERT INTO dictionary_entries (namespace_id, key, value, data_type, description, tags) VALUES
    (v_constants_id, 'USER_ROLES', '["admin", "moderator", "user"]'::jsonb, 'array', '用户角色列表', ARRAY['用户']),
    (v_constants_id, 'STATUS_CODES', '{"SUCCESS": 200, "ERROR": 500, "NOT_FOUND": 404}'::jsonb, 'object', 'HTTP状态码映射', ARRAY['HTTP']),
    (v_constants_id, 'PAGE_SIZE', to_jsonb(20), 'number', '默认分页大小', ARRAY['分页'])
  ON CONFLICT (namespace_id, key) DO NOTHING;

  -- API配置示例
  INSERT INTO dictionary_entries (namespace_id, key, value, data_type, description, tags) VALUES
    (v_api_config_id, 'baseURL', to_jsonb('https://api.halolight.com'::text), 'string', 'API基础地址', ARRAY['端点']),
    (v_api_config_id, 'timeout', to_jsonb(30000), 'number', '请求超时时间（毫秒）', ARRAY['网络']),
    (v_api_config_id, 'retryAttempts', to_jsonb(3), 'number', '失败重试次数', ARRAY['网络'])
  ON CONFLICT (namespace_id, key) DO NOTHING;
END $$;

