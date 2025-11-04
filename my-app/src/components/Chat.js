import { useState, useRef, useEffect } from 'react';
import './Chat.css';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.5-flash';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getAIResponse = async (userMessage) => {
    if (!GEMINI_API_KEY) {
      throw new Error('API Key is not configured. Please set REACT_APP_GEMINI_API_KEY in .env file');
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: userMessage,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Unexpected response format from API');
    }

    return data.candidates[0].content.parts[0].text;
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add typing indicator
    const typingId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: typingId, text: 'typing', isUser: false, isTyping: true },
    ]);

    try {
      const aiResponse = await getAIResponse(text);

      // Remove typing indicator and add AI response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        {
          id: Date.now() + 2,
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.message);
      // Remove typing indicator and add error message
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        {
          id: Date.now() + 2,
          text: `Error: ${err.message}`,
          isUser: false,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Text Button to Open Chat */}
      <button
        className="feature-button text-btn"
        onClick={() => setIsOpen(true)}
        title="Open Text Chat"
      >
        <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>TEXT</span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="chat-interface active">
          <div className="chat-container">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-brain-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#00d9ff" strokeWidth="2" fill="none" />
                    <path d="M8 10 L10 12 L8 14 M16 10 L14 12 L16 14" stroke="#00d9ff" strokeWidth="2" fill="none" />
                    <circle cx="12" cy="12" r="2" fill="#00d9ff" />
                  </svg>
                </div>
                <div className="chat-title">
                  <h2>AI Assistant</h2>
                  <span className="chat-status">Online</span>
                </div>
              </div>
              <button
                className="close-chat"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isUser ? 'user-message' : 'ai-message'} ${
                    message.isTyping ? 'typing-indicator' : ''
                  } ${message.isError ? 'error-message' : ''}`}
                >
                  <div className="message-avatar">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke={message.isUser ? '#8b5cf6' : '#00d9ff'}
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2"
                        fill={message.isUser ? '#8b5cf6' : '#00d9ff'}
                      />
                    </svg>
                  </div>
                  <div className="message-content">
                    {message.isTyping ? (
                      <div className="message-text" style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ display: 'inline-block', animation: 'typing 1.4s infinite' }}>●</span>
                        <span style={{ display: 'inline-block', animation: 'typing 1.4s infinite 0.2s' }}>●</span>
                        <span style={{ display: 'inline-block', animation: 'typing 1.4s infinite 0.4s' }}>●</span>
                      </div>
                    ) : (
                      <>
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">{getCurrentTime()}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Type your message..."
                  rows="1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  title="Send message"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
