import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileJson,
  FileText,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Check,
  ArrowRightLeft,
  Wrench,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

// ENV 解析器
function parseEnv(envContent: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // 移除引号
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // 处理转义字符
    value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    if (key) result[key] = value;
  }

  return result;
}

// JSON 转 ENV
function jsonToEnv(json: Record<string, string>, quote: boolean): string {
  return Object.entries(json)
    .map(([key, value]) => {
      const needsQuote = quote || value.includes(' ') || value.includes('\n');
      const escapedValue = value.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
      return needsQuote ? `${key}="${escapedValue}"` : `${key}=${escapedValue}`;
    })
    .join('\n');
}

export default function DevTools() {
  const [envInput, setEnvInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [envOutput, setEnvOutput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);
  const [quoteValues, setQuoteValues] = useState(true);

  // ENV → JSON
  const convertEnvToJson = useCallback(() => {
    try {
      const parsed = parseEnv(envInput);
      setJsonOutput(JSON.stringify(parsed, null, indentSize));
      toast({ title: '转换成功', description: `解析了 ${Object.keys(parsed).length} 个变量` });
    } catch (_e) {
      toast({ title: '转换失败', description: '请检查 ENV 格式', variant: 'destructive' });
    }
  }, [envInput, indentSize]);

  // JSON → ENV
  const convertJsonToEnv = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid JSON object');
      }
      setEnvOutput(jsonToEnv(parsed, quoteValues));
      toast({ title: '转换成功', description: `生成了 ${Object.keys(parsed).length} 个变量` });
    } catch (_e) {
      toast({ title: '转换失败', description: '请检查 JSON 格式', variant: 'destructive' });
    }
  }, [jsonInput, quoteValues]);

  // 复制到剪贴板
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: '已复制到剪贴板' });
  };

  // 下载文件
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 上传文件
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="rounded-lg bg-primary/10 p-2">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">开发工具</h1>
            <p className="text-muted-foreground">常用开发辅助工具集合</p>
          </div>
        </motion.div>

        <Tabs defaultValue="env-json" className="space-y-4">
          <TabsList>
            <TabsTrigger value="env-json" className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              ENV ↔ JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="env-json" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* ENV → JSON */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    ENV → JSON
                  </CardTitle>
                  <CardDescription>将 .env 文件转换为 JSON 格式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>输入 (.env 格式)</Label>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".env,.env.*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setEnvInput)}
                        />
                        <Button variant="ghost" size="sm" className="gap-1" asChild>
                          <span>
                            <Upload className="h-3 w-3" /> 上传
                          </span>
                        </Button>
                      </label>
                    </div>
                    <Textarea
                      placeholder={`# 示例\nVITE_API_URL=https://api.example.com\nVITE_APP_NAME="My App"\nDATABASE_URL='postgres://...'\nDEBUG=true`}
                      className="min-h-[200px] font-mono text-sm"
                      value={envInput}
                      onChange={(e) => setEnvInput(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button onClick={convertEnvToJson} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      转换
                    </Button>
                    <div className="flex items-center gap-2 text-sm">
                      <Label htmlFor="indent">缩进:</Label>
                      <select
                        id="indent"
                        className="h-8 rounded border bg-background px-2"
                        value={indentSize}
                        onChange={(e) => setIndentSize(Number(e.target.value))}
                      >
                        <option value={2}>2 空格</option>
                        <option value={4}>4 空格</option>
                        <option value={0}>压缩</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>输出 (JSON)</Label>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(jsonOutput, 'json')}
                          disabled={!jsonOutput}
                        >
                          {copied === 'json' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(jsonOutput, 'env.json')}
                          disabled={!jsonOutput}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      readOnly
                      placeholder="转换后的 JSON 将显示在这里..."
                      className="min-h-[200px] bg-muted/50 font-mono text-sm"
                      value={jsonOutput}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* JSON → ENV */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileJson className="h-5 w-5" />
                    JSON → ENV
                  </CardTitle>
                  <CardDescription>将 JSON 对象转换为 .env 格式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>输入 (JSON 格式)</Label>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setJsonInput)}
                        />
                        <Button variant="ghost" size="sm" className="gap-1" asChild>
                          <span>
                            <Upload className="h-3 w-3" /> 上传
                          </span>
                        </Button>
                      </label>
                    </div>
                    <Textarea
                      placeholder={`{\n  "VITE_API_URL": "https://api.example.com",\n  "VITE_APP_NAME": "My App",\n  "DEBUG": "true"\n}`}
                      className="min-h-[200px] font-mono text-sm"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button onClick={convertJsonToEnv} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      转换
                    </Button>
                    <div className="flex items-center gap-2">
                      <Switch id="quote" checked={quoteValues} onCheckedChange={setQuoteValues} />
                      <Label htmlFor="quote" className="text-sm">
                        引号包裹值
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>输出 (.env)</Label>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(envOutput, 'env')}
                          disabled={!envOutput}
                        >
                          {copied === 'env' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(envOutput, '.env')}
                          disabled={!envOutput}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      readOnly
                      placeholder="转换后的 ENV 将显示在这里..."
                      className="min-h-[200px] bg-muted/50 font-mono text-sm"
                      value={envOutput}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 使用说明 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">支持的格式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 text-sm md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">ENV 格式</h4>
                    <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">
                      {`# 注释行会被忽略
KEY=value
KEY="quoted value"
KEY='single quoted'
MULTILINE="line1\\nline2"`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">JSON 格式</h4>
                    <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">
                      {`{
  "KEY": "value",
  "ANOTHER_KEY": "another value"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
