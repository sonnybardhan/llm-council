"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Available models pool - users can select from these
AVAILABLE_MODELS = [
    # OpenAI
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/o1",
    "openai/o1-mini",
    
    # Anthropic
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3.5-haiku",
    "anthropic/claude-3-opus",
    
    # Google
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-exp-1206:free",
    "google/gemini-2.0-flash-thinking-exp:free",
    "google/gemini-pro-1.5",
    
    # Meta
    "meta-llama/llama-3.3-70b-instruct",
    "meta-llama/llama-3.1-405b-instruct",
    
    # Perplexity
    "perplexity/llama-3.1-sonar-large-128k-online",
    "perplexity/llama-3.1-sonar-huge-128k-online",
    
    # Mistral
    "mistralai/mistral-large",
    "mistralai/mistral-medium",
    
    # DeepSeek
    "deepseek/deepseek-chat",
    
    # X.AI
    "x-ai/grok-2-1212",
    "x-ai/grok-beta",
    
    # Qwen
    "qwen/qwen-2.5-72b-instruct",
]

# Default council members - list of OpenRouter model identifiers
COUNCIL_MODELS = [
    "openai/gpt-4o",
    "google/gemini-2.0-flash-exp:free",
    "anthropic/claude-3.5-sonnet",
    "x-ai/grok-2-1212",
]

# Default chairman model - synthesizes final response
CHAIRMAN_MODEL = "google/gemini-2.0-flash-exp:free"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
