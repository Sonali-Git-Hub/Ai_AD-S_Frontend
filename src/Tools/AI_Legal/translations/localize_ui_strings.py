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
        estimatedProcessingTime12Sec: "ESTIMATED PROCESSING TIME: 12 SEC",
        preparingArguments: "Preparing Arguments...",
        evaluatingEvidence: "Evaluating Evidence...",
        analyzingCaseFacts: "Analyzing Case Facts...",
        loadingJudicialIntelligence: "Loading Judicial Intelligence...",
        litigationStrategyCommand: "AI LEGAL™ LITIGATION STRATEGY COMMAND",
        confidentialLegalReportPrivileged: "CONFIDENTIAL LEGAL REPORT // PRIVILEGED ATTORNEY WORK PRODUCT",
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
        timelineRoadmap: "समयरेखा रोडमैप",
        nextStepsRecommendations: "अगले कदम और सिफारिशें",
        prayerFinalSubmissions: "प्रार्थना और अंतिम प्रस्तुतियाँ",
        simulateLitigationStrategy: "मुकदमेबाजी रणनीति सिमुलेशन",
        strategyControls: "रणनीति नियंत्रण",
        changeSource: "स्रोत बदलें",
        syncing: "सिंक हो रहा है",
        caseFactsClaims: "केस तथ्य और दावे",
        factsStatementBrief: "तथ्य विवरण संक्षिप्त",
        factsStatementBriefPlaceholder: "मामले के विस्तृत तथ्य, उल्लंघन के विवरण, लेनदेन के मुद्दों को दर्ज करें...",
        caseFactsEmptyWarning: "⚠️ केस तथ्य वर्तमान में खाली हैं। विवरण दर्ज करें या रणनीति लक्ष्यों को आबाद करने के लिए सक्रिय मामलों का उपयोग करें।",
        litigationStrategyHistory: "मुकदमेबाजी रणनीति इतिहास",
        noPreviousLogsFound: "डेटाबेस इतिहास में कोई पिछला लॉग नहीं मिला।",
        advocateNotesPlaceholder: "यहाँ रणनीतिक वकालत नोट्स, समयरेखा समायोजन, या परीक्षण टिप्पणियाँ लिखें...",
        lastSaved: "अंतिम बार सहेजा गया",
        newNote: "नया नोट",
        editNote: "नोट संपादित करें",
        noteContent: "नोट सामग्री",
        deleteNoteConfirm: "क्या आप वाकई इस नोट को हटाना चाहते हैं?",
        deleteNote: "नोट हटाएं",
        saveNote: "नोट सहेजें",
        searchNotesPlaceholder: "रणनीतिक नोट्स खोजें...",
        noStrategicNotesFound: "कोई रणनीतिक नोट्स नहीं मिले।",
        recentStrategyCount: "हालिया रणनीति संख्या:",
        lastSimulation: "अंतिम सिमुलेशन:",
        activeCaseSwitching: "सक्रिय केस स्विचिंग",
        useActiveCase: "सक्रिय केस का उपयोग करें",
        autoFillCaseFields: "सभी केस फ़ील्ड स्वतः भरें",
        createNewScenario: "नया परिदृश्य बनाएं",
        searchStrategyTemplates: "रणनीति टेम्पलेट्स खोजें",
        loadPresetTemplate: "टेम्पलेट लोड करें",
        caseTitle: "केस शीर्षक",
        ready: "तैयार",
        strengthsTitle: "ताकत",
        weaknessesTitle: "कमजोरियां",
        keyLegalIssuesTitle: "प्रमुख कानूनी मुद्दे",
        opponentAnalysisTitle: "विपक्षी विश्लेषण",
        relevantPrecedentsTitle: "प्रासंगिक मिसालें",
        courtTimelineTitle: "अदालत की समयरेखा",
        immediateNextStepsTitle: "तत्काल अगले कदम",
        recommendationsTitle: "सिफारिशें",
        generate: "जनरेट करें",
        regenerate: "पुनर्जनरेट करें",
        save: "सहेजें",
        pdf: "पीडीएफ",
        download: "डाउनलोड",
        print: "प्रिंट",
        share: "साझा करें",
        export: "निर्यात",
        simulation: "सिमुलेशन",
        previousReports: "पिछली रिपोर्टें",
        restore: "पुनर्स्थापित करें",
        delete: "हटाएं",
        uploadFailed: "अपलोड विफल रहा",
        generationFailed: "जेनरेशन विफल रहा",
        validationError: "सत्यापन त्रुटि",
        missingInformation: "लापता जानकारी",
        serverError: "सर्वर त्रुटि",
        networkError: "नेटवर्क त्रुटि",
        noCaseSelected: "कोई केस नहीं चुना गया",
        noStrategyGenerated: "कोई रणनीति जनरेट नहीं की गई",
        noHistory: "कोई इतिहास नहीं",
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
print("Translations dictionary updated with missing Strategy Engine keys.")

