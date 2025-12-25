-- =====================================================
-- 修复 SQL 编辑器的 execute_sql 函数
-- =====================================================

-- 删除旧函数
DROP FUNCTION IF EXISTS execute_sql(TEXT);

-- 创建改进的 execute_sql 函数
CREATE OR REPLACE FUNCTION execute_sql(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  is_admin BOOLEAN;
  cleaned_query TEXT;
  record_count INTEGER;
BEGIN
  -- 检查是否为管理员
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION '权限不足：仅管理员可以执行 SQL';
  END IF;

  -- 禁止危险操作
  IF query ~* '\s*(DROP\s+DATABASE|DROP\s+SCHEMA|TRUNCATE\s+auth\.)\s*' THEN
    RAISE EXCEPTION '禁止执行危险操作';
  END IF;

  -- 清理查询：移除末尾的分号和空白
  cleaned_query := TRIM(query);
  cleaned_query := REGEXP_REPLACE(cleaned_query, ';\s*$', '');

  -- 检查是否是 SELECT 查询
  IF cleaned_query ~* '^\s*SELECT' THEN
    -- SELECT 查询：返回结果集
    EXECUTE format('SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::JSONB) FROM (%s) t', cleaned_query) INTO result;
  ELSIF cleaned_query ~* '^\s*(INSERT|UPDATE|DELETE)' THEN
    -- DML 操作：执行并返回影响行数
    EXECUTE cleaned_query;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    result := jsonb_build_object(
      'success', true,
      'affected_rows', record_count,
      'message', format('成功执行，影响 %s 行', record_count)
    );
  ELSIF cleaned_query ~* '^\s*(CREATE|ALTER|DROP|TRUNCATE)' THEN
    -- DDL 操作：执行并返回成功消息
    EXECUTE cleaned_query;
    result := jsonb_build_object(
      'success', true,
      'message', '命令执行成功'
    );
  ELSE
    -- 其他类型的语句：尝试执行
    EXECUTE cleaned_query;
    result := jsonb_build_object(
      'success', true,
      'message', '命令执行完成'
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '执行失败: %', SQLERRM;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;

-- =====================================================
-- 同时更新带日志记录的版本
-- =====================================================

DROP FUNCTION IF EXISTS execute_sql_with_logging(TEXT);

CREATE OR REPLACE FUNCTION execute_sql_with_logging(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  is_admin BOOLEAN;
  cleaned_query TEXT;
  record_count INTEGER;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  exec_time INTEGER;
  exec_status VARCHAR(20);
  exec_error TEXT;
BEGIN
  start_time := clock_timestamp();

  -- 检查权限
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION '权限不足：仅管理员可以执行 SQL';
  END IF;

  -- 清理查询
  cleaned_query := TRIM(query);
  cleaned_query := REGEXP_REPLACE(cleaned_query, ';\s*$', '');

  -- 执行查询
  BEGIN
    IF cleaned_query ~* '^\s*SELECT' THEN
      EXECUTE format('SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::JSONB) FROM (%s) t', cleaned_query) INTO result;
    ELSIF cleaned_query ~* '^\s*(INSERT|UPDATE|DELETE)' THEN
      EXECUTE cleaned_query;
      GET DIAGNOSTICS record_count = ROW_COUNT;
      result := jsonb_build_object(
        'success', true,
        'affected_rows', record_count,
        'message', format('成功执行，影响 %s 行', record_count)
      );
    ELSIF cleaned_query ~* '^\s*(CREATE|ALTER|DROP|TRUNCATE)' THEN
      EXECUTE cleaned_query;
      result := jsonb_build_object(
        'success', true,
        'message', '命令执行成功'
      );
    ELSE
      EXECUTE cleaned_query;
      result := jsonb_build_object(
        'success', true,
        'message', '命令执行完成'
      );
    END IF;
    
    exec_status := 'success';
  EXCEPTION
    WHEN OTHERS THEN
      exec_status := 'error';
      exec_error := SQLERRM;
      result := NULL;
  END;

  -- 计算执行时间
  end_time := clock_timestamp();
  exec_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;

  -- 记录到历史表
  INSERT INTO sql_execution_history (
    user_id,
    sql_query,
    status,
    result,
    error_message,
    execution_time
  ) VALUES (
    auth.uid(),
    query,
    exec_status,
    result,
    exec_error,
    exec_time
  );

  -- 如果执行失败，抛出错误
  IF exec_status = 'error' THEN
    RAISE EXCEPTION '执行失败: %', exec_error;
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION execute_sql_with_logging(TEXT) TO authenticated;

