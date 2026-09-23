import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './aiFaqChatbot.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const AIFaqChatbot: React.FC = () => {
  const { t } = useTranslation('ai');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: t('faqChatbot.welcomeMsg'),
      time: getFormattedTime(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    setHasUnread(false);
  };

  const handleSendResponse = (userText: string) => {
    const lower = userText.toLowerCase();
    let reply = t('faqChatbot.defaultAnswer');

    if (
      lower.includes('a1') ||
      lower.includes('lộ trình') ||
      lower.includes('path') ||
      lower.includes('khoá học') ||
      lower.includes('bài học')
    ) {
      reply = t('faqChatbot.answer1');
    } else if (
      lower.includes('premium') ||
      lower.includes('gói') ||
      lower.includes('giá') ||
      lower.includes('quyền lợi') ||
      lower.includes('pricing') ||
      lower.includes('pro')
    ) {
      reply = t('faqChatbot.answer2');
    } else if (
      lower.includes('vietqr') ||
      lower.includes('thanh toán') ||
      lower.includes('qr') ||
      lower.includes('ngân hàng') ||
      lower.includes('bank') ||
      lower.includes('chuyển khoản') ||
      lower.includes('pay')
    ) {
      reply = t('faqChatbot.answer3');
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          time: getFormattedTime(),
        },
      ]);
    }, 700);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    handleSendResponse(trimmed);
  };

  const handleSelectSuggestion = (suggestionText: string, defaultAnswerText: string) => {
    if (isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: suggestionText,
      time: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: defaultAnswerText,
          time: getFormattedTime(),
        },
      ]);
    }, 600);
  };

  const suggestions = [
    {
      label: t('faqChatbot.suggestion1'),
      answer: t('faqChatbot.answer1'),
    },
    {
      label: t('faqChatbot.suggestion2'),
      answer: t('faqChatbot.answer2'),
    },
    {
      label: t('faqChatbot.suggestion3'),
      answer: t('faqChatbot.answer3'),
    },
  ];

  return (
    <div className="faq-chatbot-wrapper">
      {/* Trigger floating button */}
      <button
        type="button"
        className="faq-chatbot-trigger"
        onClick={handleOpen}
        aria-label={isOpen ? t('faqChatbot.close') : t('faqChatbot.open')}
        title={t('faqChatbot.title')}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
            <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
          </svg>
        )}
        {!isOpen && hasUnread && <span className="faq-unread-badge" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="faq-window" role="dialog" aria-label={t('faqChatbot.title')}>
          {/* Header */}
          <div className="faq-header">
            <div className="faq-header-title">
              <div className="faq-avatar">🤖</div>
              <div className="faq-header-info">
                <h4>{t('faqChatbot.title')}</h4>
                <div className="faq-status-indicator">
                  <span className="faq-status-dot"></span>
                  <span>{t('faqChatbot.onlineStatus')}</span>
                </div>
              </div>
            </div>

            <div className="faq-header-actions">
              <button
                type="button"
                className="faq-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label={t('faqChatbot.close')}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="faq-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`faq-message ${
                  msg.sender === 'bot' ? 'faq-message--bot' : 'faq-message--user'
                }`}
              >
                {msg.sender === 'bot' && <div className="faq-avatar text-sm">🇩🇪</div>}
                <div>
                  <div className="faq-bubble">{msg.text}</div>
                  <div className="faq-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="faq-typing">
                <span className="faq-typing-dot"></span>
                <span className="faq-typing-dot"></span>
                <span className="faq-typing-dot"></span>
              </div>
            )}

            {/* Quick Suggestions */}
            {messages.length <= 2 && !isTyping && (
              <div>
                <div className="faq-suggestions-label">💡 Gợi ý nhanh:</div>
                <div className="faq-suggestions">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="faq-suggestion-chip"
                      onClick={() => handleSelectSuggestion(sug.label, sug.answer)}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form className="faq-footer" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="faq-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('faqChatbot.inputPlaceholder')}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="faq-send-btn"
              disabled={!inputValue.trim() || isTyping}
              aria-label={t('faqChatbot.send')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIFaqChatbot;
