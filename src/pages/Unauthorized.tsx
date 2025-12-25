import { Link } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function Unauthorized() {
  return (
    <StatusPage
      code="401"
      title="未授权访问"
      description="您需要登录才能访问此页面。请先登录您的账号，或注册一个新账号。"
      icon={UserX}
      iconColor="text-warning"
      showHomeButton={false}
    >
      <Link to="/auth?mode=login">
        <Button className="gap-2">
          <LogIn className="h-4 w-4" />
          前往登录
        </Button>
      </Link>
    </StatusPage>
  );
}
