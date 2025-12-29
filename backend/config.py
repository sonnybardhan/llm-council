"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Available models pool - users can select from these
AVAILABLE_MODELS = [
    # OpenAI GPT-5 Series (Latest 2025)
    "openai/gpt-5.2",
    "openai/gpt-5.1",
    "openai/gpt-5.1-codex",
    "openai/gpt-5",
    "openai/gpt-5-mini",
    
    # OpenAI GPT-4 Series
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/o1",
    "openai/o1-mini",
    
    # Anthropic Claude 4.5 Series (Latest 2025)
    "anthropic/claude-opus-4.5",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-haiku-4.5",
    
    # Anthropic Claude 3 Series
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3.5-haiku",
    "anthropic/claude-3-opus",
    
    # Google Gemini 3 Series (Latest 2025)
    "google/gemini-3-pro-preview",
    "google/gemini-3-flash-preview",
    "google/gemini-3-pro-image-preview",
    
    # Google Gemini 2.5 Series (Latest 2025)
    "google/gemini-2.5-pro",
    "google/gemini-2.5-flash",
    
    # Google Gemini 2.0 Series
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

# Default council members - list of OpenRouter model identifiers (using flagship models)
COUNCIL_MODELS = [
    "openai/gpt-5.2",
    "anthropic/claude-opus-4.5",
    "google/gemini-3-pro-preview",
    "google/gemini-2.5-pro",
]

# Default chairman model - synthesizes final response (using flagship model)
CHAIRMAN_MODEL = "google/gemini-3-pro-preview"

# Task-based model presets
# Based on OpenRouter rankings and real-world usage data
MODEL_PRESETS = {
    "coding": {
        "name": "Coding & Development",
        "description": "Optimized for programming, debugging, and technical work",
        "council_models": [
            "anthropic/claude-sonnet-4.5",  # Top coding performer
            "openai/gpt-5.1-codex",          # Specialized coding model
            "qwen/qwen-2.5-72b-instruct",    # Strong open-source coding
            "google/gemini-2.5-pro",         # Good technical reasoning
        ],
        "chairman_model": "anthropic/claude-opus-4.5"  # Best overall for synthesis
    },
    "writing": {
        "name": "Creative Writing",
        "description": "Best for creative writing, content generation, and conversation",
        "council_models": [
            "openai/gpt-4o",                 # Natural, engaging writing
            "anthropic/claude-opus-4.5",     # Creative and nuanced
            "google/gemini-3-pro-preview",   # Strong general capabilities
            "openai/gpt-5.2",                # Latest flagship
        ],
        "chairman_model": "openai/gpt-4o"
    },
    "brainstorming": {
        "name": "Brainstorming & Ideation",
        "description": "Ideal for creative thinking, exploration, and generating ideas",
        "council_models": [
            "openai/gpt-4o",                 # Creative conversation
            "anthropic/claude-sonnet-4.5",   # Diverse perspectives
            "google/gemini-3-pro-preview",   # Novel approaches
            "deepseek/deepseek-chat",        # Alternative viewpoint
        ],
        "chairman_model": "google/gemini-3-pro-preview"
    },
    "reasoning": {
        "name": "Complex Reasoning",
        "description": "Focused on multi-step reasoning and problem-solving",
        "council_models": [
            "openai/o1",                     # Specialized reasoning
            "anthropic/claude-opus-4.5",     # Deep analysis
            "google/gemini-2.5-pro",         # Strong reasoning
            "openai/gpt-5.2",                # Latest capabilities
        ],
        "chairman_model": "openai/o1"
    },
    "balanced": {
        "name": "Balanced Performance",
        "description": "All-around performance across different tasks",
        "council_models": [
            "openai/gpt-5.2",
            "anthropic/claude-opus-4.5",
            "google/gemini-3-pro-preview",
            "google/gemini-2.5-pro",
        ],
        "chairman_model": "google/gemini-3-pro-preview"
    }
}

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