# Open StrategyEngine.jsx
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_exact(old, new, desc):
    global content
    if old in content:
        content = content.replace(old, new)
        print(f"[SUCCESS] {desc}")
    else:
        print(f"[FAILED] {desc}")

# Perform exact string replacements for translation wrapping
replace_exact(
    'Strategy Engine',
    "{t('strategyEngineTitle') || \"Strategy Engine\"}",
    "Translate Strategy Engine Title"
)

replace_exact(
    'AI-powered litigation simulation, opponent prediction, judicial risk analysis, evidence evaluation and courtroom strategy planning.',
    "{t('strategyEngineSubtitle') || \"AI-powered litigation simulation, opponent prediction, judicial risk analysis, evidence evaluation and courtroom strategy planning.\"}",
    "Translate Subtitle"
)

replace_exact(
    'Recent Strategy count:',
    "{t('recentStrategyCount') || \"Recent Strategy count:\"}",
    "Translate Recent Strategy count:"
)

replace_exact(
    'Last Simulation:',
    "{t('lastSimulation') || \"Last Simulation:\"}",
    "Translate Last Simulation:"
)

replace_exact(
    'Advocate Notes',
    "{t('advocateNotes') || \"Advocate Notes\"}",
    "Translate Advocate Notes"
)

replace_exact(
    'History ({historyData.length})',
    "{t('history') || \"History\"} ({historyData.length})",
    "Translate History count button"
)

replace_exact(
    'Choose Input Source',
    "{t('chooseInputSource') || \"Choose Input Source\"}",
    "Translate Choose Input Source label"
)

replace_exact(
    'Active Case Switching',
    "{t('activeCaseSwitching') || \"Active Case Switching\"}",
    "Translate Active Case Switching label"
)

replace_exact(
    'Create New Scenario',
    "{t('createNewScenario') || \"Create New Scenario\"}",
    "Translate Create New Scenario button"
)

replace_exact(
    'Use Active Case',
    "{t('useActiveCase') || \"Use Active Case\"}",
    "Translate Use Active Case toggle label"
)

replace_exact(
    'Auto-fill all case fields',
    "{t('autoFillCaseFields') || \"Auto-fill all case fields\"}",
    "Translate Auto-fill case sub-label"
)

replace_exact(
    'Document Upload Workspace',
    "{t('documentUploadWorkspace') || \"Document Upload Workspace\"}",
    "Translate Document Upload Workspace title"
)

replace_exact(
    'Drag & drop files or click to browse',
    "{t('dragAndDropBrowse') || \"Drag & drop files or click to browse\"}",
    "Translate Drag and Drop"
)

replace_exact(
    'Supports PDFs, Plaints, Agreements, FIRs',
    "{t('supportsPdfPlaintsFirs') || \"Supports PDFs, Plaints, Agreements, FIRs\"}",
    "Translate Document Support notice"
)

replace_exact(
    'AI Parse Uploaded Documents',
    "{t('aiParseDocuments') || \"AI Parse Uploaded Documents\"}",
    "Translate AI Parse button"
)

