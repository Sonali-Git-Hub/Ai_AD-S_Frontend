import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Paperclip, X, FileText, Image as ImageIcon, Cloud, HardDrive, Edit2, Download, Mic, Wand2, Eye, FileSpreadsheet, Presentation, File, MoreVertical, Trash2, Check, Camera, Video, Copy, ThumbsUp, ThumbsDown, Share, Search, Undo2, Menu as MenuIcon, Volume2, Pause, Headphones, MessageCircle, ExternalLink } from 'lucide-react';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { generateChatResponse } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import { useLanguage } from '../context/LanguageContext';
import { useRecoilState } from 'recoil';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../Components/Loader/Loader';
import toast from 'react-hot-toast';
import LiveAI from '../Components/LiveAI';

import ImageEditor from '../Components/ImageEditor';
import ModelSelector from '../Components/ModelSelector';
import axios from 'axios';
import { apis } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { detectMode, getModeName, getModeIcon, getModeColor, MODES } from '../utils/modeDetection';
import { getUserData, sessionsData, toggleState } from '../userStore/userData';
import { usePersonalization } from '../context/PersonalizationContext';


const WELCOME_MESSAGE = "Hello! I’m AISA™, your Artificial Intelligence Super Assistant.";

const FEEDBACK_PROMPTS = {
  en: [
    "Was this helpful?",
    "How did I do?",
    "Is this answer detailed enough?",
    "Did I answer your question?",
    "Need anything else?",
    "Is this what you were looking for?",
    "Happy to help!",
    "Let me know if you need more info",
    "Any other questions?",
    "Hope this clears things up!"
  ],
  hi: [
    "क्या यह मददगार था?",
    "मैंने कैसा किया?",
    "क्या यह जवाब पर्याप्त है?",
    "क्या मैंने आपके सवाल का जवाब दिया?",
    "कुछ और चाहिए?",
    "क्या आप यही खोज रहे थे?",
    "मदद करके खुशी हुई!",
    "अगर और जानकारी चाहिए तो बताएं",
    "कोई और सवाल?",
    "उम्मीद है यह समझ आया!"
  ]
};

const TOOL_PRICING = {
  chat: {
    models: [
      { id: 'gemini-flash', name: 'Gemini Flash', price: 0, speed: 'Fast', description: 'Free chat model' }
    ]
  },
  image: {
    models: [
      { id: 'gemini-flash', name: 'Gemini Flash', price: 0, speed: 'Fast', description: 'Basic image analysis' },
      { id: 'gemini-pro', name: 'Gemini Pro Vision', price: 0.02, speed: 'Medium', description: 'Advanced image understanding' },
      { id: 'gpt4-vision', name: 'GPT-4 Vision', price: 0.05, speed: 'Slow', description: 'Premium image analysis' }
    ]
  },
  document: {
    models: [
      { id: 'gemini-flash', name: 'Gemini Flash', price: 0, speed: 'Fast', description: 'Basic document analysis' },
      { id: 'gemini-pro', name: 'Gemini Pro', price: 0.02, speed: 'Medium', description: 'Advanced document processing' },
      { id: 'gpt4', name: 'GPT-4', price: 0.03, speed: 'Medium', description: 'Premium document analysis' }
    ]
  },
  voice: {
    models: [
      { id: 'gemini-flash', name: 'Gemini Flash', price: 0, speed: 'Fast', description: 'Standard voice recognition' }
    ]
  }
};

