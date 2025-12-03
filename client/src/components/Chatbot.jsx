// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useLanguage } from "../contexts/LanguageContext.jsx";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "നമസ്കാരം! 🙏 I'm your dedicated Kerala Farmers AI Assistant, powered by Google Gemini AI. I specialize in providing accurate agricultural information for Kerala farmers.\n\nWhat would you like to know about farming in Kerala today?",
      sender: "ai",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { t, language } = useLanguage();

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI("paste your api key here");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const prompt = `You are an AI assistant for Kerala farmers. Provide accurate agricultural information including:
      - Crop cultivation techniques for Kerala's climate
      - Organic farming methods
      - Pest and disease management
      - Government schemes and subsidies
      - Market prices and marketing strategies
      - Weather-based farming advice
      - Always answer in the user's selected language: ${language === 'ml' ? 'Malayalam' : 'English'}.
      
      Current question: "${inputMessage}"
      Provide helpful, practical response:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: t('chatbotError'),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    t('chatbotQuick1'),
    t('chatbotQuick2'),
    t('chatbotQuick3'),
    t('chatbotQuick4'),
    t('chatbotQuick5'),
    t('chatbotQuick6'),
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => {
      if (!isLoading) {
        handleSendMessage();
      }
    }, 100);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "നമസ്കാരം! 🙏 I'm your dedicated Kerala Farmers AI Assistant, powered by Google Gemini AI. I specialize in providing accurate agricultural information for Kerala farmers.\n\nWhat would you like to know about farming in Kerala today?",
        sender: "ai",
        timestamp: new Date(),
      }
    ]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  // Floating Button (Always visible when chat is closed/minimized)
  if (!isOpen || isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Notification Badge */}
        {messages.length > 1 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {messages.length - 1}
          </div>
        )}
        
        {/* Floating Chat Button */}
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <span className="text-2xl">🌾</span>
          <div className="absolute -top-10 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {t('chatbotFloatingTooltip')}
          </div>
        </button>
      </div>
    );
  }

  // Chat Widget
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-green-200 flex flex-col">
      {/* Header */}
      <div className="bg-green-500 text-white rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('chatbotHeaderTitle')}</h3>
              <p className="text-green-100 text-sm">{t('chatbotHeaderSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={minimizeChat}
              className="w-8 h-8 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex items-center justify-center"
              title="Minimize"
            >
              −
            </button>
            <button
              onClick={toggleChat}
              className="w-8 h-8 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex items-center justify-center"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-b border-green-100 bg-green-50">
        <h4 className="text-sm font-semibold text-green-900 mb-2">{t('chatbotQuickQuestionsTitle')}</h4>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              disabled={isLoading}
              className="px-3 py-1 bg-white text-green-800 text-xs rounded-full border border-green-300 hover:border-green-500 transition-colors disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                message.sender === 'user'
                  ? 'bg-green-500 text-white rounded-br-none'
                  : 'bg-white text-gray-900 rounded-bl-none border border-green-200'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.text}</div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-white border border-green-200 p-3">
              <div className="flex space-x-1 items-center">
                <div className="text-sm text-gray-600">{t('chatbotThinking')}</div>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-green-200 bg-white">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbotPlaceholder')}
              className="w-full px-3 py-2 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '🚀'
              )}
            </button>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-xs bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              title="Clear chat"
            >
              {t('chatbotClear')}
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          {t('chatbotPressEnter')}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
