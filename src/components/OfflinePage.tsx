import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Background Effects */}
      <div className="bg-grid absolute inset-0 opacity-30" />
      <div className="bg-radial-mask absolute inset-0" />

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[15%] top-20 h-64 w-64 rounded-full bg-warning/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto mb-8"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-warning/20 bg-warning/10 shadow-lg">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <WifiOff className="h-12 w-12 text-warning" />
              </motion.div>
            </div>
          </motion.div>

          {/* Network Animation */}
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <span className="text-gradient text-6xl font-bold sm:text-7xl">离线</span>
          </motion.div>

          <h1 className="mb-4 text-2xl font-bold sm:text-3xl">网络连接已断开</h1>

          <p className="mx-auto mb-6 max-w-md text-lg text-muted-foreground">
            请检查您的网络连接，确保已连接到互联网后再试。
          </p>

          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/10 px-4 py-2 text-sm text-warning">
              <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
              <span>等待网络连接...</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              重新加载
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
