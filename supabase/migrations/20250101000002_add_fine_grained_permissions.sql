-- =====================================================
-- 升级 permissions 表支持细粒度权限控制
-- =====================================================

-- 添加 action 列
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS action VARCHAR(50);

-- 根据现有 name 字段智能设置 action 值
UPDATE permissions SET action = CASE
  WHEN name LIKE '%read%' OR name LIKE '%查看%' THEN 'read'
  WHEN name LIKE '%delete%' OR name LIKE '%删除%' THEN 'delete'
  WHEN name LIKE '%create%' OR name LIKE '%update%' OR name LIKE '%manage%' 
       OR name LIKE '%创建%' OR name LIKE '%编辑%' OR name LIKE '%修改%' OR name LIKE '%管理%' THEN 'write'
  ELSE 'read'
END
WHERE action IS NULL;

-- 删除旧的唯一约束（如果存在）
DO $$ 
BEGIN
  -- 删除旧的 name 唯一约束
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'permissions_name_key'
  ) THEN
    ALTER TABLE permissions DROP CONSTRAINT permissions_name_key;
  END IF;
  
  -- 删除 module_action 约束（如果存在），以便清理数据后重建
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'permissions_module_action_key'
  ) THEN
    ALTER TABLE permissions DROP CONSTRAINT permissions_module_action_key;
  END IF;
END $$;

-- 清理可能的重复数据（保留每个 module 每种 action 的第一条记录）
DELETE FROM permissions a USING permissions b
WHERE a.id > b.id 
  AND a.module = b.module 
  AND a.action = b.action;

-- 创建新的唯一约束
ALTER TABLE permissions ADD CONSTRAINT permissions_module_action_key UNIQUE (module, action);

-- 现在 action 列不能为空
ALTER TABLE permissions ALTER COLUMN action SET NOT NULL;

-- =====================================================
-- 迁移现有权限数据
-- =====================================================

-- 为缺少 write 权限的模块添加写入权限
INSERT INTO permissions (module, action, name, description)
SELECT DISTINCT
  module,
  'write',
  '编辑' || CASE 
    WHEN module = 'users' THEN '用户'
    WHEN module = 'roles' THEN '角色'
    WHEN module = 'dashboard' THEN '仪表盘'
    WHEN module = 'settings' THEN '设置'
    ELSE module
  END,
  '创建、编辑和修改' || CASE 
    WHEN module = 'users' THEN '用户'
    WHEN module = 'roles' THEN '角色'
    WHEN module = 'dashboard' THEN '仪表盘'
    WHEN module = 'settings' THEN '设置'
    ELSE module
  END
FROM permissions
WHERE module IN ('dashboard', 'users', 'roles', 'settings')
  AND NOT EXISTS (
    SELECT 1 FROM permissions p2 
    WHERE p2.module = permissions.module AND p2.action = 'write'
  )
ON CONFLICT (module, action) DO NOTHING;

-- 为缺少 delete 权限的模块添加删除权限
INSERT INTO permissions (module, action, name, description)
SELECT DISTINCT
  module,
  'delete',
  '删除' || CASE 
    WHEN module = 'users' THEN '用户'
    WHEN module = 'roles' THEN '角色'
    ELSE module
  END,
  '删除' || CASE 
    WHEN module = 'users' THEN '用户'
    WHEN module = 'roles' THEN '角色'
    ELSE module
  END
FROM permissions
WHERE module IN ('users', 'roles')
  AND NOT EXISTS (
    SELECT 1 FROM permissions p2 
    WHERE p2.module = permissions.module AND p2.action = 'delete'
  )
ON CONFLICT (module, action) DO NOTHING;

-- =====================================================
-- 为新功能添加细粒度权限
-- =====================================================

INSERT INTO permissions (module, action, name, description) VALUES
  -- 数据字典
  ('data_dictionary', 'read', '查看数据字典', '查看数据库表结构和字段定义'),
  ('data_dictionary', 'write', '编辑数据字典', '创建、修改数据表和字段'),
  ('data_dictionary', 'delete', '删除数据字典', '删除数据表和字段'),

  -- 定时任务
  ('scheduled_tasks', 'read', '查看定时任务', '查看所有定时任务列表'),
  ('scheduled_tasks', 'write', '管理定时任务', '创建、编辑、启用/禁用任务'),
  ('scheduled_tasks', 'delete', '删除定时任务', '删除定时任务'),

  -- API 令牌
  ('api_tokens', 'read', '查看 API 令牌', '查看所有 API 令牌'),
  ('api_tokens', 'write', '管理 API 令牌', '创建、撤销 API 令牌'),
  ('api_tokens', 'delete', '删除 API 令牌', '永久删除 API 令牌'),

  -- Swagger 文档
  ('swagger_docs', 'read', '查看 API 文档', '查看 Swagger API 文档'),
  ('swagger_docs', 'write', '管理 API 文档', '导入、编辑 API 文档'),
  ('swagger_docs', 'delete', '删除 API 文档', '删除 API 文档'),

  -- SQL 编辑器
  ('sql_editor', 'read', '使用 SQL 编辑器', '执行只读 SQL 查询'),
  ('sql_editor', 'write', '执行写入 SQL', '执行 INSERT、UPDATE、DELETE'),
  ('sql_editor', 'delete', '执行危险 SQL', '执行 DROP、TRUNCATE 等危险操作')
ON CONFLICT (module, action) DO NOTHING;

-- =====================================================
-- 为 admin 角色自动授予所有权限
-- =====================================================

INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id
FROM permissions
ON CONFLICT DO NOTHING;

-- =====================================================
-- 为 moderator 设置默认权限
-- =====================================================

-- 协管员默认权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'moderator', id
FROM permissions
WHERE (module = 'data_dictionary' AND action = 'read')
   OR (module = 'swagger_docs' AND action = 'read')
   OR (module = 'users' AND action IN ('read', 'write'))
ON CONFLICT DO NOTHING;

-- =====================================================
-- 为 user 设置默认权限
-- =====================================================

INSERT INTO role_permissions (role, permission_id)
SELECT 'user', id
FROM permissions
WHERE (module = 'dashboard' AND action = 'read')
   OR (module = 'data_dictionary' AND action = 'read')
   OR (module = 'swagger_docs' AND action = 'read')
ON CONFLICT DO NOTHING;
