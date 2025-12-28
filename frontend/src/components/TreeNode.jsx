import React, { useState } from 'react';
import { IxIcon, IxButton, IxIconButton, IxInput, IxTextarea, IxCheckbox } from '@siemens/ix-react';
import { iconPlus, iconClose, iconTrashcan, iconSingleCheck, iconBulb, iconPen, iconChevronDown, iconChevronRight } from '@siemens/ix-icons/icons';
import './TreeNode.css';

/**
 * TreeNode Component
 * Recursive component for displaying nodes in the 5 Why analysis tree
 * Siemens IX Design System compliant
 * 
 * @component
 */
const TreeNode = ({ 
    node, 
    level = 0, 
    onAddChild, 
    onMarkAsRoot, 
    onActionChange,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [childInput, setChildInput] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [actionInput, setActionInput] = useState(node.action_plan ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingAction, setIsEditingAction] = useState(!node.action_plan);

    const nodeId = `node-${node.id}`;

    const isRootCause = Boolean(Number(node.is_root_cause));
    const hasChildren = node.children && node.children.length > 0;
    const description = node.description || node.text || 'Açıklama yok';

    const handleAddClick = () => {
        setShowInput(true);
    };

    const handleAddChild = () => {
        if (childInput.trim()) {
            onAddChild(node.id, childInput.trim());
            setChildInput('');
            setShowInput(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddChild();
        } else if (e.key === 'Escape') {
            setChildInput('');
            setShowInput(false);
        }
    };

    const handleActionSave = async () => {
        console.log('Saving action:', node.id, actionInput);
        if (onActionChange && actionInput.trim()) {
            setIsSaving(true);
            try {
                await onActionChange(node.id, actionInput);
                setIsEditingAction(false);
            } catch (err) {
                console.error('Save error:', err);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleEditAction = () => {
        setIsEditingAction(true);
    };

    const handleCancelEdit = () => {
        setActionInput(node.action_plan ?? '');
        if (node.action_plan) {
            setIsEditingAction(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Bu nedeni silmek istediğinize emin misiniz?')) {
            onDelete(node.id);
        }
    };

    const indent = level * 24;

    return (
        <div className="tree-node-wrapper" style={{ marginLeft: `${indent}px` }}>
            {/* Main Node */}
            <div className={`tree-node ${isRootCause ? 'tree-node--root-cause' : ''}`}>
                {/* Expand/Collapse Button */}
                {hasChildren && (
                    <IxIconButton
                        icon={isExpanded ? iconChevronDown : iconChevronRight}
                        size="16"
                        variant="secondary"
                        ghost
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-label={isExpanded ? 'Daralt' : 'Genişlet'}
                        aria-expanded={isExpanded}
                    />
                )}

                {/* Spacer when no children */}
                {!hasChildren && <span className="tree-node__spacer"></span>}

                {/* Level Badge */}
                <span className={`tree-node__badge ${isRootCause ? 'tree-node__badge--root' : ''}`}>
                    {level + 1}
                </span>

                {/* Description */}
                <span className="tree-node__description" id={nodeId}>
                    {description}
                </span>

                {/* Actions */}
                <div className="tree-node__actions">
                    {/* Root Cause Checkbox */}
                    <IxCheckbox
                        checked={isRootCause}
                        onCheckedChange={(e) => onMarkAsRoot(node.id, e.detail)}
                        label="Kök Neden"
                    />

                    {/* Add Child Button */}
                    {!showInput && (
                        <IxButton
                            variant="primary"
                            onClick={handleAddClick}
                            aria-label="Alt neden ekle"
                        >
                            <IxIcon name={iconPlus} size="14" slot="start"></IxIcon>
                            Neden?
                        </IxButton>
                    )}

                    {/* Delete Button */}
                    <IxIconButton
                        icon={iconTrashcan}
                        size="16"
                        variant="secondary"
                        color="color-alarm"
                        ghost
                        onClick={handleDelete}
                        aria-label="Sil"
                    />
                </div>
            </div>

            {/* Add Child Input */}
            {showInput && (
                <div className="tree-node__input-container">
                    <IxInput
                        value={childInput}
                        onValueChange={(e) => setChildInput(e.detail)}
                        onKeyDown={handleKeyPress}
                        placeholder="Bu neden böyle oldu?"
                        style={{ flex: 1 }}
                    />
                    <div className="tree-node__input-actions">
                        <IxButton
                            variant="primary"
                            onClick={handleAddChild}
                            disabled={!childInput.trim()}
                        >
                            Ekle
                        </IxButton>
                        <IxButton
                            variant="secondary"
                            outline
                            onClick={() => {
                                setShowInput(false);
                                setChildInput('');
                            }}
                        >
                            <IxIcon name={iconClose} size="14" slot="start"></IxIcon>
                            İptal
                        </IxButton>
                    </div>
                </div>
            )}

            {/* Action Plan (if root cause) */}
            {isRootCause && (
                <div className="tree-node__action-plan">
                    <div className="tree-node__action-header">
                        <IxIcon name={iconBulb} size="16"></IxIcon>
                        <span>Kalıcı Çözüm Aksiyonu (D6):</span>
                    </div>
                    
                    {/* View Mode */}
                    {!isEditingAction && actionInput ? (
                        <div className="tree-node__action-view">
                            <p className="tree-node__action-text">{actionInput}</p>
                            <IxButton 
                                variant="secondary" 
                                outline
                                onClick={handleEditAction}
                            >
                                <IxIcon name={iconPen} size="14" slot="start"></IxIcon>
                                Düzenle
                            </IxButton>
                        </div>
                    ) : (
                        /* Edit Mode */
                        <div className="tree-node__action-edit">
                            <div className="tree-node__textarea-wrapper">
                                <IxTextarea
                                    value={actionInput}
                                    onValueChange={(e) => setActionInput(e.detail)}
                                    placeholder="Bu kök neden için kalıcı çözüm aksiyonunu girin..."
                                    textareaRows={5}
                                />
                            </div>
                            <div className="tree-node__action-buttons">
                                <IxButton 
                                    variant="primary"
                                    onClick={handleActionSave}
                                    disabled={isSaving || !actionInput.trim()}
                                >
                                    <IxIcon name={iconSingleCheck} size="14" slot="start"></IxIcon>
                                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                                </IxButton>
                                {node.action_plan && (
                                    <IxButton 
                                        variant="secondary"
                                        outline
                                        onClick={handleCancelEdit}
                                    >
                                        <IxIcon name={iconClose} size="14" slot="start"></IxIcon>
                                        İptal
                                    </IxButton>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Children (Recursive) */}
            {isExpanded && hasChildren && (
                <div className="tree-node__children">
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onAddChild={onAddChild}
                            onMarkAsRoot={onMarkAsRoot}
                            onActionChange={onActionChange}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
