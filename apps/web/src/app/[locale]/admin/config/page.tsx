'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Config {
  id: string;
  key: string;
  value: any;
  group: string;
  label?: string;
  isPublic: boolean;
}

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [edits, setEdits]     = useState<Record<string, any>>({});
  const [saving, setSaving]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Config[]>('/admin/configs').then(data => {
      setConfigs(data);
      const initEdits: Record<string, any> = {};
      data.forEach(c => { initEdits[c.key] = typeof c.value === 'object' ? JSON.stringify(c.value) : String(c.value); });
      setEdits(initEdits);
    }).finally(() => setLoading(false));
  }, []);

  const save = async (key: string, originalValue: any) => {
    setSaving(key);
    try {
      let value: any = edits[key];
      // Try to parse as JSON/boolean/number
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      await api.patch(`/admin/configs/${key}`, { value });
    } finally { setSaving(null); }
  };

  const groups = Array.from(new Set(configs.map(c => c.group)));

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading configuration...
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-brand-600" />
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-sm text-muted-foreground">Manage global platform settings</p>
        </div>
      </div>

      {groups.map(group => {
        const groupConfigs = configs.filter(c => c.group === group);
        return (
          <div key={group} className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground capitalize">
                {group}
              </h3>
            </div>
            <div className="divide-y">
              {groupConfigs.map(config => (
                <div key={config.key} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{config.label || config.key}</p>
                    <p className="text-xs text-muted-foreground font-mono">{config.key}</p>
                    {config.isPublic && (
                      <span className="text-xs text-green-600 dark:text-green-400">public</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={edits[config.key] ?? ''}
                      onChange={e => setEdits(prev => ({ ...prev, [config.key]: e.target.value }))}
                      className="w-48 px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => save(config.key, config.value)}
                      disabled={saving === config.key || edits[config.key] === String(config.value)}
                    >
                      {saving === config.key
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Save className="h-3.5 w-3.5" />
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
