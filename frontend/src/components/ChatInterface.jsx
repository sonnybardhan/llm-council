import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronUp, ChevronDown, Minus, Plus, RotateCcw, Copy, Check, Send, Moon, Sun, ArrowUp } from 'lucide-react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import ModelSwitcher from './ModelSwitcher';
import { rubberbandScroll } from '../utils/animateScroll';
import './ChatInterface.css';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

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
    <button
      className={`copy-button ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
  availableModels,
  onModelsUpdated,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesContentRef = useRef(null);
  const [fontSize, setFontSize] = useState(16);
  const [isRubberbandEnabled, setIsRubberbandEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      if (isRubberbandEnabled) {
        const target = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight;
        rubberbandScroll(messagesContainerRef.current, target, { wrapper: messagesContentRef.current });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      if (isRubberbandEnabled) {
        rubberbandScroll(messagesContainerRef.current, 0, { wrapper: messagesContentRef.current });
      } else {
        messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const resetFontSize = () => {
    setFontSize(16);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  const [activeSection, setActiveSection] = useState('');
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
    if (conversation?.messages?.length > 0) {
      const firstUserMsg = conversation.messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        document.title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
      }
    } else {
      document.title = 'LLM Council';
    }
  }, [conversation]);

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;

      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        const scrollPosition = container.scrollTop + container.offsetTop + 100; // Offset for better triggering

        // Collect all potential section IDs
        const sections = [];
        conversation?.messages?.forEach((msg, index) => {
          if (msg.role !== 'assistant') return;
          if (msg.stage1) sections.push(`stage1-${index}`);
          if (msg.stage2) sections.push(`stage2-${index}`);
          if (msg.stage3) sections.push(`stage3-${index}`);
        });

        // Find the current section
        for (const id of sections) {
          const element = document.getElementById(id);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            // Check if the scroll position is within this element's vertical area
            // We use a broader range to "catch" the section as it comes into view or passes through the top
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(id);
              return;
            }
          }
        }
      });
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-interface">
        <div className="empty-state-wrapper">
          <div className="empty-state">
            <h2>Welcome to LLM Council</h2>
            <p>Create a new conversation to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <ModelSwitcher
        conversationId={conversation?.id}
        availableModels={availableModels}
        onModelsUpdated={onModelsUpdated}
      />

      <div className="messages-container" ref={messagesContainerRef} style={{ '--user-font-size': `${fontSize}px` }}>
        <div className="messages-content" ref={messagesContentRef}>
          {conversation.messages.length === 0 ? (
            <div className="empty-state-wrapper">
              <div className="empty-state">
                <h2>Start a conversation</h2>
                <p>Ask a question to consult the LLM Council</p>
              </div>
            </div>
          ) : (
            conversation.messages.map((msg, index) => (
              <div key={index} className="message-group">
                {msg.role === 'user' ? (
                  <div className="user-message">
                    <div className="message-label">You</div>
                    <div className="message-content">
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <CopyButton text={msg.content} />
                    </div>
                  </div>
                ) : (
                  <div className="assistant-message">
                    <div className="message-label">LLM Council</div>

                    {/* Stage 1 */}
                    {msg.loading?.stage1 && (
                      <div className="stage-loading">
                        <div className="spinner"></div>
                        <span>Running Stage 1: Collecting individual responses...</span>
                      </div>
                    )}
                    {msg.stage1 && <div id={`stage1-${index}`}><Stage1 responses={msg.stage1} /></div>}

                    {/* Stage 2 */}
                    {msg.loading?.stage2 && (
                      <div className="stage-loading">
                        <div className="spinner"></div>
                        <span>Running Stage 2: Peer rankings...</span>
                      </div>
                    )}
                    {msg.stage2 && (
                      <div id={`stage2-${index}`}>
                        <Stage2
                          rankings={msg.stage2}
                          labelToModel={msg.metadata?.label_to_model}
                          aggregateRankings={msg.metadata?.aggregate_rankings}
                        />
                      </div>
                    )}

                    {/* Stage 3 */}
                    {msg.loading?.stage3 && (
                      <div className="stage-loading">
                        <div className="spinner"></div>
                        <span>Running Stage 3: Final synthesis...</span>
                      </div>
                    )}
                    {msg.stage3 && (
                      <div id={`stage3-${index}`} className="stage3-wrapper">
                        <Stage3 finalResponse={msg.stage3} />
                        {/* <div className="stage3-actions">
                          <CopyButton text={msg.stage3} />
                        </div> */}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Consulting the council...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Navigation Controls - Only show when there are messages */}
      {conversation.messages.length > 0 && (
        <div className="nav-controls">
          <button
            className="nav-control-btn"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <ChevronUp size={16} />
          </button>
          <button
            className="nav-control-btn"
            onClick={scrollToBottom}
            title="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      )}

      {
        conversation.messages.length === 0 && (
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">



              <textarea
                ref={textareaRef}
                className="message-input"
                placeholder="What would you like to discuss?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />

              <div className="input-actions">

                <button
                  type="submit"
                  className="send-button"
                  disabled={!input.trim() || isLoading}
                  title="Send message"
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </form>
        )
      }

      {/* Outline Panel */}
      {
        conversation.messages.length > 0 && (
          <div className="outline-panel" style={{ fontSize: `${fontSize}px` }}>
            {/* <div className="outline-header">
              <h3>Outline</h3>
            </div> */}
            <div className="outline-list">
              {conversation.messages.map((msg, index) => {
                if (msg.role !== 'assistant') return null;
                return (
                  <div key={index} className="outline-section">
                    <div className="outline-title">Responses</div>
                    {msg.stage1 && (
                      <button
                        className={`outline-link ${activeSection === `stage1-${index}` ? 'active' : ''}`}
                        onClick={() => {
                          const el = document.getElementById(`stage1-${index}`);
                          if (el && messagesContainerRef.current) {
                            if (isRubberbandEnabled) {
                              rubberbandScroll(messagesContainerRef.current, el.offsetTop - 20, { wrapper: messagesContentRef.current });
                            } else {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                      >
                        Stage 1: Responses
                      </button>
                    )}
                    {msg.stage2 && (
                      <button
                        className={`outline-link ${activeSection === `stage2-${index}` ? 'active' : ''}`}
                        onClick={() => {
                          const el = document.getElementById(`stage2-${index}`);
                          if (el && messagesContainerRef.current) {
                            if (isRubberbandEnabled) {
                              rubberbandScroll(messagesContainerRef.current, el.offsetTop - 20, { wrapper: messagesContentRef.current });
                            } else {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                      >
                        Stage 2: Rankings
                      </button>
                    )}
                    {msg.stage3 && (
                      <button
                        className={`outline-link ${activeSection === `stage3-${index}` ? 'active' : ''}`}
                        onClick={() => {
                          const el = document.getElementById(`stage3-${index}`);
                          if (el && messagesContainerRef.current) {
                            if (isRubberbandEnabled) {
                              rubberbandScroll(messagesContainerRef.current, el.offsetTop - 20, { wrapper: messagesContentRef.current });
                            } else {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                      >
                        Stage 3: Final Answer
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="outline-footer">
              <div className="font-size-controls">
                <button
                  className="font-size-btn"
                  onClick={() => setIsRubberbandEnabled(!isRubberbandEnabled)}
                  title={isRubberbandEnabled ? "Disable rubberband scroll" : "Enable rubberband scroll"}
                  style={{ opacity: isRubberbandEnabled ? 1 : 0.4 }}
                >
                  〰️
                </button>
                <div className="divider-vertical" style={{ width: '1px', height: '16px', background: 'var(--border-secondary)', margin: '0 4px' }}></div>
                <button
                  className="font-size-btn"
                  onClick={decreaseFontSize}
                  title="Decrease font size"
                >
                  <Minus size={16} />
                </button>
                <span className="font-size-display">{fontSize}px</span>
                <button
                  className="font-size-btn"
                  onClick={increaseFontSize}
                  title="Increase font size"
                >
                  <Plus size={16} />
                </button>
                <button
                  className="font-size-btn font-reset-btn"
                  onClick={resetFontSize}
                  title="Reset font size to 16px"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
