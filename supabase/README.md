# Supabase 配置与迁移

本目录包含项目的 Supabase 配置、数据库迁移文件和云函数。

## 📁 目录结构

```
supabase/
├── config.toml              # Supabase 配置文件
├── migrations/              # 数据库迁移文件
│   ├── 20250101000000_*.sql
│   ├── 20251225120000_*.sql
│   └── ...
├── functions/               # Supabase Edge Functions
│   └── create-user/        # 用户创建函数
│       ├── index.ts
│       └── deno.json
├── MIGRATION_ORDER.md      # 📋 迁移执行顺序详细文档
└── README.md               # 本文件
```

## 🚀 快速开始

### 1. 初始化本地开发环境

```bash
# 启动本地 Supabase
supabase start

# 查看服务状态
supabase status
```

### 2. 应用数据库迁移

```bash
# 重置数据库（清空所有数据）
supabase db reset

# 仅应用新迁移
supabase migration up

# 查看迁移状态
supabase migration list
```

### 3. 创建新迁移

```bash
# 使用 Supabase CLI 创建迁移
supabase migration new migration_name

# 或者手动创建
# 文件名格式: YYYYMMDDHHMMSS_description.sql
touch migrations/$(date +%Y%m%d%H%M%S)_add_new_feature.sql
```

## 📋 核心迁移文件

| 文件 | 功能 | 重要性 |
|------|------|--------|
| `20250101000000_add_new_features.sql` | 基础功能（数据字典、定时任务等） | ⭐⭐⭐ |
| `20250101000001_sql_editor.sql` | SQL编辑器功能 | ⭐⭐⭐ |
| `20250101000002_add_fine_grained_permissions.sql` | 细粒度权限系统 | ⭐⭐⭐ |
| `20251225000000_fix_execute_sql.sql` | 修复SQL执行函数 | ⭐⭐ |
| `20251225120000_refactor_data_dictionary.sql` | 数据字典重构 | ⭐⭐⭐⭐⭐ |

> 📖 **详细说明请查看**: [MIGRATION_ORDER.md](./MIGRATION_ORDER.md)

## 🔧 常用命令

### 数据库操作

```bash
# 查看数据库URL和密钥
supabase status

# 连接到本地数据库
supabase db remote set <database-url>

# 备份数据库
supabase db dump -f backup.sql

# 重置数据库
supabase db reset
```

### 迁移管理

```bash
# 创建新迁移
supabase migration new feature_name

# 应用迁移
supabase migration up

# 查看迁移历史
supabase migration list

# 修复迁移历史
supabase migration repair
```

### Edge Functions

```bash
# 部署所有函数
supabase functions deploy

# 部署单个函数
supabase functions deploy create-user

# 查看函数日志
supabase functions logs create-user

# 本地测试函数
supabase functions serve create-user
```

## 📦 已部署的 Edge Functions

### create-user
**功能**：创建新用户并分配角色

**端点**：`/functions/v1/create-user`

**请求示例**：
```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/create-user' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "full_name": "张三",
    "role": "user"
  }'
```

## 🗄️ 数据库架构

### 核心表

#### 用户相关
- `profiles` - 用户配置文件
- `user_roles` - 用户角色映射

#### 数据字典系统（新）
- `dictionary_namespaces` - 命名空间
- `dictionary_entries` - 字典条目（支持JS数据类型）
- `dictionary_entry_versions` - 版本历史
- `dictionary_access_logs` - 访问日志

#### 权限系统
- `permissions` - 权限定义
- `role_permissions` - 角色权限映射

#### 其他功能
- `scheduled_tasks` - 定时任务
- `api_tokens` - API令牌
- `api_docs` - API文档
- `audit_logs` - 审计日志

## 🔐 安全配置

### RLS (Row Level Security)

所有表都启用了 RLS，策略示例：

```sql
-- 用户只能查看自己的数据
CREATE POLICY "Users can view own data"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 管理员可以查看所有数据
CREATE POLICY "Admins can view all data"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### 环境变量

本地开发需要的环境变量（`.env`文件）：

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 数据字典系统（最新）

### 支持的数据类型

- `string` - 字符串
- `number` - 数字
- `boolean` - 布尔值
- `array` - 数组
- `object` - JSON对象
- `null` - 空值
- `date` - 日期
- `regexp` - 正则表达式

### 核心功能

- ✅ 命名空间管理
- ✅ 版本历史追踪
- ✅ 导入/导出 JSON
- ✅ 标签系统
- ✅ 访问日志
- ✅ 类型验证

### 辅助函数

```sql
-- 获取条目历史
SELECT * FROM get_entry_history('entry-uuid');

-- 导出命名空间数据
SELECT export_namespace_data('namespace-uuid');

-- 批量导入数据
SELECT import_namespace_data('{"namespace": {...}, "entries": [...]}', auth.uid());
```

## 🔄 开发工作流

### 1. 本地开发

```bash
# 启动本地环境
supabase start

# 修改数据库
# 方式1: 创建迁移文件
supabase migration new add_feature

# 方式2: 通过 Supabase Studio
# 访问 http://localhost:54323
```

### 2. 提交变更

```bash
# 生成迁移文件（如果使用Studio修改）
supabase db diff -f migration_name

# 提交到 Git
git add supabase/migrations/
git commit -m "feat: add new migration"
```

### 3. 部署到生产

```bash
# 推送迁移
supabase db push

# 部署函数
supabase functions deploy

# 验证部署
supabase projects list
```

## ⚠️ 注意事项

### 执行迁移前

1. ✅ **备份数据库**
   ```bash
   supabase db dump -f backup_$(date +%Y%m%d).sql
   ```

2. ✅ **在测试环境验证**
   - 先在本地测试
   - 再在预发布环境测试
   - 最后部署到生产

3. ✅ **检查依赖关系**
   - 确保前置迁移已执行
   - 验证表和函数存在性

### 重要迁移

`20251225120000_refactor_data_dictionary.sql` 会**删除旧表**：
- `data_tables`
- `data_fields`

**执行前请确保**：
- 已备份相关数据
- 已通知相关人员
- 前端代码已更新

## 📚 相关文档

- [MIGRATION_ORDER.md](./MIGRATION_ORDER.md) - 完整迁移顺序说明
- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 🐛 故障排查

### 迁移失败

```bash
# 查看详细错误
supabase db reset --debug

# 查看迁移状态
supabase migration list

# 手动修复
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### 函数部署失败

```bash
# 查看函数日志
supabase functions logs function-name

# 本地测试
supabase functions serve function-name --debug
```

### RLS 策略问题

```sql
-- 临时禁用 RLS（仅开发环境）
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- 检查策略
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

## 📞 获取帮助

- 📖 查看 [MIGRATION_ORDER.md](./MIGRATION_ORDER.md)
- 🐛 提交 [GitHub Issue](https://github.com/your-repo/issues)
- 💬 联系开发团队

---

**最后更新**: 2025-12-25

