import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { FileUp, RefreshCw, Save, PlusCircle, Trash2, Plus } from 'lucide-react';
import { COOKIE_POLICY_DEFAULTS, TERMS_OF_SERVICE_DEFAULTS, PRIVACY_POLICY_DEFAULTS } from '../../Tools/AI_Legal/constants/legalDefaults';
import { SectionCard, LoadingSpinner } from './AdminCommon';

const LegalPagesTab = () => {
    const { t } = useLanguage();
    const [selectedPage, setSelectedPage] = useState('cookie-policy');
    const [pageData, setPageData] = useState({ sections: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    useEffect(() => {
        fetchPage();
    }, [selectedPage]);

    const getDefaultsForPage = (type) => {
        switch (type) {
            case 'cookie-policy': return COOKIE_POLICY_DEFAULTS;
            case 'terms-of-service': return TERMS_OF_SERVICE_DEFAULTS;
            case 'privacy-policy': return PRIVACY_POLICY_DEFAULTS;
            default: return [];
        }
    };

    const fetchPage = async () => {
        setLoading(true);
        try {
            const data = await apiService.getLegalPage(selectedPage);
            if (data && data.sections && data.sections.length > 0) {
                setPageData(data);
            } else {
                // If no DB content exists, show empty
                setPageData({
                    sections: [],
                    lastUpdated: new Date().toISOString()
                });
            }
        } catch (err) {
            toast.error('Failed to fetch legal page data');
            // Fallback to empty on error too
            setPageData({ sections: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiService.updateLegalPage(selectedPage, pageData.sections);
            toast.success('Legal page updated successfully');
        } catch (err) {
            toast.error('Failed to update legal page');
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setPageData(prev => ({
            ...prev,
            sections: [...prev.sections, { title: 'New Section', content: [{ subtitle: 'New Subtitle', text: 'Section content here...' }] }]
        }));
    };

    const removeSection = (index) => {
        setPageData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const updateSection = (index, field, value) => {
        setPageData(prev => {
            const newSections = [...prev.sections];
            newSections[index] = { ...newSections[index], [field]: value };
            return { ...prev, sections: newSections };
        });
    };

    const addContent = (sectionIndex) => {
        setPageData(prev => {
            const newSections = [...prev.sections];
            newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                content: [...newSections[sectionIndex].content, { subtitle: 'New Subtitle', text: 'Content text here...' }]
            };
            return { ...prev, sections: newSections };
        });
    };

    const removeContent = (sectionIndex, contentIndex) => {
        setPageData(prev => {
            const newSections = [...prev.sections];
            newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                content: newSections[sectionIndex].content.filter((_, i) => i !== contentIndex)
            };
            return { ...prev, sections: newSections };
        });
    };

    const updateContent = (sectionIndex, contentIndex, field, value) => {
        setPageData(prev => {
            const newSections = [...prev.sections];
            const newContent = [...newSections[sectionIndex].content];
            newContent[contentIndex] = { ...newContent[contentIndex], [field]: value };
            newSections[sectionIndex] = { ...newSections[sectionIndex], content: newContent };
            return { ...prev, sections: newSections };
        });
    };

    const parseLegalDocument = (text) => {
        // Split by lines and filter empty ones
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const sections = [];
        let currentSection = null;

        lines.forEach((line) => {
            // Robust Header Detection:
            // 1. Markdown headers (# Header)
            // 2. ARTICLE I, SECTION 1, CHAPTER 1
            // 3. Numbered headers (1. Introduction)
            // 4. Short Uppercase headers
            const isMetaInfo = /^(Effective Date|Last Updated|Revision|Version)\s*:?/i.test(line);
            const isHeader = !isMetaInfo && (
                /^#+\s+/.test(line) ||
                /^(ARTICLE|SECTION|CHAPTER|UNIT)\s+([IVXLCDM\d]+)/i.test(line) ||
                (/^\d+[\.\)]\s+[A-Z][^a-z]/.test(line) && line.length < 60) ||
                (line.length > 3 && line.length < 50 && line === line.toUpperCase() && !line.includes(':') && !line.endsWith('.'))
            );

            if (isHeader) {
                if (currentSection) sections.push(currentSection);
                currentSection = {
                    title: line.replace(/^#+\s*/, '').trim(),
                    content: []
                };
            } else if (currentSection) {
                const isBulletOrList = /^[•\-\*\u2022\u2023\u2043\u2044]/.test(line) || /^\d+[\.\)]\s/.test(line);
                const isMetaInfoLine = /^(Effective Date|Last Updated|Revision|Version)\s*:?/i.test(line);
                const isSubtitle = !isBulletOrList && !isMetaInfoLine && ((line.length < 100 && (line.endsWith(':') || !line.endsWith('.'))) || /^###\s+/.test(line));

                if (isSubtitle && !line.includes('http')) {
                    currentSection.content.push({
                        subtitle: line.replace(/^#+\s*/, '').replace(/:$/, '').trim(),
                        text: ''
                    });
                } else {
                    if (currentSection.content.length === 0) {
                        currentSection.content.push({ subtitle: 'General Terms', text: line });
                    } else {
                        const lastUnit = currentSection.content[currentSection.content.length - 1];
                        if (lastUnit.text) {
                            lastUnit.text += '\n\n' + line;
                        } else {
                            lastUnit.text = line;
                        }
                    }
                }
            } else {
                // Fallback for header-less starts
                currentSection = {
                    title: 'Policy Overview',
                    content: [{ subtitle: 'Introduction', text: line }]
                };
            }
        });

        if (currentSection) sections.push(currentSection);

        // Post-process: Ensure no empty text units
        return sections.map(s => ({
            ...s,
            content: s.content.map(c => ({
                ...c,
                text: (c.text || '').trim()
            })).filter(c => c.text.length > 0)
        })).filter(s => s.content.length > 0);
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const res = await apiService.parseLegalDoc(file);
            if (res.success && res.sections && res.sections.length > 0) {
                setPageData(prev => ({ ...prev, sections: res.sections }));
                toast.success(`Successfully parsed ${res.sections.length} sections from ${file.name}!`);
            } else {
                toast.error("Could not detect sections in the document.");
            }
        } catch (err) {
            console.error("Doc upload error:", err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            toast.error(errMsg || "Failed to parse document. Ensure it is a valid PDF, DOCX, or TXT file.");
        } finally {
            setIsParsing(false);
            e.target.value = '';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white/20 dark:bg-white/5 rounded-xl p-1 border border-white/10 overflow-x-auto admin-horizontal-scrollbar">
                    {['cookie-policy', 'terms-of-service', 'privacy-policy'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedPage(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedPage === type
                                ? 'bg-primary text-white shadow-md'
                                : 'text-subtext hover:bg-white/10 hover:text-maintext'
                                }`}
                        >
                            {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <label className={`flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-maintext rounded-xl font-bold text-sm transition-all border border-white/20 cursor-pointer ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isParsing ? <RefreshCw className="w-4 h-4 animate-spin text-primary" /> : <FileUp className="w-4 h-4" />}
                        {isParsing ? 'Parsing...' : 'Upload Document'}
                        <input
                            type="file"
                            className="hidden"
                            accept=".txt,.md,.pdf,.docx"
                            onChange={handleDocUpload}
                            disabled={isParsing}
                        />
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={saving || isParsing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <SectionCard
                title={`${selectedPage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Content Management`}
                action={
                    <button
                        onClick={addSection}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-maintext border border-white/10 transition-all"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Section
                    </button>
                }
            >
                <div className="space-y-8">
                    {pageData.sections.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                            <p className="text-subtext text-sm mb-4">No content found. Please create the first section to start building this page.</p>
                            <button
                                onClick={addSection}
                                className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
                            >
                                Create First Section
                            </button>
                        </div>
                    )}
                    {pageData.sections.map((section, sIdx) => (
                        <div key={sIdx} className="relative bg-white/10 dark:bg-white/5 rounded-2xl p-6 border border-white/10">
                            <button
                                onClick={() => removeSection(sIdx)}
                                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="mb-6 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Section Title</label>
                                <input
                                    value={section.title}
                                    onChange={e => updateSection(sIdx, 'title', e.target.value)}
                                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary/50 text-maintext"
                                />
                            </div>

                            <div className="space-y-6 ml-6 pl-6 border-l-2 border-primary/10">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Section Content Units</label>
                                    <button
                                        onClick={() => addContent(sIdx)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] bg-primary text-white hover:opacity-90 font-bold transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Plus className="w-3 h-3" /> Add Content Unit
                                    </button>
                                </div>

                                {section.content.map((item, cIdx) => (
                                    <div key={cIdx} className="bg-white/5 dark:bg-black/40 rounded-2xl p-6 space-y-4 relative group border border-white/5 hover:border-primary/30 transition-all">
                                        <button
                                            onClick={() => removeContent(sIdx, cIdx)}
                                            className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                <input
                                                    value={item.subtitle}
                                                    onChange={e => updateContent(sIdx, cIdx, 'subtitle', e.target.value)}
                                                    placeholder="Subtitle (e.g. 1.1 Eligibility)"
                                                    className={`w-full bg-transparent border-none p-0 text-sm font-bold outline-none text-maintext placeholder:text-subtext/20 ${['General Terms', 'Policy Overview', 'Introduction', 'N/A', ''].includes(item.subtitle) ? 'opacity-20 italic font-normal' : ''}`}
                                                />
                                            </div>
                                            <textarea
                                                value={item.text}
                                                onChange={e => updateContent(sIdx, cIdx, 'text', e.target.value)}
                                                rows={3}
                                                className="w-full bg-transparent border-none p-0 text-xs outline-none text-subtext resize-none placeholder:text-subtext/30"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default LegalPagesTab;
