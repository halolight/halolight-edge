import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, XCircle, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServiceStatus {
  name: string;
  status: 'online' | 'warning' | 'offline';
  latency: string;
}

interface SystemStatusProps {
  services: ServiceStatus[];
}

export function SystemStatus({ services }: SystemStatusProps) {
  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'offline':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const allOnline = services.every((s) => s.status === 'online');

  return (
    <Card className="h-full border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            系统状态
          </CardTitle>
          <Badge variant="outline" className={allOnline ? 'badge-success' : 'badge-warning'}>
            <Wifi className="mr-1 h-3 w-3" />
            {allOnline ? '全部正常' : '部分异常'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <Badge
                variant="outline"
                className={`font-mono text-xs ${getStatusColor(service.status)}`}
              >
                {service.latency}
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
