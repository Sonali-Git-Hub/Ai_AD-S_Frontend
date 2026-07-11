import os
import re

file_path = '../components/StrategyEngine.jsx'
translations_path = 'legal.translations.js'

with open(translations_path, 'r', encoding='utf-8') as f:
    translations_content = f.read()

# Add English Translations
english_marker = '        // Case Predictor Specifics'
english_additions = '''        // Strategy Engine Specifics
        strategyEngineTitle: "Strategy Engine",
        strategyEngineSubtitle: "AI-powered litigation simulation, opponent prediction, judicial risk analysis, evidence evaluation and courtroom strategy planning.",
        recentStrategyCount: "Recent Strategy count:",
        lastSimulation: "Last Simulation:",
        advocateNotes: "Advocate Notes",
        chooseInputSource: "CHOOSE INPUT SOURCE",
        existingCaseDesc: "Auto-load case from files",
        uploadDocumentsDesc: "AI auto-extracts case files",
        manualStrategyDesc: "Manually specify case profile",
        activeCaseSwitching: "ACTIVE CASE SWITCHING",
        selectCaseFilePlaceholder: "-- Select Case File --",
        createNewScenario: "Create New Scenario",
        useActiveCase: "USE ACTIVE CASE",
        autoFillCaseFields: "Auto-fill all case fields",
        documentUploadWorkspace: "Document Upload Workspace",
        dragAndDropBrowse: "Drag & drop files or click to browse",
        supportsPdfPlaintsFirs: "Supports PDFs, Plaints, Agreements, FIRs",
        aiParseDocuments: "AI Parse Uploaded Documents",
        legalStrategyConfig: "Legal Strategy Config",
        strategyGoalPracticeArea: "Strategy Goal / Practice Area",
        searchStrategyTemplates: "SEARCH STRATEGY TEMPLATES",
        loadPresetTemplatePlaceholder: "-- Load Preset Template --",
        inputConfigStep: "INPUT CONFIG",
        aiAnalysisStep: "AI ANALYSIS",
        strategyReportStep: "STRATEGY REPORT",
        activeCaseSummary: "ACTIVE CASE SUMMARY",
        caseTitleParties: "CASE TITLE / PARTIES",
        courtCategory: "COURT CATEGORY",
        jurisdiction: "JURISDICTION",
        litigationStage: "LITIGATION STAGE",
        evidenceDossiers: "EVIDENCE DOSSIERS",
        aiReadiness: "AI READINESS",
        caseFactsClaims: "CASE FACTS & CLAIMS",
        factsStatementBrief: "FACTS STATEMENT BRIEF",
        evidenceDossier: "EVIDENCE DOSSIER",
        showAdvancedParameters: "Show Advanced Parameters",
        hideAdvancedParameters: "Hide Advanced Parameters",
        generatingAiStrategy: "GENERATING AI STRATEGY...",
        estimatedProcessingTime: "ESTIMATED PROCESSING TIME: 12 SEC",
        preparingArguments: "Preparing Arguments...",
        evaluatingEvidence: "Evaluating Evidence...",
        analyzingCaseFacts: "Analyzing Case Facts...",
        loadingJudicialIntelligence: "Loading Judicial Intelligence...",
        aiStrategyReport: "AI STRATEGY REPORT",
        matterDetails: "MATTER DETAILS",
        executiveSummary: "EXECUTIVE SUMMARY",
        winningProbability: "WINNING PROBABILITY",
        caseStrengthScore: "CASE STRENGTH SCORE",
        strengths: "STRENGTHS",
        weaknesses: "WEAKNESSES",
        keyLegalIssues: "KEY LEGAL ISSUES",
        opponentAnalysis: "OPPONENT ANALYSIS",
        relevantPrecedents: "RELEVANT PRECEDENTS",
        courtTimeline: "COURT TIMELINE",
        immediateNextSteps: "IMMEDIATE NEXT STEPS",
        historySaved: "History Saved",
        languageChanged: "Language Changed",
        noStrategyGenerated: "No Strategy Generated",
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
        uploadFailed: "Upload Failed",
        generationFailed: "Generation Failed",
        validationError: "Validation Error",
        missingInformation: "Missing Information",
        serverError: "Server Error",
        networkError: "Network Error",
        advocateNotesPlaceholder: "Write strategic advocacy notes, timeline adjustments, or trial comments here...",
        lastSaved: "Last saved",
        newNote: "New Note",
        editNote: "Edit Note",
        noteContent: "Note content",
        deleteNoteConfirm: "Are you sure you want to delete this note?",
        strategyControls: "Strategy Controls",
        changeSource: "Change Source",
        syncing: "Syncing",

        // Case Predictor Specifics'''

if english_marker in translations_content and 'strategyEngineTitle' not in translations_content:
    translations_content = translations_content.replace(english_marker, english_additions)
    print("Added English Strategy Engine translations.")

# Add Hindi Translations
hindi_marker = '        // Case Predictor Specifics'
# Since the comment is identical, let's find the second occurrence (Hindi block)
occurrences = [m.start() for m in re.finditer(hindi_marker, translations_content)]
if len(occurrences) > 1 and 'strategyEngineTitle' not in translations_content[occurrences[1]:]:
    second_idx = occurrences[1]
    hindi_additions = '''        // Strategy Engine Specifics
        strategyEngineTitle: "रणनीति इंजन",
        strategyEngineSubtitle: "एआई-संचालित मुकदमेबाजी सिमुलेशन, विरोधी भविष्यवाणी, न्यायिक जोखिम विश्लेषण, साक्ष्य मूल्यांकन और अदालत कक्ष रणनीति योजना।",
        recentStrategyCount: "हालिया रणनीति संख्या:",
        lastSimulation: "अंतिम सिमुलेशन:",
        advocateNotes: "अधिवक्ता नोट्स",
        chooseInputSource: "इनपुट स्रोत चुनें",
        existingCaseDesc: "फाइलों से केस स्वतः लोड करें",
        uploadDocumentsDesc: "एआई स्वतः केस फाइलों को निकालता है",
        manualStrategyDesc: "मैन्युअल रूप से केस प्रोफाइल निर्दिष्ट करें",
        activeCaseSwitching: "सक्रिय केस स्विचिंग",
        selectCaseFilePlaceholder: "-- केस फ़ाइल चुनें --",
        createNewScenario: "नया परिदृश्य बनाएं",
        useActiveCase: "सक्रिय केस का उपयोग करें",
        autoFillCaseFields: "सभी केस फ़ील्ड स्वतः भरें",
        documentUploadWorkspace: "दस्तावेज़ अपलोड कार्यक्षेत्र",
        dragAndDropBrowse: "फ़ाइलें खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
        supportsPdfPlaintsFirs: "पीडीएफ, वादपत्र, समझौते, प्राथमिकी का समर्थन करता है",
        aiParseDocuments: "एआई अपलोड किए गए दस्तावेज़ों का विश्लेषण करें",
        legalStrategyConfig: "कानूनी रणनीति कॉन्फ़िगरेशन",
        strategyGoalPracticeArea: "रणनीति लक्ष्य / अभ्यास क्षेत्र",
        searchStrategyTemplates: "रणनीति टेम्पलेट्स खोजें",
        loadPresetTemplatePlaceholder: "-- प्रीसेट टेम्पलेट लोड करें --",
        inputConfigStep: "इनपुट कॉन्फ़िगरेशन",
        aiAnalysisStep: "एआई विश्लेषण",
        strategyReportStep: "रणनीति रिपोर्ट",
        activeCaseSummary: "सक्रिय केस सारांश",
        caseTitleParties: "केस शीर्षक / पक्षकार",
        courtCategory: "अदालत श्रेणी",
        jurisdiction: "अधिकार क्षेत्र",
        litigationStage: "मुकदमेबाजी चरण",
        evidenceDossiers: "साक्ष्य डोजियर",
        aiReadiness: "एआई तत्परता",
        caseFactsClaims: "केस तथ्य और दावे",
        factsStatementBrief: "तथ्य विवरण संक्षिप्त",
        evidenceDossier: "साक्ष्य डोजियर",
        showAdvancedParameters: "उन्नत पैरामीटर दिखाएं",
        hideAdvancedParameters: "उन्नत पैरामीटर छुपाएं",
        generatingAiStrategy: "एआई रणनीति जनरेट की जा रही है...",
        estimatedProcessingTime: "अनुमानित प्रसंस्करण समय: 12 सेकंड",
        preparingArguments: "तर्क तैयार किए जा रहे हैं...",
        evaluatingEvidence: "साक्ष्य का मूल्यांकन किया जा रहा है...",
        analyzingCaseFacts: "मामले के तथ्यों का विश्लेषण किया जा रहा है...",
        loadingJudicialIntelligence: "न्यायिक बुद्धिमत्ता लोड की जा रही है...",
        aiStrategyReport: "एआई रणनीति रिपोर्ट",
        matterDetails: "मामले का विवरण",
        executiveSummary: "कार्यकारी सारांश",
        winningProbability: "जीतने की संभावना",
        caseStrengthScore: "केस ताकत स्कोर",
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
        uploadFailed: "अपलोड विफल रहा",
        generationFailed: "जेनरेशन विफल रहा",
        validationError: "सत्यापन त्रुटि",
        missingInformation: "लापता जानकारी",
        serverError: "सर्वर त्रुटि",
        networkError: "नेटवर्क त्रुटि",
        advocateNotesPlaceholder: "यहाँ रणनीतिक वकालत नोट्स, समयरेखा समायोजन, या परीक्षण टिप्पणियाँ लिखें...",
        lastSaved: "अंतिम बार सहेजा गया",
        newNote: "नया नोट",
        editNote: "नोट संपादित करें",
        noteContent: "नोट सामग्री",
        deleteNoteConfirm: "क्या आप वाकई इस नोट को हटाना चाहते हैं?",
        strategyControls: "रणनीति नियंत्रण",
        changeSource: "स्रोत बदलें",
        syncing: "सिंक हो रहा है",

        // Case Predictor Specifics'''
    translations_content = translations_content[:second_idx] + hindi_additions + translations_content[second_idx + len(hindi_marker):]
    print("Added Hindi Strategy Engine translations.")

with open(translations_path, 'w', encoding='utf-8') as f:
    f.write(translations_content)

# Start modifying StrategyEngine.jsx
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_exact(old, new, desc):
    global content
    if old in content:
        content = content.replace(old, new)
        print(f"[SUCCESS] {desc}")
    else:
        # Try normalizing whitespace
        old_normalized = re.sub(r'\s+', ' ', old.strip())
        content_normalized = re.sub(r'\s+', ' ', content)
        if old_normalized in content_normalized:
            # We will search with dynamic whitespace regex
            pattern = re.escape(old.strip())
            pattern = re.sub(r'\\\s+', r'\\s+', pattern)
            content, count = re.subn(pattern, new, content)
            if count > 0:
                print(f"[SUCCESS] {desc} (via regex)")
                return
        print(f"[FAILED] {desc}: Old text not found.")

# 1. Destructure translation hook tLegal as t
replace_exact(
    '  const { toolkitLanguage, setToolkitLanguage } = useLanguage();',
    '  const { toolkitLanguage, setToolkitLanguage, tLegal: t } = useLanguage();',
    'Destructuring tLegal as t'
)

# 2. Add rawStrategyResult and isPredictorTranslating (or isStrategyTranslating) states, and deepTranslateStrategyData
replace_exact(
    '''  // Simulation & Loader States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(\'\');
  const [strategyResult, _setStrategyResult] = useState(null);''',
    '''  // Simulation & Loader States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(\'\');
  const [rawStrategyResult, setRawStrategyResult] = useState(null);
  const [isStrategyTranslating, setIsStrategyTranslating] = useState(false);
  const [strategyResult, _setStrategyResult] = useState(null);''',
    'Adding rawStrategyResult and translation states'
)

