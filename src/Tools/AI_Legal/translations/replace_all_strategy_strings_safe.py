import os
import re

file_path = '../components/StrategyEngine.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Safe target string definitions
targets = {
    # Back button
    '<span>Back</span>': '<span>{t(\'back\') || "Back"}</span>',
    
    # Subtitle
    'AI-powered litigation simulation, opponent prediction, judicial risk analysis, evidence evaluation and courtroom strategy planning.': "{t('strategyEngineSubtitle') || 'AI-powered litigation simulation, opponent prediction, judicial risk analysis, evidence evaluation and courtroom strategy planning.'}",
    
    # Header stats
    'Recent Strategy count:': "{t('recentStrategyCount') || 'Recent Strategy count:'}",
    'Last Simulation:': "{t('lastSimulation') || 'Last Simulation:'}",
    '<span>Advocate Notes</span>': "<span>{t('advocateNotes') || 'Advocate Notes'}</span>",
    '<span>History ({historyData.length})</span>': "<span>{t('history') || 'History'} ({historyData.length})</span>",
    
    # Choose Input Source
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Choose Input Source</label>':
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t(\'chooseInputSource\') || "Choose Input Source"}</label>',
    
    # Existing Case options
    "name: 'Existing Case', desc: 'Auto-load case from files'": "name: t('existingCase') || 'Existing Case', desc: t('existingCaseDesc') || 'Auto-load case from files'",
    "name: 'Upload Documents', desc: 'AI auto-extracts case files'": "name: t('uploadDocuments') || 'Upload Documents', desc: t('uploadDocumentsDesc') || 'AI auto-extracts case files'",
    "name: 'Manual Strategy', desc: 'Manually specify case profile'": "name: t('manualStrategy') || 'Manual Strategy', desc: t('manualStrategyDesc') || 'Manually specify case profile'",
    
    # Active Case Switching
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-505">Active Case Switching</label>':
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-505">{t(\'activeCaseSwitching\') || "Active Case Switching"}</label>',
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Active Case Switching</label>':
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t(\'activeCaseSwitching\') || "Active Case Switching"}</label>',
    
    # Create New Scenario
    '<span>Create New Scenario</span>': '<span>{t(\'createNewScenario\') || "Create New Scenario"}</span>',
    
    # Use Active Case
    '<p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Use Active Case</p>':
    '<p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{t(\'useActiveCase\') || "Use Active Case"}</p>',
    '<p className="text-[8px] text-slate-400 mt-0.5">Auto-fill all case fields</p>':
    '<p className="text-[8px] text-slate-400 mt-0.5">{t(\'autoFillCaseFields\') || "Auto-fill all case fields"}</p>',
    
    # Doc workspace
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Document Upload Workspace</label>':
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t(\'documentUploadWorkspace\') || "Document Upload Workspace"}</label>',
    '<span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">Drag & drop files or click to browse</span>':
    '<span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">{t(\'dragAndDropBrowse\') || "Drag & drop files or click to browse"}</span>',
    '<span className="text-[8px] text-slate-404 uppercase font-semibold">Supports PDFs, Plaints, Agreements, FIRs</span>':
    '<span className="text-[8px] text-slate-404 uppercase font-semibold">{t(\'supportsPdfPlaintsFirs\') || "Supports PDFs, Plaints, Agreements, FIRs"}</span>',
    '<span>AI Parse Uploaded Documents</span>': '<span>{t(\'aiParseDocuments\') || "AI Parse Uploaded Documents"}</span>',
    
    # Manual mode labels
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Legal Strategy Config</label>':
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t(\'legalStrategyConfig\') || "Legal Strategy Config"}</label>',
    '<span className="text-[8px] uppercase font-black text-slate-400">Strategy Goal / Practice Area</span>':
    '<span className="text-[8px] uppercase font-black text-slate-400">{t(\'strategyGoalPracticeArea\') || "Strategy Goal / Practice Area"}</span>',
    
    # Search Strategy templates
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Search Strategy Templates</label>':
    '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t(\'searchStrategyTemplates\') || "Search Strategy Templates"}</label>',
    '<option value="">-- Load Preset Template --</option>':
    '<option value="">{t(\'loadPresetTemplate\') || "-- Load Preset Template --"}</option>',
    '<option value="">-- Select Case File --</option>':
    '<option value="">{t(\'selectCaseFilePlaceholder\') || "-- Select Case File --"}</option>',
    
    # Active Case Summary
    '<span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Active Case Summary</span>':
    '<span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">{t(\'activeCaseSummaryTitle\') || "Active Case Summary"}</span>',
    '<span className="text-[10px] font-black uppercase text-indigo-505 tracking-wider">Active Case Summary</span>':
    '<span className="text-[10px] font-black uppercase text-indigo-505 tracking-wider">{t(\'activeCaseSummaryTitle\') || "Active Case Summary"}</span>',
    
    'Case Title / Parties': "{t('caseTitleParties') || 'Case Title / Parties'}",
    'Court Category': "{t('courtCategory') || 'Court Category'}",
    'Jurisdiction': "{t('jurisdiction') || 'Jurisdiction'}",
    'Litigation Stage': "{t('litigationStage') || 'Litigation Stage'}",
    'Evidence dossiers': "{t('evidenceDossiersTitle') || 'Evidence dossiers'}",
    
    '<span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Readiness</span>':
    '<span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t(\'aiReadiness\') || "AI Readiness"}</span>',
    
    '<span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider animate-pulse bg-emerald-500/10 px-1.5 py-0.5 rounded">Ready</span>':
    '<span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider animate-pulse bg-emerald-500/10 px-1.5 py-0.5 rounded">{t(\'ready\') || "Ready"}</span>',
    
    # Accordion 1
    'Case Facts & Claims': "{t('caseFactsClaims') || 'Case Facts & Claims'}",
    'Facts statement brief': "{t('factsStatementBrief') || 'Facts statement brief'}",
    '<button onClick={() => setCaseFacts(\'\')} className="hover:text-red-500">Clear</button>':
    '<button onClick={() => setCaseFacts(\'\')} className="hover:text-red-500">{t(\'clear\') || "Clear"}</button>',
    'className="hover:text-indigo-500">Copy</button>': 'className="hover:text-indigo-500">{t(\'copy\') || "Copy"}</button>',
    'Case facts currently empty. Enter details or use active cases to populate strategy targets.':
    "{t('caseFactsEmptyWarning') || 'Case facts currently empty. Enter details or use active cases to populate strategy targets.'}",
    'Enter detailed facts of the case, breach details, transaction issues...':
    "{t('factsStatementBriefPlaceholder') || 'Enter detailed facts of the case, breach details, transaction issues...'}",
    
    # Accordion 2
    'Evidence Dossier': "{t('evidenceDossier') || 'Evidence Dossier'}",
    '<span>Autofill Dossier</span>': '<span>{t(\'autofillDossier\') || "Autofill Dossier"}</span>',
    'No evidence logged yet. Use AI Autofill or add manually below.':
    "{t('noEvidenceLoggedYet') || 'No evidence logged yet. Use AI Autofill or add manually below.'}",
    'Add custom evidence item': "{t('addCustomEvidenceItem') || 'Add custom evidence item'}",
    'Evidence Title / Name': "{t('evidenceTitleName') || 'Evidence Title / Name'}",
    'e.g. Agreement sheet copy': "{t('evidenceTitlePlaceholder') || 'e.g. Agreement sheet copy'}",
    'Add to Dossier': "{t('addToDossierButton') || 'Add to Dossier'}",
    
    # Accordion 3 (Witnesses)
    'Witness Pool': "{t('witnessPoolTitle') || 'Witness Pool'}",
    'Witness Registry (Add manually)': "{t('witnessRegistryAddManually') || 'Witness Registry (Add manually)'}",
    'Deposition Witness Cards': "{t('depositionWitnessCardsTitle') || 'Deposition Witness Cards'}",
    'Witness Name': "{t('witnessNameLabel') || 'Witness Name'}",
    'Witness Role': "{t('witnessRoleLabel') || 'Witness Role'}",
    'e.g. Amit Sen': "{t('witnessNamePlaceholder') || 'e.g. Amit Sen'}",
    'e.g. Store Manager': "{t('witnessRolePlaceholder') || 'e.g. Store Manager'}",
    'Add Witness': "{t('addWitnessTitle') || 'Add Witness'}",
    
    # Accordion 4 (Timeline)
    'Milestones Chronology': "{t('milestonesChronologyTitle') || 'Milestones Chronology'}",
    'Chronological Milestones Chain': "{t('chronologicalMilestonesChain') || 'Chronological Milestones Chain'}",
    'AI Chronology Sync': "{t('aiChronologySync') || 'AI Chronology Sync'}",
    'No timeline milestones parsed yet.': "{t('noTimelineMilestones') || 'No timeline milestones parsed yet.'}",
    'Add Timeline Milestone': "{t('addTimelineMilestone') || 'Add Timeline Milestone'}",
    'Enter milestone title...': "{t('addTimelineMilestonePlaceholder') || 'Enter milestone title...'}",
    
    # Accordion 5 (Relief)
    'Relief & Previous Orders': "{t('reliefPreviousOrders') || 'Relief & Previous Orders'}",
    'Relief Category preset': "{t('reliefCategoryPreset') || 'Relief Category preset'}",
    'Relief Sought Details (AI suggested / editable)': "{t('reliefSoughtDetailsSuggested') || 'Relief Sought Details (AI suggested / editable)'}",
    'AI will suggest relief details, or you can edit...': "{t('aiWillSuggestRelief') || 'AI will suggest relief details, or you can edit...'}",
    'Previous Court Orders (if any)': "{t('previousCourtOrdersIfAny') || 'Previous Court Orders (if any)'}",
    'Enter previous stays, notices, or caveat decrees details...': "{t('enterPreviousStaysPlaceholder') || 'Enter previous stays, notices, or caveat decrees details...'}",
    
    # Advanced Toggle
    'Show Advanced Parameters': "{t('showAdvancedParameters') || 'Show Advanced Parameters'}",
    'Hide Advanced Parameters': "{t('hideAdvancedParameters') || 'Hide Advanced Parameters'}",
    
    # Strategy Readiness
    'Strategy Readiness': "{t('strategyReadiness') || 'Strategy Readiness'}",
    'overall readiness': "{t('overallReadiness') || 'overall readiness'}",
    'Generate Trial Strategy Roadmap': "{t('generateTrialStrategyRoadmap') || 'Generate Trial Strategy Roadmap'}",
    'Estimated Processing Time: 12 Sec': "{t('estimatedProcessingTime12Sec') || 'Estimated Processing Time: 12 Sec'}",
    
    # Loaders
    'Generating AI Strategy...': "{t('generatingAiStrategy') || 'Generating AI Strategy...'}",
    'Preparing Arguments...': "{t('preparingArguments') || 'Preparing Arguments...'}",
    'Evaluating Evidence...': "{t('evaluatingEvidence') || 'Evaluating Evidence...'}",
    'Analyzing Case Facts...': "{t('analyzingCaseFacts') || 'Analyzing Case Facts...'}",
    'Loading Judicial Intelligence...': "{t('loadingJudicialIntelligence') || 'Loading Judicial Intelligence...'}",
    
    # Report Headings
    'AI Legal™ Intelligence Command': "{t('litigationCommandSubtitle') || 'AI Legal™ Intelligence Command'}",
    'Confidential Legal Report // Privileged Attorney Work Product': "{t('confidentialLegalReportPrivileged') || 'Confidential Legal Report // Privileged Attorney Work Product'}",
    'AI STRATEGY REPORT': "{t('aiStrategyReport') || 'AI STRATEGY REPORT'}",
    
    # Report Section Labels
    'Executive Summary': "{t('executiveSummary') || 'Executive Summary'}",
    'Winning Probability': "{t('winningProbability') || 'Winning Probability'}",
    'Case Strength Score': "{t('caseStrengthScore') || 'Case Strength Score'}",
    'Strengths': "{t('strengthsTitle') || 'Strengths'}",
    'Weaknesses': "{t('weaknessesTitle') || 'Weaknesses'}",
    'Key Legal Issues': "{t('keyLegalIssuesTitle') || 'Key Legal Issues'}",
    'Opponent Analysis': "{t('opponentAnalysisTitle') || 'Opponent Analysis'}",
    'Relevant Precedents': "{t('relevantPrecedentsTitle') || 'Relevant Precedents'}",
    'Evidence Evaluation': "{t('evidenceEvaluationTitle') || 'Evidence Evaluation'}",
    'Recommended Arguments': "{t('recommendedArgumentsTitle') || 'Recommended Arguments'}",
    'Cross Examination Strategy': "{t('crossExaminationStrategyTitle') || 'Cross Examination Strategy'}",
    'Risk Assessment': "{t('riskAssessmentTitle') || 'Risk Assessment'}",
    'Settlement Recommendation': "{t('settlementRecommendationTitle') || 'Settlement Recommendation'}",
    'Litigation Roadmap': "{t('litigationRoadmapTitle') || 'Litigation Roadmap'}",
    'Immediate Next Steps': "{t('immediateNextStepsTitle') || 'Immediate Next Steps'}",
    
    # History Logs
    'Simulation History Logs': "{t('simulationHistoryLogs') || 'Simulation History Logs'}",
    'Search past simulation strategies...': "{t('searchPastSimulationStrategies') || 'Search past simulation strategies...'}",
    'No strategy simulations archived.': "{t('noStrategySimulationsArchived') || 'No strategy simulations archived.'}",
    'Load Strategy': "{t('loadStrategyButton') || 'Load Strategy'}",
    
    # Note Editor
    'New Note': "{t('newNote') || 'New Note'}",
    'Edit Note': "{t('editNote') || 'Edit Note'}",
    'Note content': "{t('noteContent') || 'Note content'}",
    'Are you sure you want to delete this note?': "{t('deleteNoteConfirm') || 'Are you sure you want to delete this note?'}",
    'Delete Note': "{t('deleteNote') || 'Delete Note'}",
    'Save Note': "{t('saveNote') || 'Save Note'}",
    'Search strategic notes...': "{t('searchNotesPlaceholder') || 'Search strategic notes...'}",
    'No strategic notes found.': "{t('noStrategicNotesFound') || 'No strategic notes found.'}",
    
    # Toasts (Note)
    "toast.success('Note saved successfully.');": "toast.success(t('noteSavedSuccessfully') || 'Note saved successfully.');",
    "toast.error('Failed to save note. Please try again.');": "toast.error(t('noteSaveFailed') || 'Failed to save note. Please try again.');",
    "toast.success('Note deleted.');": "toast.success(t('noteDeleted') || 'Note deleted.');",
    "toast.error('Failed to delete note.');": "toast.error(t('noteDeleteFailed') || 'Failed to delete note.');",
    
    # Toasts (Strategy)
    'toast.success("Strategy successfully updated in Database!");': 'toast.success(t(\'strategyUpdatedInDb\') || "Strategy successfully updated in Database!");',
    'toast.error("Failed to save strategy: " + err.message);': 'toast.error((t(\'strategySaveFailed\') || "Failed to save strategy: ") + err.message);',
    'toast.success("Task appended to checklist.");': 'toast.success(t(\'taskAppended\') || "Task appended to checklist.");',
    'toast.error("Please provide case facts or load templates first.");': 'toast.error(t(\'provideCaseFactsFirst\') || "Please provide case facts or load templates first.");',
    'toast.success("AI litigation analysis complete!", { id: toastId });': 'toast.success(t(\'aiAnalysisComplete\') || "AI litigation analysis complete!", { id: toastId });',
    'toast.error("Failed to compile strategy simulation: " + e.message, { id: toastId });': 'toast.error((t(\'failedToCompileSimulation\') || "Failed to compile strategy simulation: ") + e.message, { id: toastId });',
    'toast.error("Please enter Case Facts first so the AI can extract data.");': 'toast.error(t(\'enterCaseFactsFirst\') || "Please enter Case Facts first so the AI can extract data.");',
    'toast.success("Timeline milestones extracted!", { id: tid });': 'toast.success(t(\'timelineMilestonesExtracted\') || "Timeline milestones extracted!", { id: tid });',
    'toast.success("Evidence items extracted!", { id: tid });': 'toast.success(t(\'evidenceItemsExtracted\') || "Evidence items extracted!", { id: tid });',
    'toast.success("Witness pool identified!", { id: tid });': 'toast.success(t(\'witnessPoolIdentified\') || "Witness pool identified!", { id: tid });',
    'toast.error("Failed to extract data. Make sure facts are detailed.", { id: tid });': 'toast.error(t(\'extractionFailed\') || "Failed to extract data. Make sure facts are detailed.", { id: tid });',
    'toast.success(`${files.length} documents uploaded to workspace.`);': 'toast.success(`${files.length} ` + (t(\'documentsUploaded\') || "documents uploaded to workspace."));',
    'toast.error("Please upload at least one legal document first.");': 'toast.error(t(\'uploadOneDocFirst\') || "Please upload at least one legal document first.");',
    'toast.success("Documents successfully parsed! Scenario builder prefilled.", { id: tid });': 'toast.success(t(\'documentsParsed\') || "Documents successfully parsed! Scenario builder prefilled.", { id: tid });',
    'toast.error("Failed to extract content from documents.", { id: tid });': 'toast.error(t(\'documentExtractionFailed\') || "Failed to extract content from documents.", { id: tid });',
    'toast.error("Popup blocked! Enable popups to print/export PDF.");': 'toast.error(t(\'popupBlocked\') || "Popup blocked! Enable popups to print/export PDF.");',
    'toast.success("Word Document exported successfully!");': 'toast.success(t(\'wordExported\') || "Word Document exported successfully!");',
    'toast.success(`Template loaded: ${seed.title}`);': 'toast.success((t(\'templateLoaded\') || "Template loaded: ") + seed.title);',
    'toast.success("Strategy removed from history.");': 'toast.success(t(\'strategyRemoved\') || "Strategy removed from history.");',
    'toast.error("Failed to delete strategy from archive.");': 'toast.error(t(\'deleteStrategyFailed\') || "Failed to delete strategy from archive.");',
    'toast.success(`Selected Active Case: ${selectedProj.name}`);': 'toast.success((t(\'selectedActiveCase\') || "Selected Active Case: ") + selectedProj.name);',
    'toast.error("Client Name is required");': 'toast.error(t(\'clientNameRequired\') || "Client Name is required");',
    'toast.success("New litigation matter created successfully!", { id: tid });': 'toast.success(t(\'litigationMatterCreated\') || "New litigation matter created successfully!", { id: tid });',
    'toast.error("Failed to create case", { id: tid });': 'toast.error(t(\'failedToCreateCase\') || "Failed to create case", { id: tid });',
    'toast.success("Evidence added to dossier.");': 'toast.success(t(\'evidenceAdded\') || "Evidence added to dossier.");',
    'toast.success("Witness added to pool.");': 'toast.success(t(\'witnessAdded\') || "Witness added to pool.");',
    'toast.success("Timeline milestone added.");': 'toast.success(t(\'timelineMilestoneAdded\') || "Timeline milestone added.");',
    'toast.success("Copied to clipboard!");': 'toast.success(t(\'copiedToClipboard\') || "Copied to clipboard!");',
    'toast.success(`Loaded strategy: ${item.title}`);': 'toast.success((t(\'loadedStrategy\') || "Loaded strategy: ") + item.title);',
}

for old, new in targets.items():
    if old in content:
        content = content.replace(old, new)
        print(f"[SUCCESS] Replaced: {old[:60]}")
    else:
        # Fallback to normalized space check
        old_norm = re.sub(r'\s+', ' ', old.strip())
        content_norm = re.sub(r'\s+', ' ', content)
        if old_norm in content_norm:
            # Construct a safe regex replace
            pattern = re.escape(old.strip())
            pattern = re.sub(r'\\\s+', r'\\s+', pattern)
            content, count = re.subn(pattern, new, content)
            if count > 0:
                print(f"[SUCCESS via regex] Replaced: {old[:60]}")
                continue
        print(f"[WARNING] Pattern not found: {old[:60]}")

# Final fixes for UI strings in specific components
# 1. Timeline input placeholder
content = content.replace(
    'placeholder="Enter milestone title..."',
    'placeholder={t(\'addTimelineMilestonePlaceholder\') || "Enter milestone title..."}'
)

# 2. Case fields auto load readiness
content = content.replace(
    "text-[8px] font-black text-slate-404 uppercase\">AI Readiness: {caseTitle ? 'Ready' : 'Incomplete'}",
    "text-[8px] font-black text-slate-404 uppercase\">{t('aiReadiness') || 'AI Readiness'}: {caseTitle ? (t('ready') || 'Ready') : (t('incomplete') || 'Incomplete')}"
)

# 3. Evidence dossier item count
content = content.replace(
    '<p className="font-bold text-violet-500">{evidenceList.length} Items</p>',
    '<p className="font-bold text-violet-500">{evidenceList.length} {t(\'items\') || "Items"}</p>'
)

# 4. Correct template literal names in PDF exporter
content = content.replace(
    'AI LEGAL™ Strategy Report - ${caseTitle}',
    '`AI LEGAL™ ` + (t(\'strategyEngineTitle\') || "Strategy Engine") + ` - ${caseTitle}`'
)
content = content.replace(
    'AI LEGAL™ Full Litigation Strategy Report',
    '`AI LEGAL™ ` + (t(\'strategyReportTitle\') || "AI LEGAL™ Full Litigation Strategy Report")'
)
content = content.replace(
    'AI LEGAL™ Executive Litigation Brief - ${caseTitle}',
    '`AI LEGAL™ ` + (t(\'executiveLitigationBriefTitle\') || "AI LEGAL™ Executive Litigation Brief") + ` - ${caseTitle}`'
)
content = content.replace(
    'AI LEGAL™ Executive Litigation Brief',
    '`AI LEGAL™ ` + (t(\'executiveLitigationBriefTitle\') || "AI LEGAL™ Executive Litigation Brief")'
)

# 5. Clean up outer double braces or raw text quotes in span variables
content = content.replace(
    "'{t('ready') || \"Ready\"}'",
    "(t('ready') || 'Ready')"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Safe UI replacements executed.")
