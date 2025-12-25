import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  Users,
  Lock,
  BarChart3,
  Settings,
  ArrowRight,
  CheckCircle,
  Globe,
  Sparkles,
  FileCode,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const features = [
  {
    icon: Shield,
    title: '细粒度权限控制',
    description: '基于 RBAC 模型，支持角色、权限的灵活配置，精确控制每个功能的访问权限。',
  },
  {
    icon: Users,
    title: '用户管理',
    description: '完整的用户生命周期管理，包括注册、角色分配、状态管理等功能。',
  },
  {
    icon: Lock,
    title: '安全审计',
    description: '全面的操作日志记录，支持追踪每一次关键操作，确保系统安全合规。',
  },
  {
    icon: BarChart3,
    title: '数据可视化',
    description: '直观的数据仪表盘，实时展示系统运行状态和关键业务指标。',
  },
  {
    icon: Settings,
    title: '灵活配置',
    description: '支持多主题切换、个性化设置，满足不同企业的定制化需求。',
  },
  {
    icon: Globe,
    title: '多端适配',
    description: '响应式设计，完美适配桌面端和移动端，随时随地管理您的系统。',
  },
];

const stats = [
  { value: '99.9%', label: '系统可用性' },
  { value: '256-bit', label: '数据加密' },
  { value: '24/7', label: '安全监控' },
  { value: '100+', label: '权限节点' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass fixed left-0 right-0 top-0 z-50 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">RBAC Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth?mode=login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                登录
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="gap-2">
                免费注册
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-20 pt-32">
        {/* Background Effects */}
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="bg-radial-mask absolute inset-0" />

        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[20%] top-40 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-[10%] h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              企业级权限管理解决方案
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              更智能的
              <span className="text-gradient"> RBAC 权限</span>
              <br />
              后台管理系统
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              基于角色的访问控制（RBAC）模型，为您的企业提供安全、灵活、可扩展的权限管理解决方案。
              支持细粒度权限控制，完善的审计日志，助力企业数字化转型。
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="group h-12 gap-2 px-8 text-base">
                  立即开始使用
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  已有账号？登录
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-1 text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">功能特性</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              提供完整的权限管理功能，满足企业级应用的各种需求
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover group rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="bg-grid absolute inset-0 opacity-20" />

        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">准备好开始了吗？</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              立即注册，体验企业级权限管理系统的强大功能
            </p>

            <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="group h-12 gap-2 px-8 text-base">
                  免费注册
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                免费试用
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                无需信用卡
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                快速部署
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">HaloLight</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://halolight-edge.h7ml.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Live</span>
              </a>
              <a
                href="https://halolight-edge-api.h7ml.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">API</span>
              </a>
              <a
                href="https://dash.deno.com/playground/halolight-edge-api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <FileCode className="h-4 w-4" />
                <span className="hidden sm:inline">Deno</span>
              </a>
              <a
                href="https://github.com/halolight/halolight-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <GithubIcon className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HaloLight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
