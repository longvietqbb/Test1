import React, { useState, useRef, useEffect } from 'react';
import { Send, Calculator, RefreshCw, Eraser } from 'lucide-react';
import { ChatMessage } from '../types';
import { solveMathProblem } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

const Solver: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSolve = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const solution = await solveMathProblem(userMessage.text);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: solution,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Simple formatter to preserve newlines and bolding for better readability without heavy libraries
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
        // Simple bold parser for **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={i} className={`min-h-[1.2em] ${line.startsWith('#') ? 'font-bold text-lg mt-2 text-indigo-700' : ''}`}>
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-indigo-900">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                })}
            </div>
        )
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          Trợ lý Giải Toán AI
        </h2>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
            title="Xóa lịch sử"
          >
            <Eraser className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <Calculator className="w-16 h-16 mb-4" />
            <p className="text-center">Nhập bài toán của bạn vào bên dưới.<br/>Ví dụ: "Giải phương trình x^2 + 2x + 1 = 0"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.role === 'model' ? formatText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                    <LoadingSpinner />
                    <span className="text-slate-500 text-sm animate-pulse">AI đang suy nghĩ...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập bài toán cần giải..."
            className="w-full p-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none max-h-32 min-h-[56px] text-slate-700 transition-all"
            rows={1}
            style={{ height: 'auto', minHeight: '56px' }}
          />
          <button
            onClick={handleSolve}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
            Mẹo: AI có thể giải Đại số, Hình học, Giải tích và giải thích chi tiết.
        </p>
      </div>
    </div>
  );
};

export default Solver;