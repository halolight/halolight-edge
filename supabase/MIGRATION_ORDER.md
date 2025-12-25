# Supabase 迁移文件执行顺序

本文档记录了所有数据库迁移文件的执行顺序和功能说明。

## 📋 执行顺序

Supabase 会按照文件名的**时间戳前缀**自动排序执行迁移文件。

### 执行列表

| 序号 | 文件名 | 执行时间 | 功能说明 | 状态 |
|------|--------|----------|----------|------|
| 1 | `20250101000000_add_new_features.sql` | 2025-01-01 00:00:00 | 添加新功能（数据字典、定时任务、API令牌、Swagger文档） | ✅ |
| 2 | `20250101000001_sql_editor.sql` | 2025-01-01 00:00:01 | SQL编辑器功能（execute_sql函数） | ✅ |
| 3 | `20250101000002_add_fine_grained_permissions.sql` | 2025-01-01 00:00:02 | 细粒度权限系统 | ✅ |
| 4 | `20251223121817_d9f6c9c4-5366-4b7f-b0d8-e6ee8f6234b7.sql` | 2025-12-23 12:18:17 | Supabase自动生成的迁移 | ✅ |
| 5 | `20251223121825_e090a599-595b-4e53-a6ef-798b5e001740.sql` | 2025-12-23 12:18:25 | Supabase自动生成的迁移 | ✅ |
| 6 | `20251223123809_339f26cb-f38f-4c77-a0af-76f32edf36f4.sql` | 2025-12-23 12:38:09 | Supabase自动生成的迁移 | ✅ |
| 7 | `20251223123839_1541decb-b8c7-43b5-a7a0-fa32c1c28c3b.sql` | 2025-12-23 12:38:39 | Supabase自动生成的迁移 | ✅ |
| 8 | `20251224090619_772df4e5-1b9b-4c69-8d0b-bb33f3ee7d6d.sql` | 2025-12-24 09:06:19 | Supabase自动生成的迁移 | ✅ |
| 9 | `20251225000000_fix_execute_sql.sql` | 2025-12-25 00:00:00 | 修复execute_sql函数，增强安全性和功能 | ✅ |
| 10 | `20251225120000_refactor_data_dictionary.sql` | 2025-12-25 12:00:00 | **数据字典系统重构**（支持JS数据类型） | ✅ |

## 📚 详细说明

### 1. 基础功能迁移 (2025-01-01)

#### `20250101000000_add_new_features.sql`
**功能**：添加核心业务功能
- ✅ 数据字典表（data_tables, data_fields）
- ✅ 定时任务表（scheduled_tasks, task_execution_history）
- ✅ API令牌表（api_tokens, api_token_usage）
- ✅ Swagger文档表（api_docs, api_endpoints）
- ✅ 相关索引和RLS策略
- ✅ 触发器和辅助函数

**依赖**：
- 需要 `user_roles` 表已存在
- 需要 `auth.users` 表已存在

#### `20250101000001_sql_editor.sql`
**功能**：SQL编辑器功能
- ✅ `execute_sql(query text)` 函数
- ✅ 支持动态SQL执行
- ✅ 返回JSON格式结果

**依赖**：
- 基础表结构已创建

#### `20250101000002_add_fine_grained_permissions.sql`
**功能**：细粒度权限系统
- ✅ 权限表结构
- ✅ 角色权限映射
- ✅ 权限检查函数

**依赖**：
- `user_roles` 表已存在
- 基础RLS策略已配置

---

### 2. Supabase 自动迁移 (2025-12-23 ~ 2025-12-24)

这些是通过 Supabase Studio 或 CLI 自动生成的迁移文件：

- `20251223121817_*` - Schema 同步
- `20251223121825_*` - 配置更新
- `20251223123809_*` - 表结构调整
- `20251223123839_*` - 索引优化
- `20251224090619_*` - RLS策略调整

**建议**：定期审查这些自动生成的文件，确保与预期一致。

---

### 3. 功能增强与修复 (2025-12-25)

#### `20251225000000_fix_execute_sql.sql`
**功能**：修复和增强 SQL 编辑器
- ✅ 改进 `execute_sql` 函数的安全性
- ✅ 添加查询验证和过滤
- ✅ 增强错误处理
- ✅ 优化性能

**修复内容**：
- 防止 SQL 注入
- 限制危险操作
- 改进结果返回格式

**依赖**：
- `20250101000001_sql_editor.sql` 必须已执行

