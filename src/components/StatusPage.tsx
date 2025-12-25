import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRefreshButton?: boolean;
  children?: React.ReactNode;
}

export default function StatusPage({
  code,
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  showHomeButton = true,
  showBackButton = true,
  showRefreshButton = false,
  children,
}: StatusPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-mask" />
      
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[15%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-[10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-8"
          >
            <div className={`w-24 h-24 rounded-3xl bg-card border border-border/50 shadow-lg flex items-center justify-center mx-auto ${iconColor}`}>
              <Icon className="h-12 w-12" />
            </div>
          </motion.div>

          {/* Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="text-8xl sm:text-9xl font-bold text-gradient">{code}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold mb-4"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
          >
            {description}
          </motion.p>

          {/* Custom Content */}
          {children && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              {children}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回上页
              </Button>
            )}
            {showHomeButton && (
              <Link to="/">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  返回首页
                </Button>
              </Link>
            )}
            {showRefreshButton && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                刷新页面
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
