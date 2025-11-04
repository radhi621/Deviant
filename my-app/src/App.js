import { useState } from 'react';
import './App.css';
import Chat from './components/Chat';

function App() {
  return (
    <div className="App">
      {/* Star Background */}
      <div className="star-background"></div>

      {/* Navbar */}
      <header className="navbar">
        <div className="logo">MI</div>
        <nav>
          <a href="#" className="nav-item">
            HOME
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="ai-section">
          <h1>ASSISTANT AI</h1>
          <div className="ai-icon-container">
            <div className="glow-ring"></div>
            <div className="brain-container">
              <svg className="ai-brain-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Digital Brain - Circuit Style */}
                {/* Left hemisphere */}
                <path
                  className="brain-path"
                  d="M70,60 Q60,70 60,85 Q60,100 70,110 Q75,115 80,120 L80,130 Q85,140 95,145"
                  stroke="#00d9ff"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  className="brain-path"
                  d="M75,65 Q68,75 68,85 Q68,95 75,105"
                  stroke="#00d9ff"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  className="brain-path"
                  d="M65,80 L55,80 M65,90 L55,90 M65,100 L55,100"
                  stroke="#00d9ff"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Right hemisphere */}
                <path
                  className="brain-path"
                  d="M130,60 Q140,70 140,85 Q140,100 130,110 Q125,115 120,120 L120,130 Q115,140 105,145"
                  stroke="#00d9ff"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  className="brain-path"
                  d="M125,65 Q132,75 132,85 Q132,95 125,105"
                  stroke="#00d9ff"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  className="brain-path"
                  d="M135,80 L145,80 M135,90 L145,90 M135,100 L145,100"
                  stroke="#00d9ff"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Center connection */}
                <path
                  className="brain-path"
                  d="M95,145 L100,148 L105,145"
                  stroke="#00d9ff"
                  strokeWidth="2.5"
                  fill="none"
                />
                <line
                  className="brain-path"
                  x1="80"
                  y1="85"
                  x2="120"
                  y2="85"
                  stroke="#00d9ff"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
                <line
                  className="brain-path"
                  x1="85"
                  y1="95"
                  x2="115"
                  y2="95"
                  stroke="#00d9ff"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />

                {/* Circuit nodes */}
                <circle className="brain-node" cx="70" cy="60" r="3" fill="#00d9ff" />
                <circle className="brain-node" cx="130" cy="60" r="3" fill="#00d9ff" />
                <circle className="brain-node" cx="60" cy="85" r="2.5" fill="#00d9ff" />
                <circle className="brain-node" cx="140" cy="85" r="2.5" fill="#00d9ff" />
                <circle className="brain-node" cx="80" cy="120" r="2.5" fill="#00d9ff" />
                <circle className="brain-node" cx="120" cy="120" r="2.5" fill="#00d9ff" />
                <circle className="brain-node" cx="100" cy="148" r="3.5" fill="#00d9ff">
                  <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Neural network connections */}
                <line
                  className="brain-detail"
                  x1="75"
                  y1="70"
                  x2="85"
                  y2="85"
                  stroke="#00d9ff"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <line
                  className="brain-detail"
                  x1="125"
                  y1="70"
                  x2="115"
                  y2="85"
                  stroke="#00d9ff"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <line
                  className="brain-detail"
                  x1="75"
                  y1="95"
                  x2="85"
                  y2="110"
                  stroke="#00d9ff"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <line
                  className="brain-detail"
                  x1="125"
                  y1="95"
                  x2="115"
                  y2="110"
                  stroke="#00d9ff"
                  strokeWidth="1"
                  opacity="0.6"
                />

                {/* Additional circuit details */}
                <circle className="brain-node-small" cx="75" cy="75" r="1.5" fill="#00d9ff" opacity="0.8" />
                <circle className="brain-node-small" cx="125" cy="75" r="1.5" fill="#00d9ff" opacity="0.8" />
                <circle className="brain-node-small" cx="85" cy="100" r="1.5" fill="#00d9ff" opacity="0.8" />
                <circle className="brain-node-small" cx="115" cy="100" r="1.5" fill="#00d9ff" opacity="0.8" />
                <circle className="brain-node-small" cx="90" cy="130" r="1.5" fill="#00d9ff" opacity="0.8" />
                <circle className="brain-node-small" cx="110" cy="130" r="1.5" fill="#00d9ff" opacity="0.8" />

                {/* Pulsing elements */}
                <circle className="brain-pulse" cx="100" cy="85" r="2" fill="#00d9ff" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        </div>

        <div className="features-section">
          <Chat />
          <button className="feature-button">
            <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>CALL</span>
          </button>
          <button className="feature-button">
            <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <span>FILES</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
