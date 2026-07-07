import os
import sys

file_path = r'c:\Users\USER\Desktop\aisa\AISA_New\src\Tools\AI_Legal\components\CasePredictor.jsx'

if not os.path.exists(file_path):
    print(f"Error: File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Helper function to do a single exact replacement and verify it succeeded
def replace_exact(old, new, description):
    global content
    old_norm = old.replace('\r\n', '\n')
    new_norm = new.replace('\r\n', '\n')
    content_norm = content.replace('\r\n', '\n')
    
    count = content_norm.count(old_norm)
    if count == 0:
        print(f"[FAILED] {description}: Old text not found.")
        print(f"Old text snippet: {old_norm[:300]}...")
        sys.exit(1)
    elif count > 1:
        print(f"[FAILED] {description}: Multiple matches found ({count}).")
        sys.exit(1)
    
    content_norm = content_norm.replace(old_norm, new_norm)
    content = content_norm

# 1. Destructure translation hook tLegal as t
replace_exact(
    '  const { toolkitLanguage, setToolkitLanguage } = useLanguage();',
    '  const { toolkitLanguage, setToolkitLanguage, tLegal: t } = useLanguage();',
    'Destructuring tLegal as t'
)

# 2. Add rawPrediction state right after activePrediction state
replace_exact(
    '  const [activePrediction, setActivePrediction] = useState(null);',
    '  const [activePrediction, setActivePrediction] = useState(null);\n  const [rawPrediction, setRawPrediction] = useState(null);',
    'Adding rawPrediction state'
)

# 3. Add deepTranslatePredictionData and live translation effect before displayPrediction declaration
deep_translate_helper = '''
  const deepTranslatePredictionData = useCallback(async (result, targetLang, translateFn) => {
    if (!result) return null;

    const EXCLUDED_KEYS = new Set([
      'id', '_id', 'timestamp', 'successRate', 'defendantWinRate', 'litigationRisk',
      'evidenceStrength', 'caseStrength', 'missingDocsCount', 'courtReadiness',
      'settlementProbability', 'appealRisk', 'confidenceScore', 'estimatedDuration',
      'expectedHearings', 'estimatedLegalCost', 'courtFees', 'advocateFees',
      'documentationCost', 'travelCost', 'miscCost', 'totalLitigationCost',
      'relevanceScore', 'grantRate', 'acceptanceRate', 'probability', 'recommendedValue',
      'expectedSavings', 'riskReduction'
    ]);

    const isBypass = (str) => {
      if (!str || typeof str !== 'string') return true;
      const trimmed = str.trim();
      if (!trimmed) return true;
      if (/^[0-9a-fA-F]{32,64}$/.test(trimmed)) return true;
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) return true;
      if (/^\\\\d+(%|\\\\/\\\\d+)?$/.test(trimmed)) return true;
      if (/^\\\\d{4}-\\d{2}-\\d{2}/.test(trimmed)) return true;
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
      const parts = path.split(/\\\\.|\\\\[|\\\\]/).filter(Boolean);
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];
        if (/^\\\\d+$/.test(nextPart) && !current[part]) {
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
      console.warn(`[deepTranslate] translation segment count mismatch: got ${translatedSegments.length}, expected ${translatableList.length}. Mapping sequentially.`);
      translatableList.forEach((item, idx) => {
        const translatedVal = translatedSegments[idx] || item.original;
        setValueAtPath(cloned, item.path, translatedVal);
      });
    }

    return cloned;
  }, []);

  // Handle live translation when rawPrediction or language changes
  useEffect(() => {
    if (!rawPrediction) {
      setActivePrediction(null);
      return;
    }

    const targetLang = toolkitLanguage === 'Hindi' ? 'Hindi' : 'English';
    const sampleText = rawPrediction.explainPrediction?.whyPredicted || '';
    const hasDevanagari = /[\\u0900-\\u097F]/.test(sampleText);
    const rawIsHindi = hasDevanagari;
    const targetIsHindi = (targetLang === 'Hindi');

    if (rawIsHindi === targetIsHindi) {
      setActivePrediction(rawPrediction);
      return;
    }

    setIsPredictorTranslating(true);
    deepTranslatePredictionData(rawPrediction, targetLang, (txt) => translatePredictorText(txt, targetLang))
      .then((translated) => {
        if (isMountedRef.current) {
          setActivePrediction(translated);
        }
        setIsPredictorTranslating(false);
      })
      .catch((err) => {
        console.error("Failed to translate prediction data:", err);
        if (isMountedRef.current) {
          setActivePrediction(rawPrediction);
        }
        setIsPredictorTranslating(false);
      });
  }, [rawPrediction, toolkitLanguage, translatePredictorText, deepTranslatePredictionData]);
'''

replace_exact(
    '  const displayPrediction = activePrediction;',
    deep_translate_helper + '\n  const displayPrediction = activePrediction;',
    'Injecting deepTranslate prediction helper and effect'
)

# 4. Shadow REPORT_METADATA within the component
report_metadata_shadow = '''
  const reportsMetadata = useMemo(() => [
    {
      id: 'predictionReport',
      title: t('litigationForecast') || 'Litigation Forecast',
      desc: t('litigationForecastDesc') || 'Predict win rates, statutory matches, and outcome risks.',
      icon: 'Scale',
      purpose: t('litigationForecastPurpose') || 'Generate primary litigant forecast outlining success probability percentages, cited laws, and precedents.',
      expected: t('litigationForecastExpected') || 'Executive summary, probability indexes, cited sections, Supreme Court case law matches.',
      estTime: t('litigationForecastEstTime') || '5-8 seconds'
    },
    {
      id: 'clientReport',
      title: t('clientReadiness') || 'Client Readiness',
      desc: t('clientReadinessDesc') || 'Analyze case gaps, action points, and overall trial readiness.',
      icon: 'Users',
      purpose: t('clientReadinessPurpose') || 'Create client readiness index and identify deficiency checklist for trial preparation.',
      expected: t('clientReadinessExpected') || 'Evidentiary gaps, witness deposition availability status, replication action items.',
      estTime: t('clientReadinessEstTime') || '4-6 seconds'
    },
    {
      id: 'judicialForecastReport',
      title: t('judgeBriefing') || 'Judge Briefing',
      desc: t('judgeBriefingDesc') || 'Pre-empt bench questions, material facts, and prayers.',
      icon: 'Landmark',
      purpose: t('judgeBriefingPurpose') || 'Formulate judge briefing note addressing presiding bench observations and pre-empted inquiries.',
      expected: t('judgeBriefingExpected') || 'presiding bench tendencies, factual summary, pre-empted judicial questions and answers.',
      estTime: t('judgeBriefingEstTime') || '6-9 seconds'
    },
    {
      id: 'courtPrepReport',
      title: t('courtPrep') || 'Court Prep',
      desc: t('courtPrepDesc') || 'Track filing compliance, affidavits, and witness schedules.',
      icon: 'Clock',
      purpose: t('courtPrepPurpose') || 'Build courtroom preparation docket mapping filing matrix rules and witness schedules.',
      expected: t('courtPrepExpected') || 'Order IV checklist status, exhibit compendium timeline, trial-day action schedule.',
      estTime: t('courtPrepEstTime') || '5-7 seconds'
    },
    {
      id: 'evidenceReport',
      title: t('evidenceAudit') || 'Evidence Audit',
      desc: t('evidenceAuditDesc') || 'Admissibility reviews, document strength, and missing links.',
      icon: 'FileText',
      purpose: t('evidenceAuditPurpose') || 'Run forensic admissibility audit evaluating exhibit quality, authenticity, and compliance.',
      expected: t('evidenceAuditExpected') || 'Exhibit quality matrix table, Sec 65B compliance check, remediation steps.',
      estTime: t('evidenceAuditEstTime') || '4-5 seconds'
    },
    {
      id: 'settlementReport',
      title: t('settlementAdvisory') || 'Settlement Advisory',
      desc: t('settlementAdvisoryDesc') || 'Mediation probability, negotiation brackets, and risk comparison.',
      icon: 'DollarSign',
      purpose: t('settlementAdvisoryPurpose') || 'Determine settlement advisory comparing trial exposure costs with compromise values.',
      expected: t('settlementAdvisoryExpected') || 'Mediation probability index, optimum negotiation range, trial comparison metrics.',
      estTime: t('settlementAdvisoryEstTime') || '5-6 seconds'
    },
    {
      id: 'strategyReport',
      title: t('timelineStrategy') || 'Timeline Strategy',
      desc: t('timelineStrategyDesc') || 'Court stages, milestones, delay assessments, and actions.',
      icon: 'Target',
      purpose: t('timelineStrategyPurpose') || 'Draft chronological litigation timeline outlining stages, adjournment risk, and options.',
      expected: t('timelineStrategyExpected') || 'Procedural court stage durations, delay mitigation actions, backup options.',
      estTime: t('timelineStrategyEstTime') || '4-6 seconds'
    },
    {
      id: 'executiveSummary',
      title: t('executiveSummary') || 'Executive Summary',
      desc: t('executiveSummaryDesc') || 'Single-page summary of prediction snapshot and recommendations.',
      icon: 'Sparkles',
      purpose: t('executiveSummaryPurpose') || 'Compile 1-page high level summary briefing case probability, risks, and next steps.',
      expected: t('executiveSummaryExpected') || 'Decision snapshot box, key probability drivers, final recommendation briefs.',
      estTime: t('executiveSummaryEstTime') || '3-4 seconds'
    }
  ], [t]);

  const REPORT_METADATA = reportsMetadata;
  const getReportName = (id, fallback) => {
    return reportsMetadata.find(r => r.id === id)?.title || fallback;
  };
  const getReportDesc = (id, fallback) => {
    return reportsMetadata.find(r => r.id === id)?.desc || fallback;
  };
'''

replace_exact(
    '''  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);''',
    '''  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);''' + report_metadata_shadow,
    'Shadowing REPORT_METADATA'
)

# 6. Remove translatedReportText state variable
replace_exact(
    "  const [translatedReportText, setTranslatedReportText] = useState('');",
    "  // translatedReportText state variable removed",
    "Removing translatedReportText state"
)

# 7. Remove old useEffects for translation and displayReportText memo
old_translation_effects_2 = '''  // Re-run translation whenever original report or language changes
  useEffect(() => {
    if (outputLang === 'en' || !originalReportText) {
      setTranslatedReportText('');
      return;
    }
    const cached = getPredictorDisplayText(originalReportText);
    if (cached && cached !== originalReportText) {
      setTranslatedReportText(cached);
      return;
    }
    setIsPredictorTranslating(true);
    translatePredictorText(originalReportText).then((translated) => {
      if (isMountedRef.current) setTranslatedReportText(translated);
      setIsPredictorTranslating(false);
    }).catch(() => {
      if (isMountedRef.current) setTranslatedReportText('');
      setIsPredictorTranslating(false);
    });
  }, [originalReportText, outputLang, getPredictorDisplayText, translatePredictorText, setIsPredictorTranslating]);

  // Reset output language when prediction changes
  useEffect(() => {
    if (displayPrediction) {
      setOutputLang('en');
      setTranslatedReportText('');
    }
  }, [displayPrediction]); // eslint-disable-line

  const displayReportText = useMemo(() => {
    if (outputLang === 'hi' && translatedReportText) return translatedReportText;
    return editedReportText || originalReportText;
  }, [outputLang, translatedReportText, editedReportText, originalReportText]);'''

new_translation_effects_2 = '''  const displayReportText = useMemo(() => {
    return editedReportText || originalReportText;
  }, [editedReportText, originalReportText]);'''

replace_exact(
    old_translation_effects_2,
    new_translation_effects_2,
    'Replacing displayReportText & removing old translation effects'
)

# 8. Update compileDetailedLegalReport templates to check isHindi
replace_exact(
    '    const precedentsList = (data.precedentIntelligence?.supremeCourtCases || []).concat(data.precedentIntelligence?.highCourtCases || []);',
    '    const precedentsList = (data.precedentIntelligence?.supremeCourtCases || []).concat(data.precedentIntelligence?.highCourtCases || []);\n    const isHindi = toolkitLanguage === \'Hindi\';',
    'Adding isHindi to compileDetailedLegalReport'
)

# 9. Translate predictionReport template
prediction_report_old = '''      case 'predictionReport':
        return `# LITIGATION FORECAST REPORT & OUTCOME PROJECTION

## 1. EXECUTIVE OUTCOME SUMMARY
- **Primary Case Category:** ${data.caseType || 'Corporate'}
- **Presiding Forum:** ${courtName}
- **Statutory Foundations:** ${ipcSections}
- **Opposing Counsel / Defendant:** ${opponentDetails}
- **Evidentiary Coverage Rating:** ${evidenceStrength}%

Based on forensic outcome prediction calculations, AISA projects a **${successRate}% Success Probability** for the Plaintiff in the first instance trial.

---

## 2. KEY PROJECTION METRICS
| FORECAST PARAMETER | VALUE | FORENSIC CONFIDENCE RATING |
| :--- | :--- | :--- |
| **Win Probability** | ${successRate}% | High (${confidenceScore}% model accuracy) |
| **Litigation Risk level** | ${litigationRisk} | Medium Variance (±4.2%) |
| **Estimated Duration** | ${estimatedDuration} | Based on regional bench disposal speed |
| **Expected Hearings** | ${expectedHearings} Sessions | Standard pleading and argument cycles |

---

## 3. APPLICABLE STATUTORY LAWS
The litigation is grounded upon the following governing acts:
- **${ipcSections}**: Outlines standard remedies, definitions, and burden of proof parameters.
- **Indian Evidence Act / Bharatiya Sakshya Adhiniyam**: Controls admissibility of verbal testimonies and secondary certified document prints.

---

## 4. PRECEDENTS & SUPPORTING JURISPRUDENCE
The following binding precedents support the pleading claims:
${precedentsText}

---

## 5. AI OUTCOME RECOMMENDATION
Maintain strict adherence to the facts chronology. Seek early scheduling of issues and prepare to lodge appellate caveats to protect lower-court decrees.`;'''

prediction_report_new = '''      case 'predictionReport':
        return isHindi ? `# मुकदमेबाजी पूर्वानुमान रिपोर्ट और परिणाम प्रक्षेपण

## 1. कार्यकारी परिणाम सारांश
- **प्राथमिक मामला श्रेणी:** ${data.caseType || 'कॉर्पोरेट'}
- **अदालत / अधिकार क्षेत्र:** ${courtName}
- **वैधानिक आधार:** ${ipcSections}
- **विपक्षी वकील / प्रतिवादी:** ${opponentDetails}
- **साक्ष्य कवरेज रेटिंग:** ${evidenceStrength}%

फोरेंसिक परिणाम भविष्यवाणी गणना के आधार पर, AISA वादी के लिए पहले चरण के मुकदमे में **${successRate}% सफलता की संभावना** का अनुमान लगाता है।

---

## 2. मुख्य पूर्वानुमान पैरामीटर
| पूर्वानुमान पैरामीटर | मूल्य | फोरेंसिक आत्मविश्वास रेटिंग |
| :--- | :--- | :--- |
| **जीतने की संभावना** | ${successRate}% | उच्च (${confidenceScore}% मॉडल सटीकता) |
| **मुकदमेबाजी जोखिम स्तर** | ${t(litigationRisk) || litigationRisk} | मध्यम भिन्नता (±4.2%) |
| **अनुमानित अवधि** | ${estimatedDuration} | क्षेत्रीय बेंच निपटान गति के आधार पर |
| **अपेक्षित सुनवाई** | ${expectedHearings} सत्र | मानक दलील और बहस चक्र |

---

## 3. लागू वैधानिक कानून
मुकदमा निम्नलिखित शासी अधिनियमों पर आधारित है:
- **${ipcSections}**: मानक उपचार, परिभाषाओं और सबूत के बोझ के मापदंडों को रेखांकित करता है।
- **भारतीय साक्ष्य अधिनियम / भारतीय साक्ष्य अधिनियम**: मौखिक गवाही और प्रमाणित द्वितीयक दस्तावेज़ प्रिंट की स्वीकार्यता को नियंत्रित करता है।

---

## 4. नजीरें और सहायक निर्णय
दलील के दावों का समर्थन करने वाली निम्नलिखित बाध्यकारी नजीरें उपलब्ध हैं:
${precedentsText}

---

## 5. एआई परिणाम सिफारिश
तथ्यों की समयरेखा का सख्ती से पालन करें। मुद्दों के शीघ्र निर्धारण का प्रयास करें और निचले अदालत के फैसलों की रक्षा के लिए अपीलीय कैविएट दायर करने की तैयारी करें।` : `# LITIGATION FORECAST REPORT & OUTCOME PROJECTION

## 1. EXECUTIVE OUTCOME SUMMARY
- **Primary Case Category:** ${data.caseType || 'Corporate'}
- **Presiding Forum:** ${courtName}
- **Statutory Foundations:** ${ipcSections}
- **Opposing Counsel / Defendant:** ${opponentDetails}
- **Evidentiary Coverage Rating:** ${evidenceStrength}%

Based on forensic outcome prediction calculations, AISA projects a **${successRate}% Success Probability** for the Plaintiff in the first instance trial.

---

## 2. KEY PROJECTION METRICS
| FORECAST PARAMETER | VALUE | FORENSIC CONFIDENCE RATING |
| :--- | :--- | :--- |
| **Win Probability** | ${successRate}% | High (${confidenceScore}% model accuracy) |
| **Litigation Risk level** | ${litigationRisk} | Medium Variance (±4.2%) |
| **Estimated Duration** | ${estimatedDuration} | Based on regional bench disposal speed |
| **Expected Hearings** | ${expectedHearings} Sessions | Standard pleading and argument cycles |

---

## 3. APPLICABLE STATUTORY LAWS
The litigation is grounded upon the following governing acts:
- **${ipcSections}**: Outlines standard remedies, definitions, and burden of proof parameters.
- **Indian Evidence Act / Bharatiya Sakshya Adhiniyam**: Controls admissibility of verbal testimonies and secondary certified document prints.

---

## 4. PRECEDENTS & SUPPORTING JURISPRUDENCE
The following binding precedents support the pleading claims:
${precedentsText}

---

## 5. AI OUTCOME RECOMMENDATION
Maintain strict adherence to the facts chronology. Seek early scheduling of issues and prepare to lodge appellate caveats to protect lower-court decrees.`;'''

replace_exact(
    prediction_report_old,
    prediction_report_new,
    'Translating predictionReport template'
)

# 10. Translate clientReport template
client_report_old = '''      case 'clientReport':
        return `# CLIENT TRIAL READINESS ASSESSMENT & DEFICIENCY BRIEF

## 1. READINESS STATUS SNAPSHOT
- **Trial Readiness Score:** ${courtReadiness}% (Requires immediate uploads)
- **Target Evidentiary Strength:** ${evidenceStrength}%
- **Estimated Hearings:** ${expectedHearings} Sessions

---

## 2. EVIDENTIARY DEFICIENCIES & MISSING DOCUMENTS
The following mandatory exhibits must be uploaded to correct active case gaps:
| DOCUMENT NAME | PRIORITY | REASON FOR REQUIREMENT | SUCCESS IMPACT |
| :--- | :--- | :--- | :--- |
${missingDocsRows}

---

## 3. WITNESS & TESTIMONY STATUS
- **Plaintiff Witnesses:** Verified and prepped for trial examination.
- **Independent Witness Credibility:** Prepped to substantiate contract signing timeline.
- **Opponent Deposition Vulnerability:** Chronological mismatch in defendant transaction log records.

---

## 4. REQUIRED ADVOCATE TIMELINE ACTIONS
1. **Filing of Replication:** Draft specific rebuttals regarding Limitation Act defense.
2. **Execute Section 65B Affidavits:** Must be signed by the digital communications auditor before the next hearing.
3. **Verify Bank Ledgers:** Obtain certified copies under Banker's Book Evidence regulations.`;'''

client_report_new = '''      case 'clientReport':
        return isHindi ? `# ग्राहक परीक्षण तत्परता मूल्यांकन और कमी विवरण

## 1. तत्परता स्थिति स्नैपशॉट
- **परीक्षण तत्परता स्कोर:** ${courtReadiness}% (तत्काल अपलोड की आवश्यकता है)
- **लक्षित साक्ष्य शक्ति:** ${evidenceStrength}%
- **अपेक्षित सुनवाई:** ${expectedHearings} सत्र

---

## 2. साक्ष्य संबंधी कमियां और गायब दस्तावेज
सक्रिय केस अंतराल को ठीक करने के लिए निम्नलिखित अनिवार्य दस्तावेज अपलोड किए जाने चाहिए:
| दस्तावेज़ का नाम | प्राथमिकता | आवश्यकता का कारण | सफलता प्रभाव |
| :--- | :--- | :--- | :--- |
${missingDocsRows}

---

## 3. गवाह और गवाही की स्थिति
- **वादी गवाह:** परीक्षण परीक्षा के लिए सत्यापित और तैयार।
- **स्वतंत्र गवाह विश्वसनीयता:** अनुबंध पर हस्ताक्षर करने की समयरेखा को प्रमाणित करने के लिए तैयार।
- **विपक्षी बयान भेद्यता:** प्रतिवादी लेनदेन लॉग रिकॉर्ड में कालानुक्रमिक बेमेल।

---

## 4. आवश्यक वकील समयरेखा कार्रवाई
1. **जवाब दाखिल करना:** सीमा अधिनियम बचाव के संबंध में विशिष्ट खंडन का मसौदा तैयार करें।
2. **धारा 65बी शपथ पत्र निष्पादित करें:** अगली सुनवाई से पहले डिजिटल संचार लेखा परीक्षक द्वारा हस्ताक्षरित होना चाहिए।
3. **बैंक बहीखाता सत्यापित करें:** बैंकर बुक साक्ष्य नियमों के तहत प्रमाणित प्रतियां प्राप्त करें।` : `# CLIENT TRIAL READINESS ASSESSMENT & DEFICIENCY BRIEF

## 1. READINESS STATUS SNAPSHOT
- **Trial Readiness Score:** ${courtReadiness}% (Requires immediate uploads)
- **Target Evidentiary Strength:** ${evidenceStrength}%
- **Estimated Hearings:** ${expectedHearings} Sessions

---

## 2. EVIDENTIARY DEFICIENCIES & MISSING DOCUMENTS
The following mandatory exhibits must be uploaded to correct active case gaps:
| DOCUMENT NAME | PRIORITY | REASON FOR REQUIREMENT | SUCCESS IMPACT |
| :--- | :--- | :--- | :--- |
${missingDocsRows}

---

## 3. WITNESS & TESTIMONY STATUS
- **Plaintiff Witnesses:** Verified and prepped for trial examination.
- **Independent Witness Credibility:** Prepped to substantiate contract signing timeline.
- **Opponent Deposition Vulnerability:** Chronological mismatch in defendant transaction log records.

---

## 4. REQUIRED ADVOCATE TIMELINE ACTIONS
1. **Filing of Replication:** Draft specific rebuttals regarding Limitation Act defense.
2. **Execute Section 65B Affidavits:** Must be signed by the digital communications auditor before the next hearing.
3. **Verify Bank Ledgers:** Obtain certified copies under Banker's Book Evidence regulations.`;'''

replace_exact(
    client_report_old,
    client_report_new,
    'Translating clientReport template'
)

# 11. Translate judicialForecastReport template
judicial_forecast_old = '''      case 'judicialForecastReport':
        return `# JUDGE BRIEFING NOTE & TRIAL ADVISORY

## 1. PRESIDING BENCH PROFILE
- **Judge / Presiding Bench:** ${data.judgeIntelligence?.profile || 'Justice Subramanian Bench'}
- **Acceptance Probability:** ${data.judgeIntelligence?.acceptanceRate || 71}%
- **Bench Disposal Speed:** ${data.judgeIntelligence?.averageDisposalTime || '12-16 Months'}

---

## 2. BRIEF SUMMARY OF MATERIAL FACTS
${facts.substring(0, 300)}...

---

## 3. KEY JUDICIAL INQUIRIES & PRE-EMPTED SCRUTINY
Prepare immediate, concise oral responses for the following pre-empted judicial inquiries:
1. **On limitation delay:** "The cause of action accrued on the date of final breach, not contract execution. Therefore, the suit remains within the 3-year limitation period."
2. **On photocopy admissibility:** "Certified public registry ledger prints are submitted as secondary proof, meeting Evidence Act standards."

---

## 4. PLEADING ARGUMENTS & OPPONENT REBUTTALS
- **Plaintiff Claim:** Statutory breach under ${ipcSections} mandates restitution.
- **Opponent Rebuttal:** Claims delays were due to force majeure events.
- **AI Recommended Defense:** Force majeure clauses are not triggered in the absence of government notifications.

---

## 5. FINAL PRAYER (RELIEFS REQUESTED)
Lodge prayer requesting full restitution of claims, standard interest charges, and total recovery of litigation expenses.`;'''

judicial_forecast_new = '''      case 'judicialForecastReport':
        return isHindi ? `# न्यायाधीश ब्रीफिंग नोट और सुनवाई सलाहकार

## 1. पीठासीन बेंच प्रोफ़ाइल
- **न्यायाधीश / पीठासीन बेंच:** ${data.judgeIntelligence?.profile || 'न्यायमुर्ति सुब्रमण्यम बेंच'}
- **स्वीकृति संभावना:** ${data.judgeIntelligence?.acceptanceRate || 71}%
- **बेंच निपटान गति:** ${data.judgeIntelligence?.averageDisposalTime || '12-16 महीने'}

---

## 2. भौतिक तथ्यों का संक्षिप्त सारांश
${facts.substring(0, 300)}...

---

## 3. मुख्य न्यायिक पूछताछ और पूर्व-खाली जांच
निम्नलिखित पूर्व-खाली न्यायिक पूछताछ के लिए तत्काल, संक्षिप्त मौखिक प्रतिक्रियाएं तैयार करें:
1. **समय सीमा की देरी पर:** "कार्रवाई का कारण अंतिम उल्लंघन की तारीख को उत्पन्न हुआ था, न कि अनुबंध निष्पादन पर। इसलिए, मुकदमा 3 साल की समय सीमा के भीतर रहता है।"
2. **फोटोकॉपी स्वीकार्यता पर:** "प्रमाणित सार्वजनिक रजिस्ट्री खाता प्रिंट द्वितीयक साक्ष्य के रूप में प्रस्तुत किए जाते हैं, जो साक्ष्य अधिनियम के मानकों को पूरा करते हैं।"

---

## 4. याचिका तर्क और विपक्षी खंडन
- **वादी का दावा:** ${ipcSections} के तहत वैधानिक उल्लंघन बहाली को अनिवार्य करता है।
- **विपक्षी खंडन:** दावा है कि देरी अपरिहार्य परिस्थितियों (force majeure) के कारण हुई थी।
- **एआई अनुशंसित बचाव:** सरकारी अधिसूचनाओं की अनुपस्थिति में अपरिहार्य परिस्थिति धाराओं को ट्रिगर नहीं किया जाता है।

---

## 5. अंतिम प्रार्थना (अनुरोधित राहत)
दावों की पूर्ण बहाली, वसीयतनामा और मुकदमेबाजी के खर्चों की कुल वसूली का अनुरोध करने वाली प्रार्थना दायर करें।` : `# JUDGE BRIEFING NOTE & TRIAL ADVISORY

## 1. PRESIDING BENCH PROFILE
- **Judge / Presiding Bench:** ${data.judgeIntelligence?.profile || 'Justice Subramanian Bench'}
- **Acceptance Probability:** ${data.judgeIntelligence?.acceptanceRate || 71}%
- **Bench Disposal Speed:** ${data.judgeIntelligence?.averageDisposalTime || '12-16 Months'}

---

## 2. BRIEF SUMMARY OF MATERIAL FACTS
${facts.substring(0, 300)}...

---

## 3. KEY JUDICIAL INQUIRIES & PRE-EMPTED SCRUTINY
Prepare immediate, concise oral responses for the following pre-empted judicial inquiries:
1. **On limitation delay:** "The cause of action accrued on the date of final breach, not contract execution. Therefore, the suit remains within the 3-year limitation period."
2. **On photocopy admissibility:** "Certified public registry ledger prints are submitted as secondary proof, meeting Evidence Act standards."

---

## 4. PLEADING ARGUMENTS & OPPONENT REBUTTALS
- **Plaintiff Claim:** Statutory breach under ${ipcSections} mandates restitution.
- **Opponent Rebuttal:** Claims delays were due to force majeure events.
- **AI Recommended Defense:** Force majeure clauses are not triggered in the absence of government notifications.

---

## 5. FINAL PRAYER (RELIEFS REQUESTED)
Lodge prayer requesting full restitution of claims, standard interest charges, and total recovery of litigation expenses.`;'''

replace_exact(
    judicial_forecast_old,
    judicial_forecast_new,
    'Translating judicialForecastReport template'
)

# 12. Translate courtPrepReport template
court_prep_old = '''      case 'courtPrepReport':
        return `# COURTROOM PREPARATION & COMPLIANCE CHECKLIST

## 1. COMPLIANCE & FILING MATRIX
| CHECKLIST ITEM | STATUTORY REFERENCE | ACTION STATUS |
| :--- | :--- | :--- |
| **Vakalatnama/Memo of Appearance** | CPC Order IV Rule 1 | ✓ Signed & Filed |
| **Exhibit Compilation & Indexing** | CPC Order VII Rule 14 | In Progress |
| **Section 65B Electronic Certificate** | Indian Evidence Act | Pending Auditor Signature |
| **Appellate Caveat Lodging** | CPC Section 148A | Recommended Post-Verdict |

---

## 2. TRIAL DAY ACTION TIMELINE
- **9:30 AM**: Coordinate final witness briefing. Verify availability of original documents folder.
- **10:30 AM**: Establish petitioner jurisdiction and outline statutory breach of contract claims.
- **12:00 PM**: Restrict oral hearsay during opponent cross-examination.
- **2:30 PM**: Direct court attention to Supreme Court binding precedents.

---

## 3. ADMISSION AND DISCOVERY STAGE ACTIONS
Seek formal admission of undisputed documents from opponent under CPC Order XI. Reduces prolonged trial sessions.`;'''

court_prep_new = '''      case 'courtPrepReport':
        return isHindi ? `# कोर्टरूम तैयारी और अनुपालन चेकलिस्ट

## 1. अनुपालन और फाइलिंग मैट्रिक्स
| चेकलिस्ट आइटम | वैधानिक संदर्भ | कार्रवाई की स्थिति |
| :--- | :--- | :--- |
| **वकालतनामा/उपस्थिति का ज्ञापन** | सीपीसी आदेश IV नियम 1 | ✓ हस्ताक्शरित और दायर |
| **प्रदर्श संकलन और अनुक्रमण** | सीपीसी आदेश VII नियम 14 | प्रगति पर है |
| **धारा 65बी इलेक्ट्रॉनिक प्रमाणपत्र** | भारतीय साक्ष्य अधिनियम | लेखा परीक्षक के हस्ताक्षर लंबित |
| **Appellate Caveat Lodging** | सीपीसी धारा 148ए | फैसले के बाद अनुशंसित |

---

## 2. सुनवाई के दिन की कार्रवाई समयरेखा
- **9:30 AM**: अंतिम गवाह ब्रीफिंग का समन्वय करें। मूल दस्तावेज फ़ोल्डर की उपलब्धता सत्यापित करें।
- **10:30 AM**: याचिकाकर्ता का अधिकार क्षेत्र स्थापित करें और अनुबंध उल्लंघन के दावों की रूपरेखा तैयार करें।
- **12:00 PM**: विपक्षी क्रॉस एग्जामिनेशन के दौरान मौखिक अफवाहों को सीमित करें।
- **2:30 PM**: कोर्ट का ध्यान सुप्रीम कोर्ट के बाध्यकारी फैसलों की ओर आकर्षित करें।

---

## 3. प्रवेश और प्रकटीकरण चरण की कार्रवाइयां
सीपीसी आदेश XI के तहत प्रतिद्वंद्वी से प्रवेश की मांग करें। लंबी सुनवाई सत्रों को कम करता है।` : `# COURTROOM PREPARATION & COMPLIANCE CHECKLIST

## 1. COMPLIANCE & FILING MATRIX
| CHECKLIST ITEM | STATUTORY REFERENCE | ACTION STATUS |
| :--- | :--- | :--- |
| **Vakalatnama/Memo of Appearance** | CPC Order IV Rule 1 | ✓ Signed & Filed |
| **Exhibit Compilation & Indexing** | CPC Order VII Rule 14 | In Progress |
| **Section 65B Electronic Certificate** | Indian Evidence Act | Pending Auditor Signature |
| **Appellate Caveat Lodging** | CPC Section 148A | Recommended Post-Verdict |

---

## 2. TRIAL DAY ACTION TIMELINE
- **9:30 AM**: Coordinate final witness briefing. Verify availability of original documents folder.
- **10:30 AM**: Establish petitioner jurisdiction and outline statutory breach of contract claims.
- **12:00 PM**: Restrict oral hearsay during opponent cross-examination.
- **2:30 PM**: Direct court attention to Supreme Court binding precedents.

---

## 3. ADMISSION AND DISCOVERY STAGE ACTIONS
Seek formal admission of undisputed documents from opponent under CPC Order XI. Reduces prolonged trial sessions.`;'''

replace_exact(
    court_prep_old,
    court_prep_new,
    'Translating courtPrepReport template'
)

# 13. Translate evidenceReport template
evidence_report_old = '''      case 'evidenceReport':
        return `# FORENSIC EVIDENCE AUDIT & ADMISSIBILITY BRIEF

## 1. EVIDENCE COVERAGE SUMMARY
- **Admissibility Score:** ${evidenceStrength}%
- **Authenticity Rating:** ${data.evidenceIntelligence?.authenticityScore || 85}%
- **OCR Pipeline Match:** ${data.evidenceIntelligence?.ocrConfidence || 90}%

---

## 2. EVIDENCE INDEX TABLE
| EXHIBIT NAME | QUALITY CATEGORY | ADMISSIBILITY EVALUATION | PRIORITY |
| :--- | :--- | :--- | :--- |
| Primary Verified Contract | Strong Exhibit | Admissible (Original signatures intact) | Critical |
| Correspondence Emails | Weak Exhibit | Admissible only with Section 65B certificate | High |
| Unsigned Boundary Drafts | Contradictory | Inadmissible (Lacks authentication proofs) | Medium |

---

## 3. STATUTORY COMPLIANCE AUDIT
Electronic evidence prints (SMS logs, Email printouts, WhatsApp threads) will be summarily dismissed by the bench unless accompanied by a certified affidavit under **Section 65B**.

---

## 4. REMEDIAL DIRECTIVES TO LAWYER
- Obtain stamp certificate validations for all transaction notices.
- Compile local surveyor boundary audits to replace secondary sketches.`;'''

evidence_report_new = '''      case 'evidenceReport':
        return isHindi ? `# फोरेंसिक साक्ष्य लेखापरीक्षा और स्वीकार्यता विवरण

## 1. साक्ष्य कवरेज सारांश
- **साक्ष्य स्वीकार्यता स्कोर:** ${evidenceStrength}%
- **प्रामाणिकता रेटिंग:** ${data.evidenceIntelligence?.authenticityScore || 85}%
- **ओसीआर पाइपलाइन मिलान:** ${data.evidenceIntelligence?.ocrConfidence || 90}%

---

## 2. साक्ष्य अनुक्रमणिका तालिका
| प्रदर्श का नाम | गुणवत्ता श्रेणी | स्वीकार्यता मूल्यांकन | प्राथमिकता |
| :--- | :--- | :--- | :--- |
| प्राथमिक सत्यापित अनुबंध | मजबूत प्रदर्श | स्वीकार्य (मूल हस्ताक्षर अक्षुण्ण) | गंभीर |
| पत्राचार ईमेल | कमजोर प्रदर्श | केवल धारा 65बी प्रमाण पत्र के साथ स्वीकार्य | उच्च |
| अहस्ताक्षरित सीमा मसौदा | विरोधाभासी | अस्वीकार्य (प्रमाणीकरण प्रमाण का अभाव) | मध्यम |

---

## 3. वैधानिक अनुपालन लेखापरीक्षा
इलेक्ट्रॉनिक साक्ष्य प्रिंट (एसएमएस लॉग, ईमेल प्रिंटआउट, व्हाट्सएप थ्रेड) बेंच द्वारा तब तक खारिज कर दिए जाएंगे जब तक कि उनके साथ **धारा 65बी** के तहत प्रमाणित हलफनामा न हो।

---

## 4. वकील के लिए उपचारात्मक निर्देश
- सभी लेनदेन नोटिसों के लिए स्टांप प्रमाणपत्र सत्यापन प्राप्त करें।
- द्वितीयक रेखाचित्रों को बदलने के लिए स्थानीय सर्वेक्षक सीमा लेखापरीक्षा संकलित करें।` : `# FORENSIC EVIDENCE AUDIT & ADMISSIBILITY BRIEF

## 1. EVIDENCE COVERAGE SUMMARY
- **Admissibility Score:** ${evidenceStrength}%
- **Authenticity Rating:** ${data.evidenceIntelligence?.authenticityScore || 85}%
- **OCR Pipeline Match:** ${data.evidenceIntelligence?.ocrConfidence || 90}%

---

## 2. EVIDENCE INDEX TABLE
| EXHIBIT NAME | QUALITY CATEGORY | ADMISSIBILITY EVALUATION | PRIORITY |
| :--- | :--- | :--- | :--- |
| Primary Verified Contract | Strong Exhibit | Admissible (Original signatures intact) | Critical |
| Correspondence Emails | Weak Exhibit | Admissible only with Section 65B certificate | High |
| Unsigned Boundary Drafts | Contradictory | Inadmissible (Lacks authentication proofs) | Medium |

---

## 3. STATUTORY COMPLIANCE AUDIT
Electronic evidence prints (SMS logs, Email printouts, WhatsApp threads) will be summarily dismissed by the bench unless accompanied by a certified affidavit under **Section 65B**.

---

## 4. REMEDIAL DIRECTIVES TO LAWYER
- Obtain stamp certificate validations for all transaction notices.
- Compile local surveyor boundary audits to replace secondary sketches.`;'''

replace_exact(
    evidence_report_old,
    evidence_report_new,
    'Translating evidenceReport template'
)

# 14. Translate settlementReport template
settlement_report_old = '''      case 'settlementReport':
        return `# MEDIATION & SETTLEMENT ADVISORY BRIEF

## 1. SETTLEMENT OUTLOOK
- **Mediation Advisory Viability:** ${data.stats?.settlementProbability || 78}%
- **Estimated Trial Cost:** ₹${estimatedLegalCost.toLocaleString()}
- **AI Projected Savings (Pre-Trial Settlement):** ₹${data.settlementIntelligence?.expectedSavings ? data.settlementIntelligence.expectedSavings.toLocaleString() : (estimatedLegalCost * 0.4).toLocaleString()}

---

## 2. NEGOTIATION PARAMETERS
- **Recommended Settlement Amount:** ₹${data.settlementIntelligence?.recommendedAmount ? data.settlementIntelligence.recommendedAmount.toLocaleString() : (estimatedLegalCost * 2.5).toLocaleString()}
- **Optimum Compromise Window:** ${data.settlementEngine?.negotiationWindow || '₹120,000 - ₹250,000'}
- **Best Stage to Negotiate:** Prior to framing of trial issues.

---

## 3. TRIAL VS SETTLEMENT ANALYSIS
| CRITERIA | LITIGATION VIA TRIAL | MEDIATION SETTLEMENT |
| :--- | :--- | :--- |
| **Duration** | ${estimatedDuration} | 15 - 30 Days (Immediate) |
| **Legal Fees** | ₹${estimatedLegalCost.toLocaleString()} | ₹${(estimatedLegalCost * 0.25).toLocaleString()} |
| **Outcome Certainty** | ${successRate}% Win Probability | 100% Guaranteed compromise |

---

## 4. TACTICAL NEGOTIATION RECOMMENDATIONS
- Present concrete bank statements early to signal evidentiary strength.
- Leverage the court backlog statistic during informal settlement talks.`;'''

settlement_report_new = '''      case 'settlementReport':
        return isHindi ? `# मध्यस्थता और समझौता सलाहकार विवरण

## 1. समझौता दृष्टिकोण
- **मध्यस्थता सलाहकार व्यवहार्यता:** ${data.stats?.settlementProbability || 78}%
- **अनुमानित सुनवाई लागत:** ₹${estimatedLegalCost.toLocaleString()}
- **एआई अनुमानित बचत (पूर्व-सुनवाई समझौता):** ₹${data.settlementIntelligence?.expectedSavings ? data.settlementIntelligence.expectedSavings.toLocaleString() : (estimatedLegalCost * 0.4).toLocaleString()}

---

## 2. बातचीत के पैरामीटर
- **अनुशंसित समझौता राशि:** ₹${data.settlementIntelligence?.recommendedAmount ? data.settlementIntelligence.recommendedAmount.toLocaleString() : (estimatedLegalCost * 2.5).toLocaleString()}
- **इष्टतम समझौता सीमा:** ${data.settlementEngine?.negotiationWindow || '₹120,000 - ₹250,000'}
- **बातचीत करने का सबसे अच्छा चरण:** मुकदमे के मुद्दों को तैयार करने से पहले।

---

## 3. मुकदमा बनाम समझौता विश्लेषण
| मानदंड | मुकदमेबाजी (सुनवाई द्वारा) | मध्यस्थता समझौता |
| :--- | :--- | :--- |
| **अवधि** | ${estimatedDuration} | 15 - 30 दिन (तत्काल) |
| **कानूनी शुल्क** | ₹${estimatedLegalCost.toLocaleString()} | ₹${(estimatedLegalCost * 0.25).toLocaleString()} |
| **परिणाम निश्चितता** | ${successRate}% जीत की संभावना | 100% गारंटीकृत समझौता |

---

## 4. सामरिक बातचीत सिफारिशें
- साक्ष्य शक्ति का संकेत देने के लिए जल्दी ही ठोस बैंक विवरण प्रस्तुत करें।
- अनौपचारिक समझौता वार्ता के दौरान अदालत के बैकलॉग आंकड़ों का लाभ उठाएं।` : `# MEDIATION & SETTLEMENT ADVISORY BRIEF

## 1. SETTLEMENT OUTLOOK
- **Mediation Advisory Viability:** ${data.stats?.settlementProbability || 78}%
- **Estimated Trial Cost:** ₹${estimatedLegalCost.toLocaleString()}
- **AI Projected Savings (Pre-Trial Settlement):** ₹${data.settlementIntelligence?.expectedSavings ? data.settlementIntelligence.expectedSavings.toLocaleString() : (estimatedLegalCost * 0.4).toLocaleString()}

---

## 2. NEGOTIATION PARAMETERS
- **Recommended Settlement Amount:** ₹${data.settlementIntelligence?.recommendedAmount ? data.settlementIntelligence.recommendedAmount.toLocaleString() : (estimatedLegalCost * 2.5).toLocaleString()}
- **Optimum Compromise Window:** ${data.settlementEngine?.negotiationWindow || '₹120,000 - ₹250,000'}
- **Best Stage to Negotiate:** Prior to framing of trial issues.

---

## 3. TRIAL VS SETTLEMENT ANALYSIS
| CRITERIA | LITIGATION VIA TRIAL | MEDIATION SETTLEMENT |
| :--- | :--- | :--- |
| **Duration** | ${estimatedDuration} | 15 - 30 Days (Immediate) |
| **Legal Fees** | ₹${estimatedLegalCost.toLocaleString()} | ₹${(estimatedLegalCost * 0.25).toLocaleString()} |
| **Outcome Certainty** | ${successRate}% Win Probability | 100% Guaranteed compromise |

---

## 4. TACTICAL NEGOTIATION RECOMMENDATIONS
- Present concrete bank statements early to signal evidentiary strength.
- Leverage the court backlog statistic during informal settlement talks.`;'''

replace_exact(
    settlement_report_old,
    settlement_report_new,
    'Translating settlementReport template'
)

# 15. Translate strategyReport template
strategy_report_old = '''      case 'strategyReport':
        return `# PROCEDURAL TIMELINE & LITIGATION STRATEGY

## 1. EXPECTED COURT STAGES & TIMELINES
| PROCEDURAL STAGES | DURATION | KEY STRATEGIC ACTIONS |
| :--- | :--- | :--- |
| **Admission Stage** | 30 - 60 Days | Seek interim injunction orders |
| **Evidentiary Stage** | 90 - 120 Days | Compile certified primary document copies |
| **Cross-Examination** | 60 - 90 Days | Confront opposing witness on contradictions |
| **Final Arguments** | 30 Days | Present Supreme Court binding precedents |

---

## 2. BENCH BACKLOG & DELAY ANALYSIS
- **Regional Court Adjournment Rate:** High.
- **Mitigation Action:** Pre-compile all written statement indices and request strict schedules under Commercial Court regulations.

---

## 3. ALTERNATIVE CASE STRATEGY
If title claims are contested beyond 12 months, initiate court-annexed mediation panels to secure property boundary adjustments.`;'''

strategy_report_new = '''      case 'strategyReport':
        return isHindi ? `# प्रक्रियात्मक समयरेखा और मुकदमेबाजी रणनीति

## 1. अपेक्षित अदालती चरण और समयरेखा
| प्रक्रियात्मक चरण | अवधि | मुख्य रणनीतिक कार्रवाई |
| :--- | :--- | :--- |
| **प्रवेश चरण** | 30 - 60 दिन | अंतरिम निषेधाज्ञा आदेशों की मांग करें |
| **साक्ष्य चरण** | 90 - 120 दिन | प्रमाणित प्राथमिक दस्तावेज़ प्रतियां संकलित करें |
| **क्रॉस एग्जामिनेशन** | 60 - 90 दिन | विरोधाभासों पर विपक्षी गवाह का सामना करें |
| **अंतिम बहस** | 30 दिन | सुप्रीम कोर्ट के बाध्यकारी फैसले पेश करें |

---

## 2. बेंच बैकलॉग और देरी का विश्लेषण
- **क्षेत्रीय न्यायालय स्थगन दर:** उच्च।
- **शमन कार्रवाई:** सभी लिखित बयानों को पहले से संकलित करें और वाणिज्यिक न्यायालय विनियमों के तहत सख्त कार्यक्रम का अनुरोध करें।

---

## 3. वैकल्पिक केस रणनीति
यदि शीर्षक के दावों पर 12 महीने से अधिक समय तक विवाद रहता है, तो संपत्ति सीमा समायोजन सुरक्षित करने के लिए कोर्ट से संबद्ध मध्यस्थता पैनलों की शुरुआत करें।` : `# PROCEDURAL TIMELINE & LITIGATION STRATEGY

## 1. EXPECTED COURT STAGES & TIMELINES
| PROCEDURAL STAGES | DURATION | KEY STRATEGIC ACTIONS |
| :--- | :--- | :--- |
| **Admission Stage** | 30 - 60 Days | Seek interim injunction orders |
| **Evidentiary Stage** | 90 - 120 Days | Compile certified primary document copies |
| **Cross-Examination** | 60 - 90 Days | Confront opposing witness on contradictions |
| **Final Arguments** | 30 Days | Present Supreme Court binding precedents |

---

## 2. BENCH BACKLOG & DELAY ANALYSIS
- **Regional Court Adjournment Rate:** High.
- **Mitigation Action:** Pre-compile all written statement indices and request strict schedules under Commercial Court regulations.

---

## 3. ALTERNATIVE CASE STRATEGY
If title claims are contested beyond 12 months, initiate court-annexed mediation panels to secure property boundary adjustments.`;'''

replace_exact(
    strategy_report_old,
    strategy_report_new,
    'Translating strategyReport template'
)

# 16. Translate executiveSummary template
executive_summary_old = '''      case 'executiveSummary':
        return `# EXECUTIVE LITIGATION FORECAST SUMMARY

## 1. DECISION SNAPSHOT
- **Plaintiff Success Rate:** **${successRate}%**
- **AI Confidence Score:** **${confidenceScore}%**
- **Procedural Litigation Risk:** **${litigationRisk}**
- **Strategic courtroom sequences:** ${data.courtStrategy?.strategyType || 'Balanced'} Pleading

---

## 2. KEY JUDICIAL PROBABILITY FACTORS
- **Positive Factors:** High statutory compliance, binding precedent availability.
- **Negative Factors:** Administrative delays, potential appeal escalation loop.

---

## 3. CORE STRATEGY SUMMARY
Establish court jurisdiction and immediately present original registered deeds. Negate defendant's verbal claims by invoking the parole evidence rules of the Evidence Act.`;'''

executive_summary_new = '''      case 'executiveSummary':
        return isHindi ? `# कार्यकारी मुकदमेबाजी पूर्वानुमान सारांश

## 1. निर्णय स्नैपशॉट
- **वादी सफलता दर:** **${successRate}%**
- **एआई आत्मविश्वास स्कोर:** **${confidenceScore}%**
- **प्रक्रियात्मक मुकदमेबाजी जोखिम:** **${t(litigationRisk) || litigationRisk}**
- **रणनीतिक कोर्ट रूम अनुक्रम:** ${data.courtStrategy?.strategyType || 'Balanced'} याचिका

---

## 2. मुख्य न्यायिक संभावना कारक
- **सकारात्मक कारक:** उच्च वैधानिक अनुपालन, बाध्यकारी मिसाल की उपलब्धता।
- **नकारात्मक कारक:** प्रशासनिक देरी, संभावित अपील वृद्धि पाश (loop)।

---

## 3. मुख्य रणनीति सारांश
अदालत का अधिकार क्षेत्र स्थापित करें और तुरंत मूल पंजीकृत विलेख प्रस्तुत करें। साक्ष्य अधिनियम के मौखिक साक्ष्य नियमों का हवाला देकर प्रतिवादी के मौखिक दावों को नकारें।` : `# EXECUTIVE LITIGATION FORECAST SUMMARY

## 1. DECISION SNAPSHOT
- **Plaintiff Success Rate:** **${successRate}%**
- **AI Confidence Score:** **${confidenceScore}%**
- **Procedural Litigation Risk:** **${litigationRisk}**
- **Strategic courtroom sequences:** ${data.courtStrategy?.strategyType || 'Balanced'} Pleading

---

## 2. KEY JUDICIAL PROBABILITY FACTORS
- **Positive Factors:** High statutory compliance, binding precedent availability.
- **Negative Factors:** Administrative delays, potential appeal escalation loop.

---

## 3. CORE STRATEGY SUMMARY
Establish court jurisdiction and immediately present original registered deeds. Negate defendant's verbal claims by invoking the parole evidence rules of the Evidence Act.`;'''

replace_exact(
    executive_summary_old,
    executive_summary_new,
    'Translating executiveSummary template'
)

# 17. Update event handlers to synchronize rawPrediction state
replace_exact(
    '''    if (activePrediction) {
      setActivePrediction(null);
    } else if (inputWorkflowMode !== null) {''',
    '''    if (activePrediction) {
      setActivePrediction(null);
      setRawPrediction(null);
    } else if (inputWorkflowMode !== null) {''',
    'Resetting rawPrediction on back'
)

replace_exact(
    '''  const handleResetAndConfigureNewCase = () => {
    setActivePrediction(null);
    setInputWorkflowMode(null);''',
    '''  const handleResetAndConfigureNewCase = () => {
    setActivePrediction(null);
    setRawPrediction(null);
    setInputWorkflowMode(null);''',
    'Resetting rawPrediction on configure new case'
)

replace_exact(
    '''      setActivePrediction(prediction);
      setEditedReportText(prediction.reports.predictionReport);
      setSelectedReportTab('predictionReport');''',
    '''      setRawPrediction(prediction);
      setActivePrediction(prediction);
      setEditedReportText(prediction.reports.predictionReport);
      setSelectedReportTab('predictionReport');''',
    'Setting rawPrediction on outcome forecast'
)

replace_exact(
    '''      setActivePrediction(updatedPrediction);
      await savePredictionToHistory(updatedPrediction);
      setIsEditingReport(false);
      toast.success("Changes saved successfully to Case Database!");''',
    '''      setRawPrediction(updatedPrediction);
      setActivePrediction(updatedPrediction);
      await savePredictionToHistory(updatedPrediction);
      setIsEditingReport(false);
      toast.success("Changes saved successfully to Case Database!");''',
    'Setting rawPrediction on save changes'
)

replace_exact(
    '''      setActivePrediction(updatedPrediction);
      await savePredictionToHistory(updatedPrediction);
      if (isLockedNow) {''',
    '''      setRawPrediction(updatedPrediction);
      setActivePrediction(updatedPrediction);
      await savePredictionToHistory(updatedPrediction);
      if (isLockedNow) {''',
    'Setting rawPrediction on toggle lock'
)

replace_exact(
    '''      setActivePrediction(updatedPrediction);
      await savePredictionToHistory(updatedPrediction);
      setEditedReportText(freshText);''',
    '''      setRawPrediction(updatedPrediction);
      setActivePrediction(updatedPrediction);
      await savePredictionToHistory(updatedPrediction);
      setEditedReportText(freshText);''',
    'Setting rawPrediction on regenerate report'
)

replace_exact(
    '''                                  setActivePrediction(updated);
                                  await savePredictionToHistory(updated);
                                  setEditedReportText(textContent);''',
    '''                                  setRawPrediction(updated);
                                  setActivePrediction(updated);
                                  await savePredictionToHistory(updated);
                                  setEditedReportText(textContent);''',
    'Setting rawPrediction on lazy loading generate brief'
)

replace_exact(
    '''                          setActivePrediction(item);
                          setEditedReportText(item.reports?.[selectedReportTab] || item.report || '');''',
    '''                          setRawPrediction(item);
                          setActivePrediction(item);
                          setEditedReportText(item.reports?.[selectedReportTab] || item.report || '');''',
    'Setting rawPrediction on loading history item'
)

# 18. Remove duplicate LanguageToggle UI in report viewer toolbar
replace_exact(
    '''                            {/* Language Switch */}
                            {activePrediction?.generatedReports?.[selectedReportTab] && !isEditingReport && (
                              <LanguageToggle
                                lang={outputLang}
                                onChange={setOutputLang}
                                isTranslating={isPredictorTranslating}
                              />
                            )}''',
    '''                            {/* Language Switch removed for single source of truth */}''',
    'Removing duplicate LanguageToggle UI'
)

# 19. Inject language directives to systemPrompt
system_prompt_old = '''    try {
      const systemPrompt = `You are the AISA AI Judicial Intelligence & Case Forecasting System.
Analyze the provided legal case facts, evidence, witnesses, statutes, and jurisdiction.
Your analysis must be court-ready, forensic-grade, and highly detailed.'''

system_prompt_new = '''    try {
      const targetLanguageDirective = toolkitLanguage === 'Hindi' \
        ? '\\nCRITICAL REQUIREMENT: You MUST generate all user-facing narrative text, explanation fields, reasoning, strategy points, and reports directly in natural legal Hindi (Devanagari script) using formal Indian legal terms. DO NOT return English text for these fields. All JSON keys must remain exactly in English as specified in the schema.' \
        : '\\nCRITICAL REQUIREMENT: You MUST generate all text and reports in formal legal English.';

      const systemPrompt = `You are the AISA AI Judicial Intelligence & Case Forecasting System.
Analyze the provided legal case facts, evidence, witnesses, statutes, and jurisdiction.
Your analysis must be court-ready, forensic-grade, and highly detailed.
${targetLanguageDirective}'''

replace_exact(
    system_prompt_old,
    system_prompt_new,
    'Injecting language directives to systemPrompt'
)

# 20. Replace Hero Header Text
replace_exact(
    '''              <h1 className={`text-sm sm:text-base font-black uppercase tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>Case Predictor™</h1>''',
    '''              <h1 className={`text-sm sm:text-base font-black uppercase tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>{t('casePredictorTitle') || "Case Predictor"}</h1>''',
    'Translating Hero Header Title'
)

replace_exact(
    '''            <p className={`text-[9px] font-semibold mt-0.5 hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              AI-powered litigation outcome prediction and legal risk assessment.
            </p>''',
    '''            <p className={`text-[9px] font-semibold mt-0.5 hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('casePredictorSubtitle') || "AI-powered litigation outcome prediction and legal risk assessment."}
            </p>''',
    'Translating Hero Header Subtitle'
)

replace_exact(
    '''              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Analysis Ready
              </span>
              <span>•</span>
              <span>Court Database Connected</span>''',
    '''              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('aiAnalysisReady') || "AI Analysis Ready"}
              </span>
              <span>•</span>
              <span>{t('courtDatabaseConnected') || "Court Database Connected"}</span>''',
    'Translating Hero Header status indicators'
)

replace_exact(
    '''              <span className="truncate max-w-[120px] sm:max-w-none">Sync with {currentCase.name}</span>''',
    '''              <span className="truncate max-w-[120px] sm:max-w-none">{t('syncWith') || "Sync with"} {currentCase.name}</span>''',
    'Translating Sync Case Button'
)

replace_exact(
    '''            <span>History ({historyData.length})</span>''',
    '''            <span>{t('history') || "History"} ({historyData.length})</span>''',
    'Translating History Button'
)

# 21. Wizard Steps Translation
replace_exact(
    '''                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      !activePrediction && !isGenerating
                        ? (isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-650 font-extrabold')
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      Choose Source
                    </span>''',
    '''                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      !activePrediction && !isGenerating
                        ? (isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-650 font-extrabold')
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>{t('chooseSource') || "Choose Source"}</span>''',
    'Translating Wizard Choose Source Step'
)

replace_exact(
    '''                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isGenerating
                        ? (isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-650 font-extrabold')
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      AI Analysis
                    </span>''',
    '''                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isGenerating
                        ? (isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-650 font-extrabold')
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>{t('aiAnalysis') || "AI Analysis"}</span>''',
    'Translating Wizard AI Analysis Step'
)

replace_exact(
    '''                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      activePrediction && !isGenerating
                        ? (isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-650 font-extrabold')
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      Forecast Dashboard
                    </span>''',
    '''                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      activePrediction && !isGenerating
                        ? (isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-650 font-extrabold')
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>{t('forecastDashboard') || "Forecast Dashboard"}</span>''',
    'Translating Wizard Forecast Dashboard Step'
)

# 22. Input modes Choose Source headers and Cards
replace_exact(
    '''                  <div className="text-center max-w-xl mx-auto mb-2 sm:mb-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-202">Select Forecast Input Source</h2>
                    <p className="text-[10px] text-slate-455 mt-1 font-semibold">Verify the source of legal directives to configure the litigation predictive engine.</p>
                  </div>'''.replace('text-slate-202', 'text-slate-200').replace('text-slate-455', 'text-slate-450'),
    '''                  <div className="text-center max-w-xl mx-auto mb-2 sm:mb-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">{t('selectForecastInputSource') || "Select Forecast Input Source"}</h2>
                    <p className="text-[10px] text-slate-450 mt-1 font-semibold">{t('selectForecastInputSourceDesc') || "Verify the source of legal directives to configure the litigation predictive engine."}</p>
                  </div>''',
    'Translating Input Source description'
)

source_options_old = '''                    {[
                      {
                        id: 'existing',
                        title: 'EXISTING CASE WORKSPACE',
                        desc: 'Predict litigation outcome using an existing case already stored in My Cases.',
                        features: [
                          'Auto-load parties',
                          'Auto-load facts',
                          'Auto-load evidence',
                          'Auto-load timeline',
                          'Auto-load pleadings',
                          'Auto-load previous AI analysis'
                        ],
                        icon: <Briefcase size={22} className="text-indigo-400" />
                      },
                      {
                        id: 'upload',
                        title: 'UPLOAD LEGAL DOCUMENTS',
                        desc: 'Upload petition, written statement, FIR, evidence, contracts or supporting documents.',
                        features: [
                          'Support PDF, DOCX, Images, ZIP',
                          'OCR timeline extraction',
                          'Evidence extraction',
                          'Auto fact extraction'
                        ],
                        icon: <Upload size={22} className="text-sky-400" />
                      },
                      {
                        id: 'manual',
                        title: 'MANUAL CASE FACTS',
                        desc: 'Create a prediction manually by entering facts.',
                        features: [
                          'Case Title & Parties details',
                          'Court & Case Category selection',
                          'Claims & Defence outlines',
                          'Evidence & Relief requested summaries'
                        ],
                        icon: <Edit3 size={22} className="text-emerald-400" />
                      }
                    ]'''

source_options_new = '''                    {[
                      {
                        id: 'existing',
                        title: t('existingCaseWorkspaceTitle') || 'EXISTING CASE WORKSPACE',
                        desc: t('existingCaseWorkspaceDesc') || 'Predict litigation outcome using an existing case already stored in My Cases.',
                        features: [
                          t('featAutoLoadParties') || 'Auto-load parties',
                          t('featAutoLoadFacts') || 'Auto-load facts',
                          t('featAutoLoadEvidence') || 'Auto-load evidence',
                          t('featAutoLoadTimeline') || 'Auto-load timeline',
                          t('featAutoLoadPleadings') || 'Auto-load pleadings',
                          t('featAutoLoadAIAnalysis') || 'Auto-load previous AI analysis'
                        ],
                        icon: <Briefcase size={22} className="text-indigo-400" />
                      },
                      {
                        id: 'upload',
                        title: t('uploadLegalDocumentsTitle') || 'UPLOAD LEGAL DOCUMENTS',
                        desc: t('uploadLegalDocumentsDescShort') || 'Upload petition, written statement, FIR, evidence, contracts or supporting documents.',
                        features: [
                          t('featSupportFormats') || 'Support PDF, DOCX, Images, ZIP',
                          t('featOcrExtraction') || 'OCR timeline extraction',
                          t('featEvidenceExtraction') || 'Evidence extraction',
                          t('featAutoFactExtraction') || 'Auto fact extraction'
                        ],
                        icon: <Upload size={22} className="text-sky-400" />
                      },
                      {
                        id: 'manual',
                        title: t('manualCaseFactsTitle') || 'MANUAL CASE FACTS',
                        desc: t('manualCaseFactsDesc') || 'Create a prediction manually by entering facts.',
                        features: [
                          t('featCaseTitleParties') || 'Case Title & Parties details',
                          t('featCourtCategory') || 'Court & Case Category selection',
                          t('featClaimsDefence') || 'Claims & Defence outlines',
                          t('featEvidenceRelief') || 'Evidence & Relief requested summaries'
                        ],
                        icon: <Edit3 size={22} className="text-emerald-400" />
                      }
                    ]'''

replace_exact(
    source_options_old,
    source_options_new,
    'Translating Source Selection Options'
)

# 23. Configuration Panel headers, select Case Workspace dropdown & Loaded Params
replace_exact(
    '''                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Source: Existing Case Workspace</h4>''',
    '''                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">{t('existingCaseWorkspace') || "Source: Existing Case Workspace"}</h4>''',
    'Translating Source: Existing Case Workspace header'
)

# Unique replacement for button 1
button_1_old = '''                          onClick={() => {
                            setSelectedCaseId('');
                            setIsCaseLoaded(false);
                            setInputWorkflowMode(null);
                          }} 
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-xl transition-all ${
                            isDark ? 'border-zinc-700 text-slate-350 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Change Source
                        </button>'''

button_1_new = '''                          onClick={() => {
                            setSelectedCaseId('');
                            setIsCaseLoaded(false);
                            setInputWorkflowMode(null);
                          }} 
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-xl transition-all ${
                            isDark ? 'border-zinc-700 text-slate-350 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t('changeSource') || "Change Source"}
                        </button>'''

replace_exact(
    button_1_old,
    button_1_new,
    'Translating Change Source button 1'
)

replace_exact(
    '''                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Select Case Workspace</label>''',
    '''                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{t('selectCaseWorkspace') || "Select Case Workspace"}</label>''',
    'Translating Select Case Workspace label'
)

replace_exact(
    '''                                {selectedCaseId ? (allProjects.find(p => p._id === selectedCaseId)?.name || 'Case Selected') : 'Search or Select Case Workspace...'}''',
    '''                                {selectedCaseId ? (allProjects.find(p => p._id === selectedCaseId)?.name || 'Case Selected') : (t('searchExistingCases') || 'Search or Select Case Workspace...')}''',
    'Translating Select Case placeholder'
)

replace_exact(
    '''                                  placeholder="Search workspace..."''',
    '''                                  placeholder={t('searchExistingCases') || "Search workspace..."}''',
    'Translating Search workspace placeholder'
)

replace_exact(
    '''                                  <h5 className="text-xs font-black uppercase text-indigo-400">⋄ Loaded Case Workspace Parameters</h5>
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                                    ✓ Prediction Ready
                                  </span>''',
    '''                                  <h5 className="text-xs font-black uppercase text-indigo-400">⋄ {t('loadedCaseWorkspaceParams') || "Loaded Case Workspace Parameters"}</h5>
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                                    ✓ {t('ready') || "Prediction Ready"}
                                  </span>''',
    'Translating Loaded Case parameters header'
)

replace_exact(
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Case Name</span>''',
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('caseName') || "Case Name"}</span>''',
    'Translating Case Name header'
)

replace_exact(
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Case Type</span>''',
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('caseType') || "Case Type"}</span>''',
    'Translating Case Type label'
)

replace_exact(
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Court</span>''',
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('courtLabel') || "Court"}</span>''',
    'Translating Court label'
)

replace_exact(
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Status</span>''',
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('status') || "Status"}</span>''',
    'Translating Status label'
)

replace_exact(
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Last Updated</span>''',
    '''                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('lastUpdated') || "Last Updated"}</span>''',
    'Translating Last Updated label'
)

# 24. Upload Section & Extracted Profiles
replace_exact(
    '''                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Source: Upload Legal Documents</h4>''',
    '''                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">{t('uploadLegalDocuments') || "Source: Upload Legal Documents"}</h4>''',
    'Translating Upload Documents header'
)

