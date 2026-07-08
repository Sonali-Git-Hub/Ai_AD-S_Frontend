import React, { useState, Suspense } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { SectionCard } from './AdminCommon';

const KnowledgeUpload = React.lazy(() => import('../../Tools/AI_Base/KnowledgeUpload').catch(() => ({ default: () => <div className="p-8 text-center text-subtext">AI Base Module not found.</div> })));
const KnowledgeManagement = React.lazy(() => import('../../Tools/AI_Base/KnowledgeManagement').catch(() => ({ default: () => <div className="p-8 text-center text-subtext">AI Base Module not found.</div> })));

const KnowledgeBaseTab = () => {
    const { t } = useLanguage();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        toast.success(t('uploadSuccessKnowledge'));
    };

    return (
        <div className="space-y-6">
            <Suspense fallback={<div className="p-8 text-center"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></div>}>
                <SectionCard
                    title={t('ingestNewKnowledge')}
                    action={<span className="text-xs text-subtext font-medium">{t('addFilesWebsitesRAG')}</span>}
                >
                    <KnowledgeUpload onUploadSuccess={handleUploadSuccess} />
                </SectionCard>

                <SectionCard title={t('knowledgeAssetsManagement')}>
                    <KnowledgeManagement key={refreshTrigger} />
                </SectionCard>
            </Suspense>
        </div>
    );
};

export default KnowledgeBaseTab;
