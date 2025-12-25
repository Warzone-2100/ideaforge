import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Sparkles } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';

export default function ChatRefinement() {
  const { chatMessages, addChatMessage, features, updateFeature, addFeature } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addChatMessage({
      role: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      const result = await aiService.refineFeatures(userMessage, features.items);

      if (result.success) {
        // Add AI response
        addChatMessage({
          role: 'assistant',
          content: result.response,
        });

        // Apply any feature updates
        if (result.updates) {
          result.updates.forEach((update) => {
            if (update.action === 'modify' && update.id) {
              updateFeature(update.id, update.changes);
            } else if (update.action === 'add' && update.feature) {
              addFeature(update.feature);
            }
          });
        }
      } else {
        addChatMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        });
      }
    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: `Error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'Add a feature for user authentication',
    'Make the dashboard more detailed',
    'Suggest mobile-specific features',
    'What features would improve onboarding?',
  ];

  return (
    <div className="card flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <h3 className="text-[14px] font-medium text-zinc-200">Chat Refinement</h3>
        <p className="text-[11px] text-zinc-500">Ask AI to modify, add, or explain features</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-indigo-400/50 mb-3" />
            <p className="text-zinc-500 text-[13px] mb-4">
              Chat with AI to refine features
            </p>
            <div className="space-y-2 w-full">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400
                           text-[12px] hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] ${
                    message.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="bg-zinc-800 rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to add, modify, or explain features..."
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50
                     text-[13px] text-zinc-200 placeholder-zinc-500
                     focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 rounded-lg bg-indigo-500 text-white
                     hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