replace_exact(
    'Legal Strategy Config',
    "{t('legalStrategyConfig') || \"Legal Strategy Config\"}",
    "Translate Legal Strategy Config header"
)

replace_exact(
    'Strategy Goal / Practice Area',
    "{t('strategyGoalPracticeArea') || \"Strategy Goal / Practice Area\"}",
    "Translate Strategy Goal header"
)

replace_exact(
    'SEARCH STRATEGY TEMPLATES',
    "{t('searchStrategyTemplates') || \"SEARCH STRATEGY TEMPLATES\"}",
    "Translate Search Strategy Templates label"
)

replace_exact(
    '-- Load Preset Template --',
    "{t('loadPresetTemplate') || \"-- Load Preset Template --\"}",
    "Translate Load Preset Template option"
)

replace_exact(
    '-- Select Case File --',
    "{t('selectCaseFilePlaceholder') || \"-- Select Case File --\"}",
    "Translate Select Case File placeholder option"
)

replace_exact(
    'Active Case Summary',
    "{t('activeCaseSummaryTitle') || \"Active Case Summary\"}",
    "Translate Active Case Summary title"
)

replace_exact(
    'Case Title / Parties',
    "{t('caseTitleParties') || \"Case Title / Parties\"}",
    "Translate Case Title / Parties header"
)

replace_exact(
    'Court Category',
    "{t('courtCategory') || \"Court Category\"}",
    "Translate Court Category header"
)

replace_exact(
    'Jurisdiction',
    "{t('jurisdiction') || \"Jurisdiction\"}",
    "Translate Jurisdiction header"
)

replace_exact(
    'Litigation Stage',
    "{t('litigationStage') || \"Litigation Stage\"}",
    "Translate Litigation Stage header"
)

replace_exact(
    'Evidence Dossiers',
    "{t('evidenceDossiers') || \"Evidence Dossiers\"}",
    "Translate Evidence Dossiers header"
)

replace_exact(
    'AI Readiness',
    "{t('aiReadiness') || \"AI Readiness\"}",
    "Translate AI Readiness label"
)

replace_exact(
    'Ready',
    "{t('ready') || \"Ready\"}",
    "Translate Ready badge"
)

replace_exact(
    'Case Facts & Claims',
    "{t('caseFactsClaims') || \"Case Facts & Claims\"}",
    "Translate Case Facts & Claims title"
)

replace_exact(
    'Facts statement brief',
    "{t('factsStatementBrief') || \"Facts statement brief\"}",
    "Translate Facts statement brief label"
)

replace_exact(
    'Clear',
    "{t('clear') || \"Clear\"}",
    "Translate Clear action link"
)

replace_exact(
    'Copy',
    "{t('copy') || \"Copy\"}",
    "Translate Copy action link"
)

replace_exact(
    'Evidence Dossier',
    "{t('evidenceDossier') || \"Evidence Dossier\"}",
    "Translate Evidence Dossier title"
)

replace_exact(
    'Deposition Evidence Cards',
    "{t('depositionEvidenceCards') || \"Deposition Evidence Cards\"}",
    "Translate Deposition Evidence Cards sub-title"
)

# Accordions & other UI labels
replace_exact(
    'Autofill Dossier',
    "{t('autofillDossier') || \"Autofill Dossier\"}",
    "Translate Autofill Dossier button"
)

replace_exact(
    'Deposition Witness Cards',
    "{t('depositionWitnessCardsTitle') || \"Deposition Witness Cards\"}",
    "Translate Deposition Witness Cards title"
)

replace_exact(
    'Milestone Timeline',
    "{t('milestoneTimelineTitle') || \"Milestone Timeline\"}",
    "Translate Milestone Timeline title"
)

replace_exact(
    'Relief & Previous Orders',
    "{t('reliefPreviousOrders') || \"Relief & Previous Orders\"}",
    "Translate Relief & Previous Orders title"
)