const Chat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { personalizations, getSystemPromptExtensions } = usePersonalization();

  const [messages, setMessages] = useState([]);
  const [excelHTML, setExcelHTML] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [sessions, setSessions] = useRecoilState(sessionsData);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
  const [tglState, setTglState] = useRecoilState(toggleState);
  const [typingMessageId, setTypingMessageId] = useState(null);

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [activeAgent, setActiveAgent] = useState({ name: 'AISA™', category: 'General' });
  const [userAgents, setUserAgents] = useState([]);
  const [toolModels, setToolModels] = useState({
    chat: 'gemini-flash',
    image: 'gemini-flash',
    document: 'gemini-flash',
    voice: 'gemini-flash'
  });
  const uploadInputRef = useRef(null);
  const driveInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Attachment Menu State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const timerRef = useRef(null);
  const attachBtnRef = useRef(null);
  const menuRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState(null);
  const [currentMode, setCurrentMode] = useState('NORMAL_CHAT');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isImageGeneration, setIsImageGeneration] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAudioConvertMode, setIsAudioConvertMode] = useState(false);
  const abortControllerRef = useRef(null);
  const voiceUsedRef = useRef(false); // Track if voice input was used
  const inputRef = useRef(null); // Ref for textarea input
  const transcriptRef = useRef(''); // Ref for speech transcript
  const isManualStopRef = useRef(false); // Track manual stop to avoid recursive loops

  const toolsBtnRef = useRef(null);
  const toolsMenuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Attach Menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        attachBtnRef.current &&
        !attachBtnRef.current.contains(event.target)
      ) {
        setIsAttachMenuOpen(false);
      }

      // Close Tools Menu
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target) &&
        toolsBtnRef.current &&
        !toolsBtnRef.current.contains(event.target)
      ) {
        setIsToolsMenuOpen(false);
      }
    };

    if (isAttachMenuOpen || isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachMenuOpen, isToolsMenuOpen]);

  const processFile = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    setSelectedFiles(prev => [...prev, file]);

    // Generate Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews(prev => [...prev, {
        url: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
        id: Math.random().toString(36).substr(2, 9)
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => processFile(file));
  };

  const handlePaste = (e) => {
    // Handle files pasted from file system
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      const files = Array.from(e.clipboardData.files);
      files.forEach(file => processFile(file));
      return;
    }

    // Handle pasted data items
    if (e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
          }
        }
      }
    }
  };

  const handleRemoveFile = (id) => {
    if (id) {
      // Find the file name to remove from selectedFiles
      const previewToRemove = filePreviews.find(p => p.id === id);
      if (previewToRemove) {
        setSelectedFiles(prev => prev.filter(f => f.name !== previewToRemove.name));
        setFilePreviews(prev => prev.filter(p => p.id !== id));
      }
    } else {
      // Clear all
      setSelectedFiles([]);
      setFilePreviews([]);
    }
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (driveInputRef.current) driveInputRef.current.value = '';
    if (photosInputRef.current) photosInputRef.current.value = '';
  };

  const handleAttachmentSelect = (type) => {
    setIsAttachMenuOpen(false);
    if (type === 'upload') {
      uploadInputRef.current?.click();
    } else if (type === 'photos') {
      photosInputRef.current?.click();
    } else if (type === 'drive') {
      driveInputRef.current?.click();
    } else if (type === 'doc-voice') {
      document.getElementById('doc-voice-upload')?.click();
    }
  };

  const handleDocToVoiceSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAttachMenuOpen(false);

    // 1. Show User Message immediately with the file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result; // Full Data URL for display
      const base64Data = base64Content.split(',')[1]; // Raw base64 for backend

      // Add User Message
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Please convert this document to audio: **${file.name}**`,
        timestamp: new Date(),
        attachments: [{
          url: base64Content,
          name: file.name,
          type: file.type
        }]
      };
      setMessages(prev => [...prev, userMsg]);

      // 2. Add Processing Message from AISA
      const aiMsgId = (Date.now() + 1).toString();
      const processingMsg = {
        id: aiMsgId,
        role: 'assistant',
        content: `⚡ **EXTRACTING CONTENT...**\nReading text from **${file.name}**...`,
        timestamp: new Date(),
        isProcessing: true
      };
      setMessages(prev => [...prev, processingMsg]);
      scrollToBottom();

      // Update UI slightly after extraction
      setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId && msg.isProcessing ? {
          ...msg,
          content: `🎧 **CONVERTING TO VOICE...**\nSynthesizing natural audio for **${file.name}**. This won't take long!`
        } : msg));
      }, 1500);
      scrollToBottom();

      // 3. Start Conversion - Added high timeout for long docs
      try {
        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: file.type,
          gender: 'FEMALE'
        }, {
          responseType: 'arraybuffer',
          timeout: 0 // Wait as long as needed for large "jetna bhi long" files
        });

        // 4. Success - Update AI Message with Player and Download
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const reader2 = new FileReader();
        reader2.readAsDataURL(audioBlob);
        reader2.onloadend = () => {
          const mp3Base64 = reader2.result.split(',')[1];
          const rawBytes = response.data.byteLength;
          const charCount = response.headers['x-text-length'] || 0;
          const formattedFileSize = rawBytes > 1024 * 1024
            ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB'
            : (rawBytes / 1024).toFixed(1) + ' KB';

          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
            ...msg,
            isProcessing: false,
            content: `✅ I have successfully converted **${file.name}** into a full audio voice.`,
            conversion: {
              file: mp3Base64,
              blobUrl: audioUrl,
              fileName: `${file.name.split('.')[0]}_Audio.mp3`,
              mimeType: 'audio/mpeg',
              fileSize: formattedFileSize,
              rawSize: rawBytes,
              charCount: charCount
            }
          } : msg));

          toast.success("Conversion complete! 🎶");
          scrollToBottom();
        };

      } catch (err) {
        console.error('[DocToVoice Error]:', err);
        let errorMsg = "Extraction Failed";
        let errorDetail = "If this is a scanned PDF (image only), I cannot read the text yet. Please ensure it's a searchable PDF or Word file.";

        if (err.response?.data) {
          try {
            const errorData = err.response.data instanceof ArrayBuffer
              ? JSON.parse(new TextDecoder().decode(err.response.data))
              : err.response.data;

            errorMsg = errorData.error || errorMsg;
            errorDetail = errorData.details || errorDetail;
          } catch (e) { }
        }

        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
          ...msg,
          isProcessing: false,
          content: `❌ **Conversion Failed**\n**${errorMsg}**\n${errorDetail}`
        } : msg));

        toast.error("Conversion failed");
      }
    };
    reader.readAsDataURL(file);

    e.target.value = ''; // Always reset so user can click/upload same file again
  };

  const manualFileToAudioConversion = async (file) => {
    if (!file) return;

    // 1. Show User Message immediately with the file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result;
      const base64Data = base64Content.split(',')[1];

      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: `Convert this document to audio: **${file.name}**`,
        timestamp: new Date(),
        attachments: [{ url: base64Content, name: file.name, type: file.type }]
      };
      setMessages(prev => [...prev, userMsg]);

      const aiMsgId = (Date.now() + 1).toString();
      const processingMsg = {
        id: aiMsgId,
        role: 'assistant',
        content: `⚡ **EXTRACTING CONTENT...**\nReading **${file.name}**...`,
        timestamp: new Date(),
        isProcessing: true
      };
      setMessages(prev => [...prev, processingMsg]);
      scrollToBottom();

      // Second stage update
      setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId && msg.isProcessing ? {
          ...msg,
          content: `🎧 **CONVERTING TO VOICE...**\nAlmost there! Preparing your audio for **${file.name}**...`
        } : msg));
      }, 1200);

      try {
        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: file.type,
          gender: 'FEMALE'
        }, { responseType: 'arraybuffer', timeout: 0 });

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const reader2 = new FileReader();
        reader2.readAsDataURL(audioBlob);
        reader2.onloadend = () => {
          const mp3Base64 = reader2.result.split(',')[1];
          const rawBytes = response.data.byteLength;
          const charCount = response.headers['x-text-length'] || 0;
          const formattedSize = rawBytes > 1024 * 1024 ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB' : (rawBytes / 1024).toFixed(1) + ' KB';

          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
            ...msg,
            isProcessing: false,
            content: `✅ Audio conversion complete for **${file.name}**.`,
            conversion: {
              file: mp3Base64,
              blobUrl: audioUrl,
              fileName: `${file.name.split('.')[0]}_Audio.mp3`,
              mimeType: 'audio/mpeg',
              fileSize: formattedSize,
              rawSize: rawBytes,
              charCount: charCount
            }
          } : msg));
          toast.success("File converted successfully!");
          scrollToBottom();
        };
      } catch (err) {
        console.error('[ManualConversion Error]:', err);
        const serverError = err.response?.data?.details || err.response?.data?.error || err.message;
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
          ...msg,
          isProcessing: false,
          content: `❌ **Conversion Failed**\n${serverError}`
        } : msg));
        toast.error("Conversion failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const manualTextToAudioConversion = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: `Convert this text to audio: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: `🎧 **Generating voice for your text...**`,
      timestamp: new Date(),
      isProcessing: true
    }]);
    scrollToBottom();

    try {
      const response = await axios.post(apis.synthesizeFile, {
        introText: text,
        gender: 'FEMALE'
      }, { responseType: 'arraybuffer', timeout: 0 });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const reader2 = new FileReader();
      reader2.readAsDataURL(audioBlob);
      reader2.onloadend = () => {
        const mp3Base64 = reader2.result.split(',')[1];
        const rawBytes = response.data.byteLength;
        const charCount = response.headers['x-text-length'] || 0;
        const formattedSize = rawBytes > 1024 * 1024 ? (rawBytes / (1024 * 1024)).toFixed(1) + ' MB' : (rawBytes / 1024).toFixed(1) + ' KB';

        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
          ...msg,
          isProcessing: false,
          content: `✅ Your text has been converted to voice audio.`,
          conversion: {
            file: mp3Base64,
            blobUrl: audioUrl,
            fileName: `AISA_Voice_${Date.now()}.mp3`,
            mimeType: 'audio/mpeg',
            fileSize: formattedSize,
            rawSize: rawBytes,
            charCount: charCount
          }
        } : msg));
        toast.success("Text converted successfully!");
        scrollToBottom();
      };
    } catch (err) {
      console.error('[ManualTextConversion Error]:', err);
      const serverError = err.response?.data?.details || err.response?.data?.error || err.message;
      setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
        ...msg,
        isProcessing: false,
        content: `❌ **Conversion Failed**\n${serverError}`
      } : msg));
      toast.error("Conversion failed");
    }
  };

  const handleGenerateVideo = async () => {
    try {
      if (!inputRef.current?.value.trim() && selectedFiles.length === 0) {
        // toast.error('Please enter a prompt or select a file');
        // Let it slide if it's voice input (handled elsewhere)
        if (!voiceUsedRef.current) return;
      }

      const prompt = inputRef.current?.value || "";
      const filesToSend = [...selectedFiles]; // Snapshot

      // Voice Reader Mode Logic
      if (isVoiceMode) {
        // 1. Add User Message to UI
        const userMsgId = Date.now().toString();
        const newUserMsg = {
          id: userMsgId,
          type: 'user',
          text: prompt,
          role: 'user',
          timestamp: new Date(),
          attachments: filePreviews.map(fp => ({
            url: fp.url,
            name: fp.name,
            type: fp.type
          }))
        };
        setMessages(prev => [...prev, newUserMsg]);

        // Clear Inputs
        setInputValue('');
        setSelectedFiles([]);
        setFilePreviews([]);
        inputRef.current.style.height = 'auto';

        // 2. Trigger Voice Reading Directly
        // We can use speakResponse, but we need to trick it into thinking it's an AI response?
        // Or just call speakResponse with the user content? 
        // SpeakResponse reads content using a specific message ID for state tracking.

        setIsLoading(true);

        // Show a "Reading..." AI bubble
        const aiMsgId = (Date.now() + 1).toString();
        const readingMsg = {
          id: aiMsgId,
          type: 'ai',
          role: 'assistant',
          text: "🎧 Reading content aloud...",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, readingMsg]);

        setTimeout(() => {
          speakResponse(prompt, 'en-US', aiMsgId, newUserMsg.attachments);
          setIsLoading(false);
        }, 500);

        return; // STOP HERE (Do not call AI API)
      }

      setIsLoading(true);
      isSendingRef.current = true; // Mark as sending

      // Show a message that video generation is in progress
      const newMessage = {
        id: Date.now().toString(),
        type: 'ai',
        text: `🎬 Generating video from prompt: "${prompt}"\n\nPlease wait, this may take a moment...`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      inputRef.current.value = '';

      try {
        // Call the video generation endpoint
        const response = await axios.post(`${API}/video/generate`, {
          prompt: prompt,
          duration: 5, // default 5 seconds
          quality: 'medium'
        });

        if (response.data.videoUrl) {
          // Add the generated video to the message
          const videoMessage = {
            id: Date.now().toString(),
            type: 'ai',
            text: `🎥 Video generated successfully!`,
            videoUrl: response.data.videoUrl,
            timestamp: new Date(),
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = videoMessage;
            return updated;
          });

          toast.success('Video generated successfully!');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to generate video';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = `❌ ${errorMsg}`;
          return updated;
        });
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Error initiating video generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (overridePrompt) => {
    try {
      if (!inputRef.current?.value.trim() && !overridePrompt) {
        toast.error('Please enter a prompt for image generation');
        return;
      }

      const prompt = overridePrompt || inputRef.current.value;
      setIsLoading(true);

      // Show a message that image generation is in progress
      const newMessage = {
        id: Date.now().toString(),
        type: 'ai',
        text: `🎨 Generating image from prompt: "${prompt}"\n\nPlease wait, this may take a moment...`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      inputRef.current.value = '';

      try {
        // Call the image generation endpoint
        const response = await axios.post(`${API}/image/generate`, {
          prompt: prompt
        });

        if (response.data.imageUrl) {
          // Add the generated image to the message
          const imageMessage = {
            id: Date.now().toString(),
            type: 'ai',
            text: `🖼️ Image generated successfully!`,
            imageUrl: response.data.imageUrl,
            timestamp: new Date(),
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = imageMessage;
            return updated;
          });

          toast.success('Image generated successfully!');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to generate image';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = `❌ ${errorMsg}`;
          return updated;
        });
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Error initiating image generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepSearch = async () => {
    try {
      if (!inputRef.current?.value.trim()) {
        toast.error('Please enter a topic for deep search');
        return;
      }

      const query = inputRef.current.value;
      setIsLoading(true);

      // Show a message that deep search is in progress
      const newMessage = {
        id: Date.now().toString(),
        type: 'ai',
        text: `🔍 Performing deep search for: "${query}"\n\nSearching the web and analyzing results... This may take a moment...`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      inputRef.current.value = '';

      try {
        // Send message with deep search context
        const responseData = await generateChatResponse(
          messages,
          query,
          "DEEP SEARCH MODE ENABLED: Analyze the web search results comprehensively.",
          [],
          currentLang
        );

        if (responseData && responseData.reply) {
          // Add the deep search result
          const searchMessage = {
            id: Date.now().toString(),
            type: 'ai',
            text: responseData.reply,
            content: responseData.reply,
            timestamp: new Date(),
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = searchMessage;
            return updated;
          });

          toast.success('Deep search completed!');
        }
      } catch (error) {
        const errorMsg = error.message || 'Failed to perform deep search';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = `❌ ${errorMsg}`;
          return updated;
        });
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Deep search error:', error);
      toast.error('Error initiating deep search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelId) => {
    if (selectedToolType) {
      setToolModels(prev => ({
        ...prev,
        [selectedToolType]: modelId
      }));
      const selectedModel = TOOL_PRICING[selectedToolType].models.find(m => m.id === modelId);
      toast.success(`Switched to ${selectedModel?.name}`);
      setIsModelSelectorOpen(false);
    }
  };

  // Voice Input Handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      isManualStopRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Start New Listening session
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    isManualStopRef.current = false;
    transcriptRef.current = '';

    const langMap = {
      'Hindi': 'hi-IN',
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Japanese': 'ja-JP'
    };
    recognition.lang = langMap[currentLang] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputValue(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setIsListening(false);

      const text = transcriptRef.current.trim();
      if (!isManualStopRef.current && text) {
        voiceUsedRef.current = true;
        handleSendMessage(null, text);
      }
      isManualStopRef.current = false;
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      isManualStopRef.current = true;
      if (event.error === 'not-allowed') toast.error('Microphone access denied');
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Ensure Chat Mic stops when Live Mode starts
  useEffect(() => {
    if (isLiveMode && isListening && recognitionRef.current) {
      console.log("[Chat] Stopping Mic for Live Mode");
      isManualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isLiveMode, isListening]);

  // Helper to clean markdown for TTS
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);

  // Helper to clean markdown for TTS
  const cleanTextForTTS = (text) => {
    if (!text) return "";
    // Remove emojis using regex range for various emoji blocks
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F270}]/gu, '')
      // Remove headers (keep text): ### Title -> Title
      .replace(/^#+\s+/gm, '')
      // Remove bold: **text** -> text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic: *text* -> text
      .replace(/\*(.*?)\*/g, '$1')
      // Remove underline: __text__ -> text
      .replace(/__(.*?)__/g, '$1')
      // Remove strikethrough: ~~text~~ -> text
      .replace(/~~(.*?)~~/g, '$1')
      // Remove links: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images: ![alt](url) -> empty
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove code blocks (replace with brief pause/text to avoid reading syntax)
      .replace(/`{3}[\s\S]*?`{3}/g, ' Code snippet. ')
      // Remove inline code ticks: `text` -> text
      .replace(/`(.+?)`/g, '$1')
      // Remove list bullets: - text -> text
      .replace(/^\s*[-*+]\s+/gm, '')
      // Remove blockquotes: > text -> text
      .replace(/^\s*>\s+/gm, '')
      // Replace Trademark with 'tm' so it's handled by next step
      .replace(/™|&trade;/g, ' tm ')
      .replace(/©/g, ' ')
      // Hinglish Normalization for natural Hindi pronunciation
      // Ensure 'tm' is spoken as 'tum' clearly (NOT HIDDEN)
      .replace(/\btm\b/gi, 'tum ')
      .replace(/\bkkrh\b/gi, 'kya kar rahe ho ')
      .replace(/\bclg\b/gi, 'college ')
      .replace(/\bplz\b/gi, 'please ')
      // Remove specific symbols as requested: , . ? ; " \ * / + - : @ [ ] ( ) | _
      .replace(/[,\.\?;\"\\\*\/\+\-:@\[\]\(\)\|\_]/g, ' ')
      // Remove quotes/dashes just in case regex above missed something or for extra safety
      .replace(/["']/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Voice Output - Speak AI Response
  const speakResponse = async (text, language, msgId, attachments = []) => {
    // 1. Handle Toggle on the SAME message
    if (speakingMessageId === msgId) {
      if (audioRef.current) {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          setIsPaused(true);
        } else {
          await audioRef.current.play();
          setIsPaused(false);
        }
        return;
      }
    }

    // 2. Stop ANY ongoing audio (previous message or completely different source)
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset
      audioRef.current = null;
    }
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio = null;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // 3. Reset State
    setSpeakingMessageId(null);
    setIsPaused(false);

    // If user clicked the same message (and we just stopped it above because ref was lost or logic reset), 
    // simply return (effectively "Stop"). 
    // But since we handled the "Toggle" in step 1, finding ourselves here means:
    // A) It's a NEW message
    // B) The previous audio object was missing but ID was set (state mismatch recovery)

    // Set new active message
    setSpeakingMessageId(msgId);
    setIsPaused(false);



    try {
      let audioBlob = null;
      let targetLang = 'en-US';

      // Check for readable attachments (PDF, DOCX, etc.)
      // Logic to determine what to read:
      // Case 1: Text + Attachment -> Read combined
      // Case 2: Only Attachment -> Read attachment
      // Case 3: Only Text -> Read text

      const readableAttachment = attachments && attachments.length > 0
        ? attachments.find(a =>
        (a.type && (
          a.type.includes('pdf') ||
          a.type.includes('word') ||
          a.type.includes('document') ||
          a.type.includes('text') ||
          a.type.startsWith('image/')
        ))
        ) : null;

      if (readableAttachment) {
        toast.loading("Processing file & text...", { id: 'voice-loading' });
        console.log(`[VOICE] Reading attachment: ${readableAttachment.name}`);

        // Fetch file data
        const fileRes = await fetch(readableAttachment.url);
        const fileBlob = await fileRes.blob();

        // Convert to base64
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(fileBlob);
        });

        // Optional: Prepend text to file content request?
        // Actually, the backend synthesizeFile endpoint expects fileData. 
        // We should modify the backend to accept 'prependText' OR we handle it here by chaining?
        // Easier: Send text to backend as well.

        // Wait, synthesizeFile doesn't accept 'text' currently. 
        // We'll update the backend to prepend text if provided.
        // Or we can synthesize text separately? No, better one stream.

        // Let's rely on a logic: Clean text is passed to backend.
        const headerText = text ? cleanTextForTTS(text) : "";

        const response = await axios.post(apis.synthesizeFile, {
          fileData: base64Data,
          mimeType: readableAttachment.type || 'application/pdf',
          languageCode: null,
          gender: 'FEMALE',
          introText: headerText // SEND TEXT TO BACKEND
        }, {
          responseType: 'arraybuffer'
        });

        audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        toast.dismiss('voice-loading');

      } else {
        // Standard Text Reading
        if (!text) {
          setSpeakingMessageId(null);
          return;
        }

        const cleanText = cleanTextForTTS(text);
        if (!cleanText) {
          setSpeakingMessageId(null);
          return;
        }

        const langMap = {
          'Hindi': 'hi-IN',
          'English': 'en-US',
          'Hinglish': 'hi-IN'
        };
        targetLang = /[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' : (langMap[language] || 'en-US');

        console.log(`[VOICE] Requesting synthesis for text...`);
        const response = await axios.post(apis.synthesizeVoice, {
          text: cleanText,
          languageCode: targetLang,
          gender: 'FEMALE',
          tone: 'conversational'
        }, {
          responseType: 'arraybuffer'
        });

        audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      }

      console.log(`[VOICE] Playing audio...`);
      const url = window.URL.createObjectURL(audioBlob);
      const audio = new Audio(url);

      window.currentAudio = audio;
      audioRef.current = audio;

      audio.onended = () => {
        window.URL.revokeObjectURL(url);
        if (window.currentAudio === audio) window.currentAudio = null;
        if (audioRef.current === audio) {
          setSpeakingMessageId(null);
          setIsPaused(false);
        }
      };

      audio.onerror = (e) => {
        console.error(`[VOICE] Audio playback error:`, e);
        if (!readableAttachment) fallbackSpeak(cleanTextForTTS(text), targetLang); // Only fallback for text
        toast.error("Failed to play audio");
        setSpeakingMessageId(null);
      };

      await audio.play();

    } catch (err) {
      console.error('[VOICE] Synthesis failed:', err);
      toast.dismiss('voice-loading');
      if (!attachments || attachments.length === 0) {
        fallbackSpeak(cleanTextForTTS(text), 'en-US');
      } else {
        toast.error("Could not read file. " + (err.response?.data?.error || err.message));
      }
      setSpeakingMessageId(null);
    }
  };

  const fallbackSpeak = (text, lang) => {
    console.log(`[VOICE] Using browser fallback for: ${lang}`);
    if (!window.speechSynthesis) {
      console.error('[VOICE] SpeechSynthesis not supported in this browser.');
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Find a better voice if possible
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      console.log(`[VOICE] Browser fallback using voice: ${matchedVoice.name}`);
    }

    utterance.onstart = () => console.log('[VOICE] Browser speech started.');
    utterance.onend = () => console.log('[VOICE] Browser speech ended.');
    utterance.onerror = (e) => console.error('[VOICE] Browser speech error:', e);

    window.speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    const loadSessions = async () => {
      const data = await chatStorageService.getSessions();
      setSessions(data);

      // Fetch User Subscribed Agents
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?._id;
        if (userId) {
          try {
            const token = getUserData()?.token || localStorage.getItem("token");
            const res = await axios.post(apis.getUserAgents, { userId }, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const agents = res.data?.agents || [];
            // Add default AISA agent if not present
            const processedAgents = [{ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA_BRAIN_LOGO.png' }, ...agents];
            setUserAgents(processedAgents);
          } catch (agentErr) {
            // Silently use defaults if fetch fails (no console warning)
            setUserAgents([{ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA_BRAIN_LOGO.png' }]);
          }
        } else {
          // No user logged in, use default
          setUserAgents([{ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA_BRAIN_LOGO.png' }]);
        }
      } catch (err) {
        // Silently handle errors
        setUserAgents([{ agentName: 'AISA', category: 'General', avatar: '/AGENTS_IMG/AISA_BRAIN_LOGO.png' }]);
      }
    };
    loadSessions();
  }, [messages, setSessions]);

  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      // If we just navigated from 'new' to a real ID in handleSendMessage,
      // don't clear the messages we already have in state.
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      if (sessionId && sessionId !== 'new') {
        setCurrentSessionId(sessionId);
        console.log(`[DEBUG] Initializing chat for session: ${sessionId}`);
        const history = await chatStorageService.getHistory(sessionId);
        console.log(`[DEBUG] Received history:`, history);
        if (history && history.length > 0) {
          console.log(`[DEBUG] First message role: ${history[0].role}, content preview: ${history[0].content?.substring(0, 20)}`);
        }
        setMessages(history || []);
      } else {
        setCurrentSessionId('new');
        setMessages([]);
      }

      setShowHistory(false);
    };
    initChat();
  }, [sessionId]);

  const chatContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Tighter threshold (50px) - if user scrolls up slightly, auto-scroll stops
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      shouldAutoScrollRef.current = isNearBottom;
    }
  };

  const scrollToBottom = (force = false, behavior = 'auto') => {
    if (force || shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = async () => {
    navigate('/dashboard/chat/new');
    setShowHistory(false);
  };

  const { language: currentLang, t } = useLanguage();

  const handleDriveClick = () => {
    setIsAttachMenuOpen(false);
    // Simulating Drive Integration via Link
    const link = prompt("Paste your Google Drive File Link:");
    if (link) {
      setFilePreviews(prev => [...prev, {
        url: link,
        name: "Google Drive File",
        type: "application/vnd.google-apps.file",
        size: 0,
        isLink: true,
        id: Math.random().toString(36).substr(2, 9)
      }]);
      setSelectedFiles(prev => [...prev, { name: "Google Drive File", type: "link" }]);
    }
  };

  const isSendingRef = useRef(false);

  const handleSendMessage = async (e, overrideContent) => {
    if (e) e.preventDefault();

    // Prevent duplicate sends (from voice + form race condition)
    if (isSendingRef.current) return;

    if (isAudioConvertMode && !inputValue.trim() && selectedFiles.length === 0) {
      toast.error('Please enter text or upload a file to convert to audio');
      return;
    }

    // Special case for Audio Convert Mode: Handle files directly if present
    if (isAudioConvertMode && selectedFiles.length > 0) {
      const fileToConvert = selectedFiles[0]; // Take the first one for simplicity

      // Simulate click on the hidden doc-voice-upload to reuse its logic
      // But we need to pass the file. Let's instead call a manual conversion function.
      manualFileToAudioConversion(fileToConvert);
      setSelectedFiles([]);
      setFilePreviews([]);
      return;
    }

    // Special case for Audio Convert Mode: Handle text conversion
    if (isAudioConvertMode && inputValue.trim()) {
      manualTextToAudioConversion(inputValue);
      setInputValue('');
      return;
    }

    // Use overrideContent if provided (for instant voice sending), otherwise fallback to state
    const contentToSend = typeof overrideContent === 'string' ? overrideContent : inputValue.trim();

    if ((!contentToSend && filePreviews.length === 0) || isLoading) return;

    isSendingRef.current = true;
    setInputValue(''); // Clear immediately to prevent stale reads
    transcriptRef.current = '';

    let activeSessionId = currentSessionId;
    let isFirstMessage = false;

    // Stop listening if send is clicked (or auto-sent)
    if (isListening && recognitionRef.current) {
      isManualStopRef.current = true; // Guard against recursive onend
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Handle Image Generation Mode
    if (isImageGeneration) {
      handleGenerateImage(contentToSend); // Pass content directly if needed, or handleGenerateImage uses ref/state
      isSendingRef.current = false; // Reset sending ref since handleGenerateImage might handle it differently or we want to allow next send
      return;
    }

    // Handle Voice Reader Mode - Just read, no AI response
    if (isVoiceMode) {
      try {
        // 1. Add User Message to UI
        const userMsgId = Date.now().toString();
        const newUserMsg = {
          id: userMsgId,
          role: 'user',
          content: contentToSend,
          timestamp: new Date(),
          attachments: filePreviews.map(fp => ({
            url: fp.url,
            name: fp.name,
            type: fp.type
          }))
        };
        setMessages(prev => [...prev, newUserMsg]);

        // 2. Clear inputs
        setInputValue('');
        handleRemoveFile();
        if (inputRef.current) inputRef.current.style.height = 'auto';

        // 3. Trigger voice reading directly (no AI response)
        setTimeout(() => {
          console.log('[Voice Mode] Reading content with attachments:', newUserMsg.attachments);
          speakResponse(contentToSend, 'en-US', userMsgId, newUserMsg.attachments);
        }, 300);

        isSendingRef.current = false;
        return; // STOP - Don't call AI API
      } catch (err) {
        console.error('[Voice Mode Error]:', err);
        toast.error('Failed to read content');
        isSendingRef.current = false;
        return;
      }
    }


    try {
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        isFirstMessage = true;
      }

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: contentToSend || (filePreviews.length > 0 ? "Analyze these files" : ""),
        timestamp: Date.now(),
        attachments: filePreviews.map(p => ({
          url: p.url,
          name: p.name,
          type: p.type.startsWith('image/') ? 'image' :
            p.type.includes('pdf') ? 'pdf' :
              p.type.includes('word') || p.type.includes('document') ? 'docx' :
                p.type.includes('excel') || p.type.includes('spreadsheet') ? 'xlsx' :
                  p.type.includes('powerpoint') || p.type.includes('presentation') ? 'pptx' : 'file'
        })),
        agentName: activeAgent.agentName || activeAgent.name,
        agentCategory: activeAgent.category
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      scrollToBottom(true, 'smooth'); // Force smooth scroll for user message
      setInputValue('');

      // Capture deep search state before resetting
      const deepSearchActive = isDeepSearch;
      if (isDeepSearch) setIsDeepSearch(false);

      // Detect mode for UI indicator
      const detectedMode = deepSearchActive ? MODES.DEEP_SEARCH : detectMode(contentToSend, userMsg.attachments);
      setCurrentMode(detectedMode);

      // Update user message with the detected mode
      userMsg.mode = detectedMode;

      // Determine loading intent for UI feedback
      const lowerContent = (userMsg.content || "").toLowerCase();
      if (
        (lowerContent.includes('image') || lowerContent.includes('photo') || lowerContent.includes('pic') || lowerContent.includes('draw')) &&
        (lowerContent.includes('generate') || lowerContent.includes('create') || lowerContent.includes('make') || lowerContent.includes('show'))
      ) {
        setLoadingText("Generating Image... 🎨");
      } else if (lowerContent.includes('video')) {
        setLoadingText("Generating Video... 🎥");
      } else {
        setLoadingText("Thinking...");
      }

      handleRemoveFile(); // Clear file after sending
      setIsLoading(true);

      try {
        const title = isFirstMessage ? (userMsg.content ? userMsg.content.slice(0, 30) : 'File Attachment') + '...' : undefined;
        await chatStorageService.saveMessage(activeSessionId, userMsg, title);

        if (isFirstMessage) {
          isNavigatingRef.current = true;
          setCurrentSessionId(activeSessionId);
          navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        }

        // Send to AI for response
        const caps = getAgentCapabilities(activeAgent.agentName, activeAgent.category);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // ---------------------------------------------------------
        //  CONSTRUCT SYSTEM INSTRUCTION BASED ON PROFILE SETTINGS
        // ---------------------------------------------------------
        const pGeneral = personalizations?.general || {};
        const pStyle = personalizations?.personalization || {};
        const pParental = personalizations?.parentalControls || {};

        let PERSONA_INSTRUCTION = "";

        // 1. STYLE & FONT (Font is UI only, but we can hint at TONE)
        if (pStyle.fontStyle && pStyle.fontStyle !== 'Default') {
          // No direct AI instruction needed for font family, but we can adjust tone if needed
        }

        // 2. CHARACTERISTICS
        if (pStyle.enthusiasm) PERSONA_INSTRUCTION += `- Enthusiasm Level: ${pStyle.enthusiasm}\n`;
        if (pStyle.formality) PERSONA_INSTRUCTION += `- Formality Level: ${pStyle.formality}\n`;
        if (pStyle.creativity) PERSONA_INSTRUCTION += `- Creativity Level: ${pStyle.creativity}\n`;

        // 3. FORMATTING
        if (pStyle.structuredResponses) PERSONA_INSTRUCTION += "- FORMAT: Use clear Headers, Sections, and structured layouts.\n";
        if (pStyle.bulletPoints) PERSONA_INSTRUCTION += "- FORMAT: Prioritize Bullet Points and Lists over paragraphs.\n";

        // 4. EMOJI USAGE
        if (pStyle.emojiUsage) {
          if (pStyle.emojiUsage === 'None') PERSONA_INSTRUCTION += "- EMOJIS: Do NOT use any emojis or icons.\n";
          else if (pStyle.emojiUsage === 'Minimal') PERSONA_INSTRUCTION += "- EMOJIS: Use very few emojis, only where absolutely necessary.\n";
          else if (pStyle.emojiUsage === 'Moderate') PERSONA_INSTRUCTION += "- EMOJIS: Use a moderate amount of relevant emojis.\n";
          else if (pStyle.emojiUsage === 'Expressive') PERSONA_INSTRUCTION += "- EMOJIS: Use emojis frequently to be engaging and expressive.\n";
        }

        // 5. CUSTOM INSTRUCTIONS override
        if (pStyle.customInstructions) {
          PERSONA_INSTRUCTION += `\n### USER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY):\n${pStyle.customInstructions}\n`;
        }

        // 6. PARENTAL / SAFETY
        if (pParental.contentFilter) {
          PERSONA_INSTRUCTION += `\n### SAFETY MODE: STRICT\n- Absolutely NO mature, violent, or explicit content.\n- If user asks for such, politley decline.\n`;
        }
        if (pParental.ageCategory === 'Child') {
          PERSONA_INSTRUCTION += `- SIMPLIFY language for a Child.\n- Be encouraging and safe.\n`;
        }

        // 7. LANGUAGE
        // We already have language detection, but let's reinforce if set strictly
        if (pGeneral.language && pGeneral.language !== 'Auto-Detect') {
          PERSONA_INSTRUCTION += `\n### REQUIRED LANGUAGE:\n- Respond ONLY in ${pGeneral.language}.\n`;
        }

        // 8. TEXT SIZE / ACCESSIBILITY (Frontend only mostly, but hint AI)
        if (pStyle.fontSize === 'Large' || pStyle.fontSize === 'Extra Large' || pGeneral.highContrast) {
          PERSONA_INSTRUCTION += `- FORMAT: Use shorter sentences and very clear structure for readability.\n`;
        }

        const SYSTEM_INSTRUCTION = `
You are ${activeAgent.agentName || 'AISA'}, an advanced AI assistant powered by A-Series.
${activeAgent.category ? `Your specialization is in ${activeAgent.category}.` : ''}

${PERSONA_INSTRUCTION}

### CRITICAL LANGUAGE RULE:
**ALWAYS respond in the SAME LANGUAGE as the user's message.** (Unless overridden by settings)
- If user writes in HINDI (Devanagari or Romanized), respond in HINDI.
- If user writes in ENGLISH, respond in ENGLISH.
- If user mixes languages, prioritize the dominant language.

### RESPONSE BEHAVIOR:
- Answer the user's question directly without greeting messages
- Do NOT say "Hello... welcome to AISA" or similar greetings
- Focus ONLY on providing the answer to what user asked
- Be helpful, clear, and concise

### STREAMING BEHAVIOR:
- Generate responses in smooth, continuous stream
- Use short paragraphs for readability
- If interrupted, stop immediately without completing sentence
- Do NOT add summaries or closing lines after interruption
- Resume ONLY if user explicitly asks again

### MULTI-FILE ANALYSIS MANDATE (STRICT 1:1 RULE):
You have received exactly ${filePreviews.length} file(s).
You MUST provide exactly ${filePreviews.length} distinct analysis blocks.

CRITICAL RULES:
1.  **NO MERGING**: Do NOT combine files into a single "Chapter" or "Section".
2.  **NO SKIPPING**: If 2 files are uploaded, you MUST output 2 analysis blocks.
3.  **SEPARATE ENTITIES**: Treat each file as a completely independent document requiring its own full answer.
4.  **DELIMITER MANDATORY**: Use the delimiter below to separate EACH file's answer.

REQUIRED OUTPUT FORMAT:
[Optional brief greeting]

---SPLIT_RESPONSE---
**Analysis of: {Filename 1}**
[Full detailed answer/analysis for File 1]

---SPLIT_RESPONSE---
**Analysis of: {Filename 2}**
[Full detailed answer/analysis for File 2]

(Repeat strictly for ALL ${filePreviews.length} files)

### RESPONSE FORMATTING RULES (STRICT):
1.  **Structure**: ALWAYS use **Bold Headings** and **Bullet Points**. Avoid long paragraphs.
2.  **Point-wise Answers**: Break down complex topics into simple points.
3.  **Highlights**: Bold key terms and important concepts.
4.  **Summary**: Include a "One-line summary" or "Simple definition" at the start or end where appropriate.
5.  **Emojis**: Use relevant emojis.

${caps.canUploadImages ? `IMAGE ANALYSIS CAPABILITIES:
- You have the ability to see and analyze images provided by the user.` : ''}

${caps.canUploadDocs ? `DOCUMENT ANALYSIS CAPABILITIES:
- You can process and extract text from PDF, Word (Docx), and Excel files provided as attachments.` : ''}

${activeAgent.instructions ? `SPECIFIC AGENT INSTRUCTIONS:
${activeAgent.instructions}` : ''}

${deepSearchActive ? `### DEEP SEARCH MODE ENABLED (CRITICAL):
- The user has requested an EXHAUSTIVE DEEP SEARCH.
- Your response MUST be extremely long, detailed, and comprehensive.
- Provide in-depth analysis, historical context, current trends, and future implications where applicable.
- YOU MUST perform extensive web searching to gather every relevant detail.
- Do NOT be brief. Expand on every point. Use multiple sections and subsections.
- Clearly structure your findings with professional formatting and cite sources if possible.` : ''}
`;
        const aiResponseData = await generateChatResponse(
          messages,
          userMsg.content,
          SYSTEM_INSTRUCTION + getSystemPromptExtensions(),
          userMsg.attachments,
          currentLang,
          abortControllerRef.current.signal
        );

        // Handle response - could be string (old format) or object (new format with conversion)
        let aiResponseText = '';
        let conversionData = null;
        let aiVideoUrl = null;
        let aiImageUrl = null;

        if (typeof aiResponseData === 'string') {
          aiResponseText = aiResponseData;
        } else if (aiResponseData && typeof aiResponseData === 'object') {
          aiResponseText = aiResponseData.reply || "No response generated.";
          conversionData = aiResponseData.conversion || null;
          // Extract media URLs if present
          aiVideoUrl = aiResponseData.videoUrl || null;
          aiImageUrl = aiResponseData.imageUrl || null;
        } else {
          aiResponseText = "No response generated.";
        }

        if (aiResponseText === "dbDemoModeMessage") {
          aiResponseText = t('dbDemoModeMessage');
        }

        // Check for multiple file analysis headers to split into separate cards
        const delimiter = '---SPLIT_RESPONSE---';
        let responseParts = [];

        if (aiResponseText && aiResponseText.includes(delimiter)) {
          const rawParts = aiResponseText.split(delimiter).filter(p => p && p.trim().length > 0);
          responseParts = rawParts.length > 0 ? rawParts.map(part => part.trim()) : [aiResponseText];
        } else {
          responseParts = [aiResponseText || "No response generated."];
        }

        // Process response parts and add to messages
        for (let i = 0; i < responseParts.length; i++) {
          const partContent = responseParts[i];
          if (!partContent) continue;

          const msgId = (Date.now() + 1 + i).toString();
          const modelMsg = {
            id: msgId,
            role: 'model',
            content: '', // Start empty for typewriter effect
            timestamp: Date.now() + i * 100,
          };

          // Add the empty message structure to UI
          setMessages((prev) => [...prev, modelMsg]);
          setTypingMessageId(msgId); // Mark this message as typing

          // Typewriter effect simulation
          const words = partContent.split(' ');
          let displayedContent = '';

          // Decide speed based on length (shorter = slower, longer = faster)
          const delay = words.length > 200 ? 10 : (words.length > 50 ? 20 : 35);

          for (let j = 0; j < words.length; j++) {
            // Check if generation was stopped by user
            if (!isSendingRef.current) break;

            displayedContent += (j === 0 ? '' : ' ') + words[j];

            // Update UI with the current chunk
            setMessages((prev) =>
              prev.map(m => m.id === msgId ? { ...m, content: displayedContent } : m)
            );

            // Wait before next word
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          if (!isSendingRef.current) {
            setTypingMessageId(null);
            return; // Exit function if stopped
          }

          setTypingMessageId(null); // Clear typing status

          // Add conversion data and media if available
          const finalModelMsg = { ...modelMsg, content: partContent };
          if (i === 0) {
            if (conversionData) finalModelMsg.conversion = conversionData;
            if (aiVideoUrl) finalModelMsg.videoUrl = aiVideoUrl;
            if (aiImageUrl) finalModelMsg.imageUrl = aiImageUrl;
          }

          // After typing is complete, save the full message to history
          await chatStorageService.saveMessage(activeSessionId, finalModelMsg);

          // CRITICAL: Update the state with the final message including conversion data
          setMessages((prev) =>
            prev.map(m => m.id === msgId ? finalModelMsg : m)
          );
          scrollToBottom();

          // Speak the AI response if user used voice input
          if (i === 0 && voiceUsedRef.current) {
            const detectedLang = aiResponseData?.language || currentLang;
            speakResponse(partContent, detectedLang);
            voiceUsedRef.current = false; // Reset flag
          }
        }
      } catch (innerError) {
        console.error("Storage/API Error:", innerError);
        // Even if saving failed, we still have the local state
      }
    } catch (error) {
      // Handle abort errors silently (user stopped generation)
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Generation stopped by user');
        // Keep partial response, don't show error
        return;
      }

      console.error("Chat Error:", error);
      toast.error(`Error: ${error.message || "Failed to send message"}`);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
      abortControllerRef.current = null; // Clean up abort controller
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      await chatStorageService.deleteSession(id);
      const data = await chatStorageService.getSessions();
      setSessions(data);
      if (currentSessionId === id) {
        navigate('/dashboard/chat/new');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentCapabilities = (agentName, category) => {
    const name = (agentName || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // Default: Everything enabled for AISA
    if (name === 'aisa' || !name) {
      return {
        canUploadImages: true,
        canUploadDocs: true,
        canVoice: true,
        canVideo: true,
        canCamera: true
      };
    }

    const caps = {
      canUploadImages: true,
      canUploadDocs: true,
      canVoice: true,
      canVideo: true,
      canCamera: true
    };

    // Specific logic per category/name
    if (cat.includes('hr') || cat.includes('finance') || name.includes('doc') || name.includes('legal')) {
      caps.canVideo = false;
      caps.canCamera = false;
      caps.canUploadImages = false;
    } else if (cat.includes('design') || cat.includes('creative') || name.includes('photo')) {
      caps.canVoice = false;
      caps.canVideo = false;
      caps.canUploadDocs = false;
    } else if (name.includes('voice') || name.includes('call') || name.includes('bot')) {
      caps.canUploadImages = false;
      caps.canUploadDocs = false;
      caps.canCamera = false;
      caps.canVideo = false;
    } else if (cat.includes('medical') || cat.includes('health')) {
      caps.canVideo = false;
      caps.canUploadImages = true;
    }

    return caps;
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link if fetch fails
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  };

  const handleImageAction = (action) => {
    if (selectedFiles.length === 0) return;

    let command = '';
    switch (action) {
      case 'remove-bg':
        command = 'Remove the background and clean up this image.';
        break;
      case 'remix':
        command = 'Create a stunning new image based on this attachment. Here are the details: ';
        break;
      case 'enhance':
        command = 'Analyze the attached image and generate a higher quality version of it.';
        break;
      default:
        break;
    }
    setInputValue(command);

    if (action === 'remix') {
      inputRef.current?.focus();
      toast.success("Describe your changes and hit send!");
    } else {
      toast.success(`${action.replace('-', ' ')} processing...`);
      setLoadingText(`Processing ${action.replace('-', ' ')}... 🖼️`);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };


  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsgId, setFeedbackMsgId] = useState(null);
  const [feedbackCategory, setFeedbackCategory] = useState([]);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [loadingText, setLoadingText] = useState("Thinking..."); // New state for loading status text

  const handlePdfAction = async (action, msg) => {
    // If this message has a converted file, use it directly instead of rendering the chat bubble
    if (msg.conversion && msg.conversion.file && msg.conversion.mimeType === 'application/pdf') {
      try {
        const byteCharacters = atob(msg.conversion.file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (action === 'download') {
          const a = document.createElement('a');
          a.href = url;
          a.download = msg.conversion.fileName || 'converted.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("Converted PDF Downloaded");
        } else if (action === 'open') {
          window.open(url, '_blank');
        } else if (action === 'share') {
          const file = new File([blob], msg.conversion.fileName || 'converted.pdf', { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Converted Document' });
          } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = msg.conversion.fileName || 'converted.pdf';
            a.click();
          }
        }
        return; // Exit after handling conversion file
      } catch (err) {
        console.error("Error handling conversion file PDF action:", err);
      }
    }

    setPdfLoadingId(msg.id);
    try {
      const element = document.getElementById(`msg-text-${msg.id}`);
      if (!element) {
        toast.error("Content not found");
        return;
      }

      // Temporarily modify styles for better print capture (e.g. forced light mode)
      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById(`msg-text-${msg.id}`);
            if (clonedEl) {
              const wrapper = clonedDoc.createElement('div');
              wrapper.style.padding = '60px 70px'; // Professional wide margins
              wrapper.style.backgroundColor = '#ffffff';
              wrapper.style.width = '850px'; // Standard documentation width
              wrapper.style.fontFamily = "'Inter', 'Segoe UI', Arial, sans-serif";

              // No distracting headers/footers on every page, just clean documentation style
              clonedEl.style.color = '#000000';
              clonedEl.style.fontSize = '14px';
              clonedEl.style.lineHeight = '1.7';
              clonedEl.style.whiteSpace = 'normal';

              clonedEl.parentNode.insertBefore(wrapper, clonedEl);
              wrapper.appendChild(clonedEl);

              // Refine all elements for Official Document look
              const allElements = clonedEl.querySelectorAll('*');

              const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}]/gu;

              allElements.forEach(el => {
                el.style.color = '#111827';
                el.style.margin = '0';
                el.style.padding = '0';

                // Remove emojis from text content
                if (el.childNodes.length > 0) {
                  el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                      node.textContent = node.textContent.replace(emojiRegex, '');
                    }
                  });
                }

                if (el.tagName === 'P') {
                  el.style.marginBottom = '8px'; // Reduced gap
                }
                if (el.tagName === 'UL' || el.tagName === 'OL') {
                  el.style.paddingLeft = '25px';
                  el.style.marginBottom = '12px'; // Reduced gap
                }
                if (el.tagName === 'LI') {
                  el.style.marginBottom = '4px'; // Reduced gap
                  el.style.display = 'list-item';
                }

                // Headers styling matching reference
                if (el.tagName === 'H1') {
                  el.style.fontSize = '24px'; // Slightly smaller h1
                  el.style.fontWeight = '800';
                  el.style.marginTop = '0';
                  el.style.marginBottom = '16px';
                  el.style.color = '#000000';
                }
                if (el.tagName === 'H2') {
                  el.style.fontSize = '18px'; // Slightly smaller h2
                  el.style.fontWeight = '700';
                  el.style.marginTop = '20px'; // Reduced gap
                  el.style.marginBottom = '10px';
                  el.style.borderBottom = '1px solid #e5e7eb';
                  el.style.paddingBottom = '4px';
                }
                if (el.tagName === 'H3') {
                  el.style.fontSize = '15px';
                  el.style.fontWeight = '700';
                  el.style.marginTop = '15px'; // Reduced gap
                  el.style.marginBottom = '8px';
                }

                // Table Styling matching reference
                if (el.tagName === 'TABLE') {
                  el.style.width = '100%';
                  el.style.borderCollapse = 'collapse';
                  el.style.marginTop = '12px';
                  el.style.marginBottom = '12px';
                }
                if (el.tagName === 'TH') {
                  el.style.backgroundColor = '#f9fafb';
                  el.style.border = '1px solid #e5e7eb';
                  el.style.padding = '8px';
                  el.style.textAlign = 'left';
                  el.style.fontWeight = '700';
                  el.style.fontSize = '13px';
                }
                if (el.tagName === 'TD') {
                  el.style.border = '1px solid #e5e7eb';
                  el.style.padding = '6px 8px';
                  el.style.fontSize = '12px';
                }

                if (el.tagName === 'STRONG' || el.tagName === 'B') {
                  el.style.fontWeight = '700';
                }

                if (el.tagName === 'HR') {
                  el.style.border = 'none';
                  el.style.borderTop = '1px solid #e5e7eb';
                  el.style.margin = '20px 0';
                }
              });
            }
          }
        });
      } catch (genError) {
        console.error("html2canvas error:", genError);
        throw new Error("Failed to render PDF content.");
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const margin = 15; // 15mm margin
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentHeightPerPage = pageHeight - (margin * 2);

      let heightLeft = pdfHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
      heightLeft -= contentHeightPerPage;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = margin - (pdfHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
        heightLeft -= contentHeightPerPage;
      }

      const filename = `aisa-response-${msg.id}.pdf`;

      if (action === 'download') {
        pdf.save(filename);
        toast.success("PDF Downloaded");
      } else if (action === 'open') {
        const blobUrl = pdf.output('bloburl');
        window.open(blobUrl, '_blank');
      } else if (action === 'share') {
        const blob = pdf.output('blob');
        const file = new File([blob], filename, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'AI Response',
              text: 'Here is the response from A-Series AI.'
            });
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              pdf.save(filename);
              toast("Sharing failed, downloaded instead");
            }
          }
        } else {
          pdf.save(filename);
          toast("Sharing not supported, downloaded instead.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  // Auto-resize chat input textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height to recount
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleThumbsDown = (msgId) => {
    setFeedbackMsgId(msgId);
    setFeedbackOpen(true);
    setFeedbackCategory([]);
    setFeedbackDetails("");
  };

  const handleThumbsUp = async (msgId) => {
    try {
      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: msgId,
        type: 'thumbs_up'
      });
      toast.success("Thanks for the positive feedback!", {
        icon: '👍',
      });
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleShare = async (content) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Assistant Response',
          text: content,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyMessage(content);
      toast("Content copied to clipboard", { icon: '📋' });
    }
  };

  const submitFeedback = async () => {
    try {
      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: feedbackMsgId,
        type: 'thumbs_down',
        categories: feedbackCategory,
        details: feedbackDetails
      });
      toast.success("Feedback submitted. Thank you!");
      setFeedbackOpen(false);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const toggleFeedbackCategory = (cat) => {
    setFeedbackCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleMessageDelete = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    // Find the message index
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const msgsToDelete = [messageId];

    // Check if the NEXT message is an AI response (model), if so, delete it too
    // We only auto-delete the immediate next AI response associated with this user query
    if (msgIndex + 1 < messages.length) {
      const nextMsg = messages[msgIndex + 1];
      if (nextMsg.role === 'model') {
        msgsToDelete.push(nextMsg.id);
      }
    }

    // Optimistic update
    setMessages(prev => prev.filter(m => !msgsToDelete.includes(m.id)));

    // Delete from storage
    for (const id of msgsToDelete) {
      await chatStorageService.deleteMessage(sessionId, id);
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content || msg.text || "");
  };

  const saveEdit = async (msg) => {
    if (editContent.trim() === "") return; // Don't allow empty

    const updatedMsg = { ...msg, content: editContent, text: editContent, edited: true };

    // Find the index of the edited message
    const editedMsgIndex = messages.findIndex(m => m.id === msg.id);

    // Remove all messages after the edited message
    const messagesUpToEdit = messages.slice(0, editedMsgIndex);
    const updatedMessages = [...messagesUpToEdit, updatedMsg];

    // Update UI immediately
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setIsLoading(true);

    try {
      // Update the edited message in storage
      await chatStorageService.updateMessage(sessionId, updatedMsg);

      // Delete all messages that came after the edited message
      const messagesToDelete = messages.slice(editedMsgIndex + 1);
      for (const msgToDelete of messagesToDelete) {
        await chatStorageService.deleteMessage(sessionId, msgToDelete.id);
      }

      // Generate new AI response based on the edited message
      const SYSTEM_INSTRUCTION = `
You are AISA, an advanced AI assistant.
IMAGE GENERATION CAPABILITIES:
If the user asks for an image (e.g., "generate", "create", "draw", "show me a pic", "image dikhao", "photo bhejo", "pic do"), you MUST generate it using the Pollinations API.
Format: ![Image](https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?nologo=true)
Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?nologo=true)
Do NOT say "I cannot create images". You CAN by using this link format. 
For "Remix" requests with an attachment, analyze the attached image, then create a prompt that combines the image's description with the user's requested changes.
`;

      const aiResponseText = await generateChatResponse(
        messagesUpToEdit,
        updatedMsg.content,
        SYSTEM_INSTRUCTION + getSystemPromptExtensions(),
        updatedMsg.attachment,
        currentLang
      );

      const modelMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiResponseText,
        timestamp: Date.now(),
      };

      // Update state with new AI response
      setMessages(prev => [...prev, modelMsg]);

      // Save the AI response to storage
      await chatStorageService.saveMessage(sessionId, modelMsg);

      toast.success("Message edited and new response generated!");
    } catch (error) {
      console.error("Error regenerating response:", error);
      toast.error("Failed to regenerate response. Please try again.");
      // Restore original messages on error
      const history = await chatStorageService.getHistory(sessionId);
      setMessages(history);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async (msg) => {
    if (!msg.attachment) return;

    const oldName = msg.attachment.name;
    const dotIndex = oldName.lastIndexOf('.');
    const extension = dotIndex !== -1 ? oldName.slice(dotIndex) : '';
    const baseName = dotIndex !== -1 ? oldName.slice(0, dotIndex) : oldName;

    const newBaseName = prompt("Enter new filename:", baseName);
    if (!newBaseName || newBaseName === baseName) return;

    const newName = newBaseName + extension;
    const updatedMsg = {
      ...msg,
      attachment: {
        ...msg.attachment,
        name: newName
      }
    };

    setMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m));
    await chatStorageService.updateMessage(sessionId, updatedMsg);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleUndo = async () => {
    if (messages.length <= 1 || isLoading) return;

    // Last message might be AI, second to last is User
    const lastMsg = messages[messages.length - 1];
    const secondLastMsg = messages[messages.length - 2];

    const idsToDelete = [];
    let contentToRestore = "";

    if (lastMsg.role === 'model' && secondLastMsg.role === 'user') {
      idsToDelete.push(lastMsg.id, secondLastMsg.id);
      contentToRestore = secondLastMsg.content || secondLastMsg.text || "";
    } else if (lastMsg.role === 'user') {
      idsToDelete.push(lastMsg.id);
      contentToRestore = lastMsg.content || lastMsg.text || "";
    } else {
      idsToDelete.push(lastMsg.id);
    }

    // Restore content to input field
    if (contentToRestore) {
      setInputValue(contentToRestore);
      // Small delay to ensure state update before focusing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Set cursor at the end
          inputRef.current.selectionStart = contentToRestore.length;
          inputRef.current.selectionEnd = contentToRestore.length;
        }
      }, 50);
    }

    // Optimistic Update
    setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));

    // Delete from storage
    try {
      for (const id of idsToDelete) {
        if (id) {
          await chatStorageService.deleteMessage(currentSessionId, id);
        }
      }
      toast.success("Message restored to input", { icon: '↩️' });
    } catch (error) {
      console.error("Undo error:", error);
    }
  };

  const [viewingDoc, setViewingDoc] = useState(null);
  const docContainerRef = useRef(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setViewingDoc(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Process Word documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(docx|doc)$/i) && docContainerRef.current) {
      // Clear previous content
      docContainerRef.current.innerHTML = '';

      fetch(viewingDoc.url)
        .then(res => res.blob())
        .then(blob => {
          renderAsync(blob, docContainerRef.current, undefined, {
            inWrapper: true,
            ignoreWidth: false,
            className: "docx-viewer"
          }).catch(err => {
            console.error("Docx Preview Error:", err);
            docContainerRef.current.innerHTML = '<div class="text-center p-10 text-subtext">Preview not available.<br/>Please download to view.</div>';
          });
        });
    }
  }, [viewingDoc]);

  // Process Excel documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(xls|xlsx|csv)$/i)) {
      setExcelHTML(null); // Reset
      fetch(viewingDoc.url)
        .then(res => res.arrayBuffer())
        .then(ab => {
          const wb = XLSX.read(ab, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(ws, { id: "excel-preview", editable: false });
          setExcelHTML(html);
        })
        .catch(err => {
          console.error("Excel Preview Error:", err);
          setExcelHTML('<div class="text-center p-10 text-red-500">Failed to load Excel preview.</div>');
        });
    }
  }, [viewingDoc]);

  // Process Text/Code documents
  useEffect(() => {
    // Check if handled by other specific viewers
    const isSpecial = viewingDoc?.name.match(/\.(docx|doc|xls|xlsx|csv|pdf|mp4|webm|ogg|mov|mp3|wav|m4a|jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc?.url.startsWith('data:image/');

    if (viewingDoc && !isSpecial) {
      setTextPreview(null);
      fetch(viewingDoc.url)
        .then(res => res.text())
        .then(text => {
          if (text.length > 5000000) {
            setTextPreview(text.substring(0, 5000000) + "\n\n... (File truncated due to size)");
          } else {
            setTextPreview(text);
          }
        })
        .catch(err => {
          console.error("Text Preview Error:", err);
          setTextPreview("Failed to load text content.");
        });
    }
  }, [viewingDoc]);

  return (
    <div className="flex h-full w-full bg-secondary relative overflow-hidden">

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-maintext truncate max-w-md">{viewingDoc.name}</h3>
                    <p className="text-xs text-subtext">
                      {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                        ? 'Image Preview'
                        : 'File Preview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(viewingDoc.url, viewingDoc.name)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-subtext"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-subtext"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden">
                {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc.url.startsWith('data:image/') ? (
                  <img
                    src={viewingDoc.url}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                ) : viewingDoc.name.match(/\.(docx|doc)$/i) ? (
                  <div
                    ref={docContainerRef}
                    className="bg-gray-100 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center py-8"
                  />
                ) : viewingDoc.name.match(/\.(xls|xlsx|csv)$/i) ? (
                  <div
                    className="bg-white w-full h-full overflow-auto p-4 custom-scrollbar text-black text-sm"
                    dangerouslySetInnerHTML={{ __html: excelHTML || '<div class="flex items-center justify-center h-full"><div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>' }}
                  />
                ) : viewingDoc.name.endsWith('.pdf') || viewingDoc.url.startsWith('data:application/pdf') ? (
                  <iframe
                    src={viewingDoc.url}
                    className="w-full h-full border-0"
                    title="Document Viewer"
                  />
                ) : viewingDoc.name.match(/\.(mp4|webm|ogg|mov)$/i) || viewingDoc.type.startsWith('video/') ? (
                  <video controls className="max-w-full max-h-full rounded-lg shadow-lg" src={viewingDoc.url}>
                    Your browser does not support the video tag.
                  </video>
                ) : viewingDoc.name.match(/\.(mp3|wav|ogg|m4a)$/i) || viewingDoc.type.startsWith('audio/') ? (
                  <div className="p-10 bg-surface rounded-2xl flex flex-col items-center gap-6 shadow-md border border-border">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-slow">
                      <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-1">{viewingDoc.name}</h3>
                      <p className="text-xs text-subtext">Audio File Player</p>
                    </div>
                    <audio controls className="w-full min-w-[300px]" src={viewingDoc.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e1e] p-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42] shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#cccccc] uppercase tracking-wider">
                          {viewingDoc.name.match(/\.(rar|zip|exe|dll|bin|iso|7z)$/i) ? 'BINARY CONTENT' : 'CODE READER'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e639c] text-white font-mono shadow-sm">
                        {viewingDoc.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar p-4">
                      <code className="text-xs font-mono whitespace-pre-wrap text-[#9cdcfe] break-all leading-relaxed tab-4 block">
                        {textPreview || "Reading file stream..."}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Editor */}
      <AnimatePresence>
        {isEditingImage && selectedFile && (
          <ImageEditor
            file={selectedFile}
            onClose={() => setIsEditingImage(false)}
            onSave={(newFile) => {
              processFile(newFile);
              setIsEditingImage(false);
              toast.success("Image updated!");
            }}
          />
        )}
      </AnimatePresence>

      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        toolType={selectedToolType}
        currentModel={selectedToolType ? toolModels[selectedToolType] : 'gemini-flash'}
        onSelectModel={handleModelSelect}
        pricing={TOOL_PRICING}
      />



      {/* Main Area */}
      <div
        className="flex-1 flex flex-col relative bg-gradient-to-br from-secondary via-background to-secondary/50 w-full min-w-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary flex flex-col items-center justify-center pointer-events-none">
            <Cloud className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-primary">Drop to Upload</h3>
          </div>
        )}

        {/* Header */}
        <div className="h-12 md:h-14 border-b border-border flex items-center justify-between px-3 md:px-4 bg-secondary z-10 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setTglState(prev => ({ ...prev, sidebarOpen: true }))}
              className="lg:hidden p-2 -ml-2 text-subtext hover:text-maintext rounded-lg hover:bg-surface/50 transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Mode Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300"
            style={{
              backgroundColor: `${getModeColor(isDeepSearch ? 'DEEP_SEARCH' : currentMode)}15`,
              color: getModeColor(isDeepSearch ? 'DEEP_SEARCH' : currentMode)
            }}
          >
            <span>{getModeIcon(isDeepSearch ? 'DEEP_SEARCH' : currentMode)}</span>
            <span className="hidden sm:inline">{getModeName(isDeepSearch ? 'DEEP_SEARCH' : currentMode)}</span>
          </div>
        </div>



        {/* <button className="flex items-center gap-2 text-subtext hover:text-maintext text-sm">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Device</span>
            </button> */}



        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className={`relative flex-1 overflow-y-auto p-2 sm:p-4 md:p-5 pb-32 md:pb-40 space-y-2.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent ${personalizations?.personalization?.fontStyle === 'Serif' ? 'font-serif' :
            personalizations?.personalization?.fontStyle === 'Mono' ? 'font-mono' :
              personalizations?.personalization?.fontStyle === 'Rounded' ? 'font-rounded' :
                personalizations?.personalization?.fontStyle === 'Sans' ? 'font-sans' : ''
            } aisa-scalable-text`}
        >
          {messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-32 md:pb-40 animate-in fade-in duration-700">
              <div className="mb-6 hover:scale-110 transition-transform duration-300">
                <img
                  src="/logo/Logo.svg"
                  alt="AISA Icon"
                  className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-2xl"
                />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-maintext tracking-tight max-w-2xl leading-relaxed drop-shadow-sm px-4">
                {t('welcomeMessage')}
              </h2>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`group relative flex items-start gap-2 md:gap-3 w-full max-w-3xl mx-auto cursor-pointer ${msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                >
                  {/* Actions Menu (Always visible for discoverability) */}

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                      }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <div
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'
                      } max-w-[90%] sm:max-w-[85%] md:max-w-[80%]`}
                  >
                    <div
                      className={`group/bubble relative px-4 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] leading-relaxed whitespace-pre-wrap break-words shadow-sm w-fit max-w-full transition-all duration-300 min-h-[40px] hover:scale-[1.005] ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-[#6366f1] text-white rounded-tr-sm shadow-md shadow-primary/20'
                        : `bg-surface border border-border/40 text-maintext rounded-tl-sm shadow-sm hover:shadow-md ${msg.id === typingMessageId ? 'ai-typing-glow ai-typing-shimmer outline outline-offset-1 outline-primary/20' : ''}`
                        }`}
                    >

                      {msg.isProcessing && (
                        <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10 animate-pulse">
                          <Loader size="sm" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-tighter">Preparing Audio...</span>
                        </div>
                      )}

                      {/* Attachment Display */}
                      {((msg.attachments && msg.attachments.length > 0) || msg.attachment) && (
                        <div className="flex flex-col gap-3 mb-3 mt-1">
                          {(msg.attachments || (msg.attachment ? [msg.attachment] : [])).map((att, idx) => (
                            <div key={idx} className="w-full">
                              {att.type === 'image' ? (
                                <div
                                  className="relative group/image overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all hover:scale-[1.01] cursor-pointer max-w-[320px]"
                                  onClick={() => setViewingDoc(att)}
                                >
                                  <img
                                    src={att.url}
                                    alt="Attachment"
                                    className="w-full h-auto max-h-[400px] object-contain bg-black/5"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(att.url, att.name);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${msg.role === 'user' ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-secondary/30 border-border hover:bg-secondary/50'}`}>
                                  <div
                                    className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer p-0.5 rounded-lg"
                                    onClick={() => setViewingDoc(att)}
                                  >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${(() => {
                                      const name = (att.name || '').toLowerCase();
                                      if (msg.role === 'user') return 'bg-white shadow-sm';
                                      if (name.endsWith('.pdf')) return 'bg-red-50 dark:bg-red-900/20';
                                      if (name.match(/\.(doc|docx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                                      if (name.match(/\.(xls|xlsx|csv)$/)) return 'bg-emerald-50 dark:bg-emerald-900/20';
                                      if (name.match(/\.(ppt|pptx)$/)) return 'bg-orange-50 dark:bg-orange-900/20';
                                      return 'bg-secondary';
                                    })()}`}>
                                      {(() => {
                                        const name = (att.name || '').toLowerCase();
                                        const baseClass = "w-6 h-6";
                                        if (name.match(/\.(xls|xlsx|csv)$/)) return <FileSpreadsheet className={`${baseClass} text-emerald-600`} />;
                                        if (name.match(/\.(ppt|pptx)$/)) return <Presentation className={`${baseClass} text-orange-600`} />;
                                        if (name.endsWith('.pdf')) return <FileText className={`${baseClass} text-red-600`} />;
                                        if (name.match(/\.(doc|docx)$/)) return <File className={`${baseClass} text-blue-600`} />;
                                        return <File className={`${baseClass} text-primary`} />;
                                      })()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold truncate text-xs mb-0.5">{att.name || 'File'}</p>
                                      <p className="text-[10px] opacity-70 uppercase tracking-tight font-medium">
                                        {(() => {
                                          const name = (att.name || '').toLowerCase();
                                          if (name.endsWith('.pdf')) return 'PDF • Preview';
                                          if (name.match(/\.(doc|docx)$/)) return 'WORD • Preview';
                                          if (name.match(/\.(xls|xlsx|csv)$/)) return 'EXCEL';
                                          if (name.match(/\.(ppt|pptx)$/)) return 'SLIDES';
                                          return 'DOCUMENT';
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(att.url, att.name);
                                    }}
                                    className={`p-2 rounded-lg transition-colors shrink-0 ${msg.role === 'user' ? 'hover:bg-white/20 text-white' : 'hover:bg-primary/10 text-primary'}`}
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}






                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-3 min-w-[200px] w-full">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white/10 text-white rounded-xl p-3 text-sm focus:outline-none resize-none border border-white/20 placeholder-white/50"
                            rows={2}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit(msg);
                              }
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <div className="flex gap-3 justify-end items-center">
                            <button
                              onClick={cancelEdit}
                              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(msg)}
                              className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.content && (
                          <div id={`msg-text-${msg.id}`} className={`max-w-full break-words leading-relaxed whitespace-normal ${msg.role === 'user' ? 'text-white' : 'text-maintext'}`}>
                            {msg.role === 'user' && msg.mode === MODES.DEEP_SEARCH && (
                              <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-white/20 rounded-lg w-fit">
                                <Search size={10} className="text-white" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Deep Search</span>
                              </div>
                            )}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => {
                                  const isInternal = href && href.startsWith('/');
                                  return (
                                    <a
                                      href={href}
                                      onClick={(e) => {
                                        if (isInternal) {
                                          e.preventDefault();
                                          navigate(href);
                                        }
                                      }}
                                      className="text-primary hover:underline font-bold cursor-pointer"
                                      target={isInternal ? "_self" : "_blank"}
                                      rel={isInternal ? "" : "noopener noreferrer"}
                                    >
                                      {children}
                                    </a>
                                  );
                                },
                                p: ({ children }) => <p className={`mb-1.5 last:mb-0 ${msg.role === 'user' ? 'm-0 leading-normal' : 'leading-relaxed'}`}>{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 last:mb-0 space-y-1.5 marker:text-subtext">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 last:mb-0 space-y-1.5 marker:text-subtext">{children}</ol>,
                                li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
                                h1: ({ children }) => <h1 className="font-bold mb-2 mt-3 block text-[1.25em]">{children}</h1>,
                                h2: ({ children }) => <h2 className="font-bold mb-1.5 mt-2 block text-[1.15em]">{children}</h2>,
                                h3: ({ children }) => <h3 className="font-bold mb-1 mt-1.5 block text-[1.05em]">{children}</h3>,
                                strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                                code: ({ node, inline, className, children, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const lang = match ? match[1] : '';

                                  if (!inline && match) {
                                    return (
                                      <div className="rounded-xl overflow-hidden my-2 border border-border bg-[#1e1e1e] shadow-md w-full max-w-full">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
                                          <span className="text-xs font-mono text-gray-300 lowercase">{lang}</span>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                              toast.success("Code copied!");
                                            }}
                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy code
                                          </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto custom-scrollbar bg-[#1e1e1e]">
                                          <code className={`${className} font-mono text-[0.9em] leading-relaxed text-[#d4d4d4] block min-w-full`} {...props}>
                                            {children}
                                          </code>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-primary font-bold mx-0.5" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                img: ({ node, ...props }) => {
                                  // Check if this image is actually a video thumbnail or if we have a video URL in the message
                                  // For now, we assume this renderer handles static images from markdown.
                                  // Actual Dynamic Video/Image rendering is handled by the msg properties check below.
                                  return (
                                    <div className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm">
                                      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-0 group-hover/generated:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Generated Asset</span>
                                        </div>
                                      </div>
                                      <img
                                        {...props}
                                        className="w-full max-w-full h-auto rounded-xl bg-black/5"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.src = 'https://placehold.co/600x400?text=Image+Generating...';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/generated:opacity-100 transition-opacity pointer-events-none" />
                                      <button
                                        onClick={() => handleDownload(props.src, 'aisa-generated.png')}
                                        className="absolute bottom-3 right-3 p-2.5 bg-primary text-white rounded-xl opacity-0 group-hover/generated:opacity-100 transition-all hover:bg-primary/90 shadow-lg border border-white/20 scale-90 group-hover/generated:scale-100"
                                        title="Download High-Res"
                                      >
                                        <div className="flex items-center gap-2 px-1">
                                          <Download className="w-4 h-4" />
                                          <span className="text-[10px] font-bold uppercase">Download</span>
                                        </div>
                                      </button>
                                    </div>
                                  )
                                },
                              }}
                            >
                              {msg.content || msg.text || ""}
                            </ReactMarkdown>

                            {/* Dynamic Video Rendering */}
                            {msg.videoUrl && (
                              <div className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm">
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-0 group-hover/generated:opacity-100 transition-opacity pointer-events-none">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Generated Video</span>
                                  </div>
                                </div>

                                <video
                                  src={msg.videoUrl}
                                  controls
                                  autoPlay
                                  loop
                                  className="w-full max-w-full h-auto rounded-xl bg-black/5"
                                />

                                <div className="absolute bottom-3 right-14 pointer-events-auto">
                                  {/* Additional controls if needed */}
                                </div>

                                <button
                                  onClick={() => handleDownload(msg.videoUrl, 'aisa-generated-video.mp4')}
                                  className="absolute bottom-3 right-3 p-2.5 bg-primary text-white rounded-xl opacity-0 group-hover/generated:opacity-100 transition-all hover:bg-primary/90 shadow-lg border border-white/20 scale-90 group-hover/generated:scale-100 z-20"
                                  title="Download Video"
                                >
                                  <div className="flex items-center gap-2 px-1">
                                    <Download className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">Download</span>
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* Dynamic Image Rendering (if not in markdown) */}
                            {msg.imageUrl && !msg.content.includes(msg.imageUrl) && (
                              <div className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm">
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-0 group-hover/generated:opacity-100 transition-opacity">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Generated Asset</span>
                                  </div>
                                </div>
                                <img
                                  src={msg.imageUrl}
                                  className="w-full max-w-full h-auto rounded-xl bg-black/5"
                                  loading="lazy"
                                />
                                <button
                                  onClick={() => handleDownload(msg.imageUrl, 'aisa-generated.png')}
                                  className="absolute bottom-3 right-3 p-2.5 bg-primary text-white rounded-xl opacity-0 group-hover/generated:opacity-100 transition-all hover:bg-primary/90 shadow-lg border border-white/20 scale-90 group-hover/generated:scale-100"
                                  title="Download High-Res"
                                >
                                  <div className="flex items-center gap-2 px-1">
                                    <Download className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">Download</span>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* File Conversion Download Button */}
                      {msg.conversion && msg.conversion.file && (
                        <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
                          {/* Integrated Audio Player for Voice Conversations */}
                          {msg.conversion.mimeType.startsWith('audio/') && (
                            <div className="bg-primary/5 rounded-xl p-2 border border-primary/10 mb-2">
                              <audio
                                controls
                                className="w-full h-10 accent-primary rounded-lg"
                                src={msg.conversion.blobUrl || `data:${msg.conversion.mimeType};base64,${msg.conversion.file}`}
                              >
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}

                          <div className="flex items-center justify-between px-1 py-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-maintext truncate">{msg.conversion.fileName}</p>
                              <p className="text-[10px] text-subtext font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
                                  {msg.conversion.fileSize || "Ready"}
                                </span>
                                {msg.conversion.charCount && (
                                  <span className="px-1.5 py-0.5 bg-secondary/30 text-subtext rounded-md border border-border/50">
                                    {msg.conversion.charCount} CHARS
                                  </span>
                                )}
                                AUDIO • MP3
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => {
                                const downloadToast = toast.loading("Starting download...");
                                try {
                                  // Create download link
                                  const byteCharacters = atob(msg.conversion.file);
                                  const byteNumbers = new Array(byteCharacters.length);
                                  for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);
                                  const blob = new Blob([byteArray], { type: msg.conversion.mimeType });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = msg.conversion.fileName;
                                  document.body.appendChild(a);
                                  a.click();
                                  setTimeout(() => {
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast.dismiss(downloadToast);
                                    toast.success("Download complete!");
                                  }, 500);
                                } catch (err) {
                                  toast.dismiss(downloadToast);
                                  toast.error("Download failed");
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl transition-all hover:bg-primary/90 shadow-sm font-bold text-sm active:scale-95"
                            >
                              <Download className="w-4 h-4" />
                              Download Audio
                            </button>

                            <Menu as="div" className="relative">
                              <Menu.Button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border text-maintext rounded-xl transition-all hover:bg-hover font-bold text-sm shadow-sm active:scale-95 whitespace-nowrap">
                                <Share className="w-4 h-4" />
                                Share
                              </Menu.Button>

                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right divide-y divide-border rounded-xl bg-surface shadow-2xl border border-border focus:outline-none z-[100] overflow-hidden">
                                  <div className="px-1 py-1">

                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            const text = `I've converted "${msg.conversion.fileName}" into voice audio using AISA! ${window.location.href}`;
                                            const url = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                                              ? `whatsapp://send?text=${encodeURIComponent(text)}`
                                              : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                                            window.open(url, '_blank');
                                          }}
                                          className={`${active ? 'bg-green-500 text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                          WhatsApp
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            const text = `AISA Audio Conversion: ${msg.conversion.fileName}`;
                                            const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
                                            window.open(url, '_blank');
                                          }}
                                          className={`${active ? 'bg-sky-500 text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                        >
                                          <Send className="h-4 w-4" />
                                          Telegram
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                  <div className="px-1 py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success("Link copied!");
                                          }}
                                          className={`${active ? 'bg-primary text-white' : 'text-maintext'} group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                        >
                                          <Copy className="h-4 w-4" />
                                          Copy Link
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        </div>
                      )}

                      {/* AI Feedback Actions */}
                      {msg.role !== 'user' && !msg.conversion && (
                        <div className="mt-4 pt-3 border-t border-border/40 w-full block">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                            {(() => {
                              // Detect if the AI response contains Hindi (Devanagari script)
                              const isHindiContent = /[\u0900-\u097F]/.test(msg.content);
                              const prompts = isHindiContent ? FEEDBACK_PROMPTS.hi : FEEDBACK_PROMPTS.en;
                              const promptIndex = (msg.id.toString().charCodeAt(msg.id.toString().length - 1) || 0) % prompts.length;
                              return (
                                <p className="text-xs text-subtext font-medium flex items-center gap-1.5 shrink-0 m-0">
                                  {prompts[promptIndex]}
                                  <span className="text-sm">😊</span>
                                </p>
                              );
                            })()}
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <button
                                onClick={() => {
                                  // Pass message ID to speakResponse for tracking
                                  const isHindi = /[\u0900-\u097F]/.test(msg.content);
                                  speakResponse(msg.content, isHindi ? 'Hindi' : 'English', msg.id);
                                }}
                                className={`transition-colors p-1.5 rounded-lg ${speakingMessageId === msg.id
                                  ? 'text-primary bg-primary/10'
                                  : 'text-subtext hover:text-primary hover:bg-surface-hover'
                                  }`}
                                title={speakingMessageId === msg.id && !isPaused ? "Pause" : "Speak"}
                              >
                                {speakingMessageId === msg.id && !isPaused ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyMessage(msg.content)}
                                className="text-subtext hover:text-maintext transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                title="Copy"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleThumbsUp(msg.id)}
                                className="text-subtext hover:text-primary transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                title="Helpful"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleThumbsDown(msg.id)}
                                className="text-subtext hover:text-red-500 transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                title="Not Helpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleShare(msg.content)}
                                className="text-subtext hover:text-primary transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
                                title="Share Text"
                              >
                                <Share className="w-3.5 h-3.5" />
                              </button>

                              {/* PDF Menu */}
                              <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button className="text-subtext hover:text-red-500 transition-colors flex items-center" disabled={pdfLoadingId === msg.id}>
                                  {pdfLoadingId === msg.id ? (
                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                </Menu.Button>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute bottom-full left-0 mb-2 w-36 origin-bottom-left divide-y divide-border rounded-xl bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                                    <div className="px-1 py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handlePdfAction('open', msg)}
                                            className={`${active ? 'bg-primary text-white' : 'text-maintext'
                                              } group flex w-full items-center rounded-md px-2 py-2 text-xs font-medium`}
                                          >
                                            Open PDF
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handlePdfAction('download', msg)}
                                            className={`${active ? 'bg-primary text-white' : 'text-maintext'
                                              } group flex w-full items-center rounded-md px-2 py-2 text-xs font-medium`}
                                          >
                                            Download
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handlePdfAction('share', msg)}
                                            className={`${active ? 'bg-primary text-white' : 'text-maintext'
                                              } group flex w-full items-center rounded-md px-2 py-2 text-xs font-medium`}
                                          >
                                            Share PDF
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-subtext mt-0 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Hover Actions - User Only (AI has footer) */}
                  {msg.role === 'user' && (
                    <div className={`flex items-center gap-1 transition-opacity duration-200 self-start mt-2 mr-0 flex-row-reverse ${activeMessageId === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>

                      <button
                        onClick={() => handleCopyMessage(msg.content || msg.text)}
                        className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {!msg.attachment && (
                        <button
                          onClick={() => startEditing(msg)}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {msg.attachment && (
                        <button
                          onClick={() => handleRenameFile(msg)}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {/* Only show Undo for the most recent user message if it's the last or second to last message in the whole chat */}
                      {msg.id === messages.findLast(m => m.role === 'user')?.id && (
                        <button
                          onClick={handleUndo}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                          title="Undo"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleMessageDelete(msg.id)}
                        className="p-1.5 text-subtext hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4 max-w-4xl mx-auto">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <Loader />

                  </div>
                  <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-surface border border-border flex items-center gap-3">
                    <span className="text-sm font-medium text-subtext animate-pulse">
                      {loadingText}
                    </span>
                    <div className="flex gap-1">
                      <span
                        className="w-1.5 h-1.5 bg-subtext/50 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 bg-subtext/50 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 bg-subtext/50 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-4 bg-transparent z-20">
          <div className="max-w-2xl mx-auto relative">

            {/* File Preview Area */}
            {filePreviews.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-4 px-2 overflow-x-auto custom-scrollbar no-scrollbar flex gap-3 pb-2 z-20 pointer-events-auto">
                {filePreviews.map((preview) => (
                  <div
                    key={preview.id}
                    className="relative shrink-0 w-64 md:w-72 bg-surface/95 dark:bg-zinc-900/95 border border-border/50 rounded-2xl p-2.5 flex items-center gap-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-300 ring-1 ring-black/5"
                  >
                    <div className="relative group shrink-0">
                      {preview.type.startsWith('image/') ? (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-border/50 bg-black/5">
                          <img src={preview.url} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                          <FileText className="w-7 h-7 text-primary" />
                        </div>
                      )}

                      <div className="absolute -top-2 -right-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(preview.id)}
                          className="p-1 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-surface"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 py-1">
                      <p className="text-sm font-semibold text-maintext truncate pr-1">{preview.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-lg uppercase tracking-wider font-bold">
                          {preview.type.split('/')[1]?.split('-')[0] || 'FILE'}
                        </span>
                        <span className="text-[10px] text-subtext font-medium">
                          {(preview.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative w-full max-w-2xl mx-auto flex items-end gap-1.5 sm:gap-2 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 rounded-2xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:border-primary/20 backdrop-blur-3xl px-2">
              <input
                id="file-upload"
                type="file"
                ref={uploadInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <input
                id="drive-upload"
                type="file"
                ref={driveInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <input
                id="doc-voice-upload"
                type="file"
                onChange={handleDocToVoiceSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <input
                id="photos-upload"
                type="file"
                ref={photosInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*"
              />
              <input
                id="camera-upload"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                capture="environment"
              />

              {/* Left Actions Group */}
              <div className="flex items-center gap-1 pl-1 pb-1.5">
                <AnimatePresence>
                  {isAttachMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      ref={menuRef}
                      className="absolute bottom-full left-0 mb-4 w-60 bg-surface/95 dark:bg-[#1a1a1a]/95 border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-30 backdrop-blur-xl ring-1 ring-black/5"
                    >
                      <div className="p-1.5 space-y-0.5">
                        {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canCamera && (
                          <label
                            htmlFor="camera-upload"
                            onClick={() => setTimeout(() => setIsAttachMenuOpen(false), 500)}
                            className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                              <Camera className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Camera & Scan</span>
                          </label>
                        )}
                        <label
                          htmlFor="file-upload"
                          onClick={() => setIsAttachMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                            <Paperclip className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Upload files</span>
                        </label>
                        <label
                          htmlFor="drive-upload"
                          onClick={() => setIsAttachMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/20 transition-colors shrink-0">
                            <Cloud className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Add from Drive</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  ref={attachBtnRef}
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isAttachMenuOpen ? 'bg-primary text-white rotate-45' : 'bg-secondary hover:bg-primary/10 text-subtext hover:text-primary'}`}
                  title="Add to chat"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    ref={toolsBtnRef}
                    onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isToolsMenuOpen || isImageGeneration || isDeepSearch || isAudioConvertMode ? 'bg-primary/10 text-primary scale-110' : 'bg-transparent text-subtext hover:text-primary hover:bg-secondary'}`}
                    title="AI Capabilities"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {isToolsMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        ref={toolsMenuRef}
                        className="absolute bottom-full left-0 mb-4 w-72 bg-surface/95 dark:bg-[#1a1a1a]/95 border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-30 backdrop-blur-xl ring-1 ring-black/5"
                      >
                        <div className="p-3 bg-secondary/30 border-b border-border/50 mb-1">
                          <h3 className="text-xs font-bold text-subtext uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary" /> AI Magic Tools
                          </h3>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <button
                            onClick={() => {
                              setIsToolsMenuOpen(false);
                              setIsImageGeneration(!isImageGeneration);
                              setIsDeepSearch(false);
                              setIsAudioConvertMode(false);
                              if (!isImageGeneration) toast.success("Image Generation Mode Enabled");
                            }}
                            className={`w-full text-left px-3 py-3 flex items-center gap-3 rounded-xl transition-all group cursor-pointer ${isImageGeneration ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                          >
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isImageGeneration ? 'bg-primary border-primary text-white' : 'bg-surface border-border group-hover:border-primary/30 group-hover:bg-primary/10'}`}>
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-bold text-maintext block">Generate Image</span>
                              <span className="text-[10px] text-subtext">Create beautiful visuals from text</span>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setIsToolsMenuOpen(false);
                              setIsDeepSearch(!isDeepSearch);
                              setIsImageGeneration(false);
                              setIsAudioConvertMode(false);
                              if (!isDeepSearch) toast.success("Deep Search Mode Enabled");
                            }}
                            className={`w-full text-left px-3 py-3 flex items-center gap-3 rounded-xl transition-all group cursor-pointer ${isDeepSearch ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                          >
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isDeepSearch ? 'bg-primary border-primary text-white' : 'bg-surface border-border group-hover:border-primary/30 group-hover:bg-primary/10'}`}>
                              <Search className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-bold text-maintext block">Deep Search</span>
                              <span className="text-[10px] text-subtext">Advanced web research & analysis</span>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setIsToolsMenuOpen(false);
                              setIsAudioConvertMode(!isAudioConvertMode);
                              setIsDeepSearch(false);
                              setIsImageGeneration(false);
                              if (!isAudioConvertMode) toast.success("Convert to Audio Mode Active");
                            }}
                            className={`w-full text-left px-3 py-3 flex items-center gap-3 rounded-xl transition-all group cursor-pointer ${isAudioConvertMode ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                          >
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isAudioConvertMode ? 'bg-primary border-primary text-white' : 'bg-surface border-border group-hover:border-primary/30 group-hover:bg-primary/10'}`}>
                              <Headphones className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-bold text-maintext block">Convert to Audio</span>
                              <span className="text-[10px] text-subtext">Turn documents into speech</span>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="relative flex-1 min-w-0 py-2">
                <AnimatePresence>
                  {(isDeepSearch || isImageGeneration || isVoiceMode || isAudioConvertMode) && (
                    <div className="absolute bottom-full left-0 mb-3 flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto w-full">
                      {isDeepSearch && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-sky-500/10 text-sky-600 rounded-full text-xs font-bold border border-sky-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <Search size={12} strokeWidth={3} /> <span className="hidden sm:inline">Deep Search</span>
                          <button onClick={() => setIsDeepSearch(false)} className="ml-1 hover:text-sky-800"><X size={12} /></button>
                        </motion.div>
                      )}
                      {isImageGeneration && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-pink-500/10 text-pink-600 rounded-full text-xs font-bold border border-pink-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <ImageIcon size={12} strokeWidth={3} /> <span className="hidden sm:inline">Image Gen</span>
                          <button onClick={() => setIsImageGeneration(false)} className="ml-1 hover:text-pink-800"><X size={12} /></button>
                        </motion.div>
                      )}
                      {isVoiceMode && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold border border-blue-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <Volume2 size={12} strokeWidth={3} /> <span className="hidden sm:inline">Voice Mode</span>
                          <button onClick={() => setIsVoiceMode(false)} className="ml-1 hover:text-blue-800"><X size={12} /></button>
                        </motion.div>
                      )}
                      {isAudioConvertMode && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-bold border border-indigo-500/20 backdrop-blur-md whitespace-nowrap shrink-0">
                          <Headphones size={12} strokeWidth={3} /> <span className="hidden sm:inline">Audio Convert</span>
                          <button onClick={() => setIsAudioConvertMode(false)} className="ml-1 hover:text-indigo-800"><X size={12} /></button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </AnimatePresence>

                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputValue.trim() || selectedFiles.length > 0) {
                        handleSendMessage(e);
                      }
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder={isAudioConvertMode ? "Enter text..." : "Ask AISA..."}
                  rows={1}
                  className={`w-full bg-transparent border-0 focus:ring-0 outline-none focus:outline-none p-0 text-maintext placeholder-subtext/50 resize-none overflow-y-auto custom-scrollbar leading-relaxed ${personalizations?.personalization?.fontStyle === 'Serif' ? 'font-serif' :
                    personalizations?.personalization?.fontStyle === 'Mono' ? 'font-mono' :
                      personalizations?.personalization?.fontStyle === 'Rounded' ? 'font-rounded' :
                        personalizations?.personalization?.fontStyle === 'Sans' ? 'font-sans' : ''} aisa-scalable-text`}
                  style={{ minHeight: '24px', maxHeight: '150px' }}
                />
              </div>

              {/* Right Actions Group */}
              <div className="flex items-center gap-1.5 sm:gap-2 pr-1 pb-1.5">
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mr-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-600 uppercase">REC</span>
                  </div>
                )}

                {!isListening && (
                  <>
                    {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canVideo && !inputValue.trim() && (
                      <button
                        type="button"
                        onClick={() => setIsLiveMode(true)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-subtext hover:text-primary hover:bg-secondary transition-colors"
                        title="Live Video Call"
                      >
                        <Video className="w-5 h-5" />
                      </button>
                    )}

                    {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canVoice && (
                      <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-subtext hover:text-primary hover:bg-secondary'}`}
                        title="Voice Input"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}

                {isLoading ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (abortControllerRef.current) abortControllerRef.current.abort();
                      setIsLoading(false);
                      isSendingRef.current = false;
                    }}
                    className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {messages.length > 1 && !inputValue.trim() && (
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-subtext hover:text-primary hover:bg-secondary transition-colors"
                        title="Undo"
                      >
                        <Undo2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={(!inputValue.trim() && filePreviews.length === 0) || isLoading}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${(!inputValue.trim() && filePreviews.length === 0) ? 'bg-secondary text-subtext/50 shadow-none' : 'bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-primary/30 hover:scale-105 hover:shadow-primary/40'}`}
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Live AI Modal */}
        <AnimatePresence>
          {isLiveMode && (
            <LiveAI
              onClose={() => setIsLiveMode(false)}
              language={currentLang}
            />
          )}
        </AnimatePresence>

        {/* Feedback Modal */}
        <Transition appear show={feedbackOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setFeedbackOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-maintext flex justify-between items-center"
                    >
                      Share feedback
                      <button onClick={() => setFeedbackOpen(false)} className="text-subtext hover:text-maintext">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Title>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Incorrect or incomplete", "Not what I asked for", "Slow or buggy", "Style or tone", "Safety or legal concern", "Other"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleFeedbackCategory(cat)}
                          className={`text-xs px-3 py-2 rounded-full border transition-colors ${feedbackCategory.includes(cat)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-subtext border-border hover:border-maintext'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <textarea
                        className="w-full bg-black/5 dark:bg-white/5 rounded-xl p-3 text-sm focus:outline-none border border-transparent focus:border-border text-maintext placeholder-subtext resize-none"
                        rows={3}
                        placeholder="Share details (optional)"
                        value={feedbackDetails}
                        onChange={(e) => setFeedbackDetails(e.target.value)}
                      />
                    </div>

                    <div className="mt-4 text-[10px] text-subtext leading-tight">
                      Your conversation will be included with your feedback to help improve the AI.
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/75"
                        onClick={submitFeedback}
                      >
                        Submit
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div >
    </div >
  );
};

export default Chat;
