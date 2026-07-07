import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { RefreshCw, Save } from 'lucide-react';
import { SectionCard, LoadingSpinner } from './AdminCommon';

const SettingsTab = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiService.getAdminSettings();
                setSettings(data);
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiService.updateAdminSettings(settings);
            toast.success('Settings saved');
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <SectionCard
            title="Admin Settings"
            action={
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                </button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Organization Name</label>
                    <input
                        value={settings?.organizationName || ''}
                        onChange={e => setSettings(p => ({ ...p, organizationName: e.target.value }))}
                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Default AI Model</label>
                    <input
                        value={settings?.defaultModel || ''}
                        onChange={e => setSettings(p => ({ ...p, defaultModel: e.target.value }))}
                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Max Tokens Per User</label>
                    <input
                        type="number"
                        value={settings?.maxTokensPerUser || ''}
                        onChange={e => setSettings(p => ({ ...p, maxTokensPerUser: Number(e.target.value) }))}
                        className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-subtext">Allow Public Signup</label>
                    <button
                        onClick={() => setSettings(p => ({ ...p, allowPublicSignup: !p.allowPublicSignup }))}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all border ${settings?.allowPublicSignup
                            ? 'bg-green-500/10 border-green-500/30 text-green-500'
                            : 'bg-red-500/10 border-red-500/30 text-red-500'
                            }`}
                    >
                        {settings?.allowPublicSignup ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
            </div>
        </SectionCard>
    );
};

export default SettingsTab;
