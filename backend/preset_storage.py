"""Storage for custom user-defined model presets."""

import json
import os
from typing import Dict, Any
from pathlib import Path

CUSTOM_PRESETS_FILE = "data/custom_presets.json"


def ensure_custom_presets_file():
    """Ensure the custom presets file exists."""
    Path(CUSTOM_PRESETS_FILE).parent.mkdir(parents=True, exist_ok=True)
    if not os.path.exists(CUSTOM_PRESETS_FILE):
        with open(CUSTOM_PRESETS_FILE, 'w') as f:
            json.dump({}, f, indent=2)


def get_custom_presets() -> Dict[str, Any]:
    """
    Get all custom presets.
    
    Returns:
        Dict of custom presets
    """
    ensure_custom_presets_file()
    
    with open(CUSTOM_PRESETS_FILE, 'r') as f:
        return json.load(f)


def save_custom_preset(preset_id: str, preset_data: Dict[str, Any]):
    """
    Save a custom preset.
    
    Args:
        preset_id: Unique identifier for the preset
        preset_data: Preset configuration dict with name, description, council_models, chairman_model
    """
    ensure_custom_presets_file()
    
    presets = get_custom_presets()
    presets[preset_id] = preset_data
    
    with open(CUSTOM_PRESETS_FILE, 'w') as f:
        json.dump(presets, f, indent=2)


def delete_custom_preset(preset_id: str):
    """
    Delete a custom preset.
    
    Args:
        preset_id: Unique identifier for the preset to delete
    """
    ensure_custom_presets_file()
    
    presets = get_custom_presets()
    if preset_id in presets:
        del presets[preset_id]
        
        with open(CUSTOM_PRESETS_FILE, 'w') as f:
            json.dump(presets, f, indent=2)
