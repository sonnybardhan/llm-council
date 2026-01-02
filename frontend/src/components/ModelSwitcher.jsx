import { useState, useEffect, useRef } from 'react';
import { Settings, ChevronDown, Trash2 } from 'lucide-react';
import './ModelSwitcher.css';

export default function ModelSwitcher({
    conversationId,
    availableModels,
    onModelsUpdated,
}) {
    const [councilModels, setCouncilModels] = useState([]);
    const [chairmanModel, setChairmanModel] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [presets, setPresets] = useState({});
    const [selectedPreset, setSelectedPreset] = useState('');
    const [appliedPreset, setAppliedPreset] = useState('');
    const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [presetDescription, setPresetDescription] = useState('');
    const modelSwitcherRef = useRef(null);

    // Load presets on mount
    useEffect(() => {
        loadPresets();
    }, []);

    // Load current models when conversation changes
    useEffect(() => {
        if (conversationId) {
            loadCurrentModels();
        }
    }, [conversationId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modelSwitcherRef.current && !modelSwitcherRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const loadPresets = async () => {
        try {
            const { api } = await import('../api');
            const data = await api.getPresets();
            setPresets(data.presets || {});
        } catch (error) {
            console.error('Failed to load presets:', error);
        }
    };

    const loadCurrentModels = async () => {
        try {
            const { api } = await import('../api');
            const models = await api.getConversationModels(conversationId);
            setCouncilModels(models.council_models || []);
            setChairmanModel(models.chairman_model || '');
            setAppliedPreset(''); // Reset applied preset when loading
        } catch (error) {
            console.error('Failed to load conversation models:', error);
        }
    };

    const handleCouncilModelChange = (index, value) => {
        const newModels = [...councilModels];
        newModels[index] = value;
        setCouncilModels(newModels);
    };

    const handleChairmanModelChange = (value) => {
        setChairmanModel(value);
    };

    const handlePresetChange = (presetKey) => {
        setSelectedPreset(presetKey);
    };

    const handleApplyPreset = () => {
        if (!selectedPreset || !presets[selectedPreset]) return;

        const preset = presets[selectedPreset];
        setCouncilModels(preset.council_models);
        setChairmanModel(preset.chairman_model);
        setAppliedPreset(selectedPreset);
    };

    const handleSaveAsPreset = () => {
        setShowSavePresetDialog(true);
    };

    const handleSaveCustomPreset = async () => {
        if (!presetName.trim()) {
            alert('Please enter a preset name');
            return;
        }

        try {
            const { api } = await import('../api');
            await api.saveCustomPreset(
                presetName,
                presetDescription,
                councilModels,
                chairmanModel
            );

            // Reload presets
            await loadPresets();

            // Reset form
            setPresetName('');
            setPresetDescription('');
            setShowSavePresetDialog(false);

            alert('Custom preset saved successfully!');
        } catch (error) {
            console.error('Failed to save custom preset:', error);
            alert('Failed to save custom preset. Please try again.');
        }
    };

    const handleDeletePreset = async (presetId) => {
        if (!confirm('Are you sure you want to delete this preset?')) {
            return;
        }

        try {
            const { api } = await import('../api');
            await api.deleteCustomPreset(presetId);

            // Reload presets
            await loadPresets();

            // Clear selection if deleted preset was selected
            if (selectedPreset === presetId) {
                setSelectedPreset('');
            }
            if (appliedPreset === presetId) {
                setAppliedPreset('');
            }
        } catch (error) {
            console.error('Failed to delete custom preset:', error);
            alert('Failed to delete custom preset. Please try again.');
        }
    };

    const handleSave = async () => {
        if (!conversationId) return;

        // Filter out empty selections
        const activeCouncilModels = councilModels.filter(m => m && m.trim());
        const activeChairman = chairmanModel && chairmanModel.trim() ? chairmanModel : '';

        // Validate: at least one model must be selected
        if (activeCouncilModels.length === 0 && !activeChairman) {
            alert('Please select at least one model (council member or chairman).');
            return;
        }

        setIsSaving(true);
        try {
            const { api } = await import('../api');
            await api.updateConversationModels(
                conversationId,
                activeCouncilModels,
                activeChairman
            );
            if (onModelsUpdated) {
                onModelsUpdated();
            }
        } catch (error) {
            console.error('Failed to update models:', error);
            alert('Failed to update models. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to get short model name
    const getShortName = (model) => {
        if (!model) return '';
        const parts = model.split('/');
        return parts[parts.length - 1].replace(':free', '');
    };

    // Helper to get provider name
    const getProvider = (model) => {
        if (!model) return '';
        return model.split('/')[0];
    };

    // Check if a model is already selected in council
    const isModelSelectedInCouncil = (model, currentIndex) => {
        return councilModels.some((m, i) => i !== currentIndex && m === model);
    };

    if (!conversationId) {
        return null;
    }

    return (
        <div className="model-switcher" ref={modelSwitcherRef}>
            <button
                className="model-switcher-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} /> Model Settings
                </span>
                <ChevronDown size={14} className={`arrow ${isExpanded ? 'expanded' : ''}`} />
            </button>

            {isExpanded && (
                <div className="model-switcher-content">
                    <div className="preset-section">
                        <h4>Quick Presets</h4>
                        <p className="preset-description">
                            Select a task-based preset to automatically configure optimal models
                        </p>
                        <div className="preset-controls">
                            <select
                                value={selectedPreset}
                                onChange={(e) => handlePresetChange(e.target.value)}
                                className="preset-select"
                            >
                                <option value="">Select a preset...</option>
                                {Object.entries(presets).map(([key, preset]) => (
                                    <option key={key} value={key}>
                                        {preset.is_custom ? '⭐ ' : ''}{preset.name}
                                    </option>
                                ))}
                            </select>
                            <div className="preset-button-row">
                                <button
                                    className="apply-preset-btn"
                                    onClick={handleApplyPreset}
                                    disabled={!selectedPreset}
                                >
                                    Apply
                                </button>
                                {selectedPreset && presets[selectedPreset]?.is_custom && (
                                    <button
                                        className="delete-preset-btn"
                                        onClick={() => handleDeletePreset(selectedPreset)}
                                        title="Delete custom preset"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {selectedPreset && presets[selectedPreset] && (
                            <p className="preset-info">
                                📝 {presets[selectedPreset].description}
                            </p>
                        )}
                        {appliedPreset && (
                            <p className="preset-applied">
                                ✓ Applied: {presets[appliedPreset]?.name}
                            </p>
                        )}
                    </div>

                    <div className="divider"></div>

                    <div className="model-section">
                        <h4>Council Members</h4>
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="model-select-wrapper">
                                <label>Member {index + 1}</label>
                                <select
                                    value={councilModels[index] || ''}
                                    onChange={(e) => handleCouncilModelChange(index, e.target.value)}
                                    className="model-select"
                                >
                                    <option value="">Select a model...</option>
                                    {availableModels.map((model) => (
                                        <option
                                            key={model}
                                            value={model}
                                            disabled={isModelSelectedInCouncil(model, index)}
                                        >
                                            {getProvider(model)} / {getShortName(model)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="model-section">
                        <h4>Chairman</h4>
                        <div className="model-select-wrapper">
                            <label>Chairman Model</label>
                            <select
                                value={chairmanModel}
                                onChange={(e) => handleChairmanModelChange(e.target.value)}
                                className="model-select"
                            >
                                <option value="">Select a model...</option>
                                {availableModels.map((model) => (
                                    <option key={model} value={model}>
                                        {getProvider(model)} / {getShortName(model)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        className="save-models-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>

                    <button
                        className="save-preset-btn"
                        onClick={handleSaveAsPreset}
                        disabled={councilModels.filter(m => m && m.trim()).length === 0 && (!chairmanModel || !chairmanModel.trim())}
                    >
                        💾 Save as Custom Preset
                    </button>

                    <p className="model-help-text">
                        💡 You can select 0-4 council members. Unselected models won't participate in the evaluation.
                    </p>
                </div>
            )}

            {showSavePresetDialog && (
                <div className="preset-dialog-overlay" onClick={() => setShowSavePresetDialog(false)}>
                    <div className="preset-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>Save Custom Preset</h3>
                        <div className="preset-dialog-field">
                            <label>Preset Name *</label>
                            <input
                                type="text"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                placeholder="e.g., My Coding Setup"
                                className="preset-dialog-input"
                            />
                        </div>
                        <div className="preset-dialog-field">
                            <label>Description</label>
                            <textarea
                                value={presetDescription}
                                onChange={(e) => setPresetDescription(e.target.value)}
                                placeholder="Optional description of this preset"
                                className="preset-dialog-textarea"
                                rows="3"
                            />
                        </div>
                        <div className="preset-dialog-actions">
                            <button
                                className="preset-dialog-cancel"
                                onClick={() => setShowSavePresetDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="preset-dialog-save"
                                onClick={handleSaveCustomPreset}
                            >
                                Save Preset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
