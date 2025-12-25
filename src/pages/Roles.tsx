import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  RefreshCw,
  CheckSquare,
  Square,
  Wand2,
  Database,
  Clock,
  Key,
  Book,
  Code,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppRole, Permission, RolePermission } from '@/types/auth';

interface RoleData {
  role: AppRole;
  label: string;
  description: string;
  color: string;
  userCount: number;
}

const roles: RoleData[] = [
  {
    role: 'admin',
    label: '管理员',
    description: '拥有系统所有权限，可以管理用户、角色和系统设置',
    color: 'bg-primary/10 text-primary border-primary/20',
    userCount: 0,
  },
  {
    role: 'moderator',
    label: '协管员',
    description: '可以查看和编辑用户信息，但不能修改角色权限',
    color: 'bg-warning/10 text-warning border-warning/20',
    userCount: 0,
  },
  {
    role: 'user',
    label: '普通用户',
    description: '基础用户权限，只能访问仪表盘',
    color: 'bg-muted text-muted-foreground border-border',
    userCount: 0,
  },
];

const moduleConfig = [
  { key: 'dashboard', label: '仪表盘', icon: Shield },
  { key: 'users', label: '用户管理', icon: Users },
  { key: 'roles', label: '角色管理', icon: Shield },
  { key: 'settings', label: '系统设置', icon: Shield },
  { key: 'data_dictionary', label: '数据字典', icon: Database },
  { key: 'scheduled_tasks', label: '定时任务', icon: Clock },
  { key: 'api_tokens', label: 'API 令牌', icon: Key },
  { key: 'swagger_docs', label: 'API 文档', icon: Book },
  { key: 'sql_editor', label: 'SQL 编辑器', icon: Code },
];

const permissionActions = ['read', 'write', 'delete'] as const;
const actionLabels = { read: '查看', write: '编辑', delete: '删除' };

// 权限模板
const permissionTemplates = [
  {
    name: '开发者',
    description: '适合开发和测试人员',
    permissions: {
      moderator: [
        'data_dictionary:read',
        'data_dictionary:write',
        'swagger_docs:read',
        'sql_editor:read',
        'scheduled_tasks:read',
      ],
    },
  },
  {
    name: '运维人员',
    description: '适合运维和监控人员',
    permissions: {
      moderator: [
        'scheduled_tasks:read',
        'scheduled_tasks:write',
        'api_tokens:read',
        'sql_editor:read',
      ],
    },
  },
  {
    name: '只读用户',
    description: '只能查看，不能修改',
    permissions: {
      user: ['dashboard:read', 'data_dictionary:read', 'swagger_docs:read'],
    },
  },
];

