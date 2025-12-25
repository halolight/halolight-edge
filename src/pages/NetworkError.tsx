import { WifiOff } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function NetworkError() {
  return (
    <StatusPage
      code="离线"
      title="网络连接失败"
      description="无法连接到服务器，请检查您的网络连接后重试。"
      icon={WifiOff}
      iconColor="text-muted-foreground"
      showBackButton={false}
      showRefreshButton
    />
  );
}
