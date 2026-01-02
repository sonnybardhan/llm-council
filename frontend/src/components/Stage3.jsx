import React from 'react';
import ReactMarkdown from 'react-markdown';
import './Stage3.css';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    if (!text) return;
    try {
      const contentToCopy = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  if (!text) return null;
  return (
    <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy to clipboard">
      {copied ? '✓' : '📋'}
    </button>
  );
};

export default function Stage3({ finalResponse }) {
  if (!finalResponse) {
    return null;
  }

  return (
    <div className="stage stage3">
      <h3 className="stage-title">Stage 3: Final Council Answer</h3>
      <div className="final-response">
        <div className="content-header">
          <div className="chairman-label">
            Chairman: {finalResponse.model.split('/')[1] || finalResponse.model}
          </div>
          <CopyButton text={finalResponse.response} />
        </div>
        <div className="final-text markdown-content">
          <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
