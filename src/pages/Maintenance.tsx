import { Construction, Clock } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function Maintenance() {
  return (
    <StatusPage
      code="503"
      title="系统维护中"
      description="系统正在进行升级维护，预计很快恢复。感谢您的耐心等待！"
      icon={Construction}
      iconColor="text-info"
      showBackButton={false}
      showRefreshButton
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>预计恢复时间：30 分钟内</span>
      </div>
    </StatusPage>
  );
}