replace_exact(
    'Relief Category preset',
    "{t('reliefCategoryPreset') || \"Relief Category preset\"}",
    "Translate Relief Category preset"
)

replace_exact(
    'Relief Sought Details (AI suggested / editable)',
    "{t('reliefSoughtDetailsSuggested') || \"Relief Sought Details (AI suggested / editable)\"}",
    "Translate Relief Sought Details suggested label"
)

replace_exact(
    'Previous Court Orders (if any)',
    "{t('previousCourtOrdersIfAny') || \"Previous Court Orders (if any)\"}",
    "Translate Previous Court Orders label"
)

replace_exact(
    'Strategy Readiness',
    "{t('strategyReadiness') || \"Strategy Readiness\"}",
    "Translate Strategy Readiness title"
)

replace_exact(
    'overall readiness',
    "{t('overallReadiness') || \"overall readiness\"}",
    "Translate overall readiness text"
)

replace_exact(
    'Generate Trial Strategy Roadmap',
    "{t('generateTrialStrategyRoadmap') || \"Generate Trial Strategy Roadmap\"}",
    "Translate Generate Trial Strategy button"
)

replace_exact(
    'ESTIMATED PROCESSING TIME: 12 SEC',
    "{t('estimatedProcessingTime12Sec') || \"ESTIMATED PROCESSING TIME: 12 SEC\"}",
    "Translate Processing time warning"
)

# Loading messages
replace_exact(
    'GENERATING AI STRATEGY...',
    "{t('generatingAiStrategy') || \"GENERATING AI STRATEGY...\"}",
    "Translate loader generating strategy"
)

replace_exact(
    'Preparing Arguments...',
    "{t('preparingArguments') || \"Preparing Arguments...\"}",
    "Translate loader preparing arguments"
)

replace_exact(
    'Evaluating Evidence...',
    "{t('evaluatingEvidence') || \"Evaluating Evidence...\"}",
    "Translate loader evaluating evidence"
)

replace_exact(
    'Analyzing Case Facts...',
    "{t('analyzingCaseFacts') || \"Analyzing Case Facts...\"}",
    "Translate loader analyzing case facts"
)

replace_exact(
    'Loading Judicial Intelligence...',
    "{t('loadingJudicialIntelligence') || \"Loading Judicial Intelligence...\"}",
    "Translate loader judicial intelligence"
)

# Report output sections
replace_exact(
    'AI STRATEGY REPORT',
    "{t('aiStrategyReport') || \"AI STRATEGY REPORT\"}",
    "Translate Report Title header"
)

replace_exact(
    'AI LEGAL™ LITIGATION STRATEGY COMMAND',
    "{t('litigationStrategyCommand') || \"AI LEGAL™ LITIGATION STRATEGY COMMAND\"}",
    "Translate Command subtitle"
)

replace_exact(
    'CONFIDENTIAL LEGAL REPORT // PRIVILEGED ATTORNEY WORK PRODUCT',
    "{t('confidentialLegalReportPrivileged') || \"CONFIDENTIAL LEGAL REPORT // PRIVILEGED ATTORNEY WORK PRODUCT\"}",
    "Translate Confidential note"
)

replace_exact(
    'MATTER DETAILS',
    "{t('matterDetails') || \"MATTER DETAILS\"}",
    "Translate Matter Details sub-header"
)

replace_exact(
    'EXECUTIVE SUMMARY',
    "{t('executiveSummary') || \"EXECUTIVE SUMMARY\"}",
    "Translate Executive Summary header"
)

replace_exact(
    'WINNING PROBABILITY',
    "{t('winningProbability') || \"WINNING PROBABILITY\"}",
    "Translate Winning Probability gauge"
)

replace_exact(
    'CASE STRENGTH SCORE',
    "{t('caseStrengthScore') || \"CASE STRENGTH SCORE\"}",
    "Translate Case Strength Score gauge"
)

replace_exact(
    'STRENGTHS',
    "{t('strengths') || \"STRENGTHS\"}",
    "Translate Strengths header"
)

