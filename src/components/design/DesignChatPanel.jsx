import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Palette } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';

const EXAMPLE_MESSAGES = [
  'Make the primary color darker',
  'Use a serif font for headings',
  'More spacious layout',
  'Increase border radius',
  'Make the background lighter',
  'Add more contrast',
];

export default function DesignChatPanel() {
  const {
    designVariations,
    addBriefChatMessage,
    setEditedDesignBrief,
    getActiveDesignBrief,
  } = useAppStore();

  // Handle old localStorage state that may not have briefChatMessages
  const briefChatMessages = designVariations?.briefChatMessages || [];
  const activeDesignBrief = getActiveDesignBrief();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [briefChatMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading || !activeDesignBrief) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    addBriefChatMessage(userMessage, 'user');
    setLoading(true);

    try {
      // Call AI service to update design brief
      const response = await aiService.chatWithDesignBrief(userMessage, activeDesignBrief);

      if (response.success) {
        // Add AI response
        addBriefChatMessage(response.message, 'assistant');

        // Update design brief with changes
        if (response.updatedBrief) {
          setEditedDesignBrief(response.updatedBrief);
        }
      } else {
        setError(response.error || 'Failed to process request');
        addBriefChatMessage('Sorry, I encountered an error processing your request.', 'assistant');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      addBriefChatMessage('Sorry, I encountered an error processing your request.', 'assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (message) => {
    setInput(message);
    textareaRef.current?.focus();
  };

  // Extract token changes from message (for badge display)
  const extractTokenChanges = (message) => {
    if (!message || typeof message !== 'string') return [];

    const changes = [];
    const colorMatch = message.match(/color.*?changed.*?to.*?(#[0-9A-Fa-f]{6})/i);
    const fontMatch = message.match(/font.*?changed.*?to.*?['"]([^'"]+)['"]/i);
    const sizeMatch = message.match(/size.*?changed.*?to.*?(\d+px)/i);

    if (colorMatch) changes.push({ type: 'color', value: colorMatch[1] });
    if (fontMatch) changes.push({ type: 'font', value: fontMatch[1] });
    if (sizeMatch) changes.push({ type: 'size', value: sizeMatch[1] });

    return changes;
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Chat with Design System</h3>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Ask to modify colors, typography, spacing, and more
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {briefChatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Palette className="w-12 h-12 text-zinc-600 mb-3" />
            <h4 className="text-sm font-medium text-zinc-400 mb-2">
              Start a conversation
            </h4>
            <p className="text-xs text-zinc-500 mb-4 max-w-xs">
              Ask me to modify your design tokens conversationally
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {EXAMPLE_MESSAGES.slice(0, 3).map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(msg)}
                  className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white rounded-lg transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {briefChatMessages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const tokenChanges = !isUser ? extractTokenChanges(msg.content) : [];

          return (
            <div
              key={i}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg ${
                  isUser
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800/50 text-zinc-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {tokenChanges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tokenChanges.map((change, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900/50 rounded text-xs"
                      >
                        {change.type === 'color' && (
                          <>
                            <span
                              className="w-3 h-3 rounded border border-zinc-700"
                              style={{ backgroundColor: change.value }}
                            />
                            <span className="text-zinc-400">{change.value}</span>
                          </>
                        )}
                        {change.type === 'font' && (
                          <span className="text-zinc-400">{change.value}</span>
                        )}
                        {change.type === 'size' && (
                          <span className="text-zinc-400">{change.value}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] opacity-60 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-3 py-2 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800/50">
        {briefChatMessages.length === 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {EXAMPLE_MESSAGES.slice(0, 4).map((msg, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(msg)}
                className="px-2 py-1 bg-zinc-800/50 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white rounded transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to change colors, fonts, spacing..."
            disabled={loading}
            rows={1}
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none min-h-[40px] max-h-[120px] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-[10px] text-zinc-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
