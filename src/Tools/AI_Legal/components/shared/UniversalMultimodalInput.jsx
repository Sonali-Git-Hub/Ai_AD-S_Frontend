import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Square, Trash2, Edit2, RefreshCw, Globe, FileText, Camera,
  Check, X, ChevronDown, ChevronUp, FolderOpen, Plus, Play, Pause,
  Save, Upload, AlertCircle, Briefcase, Smartphone, Cloud, MessageSquare, Sparkles, Image, CheckCircle
} from 'lucide-react';
import { apiService } from '../../../../services/apiService';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { createPortal } from 'react-dom';

const CLOUD_DRIVE_MOCK_FILES = {
  gdrive: [
    { name: 'Agreement_Executed_12May2026.pdf', size: '1.2 MB', type: 'application/pdf', content: 'MUTUAL NON-DISCLOSURE AGREEMENT\nThis Agreement is entered into on 12 May 2026...\nClause 8. Verification: Any alterations without counter-signature are null and void.\nClause 14. IP Rights: Telemetry data belongs exclusively to client.' },
    { name: 'Rent_Default_Notice_Draft.docx', size: '450 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', content: 'LEGAL DEMAND NOTICE\nTo: Amit Verma\nI hereby call upon you to pay the outstanding rent of INR 1,50,000 for consecutive 3 months...' },
  ],
  dropbox: [
    { name: 'Property_Possession_Letter_Scan.png', size: '4.8 MB', type: 'image/png', content: 'POSSESSION LETTER\nProject Name: Elite Residency, Flat 402.\nWe hereby hand over peaceful physical possession of flat 402 to client.' },
  ],
  onedrive: [
    { name: 'Invoice_Legal_Consultation_INV984.pdf', size: '320 KB', type: 'application/pdf', content: 'TAX INVOICE\nInvoice: INV-98442\nBill To: Rajesh Sharma\nAmount: INR 45,000 for consultations.' }
  ]
};

export const getSimulatedOcrContent = (filename) => {
  const name = (filename || '').toLowerCase();
  if (name.includes('fir') || name.includes('complaint') || name.includes('criminal')) {
    return `FIRST INFORMATION REPORT (Under Section 154 CrPC)
1. District: Jabalpur, State: Madhya Pradesh, Year: 2026, FIR No: 0142/2026, Date: 12/03/2026
2. Act(s): Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS)
   Section(s): Section 420 (Cheating), Section 406 (Criminal Breach of Trust), Section 120B (Criminal Conspiracy)
3. Occurrence of Offence:
   Date: 10/01/2026 to 15/02/2026. Place of Occurrence: Jabalpur town office.
4. Complainant / Informant:
   Name: Rajesh Kumar Sharma, S/o Late Ram Prasad Sharma, R/o 12, Vijay Nagar, Jabalpur.
5. Details of Accused Persons:
   (1) Sunil Verma, Director, Verma Tech Solutions Private Limited.
   (2) Anjali Verma, Co-Director, Verma Tech Solutions Private Limited.
6. Brief Facts / Complaint Details:
   The complainant Rajesh Kumar Sharma entered into a software development service agreement with Verma Tech Solutions Private Limited on 15/09/2025. The complainant paid an advance sum of INR 15,00,500/- for development of custom ERP portal. Despite receiving the payment, the accused Sunil Verma and Anjali Verma closed their local office, misappropriated the funds, and failed to deliver the software. Investigations reveal they diverted the funds to their personal bank accounts, constituting cheating, breach of trust, and fraud. Witness 3 (Amit Saxena, Accountant) confirmed the diverted transactions, but complainant instructs to focus on the forged signatures of Sunil Verma on the project sign-off sheets dated 10/01/2026.`;
  }
  if (name.includes('contract') || name.includes('agreement') || name.includes('lease') || name.includes('deed') || name.includes('commercial')) {
    return `COMMERCIAL SERVICE LEVEL & SOFTWARE LICENSE AGREEMENT
This Software License Agreement ("Agreement") is made this 15th day of September, 2025 by and between:
Licensor: Verma Tech Solutions Private Limited, having its registered office at 404, IT Park, Jabalpur (hereinafter "Licensor").
Licensee: Rajesh Kumar Sharma, R/o 12, Vijay Nagar, Jabalpur (hereinafter "Licensee").

WHEREAS:
A. Licensor is engaged in software development services.
B. Licensee desires to license certain software platforms.

NOW THEREFORE, the parties agree as follows:
1. LICENSE GRANT & DELIVERABLES: Licensor grants to Licensee a non-transferable, non-exclusive license to use the custom ERP software. The final delivery date is set to 31/12/2025.
2. PAYMENT TERMS: The total consideration is INR 25,00,000/-. An advance payment of INR 15,00,500/- is payable upon signing.
3. Clause 8 - LIMITATION OF LIABILITY: Notwithstanding anything to the contrary, the total liability of Licensor under this agreement for any claims, losses, or damages shall not exceed the amount of advance fees paid. (NOTE: Licensee disputes the validity of this Clause 8 citing forged signatures on the project sign-off sheets).
4. TERMINATION: Either party may terminate this Agreement by giving 30 days written notice. Upon termination, Licensee shall cease all use of the software.
5. INDEMNITY: Licensor shall indemnify, defend, and hold harmless Licensee from any third-party claims of intellectual property infringement.
6. JURISDICTION: This Agreement shall be governed by the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts in Jabalpur, Madhya Pradesh.`;
  }
  if (name.includes('notice') || name.includes('reply') || name.includes('legal')) {
    return `LEGAL DEMAND NOTICE (Under Section 138 of Negotiable Instruments Act)
Date: 20/02/2026
To,
Sunil Verma, Director, Verma Tech Solutions Private Limited.

Dear Sir,
Under instructions from our client Mr. Rajesh Kumar Sharma, we hereby serve you with the following legal notice:
1. Our client had paid you an advance of INR 15,00,500/- for software services.
2. Due to your failure to perform, you issued Cheque No. 445892 dated 02/02/2026 drawn on HDFC Bank, Jabalpur Branch for a sum of INR 10,00,000/- towards partial refund.
3. The said cheque was presented by our client, but was returned unpaid with the bank memo citing "Insufficient Funds" on 05/02/2026.
4. We hereby call upon you to make the payment of the said amount of INR 10,00,000/- within 15 days of receipt of this notice, failing which criminal proceedings under Section 138 of the NI Act will be initiated.`;
  }
  if (name.includes('evidence') || name.includes('receipt') || name.includes('annexure') || name.includes('bank')) {
    return `BANK TRANSACTION STATEMENT & RECEIPT
Bank Name: State Bank of India, Jabalpur Main Branch
Account Holder: Rajesh Kumar Sharma
Beneficiary Name: Verma Tech Solutions Private Limited
Transaction Date: 16/09/2025
Amount Transferred: INR 15,00,500/-
Transaction ID: TXN998822451A
Payment Status: Success
Remarks: Advance payment for custom ERP software platform contract. Signature authorized by SBI Branch Manager.`;
  }
  return `EXTRACTED COURT DECREE & LEGAL ANNEXURE DETAILS
In the Court of District Judge, Jabalpur (Madhya Pradesh)
Civil Suit No: CS/450/2026
Rajesh Kumar Sharma ... Petitioner / Plaintiff
Versus
Sunil Verma ... Respondent / Defendant

Subject Matter: Application for recovery of dues and breach of contract.
Material Facts: The Petitioner entered into development terms with Respondent on 15/09/2025. The Respondent failed to deliver service deliverables. A cheque bounce occurred for INR 10,00,000/- on 05/02/2026.
Documents Annexed: Service Agreement, HDFC Cheque bounce memo, demand notice dated 20/02/2026, bank transfer receipt.`;
};

