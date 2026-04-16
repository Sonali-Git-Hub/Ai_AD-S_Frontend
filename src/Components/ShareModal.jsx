import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Copy, Check, MessageCircle, Mail, Send, Share2, Globe, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, shareId, sessionTitle }) => {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}/share/${shareId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-[#25D366]',
      action: () => {
        const text = `Check out this chat on AISA: ${sessionTitle}\n\n${shareLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-blue-500',
      action: () => {
        const subject = `Shared Chat: ${sessionTitle}`;
        const body = `Check out this interesting conversation on AISA:\n\n${shareLink}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    },
    {
      name: 'Telegram',
      icon: <Send className="w-5 h-5" />,
      color: 'bg-[#0088cc]',
      action: () => {
        const text = `Check out this chat on AISA: ${sessionTitle}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`, '_blank');
      }
    }
  ];

  return (
    <Transition grow show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-[#171717] p-6 shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                        Share Chat
                      </Dialog.Title>
                      <p className="text-xs text-subtext font-medium">Anyone with this link can view the chat</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-subtext"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Share Link Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">
                      Shareable Link
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={shareLink}
                        className="block w-full pl-10 pr-24 py-3.5 bg-slate-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-maintext focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      />
                      <button
                        onClick={handleCopy}
                        className={`absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm ${
                          copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-primary text-white hover:opacity-90 active:scale-95'
                        }`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Social Share Options */}
                  <div className="space-y-4 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-subtext text-center">
                      Or share via
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      {shareOptions.map((option) => (
                        <button
                          key={option.name}
                          onClick={option.action}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div className={`w-12 h-12 ${option.color} rounded-2xl flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110 group-active:scale-95 group-hover:rotate-3`}>
                            {option.icon}
                          </div>
                          <span className="text-[10px] font-bold text-subtext uppercase tracking-wider group-hover:text-maintext transition-colors">
                            {option.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Public Note */}
                  <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-3 border border-primary/10">
                    <Globe className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-subtext leading-relaxed">
                      All messages in this conversation up to the moment you shared it will be visible to whoever has the link. Your account information is <b>never</b> shared.
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShareModal;
