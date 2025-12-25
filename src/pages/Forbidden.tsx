import { ShieldX } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function Forbidden() {
  return (
    <StatusPage
      code="403"
      title="访问被拒绝"
      description="抱歉，您没有权限访问此页面。如果您认为这是一个错误，请联系管理员获取帮助。"
      icon={ShieldX}
      iconColor="text-destructive"
    />
  );
}