replace_exact(
    'WEAKNESSES',
    "{t('weaknesses') || \"WEAKNESSES\"}",
    "Translate Weaknesses header"
)

replace_exact(
    'KEY LEGAL ISSUES',
    "{t('keyLegalIssues') || \"KEY LEGAL ISSUES\"}",
    "Translate Key Legal Issues header"
)

replace_exact(
    'OPPONENT ANALYSIS',
    "{t('opponentAnalysis') || \"OPPONENT ANALYSIS\"}",
    "Translate Opponent Analysis header"
)

replace_exact(
    'RELEVANT PRECEDENTS',
    "{t('relevantPrecedents') || \"RELEVANT PRECEDENTS\"}",
    "Translate Relevant Precedents header"
)

replace_exact(
    'Timeline Roadmap',
    "{t('timelineRoadmap') || \"Timeline Roadmap\"}",
    "Translate Timeline Roadmap tab"
)

replace_exact(
    'Next Steps & Recommendations',
    "{t('nextStepsRecommendations') || \"Next Steps & Recommendations\"}",
    "Translate Next Steps tab"
)

replace_exact(
    'Prayer & Final Submissions',
    "{t('prayerFinalSubmissions') || \"Prayer & Final Submissions\"}",
    "Translate Prayer tab"
)

replace_exact(
    'Simulate Litigation Strategy',
    "{t('simulateLitigationStrategy') || \"Simulate Litigation Strategy\"}",
    "Translate Simulate Litigation Strategy header"
)

replace_exact(
    'Strategy Controls',
    "{t('strategyControls') || \"Strategy Controls\"}",
    "Translate Strategy Controls side menu title"
)

replace_exact(
    'Change Source',
    "{t('changeSource') || \"Change Source\"}",
    "Translate Change Source button"
)

replace_exact(
    'Syncing',
    "{t('syncing') || \"Syncing\"}",
    "Translate Syncing status tag"
)

# Textareas placeholders
replace_exact(
    'placeholder="AI will suggest relief details, or you can edit..."',
    'placeholder={t(\'aiWillSuggestRelief\') || "AI will suggest relief details, or you can edit..."}',
    "Translate suggestion placeholder"
)

replace_exact(
    'placeholder="Enter previous stays, notices, or caveat decrees details..."',
    'placeholder={t(\'enterPreviousStaysPlaceholder\') || "Enter previous stays, notices, or caveat decrees details..."}',
    "Translate previous stays placeholder"
)

replace_exact(
    'placeholder="Enter detailed facts of the case, breach details, transaction issues..."',
    'placeholder={t(\'factsStatementBriefPlaceholder\') || "Enter detailed facts of the case, breach details, transaction issues..."}',
    "Translate facts statement text placeholder"
)

replace_exact(
    '⚠️ Case facts currently empty. Enter details or use active cases to populate strategy targets.',
    "{t('caseFactsEmptyWarning') || \"⚠️ Case facts currently empty. Enter details or use active cases to populate strategy targets.\"}",
    "Translate empty warning notice"
)

# History dialog
replace_exact(
    '<span>Forecasting Verdict Logs</span>',
    '<span>{t(\'litigationStrategyHistory\') || "Litigation Strategy History"}</span>',
    "Translate Verdict Logs history header"
)

replace_exact(
    'No previous forecasts found in database history.',
    '{t(\'noPreviousLogsFound\') || "No previous logs found in database history."}',
    "Translate No previous logs warning"
)

# Advocate notes
replace_exact(
    'placeholder="Write strategic advocacy notes, timeline adjustments, or trial comments here..."',
    'placeholder={t(\'advocateNotesPlaceholder\') || "Write strategic advocacy notes, timeline adjustments, or trial comments here..."}',
    "Translate advocate notes placeholder"
)

replace_exact(
    'Last saved',
    "{t('lastSaved') || \"Last saved\"}",
    "Translate Last saved text"
)

replace_exact(
    'New Note',
    "{t('newNote') || \"New Note\"}",
    "Translate New Note button text"
)

