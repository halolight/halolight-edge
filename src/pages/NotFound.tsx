import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { FileQuestion } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <StatusPage
      code="404"
      title="页面未找到"
      description="抱歉，您访问的页面不存在或已被移除。请检查网址是否正确，或返回首页继续浏览。"
      icon={FileQuestion}
      iconColor="text-warning"
    />
  );
}
