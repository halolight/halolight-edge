import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedIllustration } from './AnimatedIllustration';
import { ThemeToggle } from './ThemeToggle';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  illustrationType?: '404' | '403' | '401' | '500' | '503' | 'offline' | 'error';
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
  illustrationType,
  showHomeButton = true,
  showBackButton = true,
  showRefreshButton = false,
  children,
}: StatusPageProps) {
  // Auto-detect illustration type from code if not provided
  const getIllustrationType = (): '404' | '403' | '401' | '500' | '503' | 'offline' | 'error' => {
    if (illustrationType) return illustrationType;
    switch (code) {
      case '404':
        return '404';
      case '403':
        return '403';
      case '401':
        return '401';
      case '500':
        return '500';
      case '503':
        return '503';
      case '离线':
        return 'offline';
      default:
        return 'error';
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Theme Toggle - Top Right */}
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="bg-grid absolute inset-0 opacity-30" />
      <div className="bg-radial-mask absolute inset-0" />

      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[15%] top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-[10%] h-80 w-80 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Illustration */}
          <AnimatedIllustration type={getIllustrationType()} icon={Icon} iconColor={iconColor} />

          {/* Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="text-gradient text-7xl font-bold sm:text-8xl">{code}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-2xl font-bold sm:text-3xl"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mb-8 max-w-md text-lg text-muted-foreground"
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
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {showBackButton && (
              <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
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
              <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
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
