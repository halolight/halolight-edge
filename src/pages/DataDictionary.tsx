import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Database,
  FolderOpen,
  Download,
  Upload,
  History,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type {
  DictionaryNamespace,
  DictionaryEntry,
  EntryFormData,
  NamespaceFormData,
  DataType,
  DictionaryEntryVersion,
} from '@/types/dictionary';
import {
  DATA_TYPE_OPTIONS,
  formatDisplayValue,
  getDefaultValue,
  exportToJsonFile,
  importFromJsonFile,
  validateValueType,
} from '@/utils/dictionaryUtils';
import { ValueEditor } from '@/components/dictionary/ValueEditor';

export default function DataDictionary() {
  const { user } = useAuthContext();
  const [namespaces, setNamespaces] = useState<DictionaryNamespace[]>([]);
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [_loading, setLoading] = useState(true);

  // Dialogs
  const [isNamespaceDialogOpen, setIsNamespaceDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Editing states
  const [editingNamespace, setEditingNamespace] = useState<DictionaryNamespace | null>(null);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [viewingVersions, setViewingVersions] = useState<DictionaryEntryVersion[]>([]);

  // Forms
  const [namespaceForm, setNamespaceForm] = useState<NamespaceFormData>({
    name: '',
    description: '',
    icon: 'folder',
    color: 'blue',
  });

  const [entryForm, setEntryForm] = useState<EntryFormData>({
    key: '',
    value: null,
    data_type: 'string',
    description: '',
    tags: [],
    metadata: {},
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch namespaces
  const fetchNamespaces = async () => {
    try {
      const { data, error } = await supabase
        .from('dictionary_namespaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNamespaces((data || []) as DictionaryNamespace[]);
      if (data && data.length > 0 && !selectedNamespace) {
        setSelectedNamespace(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      toast({ title: '获取命名空间失败', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  // Fetch entries
  useEffect(() => {
    if (!selectedNamespace) return;

    const fetchEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('dictionary_entries')
          .select('*')
          .eq('namespace_id', selectedNamespace)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setEntries((data || []) as DictionaryEntry[]);
      } catch (error) {
        console.error('Error fetching entries:', error);
        toast({ title: '获取条目失败', variant: 'destructive' });
      }
    };

    fetchEntries();
  }, [selectedNamespace]);

  const filteredEntries = entries.filter(
    (entry) =>
      entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Namespace handlers
  const handleAddNamespace = () => {
    setEditingNamespace(null);
    setNamespaceForm({ name: '', description: '', icon: 'folder', color: 'blue' });
    setIsNamespaceDialogOpen(true);
  };

  const handleEditNamespace = (namespace: DictionaryNamespace) => {
    setEditingNamespace(namespace);
    setNamespaceForm({
      name: namespace.name,
      description: namespace.description || '',
      icon: namespace.icon || 'folder',
      color: namespace.color || 'blue',
    });
    setIsNamespaceDialogOpen(true);
  };

  const handleSaveNamespace = async () => {
    if (!namespaceForm.name.trim()) {
      toast({ title: '请输入命名空间名称', variant: 'destructive' });
      return;
    }

    try {
      if (editingNamespace) {
        const { error } = await supabase
          .from('dictionary_namespaces')
          .update(namespaceForm)
          .eq('id', editingNamespace.id);

        if (error) throw error;
        toast({ title: '命名空间更新成功' });
      } else {
        const { error } = await supabase
          .from('dictionary_namespaces')
          .insert({ ...namespaceForm, created_by: user?.id });

        if (error) throw error;
        toast({ title: '命名空间创建成功' });
      }

      setIsNamespaceDialogOpen(false);
      fetchNamespaces();
    } catch (error: unknown) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNamespace = async (id: string) => {
    if (!confirm('确定要删除此命名空间吗？所有相关条目也会被删除。')) return;

    try {
      const { error } = await supabase.from('dictionary_namespaces').delete().eq('id', id);

      if (error) throw error;

      if (selectedNamespace === id) {
        setSelectedNamespace(namespaces[0]?.id || null);
      }
      toast({ title: '命名空间删除成功' });
      fetchNamespaces();
    } catch (error: unknown) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // Entry handlers
  const handleAddEntry = () => {
    setEditingEntry(null);
    setEntryForm({
      key: '',
      value: getDefaultValue('string'),
      data_type: 'string',
      description: '',
      tags: [],
      metadata: {},
    });
    setTagInput('');
    setIsEntryDialogOpen(true);
  };

  const handleEditEntry = (entry: DictionaryEntry) => {
    setEditingEntry(entry);
    setEntryForm({
      key: entry.key,
      value: entry.value,
      data_type: entry.data_type,
      description: entry.description || '',
      tags: entry.tags || [],
      metadata: entry.metadata || {},
    });
    setTagInput('');
    setIsEntryDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!entryForm.key.trim() || !selectedNamespace) {
      toast({ title: '请输入键名', variant: 'destructive' });
      return;
    }

    const validation = validateValueType(entryForm.value, entryForm.data_type);
    if (!validation.valid) {
      toast({ title: '值格式错误', description: validation.error, variant: 'destructive' });
      return;
    }

    try {
      const entryData = {
        ...entryForm,
        namespace_id: selectedNamespace,
        created_by: user?.id,
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('dictionary_entries')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast({ title: '条目更新成功' });
      } else {
        const { error } = await supabase.from('dictionary_entries').insert(entryData);

        if (error) throw error;
        toast({ title: '条目创建成功' });
      }

      setIsEntryDialogOpen(false);
      if (selectedNamespace) {
        const { data } = await supabase
          .from('dictionary_entries')
          .select('*')
          .eq('namespace_id', selectedNamespace)
          .order('created_at', { ascending: false });
        setEntries((data || []) as DictionaryEntry[]);
      }
    } catch (error: unknown) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('确定要删除此条目吗？')) return;

    try {
      const { error } = await supabase.from('dictionary_entries').delete().eq('id', id);

      if (error) throw error;
      toast({ title: '条目删除成功' });
      if (selectedNamespace) {
        const { data } = await supabase
          .from('dictionary_entries')
          .select('*')
          .eq('namespace_id', selectedNamespace)
          .order('created_at', { ascending: false });
        setEntries((data || []) as DictionaryEntry[]);
      }
    } catch (error: unknown) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleDataTypeChange = (newType: DataType) => {
    setEntryForm({
      ...entryForm,
      data_type: newType,
      value: getDefaultValue(newType),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !entryForm.tags.includes(tagInput.trim())) {
      setEntryForm({
        ...entryForm,
        tags: [...entryForm.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEntryForm({
      ...entryForm,
      tags: entryForm.tags.filter((t) => t !== tag),
    });
  };

  // Version history
  const handleViewVersions = async (entry: DictionaryEntry) => {
    try {
      const { data, error } = await supabase.rpc('get_entry_history', {
        p_entry_id: entry.id,
      });

      if (error) throw error;

      setViewingVersions((data || []) as DictionaryEntryVersion[]);
      setIsVersionDialogOpen(true);
    } catch (error: unknown) {
      toast({
        title: '获取历史失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // Export/Import
  const handleExport = async () => {
    if (!selectedNamespace) return;

    try {
      const { data, error } = await supabase.rpc('export_namespace_data', {
        p_namespace_id: selectedNamespace,
      });

      if (error) throw error;

      const namespace = namespaces.find((ns) => ns.id === selectedNamespace);
      exportToJsonFile(data, `${namespace?.name || 'dictionary'}_${Date.now()}.json`);
      toast({ title: '导出成功' });
    } catch (error: unknown) {
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const data = await importFromJsonFile(file);

      const { data: result, error } = await supabase.rpc('import_namespace_data', {
        p_data: data,
        p_user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: '导入成功',
        description: `导入 ${result.imported} 条，跳过 ${result.skipped} 条`,
      });
      setIsImportDialogOpen(false);
      fetchNamespaces();
    } catch (error: unknown) {
      toast({
        title: '导入失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleCopyValue = (value: unknown, dataType: DataType) => {
    const displayValue = formatDisplayValue(value, dataType);
    navigator.clipboard.writeText(displayValue);
    toast({ title: '已复制到剪贴板' });
  };

  const selectedNamespaceInfo = namespaces.find((ns) => ns.id === selectedNamespace);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Database className="h-8 w-8 text-primary" />
              数据字典
            </h1>
            <p className="mt-2 text-muted-foreground">管理应用配置和常量数据</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出
            </Button>
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              导入
            </Button>
            <Button onClick={handleAddNamespace} className="gap-2">
              <Plus className="h-4 w-4" />
              新建命名空间
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Namespace List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  命名空间
                </CardTitle>
                <CardDescription>共 {namespaces.length} 个</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {namespaces.map((namespace) => (
                    <motion.div
                      key={namespace.id}
                      className={`group cursor-pointer rounded-lg border p-3 transition-all ${
                        selectedNamespace === namespace.id
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedNamespace(namespace.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{namespace.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {namespace.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNamespace(namespace);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNamespace(namespace.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Entry List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-9"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedNamespaceInfo?.name || '选择命名空间'}</CardTitle>
                    {selectedNamespaceInfo && (
                      <CardDescription>{selectedNamespaceInfo.description}</CardDescription>
                    )}
                  </div>
                  {selectedNamespace && (
                    <Button onClick={handleAddEntry} className="gap-2">
                      <Plus className="h-4 w-4" />
                      新建条目
                    </Button>
                  )}
                </div>
                {selectedNamespace && (
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索键名、标签..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {selectedNamespace ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>键名</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>值</TableHead>
                          <TableHead>标签</TableHead>
                          <TableHead>说明</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono font-medium">{entry.key}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {
                                  DATA_TYPE_OPTIONS.find((opt) => opt.value === entry.data_type)
                                    ?.label
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <div className="truncate font-mono text-sm">
                                {formatDisplayValue(entry.value, entry.data_type)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {entry.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleCopyValue(entry.value, entry.data_type)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleViewVersions(entry)}
                                >
                                  <History className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditEntry(entry)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:text-destructive"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>请选择一个命名空间查看条目</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Namespace Dialog */}
        <Dialog open={isNamespaceDialogOpen} onOpenChange={setIsNamespaceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNamespace ? '编辑命名空间' : '新建命名空间'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  placeholder="例如: 应用配置"
                  value={namespaceForm.name}
                  onChange={(e) => setNamespaceForm({ ...namespaceForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>说明</Label>
                <Textarea
                  placeholder="命名空间用途说明"
                  value={namespaceForm.description}
                  onChange={(e) =>
                    setNamespaceForm({ ...namespaceForm, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNamespaceDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveNamespace}>{editingNamespace ? '更新' : '创建'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Entry Dialog */}
        <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? '编辑条目' : '新建条目'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>键名</Label>
                  <Input
                    placeholder="例如: appName"
                    value={entryForm.key}
                    onChange={(e) => setEntryForm({ ...entryForm, key: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>数据类型</Label>
                  <Select value={entryForm.data_type} onValueChange={handleDataTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>值</Label>
                <ValueEditor
                  dataType={entryForm.data_type}
                  value={entryForm.value}
                  onChange={(v) => setEntryForm({ ...entryForm, value: v })}
                />
              </div>

              <div className="space-y-2">
                <Label>说明</Label>
                <Textarea
                  placeholder="条目用途说明"
                  value={entryForm.description}
                  onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>标签</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="添加标签..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entryForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEntry}>{editingEntry ? '更新' : '创建'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Version History Dialog */}
        <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>版本历史</DialogTitle>
            </DialogHeader>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>版本</TableHead>
                    <TableHead>键名</TableHead>
                    <TableHead>值</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>变更</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>v{version.version_number}</TableCell>
                      <TableCell className="font-mono">{version.key}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-sm">
                        {formatDisplayValue(version.value, version.data_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{version.data_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            version.change_type === 'create'
                              ? 'default'
                              : version.change_type === 'update'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {version.change_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(version.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>导入数据</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
