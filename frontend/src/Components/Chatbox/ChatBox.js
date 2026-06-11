import React, { useState, useRef, useEffect } from 'react';
import './style.css';

// Renders AI response with proper formatting
function FormattedMessage({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (```)
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="msg-code">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
    }
    // Numbered list (1. 2. 3.)
    else if (/^\d+\.\s/.test(line.trim())) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(<li key={i}>{lines[i].replace(/^\d+\.\s/, '')}</li>);
        i++;
      }
      elements.push(<ol key={i} className="msg-ol">{listItems}</ol>);
      continue;
    }
    // Bullet list (- or *)
    else if (/^[-*]\s/.test(line.trim())) {
      const listItems = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        listItems.push(<li key={i}>{lines[i].replace(/^[-*]\s/, '')}</li>);
        i++;
      }
      elements.push(<ul key={i} className="msg-ul">{listItems}</ul>);
      continue;
    }
    // Heading (**bold heading**)
    else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      elements.push(
        <p key={i} className="msg-heading">
          {line.trim().replace(/\*\*/g, '')}
        </p>
      );
    }
    // Empty line spacer
    else if (line.trim() === '') {
      elements.push(<div key={i} className="msg-spacer" />);
    }
    // Normal paragraph with inline bold support
    else {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.replace(/\*\*/g, '')}</strong>
          : part
      );
      elements.push(<p key={i} className="msg-p">{parts}</p>);
    }

    i++;
  }

  return <div className="msg-formatted">{elements}</div>;
}

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch("${process.env.REACT_APP_BASE_URL}/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const aiContent = data?.result?.response || data?.result || JSON.stringify(data);

      setMessages((prev) => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Something went wrong: ${error.message}. Please try again.`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="head">
        <h1 className="heading">SEVEN</h1>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`Msg ${msg.role === 'user' ? 'user' : 'ai'}${msg.isError ? ' error' : ''}`}
          >
            {msg.role === 'assistant' && !msg.isError
              ? <FormattedMessage content={msg.content} />
              : msg.content
            }
          </div>
        ))}

        {loading && (
          <div className="Msg ai loading">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="input-area" id="input-area">
        <textarea
          id="User-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Something..."
          disabled={loading}
        />
        <button id="send-btn" onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
}