# 3. Add useOutputLanguage hook call and deepTranslateStrategyData helper
replace_exact(
    '''  // Favorites Templates
  const [favoriteTemplates, setFavoriteTemplates] = useState(() => {''',
    '''  const {
    outputLang,
    setOutputLang,
    isTranslating: outputIsTranslating,
    setIsTranslating: setOutputIsTranslating,
    translateText: translateStrategyText,
    getDisplayText: getStrategyDisplayText,
  } = useOutputLanguage('strategy_engine', currentCase?._id || 'global');

  const deepTranslateStrategyData = useCallback(async (result, targetLang, translateFn) => {
    if (!result) return null;

    const EXCLUDED_KEYS = new Set([
      'id', '_id', 'timestamp', 'overallStrategyScore', 'winningProbability', 'litigationRisk',
      'evidenceStrength', 'precedentSupport', 'aiConfidence', 'courtReadiness',
      'missingEvidenceCount', 'missingDocumentsCount', 'settlementProbability', 'appealRisk',
      'similarityScore', 'legal', 'evidence', 'procedural', 'financial', 'strategic',
      'riskPercentage', 'settlementChance', 'credibilityScore'
    ]);

    const isBypass = (str) => {
      if (!str || typeof str !== 'string') return true;
      const trimmed = str.trim();
      if (!trimmed) return true;
      if (/^[0-9a-fA-F]{32,64}$/.test(trimmed)) return true;
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) return true;
      if (/^\\d+(%|\\/\\d+)?$/.test(trimmed)) return true;
      if (/^\\d{4}-\\d{2}-\\d{2}/.test(trimmed)) return true;
      return false;
    };

    const translatableList = [];

    const traverseCollect = (val, path) => {
      if (val === null || val === undefined) return;
      if (typeof val === 'string') {
        const lastKey = path.split('.').pop();
        if (!EXCLUDED_KEYS.has(lastKey) && !isBypass(val)) {
          translatableList.push({ path, original: val });
        }
      } else if (Array.isArray(val)) {
        val.forEach((item, index) => traverseCollect(item, `${path}[${index}]`));
      } else if (typeof val === 'object') {
        Object.keys(val).forEach(key => {
          traverseCollect(val[key], path ? `${path}.${key}` : key);
        });
      }
    };

    traverseCollect(result, '');

    if (translatableList.length === 0) return result;

    const delimiter = ' ||| ';
    const joinedText = translatableList.map(item => item.original).join(delimiter);

    const translatedText = await translateFn(joinedText);
    const translatedSegments = translatedText.split('|||').map(s => s.trim());

    const cloned = JSON.parse(JSON.stringify(result));

    const setValueAtPath = (obj, path, value) => {
      const parts = path.split(/\\.|\\[|\\]/).filter(Boolean);
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];
        if (/^\\d+$/.test(nextPart) && !current[part]) {
          current[part] = [];
        } else if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      const lastKey = parts[parts.length - 1];
      if (current) {
        current[lastKey] = value;
      }
    };

    if (translatedSegments.length === translatableList.length) {
      translatableList.forEach((item, idx) => {
        setValueAtPath(cloned, item.path, translatedSegments[idx]);
      });
    } else {
      console.warn(`[deepTranslate] strategy translation mismatch: got ${translatedSegments.length}, expected ${translatableList.length}`);
      translatableList.forEach((item, idx) => {
        const translatedVal = translatedSegments[idx] || item.original;
        setValueAtPath(cloned, item.path, translatedVal);
      });
    }

    return cloned;
  }, []);

  // Handle live translation when rawStrategyResult or language changes
  useEffect(() => {
    if (!rawStrategyResult) {
      _setStrategyResult(null);
      return;
    }

    const targetLang = toolkitLanguage === 'Hindi' ? 'Hindi' : 'English';
    const sampleText = rawStrategyResult.strategies?.primary?.description || '';
    const hasDevanagari = /[\\u0900-\\u097F]/.test(sampleText);
    const rawIsHindi = hasDevanagari;
    const targetIsHindi = (targetLang === \'Hindi\');

    if (rawIsHindi === targetIsHindi) {
      _setStrategyResult(rawStrategyResult);
      return;
    }

    setIsStrategyTranslating(true);
    deepTranslateStrategyData(rawStrategyResult, targetLang, (txt) => translateStrategyText(txt, targetLang))
      .then((translated) => {
        _setStrategyResult(translated);
        setIsStrategyTranslating(false);
      })
      .catch((err) => {
        console.error("Failed to translate strategy data:", err);
        _setStrategyResult(rawStrategyResult);
        setIsStrategyTranslating(false);
      });
  }, [rawStrategyResult, toolkitLanguage, translateStrategyText, deepTranslateStrategyData]);

  // Favorites Templates
  const [favoriteTemplates, setFavoriteTemplates] = useState(() => {''',
    'Adding useOutputLanguage hook and deepTranslateStrategyData helper'
)