#### `20251225120000_refactor_data_dictionary.sql` ⭐ **重要**
**功能**：数据字典系统完全重构
- 🔄 **删除旧表**：`data_fields`, `data_tables`
- ✅ **新建表**：
  - `dictionary_namespaces` - 命名空间管理
  - `dictionary_entries` - 字典条目（支持所有JS数据类型）
  - `dictionary_entry_versions` - 版本历史
  - `dictionary_access_logs` - 访问日志
- ✅ **支持数据类型**：
  - string, number, boolean, array, object, null, date, regexp
- ✅ **新功能**：
  - 自动版本追踪
  - 导入/导出 JSON
  - 完整的审计日志
- ✅ **辅助函数**：
  - `get_entry_history(p_entry_id UUID)`
  - `export_namespace_data(p_namespace_id UUID)`
  - `import_namespace_data(p_data JSONB, p_user_id UUID)`

**⚠️ 注意**：
- 此迁移会**删除**旧的 `data_tables` 和 `data_fields` 表
- **执行前请备份**相关数据
- 建议在测试环境先验证

**依赖**：
- `20250101000000_add_new_features.sql` 创建的旧表结构
- `user_roles` 表用于 RLS 策略

---

## 🔄 执行命令

### 本地开发环境

```bash
# 重置数据库（会清空所有数据）
supabase db reset

# 仅应用新迁移
supabase migration up

# 查看迁移状态
supabase migration list
```

### 生产环境

```bash
# 推送迁移到远程
supabase db push

# 或使用 Supabase Dashboard
# 1. 进入 Database → Migrations
# 2. 查看待执行的迁移
# 3. 点击 "Apply migrations"
```

---

## 📝 迁移最佳实践

### 1. 命名规范

```
YYYYMMDDHHMMSS_描述性名称.sql
```

示例：
- `20251225120000_refactor_data_dictionary.sql`
- `20251225000000_fix_execute_sql.sql`

### 2. 迁移文件结构

```sql
-- =====================================================
-- 功能描述
-- =====================================================

-- 删除旧对象（如果需要）
DROP TABLE IF EXISTS old_table CASCADE;

-- 创建新对象
CREATE TABLE IF NOT EXISTS new_table (...);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- RLS 策略
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_name" ON new_table;
CREATE POLICY "policy_name" ON new_table ...;

-- 触发器和函数
CREATE OR REPLACE FUNCTION function_name() ...;
DROP TRIGGER IF EXISTS trigger_name ON table;
CREATE TRIGGER trigger_name ...;
```

### 3. 幂等性原则

所有迁移应该是**幂等的**（可以安全地多次执行）：

- ✅ 使用 `IF NOT EXISTS`
- ✅ 使用 `CREATE OR REPLACE`
- ✅ 先 `DROP` 再 `CREATE`

### 4. 回滚策略

如果迁移失败需要回滚：

```bash
# 查看当前版本
supabase migration list

# 回滚到指定版本（需要手动创建回滚脚本）
# 建议为重要迁移创建对应的 rollback 文件
```

---

## ⚠️ 重要提示

### 生产环境执行前

1. **备份数据库**
   ```bash
   supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **测试环境验证**
   - 在测试环境完整测试所有迁移
   - 验证数据完整性
   - 检查性能影响

3. **制定回滚计划**
   - 准备回滚脚本
   - 确定回滚触发条件
   - 通知相关人员

4. **监控执行**
   - 查看执行日志
   - 监控数据库性能
   - 验证功能正常

### 数据迁移注意事项

对于 `20251225120000_refactor_data_dictionary.sql`：

```sql
-- 如果需要保留旧数据，在删除表前先导出
-- 在迁移文件顶部添加：

-- 备份旧数据
CREATE TEMP TABLE temp_data_tables AS SELECT * FROM data_tables;
CREATE TEMP TABLE temp_data_fields AS SELECT * FROM data_fields;

-- ... 执行迁移 ...

-- 迁移数据到新表（需要自定义逻辑）
-- INSERT INTO dictionary_entries (...) SELECT ... FROM temp_data_fields;
```

---

## 🔍 故障排查

### 常见问题

1. **迁移失败：表已存在**
   - 检查是否已执行过该迁移
   - 使用 `IF NOT EXISTS` 或 `DROP TABLE IF EXISTS`

2. **权限错误**
   - 确保数据库用户有足够权限
   - 检查 RLS 策略是否阻止操作

3. **外键约束失败**
   - 检查依赖表是否存在
   - 确认执行顺序正确

4. **函数或触发器错误**
   - 使用 `CREATE OR REPLACE`
   - 先删除再创建

---

## 📞 联系方式

如有问题，请联系：
- 开发团队：[GitHub Issues](链接)
- DBA团队：数据库管理员

---

**最后更新**：2025-12-25
**维护者**：开发团队

