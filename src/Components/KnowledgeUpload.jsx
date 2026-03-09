import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { UploadCloud, File, CheckCircle, X, Loader } from 'lucide-react';
import { API } from '../types';

const KnowledgeUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState('');

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setUploadStatus(null);
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus(null);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadEndpoint = `${API}/aibase/knowledge/upload`;
            const response = await axios.post(uploadEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            if (response.data.success) {
                setUploadStatus('success');
                if (onUploadSuccess) onUploadSuccess(response.data.data);
            }
        } catch (error) {
            setUploadStatus('error');
            setErrorMessage(error.response?.data?.message || 'Failed to upload document.');
        } finally {
            setIsUploading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setUploadStatus(null);
        setUploadProgress(0);
        setErrorMessage('');
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Vertex AI Knowledge Base
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                    Upload documents to your AISA knowledge base for advanced retrieval-augmented generation (RAG).
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!file && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer group hover:bg-slate-800/50 ${isDragActive ? 'border-purple-500 bg-slate-800/80' : 'border-slate-600 bg-slate-800/30'
                            }`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                            accept=".pdf,.docx,.xlsx,.pptx,.txt,image/*"
                        />

                        <motion.div
                            animate={{ y: isDragActive ? -10 : 0, scale: isDragActive ? 1.1 : 1 }}
                            className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500/30 transition-all"
                        >
                            <UploadCloud className="w-8 h-8 text-purple-400" />
                        </motion.div>

                        <p className="text-slate-200 font-medium text-lg">
                            {isDragActive ? "Drop document here" : "Drag & drop document"}
                        </p>
                        <p className="text-slate-500 text-sm mt-2 font-medium">
                            or click to browse from device
                        </p>
                    </motion.div>
                )}

                {file && !uploadStatus && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <File className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                    <p className="text-slate-500 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            </div>

                            {!isUploading && (
                                <button
                                    onClick={resetUpload}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {isUploading && (
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                                    <span>Uploading to Google Cloud Storage...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${isUploading
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Upload to Knowledge Base</span>
                            )}
                        </button>
                    </motion.div>
                )}

                {uploadStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4"
                        >
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-emerald-400 mb-2">Upload Successful!</h3>
                        <p className="text-slate-300 mb-6">
                            Your document has been stored in <strong>aisa_knowledge_base</strong> and is ready for Vertex AI RAG.
                        </p>
                        <button
                            onClick={resetUpload}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium border border-slate-700"
                        >
                            Upload Another Document
                        </button>
                    </motion.div>
                )}

                {uploadStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center"
                    >
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <X className="w-6 h-6 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Upload Failed</h3>
                        <p className="text-red-300 text-sm mb-6">{errorMessage}</p>
                        <button
                            onClick={resetUpload}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium border border-slate-700"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KnowledgeUpload;
