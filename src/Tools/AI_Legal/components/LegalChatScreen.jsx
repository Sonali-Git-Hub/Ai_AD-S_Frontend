import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Scale, Search, X, Clock, ChevronDown,
  ChevronRight, Copy, FileDown, Share2, Plus, ArrowLeft,
  Sparkles, FileText, Image as ImageIcon, RotateCcw, Check
} from 'lucide-react';
import { generateChatResponse } from '../../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── LEGAL SYSTEM INSTRUCTION (matches AISA-Mobile) ─────────────────────────
const LEGAL_SYSTEM_INSTRUCTION = `You are the AISA AI General Legal Chat Assistant. You are an expert in law. If a user uploads an image, PDF, or document, perform OCR, analyze the content, and provide structured legal insights. For Images: Provide a Summary, Key points, and Legal observations. For PDFs/Docs: Provide an Overview, Issues, and Recommendations. Never say you cannot view files. IMPORTANT: You must reply in the exact same language as the user's prompt (e.g., if the user asks in Hindi, reply in Hindi). If the user asks you to translate the previous response "in Hindi" or "hindi me batao", translate the current context to Hindi without hesitation.`;

// ─── CASE CATEGORIES FALLBACK ────────────────────────────────────────────────
const FALLBACK_CASE_CATEGORIES = [
  { name: 'Arbitration', lawType: 'Civil Law', sections: ['Section 7', 'Section 34'] },
  { name: 'Bail Application', lawType: 'Criminal Law', sections: ['Section 436', 'Section 437'] },
  { name: 'Breach of Contract', lawType: 'Contract Law', sections: ['Section 73', 'Section 74'] },
  { name: 'Cyber Crime', lawType: 'IT Act', sections: ['Section 43', 'Section 66'] },
  { name: 'Defamation', lawType: 'Criminal/Civil Law', sections: ['Section 499', 'Section 500'] },
  { name: 'Divorce', lawType: 'Family Law', sections: ['Section 13', 'Section 13B'] },
  { name: 'Contract Dispute', lawType: 'Contract Law', sections: ['Section 10', 'Section 23'] },
  { name: 'Intellectual Property Dispute', lawType: 'IP Law', sections: ['TM Act', 'Patent Act'] },
  { name: 'Medical Negligence Case', lawType: 'Consumer/Criminal Law', sections: ['Section 304A'] },
  { name: 'Money Laundering Trial', lawType: 'Financial Law', sections: ['PMLA 2002'] },
  { name: 'Online Fraud', lawType: 'IT Act', sections: ['Section 66C', 'Section 66D'] },
  { name: 'Real Estate regulatory case', lawType: 'RERA', sections: ['RERA Act 2016'] },
  { name: 'Sexual Harassment at Workplace', lawType: 'POSH Act', sections: ['POSH Act 2013'] },
  { name: 'Tax Evasion Dispute', lawType: 'Tax Law', sections: ['Section 276C'] },
  { name: 'Will & Probate Petition', lawType: 'Succession Law', sections: ['Indian Succession Act'] },
];