# Unique replacement for button 2
button_2_old = '''                          onClick={() => {
                            setUploadedFiles([]);
                            setInputWorkflowMode(null);
                          }} 
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-xl transition-all ${
                            isDark ? 'border-zinc-700 text-slate-350 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Change Source
                        </button>'''

button_2_new = '''                          onClick={() => {
                            setUploadedFiles([]);
                            setInputWorkflowMode(null);
                          }} 
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-xl transition-all ${
                            isDark ? 'border-zinc-700 text-slate-350 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t('changeSource') || "Change Source"}
                        </button>'''

replace_exact(
    button_2_old,
    button_2_new,
    'Translating Change Source button 2'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Upload Documents (PDF, DOCX, ZIP, IMAGES)</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('uploadLegalPleadingDocs') || "Upload Documents (PDF, DOCX, ZIP, IMAGES)"}</label>''',
    'Translating Upload label'
)

replace_exact(
    '''                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Running AI OCR Document pipeline (Extracting Parties, Timeline, Facts)...</span>''',
    '''                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">{t('ocrAnalysisProcessing') || "Running AI OCR Document pipeline (Extracting Parties, Timeline, Facts)..."}</span>''',
    'Translating OCR running label'
)

replace_exact(
    '''                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Uploaded Documents ({uploadedFiles.length})</label>''',
    '''                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{t('uploadedDocuments') || "Uploaded Documents"} ({uploadedFiles.length})</label>''',
    'Translating Uploaded Documents label'
)

