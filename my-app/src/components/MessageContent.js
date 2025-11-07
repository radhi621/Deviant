import CodeBlock from './CodeBlock';

const MessageContent = ({ text }) => {
  // Parse markdown code blocks: ```language\ncode\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  // Split text by code blocks while preserving them
  const parts = [];
  let lastIndex = 0;
  let match;

  // Create a new regex instance to iterate through matches
  const regexCopy = /```(\w+)?\n([\s\S]*?)```/g;
  
  while ((match = regexCopy.exec(text)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the code block
    const language = match[1] || 'plaintext';
    const code = match[2].trim();
    
    parts.push({
      type: 'code',
      content: code,
      language: language,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // If no code blocks found, return the entire text as-is
  if (parts.length === 0) {
    return <div className="message-text">{text}</div>;
  }

  return (
    <div className="message-content-parsed">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={`code-${index}`}
              code={part.content}
              language={part.language}
            />
          );
        }
        
        return (
          <div key={`text-${index}`} className="message-text">
            {part.content}
          </div>
        );
      })}
    </div>
  );
};

export default MessageContent;