// ─── FORMAT TIME ─────────────────────────────────────────────────────────────
const safeFormatTime = (ts) => {
  if (!ts) return '';
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const LegalChatScreen = ({ onBack }) => {
  console.log("Legal Chat Screen Mounted");
  console.log("AI Legal General Chat Clicked");
  console.log("Current Theme:", document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  console.log("AI Legal Theme Applied");

  const toolName = 'General Legal Chat';
  const toolColor = '#4f46e5';
  const toolDesc = 'Professional legal discourse, situational guidance, and citation Q&A.';

  const chatIdRef = useRef(Date.now().toString(36) + Math.random().toString(36).substr(2));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: `Hello! I am your AI ${toolName}. ${toolDesc} How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date(),
      isIntro: true,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [showCasesSheet, setShowCasesSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // ─── AUTO SCROLL ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isTyping]);

  // ─── FOCUS INPUT ON MOUNT ──────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // ─── CHAT HISTORY ──────────────────────────────────────────────────────────
  const saveChatHistory = useCallback(async (msgs) => {
    try {
      const raw = localStorage.getItem('legal_chat_history');
      const currentList = raw ? JSON.parse(raw) : [];
      const newSessionItem = {
        chat_id: chatIdRef.current,
        toolName,
        timestamp: Date.now(),
        messages: msgs.map(m => ({ ...m, timestamp: m.timestamp?.toISOString?.() || m.timestamp }))
      };
      const existingIndex = currentList.findIndex(s => s.chat_id === chatIdRef.current);
      if (existingIndex >= 0) {
        currentList[existingIndex] = newSessionItem;
      } else {
        currentList.push(newSessionItem);
      }
      localStorage.setItem('legal_chat_history', JSON.stringify(currentList));
    } catch (e) {
      console.error('[LegalChatScreen] saveChatHistory failed', e);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) saveChatHistory(messages);
  }, [messages, saveChatHistory]);

  // ─── SEND MESSAGE ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text && !attachment) return;

    const userMsg = {
      id: Date.now().toString(),
      text: text || '',
      attachment: attachment ? { name: attachment.name, type: attachment.type } : null,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    const currentAttachment = attachment;
    setAttachment(null);

    try {
      const apiHistory = messages.filter(m => !m.isIntro).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      let apiAttachments = [];
      let promptText = text;

      if (currentAttachment?.dataUrl) {
        apiAttachments.push({
          url: currentAttachment.dataUrl,
          name: currentAttachment.name || 'uploaded_file',
          type: currentAttachment.type?.startsWith('image/') ? 'image' : 'document'
        });
        promptText = `[Attached File: ${currentAttachment.name}]\n${text || 'Please analyze this attachment.'}`;
      }

      console.log('[LegalChat] Sending message — attachments:', apiAttachments.length);

      const response = await generateChatResponse(
        apiHistory,
        promptText,
        LEGAL_SYSTEM_INSTRUCTION,
        apiAttachments,
        'English',
        null, // abortSignal
        null, // mode
        null, // sessionId
        null  // projectId
      );

      let responseText = '';
      if (typeof response === 'string') responseText = response;
      else if (response?.reply) responseText = response.reply;
      else if (response?.data?.reply) responseText = response.data.reply;
      else if (response?.text) responseText = response.text;
      else if (response && typeof response === 'object') responseText = JSON.stringify(response);
      if (!responseText) responseText = 'We could not process the response. Please try again.';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('[LegalChatScreen] API Error:', error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: error?.message || 'Unable to connect. Please check your connection and try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      console.log("AI Legal Chat Ready");
    }
  };

  // ─── SEND ON CASE SELECT ───────────────────────────────────────────────────
  const handleSelectCase = (item) => {
    setShowCasesSheet(false);
    const sectionsStr = item.sections?.length > 0
      ? `applicable sections: ${item.sections.join(', ')}`
      : 'relevant statutory provisions';
    setInputValue(`Explain this case: ${item.name} (${item.lawType}) and the ${sectionsStr}.`);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ─── FILE ATTACHMENT ───────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ─── COPY ──────────────────────────────────────────────────────────────────
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  };

  // ─── NEW CHAT ──────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    chatIdRef.current = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setMessages([{
      id: '1',
      text: `Hello! I am your AI ${toolName}. ${toolDesc} How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date(),
      isIntro: true,
    }]);
  };

  // ─── CASES FILTERED ────────────────────────────────────────────────────────
  const filteredCases = useMemo(() => {
    return FALLBACK_CASE_CATEGORIES.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lawType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sections?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="legal-chat-screen">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="legal-chat-header">
        <button className="legal-chat-back-btn" onClick={onBack} title="Back to Dashboard">
          <ArrowLeft size={20} />
        </button>
        <div className="legal-chat-header-info">
          <div className="legal-chat-header-icon">
            <Scale size={16} />
          </div>
          <div>
            <h1 className="legal-chat-header-title">{toolName}</h1>
            <span className="legal-chat-header-sub">AI Engine Active</span>
          </div>
        </div>
        <div className="legal-chat-header-actions">
          <button className="legal-chat-action-btn" onClick={handleNewChat} title="New Chat">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── MESSAGES ──────────────────────────────────────────────────── */}
      <div className="legal-chat-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`legal-msg-row ${isAi ? 'legal-msg-ai' : 'legal-msg-user'}`}
              >
                {isAi && (
                  <div className="legal-msg-avatar">
                    <Scale size={14} />
                  </div>
                )}
                <div className={`legal-msg-bubble ${isAi ? 'legal-bubble-ai' : 'legal-bubble-user'}`}>
                  {msg.attachment && (
                    <div className="legal-msg-attachment-chip">
                      <Paperclip size={12} />
                      <span>{msg.attachment.name}</span>
                    </div>
                  )}
                  {isAi ? (
                    <div className="legal-msg-ai-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="legal-msg-user-text">{msg.text}</p>
                  )}
                  <div className="legal-msg-footer">
                    <span className="legal-msg-time">{safeFormatTime(msg.timestamp)}</span>
                    {isAi && !msg.isIntro && (
                      <button
                        className="legal-msg-copy-btn"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="legal-msg-row legal-msg-ai"
          >
            <div className="legal-msg-avatar">
              <Scale size={14} />
            </div>
            <div className="legal-bubble-ai legal-typing-bubble">
              <div className="legal-typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR ─────────────────────────────────────────────────── */}
      <div className="legal-chat-input-area">
        {attachment && (
          <div className="legal-attachment-preview">
            <Paperclip size={14} style={{ color: toolColor }} />
            <span className="legal-attachment-name">{attachment.name}</span>
            <button className="legal-attachment-remove" onClick={() => setAttachment(null)}>
              <X size={14} />
            </button>
          </div>
        )}
        <form className="legal-chat-input-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <button
            type="button"
            className="legal-input-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip size={18} style={{ color: attachment ? toolColor : undefined }} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="legal-cases-btn"
            onClick={() => setShowCasesSheet(true)}
            title="Browse Cases"
          >
            <Scale size={14} />
            <span>Cases</span>
          </button>
          <textarea
            ref={inputRef}
            className="legal-chat-input"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Ask ${toolName}...`}
            rows={1}
          />
          <button
            type="submit"
            className="legal-send-btn"
            disabled={!inputValue.trim() && !attachment}
            style={{ backgroundColor: (!inputValue.trim() && !attachment) ? '#94a3b8' : toolColor }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* ── CASES BOTTOM SHEET ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCasesSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="legal-cases-overlay"
              onClick={() => setShowCasesSheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="legal-cases-sheet"
            >
              <div className="legal-cases-sheet-drag">
                <div className="legal-cases-drag-bar" />
              </div>
              <div className="legal-cases-sheet-header">
                <Scale size={20} style={{ color: toolColor }} />
                <h3>Browse Cases</h3>
                <button onClick={() => setShowCasesSheet(false)} className="legal-cases-close">
                  <X size={18} />
                </button>
              </div>
              <div className="legal-cases-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  className="legal-cases-search"
                  placeholder="Search cases, laws, sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="legal-cases-list">
                {filteredCases.map((c, i) => (
                  <button
                    key={i}
                    className="legal-case-item"
                    onClick={() => handleSelectCase(c)}
                  >
                    <div className="legal-case-item-icon">
                      <Scale size={14} />
                    </div>
                    <div className="legal-case-item-info">
                      <span className="legal-case-item-name">{c.name}</span>
                      <span className="legal-case-item-type">{c.lawType}</span>
                    </div>
                    <ChevronRight size={14} className="legal-case-item-arrow" />
                  </button>
                ))}
                {filteredCases.length === 0 && (
                  <p className="legal-cases-empty">No cases match your search.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .legal-chat-screen {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
        }
        .dark .legal-chat-screen { background: #0f172a; }

        /* ── HEADER ─────────────────────────────────────── */
        .legal-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #ffffff;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          flex-shrink: 0;
          z-index: 10;
        }
        .dark .legal-chat-header {
          background: #1e293b;
          border-bottom-color: rgba(255,255,255,0.06);
        }
        .legal-chat-back-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.04);
          border: none; cursor: pointer;
          color: #334155;
          transition: all 0.2s;
        }
        .dark .legal-chat-back-btn { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .legal-chat-back-btn:hover { background: rgba(0,0,0,0.08); }
        .dark .legal-chat-back-btn:hover { background: rgba(255,255,255,0.1); }
        .legal-chat-header-info { display: flex; align-items: center; gap: 10px; flex: 1; }
        .legal-chat-header-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
        }
        .legal-chat-header-title {
          font-size: 15px; font-weight: 800; margin: 0;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .dark .legal-chat-header-title { color: #f1f5f9; }
        .legal-chat-header-sub {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px;
          color: #4f46e5; opacity: 0.8;
        }
        .legal-chat-header-actions { display: flex; gap: 6px; }
        .legal-chat-action-btn {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.04);
          border: none; cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }
        .dark .legal-chat-action-btn { background: rgba(255,255,255,0.05); color: #94a3b8; }
        .legal-chat-action-btn:hover { color: #4f46e5; background: rgba(79,70,229,0.1); }

        /* ── MESSAGES ───────────────────────────────────── */
        .legal-chat-messages {
          flex: 1; overflow-y: auto; padding: 20px 16px 12px;
          display: flex; flex-direction: column; gap: 16px;
          scroll-behavior: smooth;
        }
        .legal-msg-row { display: flex; gap: 10px; max-width: 85%; }
        .legal-msg-ai { align-self: flex-start; }
        .legal-msg-user { align-self: flex-end; flex-direction: row-reverse; }
        .legal-msg-avatar {
          width: 30px; height: 30px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          color: white; margin-top: 2px;
        }
        .legal-msg-bubble { border-radius: 18px; padding: 12px 16px; max-width: 100%; }
        .legal-bubble-ai {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-bottom-left-radius: 6px;
        }
        .dark .legal-bubble-ai {
          background: #1e293b;
          border-color: rgba(255,255,255,0.06);
        }
        .legal-bubble-user {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border-bottom-right-radius: 6px;
        }
        .legal-msg-ai-text {
          font-size: 14px; line-height: 1.65;
          color: #1e293b;
        }
        .dark .legal-msg-ai-text { color: #e2e8f0; }
        .legal-msg-ai-text p { margin: 0 0 8px; }
        .legal-msg-ai-text p:last-child { margin-bottom: 0; }
        .legal-msg-ai-text strong { font-weight: 700; color: #0f172a; }
        .dark .legal-msg-ai-text strong { color: #f1f5f9; }
        .legal-msg-ai-text ul, .legal-msg-ai-text ol { margin: 4px 0; padding-left: 20px; }
        .legal-msg-ai-text li { margin-bottom: 4px; }
        .legal-msg-ai-text code {
          background: rgba(0,0,0,0.06);
          padding: 2px 6px; border-radius: 4px; font-size: 13px;
        }
        .dark .legal-msg-ai-text code { background: rgba(255,255,255,0.08); }
        .legal-msg-ai-text pre {
          background: #f1f5f9;
          padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0;
        }
        .dark .legal-msg-ai-text pre { background: #0f172a; }
        .legal-msg-ai-text pre code { background: none; padding: 0; }
        .legal-msg-ai-text table {
          width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px;
        }
        .legal-msg-ai-text th, .legal-msg-ai-text td {
          border: 1px solid rgba(0,0,0,0.1);
          padding: 6px 10px; text-align: left;
        }
        .dark .legal-msg-ai-text th, .dark .legal-msg-ai-text td {
          border-color: rgba(255,255,255,0.1);
        }
        .legal-msg-ai-text th {
          background: rgba(79,70,229,0.08);
          font-weight: 700;
        }
        .dark .legal-msg-ai-text th { background: rgba(79,70,229,0.15); }
        .legal-msg-user-text { margin: 0; font-size: 14px; line-height: 1.5; }
        .legal-msg-attachment-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 8px; margin-bottom: 6px;
          background: rgba(79,70,229,0.12); font-size: 12px; font-weight: 600;
          color: #4338ca;
        }
        .dark .legal-msg-attachment-chip { color: #c7d2fe; }
        .legal-msg-footer {
          display: flex; align-items: center; gap: 8px; margin-top: 6px;
        }
        .legal-msg-time {
          font-size: 10px; font-weight: 600; opacity: 0.5;
          color: inherit;
        }
        .legal-msg-copy-btn {
          background: none; border: none; cursor: pointer; padding: 2px;
          color: #94a3b8; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .dark .legal-msg-copy-btn { color: #64748b; }
        .legal-msg-copy-btn:hover { color: #4f46e5; }

        /* ── TYPING ─────────────────────────────────────── */
        .legal-typing-bubble { padding: 14px 20px !important; }
        .legal-typing-dots { display: flex; gap: 5px; align-items: center; }
        .legal-typing-dots span {
          width: 7px; height: 7px; border-radius: 50%; background: #4f46e5;
          animation: legalBounce 1.4s infinite ease-in-out both;
        }
        .legal-typing-dots span:nth-child(1) { animation-delay: 0s; }
        .legal-typing-dots span:nth-child(2) { animation-delay: 0.16s; }
        .legal-typing-dots span:nth-child(3) { animation-delay: 0.32s; }
        @keyframes legalBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* ── INPUT AREA ─────────────────────────────────── */
        .legal-chat-input-area {
          flex-shrink: 0; padding: 8px 12px calc(12px + env(safe-area-inset-bottom, 0px));
          background: #ffffff;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .dark .legal-chat-input-area {
          background: #1e293b;
          border-top-color: rgba(255,255,255,0.06);
        }
        .legal-attachment-preview {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px; margin-bottom: 8px;
          background: rgba(79,70,229,0.08);
          border-radius: 10px; font-size: 12px; font-weight: 600;
          color: #4338ca;
        }
        .dark .legal-attachment-preview { background: rgba(79,70,229,0.12); color: #c7d2fe; }
        .legal-attachment-name {
          flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .legal-attachment-remove {
          background: none; border: none; cursor: pointer; padding: 2px;
          color: #64748b; display: flex;
        }
        .dark .legal-attachment-remove { color: #94a3b8; }
        .legal-chat-input-form {
          display: flex; align-items: flex-end; gap: 6px;
          background: #f1f5f9;
          border-radius: 24px; padding: 6px 8px;
          border: 1px solid rgba(0,0,0,0.06);
          transition: border-color 0.2s;
        }
        .dark .legal-chat-input-form {
          background: #0f172a;
          border-color: rgba(255,255,255,0.06);
        }
        .legal-chat-input-form:focus-within {
          border-color: rgba(79,70,229,0.4);
        }
        .legal-input-icon-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          color: #94a3b8; flex-shrink: 0;
          transition: color 0.2s;
        }
        .dark .legal-input-icon-btn { color: #64748b; }
        .legal-input-icon-btn:hover { color: #4f46e5; }
        .legal-cases-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 5px 10px; border-radius: 20px;
          background: rgba(79,70,229,0.1); border: 1px solid rgba(79,70,229,0.2);
          color: #4f46e5; font-size: 11px; font-weight: 800;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          text-transform: uppercase; letter-spacing: 0.5px;
          transition: all 0.2s;
        }
        .legal-cases-btn:hover { background: rgba(79,70,229,0.18); }
        .legal-chat-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 14px; line-height: 1.5; resize: none;
          color: #1e293b;
          min-height: 34px; max-height: 120px; padding: 6px 4px;
          font-family: inherit;
        }
        .dark .legal-chat-input { color: #e2e8f0; }
        .legal-chat-input::placeholder { color: #94a3b8; }
        .dark .legal-chat-input::placeholder { color: #475569; }
        .legal-send-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; color: white; flex-shrink: 0;
          transition: all 0.2s;
        }
        .legal-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .legal-send-btn:not(:disabled):hover { transform: scale(1.05); }

        /* ── CASES SHEET ────────────────────────────────── */
        .legal-cases-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 1000; backdrop-filter: blur(4px);
        }
        .legal-cases-sheet {
          position: fixed; bottom: 0; left: 0; right: 0;
          max-height: 70vh; z-index: 1001;
          background: #ffffff;
          border-top-left-radius: 24px; border-top-right-radius: 24px;
          display: flex; flex-direction: column;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.15);
        }
        .dark .legal-cases-sheet { background: #1e293b; }
        .legal-cases-sheet-drag {
          display: flex; justify-content: center; padding: 10px 0 6px;
        }
        .legal-cases-drag-bar {
          width: 40px; height: 4px; border-radius: 2px;
          background: rgba(0,0,0,0.12);
        }
        .dark .legal-cases-drag-bar { background: rgba(255,255,255,0.15); }
        .legal-cases-sheet-header {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 20px 12px; font-weight: 800;
        }
        .legal-cases-sheet-header h3 {
          flex: 1; margin: 0; font-size: 16px;
          color: #0f172a;
        }
        .dark .legal-cases-sheet-header h3 { color: #f1f5f9; }
        .legal-cases-close {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: #94a3b8;
        }
        .dark .legal-cases-close { color: #64748b; }
        .legal-cases-search-wrap {
          display: flex; align-items: center; gap: 8px;
          margin: 0 16px 12px; padding: 8px 14px;
          background: rgba(0,0,0,0.04);
          border-radius: 12px;
          color: #94a3b8;
        }
        .dark .legal-cases-search-wrap { background: rgba(255,255,255,0.05); color: #64748b; }
        .legal-cases-search {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 13px; color: #1e293b;
        }
        .dark .legal-cases-search { color: #e2e8f0; }
        .legal-cases-search::placeholder { color: #94a3b8; }
        .dark .legal-cases-search::placeholder { color: #475569; }
        .legal-cases-list {
          flex: 1; overflow-y: auto; padding: 0 12px 20px;
        }
        .legal-case-item {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 14px; border: none;
          background: rgba(0,0,0,0.02);
          cursor: pointer; text-align: left; margin-bottom: 4px;
          transition: all 0.15s;
        }
        .dark .legal-case-item { background: rgba(255,255,255,0.03); }
        .legal-case-item:hover {
          background: rgba(79,70,229,0.06);
        }
        .dark .legal-case-item:hover { background: rgba(79,70,229,0.1); }
        .legal-case-item-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: rgba(79,70,229,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #4f46e5;
        }
        .dark .legal-case-item-icon { background: rgba(79,70,229,0.15); }
        .legal-case-item-info { flex: 1; min-width: 0; }
        .legal-case-item-name {
          display: block; font-size: 13px; font-weight: 700;
          color: #1e293b;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .dark .legal-case-item-name { color: #e2e8f0; }
        .legal-case-item-type {
          display: block; font-size: 11px; font-weight: 600;
          color: #94a3b8; margin-top: 2px;
        }
        .dark .legal-case-item-type { color: #64748b; }
        .legal-case-item-arrow { color: #cbd5e1; flex-shrink: 0; }
        .dark .legal-case-item-arrow { color: #475569; }
        .legal-cases-empty {
          text-align: center; padding: 30px; font-size: 13px;
          color: #94a3b8;
        }
        .dark .legal-cases-empty { color: #64748b; }

        /* ── RESPONSIVE ─────────────────────────────────── */
        /* Tiny phones (iPhone SE, Galaxy S8 — 320px-374px) */
        @media (max-width: 374px) {
          .legal-msg-row { max-width: 95%; }
          .legal-chat-messages { padding: 12px 8px 6px; gap: 10px; }
          .legal-chat-header { padding: 8px 10px; gap: 8px; }
          .legal-chat-header-icon { width: 28px; height: 28px; border-radius: 8px; }
          .legal-chat-header-title { font-size: 13px; }
          .legal-chat-input-area { padding: 5px 6px calc(6px + env(safe-area-inset-bottom, 0px)); }
          .legal-chat-input-form { padding: 4px 6px; border-radius: 20px; }
          .legal-chat-input { font-size: 13px; min-height: 30px; }
          .legal-input-icon-btn { width: 30px; height: 30px; }
          .legal-send-btn { width: 30px; height: 30px; }
          .legal-msg-bubble { padding: 10px 12px; border-radius: 14px; }
          .legal-msg-ai-text { font-size: 13px; line-height: 1.55; }
          .legal-msg-user-text { font-size: 13px; }
          .legal-msg-avatar { width: 26px; height: 26px; border-radius: 8px; }
          .legal-cases-btn span { display: none; }
          .legal-cases-btn { padding: 5px 6px; }
          .legal-chat-action-btn { width: 28px; height: 28px; }
          .legal-chat-back-btn { width: 32px; height: 32px; }
        }
        /* Small phones (375px-639px) */
        @media (min-width: 375px) and (max-width: 639px) {
          .legal-msg-row { max-width: 92%; }
          .legal-chat-messages { padding: 16px 10px 8px; gap: 12px; }
          .legal-chat-header { padding: 10px 12px; }
          .legal-chat-input-area { padding: 6px 8px calc(8px + env(safe-area-inset-bottom, 0px)); }
          .legal-cases-btn span { display: none; }
          .legal-cases-btn { padding: 6px 8px; }
        }
        /* Foldables & small tablets (600px-767px) */
        @media (min-width: 600px) and (max-width: 767px) {
          .legal-msg-row { max-width: 85%; }
          .legal-chat-messages { padding: 20px 16px 12px; gap: 14px; }
          .legal-chat-header { padding: 12px 20px; }
          .legal-chat-input-area { padding: 8px 14px calc(10px + env(safe-area-inset-bottom, 0px)); }
        }
        /* Tablets portrait (768px-1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .legal-msg-row { max-width: 80%; }
          .legal-chat-messages { padding: 24px 5% 14px; gap: 16px; }
          .legal-chat-header { padding: 14px 24px; }
          .legal-chat-input-area { padding: 10px 20px calc(12px + env(safe-area-inset-bottom, 0px)); }
          .legal-chat-input-form { max-width: 90%; margin: 0 auto; }
          .legal-cases-sheet { max-width: 420px; left: 50%; transform: translateX(-50%); }
        }
        /* Desktop (1024px-1279px) */
        @media (min-width: 1024px) {
          .legal-chat-messages { padding: 24px 8%; }
          .legal-msg-row { max-width: 72%; }
          .legal-cases-sheet { max-width: 480px; left: 50%; transform: translateX(-50%); }
        }
        /* Large desktop (1280px-1919px) */
        @media (min-width: 1280px) {
          .legal-chat-messages { padding: 28px 12%; }
          .legal-msg-row { max-width: 65%; }
          .legal-chat-input-form { max-width: 800px; margin: 0 auto; }
        }
        /* Ultra-wide / 4K (1920px+) */
        @media (min-width: 1920px) {
          .legal-chat-messages { padding: 32px 18%; }
          .legal-msg-row { max-width: 55%; }
          .legal-chat-input-form { max-width: 900px; }
          .legal-msg-ai-text { font-size: 15px; }
          .legal-msg-user-text { font-size: 15px; }
        }
        /* Landscape phones — reduce vertical space */
        @media (max-height: 500px) and (orientation: landscape) {
          .legal-chat-header { padding: 6px 12px; }
          .legal-chat-header-icon { width: 28px; height: 28px; }
          .legal-chat-input-area { padding: 4px 10px calc(4px + env(safe-area-inset-bottom, 0px)); }
          .legal-chat-input-form { padding: 4px 6px; }
          .legal-chat-input { min-height: 28px; max-height: 80px; }
          .legal-msg-row { max-width: 75%; }
          .legal-chat-messages { padding: 10px 8px 6px; gap: 8px; }
        }
      `}</style>
    </div>
  );
};

export default LegalChatScreen;
