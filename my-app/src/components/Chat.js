import { useState, useRef, useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import VoiceSettings from './VoiceSettings';
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
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.95,
    pitch: 1.0,
    volume: 0.9,
  });
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    speak,
    pause,
    resume,
    stop: stopSpeech,
    isSpeaking,
    isPaused,
    isSupported: isTextToSpeechSupported,
  } = useTextToSpeech();

  // Auto-load models from environment variables - fully dynamic
  const loadModelsFromEnv = () => {
    const loadedModels = {};
    const modelIds = process.env.REACT_APP_MODELS?.split(',').map(id => id.trim()).filter(Boolean) || [];

    modelIds.forEach(modelId => {
      const prefix = `REACT_APP_MODEL_${modelId.toUpperCase()}`;
      
      // Get required base configuration
      const modelType = process.env[`${prefix}_TYPE`];
      const modelName = process.env[`${prefix}_NAME`];
      const modelIcon = process.env[`${prefix}_ICON`] || '🤖';
      
      if (!modelType || !modelName) {
        console.warn(`Skipping model '${modelId}': Missing TYPE or NAME configuration`);
        return;
      }

      // Build model object with dynamic properties
      const model = {
        id: modelId.toLowerCase(),
        name: modelName,
        type: modelType,
        icon: modelIcon,
      };

      // Add model-specific configuration based on type
      const modelConfig = process.env[`${prefix}_MODEL`];
      
      if (modelType === 'gemini') {
        const apiKey = process.env[`${prefix}_API_KEY`];
        if (!apiKey) {
          console.warn(`Skipping Gemini model: Missing API_KEY`);
          return;
        }
        model.displayName = modelConfig || 'gemini-2.5-flash';
        model.apiKey = apiKey;
        model.model = modelConfig || 'gemini-2.5-flash';
      } else if (modelType === 'ollama') {
        if (!modelConfig) {
          console.warn(`Skipping Ollama model: Missing MODEL configuration`);
          return;
        }
        model.displayName = modelConfig;
        model.apiUrl = process.env[`${prefix}_API_URL`] || 'http://localhost:11434';
        model.model = modelConfig;
      } else if (modelType === 'claude') {
        const apiKey = process.env[`${prefix}_API_KEY`];
        if (!apiKey) {
          console.warn(`Skipping Claude model: Missing API_KEY`);
          return;
        }
        model.displayName = modelConfig || 'claude-3-opus-20240229';
        model.apiKey = apiKey;
        model.model = modelConfig || 'claude-3-opus-20240229';
      } else {
        console.warn(`Unknown model type '${modelType}' for model '${modelId}'`);
        return;
      }

      loadedModels[modelId.toLowerCase()] = model;
    });

    return loadedModels;
  };

  const models = loadModelsFromEnv();

  const [activeModelId, setActiveModelId] = useState(() => {
    // Set default to first available model
    const modelKeys = Object.keys(models);
    return modelKeys.length > 0 ? modelKeys[0] : null;
  });
  const activeModel = models[activeModelId];

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

  // Update input when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

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
    if (!activeModel) {
      throw new Error('No AI model configured. Please add model configuration to your .env file.');
    }

    if (activeModel.type === 'ollama') {
      return getOllamaResponse(userMessage);
    } else if (activeModel.type === 'gemini') {
      return getGeminiResponse(userMessage);
    } else {
      throw new Error(`Unknown model type: ${activeModel.type}`);
    }
  };

  const getGeminiResponse = async (userMessage) => {
    if (!activeModel.apiKey) {
      throw new Error('API Key is not configured. Please set REACT_APP_GEMINI_API_KEY in .env file');
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel.model}:generateContent?key=${activeModel.apiKey}`;

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

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('Unexpected API response format:', data);
      throw new Error('Unexpected response format from API. Please check your API key and try again.');
    }

    const content = data.candidates[0].content.parts[0];
    if (!content || !content.text) {
      throw new Error('No text content in API response');
    }

    return content.text;
  };

  const getOllamaResponse = async (userMessage) => {
    try {
      const response = await fetch(`${activeModel.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: activeModel.model,
          prompt: userMessage,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.status} - Make sure Ollama is running on ${activeModel.apiUrl}`);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error('No response from Ollama model');
      }

      return data.response.trim();
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(`Cannot connect to Ollama on ${activeModel.apiUrl}. Make sure Ollama is running.`);
      }
      throw err;
    }
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

      // Remove typing indicator and add AI response with model info
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        {
          id: Date.now() + 2,
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
          modelId: activeModelId,
          modelName: activeModel.name,
          modelDisplayName: activeModel.displayName,
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

  const handleSpeakMessage = (messageId, messageText) => {
    if (speakingMessageId === messageId) {
      // If this message is speaking, stop it
      stopSpeech();
      setSpeakingMessageId(null);
    } else {
      // Stop any previous speech and speak this message
      stopSpeech();
      setSpeakingMessageId(messageId);
      speak(messageText, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        lang: 'en-US',
      });
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
                  <span className="chat-status">
                    {activeModel ? `${activeModel.icon} ${activeModel.name} • Online` : '⚠️ No model configured'}
                  </span>
                </div>
              </div>
              <div className="chat-header-controls">
                {Object.keys(models).length > 0 && (
                  <div className="model-selector">
                    {Object.values(models).map((model) => (
                      <button
                        key={model.id}
                        className={`model-button ${activeModelId === model.id ? 'active' : ''}`}
                        onClick={() => setActiveModelId(model.id)}
                        title={`Switch to ${model.name}`}
                      >
                        {model.icon} {model.name}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="voice-settings-btn"
                  onClick={() => setShowVoiceSettings(true)}
                  title="Voice settings"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                    <path d="M7.5 4.5a4.5 4.5 0 0 1 9 0M7.5 19.5a4.5 4.5 0 0 0 9 0"></path>
                  </svg>
                </button>
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
                        <div className="message-footer">
                          <div className="message-info">
                            {message.modelName && (
                              <span className="message-model">{message.modelName} • {message.modelDisplayName}</span>
                            )}
                            <div className="message-time">{getCurrentTime()}</div>
                          </div>
                          {!message.isUser && isTextToSpeechSupported && (
                            <button
                              className={`speak-button ${speakingMessageId === message.id ? 'speaking' : ''}`}
                              onClick={() => handleSpeakMessage(message.id, message.text)}
                              title={speakingMessageId === message.id ? 'Stop speaking' : 'Read aloud'}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M15.54 8.46a6.5 6.5 0 0 1 0 9.07"></path>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="chat-input-container">
              {interimTranscript && (
                <div className="interim-transcript">
                  <span className="listening-indicator">🎤 Listening...</span>
                  <span>{interimTranscript}</span>
                </div>
              )}
              {speechError && (
                <div className="speech-error">
                  <span>Error: {speechError}</span>
                </div>
              )}
              <div className="chat-input-wrapper">
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Type your message or use voice..."
                  rows="1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                {isSpeechSupported && (
                  <button
                    className={`voice-button ${isListening ? 'listening' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </button>
                )}
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
      <VoiceSettings 
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        onSettingsChange={setVoiceSettings}
        speak={speak}
        availableVoices={[]}
      />
    </>
  );
};

export default Chat;