replace_exact(
    '''                              <span className="text-[9px] font-black uppercase text-indigo-400">⋄ Auto Extracted Content Profile</span>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">✓ Extracted</span>''',
    '''                              <span className="text-[9px] font-black uppercase text-indigo-400">⋄ {t('autoExtractedContentProfile') || "Auto Extracted Content Profile"}</span>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">✓ {t('extracted') || "Extracted"}</span>''',
    'Translating Auto Extracted Profile header'
)

# 25. Manual Case facts builder
replace_exact(
    '''                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Source: Manual Case Facts Builder</h4>''',
    '''                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">{t('manualCaseFacts') || "Source: Manual Case Facts Builder"}</h4>''',
    'Translating Manual Facts header'
)

# Unique replacement for button 3
button_3_old = '''                          onClick={() => {
                            setInputWorkflowMode(null);
                          }} 
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-xl transition-all self-start sm:self-auto ${
                            isDark ? 'border-zinc-700 text-slate-350 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Change Source
                        </button>'''

button_3_new = '''                          onClick={() => {
                            setInputWorkflowMode(null);
                          }} 
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-xl transition-all self-start sm:self-auto ${
                            isDark ? 'border-zinc-700 text-slate-350 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t('changeSource') || "Change Source"}
                        </button>'''

