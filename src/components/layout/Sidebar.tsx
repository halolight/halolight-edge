import { motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  LogOut,
  FileText,
  ExternalLink,
  Database,
  Clock,
  Key,
  Book,
  Code,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/dashboard', permission: 'dashboard:read' },
  { icon: Users, label: '用户管理', path: '/users', permission: 'users:read' },
  { icon: Shield, label: '角色权限', path: '/roles', permission: 'roles:read' },
  { icon: FileText, label: '审计日志', path: '/audit-logs', permission: 'roles:read' },
  { icon: Database, label: '数据字典', path: '/data-dictionary', permission: 'dashboard:read' },
  { icon: Clock, label: '定时任务', path: '/scheduled-tasks', permission: 'roles:read' },
  { icon: Key, label: 'API 令牌', path: '/api-tokens', permission: 'roles:read' },
  { icon: Book, label: 'API 文档', path: '/swagger-docs', permission: 'dashboard:read' },
  { icon: Code, label: 'SQL 编辑器', path: '/sql-editor', permission: 'roles:read' },
  { icon: Wrench, label: '开发工具', path: '/dev-tools', permission: 'dashboard:read' },
  { icon: Settings, label: '系统设置', path: '/settings', permission: 'settings:read' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isModerator, signOut } = useAuthContext();

  const filteredItems = menuItems.filter((item) => {
    // 管理员专属页面：角色权限、审计日志、数据字典、API文档、SQL编辑器
    const adminOnlyPaths = ['/audit-logs', '/data-dictionary', '/swagger-docs', '/sql-editor'];
    if (item.permission.includes('roles') || adminOnlyPaths.includes(item.path)) {
      return isAdmin;
    }
    if (item.permission.includes('users')) {
      return isModerator;
    }
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleHelpClick = () => {
    window.open('https://halolight.docs.h7ml.cn', '_blank');
  };

  const renderNavItem = (item: (typeof menuItems)[0], index: number) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const handleClick = (e: React.MouseEvent) => {
      // 阻止事件冒泡，避免触发其他行为
      e.stopPropagation();
    };

    const linkContent = (
      <NavLink
        to={item.path}
        onClick={handleClick}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive
              ? 'text-primary-foreground'
              : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
          )}
        />
        <motion.span
          initial={false}
          animate={{
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : 'auto',
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden whitespace-nowrap font-medium"
        >
          {item.label}
        </motion.span>
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {linkContent}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {linkContent}
      </motion.div>
    );
  };

  const helpButton = (
    <button
      onClick={handleHelpClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
        'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <HelpCircle className="h-5 w-5 flex-shrink-0" />
      <motion.span
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 overflow-hidden whitespace-nowrap font-medium"
      >
        帮助文档
        <ExternalLink className="h-3 w-3" />
      </motion.span>
    </button>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar shadow-sm"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          animate={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20"
          >
            <Zap className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              marginLeft: collapsed ? 0 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <span className="whitespace-nowrap text-lg font-bold tracking-tight text-sidebar-foreground">
              RBAC Admin
            </span>
            <p className="text-xs text-muted-foreground">企业级权限管理</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <motion.p
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
          className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          主导航
        </motion.p>
        {filteredItems.map((item, index) => renderNavItem(item, index))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2 px-3 pb-4">
        <Separator className="mb-4" />

        {/* Help Button */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{helpButton}</TooltipTrigger>
            <TooltipContent side="right">帮助文档</TooltipContent>
          </Tooltip>
        ) : (
          helpButton
        )}

        {/* Sign Out */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                  'text-destructive hover:bg-destructive/10'
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">退出登录</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleSignOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
              'text-destructive hover:bg-destructive/10'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">退出登录</span>
          </button>
        )}

        {/* Collapse Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="mt-2 w-full justify-center text-muted-foreground hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  <span>收起菜单</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex items-center gap-2">
              <span>{collapsed ? '展开菜单' : '收起菜单'}</span>
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘B
              </kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Collapsed mode indicator */}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex justify-center"
          >
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}
