import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatGenerationStore = create(
  persist(
    (set, get) => ({
      generations: {}, // { chatId: { isGenerating: bool, partialResponse: string, error: string, abortController: AbortController, startedAt: number } }

      startGeneration: (chatId) => {
        set((state) => ({
          generations: {
            ...state.generations,
            [chatId]: {
              chatId,
              isGenerating: true,
              isTitleGenerating: false, // Initial state
              partialResponse: '',
              suggestions: [],
              error: null,
              startedAt: Date.now(),
              completedAt: null,
            },
          },
        }));
      },

      setTitleGenerating: (chatId, isTitleGenerating) => {
        set((state) => {
          const gen = state.generations[chatId] || { 
            chatId, 
            isGenerating: false, 
            partialResponse: '', 
            error: null, 
            startedAt: Date.now() 
          };
          return {
            generations: {
              ...state.generations,
              [chatId]: {
                ...gen,
                isTitleGenerating,
              },
            },
          };
        });
      },

      updatePartialResponse: (chatId, token) => {
        set((state) => {
          const gen = state.generations[chatId];
          if (!gen) return state;
          return {
            generations: {
              ...state.generations,
              [chatId]: {
                ...gen,
                partialResponse: gen.partialResponse + token,
              },
            },
          };
        });
      },

      setPartialResponse: (chatId, fullText) => {
        set((state) => {
          const gen = state.generations[chatId];
          if (!gen) return state;
          return {
            generations: {
              ...state.generations,
              [chatId]: {
                ...gen,
                partialResponse: fullText,
              },
            },
          };
        });
      },

      setSuggestions: (chatId, suggestions) => {
        set((state) => {
          const gen = state.generations[chatId];
          if (!gen) return state;
          return {
            generations: {
              ...state.generations,
              [chatId]: {
                ...gen,
                suggestions: suggestions || [],
              },
            },
          };
        });
      },

      completeGeneration: (chatId) => {
        set((state) => {
          const gen = state.generations[chatId];
          if (!gen) return state;
          return {
            generations: {
              ...state.generations,
              [chatId]: {
                ...gen,
                isGenerating: false,
                completedAt: Date.now(),
              },
            },
          };
        });
      },

      setError: (chatId, error) => {
        set((state) => {
          const gen = state.generations[chatId];
          if (!gen) return state;
          return {
            generations: {
              ...state.generations,
              [chatId]: {
                ...gen,
                isGenerating: false,
                error,
              },
            },
          };
        });
      },

      removeGeneration: (chatId) => {
        set((state) => {
          const newGenerations = { ...state.generations };
          delete newGenerations[chatId];
          return { generations: newGenerations };
        });
      },

      clearAllGenerations: () => {
        set({ generations: {} });
      },

      // Selector: returns array of chatIds currently generating
      getActiveGeneratingIds: () => {
        const gens = get().generations;
        return Object.keys(gens).filter(id => gens[id]?.isGenerating);
      },

      isTitleGenerating: (chatId) => {
        return get().generations[chatId]?.isTitleGenerating || false;
      },
    }),
    {
      name: 'aisa-chat-generations',
      // Don't persist AbortControllers
      partialize: (state) => ({ generations: state.generations }),
      // On rehydrate, clear any stale isGenerating flags from previous sessions
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const gens = state.generations;
        let dirty = false;
        const cleaned = { ...gens };
        for (const id of Object.keys(cleaned)) {
          if (cleaned[id]?.isGenerating) {
            cleaned[id] = { ...cleaned[id], isGenerating: false };
            dirty = true;
          }
        }
        if (dirty) {
          state.generations = cleaned;
        }
      },
    }
  )
);
