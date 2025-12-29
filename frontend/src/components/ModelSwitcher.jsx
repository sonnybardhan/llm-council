import { useState, useEffect } from 'react';
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

    // Load current models when conversation changes
    useEffect(() => {
        if (conversationId) {
            loadCurrentModels();
        }
    }, [conversationId]);

    const loadCurrentModels = async () => {
        try {
            const { api } = await import('../api');
            const models = await api.getConversationModels(conversationId);
            setCouncilModels(models.council_models || []);
            setChairmanModel(models.chairman_model || '');
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

    const handleSave = async () => {
        if (!conversationId) return;

        setIsSaving(true);
        try {
            const { api } = await import('../api');
            await api.updateConversationModels(
                conversationId,
                councilModels,
                chairmanModel
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
        <div className="model-switcher">
            <button
                className="model-switcher-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>⚙️ Model Settings</span>
                <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
            </button>

            {isExpanded && (
                <div className="model-switcher-content">
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
                        disabled={isSaving || councilModels.length !== 4 || !chairmanModel}
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            )}
        </div>
    );
}