replace_exact(
    'Edit Note',
    "{t('editNote') || \"Edit Note\"}",
    "Translate Edit Note text"
)

replace_exact(
    'Note content',
    "{t('noteContent') || \"Note content\"}",
    "Translate Note content label"
)

replace_exact(
    'Are you sure you want to delete this note?',
    "{t('deleteNoteConfirm') || \"Are you sure you want to delete this note?\"}",
    "Translate delete confirm dialogue"
)

replace_exact(
    'Delete Note',
    "{t('deleteNote') || \"Delete Note\"}",
    "Translate Delete Note button"
)

# Toasts
replace_exact(
    'toast.success("Saved Successfully");',
    'toast.success(t(\'savedSuccessfully\') || "Saved Successfully");',
    "Translate save toast"
)

replace_exact(
    'toast.success("PDF Exported Successfully");',
    'toast.success(t(\'pdfExported\') || "PDF Exported Successfully");',
    "Translate PDF export toast"
)

# Buttons
replace_exact(
    '<span>Save Note</span>',
    '<span>{t(\'saveNote\') || "Save Note"}</span>',
    "Translate Save Note button"
)

replace_exact(
    'placeholder="Search strategic notes..."',
    'placeholder={t(\'searchNotesPlaceholder\') || "Search strategic notes..."}',
    "Translate search notes placeholder"
)

replace_exact(
    'No strategic notes found.',
    "{t('noStrategicNotesFound') || \"No strategic notes found.\"}",
    "Translate empty notes warning"
)

# Form placeholders & inline lists inputs
replace_exact(
    'placeholder="Enter milestone title..."',
    'placeholder={t(\'addTimelineMilestonePlaceholder\') || "Enter milestone title..."}',
    "Translate milestone title input"
)

replace_exact(
    'placeholder="Enter witness name..."',
    'placeholder={t(\'addWitnessPlaceholder\') || "Enter witness name..."}',
    "Translate add witness name input"
)

replace_exact(
    'placeholder="Enter role (e.g. eye witness)..."',
    'placeholder={t(\'witnessRolePlaceholder\') || "Enter role (e.g. eye witness)..."}',
    "Translate witness role input"
)

replace_exact(
    'placeholder="Enter evidence name..."',
    'placeholder={t(\'addEvidencePlaceholder\') || "Enter evidence name..."}',
    "Translate add evidence input"
)

# Replace duplicate local LanguageToggle
# Let's see: we should delete the local toggle in report toolbar if it exists.
# We will do that in Python regex matching.
# We will search for LanguageToggle in content and replace the second one.
occurrences = [m.start() for m in re.finditer(r'<LanguageToggle', content)]
if len(occurrences) > 1:
    # There is a duplicate LanguageToggle inside the report toolbar! Let's remove it.
    # Let's inspect content from occurrences[1] to search for the parent block.
    sec_idx = occurrences[1]
    # We find the matching closing tag or surrounding block
    # Let's check: in StrategyEngine.jsx, the second LanguageToggle is around lines 4050-4100
    # Let's look for how it's formatted. It might be:
    # <LanguageToggle lang={outputLang} onChange={setOutputLang} isTranslating={outputIsTranslating} />
    match = re.search(r'<LanguageToggle\s+lang=\{outputLang\}[\s\S]*?/>', content)
    if match:
        content = content.replace(match.group(0), '/* Language Switch removed for single source of truth */')
        print("[SUCCESS] Removed duplicate local LanguageToggle in report toolbar")

# Update systemPrompt template logic inside generateChatResponse
content = content.replace(
    'const systemPrompt = `You are a professional courtroom litigation attorney',
    'const systemPrompt = `You are a professional courtroom litigation attorney in India. Generate all user-facing strategies directly in legal ${toolkitLanguage === "Hindi" ? "Hindi" : "English"}.` + `\n\nYou are a professional courtroom litigation attorney'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File StrategyEngine.jsx successfully translated!")
