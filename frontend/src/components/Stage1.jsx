import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Stage1.css';

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

export default function Stage1({ responses }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <div className="stage stage1">
      <h3 className="stage-title">Stage 1: Individual Responses</h3>

      <div className="tabs">
        {responses.map((resp, index) => (
          <button
            key={index}
            className={`tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {resp.model.split('/')[1] || resp.model}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <div className="content-header">
          <div className="model-name">{responses[activeTab].model}</div>
          <CopyButton text={responses[activeTab].response} />
        </div>
        <div className="response-text markdown-content">
          <ReactMarkdown>{responses[activeTab].response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
