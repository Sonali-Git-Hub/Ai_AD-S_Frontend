import os
import re

file_path = '../components/StrategyEngine.jsx'
translations_path = 'legal.translations.js'

with open(translations_path, 'r', encoding='utf-8') as f:
    trans_content = f.read()

# Add missing translation keys to legal.translations.js
# English missing keys
eng_missing = '''        existingCase: "Existing Case",
        uploadDocuments: "Upload Documents",
        manualStrategy: "Manual Strategy",
        selectCaseFilePlaceholder: "-- Select Case File --",
        documentUploadWorkspace: "Document Upload Workspace",
        dragAndDropBrowse: "Drag & drop files or click to browse",
        supportsPdfPlaintsFirs: "Supports PDFs, Plaints, Agreements, FIRs",
        aiParseDocuments: "AI Parse Uploaded Documents",
        legalStrategyConfig: "Legal Strategy Config",
        strategyGoalPracticeArea: "Strategy Goal / Practice Area",
        inputConfigStep: "INPUT CONFIG",
        aiAnalysisStep: "AI ANALYSIS",
        strategyReportStep: "STRATEGY REPORT",
        caseTitleParties: "CASE TITLE / PARTIES",
        courtCategory: "COURT CATEGORY",
        jurisdiction: "JURISDICTION",
        litigationStage: "LITIGATION STAGE",
        evidenceDossiers: "EVIDENCE DOSSIERS",
        aiReadiness: "AI READINESS",
        depositionEvidenceCards: "Deposition Evidence Cards",
        autofillDossier: "Autofill Dossier",
        depositionWitnessCards: "Deposition Witness Cards",
        milestoneTimeline: "Milestone Timeline",
        addTimelineMilestone: "Add Timeline Milestone",
        reliefPreviousOrders: "Relief & Previous Orders",
        reliefCategoryPreset: "Relief Category preset",
        reliefSoughtDetailsSuggested: "Relief Sought Details (AI suggested / editable)",
        aiWillSuggestRelief: "AI will suggest relief details, or you can edit...",
        previousCourtOrdersIfAny: "Previous Court Orders (if any)",
        enterPreviousStaysPlaceholder: "Enter previous stays, notices, or caveat decrees details...",
        strategyReadiness: "Strategy Readiness",
        overallReadiness: "overall readiness",
        generateTrialStrategyRoadmap: "Generate Trial Strategy Roadmap",
        estimatedProcessingTime12Sec: "Estimated Processing Time: 12 Sec",
        preparingArguments: "Preparing Arguments...",
        evaluatingEvidence: "Evaluating Evidence...",
        analyzingCaseFacts: "Analyzing Case Facts...",
        loadingJudicialIntelligence: "Loading Judicial Intelligence...",
        litigationStrategyCommand: "AI LEGAL™ LITIGATION STRATEGY COMMAND",
        confidentialLegalReportPrivileged: "Confidential Legal Report // Privileged Attorney Work Product",
        strengths: "STRENGTHS",
        weaknesses: "WEAKNESSES",
        keyLegalIssues: "KEY LEGAL ISSUES",
        opponentAnalysis: "OPPONENT ANALYSIS",
        relevantPrecedents: "RELEVANT PRECEDENTS",
        timelineRoadmap: "Timeline Roadmap",
        nextStepsRecommendations: "Next Steps & Recommendations",
        prayerFinalSubmissions: "Prayer & Final Submissions",
        simulateLitigationStrategy: "Simulate Litigation Strategy",
        strategyControls: "Strategy Controls",
        changeSource: "Change Source",
        syncing: "Syncing",
        caseFactsClaims: "Case Facts & Claims",
        factsStatementBrief: "Facts statement brief",
        factsStatementBriefPlaceholder: "Enter detailed facts of the case, breach details, transaction issues...",
        caseFactsEmptyWarning: "⚠️ Case facts currently empty. Enter details or use active cases to populate strategy targets.",
        litigationStrategyHistory: "Litigation Strategy History",
        noPreviousLogsFound: "No previous logs found in database history.",
        advocateNotesPlaceholder: "Write strategic advocacy notes, timeline adjustments, or trial comments here...",
        lastSaved: "Last saved",
        newNote: "New Note",
        editNote: "Edit Note",
        noteContent: "Note content",
        deleteNoteConfirm: "Are you sure you want to delete this note?",
        deleteNote: "Delete Note",
        saveNote: "Save Note",
        searchNotesPlaceholder: "Search strategic notes...",
        noStrategicNotesFound: "No strategic notes found.",
        recentStrategyCount: "Recent Strategy count:",
        lastSimulation: "Last Simulation:",
        activeCaseSwitching: "Active Case Switching",
        useActiveCase: "Use Active Case",
        autoFillCaseFields: "Auto-fill all case fields",
        createNewScenario: "Create New Scenario",
        searchStrategyTemplates: "Search Strategy Templates",
        loadPresetTemplate: "Load Preset Template",
        caseTitle: "Case Title",
        ready: "Ready",
        strengthsTitle: "Strengths",
        weaknessesTitle: "Weaknesses",
        keyLegalIssuesTitle: "Key Legal Issues",
        opponentAnalysisTitle: "Opponent Analysis",
        relevantPrecedentsTitle: "Relevant Precedents",
        courtTimelineTitle: "Court Timeline",
        immediateNextStepsTitle: "Immediate Next Steps",
        recommendationsTitle: "Recommendations",
        generate: "Generate",
        regenerate: "Regenerate",
        save: "Save",
        pdf: "PDF",
        download: "Download",
        print: "Print",
        share: "Share",
        export: "Export",
        simulation: "Simulation",
        previousReports: "Previous Reports",
        restore: "Restore",
        delete: "Delete",
        uploadFailed: "Upload Failed",
        generationFailed: "Generation Failed",
        validationError: "Validation Error",
        missingInformation: "Missing Information",
        serverError: "Server Error",
        networkError: "Network Error",
        noCaseSelected: "No Case Selected",
        noStrategyGenerated: "No Strategy Generated",
        noHistory: "No History",
        noNotes: "No Notes",
        noTemplates: "No Templates",
        nothingFound: "Nothing Found",
        saveNotes: "Save Notes",
        editNotes: "Edit Notes",
        deleteNotes: "Delete Notes",
        strategyGenerated: "Strategy Generated Successfully",
        savedSuccessfully: "Saved Successfully",
        pdfExported: "PDF Exported Successfully",
        scenarioCreated: "Scenario Created",
        templateLoaded: "Template Loaded",
        addTimelineMilestonePlaceholder: "Enter milestone title...",
        addWitness: "Add Witness",
        addWitnessPlaceholder: "Enter witness name...",
        witnessRolePlaceholder: "Enter role (e.g. eye witness)...",
        addEvidence: "Add Evidence",
        addEvidencePlaceholder: "Enter evidence name...",
        depositionWitnessCardsTitle: "Deposition Witness Cards",
        milestoneTimelineTitle: "Milestone Timeline",
        activeCaseSummaryTitle: "Active Case Summary",
        evidenceEvaluationTitle: "Evidence Evaluation",
        recommendedArgumentsTitle: "Recommended Arguments",
        crossExaminationStrategyTitle: "Cross Examination Strategy",
        riskAssessmentTitle: "Risk Assessment",
        settlementRecommendationTitle: "Settlement Recommendation",
        litigationRoadmapTitle: "Litigation Roadmap",
        evidenceDossiersTitle: "Evidence dossiers",
        witnessPoolTitle: "Witness Pool",
        milestonesChronologyTitle: "Milestones Chronology",
        chronologicalMilestonesChain: "Chronological Milestones Chain",
        aiChronologySync: "AI Chronology Sync",
        noTimelineMilestones: "No timeline milestones parsed yet.",
        witnessRegistryAddManually: "Witness Registry (Add manually)",
        noEvidenceLoggedYet: "No evidence logged yet. Use AI Autofill or add manually below.",
        addCustomEvidenceItem: "Add custom evidence item",
        evidenceTitleName: "Evidence Title / Name",
        evidenceTitlePlaceholder: "e.g. Agreement sheet copy",
        addWitnessTitle: "Add Witness",
        witnessNameLabel: "Witness Name",
        witnessNamePlaceholder: "e.g. Amit Sen",
        witnessRoleLabel: "Witness Role",
        witnessRolePlaceholder: "e.g. Store Manager",
        evidenceStatusPlaceholder: "Status (Admitted / Objected)",
        admissibleStrongProofs: "Admissible & Strong Proofs",
        priorityDocumentGathering: "Priority Document Gathering",
        finalSubmissionPrayer: "Final Submission Prayer",
        targetWitnessLabel: "Target Witness:",
        crossExamLineQuestioning: "Cross-Exam Line of Questioning",
        trapsImpeachmentTargets: "Traps / Impeachment Targets",
        overallLitigationRiskScore: "Overall Litigation Risk Score",
        riskExposureText: "Risk Exposure",
        mediationSuitabilityLabel: "Mediation Suitability:",
        strategyOptionLabel: "Strategy Option:",
        openingClaimOffer: "Opening Claim Offer",
        realisticTargetSettlement: "Realistic Target Settlement",
        fallbackBottomLine: "Fallback Bottom Line",
        noTimelineMilestonesParsedYet: "No timeline milestones parsed yet.",
        witnessRegistryAddManuallyTitle: "Witness Registry (Add manually)",
        noEvidenceLoggedYetTitle: "No evidence logged yet. Use AI Autofill or add manually below.",
        noteSavedSuccessfully: "Note saved successfully.",
        noteSaveFailed: "Failed to save note. Please try again.",
        noteDeleted: "Note deleted.",
        noteDeleteFailed: "Failed to delete note.",
        strategyUpdatedInDb: "Strategy successfully updated in Database!",
        strategySaveFailed: "Failed to save strategy: ",
        taskAppended: "Task appended to checklist.",
        provideCaseFactsFirst: "Please provide case facts or load templates first.",
        aiAnalysisComplete: "AI litigation analysis complete!",
        failedToCompileSimulation: "Failed to compile strategy simulation: ",
        enterCaseFactsFirst: "Please enter Case Facts first so the AI can extract data.",
        timelineMilestonesExtracted: "Timeline milestones extracted!",
        evidenceItemsExtracted: "Evidence items extracted!",
        witnessPoolIdentified: "Witness pool identified!",
        extractionFailed: "Failed to extract data. Make sure facts are detailed.",
        documentsUploaded: "documents uploaded to workspace.",
        uploadOneDocFirst: "Please upload at least one legal document first.",
        documentsParsed: "Documents successfully parsed! Scenario builder prefilled.",
        documentExtractionFailed: "Failed to extract content from documents.",
        popupBlocked: "Popup blocked! Enable popups to print/export.",
        wordExported: "Word Document exported successfully!",
        recentTemplatesLabel: "RECENT TEMPLATES",
        favoriteTemplatesLabel: "FAVORITE TEMPLATES",
        allTemplatesCategory: "ALL TEMPLATES",
        litigationRoadmapTemplates: "LITIGATION ROADMAP TEMPLATES",
        briefSynopsisDispute: "Brief Case Facts Summary",
        clientPetitionerName: "Client / Petitioner Name *",
        clientNamePlaceholder: "e.g. Ramesh Gupta",
        opposingPartyName: "Opposing Party Name",
        opposingPartyPlaceholder: "e.g. Suresh Verma",
        courtJurisdictionLabel: "Court Jurisdiction",
        courtJurisdictionPlaceholder: "e.g. Supreme Court of India",
        briefSynopsisPlaceholder: "Type a brief synopsis of the dispute...",
        newScenarioCaseFile: "New Scenario Case file",
        simulationHistoryLogs: "Simulation History Logs",
        searchPastSimulationStrategies: "Search past simulation strategies...",
        noStrategySimulationsArchived: "No strategy simulations archived.",
        matterTitleLabel: "Matter Title",
        courtJurisdictionHeader: "Court / Jurisdiction",
        clientPetitionerLabel: "Client Petitioner",
        opposingPartyLabel: "Opposing Party",
        noSummaryDetailsGenerated: "No summary details generated.",
        predictedOutcomeBased: "Predicted outcome probability based on facts & precedents.",
        calculatedStrengthAdmissibility: "Calculated strength using evidence admissibility & weight.",
        noSignificantStrengths: "No significant strengths identified.",
        noSignificantWeaknesses: "No significant weaknesses identified.",
        noKeyLegalIssues: "No key legal issues flagged.",
        likelyOppositionDefense: "Likely Opposition Defense:",
        anticipatedProceduralObjections: "Anticipated Procedural Objections",
        opponentDelayTactic: "Opponent Delay Tactic:",
        similarityScoreLabel: "Similarity Score:",
        typeLabel: "Type:",
        noPrecedentCitations: "No precedent citations linked.",
        sufficientProbativeWeight: "Sufficient probative weight",
        crucialForStandard: "Crucial for standard compliance proof",
        noCrossExaminationPlanner: "No cross-examination planner drafted.",
        evidenceAdmissibilityRisk: "Evidence Admissibility Risk",
        proceduralDelayRisk: "Procedural Delay Risk",
        financialExposureRisk: "Financial Exposure Risk",
        strategicCounterRisk: "Strategic Counter Risk",
        activeCaseIntelligenceCommand: "AI Legal™ Intelligence Command Brief",
        litigationCommandSubtitle: "AI LEGAL™ Litigation Command",
        strategyReportTitle: "AI LEGAL™ Full Litigation Strategy Report",
        executiveLitigationBriefTitle: "AI LEGAL™ Executive Litigation Brief",
        backButton: "Back",
        cancelButton: "Cancel",
        createScenarioButton: "Create Scenario",
        loadStrategyButton: "Load Strategy",
        addToDossierButton: "Add to Dossier",
        unSavedChanges: "Unsaved changes",
        noChanges: "No changes",
        depositionEvidenceCardsTitle: "Deposition Evidence Cards",
        evidenceTitleNameLabel: "Evidence Title / Name",

        // Case Predictor Specifics'''

