import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';
import { Difficulty, MathTopic, QuizQuestion, QuizState } from '../types';
import { generateMathQuiz } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

const QuizMode: React.FC = () => {
  const [config, setConfig] = useState<{ topic: MathTopic; difficulty: Difficulty } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    score: 0,
    showResult: false,
    selectedOption: null,
    isFinished: false,
  });

  const startQuiz = async (topic: MathTopic, difficulty: Difficulty) => {
    setIsLoading(true);
    setConfig({ topic, difficulty });
    
    // Reset state
    setQuizState({
        questions: [],
        currentIndex: 0,
        score: 0,
        showResult: false,
        selectedOption: null,
        isFinished: false,
    });

    const questions = await generateMathQuiz(topic, difficulty);
    setQuizState(prev => ({ ...prev, questions }));
    setIsLoading(false);
  };

  const handleOptionSelect = (index: number) => {
    if (quizState.showResult) return;
    setQuizState((prev) => ({ ...prev, selectedOption: index }));
  };

  const handleCheckAnswer = () => {
    if (quizState.selectedOption === null) return;

    const currentQuestion = quizState.questions[quizState.currentIndex];
    const isCorrect = quizState.selectedOption === currentQuestion.correctAnswerIndex;

    setQuizState((prev) => ({
      ...prev,
      showResult: true,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNextQuestion = () => {
    setQuizState((prev) => {
      const isLast = prev.currentIndex === prev.questions.length - 1;
      return {
        ...prev,
        showResult: false,
        selectedOption: null,
        currentIndex: isLast ? prev.currentIndex : prev.currentIndex + 1,
        isFinished: isLast,
      };
    });
  };

  const restartQuiz = () => {
    setConfig(null);
    setQuizState({
      questions: [],
      currentIndex: 0,
      score: 0,
      showResult: false,
      selectedOption: null,
      isFinished: false,
    });
  };

  // 1. Config View
  if (!config || quizState.questions.length === 0) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-slate-200 p-8">
           <LoadingSpinner />
           <p className="mt-4 text-slate-600 font-medium">Đang tạo bộ câu hỏi từ AI...</p>
           <p className="text-sm text-slate-400">Việc này có thể mất vài giây.</p>
        </div>
      );
    }

    return (
      <div className="h-full bg-white rounded-xl border border-slate-200 p-6 overflow-y-auto">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Luyện tập Toán học</h2>
            <p className="text-slate-500 mt-2">Chọn chủ đề và độ khó để AI tạo bài kiểm tra cho bạn.</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chủ đề</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(MathTopic).map((topic) => (
                <button
                  key={topic}
                  onClick={() => startQuiz(topic, Difficulty.MEDIUM)} // Default to medium, could add secondary selector
                  className="p-4 text-left border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex justify-between items-center group"
                >
                  <span className="font-medium text-slate-700 group-hover:text-emerald-700">{topic}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Result View
  if (quizState.isFinished) {
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    return (
      <div className="h-full bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
        <Award className={`w-20 h-20 mb-6 ${percentage > 70 ? 'text-yellow-500' : 'text-slate-400'}`} />
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành!</h2>
        <p className="text-slate-500 mb-8">Bạn đã trả lời đúng {quizState.score}/{quizState.questions.length} câu hỏi.</p>
        
        <div className="w-full max-w-xs bg-slate-100 rounded-full h-4 mb-8 overflow-hidden">
            <div 
                className={`h-full ${percentage > 70 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>

        <button
          onClick={restartQuiz}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Làm bài mới
        </button>
      </div>
    );
  }

  // 3. Question View
  const currentQuestion = quizState.questions[quizState.currentIndex];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 w-full">
        <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Câu hỏi {quizState.currentIndex + 1}/{quizState.questions.length}
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                {config.difficulty}
            </span>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let className = "w-full p-4 text-left border-2 rounded-xl transition-all relative ";
            
            if (quizState.showResult) {
                if (idx === currentQuestion.correctAnswerIndex) {
                    className += "border-emerald-500 bg-emerald-50 text-emerald-800";
                } else if (idx === quizState.selectedOption) {
                    className += "border-red-500 bg-red-50 text-red-800";
                } else {
                    className += "border-slate-100 opacity-50";
                }
            } else {
                if (idx === quizState.selectedOption) {
                    className += "border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm";
                } else {
                    className += "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700";
                }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={quizState.showResult}
                className={className}
              >
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold opacity-60">
                        {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                </div>
                {quizState.showResult && idx === currentQuestion.correctAnswerIndex && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                )}
                {quizState.showResult && idx === quizState.selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                    <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {quizState.showResult && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Giải thích:
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-200 bg-slate-50">
        {!quizState.showResult ? (
          <button
            onClick={handleCheckAnswer}
            disabled={quizState.selectedOption === null}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {quizState.currentIndex === quizState.questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizMode;