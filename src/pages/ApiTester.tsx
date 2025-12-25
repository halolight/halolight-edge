import { useState } from 'react';
import api from '@/api/client';

type ResultState = { loading: boolean; data: unknown; error: string | null };

export default function ApiTester() {
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<'auth' | 'users' | 'roles' | 'functions'>('auth');
  const [results, setResults] = useState<Record<string, ResultState>>({});

  const setResult = (key: string, data: unknown, error: string | null = null) => {
    setResults((prev) => ({ ...prev, [key]: { loading: false, data, error } }));
  };
  const setLoading = (key: string) => {
    setResults((prev) => ({ ...prev, [key]: { loading: true, data: null, error: null } }));
  };

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '' });
  const [createUserForm, setCreateUserForm] = useState({ email: '', password: '', full_name: '' });

  const handleLogin = async () => {
    setLoading('login');
    try {
      const res = await api.auth.login(loginForm.email, loginForm.password);
      setToken(res.access_token);
      setResult('login', res);
    } catch (e) {
      setResult('login', null, (e as Error).message);
    }
  };

  const handleSignup = async () => {
    setLoading('signup');
    try {
      const res = await api.auth.signup(signupForm.email, signupForm.password);
      setResult('signup', res);
    } catch (e) {
      setResult('signup', null, (e as Error).message);
    }
  };

  const fetchProfiles = async () => {
    setLoading('profiles');
    try {
      const res = await api.profiles.list(token, { limit: 20 });
      setResult('profiles', res);
    } catch (e) {
      setResult('profiles', null, (e as Error).message);
    }
  };

  const fetchRoles = async () => {
    setLoading('roles');
    try {
      const res = await api.userRoles.list(token);
      setResult('roles', res);
    } catch (e) {
      setResult('roles', null, (e as Error).message);
    }
  };

  const fetchPermissions = async () => {
    setLoading('permissions');
    try {
      const res = await api.permissions.list(token);
      setResult('permissions', res);
    } catch (e) {
      setResult('permissions', null, (e as Error).message);
    }
  };

  const handleCreateUser = async () => {
    setLoading('createUser');
    try {
      const res = await api.functions.createUser(token, createUserForm);
      setResult('createUser', res);
    } catch (e) {
      setResult('createUser', null, (e as Error).message);
    }
  };

  const fetchEnv = async () => {
    setLoading('env');
    try {
      const res = await api.functions.getEnv();
      setResult('env', res);
    } catch (e) {
      setResult('env', null, (e as Error).message);
    }
  };

  const fetchStats = async () => {
    setLoading('stats');
    try {
      const [daily, role, user] = await Promise.all([
        api.statistics.dailyActivity(token),
        api.statistics.roleStats(token),
        api.statistics.userStats(token),
      ]);
      setResult('stats', { daily, role, user });
    } catch (e) {
      setResult('stats', null, (e as Error).message);
    }
  };

  const tabs = [
    { key: 'auth', label: '认证', icon: '🔐' },
    { key: 'users', label: '用户', icon: '👥' },
    { key: 'roles', label: '角色', icon: '🎭' },
    { key: 'functions', label: '函数', icon: '⚡' },
  ] as const;

  const isLoggedIn = !!token;

  const ResultBox = ({ result }: { result?: ResultState }) => {
    if (!result) return null;
    if (result.loading) {
      return (
        <div className="mt-4 flex items-center gap-2 text-slate-400">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          加载中...
        </div>
      );
    }
    if (result.error) {
      return (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">❌ {result.error}</p>
        </div>
      );
    }
    if (result.data !== null) {
      return (
        <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="mb-2 text-sm text-green-400">✅ 请求成功</p>
          <pre className="max-h-60 overflow-auto rounded bg-slate-900/50 p-3 text-xs text-slate-300">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              HaloLight API Tester
            </span>
          </h1>
          <p className="text-slate-400">RBAC 权限管理系统 API 测试工具</p>
        </div>

        {/* Token Status */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${isLoggedIn ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-slate-300">{isLoggedIn ? '已登录' : '未登录'}</span>
            </div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="手动输入 Token..."
              className="flex-1 rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 focus:border-purple-500 focus:outline-none"
            />
            {token && (
              <button
                onClick={() => setToken('')}
                className="rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition hover:bg-red-500/30"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-6 py-3 font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Auth Tab */}
          {activeTab === 'auth' && (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                    🔑
                  </span>
                  用户登录
                </h3>
                <div className="space-y-4">
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="邮箱"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="密码"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleLogin}
                    disabled={results.login?.loading}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {results.login?.loading ? '登录中...' : '登录'}
                  </button>
                </div>
                <ResultBox result={results.login} />
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                    📝
                  </span>
                  用户注册
                </h3>
                <div className="space-y-4">
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="邮箱"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="密码"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSignup}
                    disabled={results.signup?.loading}
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {results.signup?.loading ? '注册中...' : '注册'}
                  </button>
                </div>
                <ResultBox result={results.signup} />
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                    👥
                  </span>
                  用户列表
                </h3>
                <button
                  onClick={fetchProfiles}
                  disabled={results.profiles?.loading || !isLoggedIn}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {results.profiles?.loading ? '加载中...' : '获取用户列表'}
                </button>
                <ResultBox result={results.profiles} />
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                    📊
                  </span>
                  统计数据
                </h3>
                <button
                  onClick={fetchStats}
                  disabled={results.stats?.loading || !isLoggedIn}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {results.stats?.loading ? '加载中...' : '获取统计数据'}
                </button>
                <ResultBox result={results.stats} />
              </div>
            </>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                    🎭
                  </span>
                  用户角色
                </h3>
                <button
                  onClick={fetchRoles}
                  disabled={results.roles?.loading || !isLoggedIn}
                  className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {results.roles?.loading ? '加载中...' : '获取角色列表'}
                </button>
                <ResultBox result={results.roles} />
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20">
                    🔒
                  </span>
                  权限列表
                </h3>
                <button
                  onClick={fetchPermissions}
                  disabled={results.permissions?.loading || !isLoggedIn}
                  className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {results.permissions?.loading ? '加载中...' : '获取权限列表'}
                </button>
                <ResultBox result={results.permissions} />
              </div>
            </>
          )}

          {/* Functions Tab */}
          {activeTab === 'functions' && (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    ➕
                  </span>
                  创建用户 (Admin)
                </h3>
                <div className="space-y-4">
                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="邮箱"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="密码"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={createUserForm.full_name}
                    onChange={(e) =>
                      setCreateUserForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    placeholder="用户名 (可选)"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleCreateUser}
                    disabled={results.createUser?.loading || !isLoggedIn}
                    className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {results.createUser?.loading ? '创建中...' : '创建用户'}
                  </button>
                </div>
                <ResultBox result={results.createUser} />
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20">
                    ⚙️
                  </span>
                  获取环境变量
                </h3>
                <button
                  onClick={fetchEnv}
                  disabled={results.env?.loading}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {results.env?.loading ? '加载中...' : '获取 ENV'}
                </button>
                <ResultBox result={results.env} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