# Hindi missing keys
hin_missing = '''        existingCase: "सक्रिय केस",
        uploadDocuments: "दस्तावेज़ अपलोड",
        manualStrategy: "मैन्युअल रणनीति",
        selectCaseFilePlaceholder: "-- केस फ़ाइल चुनें --",
        documentUploadWorkspace: "दस्तावेज़ अपलोड कार्यक्षेत्र",
        dragAndDropBrowse: "फ़ाइलें खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
        supportsPdfPlaintsFirs: "पीडीएफ, वादपत्र, समझौते, प्राथमिकी का समर्थन करता है",
        aiParseDocuments: "एआई अपलोड किए गए दस्तावेज़ों का विश्लेषण करें",
        legalStrategyConfig: "कानूनी रणनीति कॉन्फ़िगरेशन",
        strategyGoalPracticeArea: "रणनीति लक्ष्य / अभ्यास क्षेत्र",
        inputConfigStep: "इनपुट कॉन्फ़िगरेशन",
        aiAnalysisStep: "एआई विश्लेषण",
        strategyReportStep: "रणनीति रिपोर्ट",
        caseTitleParties: "केस शीर्षक / पक्षकार",
        courtCategory: "अदालत श्रेणी",
        jurisdiction: "अधिकार क्षेत्र",
        litigationStage: "मुकदमेबाजी चरण",
        evidenceDossiers: "साक्ष्य डोजियर",
        aiReadiness: "एआई तत्परता",
        depositionEvidenceCards: "जमा साक्ष्य कार्ड",
        autofillDossier: "डोजियर स्वतः भरें",
        depositionWitnessCards: "जमा गवाह कार्ड",
        milestoneTimeline: "समयरेखा मील का पत्थर",
        addTimelineMilestone: "समयरेखा मील का पत्थर जोड़ें",
        reliefPreviousOrders: "राहत और पिछले आदेश",
        reliefCategoryPreset: "राहत श्रेणी प्रीसेट",
        reliefSoughtDetailsSuggested: "अनुरोधित राहत विवरण (एआई सुझाया / संपादन योग्य)",
        aiWillSuggestRelief: "एआई राहत विवरण का सुझाव देगा, या आप संपादित कर सकते हैं...",
        previousCourtOrdersIfAny: "पिछले अदालत के आदेश (यदि कोई हो)",
        enterPreviousStaysPlaceholder: "पिछले स्थगन, नोटिस, या कैविएट डिक्री विवरण दर्ज करें...",
        strategyReadiness: "रणनीति तत्परता",
        overallReadiness: "समग्र तत्परता",
        generateTrialStrategyRoadmap: "परीक्षण रणनीति रोडमैप जनरेट करें",
        estimatedProcessingTime12Sec: "अनुमानित प्रसंस्करण समय: 12 सेकंड",
        preparingArguments: "तर्क तैयार किए जा रहे हैं...",
        evaluatingEvidence: "साक्ष्य का मूल्यांकन किया जा रहा है...",
        analyzingCaseFacts: "मामले के तथ्यों का विश्लेषण किया जा रहा है...",
        loadingJudicialIntelligence: "न्यायिक बुद्धिमत्ता लोड की जा रही है...",
        litigationStrategyCommand: "एआई कानूनी™ मुकदमेबाजी रणनीति कमांड",
        confidentialLegalReportPrivileged: "गोपनीय कानूनी रिपोर्ट // विशेषाधिकार प्राप्त अधिवक्ता कार्य उत्पाद",
        strengths: "ताकत",
        weaknesses: "कमजोरियां",
        keyLegalIssues: "प्रमुख कानूनी मुद्दे",
        opponentAnalysis: "विपक्षी विश्लेषण",
        relevantPrecedents: "प्रासंगिक मिसालें",
        courtTimeline: "अदालत की समयरेखा",
        immediateNextSteps: "तत्काल अगले कदम",
        historySaved: "इतिहास सहेजा गया",
        languageChanged: "भाषा बदली गई",
        noStrategyGenerated: "कोई रणनीति जनरेट नहीं की गई",
        noNotes: "कोई नोट्स नहीं",
        noTemplates: "कोई टेम्पलेट नहीं",
        nothingFound: "कुछ नहीं मिला",
        saveNotes: "नोट्स सहेजें",
        editNotes: "नोट्स संपादित करें",
        deleteNotes: "नोट्स हटाएं",
        strategyGenerated: "रणनीति सफलतापूर्वक जनरेट की गई",
        savedSuccessfully: "सफलतापूर्वक सहेजा गया",
        pdfExported: "पीडीएफ सफलतापूर्वक निर्यात किया गया",
        scenarioCreated: "परिदृश्य बनाया गया",
        templateLoaded: "टेम्पलेट लोड किया गया",
        addTimelineMilestonePlaceholder: "मील का पत्थर शीर्षक दर्ज करें...",
        addWitness: "गवाह जोड़ें",
        addWitnessPlaceholder: "गवाह का नाम दर्ज करें...",
        witnessRolePlaceholder: "भूमिका दर्ज करें (जैसे प्रत्यक्षदर्शी)...",
        addEvidence: "साक्ष्य जोड़ें",
        addEvidencePlaceholder: "साक्ष्य का नाम दर्ज करें...",
        depositionWitnessCardsTitle: "जमा गवाह कार्ड",
        milestoneTimelineTitle: "समयरेखा मील का पत्थर",
        activeCaseSummaryTitle: "सक्रिय केस सारांश",
        evidenceEvaluationTitle: "साक्ष्य मूल्यांकन",
        recommendedArgumentsTitle: "अनुशंसित तर्क",
        crossExaminationStrategyTitle: "जिरह रणनीति",
        riskAssessmentTitle: "जोखिम मूल्यांकन",
        settlementRecommendationTitle: "समझौता सिफारिश",
        litigationRoadmapTitle: "मुकदमेबाजी रोडमैप",
        evidenceDossiersTitle: "साक्ष्य डोजियर",
        witnessPoolTitle: "गवाह पूल",
        milestonesChronologyTitle: "मील का पत्थर कालक्रम",
        chronologicalMilestonesChain: "कालानुक्रमिक मील के पत्थर श्रृंखला",
        aiChronologySync: "एआई कालक्रम सिंक",
        noTimelineMilestones: "अभी तक कोई समयरेखा मील का पत्थर पार्स नहीं किया गया है।",
        witnessRegistryAddManually: "गवाह रजिस्ट्री (मैन्युअल रूप से जोड़ें)",
        noEvidenceLoggedYet: "अभी तक कोई साक्ष्य दर्ज नहीं किया गया है। स्वतः भरने या नीचे मैन्युअल रूप से जोड़ने के लिए एआई का उपयोग करें।",
        addCustomEvidenceItem: "कस्टम साक्ष्य आइटम जोड़ें",
        evidenceTitleName: "साक्ष्य शीर्षक / नाम",
        evidenceTitlePlaceholder: "जैसे समझौते की प्रतिलिपि",
        addWitnessTitle: "गवाह जोड़ें",
        witnessNameLabel: "गवाह का नाम",
        witnessNamePlaceholder: "जैसे अमित सेन",
        witnessRoleLabel: "गवाह भूमिका",
        witnessRolePlaceholder: "जैसे स्टोर मैनेजर",
        evidenceStatusPlaceholder: "स्थिति (स्वीकृत / आपत्ति)",
        admissibleStrongProofs: "स्वीकार्य और मजबूत साक्ष्य",
        priorityDocumentGathering: "प्राथमिकता दस्तावेज़ एकत्र करना",
        finalSubmissionPrayer: "अंतिम प्रस्तुत प्रार्थना",
        targetWitnessLabel: "लक्षित गवाह:",
        crossExamLineQuestioning: "जिरह प्रश्न श्रृंखला",
        trapsImpeachmentTargets: "जाल / महाभियोग लक्ष्य",
        overallLitigationRiskScore: "समग्र मुकदमेबाजी जोखिम स्कोर",
        riskExposureText: "जोखिम जोखिम",
        mediationSuitabilityLabel: "मध्यस्थता उपयुक्तता:",
        strategyOptionLabel: "रणनीति विकल्प:",
        openingClaimOffer: "प्रारंभिक दावा प्रस्ताव",
        realisticTargetSettlement: "यथार्थवादी लक्ष्य समझौता",
        fallbackBottomLine: "गिरावट बॉटम लाइन",
        noTimelineMilestonesParsedYet: "अभी तक कोई समयरेखा मील का पत्थर पार्स नहीं किया गया है।",
        witnessRegistryAddManuallyTitle: "गवाह रजिस्ट्री (मैन्युअल रूप से जोड़ें)",
        noEvidenceLoggedYetTitle: "अभी तक कोई साक्ष्य दर्ज नहीं किया गया है। स्वतः भरने या नीचे मैन्युअल रूप से जोड़ने के लिए एआई का उपयोग करें।",
        noteSavedSuccessfully: "नोट सफलतापूर्वक सहेजा गया।",
        noteSaveFailed: "नोट सहेजने में विफल। कृपया पुन: प्रयास करें।",
        noteDeleted: "नोट हटा दिया गया।",
        noteDeleteFailed: "नोट हटाने में विफल।",
        strategyUpdatedInDb: "रणनीति डेटाबेस में सफलतापूर्वक अपडेट की गई!",
        strategySaveFailed: "रणनीति सहेजने में विफल: ",
        taskAppended: "checklist में कार्य जोड़ा गया।",
        provideCaseFactsFirst: "कृपया पहले मामले के तथ्य प्रदान करें या टेम्पलेट लोड करें।",
        aiAnalysisComplete: "एआई मुकदमेबाजी विश्लेषण पूरा हुआ!",
        failedToCompileSimulation: "रणनीति सिमुलेशन संकलित करने में विफल: ",
        enterCaseFactsFirst: "कृपया पहले मामले के तथ्य दर्ज करें ताकि एआई डेटा निकाल सके।",
        timelineMilestonesExtracted: "समयरेखा मील के पत्थर निकाले गए!",
        evidenceItemsExtracted: "साक्ष्य आइटम निकाले गए!",
        witnessPoolIdentified: "गवाह पूल की पहचान की गई!",
        extractionFailed: "डेटा निकालने में विफल। सुनिश्चित करें कि तथ्य विस्तृत हैं।",
        documentsUploaded: "दस्तावेज़ कार्यक्षेत्र में अपलोड किए गए।",
        uploadOneDocFirst: "कृपया पहले कम से कम एक कानूनी दस्तावेज़ अपलोड करें।",
        documentsParsed: "दस्तावेज़ सफलतापूर्वक पार्स किए गए! परिदृश्य निर्माता पहले से भरा हुआ।",
        documentExtractionFailed: "दस्तावेज़ों से सामग्री निकालने में विफल।",
        popupBlocked: "पॉपअप ब्लॉक किया गया! प्रिंट/निर्यात करने के लिए पॉपअप सक्षम करें।",
        wordExported: "वर्ड दस्तावेज़ सफलतापूर्वक निर्यात किया गया!",
        recentTemplatesLabel: "हालिया टेम्पलेट",
        favoriteTemplatesLabel: "पसंदीदा टेम्पलेट",
        allTemplatesCategory: "सभी टेम्पलेट",
        litigationRoadmapTemplates: "मुकदमेबाजी रोडमैप टेम्पलेट",
        briefSynopsisDispute: "संक्षिप्त केस तथ्य सारांश",
        clientPetitionerName: "मुवक्किल / याचिकाकर्ता का नाम *",
        clientNamePlaceholder: "जैसे रमेश गुप्ता",
        opposingPartyName: "विपक्षी पक्षकार का नाम",
        opposingPartyPlaceholder: "जैसे सुरेश वर्मा",
        courtJurisdictionLabel: "अदालत का अधिकार क्षेत्र",
        courtJurisdictionPlaceholder: "जैसे भारत का सर्वोच्च न्यायालय",
        briefSynopsisPlaceholder: "विवाद का संक्षिप्त विवरण टाइप करें...",
        newScenarioCaseFile: "नया परिदृश्य केस फ़ाइल",
        simulationHistoryLogs: "सिमुलेशन इतिहास लॉग",
        searchPastSimulationStrategies: "पिछले सिमुलेशन रणनीतियों की खोज करें...",
        noStrategySimulationsArchived: "कोई रणनीति सिमुलेशन संग्रहीत नहीं किया गया।",
        matterTitleLabel: "मामला शीर्षक",
        courtJurisdictionHeader: "अदालत / अधिकार क्षेत्र",
        clientPetitionerLabel: "मुवक्किल याचिकाकर्ता",
        opposingPartyLabel: "विपक्षी दल",
        noSummaryDetailsGenerated: "कोई सारांश विवरण जनरेट नहीं किया गया।",
        predictedOutcomeBased: "तथ्यों और मिसालों के आधार पर अनुमानित परिणाम की संभावना।",
        calculatedStrengthAdmissibility: "साक्ष्य स्वीकार्यता और वजन का उपयोग करके गणना की गई ताकत।",
        noSignificantStrengths: "कोई महत्वपूर्ण ताकत की पहचान नहीं की गई।",
        noSignificantWeaknesses: "कोई महत्वपूर्ण कमजोरियों की पहचान नहीं की गई।",
        noKeyLegalIssues: "कोई प्रमुख कानूनी मुद्दे चिह्नित नहीं किए गए।",
        likelyOppositionDefense: "संभावित विपक्षी रक्षा:",
        anticipatedProceduralObjections: "प्रत्याशित प्रक्रियात्मक आपत्तियां",
        opponentDelayTactic: "विपक्षी देरी रणनीति:",
        similarityScoreLabel: "समानता स्कोर:",
        typeLabel: "प्रकार:",
        noPrecedentCitations: "कोई मिसाल प्रशस्ति पत्र लिंक नहीं किया गया।",
        sufficientProbativeWeight: "पर्याप्त पुष्टिकारक वजन",
        crucialForStandard: "मानक अनुपालन प्रमाण के लिए महत्वपूर्ण",
        noCrossExaminationPlanner: "कोई जिरह योजनाकार तैयार नहीं किया गया।",
        evidenceAdmissibilityRisk: "साक्ष्य स्वीकार्यता जोखिम",
        proceduralDelayRisk: "प्रक्रियात्मक देरी जोखिम",
        financialExposureRisk: "वित्तीय जोखिम जोखिम",
        strategicCounterRisk: "रणनीतिक काउंटर जोखिम",
        activeCaseIntelligenceCommand: "एआई कानूनी™ इंटेलिजेंस कमांड संक्षिप्त",
        litigationCommandSubtitle: "एआई कानूनी™ मुकदमेबाजी कमांड",
        strategyReportTitle: "एआई कानूनी™ पूर्ण मुकदमेबाजी रणनीति रिपोर्ट",
        executiveLitigationBriefTitle: "एआई कानूनी™ कार्यकारी मुकदमेबाजी संक्षिप्त",
        backButton: "पीछे",
        cancelButton: "रद्द करें",
        createScenarioButton: "परिदृश्य बनाएं",
        loadStrategyButton: "रणनीति लोड करें",
        addToDossierButton: "डोजियर में जोड़ें",
        unSavedChanges: "असुरक्षित परिवर्तन",
        noChanges: "कोई परिवर्तन नहीं",
        depositionEvidenceCardsTitle: "जमा साक्ष्य कार्ड",
        evidenceTitleNameLabel: "साक्ष्य शीर्षक / नाम",

        // Case Predictor Specifics'''

# Replace English Specials in translations file
if '        // Strategy Engine Specifics' in trans_content:
    trans_content = re.sub(r'// Strategy Engine Specifics[\s\S]*?// Case Predictor Specifics', eng_missing, trans_content, count=1)
    
# Replace Hindi Specials in translations file
occurrences = [m.start() for m in re.finditer('        // Strategy Engine Specifics', trans_content)]
if len(occurrences) > 1:
    second_idx = occurrences[1]
    trans_content = trans_content[:second_idx] + hin_missing + trans_content[second_idx + len('        // Strategy Engine Specifics'):]

with open(translations_path, 'w', encoding='utf-8') as f:
    f.write(trans_content)
print("Translations dictionary successfully populated with all Strategy Engine keys.")

# Open StrategyEngine.jsx
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Exact substitutions targeting specific labels in StrategyEngine.jsx
substitutions = [
    # Search Templates Select Box
    ('<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Search Strategy Templates</label>',
     '<label className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t(\'searchStrategyTemplates\') || "Search Strategy Templates"}</label>'),
    
    # Active Case Summary Evidence dossiers card
    ('<span className="text-[8px] uppercase font-black text-slate-400 tracking-wide">Evidence dossiers</span>',
     '<span className="text-[8px] uppercase font-black text-slate-400 tracking-wide">{t(\'evidenceDossiersTitle\') || "Evidence dossiers"}</span>'),
     
    # Active Case Summary AI readiness badge fix
    ("text-[8px] font-black text-slate-400 uppercase\">{t('aiReadiness') || \"AI Readiness\"}: {caseTitle ? '{t('ready') || \"Ready\"}' : 'Incomplete'}",
     "text-[8px] font-black text-slate-400 uppercase\">{t('aiReadiness') || \"AI Readiness\"}: {caseTitle ? (t('ready') || \"Ready\") : \"Incomplete\"}"),
     
    # No evidence logged yet
    ('No evidence logged yet. Use AI Autofill or add manually below.',
     '{t(\'noEvidenceLoggedYet\') || "No evidence logged yet. Use AI Autofill or add manually below."}'),
     
    # Add custom evidence item label
    ('<span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Add custom evidence item</span>',
     '<span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">{t(\'addCustomEvidenceItem\') || "Add custom evidence item"}</span>'),
     
    # Witness Pool Accordion
    ('<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'witnesses\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-805 dark:text-white\'}`}>Witness Pool</span>',
     '<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'witnesses\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-805 dark:text-white\'}`}>{t(\'witnessPoolTitle\') || "Witness Pool"}</span>'),
     
    # Milestones Chronology Accordion
    ('<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'timeline\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-805 dark:text-white\'}`}>Milestones Chronology</span>',
     '<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'timeline\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-805 dark:text-white\'}`}>{t(\'milestonesChronologyTitle\') || "Milestones Chronology"}</span>'),
     
    # Milestones Chronology Accordion (Active tab is timelines)
    ('<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'timeline\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-800 dark:text-white\'}`}>Milestones Chronology</span>',
     '<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'timeline\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-800 dark:text-white\'}`}>{t(\'milestonesChronologyTitle\') || "Milestones Chronology"}</span>'),
     
    # Chronological Milestones Chain
    ('<span className="text-[8px] font-black text-slate-405 uppercase">Chronological Milestones Chain</span>',
     '<span className="text-[8px] font-black text-slate-405 uppercase">{t(\'chronologicalMilestonesChain\') || "Chronological Milestones Chain"}</span>'),
     
    # AI Chronology Sync button
    ('<span>AI Chronology Sync</span>',
     '<span>{t(\'aiChronologySync\') || "AI Chronology Sync"}</span>'),
     
    # No timeline milestones parsed yet
    ('No timeline milestones parsed yet.',
     '{t(\'noTimelineMilestones\') || "No timeline milestones parsed yet."}'),
     
    # Witness Registry Add manually Accordion
    ('<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'witnesses\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-800 dark:text-white\'}`}>Witness Registry (Add manually)</span>',
     '<span className={`text-[10px] font-black uppercase tracking-wider ${activeAccordion === \'witnesses\' ? \'text-indigo-600 dark:text-indigo-400\' : \'text-slate-800 dark:text-white\'}`}>{t(\'witnessRegistryAddManuallyTitle\') || "Witness Registry (Add manually)"}</span>'),
     
    # Evidence dossiers grid admissibility labels
    ('Admis: {e.admissibility}', 'Admis: {e.admissibility}'),
    
    # Show Advanced parameters button
    ("<span>{showAdvanced ? 'Hide Advanced Parameters' : 'Show Advanced Parameters'}</span>",
     "<span>{showAdvanced ? (t('hideAdvancedParameters') || 'Hide Advanced Parameters') : (t('showAdvancedParameters') || 'Show Advanced Parameters')}</span>"),
     
    # overall readiness text
    ('overall readiness', "{t(\'overallReadiness\') || \"overall readiness\"}"),
    ('% Ready', "% {t('ready') || 'Ready'}"),
    
    # Generate Trial Strategy button
    ('<span>Generate Trial Strategy Roadmap</span>',
     '<span>{t(\'generateTrialStrategyRoadmap\') || "Generate Trial Strategy Roadmap"}</span>'),
     
    # Report structure: Executive Summary
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Executive Summary</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'executiveSummary\') || "Executive Summary"}</h3>'),
     
    # Report structure: Winning Probability
    ('<span>Winning Probability</span>',
     '<span>{t(\'winningProbability\') || "Winning Probability"}</span>'),
     
    # Report structure: Case Strength Score
    ('<span>Case Strength Score</span>',
     '<span>{t(\'caseStrengthScore\') || "Case Strength Score"}</span>'),
     
    # Report structure: Strengths
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Strengths</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'strengthsTitle\') || "Strengths"}</h3>'),
     
    # Report structure: Weaknesses
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Weaknesses</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'weaknessesTitle\') || "Weaknesses"}</h3>'),
     
    # Report structure: Key Legal Issues
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Key Legal Issues</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'keyLegalIssuesTitle\') || "Key Legal Issues"}</h3>'),
     
    # Report structure: Opponent Analysis
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-655 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Opponent Analysis</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-655 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'opponentAnalysisTitle\') || "Opponent Analysis"}</h3>'),
     
    # Report structure: Relevant Precedents
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Relevant Precedents</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'relevantPrecedentsTitle\') || "Relevant Precedents"}</h3>'),
     
    # Report structure: Evidence Evaluation
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Evidence Evaluation</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'evidenceEvaluationTitle\') || "Evidence Evaluation"}</h3>'),
     
    # Report structure: Recommended Arguments
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Recommended Arguments</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'recommendedArgumentsTitle\') || "Recommended Arguments"}</h3>'),
     
    # Report structure: Cross Examination Strategy
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Cross Examination Strategy</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'crossExaminationStrategyTitle\') || "Cross Examination Strategy"}</h3>'),
     
    # Report structure: Risk Assessment
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Risk Assessment</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'riskAssessmentTitle\') || "Risk Assessment"}</h3>'),
     
    # Report structure: Settlement Recommendation
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Settlement Recommendation</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'settlementRecommendationTitle\') || "Settlement Recommendation"}</h3>'),
     
    # Report structure: Litigation Roadmap
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Litigation Roadmap</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'litigationRoadmapTitle\') || "Litigation Roadmap"}</h3>'),
     
    # Report structure: Immediate Next Steps
    ('<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">Immediate Next Steps</h3>',
     '<h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-1 border-slate-200 dark:border-zinc-800/80">{t(\'immediateNextStepsTitle\') || "Immediate Next Steps"}</h3>'),
     
    # Simulation History Logs
    ('<h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Simulation History Logs</h3>',
     '<h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">{t(\'simulationHistoryLogs\') || "Simulation History Logs"}</h3>'),
     
    # Search simulation strategies placeholder
    ('placeholder="Search past simulation strategies..."',
     'placeholder={t(\'searchPastSimulationStrategies\') || "Search past simulation strategies..."}'),
     
    # No history archived text
    ('<p className="text-xs font-semibold text-slate-400">No strategy simulations archived.</p>',
     '<p className="text-xs font-semibold text-slate-400">{t(\'noStrategySimulationsArchived\') || "No strategy simulations archived."}</p>'),
     
    # Load Strategy button text
    ('Load Strategy', '{t(\'loadStrategyButton\') || "Load Strategy"}'),
    
    # New scenario form fields
    ('<h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">New Scenario Case file</h3>',
     '<h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">{t(\'newScenarioCaseFile\') || "New Scenario Case file"}</h3>'),
     
    ('<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Client / Petitioner Name *</label>',
     '<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{t(\'clientPetitionerName\') || "Client / Petitioner Name *"}</label>'),
     
    ('placeholder="e.g. Ramesh Gupta"', 'placeholder={t(\'clientNamePlaceholder\') || "e.g. Ramesh Gupta"}'),
    
    ('<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Opposing Party Name</label>',
     '<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{t(\'opposingPartyName\') || "Opposing Party Name"}</label>'),
     
    ('placeholder="e.g. Suresh Verma"', 'placeholder={t(\'opposingPartyPlaceholder\') || "e.g. Suresh Verma"}'),
    
    ('<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Court Jurisdiction</label>',
     '<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{t(\'courtJurisdictionLabel\') || "Court Jurisdiction"}</label>'),
     
    ('placeholder="e.g. Supreme Court of India"', 'placeholder={t(\'courtJurisdictionPlaceholder\') || "e.g. Supreme Court of India"}'),
    
    ('<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Brief Case Facts Summary</label>',
     '<label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{t(\'briefSynopsisDispute\') || "Brief Case Facts Summary"}</label>'),
     
    ('placeholder="Type a brief synopsis of the dispute..."',
     'placeholder={t(\'briefSynopsisPlaceholder\') || "Type a brief synopsis of the dispute..."}'),
     
    ('Create Scenario', '{t(\'createScenarioButton\') || "Create Scenario"}'),
    ('Cancel', '{t(\'cancelButton\') || "Cancel"}'),
    
    # Note Editor
    ("editingNoteId ? 'Editing Note' : '{t(\'newNote\') || \"New Note\"}'",
     "editingNoteId ? (t('editNote') || 'Edit Note') : (t('newNote') || 'New Note')"),
     
    # Toast strings
    ("toast.success('Note saved successfully.');",
     "toast.success(t('noteSavedSuccessfully') || 'Note saved successfully.');"),
     
    ("toast.error('Failed to save note. Please try again.');",
     "toast.error(t('noteSaveFailed') || 'Failed to save note. Please try again.');"),
     
    ("toast.success('Note deleted.');",
     "toast.success(t('noteDeleted') || 'Note deleted.');"),
     
    ("toast.error('Failed to delete note.');",
     "toast.error(t('noteDeleteFailed') || 'Failed to delete note.');"),
     
    ("toast.success(\"Strategy successfully updated in Database!\");",
     "toast.success(t('strategyUpdatedInDb') || \"Strategy successfully updated in Database!\");"),
     
    ("toast.error(\"Failed to save strategy: \" + err.message);",
     "toast.error((t('strategySaveFailed') || \"Failed to save strategy: \") + err.message);"),
     
    ("toast.success(\"Task appended to checklist.\");",
     "toast.success(t('taskAppended') || \"Task appended to checklist.\");"),
     
    ("toast.error(\"Please provide case facts or load templates first.\");",
     "toast.error(t('provideCaseFactsFirst') || \"Please provide case facts or load templates first.\");"),
     
    ("toast.success(\"AI litigation analysis complete!\", { id: toastId });",
     "toast.success(t('aiAnalysisComplete') || \"AI litigation analysis complete!\", { id: toastId });"),
     
    ("toast.error(\"Failed to compile strategy simulation: \" + e.message, { id: toastId });",
     "toast.error((t('failedToCompileSimulation') || \"Failed to compile strategy simulation: \") + e.message, { id: toastId });"),
     
    ("toast.error(\"Please enter Case Facts first so the AI can extract data.\");",
     "toast.error(t('enterCaseFactsFirst') || \"Please enter Case Facts first so the AI can extract data.\");"),
     
    ("toast.success(\"Timeline milestones extracted!\", { id: tid });",
     "toast.success(t('timelineMilestonesExtracted') || \"Timeline milestones extracted!\", { id: tid });"),
     
    ("toast.success(\"Evidence items extracted!\", { id: tid });",
     "toast.success(t('evidenceItemsExtracted') || \"Evidence items extracted!\", { id: tid });"),
     
    ("toast.success(\"Witness pool identified!\", { id: tid });",
     "toast.success(t('witnessPoolIdentified') || \"Witness pool identified!\", { id: tid });"),
     
    ("toast.error(\"Failed to extract data. Make sure facts are detailed.\", { id: tid });",
     "toast.error(t('extractionFailed') || \"Failed to extract data. Make sure facts are detailed.\", { id: tid });"),
     
    ("toast.success(`${files.length} documents uploaded to workspace.`);",
     "toast.success(`${files.length} ` + (t('documentsUploaded') || \"documents uploaded to workspace.\"));"),
     
    ("toast.error(\"Please upload at least one legal document first.\");",
     "toast.error(t('uploadOneDocFirst') || \"Please upload at least one legal document first.\");"),
     
    ("toast.success(\"Documents successfully parsed! Scenario builder prefilled.\", { id: tid });",
     "toast.success(t('documentsParsed') || \"Documents successfully parsed! Scenario builder prefilled.\", { id: tid });"),
     
    ("toast.error(\"Failed to extract content from documents.\", { id: tid });",
     "toast.error(t('documentExtractionFailed') || \"Failed to extract content from documents.\", { id: tid });"),
     
    ("toast.error(\"Popup blocked! Enable popups to print/export PDF.\");",
     "toast.error(t('popupBlocked') || \"Popup blocked! Enable popups to print/export.\");"),
     
    ("toast.success(\"Word Document exported successfully!\");",
     "toast.success(t('wordExported') || \"Word Document exported successfully!\");"),
     
    ("toast.success(`Template loaded: ${seed.title}`);",
     "toast.success((t('templateLoaded') || \"Template loaded: \") + seed.title);"),
     
    ("toast.success(\"Strategy removed from history.\");",
     "toast.success(t('strategyRemoved') || \"Strategy removed from history.\");"),
     
    ("toast.error(\"Failed to delete strategy from archive.\");",
     "toast.error(t('deleteStrategyFailed') || \"Failed to delete strategy from archive.\");"),
     
    ("toast.success(`Selected Active Case: ${selectedProj.name}`);",
     "toast.success((t('selectedActiveCase') || \"Selected Active Case: \") + selectedProj.name);"),
     
    ("toast.error(\"Client Name is required\");",
     "toast.error(t('clientNameRequired') || \"Client Name is required\");"),
     
    ("toast.success(\"New litigation matter created successfully!\", { id: tid });",
     "toast.success(t('litigationMatterCreated') || \"New litigation matter created successfully!\", { id: tid });"),
     
    ("toast.error(\"Failed to create case\", { id: tid });",
     "toast.error(t('failedToCreateCase') || \"Failed to create case\", { id: tid });"),
     
    ("toast.success(\"Evidence added to dossier.\");",
     "toast.success(t('evidenceAdded') || \"Evidence added to dossier.\");"),
     
    ("toast.success(\"Witness added to pool.\");",
     "toast.success(t('witnessAdded') || \"Witness added to pool.\");"),
     
    ("toast.success(\"Timeline milestone added.\");",
     "toast.success(t('timelineMilestoneAdded') || \"Timeline milestone added.\");"),
     
    ("toast.success(\"Copied to clipboard!\");",
     "toast.success(t('copiedToClipboard') || \"Copied to clipboard!\");"),
     
    ("toast.success(`Loaded strategy: ${item.title}`);",
     "toast.success((t('loadedStrategy') || \"Loaded strategy: \") + item.title);"),
     
    # Form titles & templates list categories
    ('<span className="text-[8px] uppercase font-black text-slate-400">RECENT TEMPLATES</span>',
     '<span className="text-[8px] uppercase font-black text-slate-400">{t(\'recentTemplatesLabel\') || "RECENT TEMPLATES"}</span>'),
     
    ('<span className="text-[8px] uppercase font-black text-slate-400">FAVORITE TEMPLATES</span>',
     '<span className="text-[8px] uppercase font-black text-slate-400">{t(\'favoriteTemplatesLabel\') || "FAVORITE TEMPLATES"}</span>'),
     
    ('<span>ALL TEMPLATES</span>', '<span>{t(\'allTemplatesCategory\') || "ALL TEMPLATES"}</span>'),
    
    ('<span className="text-[8.5px] font-black uppercase text-indigo-500 tracking-wider">Litigation Roadmap Templates</span>',
     '<span className="text-[8.5px] font-black uppercase text-indigo-500 tracking-wider">{t(\'litigationRoadmapTemplates\') || "Litigation Roadmap Templates"}</span>'),

    # Manual witness input placeholders
    ('placeholder="Enter witness name..."', 'placeholder={t(\'addWitnessPlaceholder\') || "Enter witness name..."}'),
    ('placeholder="Enter role (e.g. eye witness)..."', 'placeholder={t(\'witnessRolePlaceholder\') || "Enter role (e.g. eye witness)..."}'),
    
    # Milestone timeline inputs
    ('placeholder="Enter milestone title..."', 'placeholder={t(\'addTimelineMilestonePlaceholder\') || "Enter milestone title..."}'),
    
    # Add witness button
    ('Add Witness', '{t(\'addWitnessTitle\') || "Add Witness"}'),
    
    # Form labels
    ('Witness Name', '{t(\'witnessNameLabel\') || "Witness Name"}'),
    ('Witness Role', '{t(\'witnessRoleLabel\') || "Witness Role"}'),
    ('Add to Dossier', '{t(\'addToDossierButton\') || "Add to Dossier"}'),
    ('Add Evidence', '{t(\'addEvidence\') || "Add Evidence"}'),
    ('Evidence Title / Name', '{t(\'evidenceTitleNameLabel\') || "Evidence Title / Name"}'),
    ('placeholder="e.g. Agreement sheet copy"', 'placeholder={t(\'evidenceTitlePlaceholder\') || "e.g. Agreement sheet copy"}'),

    # PDF exports
    ('`AI LEGAL™ Strategy Report - ${caseTitle}`', '`AI LEGAL™ ` + (t(\'strategyEngineTitle\') || \"Strategy Engine\") + ` - ${caseTitle}`'),
    ('`AI LEGAL™ Full Litigation Strategy Report`', '`AI LEGAL™ ` + (t(\'strategyReportTitle\') || \"AI LEGAL™ Full Litigation Strategy Report\")'),
    ('`AI LEGAL™ Executive Litigation Brief - ${caseTitle}`', '`AI LEGAL™ ` + (t(\'executiveLitigationBriefTitle\') || \"AI LEGAL™ Executive Litigation Brief\") + ` - ${caseTitle}`'),
    ('`AI LEGAL™ Executive Litigation Brief`', '`AI LEGAL™ ` + (t(\'executiveLitigationBriefTitle\') || \"AI LEGAL™ Executive Litigation Brief\")')
]

for idx, (old, new) in enumerate(substitutions):
    if old in content:
        content = content.replace(old, new)
        print(f"[SUCCESS] #{idx} Replaced custom pattern")
    else:
        # Try finding normalized/trimmed matching
        old_clean = old.strip()
        if old_clean in content:
            content = content.replace(old_clean, new)
            print(f"[SUCCESS] #{idx} Replaced cleaned pattern")
        else:
            print(f"[WARNING] #{idx} Pattern not found: {old[:50]}...")

# Write back modifications
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File StrategyEngine.jsx successfully finalized!")