export default function Roles() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleCounts, setRoleCounts] = useState<Record<AppRole, number>>({
    admin: 0,
    moderator: 0,
    user: 0,
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('moderator');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [permsResult, rolePermsResult, userRolesResult] = await Promise.all([
        supabase.from('permissions').select('*').order('module'),
        supabase.from('role_permissions').select('*'),
        supabase.from('user_roles').select('role'),
      ]);

      if (permsResult.error) throw permsResult.error;
      if (rolePermsResult.error) throw rolePermsResult.error;
      if (userRolesResult.error) throw userRolesResult.error;

      const counts = { admin: 0, moderator: 0, user: 0 };
      (userRolesResult.data || []).forEach((ur) => {
        const role = ur.role as AppRole;
        if (role in counts) {
          counts[role]++;
        }
      });

      setPermissions((permsResult.data as Permission[]) || []);
      setRolePermissions((rolePermsResult.data as RolePermission[]) || []);
      setRoleCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: '获取数据失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasPermission = (role: AppRole, permissionId: string): boolean => {
    return rolePermissions.some((rp) => rp.role === role && rp.permission_id === permissionId);
  };

  const togglePermission = async (role: AppRole, permissionId: string) => {
    if (role === 'admin') return; // Admin 总是拥有所有权限

    const key = `${role}-${permissionId}`;
    const currentHas = hasPermission(role, permissionId);

    setSavingKey(key);

    try {
      if (currentHas) {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_id', permissionId);

        if (error) throw error;

        setRolePermissions((prev) =>
          prev.filter((rp) => !(rp.role === role && rp.permission_id === permissionId))
        );

        toast({ title: '权限已移除', duration: 2000 });
      } else {
        const { data, error } = await supabase
          .from('role_permissions')
          .insert({ role, permission_id: permissionId })
          .select()
          .single();

        if (error) throw error;

        setRolePermissions((prev) => [...prev, data as RolePermission]);

        toast({ title: '权限已添加', duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
      fetchData();
    } finally {
      setSavingKey(null);
    }
  };

  // 批量授予某个角色的所有权限
  const grantAllPermissions = async (role: AppRole) => {
    if (role === 'admin') return;

    if (!confirm(`确定要为 ${roles.find((r) => r.role === role)?.label} 授予所有权限吗？`)) {
      return;
    }

    try {
      const permissionIds = permissions.map((p) => p.id);
      const existingIds = rolePermissions
        .filter((rp) => rp.role === role)
        .map((rp) => rp.permission_id);

      const toAdd = permissionIds.filter((id) => !existingIds.includes(id));

      if (toAdd.length === 0) {
        toast({ title: '该角色已拥有所有权限' });
        return;
      }

      const inserts = toAdd.map((permId) => ({ role, permission_id: permId }));

      const { error } = await supabase.from('role_permissions').insert(inserts);

      if (error) throw error;

      toast({ title: '批量授权成功', description: `已添加 ${toAdd.length} 个权限` });
      fetchData();
    } catch (error) {
      console.error('Error granting all permissions:', error);
      toast({ title: '批量操作失败', variant: 'destructive' });
    }
  };

  // 批量撤销某个角色的所有权限
  const revokeAllPermissions = async (role: AppRole) => {
    if (role === 'admin') return;

    if (!confirm(`确定要撤销 ${roles.find((r) => r.role === role)?.label} 的所有权限吗？`)) {
      return;
    }

    try {
      const { error } = await supabase.from('role_permissions').delete().eq('role', role);

      if (error) throw error;

      toast({ title: '批量撤销成功' });
      fetchData();
    } catch (error) {
      console.error('Error revoking all permissions:', error);
      toast({ title: '批量操作失败', variant: 'destructive' });
    }
  };

  // 应用权限模板
  const applyTemplate = async () => {
    if (!selectedTemplate) {
      toast({ title: '请选择模板', variant: 'destructive' });
      return;
    }

    const template = permissionTemplates.find((t) => t.name === selectedTemplate);
    if (!template) return;

    try {
      // 先清空目标角色的权限
      await supabase.from('role_permissions').delete().eq('role', selectedRole);

      // 获取权限 ID 映射
      const permissionMap = new Map(permissions.map((p) => [`${p.module}:${p.action}`, p.id]));

      const templatePerms = template.permissions[selectedRole] || [];
      const inserts = templatePerms
        .map((perm) => {
          const permId = permissionMap.get(perm);
          return permId ? { role: selectedRole, permission_id: permId } : null;
        })
        .filter(Boolean);

      if (inserts.length > 0) {
        const { error } = await supabase.from('role_permissions').insert(inserts as any);
        if (error) throw error;
      }

      toast({ title: '模板应用成功', description: `已配置 ${inserts.length} 个权限` });
      setIsTemplateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error applying template:', error);
      toast({ title: '应用模板失败', variant: 'destructive' });
    }
  };

  // 按模块和操作分组权限
  const groupedPermissions = moduleConfig.map((module) => {
    const modulePerms = permissions.filter((p) => p.module === module.key);
    const actions = permissionActions.map((action) => {
      const perm = modulePerms.find((p) => p.action === action);
      return {
        action,
        permission: perm,
      };
    });
    return {
      module: module.key,
      label: module.label,
      icon: module.icon,
      actions,
    };
  });

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
              <Shield className="h-8 w-8 text-primary" />
              角色权限管理
            </h1>
            <p className="mt-2 text-muted-foreground">细粒度权限配置 · 支持批量操作和模板</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(true)}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              应用模板
            </Button>
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {roles.map((roleData, index) => (
            <motion.div
              key={roleData.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border ${roleData.color}`}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className={roleData.color}>{roleData.label}</Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">{roleCounts[roleData.role]}</span>
                    </div>
                  </div>
                  <CardDescription className="min-h-[40px]">{roleData.description}</CardDescription>
                  {roleData.role !== 'admin' && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => grantAllPermissions(roleData.role)}
                        className="flex-1 gap-1"
                      >
                        <CheckSquare className="h-3 w-3" />
                        全部授予
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeAllPermissions(roleData.role)}
                        className="flex-1 gap-1"
                      >
                        <Square className="h-3 w-3" />
                        全部撤销
                      </Button>
                    </div>
                  )}
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              权限配置矩阵（细粒度控制）
            </CardTitle>
            <CardDescription>为每个角色配置具体的操作权限 · 修改后立即生效</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              groupedPermissions.map((group) => (
                <motion.div
                  key={group.module}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{group.label}</h3>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    {/* Header */}
                    <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                      <div>操作</div>
                      {roles.map((r) => (
                        <div key={r.role} className="text-center">
                          {r.label}
                        </div>
                      ))}
                    </div>

                    {/* Permission Rows */}
                    {group.actions.map((action, idx) => (
                      <div key={action.action}>
                        <div className="grid grid-cols-4 items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30">
                          <div>
                            <Badge variant="outline" className="font-mono text-xs">
                              {actionLabels[action.action]}
                            </Badge>
                          </div>
                          {roles.map((r) => {
                            const permId = action.permission?.id;
                            if (!permId) {
                              return (
                                <div key={r.role} className="flex justify-center">
                                  <span className="text-xs text-muted-foreground">-</span>
                                </div>
                              );
                            }

                            const key = `${r.role}-${permId}`;
                            const isChecked = hasPermission(r.role, permId);
                            const isSaving = savingKey === key;
                            const isAdmin = r.role === 'admin';

                            return (
                              <div key={r.role} className="flex justify-center">
                                <Switch
                                  checked={isAdmin || isChecked}
                                  onCheckedChange={() => togglePermission(r.role, permId)}
                                  disabled={isAdmin || isSaving}
                                  className={isSaving ? 'opacity-50' : ''}
                                />
                              </div>
                            );
                          })}
                        </div>
                        {idx < group.actions.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                应用权限模板
              </DialogTitle>
              <DialogDescription>快速配置常用的权限组合</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">选择角色</label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">协管员</SelectItem>
                    <SelectItem value="user">普通用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">选择模板</label>
                <div className="space-y-2">
                  {permissionTemplates.map((template) => (
                    <Card
                      key={template.name}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === template.name
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.name)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                          {selectedTemplate === template.name && (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-warning/20 bg-warning/10 p-3">
                <p className="flex items-center gap-2 text-sm text-warning">
                  <Shield className="h-4 w-4" />
                  应用模板会覆盖该角色的现有权限配置
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={applyTemplate} disabled={!selectedTemplate}>
                应用模板
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
