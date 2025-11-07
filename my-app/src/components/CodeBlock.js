import { useState, useEffect } from 'react';
import './CodeBlock.css';

const CodeBlock = ({ code, language = 'plaintext', inline = false }) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState(code);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    // Load highlight.js from CDN and highlight the code
    const loadAndHighlight = async () => {
      try {
        // Load highlight.js library
        if (!window.hljs) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
          script.onload = () => {
            highlightCode();
          };
          document.head.appendChild(script);
        } else {
          highlightCode();
        }
      } catch (err) {
        console.warn('Failed to load highlight.js:', err);
        setHighlightedCode(escapeHtml(code));
      }
    };

    const highlightCode = () => {
      try {
        if (language && language !== 'plaintext' && window.hljs) {
          const highlighted = window.hljs.highlight(code, { language, ignoreIllegals: true }).value;
          setHighlightedCode(highlighted);
        } else if (window.hljs) {
          const highlighted = window.hljs.highlightAuto(code).value;
          setHighlightedCode(highlighted);
        } else {
          setHighlightedCode(escapeHtml(code));
        }
      } catch (err) {
        console.warn(`Syntax highlighting failed for language: ${language}`, err);
        setHighlightedCode(escapeHtml(code));
      }
    };

    loadAndHighlight();
  }, [code, language]);

  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };

  if (inline) {
    return (
      <code className="inline-code">
        {code}
      </code>
    );
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-block">
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock;