# 4. Sync history load, delete, save, and reset actions
replace_exact(
    '''  const setStrategyResult = (val) => {
    console.log("[StrategyEngine] setStrategyResult called with:", val);
    console.trace("[StrategyEngine] setStrategyResult Call Stack");
    _setStrategyResult(val);
  };''',
    '''  const setStrategyResult = (val) => {
    console.log("[StrategyEngine] setStrategyResult called with:", val);
    console.trace("[StrategyEngine] setStrategyResult Call Stack");
    _setStrategyResult(val);
  };
  const setRawStrategyResultAndSync = (val) => {
    setRawStrategyResult(val);
    setStrategyResult(val);
  };''',
    'Adding setRawStrategyResultAndSync helper'
)

# Replace local setStrategyResult references with setRawStrategyResultAndSync
replace_exact(
    '    setStrategyResult(null);',
    '    setRawStrategyResultAndSync(null);',
    'Syncing reset setStrategyResult(null)'
)

replace_exact(
    '        setStrategyResult(ls.activeStrategy || null);',
    '        setRawStrategyResultAndSync(ls.activeStrategy || null);',
    'Syncing hydrate activeStrategy'
)

replace_exact(
    '      setStrategyResult(parsed);',
    '      setRawStrategyResultAndSync(parsed);',
    'Syncing parsed strategy generated result'
)

replace_exact(
    '                        setStrategyResult(item.activeStrategy || item);',
    '                        setRawStrategyResultAndSync(item.activeStrategy || item);',
    'Syncing history item load'
)

# Let's save a clean version of isBypass regex (single backslashes)
content = content.replace(
    '      if (/^\\\\d+(%|\\\\/\\\\d+)?$/.test(trimmed)) return true;',
    '      if (/^\\d+(%|\\/\\d+)?$/.test(trimmed)) return true;'
).replace(
    '      if (/^\\\\d{4}-\\\\d{2}-\\\\d{2}/.test(trimmed)) return true;',
    '      if (/^\\d{4}-\\d{2}-\\d{2}/.test(trimmed)) return true;'
).replace(
    '      const parts = path.split(/\\\\.|\\\\[|\\\\]/).filter(Boolean);',
    '      const parts = path.split(/\\.|\\[|\\]/).filter(Boolean);'
).replace(
    '        if (/^\\\\d+$/.test(nextPart) && !current[part]) {',
    '        if (/^\\d+$/.test(nextPart) && !current[part]) {'
)

# Write modified contents
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File successfully saved!")
