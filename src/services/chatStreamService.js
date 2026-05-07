import { useChatGenerationStore } from '../userStore/useChatGenerationStore';
import { apis, MODES } from '../types';
import { getUserData } from '../userStore/userData';
import { chatStorageService } from './chatStorageService';

class ChatStreamService {
  constructor() {
    this.controllers = new Map();
  }

  async streamResponse(chatId, payload) {
    const store = useChatGenerationStore.getState();
    
    // Abort existing if any
    if (this.controllers.has(chatId)) {
      this.controllers.get(chatId).abort();
    }

    const abortController = new AbortController();
    this.controllers.set(chatId, abortController);

    store.startGeneration(chatId);

    try {
      const token = getUserData()?.token;
      const response = await fetch(apis.chatStream || `${apis.chatAgent}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ...payload, sessionId: chatId }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last partial line in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              await this._finalizeMessage(chatId, payload);
              store.completeGeneration(chatId);
              return;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                store.updatePartialResponse(chatId, data.token);
              }
              if (data.suggestions) {
                store.setSuggestions(chatId, data.suggestions);
              }
              if (data.error) {
                store.setError(chatId, data.error);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      }

      await this._finalizeMessage(chatId, payload);
      store.completeGeneration(chatId);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Stream error:', error);
        store.setError(chatId, error.message);
      }
    }
  }

  async _finalizeMessage(chatId, payload) {
    const store = useChatGenerationStore.getState();
    const generation = store.generations[chatId];
    if (!generation || !generation.partialResponse) return;

    const aiMsg = {
      id: `ai-${Date.now()}`,
      role: 'model',
      content: generation.partialResponse,
      suggestions: generation.suggestions || [],
      timestamp: Date.now(),
      mode: payload.mode || MODES.NORMAL_CHAT,
      projectId: payload.projectId
    };

    try {
      await chatStorageService.saveMessage(chatId, aiMsg, null, payload.projectId);
      
      // Notify UI to append the message to local state
      window.dispatchEvent(new CustomEvent('aisa-ai-message-finalized', {
        detail: { chatId, message: aiMsg }
      }));

      // Also generate title if it's a generic title (New Chat or Greeting Exchange)
      const currentTitle = payload.currentTitle || "New Chat";
      const isGeneric = currentTitle === "New Chat" || currentTitle === "Greeting Exchange" || currentTitle === "Greeting";
      
      if (payload.isFirstMessage || isGeneric) {
        store.setTitleGenerating(chatId, true);
        try {
          const newTitle = await chatStorageService.generateSessionTitle(chatId, payload.message);
          if (newTitle) {
            // Success - title updated on backend, local state will sync via getSessions or event
            window.dispatchEvent(new CustomEvent('aisa-chat-title-updated', {
              detail: { chatId, title: newTitle }
            }));
          }
        } finally {
          store.setTitleGenerating(chatId, false);
        }
      }
    } catch (err) {
      console.error("Failed to save streaming message:", err);
    }
  }

  stopGeneration(chatId) {
    const store = useChatGenerationStore.getState();
    if (this.controllers.has(chatId)) {
      this.controllers.get(chatId).abort();
      this.controllers.delete(chatId);
    }
    store.completeGeneration(chatId);
  }
}

export const chatStreamService = new ChatStreamService();