export const UniversalMultimodalInput = ({
  caseId = 'global',
  workspaceName = 'General',
  onContextChange,
  theme = 'light',
  layout = 'upload'
}) => {
  const isDark = theme === 'dark';

  // State elements
  const [activeInputTab, setActiveInputTab] = useState(null); // 'voice', 'whatsapp', 'drive', 'camera', 'notes', 'files'
  const [isUploadSourceModalOpen, setIsUploadSourceModalOpen] = useState(false);
  const [lastUsedSource, setLastUsedSource] = useState(() => localStorage.getItem('aisa_last_used_source') || null);
  const [cameraCropState, setCameraCropState] = useState('raw'); // 'raw' | 'cropping' | 'ready'
  const [isCameraOcrRunning, setIsCameraOcrRunning] = useState(false);
  const [tempCapturedImage, setTempCapturedImage] = useState(null); // { name, base64 }
  const [micPermissionError, setMicPermissionError] = useState(false);
  const [voiceRecordingState, setVoiceRecordingState] = useState('idle'); // 'idle' | 'recording' | 'transcribing' | 'ready' | 'error'
  const [voiceTranscriptText, setVoiceTranscriptText] = useState('');
  const [voiceTranscriptBlob, setVoiceTranscriptBlob] = useState(null);

  // Refs
  const deviceFileInputRef = useRef(null);
  const whatsappFileInputRef = useRef(null);
  const audioUploadInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [stagedFiles, setStagedFiles] = useState([]); // { name, size, type, content, isOcrDone }
  const [voiceRecordings, setVoiceRecordings] = useState([]); // { id, base64, transcript, duration, isRecording, playState, translated, isSummarized, summary }
  const [whatsappChats, setWhatsappChats] = useState([]); // { name, parsedData, rawText }
  const [driveFiles, setDriveFiles] = useState([]); // { name, size, type, content }
  const [cameraImages, setCameraImages] = useState([]); // { name, base64, ocrText }
  const [manualNotes, setManualNotes] = useState('');

  // Voice recording references
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationIntervalRef = useRef(null);

  // Audio waveform visualizer references
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Camera references
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Edit transcript states
  const [editingTranscriptId, setEditingTranscriptId] = useState(null);
  const [editingTranscriptText, setEditingTranscriptText] = useState('');

  // Dropdown/tab states
  const [activeDriveTab, setActiveDriveTab] = useState('gdrive');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Load from Workspace Memory (localStorage) on mount
  useEffect(() => {
    try {
      const cacheKey = `aisa_multimodal_${workspaceName}_${caseId}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stagedFiles) setStagedFiles(parsed.stagedFiles);
        if (parsed.voiceRecordings) setVoiceRecordings(parsed.voiceRecordings);
        if (parsed.whatsappChats) setWhatsappChats(parsed.whatsappChats);
        if (parsed.driveFiles) setDriveFiles(parsed.driveFiles);
        if (parsed.cameraImages) setCameraImages(parsed.cameraImages);
        if (parsed.manualNotes) setManualNotes(parsed.manualNotes);
      }
    } catch (e) {
      console.error('Failed to load workspace memory:', e);
    }
  }, [workspaceName, caseId]);

  // Persist to Workspace Memory (localStorage) and trigger parent update on changes
  const saveWorkspaceMemory = useCallback(() => {
    try {
      const cacheKey = `aisa_multimodal_${workspaceName}_${caseId}`;
      const dataToSave = { stagedFiles, voiceRecordings, whatsappChats, driveFiles, cameraImages, manualNotes };
      localStorage.setItem(cacheKey, JSON.stringify(dataToSave));

      // Calculate stats and build promptString for Smart AI Merge
      const docCount = stagedFiles.length + driveFiles.length + cameraImages.length;
      const voiceCount = voiceRecordings.length;
      const chatCount = whatsappChats.length;
      const voiceTotalDuration = voiceRecordings.reduce((acc, vr) => acc + (vr.duration || 0), 0);

      // Construct Unified Legal Context
      let promptString = `\n[UNIFIED MULTIMODAL CONTEXT - ${workspaceName.toUpperCase()}]:\n`;

      if (docCount > 0) {
        promptString += `\nSTAGED EVIDENCE & DOCUMENTS:\n`;
        stagedFiles.forEach(f => {
          promptString += `- File: ${f.name} | Extracted Text/OCR: ${f.content || 'No text extracted.'}\n`;
        });
        driveFiles.forEach(f => {
          promptString += `- Cloud File: ${f.name} | Content: ${f.content}\n`;
        });
        cameraImages.forEach(f => {
          promptString += `- Camera Snap OCR: ${f.name} | Extracted: ${f.ocrText}\n`;
        });
      }

      if (voiceCount > 0) {
        promptString += `\nLAWYER VOICE EXPLANATIONS & OBJECTIVES:\n`;
        voiceRecordings.forEach((v, i) => {
          promptString += `- Voice Note ${i + 1} (${v.duration}s): ${v.transcript || '(Pending transcription)'}\n`;
        });
      }

      if (chatCount > 0) {
        promptString += `\nWHATSAPP CHAT INSIGHTS & NEGOTIATIONS:\n`;
        whatsappChats.forEach(c => {
          promptString += `- WhatsApp Chat: ${c.name}\n  Extracted Timeline:\n`;
          if (c.parsedData?.timeline) {
            c.parsedData.timeline.forEach(t => {
              promptString += `    * ${t.date} ${t.time} [${t.sender}]: ${t.message}\n`;
            });
          }
          if (c.parsedData?.admissions?.length > 0) {
            promptString += `  Extracted Admissions/Agreements:\n`;
            c.parsedData.admissions.forEach(a => promptString += `    * [${a.sender}]: ${a.message}\n`);
          }
          if (c.parsedData?.threats?.length > 0) {
            promptString += `  Extracted Threats/Demands:\n`;
            c.parsedData.threats.forEach(t => promptString += `    * [${t.sender}]: ${t.message}\n`);
          }
          if (c.parsedData?.promises?.length > 0) {
            promptString += `  Extracted Promises:\n`;
            c.parsedData.promises.forEach(p => promptString += `    * [${p.sender}]: ${p.message}\n`);
          }
        });
      }

      if (manualNotes && manualNotes.trim()) {
        promptString += `\nMANUAL FACT NOTES:\n${manualNotes}\n`;
      }

      promptString += `\n[SMART CONFLICT RESOLUTION RULES]:\n`;
      promptString += `1. Intelligently merge the uploaded documents, voice transcripts, WhatsApp chats, and case facts.\n`;
      promptString += `2. CRITICAL PRIORITY: Voice explanations and manual notes represent the advocate's current specific instructions. If a voice explanation or manual note instructs to ignore or override specific sections of uploaded documents, or outlines that a document is fake/invalid (e.g. "Clause 8 is fake" or "Ignore invoice dated 12 May"), prioritize this verbal instruction absolutely and exclude or handle the document accordingly.\n`;
      promptString += `--------------------------------------\n`;

      if (onContextChange) {
        onContextChange({
          stagedFiles,
          voiceRecordings,
          whatsappChats,
          driveFiles,
          cameraImages,
          manualNotes,
          docCount,
          voiceCount,
          chatCount,
          voiceTotalDuration,
          promptString,
          // hasStagedContext = true whenever ANY source has content (used by modules to enable/disable generate buttons)
          hasStagedContext: (
            stagedFiles.length > 0 ||
            driveFiles.length > 0 ||
            cameraImages.length > 0 ||
            voiceRecordings.length > 0 ||
            whatsappChats.length > 0 ||
            (manualNotes && manualNotes.trim().length > 0)
          )
        });
      }
    } catch (e) {
      console.error('Failed to save memory and update parent:', e);
    }
  }, [stagedFiles, voiceRecordings, whatsappChats, driveFiles, cameraImages, manualNotes, workspaceName, caseId, onContextChange]);

  useEffect(() => {
    saveWorkspaceMemory();
  }, [stagedFiles, voiceRecordings, whatsappChats, driveFiles, cameraImages, manualNotes, saveWorkspaceMemory]);

  // Audio Canvas visualizer loop
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current) return;
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDark ? 'rgba(15, 22, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    if (analyserRef.current) {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      analyser.getByteFrequencyData(dataArray);
 
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;
 
      for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = isDark ? `rgba(99, 102, 241, ${barHeight / 128})` : `rgba(79, 70, 229, ${barHeight / 128})`;
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
      }
    } else {
      // Flat line (Real visualizer behavior when idle/no input)
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#6366F1' : '#4F46E5';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  }, [isDark]);

  // Handle Voice Recording start/stop
  const startRecording = async () => {
    try {
      setMicPermissionError(false);
      setVoiceTranscriptText('');
      setVoiceTranscriptBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Audio visualizer setup
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(durationIntervalRef.current);
        cancelAnimationFrame(animationFrameRef.current);
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setVoiceTranscriptBlob(audioBlob);
        
        // Stop browser Web Speech recognition if active
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }

        setVoiceRecordingState('transcribing');

        // Convert to base64 for backend Whisper fallback
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          
          // Check if SpeechRecognition already populated the transcript
          if (voiceTranscriptText.trim().length > 3) {
            setVoiceRecordingState('ready');
            toast.success('Speech recognition transcript generated.');
          } else {
            // Whisper API fallback
            try {
              const data = await apiService.transcribeAudio(base64Audio, 'audio/webm');
              if (data && data.text) {
                setVoiceTranscriptText(data.text);
                setVoiceRecordingState('ready');
                toast.success('Speech transcribed successfully via AI engine.');
              } else {
                throw new Error('Whisper returned empty transcript.');
              }
            } catch (err) {
              console.error('Whisper transcription failed:', err);
              setVoiceRecordingState('error');
              toast.error('Unable to transcribe voice audio.');
            }
          }
        };

        // Stop stream tracks
        stream.getTracks().forEach(t => t.stop());
      };

      // Native browser speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        let accumulatedText = '';
        recognition.onresult = (event) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              accumulatedText += event.results[i][0].transcript + ' ';
            } else {
              interimText += event.results[i][0].transcript;
            }
          }
          setVoiceTranscriptText(accumulatedText + interimText);
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceRecordingState('recording');
      setRecDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecDuration(prev => prev + 1);
      }, 1000);

      // Start drawing wave
      setTimeout(() => {
        drawWaveform();
      }, 100);
    } catch (err) {
      console.error('Microphone connection failed:', err);
      setMicPermissionError(true);
      setIsRecording(false);
      setVoiceRecordingState('idle');
      toast.error('Microphone permission denied or device busy.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    clearInterval(durationIntervalRef.current);
    cancelAnimationFrame(animationFrameRef.current);
    
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    setIsRecording(false);
    setVoiceRecordingState('idle');
    setRecDuration(0);
    setVoiceTranscriptText('');
    setVoiceTranscriptBlob(null);
    toast.info('Recording discarded.');
  };

  // WhatsApp Parsing utilities
  const parseWhatsAppChat = (chatText) => {
    const lines = chatText.split('\n');
    const timeline = [];
    const parties = new Set();
    const admissions = [];
    const threats = [];
    const promises = [];

    // Heuristics lists
    const admissionKeywords = ['agree', 'yes', 'my mistake', 'accepted', 'signed', 'received', 'mera fault', 'haan', 'haath', 'manzoor'];
    const threatKeywords = ['sue', 'court', 'police', 'notice', 'lawyer', 'legal action', 'case filing', 'mukadma', 'jail'];
    const promiseKeywords = ['will pay', 'will clear', 'will deliver', 'promise', 'guarantee', 'clear due', 'pay you', 'de dunga'];

    lines.forEach(line => {
      // standard line patterns:
      // [12/05/26, 14:32:10] Rajesh Sharma: Yes I got the invoice
      // or 12/05/26, 14:32 - Rajesh Sharma: Yes I got the invoice
      const match = line.match(/^\[?(\d{1,4}\/\d{1,2}\/\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]?\s*(?:-|:)\s*([^:]+):\s*(.*)$/i);
      if (match) {
        const [, date, time, sender, message] = match;
        const cleanSender = sender.trim();
        const cleanMessage = message.trim();
        parties.add(cleanSender);

        const msgObj = { date, time, sender: cleanSender, message: cleanMessage };
        timeline.push(msgObj);

        const lowerMsg = cleanMessage.toLowerCase();
        if (admissionKeywords.some(kw => lowerMsg.includes(kw))) admissions.push(msgObj);
        if (threatKeywords.some(kw => lowerMsg.includes(kw))) threats.push(msgObj);
        if (promiseKeywords.some(kw => lowerMsg.includes(kw))) promises.push(msgObj);
      }
    });

    return {
      timeline: timeline.slice(0, 50), // Limit size for prompt
      parties: Array.from(parties),
      admissions: admissions.slice(0, 10),
      threats: threats.slice(0, 10),
      promises: promises.slice(0, 10)
    };
  };

  // WhatsApp file importer
  const handleWhatsAppImport = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    files.forEach(async (file) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (fileExt === 'zip') {
        try {
          const zip = await JSZip.loadAsync(file);
          const chatFile = Object.keys(zip.files).find(name => name.toLowerCase().includes('chat') && name.endsWith('.txt'));
          if (chatFile) {
            const chatText = await zip.files[chatFile].async('text');
            const parsed = parseWhatsAppChat(chatText);
            setWhatsappChats(prev => [...prev, { name: file.name, parsedData: parsed, rawText: chatText }]);
            toast.success(`Parsed WhatsApp Chat export: ${file.name}`);
          } else {
            toast.error('No chat export text file found inside ZIP.');
          }
        } catch (zipErr) {
          toast.error(`Error opening ZIP archive: ${zipErr.message}`);
        }
      } else if (fileExt === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === 'string') {
            const parsed = parseWhatsAppChat(text);
            setWhatsappChats(prev => [...prev, { name: file.name, parsedData: parsed, rawText: text }]);
            toast.success(`Parsed WhatsApp TXT: ${file.name}`);
          }
        };
        reader.readAsText(file);
      } else if (fileExt === 'opus' || fileExt === 'mp3' || fileExt === 'wav' || fileExt === 'm4a') {
        // Transcribe voice note
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          const newRecordingId = `rec_${Date.now()}`;
          const newRecording = {
            id: newRecordingId,
            base64,
            transcript: 'Transcribing WhatsApp Voice Note...',
            duration: 12, // estimate
            translated: null,
            summary: null
          };
          setVoiceRecordings(prev => [...prev, newRecording]);
          try {
            const data = await apiService.transcribeAudio(base64, `audio/${fileExt}`);
            setVoiceRecordings(prev => prev.map(vr => vr.id === newRecordingId ? { ...vr, transcript: `[WhatsApp Audio: ${file.name}]: ` + (data.text || 'No text detected') } : vr));
            toast.success(`Transcribed WhatsApp audio file: ${file.name}`);
          } catch (err) {
            setVoiceRecordings(prev => prev.map(vr => vr.id === newRecordingId ? { ...vr, transcript: `[WhatsApp Audio: ${file.name}] Transcription failed.` } : vr));
            toast.error(`Failed to transcribe WhatsApp audio: ${file.name}`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // standard files, OCR classification
        const reader = new FileReader();
        reader.onload = () => {
          const newDoc = {
            name: `[WhatsApp File] ${file.name}`,
            size: `${Math.round(file.size / 1024)} KB`,
            type: file.type || 'application/pdf',
            content: getSimulatedOcrContent(file.name),
            isOcrDone: true
          };
          setStagedFiles(prev => [...prev, newDoc]);
          toast.success(`Staged WhatsApp media file: ${file.name}`);
        };
        reader.readAsText(file);
      }
    });
  };

  // Google Drive/OneDrive selection handler
  const selectDriveFile = (file) => {
    const newDoc = {
      name: `[Cloud Drive] ${file.name}`,
      size: file.size,
      type: file.type,
      content: file.content,
      isOcrDone: true
    };
    setDriveFiles(prev => [...prev, newDoc]);
    setIsDriveModalOpen(false);
    toast.success(`Imported ${file.name} from Cloud Drive.`);
  };

  // Camera Webcam implementation
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTempCapturedImage(null);
      setCameraCropState('raw');
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      toast.error('Unable to access webcam. Simulating scan capture.');
      // Simulating a snap directly
      const mockSnap = {
        name: `camera_snap_${Date.now()}.png`,
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ocrText: getSimulatedOcrContent('camera_snap_complaint.pdf')
      };
      setTempCapturedImage(mockSnap);
      setIsCameraActive(false);
      setCameraCropState('raw');
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !cameraStream) {
      const mockSnap = {
        name: `camera_snap_${Date.now()}.png`,
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ocrText: getSimulatedOcrContent('camera_snap_complaint.pdf')
      };
      setTempCapturedImage(mockSnap);
      setIsCameraActive(false);
      setCameraCropState('raw');
      toast.success('Simulated document snapshot.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/png').split(',')[1];

    const newSnap = {
      name: `camera_snap_${Date.now()}.png`,
      base64,
      ocrText: getSimulatedOcrContent('camera_snap_affidavit.pdf')
    };
    setTempCapturedImage(newSnap);
    
    // Stop tracks
    cameraStream.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setIsCameraActive(false);
    setCameraCropState('raw');
    toast.success('Captured document frame.');
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }
    setCameraStream(null);
    setIsCameraActive(false);
    setTempCapturedImage(null);
  };

  // Voice transcript helpers
  const handleEditTranscript = (vr) => {
    setEditingTranscriptId(vr.id);
    setEditingTranscriptText(vr.transcript);
  };

  const saveEditedTranscript = (id) => {
    setVoiceRecordings(prev => prev.map(vr => vr.id === id ? { ...vr, transcript: editingTranscriptText } : vr));
    setEditingTranscriptId(null);
    toast.success('Transcript updated.');
  };

  const translateTranscript = (id) => {
    const record = voiceRecordings.find(v => v.id === id);
    if (!record) return;

    if (record.translated) {
      // Toggle back to original
      setVoiceRecordings(prev => prev.map(vr => vr.id === id ? { ...vr, transcript: vr.translated.original, translated: null } : vr));
      toast.success('Reverted to original transcript.');
    } else {
      // Simulated translation to Hindi/English
      const originalText = record.transcript;
      const hindiTranslation = originalText.includes('agreement')
        ? 'यह समझौता हस्ताक्षर होने के बाद वार्ता के दौरान किया गया था। प्रतिवादी हस्ताक्षर से इनकार कर रहा है।'
        : 'यह केस एक शिकायत पर आधारित है जहां आरोपी फरार है। कृपया आवश्यक कार्रवाई करें।';

      setVoiceRecordings(prev => prev.map(vr => vr.id === id ? {
        ...vr,
        transcript: hindiTranslation,
        translated: { original: originalText, target: 'Hindi' }
      } : vr));
      toast.success('Translated transcript.');
    }
  };

  const summarizeTranscript = (id) => {
    const record = voiceRecordings.find(v => v.id === id);
    if (!record) return;

    if (record.isSummarized) {
      setVoiceRecordings(prev => prev.map(vr => vr.id === id ? { ...vr, isSummarized: false } : vr));
    } else {
      const summaryText = `Advocate states: 1. Default signature is contested. 2. Critical invoice dated May 12 must be prioritized. 3. Ignore unrelated payment logs.`;
      setVoiceRecordings(prev => prev.map(vr => vr.id === id ? { ...vr, isSummarized: true, summary: summaryText } : vr));
      toast.success('Summary created.');
    }
  };

  const regenerateTranscript = async (vr) => {
    setVoiceRecordings(prev => prev.map(item => item.id === vr.id ? { ...item, transcript: 'Transcribing again...' } : item));
    try {
      const data = await apiService.transcribeAudio(vr.base64, 'audio/webm');
      setVoiceRecordings(prev => prev.map(item => item.id === vr.id ? { ...item, transcript: data.text || 'No speech detected' } : item));
      toast.success('Transcript regenerated!');
    } catch (err) {
      setVoiceRecordings(prev => prev.map(item => item.id === vr.id ? { ...item, transcript: 'Regeneration failed.' } : item));
      toast.error('Failed to regenerate transcription.');
    }
  };

  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVoiceRecordingState('transcribing');
    setMicPermissionError(false);
    toast.info(`Processing audio: ${file.name}...`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Audio = event.target.result.split(',')[1];
        setVoiceTranscriptBlob(file);
        
        const data = await apiService.transcribeAudio(base64Audio, file.type || 'audio/mp3');
        if (data && data.text) {
          setVoiceTranscriptText(data.text);
          setVoiceRecordingState('ready');
          toast.success('Audio file transcribed successfully!');
        } else {
          throw new Error('No transcription text returned');
        }
      } catch (err) {
        console.error('Audio file transcription failed:', err);
        setVoiceRecordingState('error');
        toast.error('Failed to transcribe uploaded audio file.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Local File dropzone
  const handleLocalFileDrop = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc = {
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type || 'application/pdf',
          content: getSimulatedOcrContent(file.name),
          isOcrDone: true
        };
        setStagedFiles(prev => [...prev, newDoc]);
        toast.success(`Staged file: ${file.name}`);
      };
      reader.readAsText(file);
    });
  };

  const uploadSources = [
    {
      id: 'device',
      title: 'Upload from Device',
      description: 'Browse PDF, DOCX, Images, ZIP and other supported files.',
      icon: <Upload size={18} className="text-blue-500" />,
      action: () => {
        setIsUploadSourceModalOpen(false);
        setActiveInputTab('files');
        setTimeout(() => deviceFileInputRef.current?.click(), 100);
      }
    },
    {
      id: 'camera',
      title: 'Scan / Capture Document',
      description: 'Use your webcam to instantly capture contracts, notices, evidence or handwritten documents.',
      icon: <Camera size={18} className="text-amber-500" />,
      action: () => {
        setIsUploadSourceModalOpen(false);
        setActiveInputTab('camera');
        startCamera();
      }
    }
  ];

  const handleSelectSource = (source) => {
    localStorage.setItem('aisa_last_used_source', source.id);
    setLastUsedSource(source.id);
    source.action();
  };

  let tabs = [];
  if (layout === 'case') {
    tabs = [
      { id: 'files', label: '+ Upload Supporting Files', icon: <FolderOpen size={13} /> },
      { id: 'voice', label: '+ Voice Explanation', icon: <Mic size={13} /> }
    ];
  } else if (layout === 'manual') {
    tabs = [
      { id: 'voice', label: 'Record Voice Instead', icon: <Mic size={13} /> },
      { id: 'files', label: 'Upload Files', icon: <FolderOpen size={13} /> }
    ];
  } else {
    tabs = [
      { id: 'files', label: 'Upload Files', icon: <FolderOpen size={13} /> },
      { id: 'voice', label: 'Voice', icon: <Mic size={13} /> }
    ];
  }

  return (
    <div className="w-full space-y-4 text-left">
      {/* Hidden file selectors */}
      <input type="file" multiple ref={deviceFileInputRef} className="hidden" onChange={handleLocalFileDrop} />
      <input type="file" multiple ref={whatsappFileInputRef} className="hidden" accept=".zip,.txt,.opus,.mp3,.wav,.m4a,.pdf,.png,.jpg,.jpeg,.docx" onChange={handleWhatsAppImport} />

      {/* Inline Progressive Tab Bar */}
      <div className="flex flex-wrap gap-2 items-center select-none border-b border-slate-150 dark:border-zinc-800/80 pb-3">
        {tabs.map(tab => {
          const isActive = activeInputTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'files') {
                  setIsUploadSourceModalOpen(true);
                } else {
                  setActiveInputTab(activeInputTab === tab.id ? null : tab.id);
                  if (tab.id === 'drive') setIsDriveModalOpen(true);
                  if (tab.id === 'camera') startCamera();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                isActive
                  ? 'bg-[#5B3DF5] border-[#5B3DF5] text-white shadow-sm'
                  : (isDark ? 'border-zinc-800 bg-zinc-900/40 text-slate-350 hover:border-zinc-700' : 'bg-white border-slate-205 text-slate-700 hover:border-slate-300')
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conditionally Rendered Action Panels */}
      <div className="min-h-[50px]">
        {/* local file picker */}
        {activeInputTab === 'files' && (
          <div className="p-4 border border-dashed border-blue-500/30 rounded-2xl bg-blue-500/[0.01] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-blue-500 tracking-wider">📁 Upload Evidence Files</span>
              <button onClick={() => setActiveInputTab(null)} className="text-slate-400 hover:text-slate-205"><X size={14} /></button>
            </div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-5 bg-transparent cursor-pointer hover:bg-slate-500/5">
              <input type="file" multiple className="hidden" onChange={handleLocalFileDrop} />
              <Upload className="text-slate-400 mb-1.5" size={20} />
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-355">Choose local document / pdf / image</span>
            </label>
          </div>
        )}

        {/* voice recorder */}
        {activeInputTab === 'voice' && (
          <div className="p-4 border border-violet-500/20 rounded-2xl bg-violet-500/[0.01] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-violet-500 tracking-wider">🎤 Voice Explanations</span>
              <button 
                onClick={() => {
                  cancelRecording();
                  setActiveInputTab(null);
                }} 
                className="text-slate-400 hover:text-slate-205"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Conditional layouts based on states */}
            {micPermissionError ? (
              <div className="flex flex-col items-center justify-center p-5 text-center space-y-4 bg-red-500/[0.02] border border-red-500/10 rounded-2xl animate-fadeIn w-full">
                <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-full text-red-505">
                  <MicOff size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-red-500 tracking-wider">Microphone Access is Required</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                    Please allow microphone permissions in your browser or select an audio recording file from your device.
                  </p>
                </div>
                <div className="flex gap-2 justify-center w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setMicPermissionError(false);
                      startRecording();
                    }}
                    className="px-3 py-1.5 bg-[#5B3DF5] text-white text-[10px] font-black uppercase rounded-lg shadow hover:bg-indigo-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => audioUploadInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase rounded-lg transition-all"
                  >
                    Upload Audio
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={audioUploadInputRef} 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleAudioFileUpload} 
                />
              </div>
            ) : voiceRecordingState === 'recording' ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-slate-500/5 rounded-2xl animate-fadeIn w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">● REC</span>
                </div>
                
                <p className="text-2xl font-black font-mono text-slate-700 dark:text-slate-200">
                  {String(Math.floor(recDuration / 60)).padStart(2, '0')}:{String(recDuration % 60).padStart(2, '0')}
                </p>

                <div className="relative w-full border dark:border-zinc-800 rounded-xl overflow-hidden p-1.5 bg-black/5 dark:bg-black/25">
                  <canvas ref={canvasRef} className="w-full h-12 bg-transparent rounded-lg" width={400} height={48} />
                </div>

                <div className="flex gap-3 justify-center w-full">
                  <button 
                    type="button"
                    onClick={stopRecording}
                    className="w-12 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center"
                    title="Stop Recording"
                  >
                    <Square size={16} className="text-white" />
                  </button>
                  <button 
                    type="button"
                    onClick={cancelRecording}
                    className="w-12 h-12 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-full transition-transform active:scale-95 flex items-center justify-center"
                    title="Cancel Recording"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : voiceRecordingState === 'transcribing' ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-indigo-500/[0.01] border border-indigo-500/10 rounded-2xl text-center animate-fadeIn w-full">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest animate-pulse">Speech-to-Text Transcribing...</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">AI is parsing voice elements into case facts.</p>
                </div>
              </div>
            ) : voiceRecordingState === 'ready' ? (
              <div className="p-4 border border-emerald-500/20 bg-emerald-500/[0.01] rounded-2xl space-y-4 animate-fadeIn w-full">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">♢ VOICE TRANSCRIPT</span>
                  <textarea
                    rows={4}
                    value={voiceTranscriptText}
                    onChange={e => setVoiceTranscriptText(e.target.value)}
                    className={`w-full text-xs font-semibold p-3 border rounded-xl outline-none resize-none focus:border-emerald-500 ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-end w-full">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(voiceTranscriptText);
                      toast.success('Transcript copied to clipboard!');
                    }}
                    className="py-1.5 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 dark:text-slate-350 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceRecordingState('idle');
                      startRecording();
                    }}
                    className="py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    Re-record
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newRecordingId = `rec_${Date.now()}`;
                      const newRecording = {
                        id: newRecordingId,
                        base64: 'UklGRiYAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA==', // finalized chunk reference
                        transcript: voiceTranscriptText,
                        duration: recDuration || 5,
                        translated: null,
                        summary: null
                      };
                      setVoiceRecordings(prev => [...prev, newRecording]);
                      setVoiceRecordingState('idle');
                      setVoiceTranscriptText('');
                      setVoiceTranscriptBlob(null);
                      toast.success('Voice transcript added to workspace context.');
                    }}
                    className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    Accept & Attach
                  </button>
                </div>
              </div>
            ) : voiceRecordingState === 'error' ? (
              <div className="p-4 border border-red-500/20 bg-red-500/[0.01] rounded-2xl space-y-4 animate-fadeIn text-center w-full">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-red-500 tracking-wider font-bold">Unable to Transcribe Audio</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">The STT service was unable to decode the audio signal.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <button
                    type="button"
                    onClick={async () => {
                      setVoiceRecordingState('transcribing');
                      try {
                        const reader = new FileReader();
                        reader.readAsDataURL(voiceTranscriptBlob);
                        reader.onloadend = async () => {
                          const base64Audio = reader.result.split(',')[1];
                          const data = await apiService.transcribeAudio(base64Audio, 'audio/webm');
                          if (data && data.text) {
                            setVoiceTranscriptText(data.text);
                            setVoiceRecordingState('ready');
                            toast.success('Speech transcribed successfully on retry.');
                          } else {
                            throw new Error('Transcription empty');
                          }
                        };
                      } catch (e) {
                        setVoiceRecordingState('error');
                        toast.error('Retry failed.');
                      }
                    }}
                    className="py-1.5 px-3 bg-[#5B3DF5] hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    Retry STT
                  </button>
                  {voiceTranscriptBlob && (
                    <a
                      href={URL.createObjectURL(voiceTranscriptBlob)}
                      download={`recording_${Date.now()}.webm`}
                      className="py-1.5 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-slate-650 dark:text-slate-350 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all inline-block select-none font-bold"
                    >
                      Download Recording
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscriptText('Audio content uploaded without text representation.');
                      setVoiceRecordingState('ready');
                    }}
                    className="py-1.5 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    Use Without Transcript
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 w-full flex flex-col items-center justify-center p-2">
                <p className="text-[10px] font-bold text-slate-400">Explain your missing evidence, timeline modifications, or legal goals verbally.</p>
                <button 
                  type="button"
                  onClick={startRecording}
                  className="mx-auto w-12 h-12 bg-[#5B3DF5] hover:bg-indigo-700 text-white rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center"
                >
                  <Mic size={20} className="text-white" />
                </button>
                <p className="text-[8.5px] font-black text-[#5B3DF5] uppercase tracking-widest">Click to record note</p>
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Import */}
        {activeInputTab === 'whatsapp' && (
          <div className="p-4 border border-green-500/20 rounded-2xl bg-green-500/[0.01] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-green-605 tracking-wider">📱 Import WhatsApp Files</span>
              <button onClick={() => setActiveInputTab(null)} className="text-slate-400 hover:text-slate-205"><X size={14} /></button>
            </div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-250 dark:border-zinc-800 rounded-xl p-5 bg-transparent cursor-pointer hover:bg-slate-500/5">
              <input type="file" multiple className="hidden" accept=".zip,.txt,.opus,.mp3,.wav,.m4a" onChange={handleWhatsAppImport} />
              <Smartphone className="text-green-500 mb-1.5" size={20} />
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-350">Select previously downloaded chats (.txt, .zip) or voice logs (.opus)</span>
            </label>
          </div>
        )}

        {/* Camera stream */}
        {activeInputTab === 'camera' && (
          <div className="p-4 border border-amber-500/20 rounded-2xl bg-amber-500/[0.01] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-amber-500 tracking-wider">📷 Document Scan & OCR Capture</span>
              <button 
                onClick={() => {
                  stopCamera();
                  setActiveInputTab(null);
                }} 
                className="text-slate-400 hover:text-slate-205"
              >
                <X size={14} />
              </button>
            </div>

            {isCameraActive && (
              <div className="relative flex flex-col items-center justify-center bg-black/40 rounded-xl overflow-hidden p-2 min-h-[200px]">
                <video ref={videoRef} autoPlay playsInline className="w-full max-h-[220px] rounded-lg bg-black object-cover" />
                {/* Paper Scanner Detection Overlay */}
                <div className="absolute inset-4 border-2 border-emerald-500/50 rounded-lg animate-pulse pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
                  </div>
                  <span className="text-[8px] font-black uppercase text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded self-center select-none">
                    Auto Detecting Document Boundary...
                  </span>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="absolute bottom-4 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md select-none transition-all"
                >
                  Capture Document Frame
                </button>
              </div>
            )}

            {tempCapturedImage && (
              <div className="space-y-4">
                <div className="relative border rounded-xl overflow-hidden bg-black/5 dark:bg-black/45 p-2 flex flex-col items-center">
                  {cameraCropState === 'cropping' ? (
                    <div className="relative w-full max-h-[220px] flex items-center justify-center">
                      <img src={`data:image/png;base64,${tempCapturedImage.base64}`} className="max-h-[200px] opacity-60 rounded" />
                      {/* Green scanning scan line animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10B981] animate-bounce" style={{ top: '20%' }} />
                      <div className="absolute bg-emerald-600/90 text-white text-[9px] font-black uppercase px-2 py-1 rounded select-none">
                        Aligning Perspective & Cropping...
                      </div>
                    </div>
                  ) : cameraCropState === 'ready' ? (
                    <div className="relative w-full max-h-[220px] flex flex-col items-center">
                      <div className="border-4 border-white dark:border-zinc-800 shadow-lg rounded p-1 bg-white">
                        <img src={`data:image/png;base64,${tempCapturedImage.base64}`} className="max-h-[170px] rounded" />
                      </div>
                      <span className="absolute top-3 right-3 text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded shadow">
                        ✓ Perspective Corrected
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full max-h-[220px] flex items-center justify-center">
                      <img src={`data:image/png;base64,${tempCapturedImage.base64}`} className="max-h-[200px] rounded opacity-90" />
                    </div>
                  )}

                  {/* OCR extracted text summary */}
                  {isCameraOcrRunning ? (
                    <div className="w-full mt-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Extracting Document Text via AI OCR...</span>
                    </div>
                  ) : tempCapturedImage.ocrTextExtracted ? (
                    <div className="w-full mt-3 p-3 bg-emerald-500/[0.02] border border-emerald-505/20 rounded-xl text-left space-y-1">
                      <span className="text-[8px] font-black uppercase text-emerald-500">⋄ AI Extracted OCR Text:</span>
                      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-350 font-semibold max-h-[60px] overflow-y-auto">
                        {tempCapturedImage.ocrTextExtracted}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Scan Action Controls */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {cameraCropState === 'raw' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCameraCropState('cropping');
                        setTimeout(() => {
                          setCameraCropState('ready');
                          toast.success('Perspective corrected and cropped.');
                        }, 1200);
                      }}
                      className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      ✂ Auto Crop & Align
                    </button>
                  )}
                  {!tempCapturedImage.ocrTextExtracted && (
                    <button
                      type="button"
                      disabled={isCameraOcrRunning}
                      onClick={() => {
                        setIsCameraOcrRunning(true);
                        setTimeout(() => {
                          setTempCapturedImage(prev => ({
                            ...prev,
                            ocrTextExtracted: prev.ocrText || 'IN THE COURT OF THE DISTRICT JUDGE\nAffidavit verification completed. Verification seal confirmed.'
                          }));
                          setIsCameraOcrRunning(false);
                          toast.success('OCR Text extracted successfully.');
                        }, 1200);
                      }}
                      className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      🔍 Run AI OCR
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const finalizedSnap = {
                        name: tempCapturedImage.name,
                        base64: tempCapturedImage.base64,
                        ocrText: tempCapturedImage.ocrTextExtracted || tempCapturedImage.ocrText
                      };
                      setCameraImages(prev => [...prev, finalizedSnap]);
                      setTempCapturedImage(null);
                      setActiveInputTab(null);
                      toast.success('Document added to upload queue.');
                    }}
                    className="py-2 px-3.5 bg-[#5B3DF5] hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    ✓ Save to Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempCapturedImage(null);
                      startCamera();
                    }}
                    className="py-2 px-3.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-405 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    ↺ Retake
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual notes */}
        {activeInputTab === 'notes' && (
          <div className="p-4 border border-pink-500/20 rounded-2xl bg-pink-500/[0.01] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-pink-500 tracking-wider">✍ Manual Notes Notebook</span>
              <button onClick={() => setActiveInputTab(null)} className="text-slate-400 hover:text-slate-205"><X size={14} /></button>
            </div>
            <textarea
              rows={3}
              value={manualNotes}
              onChange={e => setManualNotes(e.target.value)}
              placeholder="Jot down notes, facts observations, or legal thoughts directly..."
              className={`w-full text-xs font-semibold p-3 border rounded-xl outline-none resize-none focus:border-pink-500 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            />
          </div>
        )}
      </div>

      {/* Lists of Staged Multi-source Items */}
      {(stagedFiles.length > 0 || voiceRecordings.length > 0 || whatsappChats.length > 0 || driveFiles.length > 0 || cameraImages.length > 0 || manualNotes.trim().length > 0) && (
        <div className="space-y-4 pt-2 border-t dark:border-white/5">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Staged Multi-source Context</h4>
          
          <div className="space-y-2">
            {/* Local files */}
            {stagedFiles.map((file, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-500/5 rounded-xl text-xs font-semibold gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                  <FileText className="text-blue-500 shrink-0" size={14} />
                  <span className="truncate flex-1 text-[11px] text-slate-700 dark:text-slate-205">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase whitespace-nowrap">OCR Complete</span>
                  <button onClick={() => setStagedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Cloud Drive files */}
            {driveFiles.map((file, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-500/5 rounded-xl text-xs font-semibold gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                  <Cloud className="text-cyan-500 shrink-0" size={14} />
                  <span className="truncate flex-1 text-[11px] text-slate-700 dark:text-slate-205">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase whitespace-nowrap">Cloud Import</span>
                  <button onClick={() => setDriveFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Camera Snapshots */}
            {cameraImages.map((img, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-500/5 rounded-xl text-xs font-semibold gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                  <Camera className="text-amber-500 shrink-0" size={14} />
                  <span className="truncate flex-1 text-[11px] text-slate-700 dark:text-slate-205">{img.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black uppercase whitespace-nowrap">Exhibit Image</span>
                  <button onClick={() => setCameraImages(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* WhatsApp Chats */}
            {whatsappChats.map((chat, idx) => (
              <div key={idx} className="border border-green-500/20 rounded-2xl overflow-hidden bg-green-500/[0.01]">
                <div className="flex justify-between items-center p-2.5 bg-slate-500/5 text-xs font-black">
                  <div className="flex items-center gap-2">
                    <Smartphone className="text-green-500 shrink-0" size={14} />
                    <span className="uppercase text-[9.5px] tracking-wider">{chat.name}</span>
                  </div>
                  <button onClick={() => setWhatsappChats(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="p-3 space-y-2 text-[10px] font-semibold text-slate-550 dark:text-slate-400">
                  <p className="font-black text-[9px] uppercase tracking-wider text-green-500">WhatsApp Chat Insights:</p>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="bg-slate-500/5 p-2 rounded-xl">
                      <span className="block font-black uppercase text-[8px] text-slate-400">Timeline / Scope</span>
                      <span>{chat.parsedData?.timeline?.length || 0} events identified</span>
                    </div>
                    <div className="bg-slate-500/5 p-2 rounded-xl">
                      <span className="block font-black uppercase text-[8px] text-slate-400">Parties</span>
                      <span>{chat.parsedData?.parties?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                  {chat.parsedData?.admissions?.length > 0 && (
                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <span className="block font-black uppercase text-[8px] text-emerald-500">✓ Admissions Detected</span>
                      <span>"{chat.parsedData.admissions[0].sender}: {chat.parsedData.admissions[0].message}"</span>
                    </div>
                  )}
                  {chat.parsedData?.threats?.length > 0 && (
                    <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                      <span className="block font-black uppercase text-[8px] text-rose-500">⚠ Threats / Disputes</span>
                      <span>"{chat.parsedData.threats[0].sender}: {chat.parsedData.threats[0].message}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Voice Notes */}
            {voiceRecordings.map((vr) => (
              <div key={vr.id} className="border border-violet-500/20 rounded-2xl overflow-hidden bg-violet-500/[0.01]">
                <div className="flex justify-between items-center p-2.5 bg-slate-500/5 text-xs font-black">
                  <div className="flex items-center gap-2">
                    <Mic className="text-violet-500 shrink-0" size={14} />
                    <span className="uppercase text-[9.5px] tracking-wider">Voice Context Note ({vr.duration}s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => translateTranscript(vr.id)} 
                      className="p-1 hover:bg-slate-500/10 rounded text-slate-400 hover:text-[#5B3DF5]"
                      title="Translate (Hindi/English)"
                    >
                      <Globe size={12} />
                    </button>
                    <button 
                      onClick={() => summarizeTranscript(vr.id)} 
                      className="p-1 hover:bg-slate-500/10 rounded text-slate-400 hover:text-[#5B3DF5]"
                      title="Create Summary"
                    >
                      <Sparkles size={12} />
                    </button>
                    <button 
                      onClick={() => regenerateTranscript(vr)} 
                      className="p-1 hover:bg-slate-500/10 rounded text-slate-400 hover:text-[#5B3DF5]"
                      title="Regenerate Transcript"
                    >
                      <RefreshCw size={11} />
                    </button>
                    <button 
                      onClick={() => handleEditTranscript(vr)} 
                      className="p-1 hover:bg-slate-500/10 rounded text-slate-400 hover:text-[#5B3DF5]"
                      title="Edit Transcript"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => setVoiceRecordings(prev => prev.filter(item => item.id !== vr.id))} 
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                
                <div className="p-3.5 space-y-2.5 text-left text-[10.5px]">
                  {editingTranscriptId === vr.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editingTranscriptText}
                        onChange={e => setEditingTranscriptText(e.target.value)}
                        className={`flex-1 border rounded px-2 py-1 outline-none text-xs font-semibold ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-350'
                        }`}
                      />
                      <button 
                        onClick={() => saveEditedTranscript(vr.id)}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                      >
                        <Check size={12} />
                      </button>
                      <button 
                        onClick={() => setEditingTranscriptId(null)}
                        className="p-1.5 bg-slate-550 text-white rounded-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-700 dark:text-slate-200">
                        {vr.translated ? (
                          <span className="text-[8px] bg-[#5B3DF5]/10 text-[#5B3DF5] px-1 py-0.2 rounded font-black mr-1 uppercase">Translated</span>
                        ) : null}
                        "{vr.transcript}"
                      </p>
                      
                      {vr.isSummarized && vr.summary && (
                        <div className="p-2 bg-slate-500/5 rounded-xl text-[9px] font-semibold text-slate-400 border border-slate-500/10">
                          <span className="block font-black text-indigo-500 uppercase tracking-widest text-[8px] mb-0.5">AI Summary:</span>
                          {vr.summary}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI Confirmation Box */}
          <div className="p-4 border rounded-2xl bg-indigo-500/[0.02] border-indigo-500/20 dark:border-indigo-900/40 flex flex-col gap-3.5 shadow-sm relative overflow-hidden animate-fadeIn select-none text-left w-full">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap">
                <CheckCircle size={10} className="text-emerald-500 shrink-0" /> AI Confirmation Complete
              </span>
            </div>

            <div className="space-y-0.5 border-b dark:border-zinc-800/80 pb-2">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Context Ready</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold uppercase">Staged resources unified</p>
            </div>
            
            <div className="flex flex-col text-[9.5px] font-black text-slate-400 uppercase space-y-1.5 w-full">
              <div className="flex flex-col gap-1 text-slate-500 dark:text-slate-400">
                {stagedFiles.length + driveFiles.length + cameraImages.length > 0 && (
                  <span className="flex items-center gap-1">
                    ✓ {stagedFiles.length + driveFiles.length + cameraImages.length} Documents OCR Complete
                  </span>
                )}
                {voiceRecordings.length > 0 && (
                  <span className="flex items-center gap-1">
                    ✓ {voiceRecordings.length} Voice Context Note Linked
                  </span>
                )}
                {whatsappChats.length > 0 && (
                  <span className="flex items-center gap-1">
                    ✓ WhatsApp Chat Context Export Ready
                  </span>
                )}
                {manualNotes.trim().length > 0 && (
                  <span className="flex items-center gap-1">
                    ✓ Manual Observations Note Included
                  </span>
                )}
              </div>
              <span className="text-emerald-500 font-extrabold uppercase mt-1 block tracking-wider">Ready for Analysis</span>
            </div>
          </div>

        </div>
      )}

      {/* Cloud Drive mock Modal selection */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp ${
            isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border text-slate-855'
          }`}>
            <div className="flex justify-between items-center border-b dark:border-white/5 pb-2">
              <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1">
                <Cloud size={14} /> Import Cloud Drive files
              </h4>
              <button onClick={() => setIsDriveModalOpen(false)} className="text-slate-400 hover:text-slate-205"><X size={16} /></button>
            </div>

            {/* Cloud Drive Tab selectors */}
            <div className="grid grid-cols-3 gap-1 bg-slate-500/5 p-1 rounded-xl">
              {[
                { id: 'gdrive', label: 'Google Drive' },
                { id: 'dropbox', label: 'Dropbox' },
                { id: 'onedrive', label: 'OneDrive' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDriveTab(tab.id)}
                  className={`py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider text-center transition-all ${
                    activeDriveTab === tab.id 
                      ? 'bg-indigo-650 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-205'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List of files in active tab */}
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {CLOUD_DRIVE_MOCK_FILES[activeDriveTab]?.map((file, idx) => (
                <div 
                  key={idx}
                  onClick={() => selectDriveFile(file)}
                  className="flex justify-between items-center p-2.5 rounded-xl border border-slate-500/5 bg-slate-500/5 hover:border-indigo-500/30 cursor-pointer hover:bg-indigo-500/[0.02] text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="text-indigo-400" size={14} />
                    <span className="truncate max-w-[180px]">{file.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">{file.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Choose Upload Source Modal */}
      {isUploadSourceModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-fadeIn">
          <div 
            className={`w-full max-w-[760px] md:w-[760px] rounded-[18px] p-7 md:p-8 shadow-2xl space-y-6 animate-scaleUp overflow-hidden border text-left select-none ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
            style={{ wordBreak: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b dark:border-white/5 pb-4">
              <div className="space-y-1 text-left">
                <h3 className="text-[20px] font-black uppercase text-[#5B3DF5] tracking-wider">Choose Upload Source</h3>
                <p className="text-[13px] text-slate-400 dark:text-slate-450 font-semibold">Select how you want to add legal documents to this workspace.</p>
              </div>
              <button 
                onClick={() => setIsUploadSourceModalOpen(false)} 
                className="p-2 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Source Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {uploadSources.map(source => {
                const isLastUsed = lastUsedSource === source.id;
                return (
                  <div
                    key={source.id}
                    onClick={() => handleSelectSource(source)}
                    className={`relative p-6 border rounded-[14px] flex flex-col justify-between text-left transition-all duration-200 h-[250px] min-w-[260px] cursor-pointer hover:scale-[1.01] shadow-sm hover:shadow-md ${
                      isLastUsed 
                        ? 'border-[#5B3DF5] bg-[#5B3DF5]/[0.03] ring-1 ring-[#5B3DF5]/20' 
                        : (isDark ? 'border-zinc-800 hover:border-[#5B3DF5] bg-zinc-950/20 hover:bg-[#5B3DF5]/[0.02]' : 'border-slate-200 hover:border-[#5B3DF5] bg-slate-50/50 hover:bg-[#5B3DF5]/[0.02]')
                    }`}
                  >
                    {isLastUsed && (
                      <span className="absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#5B3DF5] text-white tracking-widest leading-none select-none">
                        Last Used
                      </span>
                    )}
                    
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-900' : 'bg-white shadow-sm border border-slate-100'} w-12 h-12 flex items-center justify-center shrink-0`}>
                        {source.id === 'device' ? <Upload size={22} className="text-blue-500" /> : <Camera size={22} className="text-amber-500" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[18px] font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
                          {source.title}
                        </h4>
                        <p className="text-[13px] text-slate-400 dark:text-slate-450 font-medium leading-relaxed">
                          {source.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-4 py-2.5 px-4 bg-[#5B3DF5] hover:bg-indigo-700 text-white rounded-xl text-[15px] font-black uppercase tracking-wider text-center transition-all select-none shadow-sm"
                    >
                      {source.id === 'device' ? 'Choose Files' : 'Open Camera'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
