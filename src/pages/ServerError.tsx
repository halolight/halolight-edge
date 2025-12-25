import { ServerCrash } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function ServerError() {
  return (
    <StatusPage
      code="500"
      title="服务器错误"
      description="抱歉，服务器遇到了一些问题。我们的技术团队已收到通知，正在紧急处理中。请稍后再试。"
      icon={ServerCrash}
      iconColor="text-destructive"
      showRefreshButton
    />
  );
}
