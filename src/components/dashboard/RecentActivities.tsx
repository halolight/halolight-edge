import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Activity {
  user: string;
  action: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

export function RecentActivities({ activities, loading }: RecentActivitiesProps) {
  const navigate = useNavigate();

  const getActivityDot = (type: Activity['type']) => {
    const colors = {
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-destructive',
      info: 'bg-info',
    };
    return (
      <motion.div
        className={`h-2 w-2 rounded-full ${colors[type]}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      />
    );
  };

  return (
    <Card className="flex h-full flex-col border-border/50">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-primary" />
          最近活动
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/audit-logs')}
        >
          查看全部
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-start gap-3 p-2">
                <div className="mt-2 h-2 w-2 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <Clock className="empty-state-icon" />
            <p className="text-muted-foreground">暂无活动记录</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex cursor-pointer items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="mt-1.5">{getActivityDot(activity.type)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                    {activity.user}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{activity.action}</p>
                </div>
                <span className="flex-shrink-0 whitespace-nowrap text-xs text-muted-foreground/70">
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