replace_exact(
    button_3_old,
    button_3_new,
    'Translating Change Source button 3'
)

replace_exact(
    '''                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 block mb-2">⋄ Pre-fill Manual Case Templates</span>''',
    '''                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 block mb-2">⋄ {t('prefillManualTemplates') || "Pre-fill Manual Case Templates"}</span>''',
    'Translating Pre-fill Manual templates'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Case Title *</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('caseTitle') || "Case Title"} *</label>''',
    'Translating Case Title label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Petitioner / Plaintiff *</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('petitionerPlaintiff') || "Petitioner / Plaintiff"} *</label>''',
    'Translating Petitioner/Plaintiff label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>Respondent / Defendant *</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('opponentRespondentDetails') || "Respondent / Defendant"} *</label>''',
    'Translating Respondent/Defendant label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Court & Jurisdiction *</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('courtAndJurisdiction') || "Court & Jurisdiction"} *</label>''',
    'Translating Court & Jurisdiction label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Case Category</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('caseMatterType') || "Case Category"}</label>''',
    'Translating Case Category label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Applicable Statutes & Sections</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('specificStatutorySections') || "Applicable Statutes & Sections"}</label>''',
    'Translating Statutes & Sections label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Facts Chronology & Timeline</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('factsChronologyTimeline') || "Facts Chronology & Timeline"}</label>''',
    'Translating Facts Chronology & Timeline label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-505'}`}>Detailed Case Claims (Plaintiff Facts) *</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('detailedCaseClaims') || "Detailed Case Claims (Plaintiff Facts)"} *</label>''',
    'Translating Plaintiff Facts label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Defence Positions (Opposing Counsel Arguments)</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('defencePositions') || "Defence Positions (Opposing Counsel Arguments)"}</label>''',
    'Translating Defence Positions label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evidence & Documents Summary</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('evidenceAndDocumentsSummary') || "Evidence & Documents Summary"}</label>''',
    'Translating Evidence Summary label'
)

replace_exact(
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Relief Requested *</label>''',
    '''                          <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('reliefRequested') || "Relief Requested"} *</label>''',
    'Translating Relief Requested label'
)

# 26. Loading and dashboard executive KPIs
replace_exact(
    '''                <h4 className={`text-sm sm:text-base font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Processing Legal Directives...</h4>
                <p className={`text-xs font-bold leading-relaxed max-w-md px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  AISA is indexing matching High & Supreme court precedents, auditing document timelines, evaluating procedural risks, and compiling the Judicial Forecast.
                </p>''',
    '''                <h4 className={`text-sm sm:text-base font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('processingLegalDirectives') || "Processing Legal Directives..."}</h4>
                <p className={`text-xs font-bold leading-relaxed max-w-md px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('processingLegalDirectivesDesc') || "AISA is indexing matching High & Supreme court precedents, auditing document timelines, evaluating procedural risks, and compiling the Judicial Forecast."}
                </p>''',
    'Translating Processing Loader screen text'
)

replace_exact(
    '''                  <span>Configure New Case</span>''',
    '''                  <span>{t('configureManualForecast') || "Configure New Case"}</span>''',
    'Translating Configure New Case back button'
)

replace_exact(
    '''                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                    ⋄ Executive Forecasting Summary
                  </h3>''',
    '''                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                    ⋄ {t('executiveForecastingSummary') || "Executive Forecasting Summary"}
                  </h3>''',
    'Translating Executive Summary header'
)

replace_exact(
    '''                  <span className="text-[9px] font-semibold text-slate-400 text-right shrink-0">
                    Courtroom jurisdiction: <span className="text-indigo-400 font-extrabold">{simulatedCourtLevel} Court</span>
                  </span>''',
    '''                  <span className="text-[9px] font-semibold text-slate-400 text-right shrink-0">
                    {t('courtroomJurisdiction') || "Courtroom jurisdiction:"} <span className="text-indigo-400 font-extrabold">{simulatedCourtLevel} Court</span>
                  </span>''',
    'Translating Courtroom Jurisdiction tag'
)

replace_exact(
    '''                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                          Win Probability
                        </span>''',
    '''                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                          {t('winningProbability') || "Win Probability"}
                        </span>''',
    'Translating Gauge Win Probability label'
)

replace_exact(
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">AI Confidence</span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-indigo-400">{simulatedStats.confidenceScore}%</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">Statistical accuracy rate</span>
                      </div>''',
                      
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('aiConfidence') || "AI Confidence"}</span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-indigo-400">{simulatedStats.confidenceScore}%</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{t('statisticalAccuracyRate') || "Statistical accuracy rate"}</span>
                      </div>''',
    'Translating AI Confidence card'
)

replace_exact(
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Overall Risk</span>
                      <div className="mt-2">
                        <span className={`text-xl font-black uppercase ${
                          simulatedStats.litigationRisk === 'High' ? 'text-red-500' :
                          simulatedStats.litigationRisk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>{simulatedStats.litigationRisk}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">Litigation level threshold</span>
                      </div>''',
                      
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('overallRisk') || "Overall Risk"}</span>
                      <div className="mt-2">
                        <span className={`text-xl font-black uppercase ${
                          simulatedStats.litigationRisk === 'High' ? 'text-red-500' :
                          simulatedStats.litigationRisk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>{t(simulatedStats.litigationRisk) || simulatedStats.litigationRisk}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{t('litigationLevelThreshold') || "Litigation level threshold"}</span>
                      </div>''',
    'Translating Overall Risk card'
)

replace_exact(
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Strategy Tactic</span>
                      <div className="mt-2">
                        <span className="text-xs font-black text-indigo-400 uppercase">{displayPrediction.courtStrategy?.strategyType || 'Balanced'} Strategy</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">Emphasize documentary records</span>
                      </div>''',
                      
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('strategyTactic') || "Strategy Tactic"}</span>
                      <div className="mt-2">
                        <span className="text-xs font-black text-indigo-400 uppercase">{t(displayPrediction.courtStrategy?.strategyType) || displayPrediction.courtStrategy?.strategyType || 'Balanced'} {t('strategy') || 'Strategy'}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{t('emphasizeDocumentaryRecords') || "Emphasize documentary records"}</span>
                      </div>''',
    'Translating Strategy card'
)

replace_exact(
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Settlement Probability</span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-sky-500">{displayPrediction.stats.settlementProbability}%</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">Mediation advisory viability</span>
                      </div>''',
                      
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('settlementProbability') || "Settlement Probability"}</span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-sky-500">{displayPrediction.stats.settlementProbability}%</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{t('mediationAdvisoryViability') || "Mediation advisory viability"}</span>
                      </div>''',
    'Translating Settlement probability card'
)

replace_exact(
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Litigation Cost</span>
                      <div className="mt-2">
                        <span className="text-base font-black text-yellow-500">₹{(simulatedCourtLevel === 'Supreme' ? displayPrediction.stats.estimatedLegalCost * 2 : simulatedCourtLevel === 'High' ? displayPrediction.stats.estimatedLegalCost * 1.4 : displayPrediction.stats.estimatedLegalCost).toLocaleString()}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">Estimated budget (district fees)</span>
                      </div>''',
                      
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('litigationCost') || "Litigation Cost"}</span>
                      <div className="mt-2">
                        <span className="text-base font-black text-yellow-500">₹{(simulatedCourtLevel === 'Supreme' ? displayPrediction.stats.estimatedLegalCost * 2 : simulatedCourtLevel === 'High' ? displayPrediction.stats.estimatedLegalCost * 1.4 : displayPrediction.stats.estimatedLegalCost).toLocaleString()}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{t('estimatedBudgetDistrictFees') || "Estimated budget (district fees)"}</span>
                      </div>''',
    'Translating Litigation Cost card'
)

replace_exact(
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Estimated Duration</span>
                      <div className="mt-2">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{displayPrediction.stats.estimatedDuration || "12-15 Months"}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">Expected trial duration</span>
                      </div>''',
                      
    '''                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">{t('estimatedDuration') || "Estimated Duration"}</span>
                      <div className="mt-2">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{displayPrediction.stats.estimatedDuration || "12-15 Months"}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{t('expectedTrialDuration') || "Expected trial duration"}</span>
                      </div>''',
    'Translating Duration card'
)

# 27. Dashboard Tabs Labels
replace_exact(
    '''                  {[
                    { id: 'overview', label: 'Overview', icon: Brain },
                    { id: 'risks', label: 'Risk', icon: AlertTriangle },
                    { id: 'strategy', label: 'Strategy', icon: Target },
                    { id: 'precedents', label: 'Precedents', icon: BookOpen },
                    { id: 'reports', label: 'Reports', icon: FileDown }
                  ].map(t => {''',
    '''                  {[
                    { id: 'overview', label: t('overview') || 'Overview', icon: Brain },
                    { id: 'risks', label: t('risk') || 'Risk', icon: AlertTriangle },
                    { id: 'strategy', label: t('strategy') || 'Strategy', icon: Target },
                    { id: 'precedents', label: t('precedents') || 'Precedents', icon: BookOpen },
                    { id: 'reports', label: t('reports') || 'Reports', icon: FileDown }
                  ].map(t => {''',
    'Translating Dashboard navigation tabs'
)

# 28. Overview Tab Inner Texts
replace_exact(
    '''                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block mb-2">⋄ Judicial Forecasting Reasoning & Decisional Basis</span>''',
    '''                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block mb-2">⋄ {t('judicialForecastingReasoning') || "Judicial Forecasting Reasoning & Decisional Basis"}</span>''',
    'Translating Decisional basis title'
)

replace_exact(
    '''                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">⋄ WHY AI PREDICTED THIS (Top 5 Strongest Reasons)</span>''',
    '''                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">⋄ {t('whyAiPredictedThis') || "WHY AI PREDICTED THIS (Top 5 Strongest Reasons)"}</span>''',
    'Translating Why AI Predicted This header'
)

replace_exact(
    '''                                  <span className="text-slate-400 block text-[7.5px] uppercase font-black mb-0.5">Evidence Basis</span>''',
    '''                                  <span className="text-slate-400 block text-[7.5px] uppercase font-black mb-0.5">{t('evidenceBasis') || "Evidence Basis"}</span>''',
    'Translating Evidence basis label'
)

replace_exact(
    '''                                  <span className="text-slate-400 block text-[7.5px] uppercase font-black mb-0.5">Statutory Law</span>''',
    '''                                  <span className="text-slate-400 block text-[7.5px] uppercase font-black mb-0.5">{t('statutoryLaw') || "Statutory Law"}</span>''',
    'Translating Statutory Law label'
)

replace_exact(
    '''                                  <span className="text-slate-400 block text-[7.5px] uppercase font-black mb-0.5">Supporting Judgment</span>''',
    '''                                  <span className="text-slate-400 block text-[7.5px] uppercase font-black mb-0.5">{t('supportingJudgment') || "Supporting Judgment"}</span>''',
    'Translating Supporting Judgment label'
)

# 29. Risks Tab Severity Mapping & Labels
replace_exact(
    '''                              <span className="text-slate-400 uppercase text-[8px] tracking-wider block">{riskType.replace('Risk', ' Risk')}</span>
                              <span className="text-xs font-black uppercase block">{val} Severity</span>''',
    '''                              <span className="text-slate-400 uppercase text-[8px] tracking-wider block">{t(riskType) || riskType.replace('Risk', ' Risk')}</span>
                              <span className="text-xs font-black uppercase block">{t(val) || val} {t('severity') || "Severity"}</span>''',
    'Translating risk parameter blocks'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-red-500 block">Critical Risks</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-red-500 block">{t('criticalRisks') || "Critical Risks"}</span>''',
    'Translating Critical Risks header'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-amber-500 block">Medium Risks</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-amber-500 block">{t('mediumRisks') || "Medium Risks"}</span>''',
    'Translating Medium Risks header'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-rose-500 block">Procedural Vulnerabilities</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-rose-500 block">{t('proceduralVulnerabilities') || "Procedural Vulnerabilities"}</span>''',
    'Translating Procedural Vulnerabilities header'
)

# 30. Strategy Tab courtroom, settlement and examiners tactics
replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-indigo-400 block">Courtroom Tactics</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-indigo-400 block">{t('courtroomSequence') || "Courtroom Tactics"}</span>''',
    'Translating Courtroom Sequence title'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-sky-500 block">Settlement Strategy</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-sky-500 block">{t('settlementStrategy') || "Settlement Strategy"}</span>''',
    'Translating Settlement Strategy header'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-indigo-400 block">Cross Examination Focus</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-indigo-400 block">{t('crossExaminationFocus') || "Cross Examination Focus"}</span>''',
    'Translating Cross Exam header'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-emerald-500 block">Arguments to Emphasize</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-emerald-500 block">{t('argumentsToEmphasize') || "Arguments to Emphasize"}</span>''',
    'Translating Emphasize arguments header'
)

replace_exact(
    '''                          <span className="text-[9px] font-black uppercase text-red-500 block">Arguments to Avoid</span>''',
    '''                          <span className="text-[9px] font-black uppercase text-red-500 block">{t('argumentsToAvoid') || "Arguments to Avoid"}</span>''',
    'Translating Avoid arguments header'
)

# 31. Precedents tab
replace_exact(
    '''                          <span className="text-slate-400 uppercase text-[8px] font-black tracking-wider block">Supreme Court Judicial Precedents</span>''',
    '''                          <span className="text-slate-400 uppercase text-[8px] font-black tracking-wider block">{t('supremeCourtBindingPrecedents') || "Supreme Court Judicial Precedents"}</span>''',
    'Translating Supreme precedents title'
)

replace_exact(
    '''                          <span className="text-slate-400 uppercase text-[8px] font-black tracking-wider block">State High Court Judicial Precedents</span>''',
    '''                          <span className="text-slate-400 uppercase text-[8px] font-black tracking-wider block">{t('highCourtPersuasivePrecedents') || "State High Court Judicial Precedents"}</span>''',
    'Translating High precedents title'
)

# 32. Reports tab items, expected, and empty states
replace_exact(
    '''                              <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                  isSel
                                    ? 'bg-indigo-500 text-white'
                                    : isDark ? 'bg-zinc-800 text-indigo-400' : 'bg-slate-100 text-indigo-650'
                                }`}>
                                  <IconComponent size={16} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-black uppercase tracking-wider ${
                                    isSel
                                      ? 'text-indigo-500'
                                      : isDark ? 'text-slate-200' : 'text-slate-800'
                                  }`}>{rep.title}</h4>
                                  <p className="text-[10px] text-slate-455 mt-0.5 line-clamp-2 leading-relaxed font-semibold">
                                    {rep.desc}
                                  </p>
                                </div>
                              </div>'''.replace('text-slate-455', 'text-slate-450'),
    '''                              <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                  isSel
                                    ? 'bg-indigo-500 text-white'
                                    : isDark ? 'bg-zinc-800 text-indigo-400' : 'bg-slate-100 text-indigo-650'
                                }`}>
                                  <IconComponent size={16} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-black uppercase tracking-wider ${
                                    isSel
                                      ? 'text-indigo-500'
                                      : isDark ? 'text-slate-200' : 'text-slate-800'
                                  }`}>{getReportName(rep.id, rep.title)}</h4>
                                  <p className="text-[10px] text-slate-450 mt-0.5 line-clamp-2 leading-relaxed font-semibold">
                                    {getReportDesc(rep.id, rep.desc)}
                                  </p>
                                </div>
                              </div>''',
    'Translating report metadata cards title and description'
)

replace_exact(
    '''                              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-white/5 pt-2 mt-3 text-[9px] font-bold">
                                <div>
                                  {isLocked ? (
                                    <span className="flex items-center gap-0.5 text-emerald-500 font-extrabold uppercase">
                                      <Lock size={9} />
                                      Locked
                                    </span>
                                  ) : isGenerated ? (
                                    <span className="text-indigo-400 font-extrabold uppercase">Generated</span>
                                  ) : (
                                    <span className="text-slate-400 uppercase font-semibold">Not Generated</span>
                                  )}
                                </div>
                                <span className="text-slate-400/70">
                                  {isGenerated ? 'Active Brief' : 'Needs Compile'}
                                </span>
                              </div>''',
    '''                              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-white/5 pt-2 mt-3 text-[9px] font-bold">
                                <div>
                                  {isLocked ? (
                                    <span className="flex items-center gap-0.5 text-emerald-500 font-extrabold uppercase">
                                      <Lock size={9} />
                                      {t('locked') || "Locked"}
                                    </span>
                                  ) : isGenerated ? (
                                    <span className="text-indigo-400 font-extrabold uppercase">{t('generated') || "Generated"}</span>
                                  ) : (
                                    <span className="text-slate-400 uppercase font-semibold">{t('notGenerated') || "Not Generated"}</span>
                                  )}
                                </div>
                                <span className="text-slate-400/70">
                                  {isGenerated ? (t('activeBrief') || 'Active Brief') : (t('needsCompile') || 'Needs Compile')}
                                </span>
                              </div>''',
    'Translating locked, generated, notGenerated tags'
)

replace_exact(
    '''                            {activePrediction?.lockedReports?.[selectedReportTab] && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase">
                                <Lock size={9} /> Approved & Locked
                              </span>
                            )}''',
    '''                            {activePrediction?.lockedReports?.[selectedReportTab] && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase">
                                <Lock size={9} /> {t('approvedAndLocked') || "Approved & Locked"}
                              </span>
                            )}''',
    'Translating Approved & Locked label'
)

replace_exact(
    '''                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                  {REPORT_METADATA.find(m => m.id === selectedReportTab)?.title || selectedReportTab} Pleading Pending
                                </h4>''',
    '''                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                  {getReportName(selectedReportTab, selectedReportTab)} {t('pleadingPending') || "Pleading Pending"}
                                </h4>''',
    'Translating pleadingPending label'
)

replace_exact(
    '''                                  <span className="block font-black uppercase text-indigo-400 tracking-wider">Expected Brief Content:</span>''',
    '''                                  <span className="block font-black uppercase text-indigo-400 tracking-wider">{t('expectedBriefContent') || "Expected Brief Content:"}</span>''',
    'Translating expectedBriefContent label'
)

replace_exact(
    '''                                <span className="block text-[8px] text-slate-455 font-black uppercase pt-1">
                                  Estimated time: {REPORT_METADATA.find(m => m.id === selectedReportTab)?.estTime}
                                </span>''',
    '''                                <span className="block text-[8px] text-slate-455 font-black uppercase pt-1">
                                  {t('estimatedTime') || "Estimated time"}: {REPORT_METADATA.find(m => m.id === selectedReportTab)?.estTime}
                                </span>''',
    'Translating estimatedTime label'
)

replace_exact(
    '''                                <div className="flex items-center gap-2 mb-2">
                                  <Edit3 size={12} className="text-slate-450" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Private Case Annotations</span>
                                </div>''',
    '''                                <div className="flex items-center gap-2 mb-2">
                                  <Edit3 size={12} className="text-slate-450" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('privateCaseAnnotations') || "Private Case Annotations"}</span>
                                </div>''',
    'Translating privateCaseAnnotations label'
)

replace_exact(
    '''                                  placeholder="Write private strategic annotations or attorney notes here... (Automatically saved case-by-case)"''',
    '''                                  placeholder={t('privateCaseAnnotationsPlaceholder') || "Write private strategic annotations or attorney notes here... (Automatically saved case-by-case)"}''',
    'Translating privateCaseAnnotations placeholder'
)

replace_exact(
    '''                                  <RefreshCw size={11} className={isPredictorTranslating ? 'animate-spin' : ''} />
                                  <span>Generate Again</span>''',
    '''                                  <RefreshCw size={11} className={isPredictorTranslating ? 'animate-spin' : ''} />
                                  <span>{t('generateAgain') || "Generate Again"}</span>''',
    'Translating Generate Again button'
)

replace_exact(
    '''                                    {activePrediction.lockedReports?.[selectedReportTab] ? (
                                      <>
                                        <Lock size={11} />
                                        <span>Unlock Document</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check size={11} />
                                        <span>Approve & Lock Brief</span>
                                      </>
                                    )}''',
    '''                                    {activePrediction.lockedReports?.[selectedReportTab] ? (
                                      <>
                                        <Lock size={11} />
                                        <span>{t('unlockDocument') || "Unlock Document"}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check size={11} />
                                        <span>{t('approveAndLockBrief') || "Approve & Lock Brief"}</span>
                                      </>
                                    )}''',
    'Translating Unlock / Approve buttons'
)

# 27. Clean up report tab change resetting parameters
replace_exact(
    '''  const handleReportTabChange = (tabId) => {
    setSelectedReportTab(tabId);
    setOutputLang('en');
    setTranslatedReportText('');
    setCompareVersionId('');''',
    '''  const handleReportTabChange = (tabId) => {
    setSelectedReportTab(tabId);
    setCompareVersionId('');''',
    'Cleaning up outputLang resets on report tab change'
)

print("[SUCCESS] All replacements completed successfully!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File successfully saved!")
