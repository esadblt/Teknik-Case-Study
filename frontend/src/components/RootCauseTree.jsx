import React, { useState, useEffect, useCallback } from 'react';
import { IxIcon, IxInput, IxButton, IxSpinner, IxMessageBar } from '@siemens/ix-react';
import { iconBulb, iconRocket } from '@siemens/ix-icons/icons';
import { getRootCauseTree, addRootCause, updateRootCause, deleteRootCause } from '../services/rootCauseService';
import { useAlert } from '../hooks/useAlert';
import TreeNode from './TreeNode';
import './RootCauseTree.css';

/**
 * Root Cause Tree Component
 * Implements 5 Why Analysis (Why-Why) methodology for 8D Problem Solving
 * Supports D4 (Root Cause Identification) and D5 (Corrective Actions)
 * 
 * @component
 * @param {Object} props
 * @param {number} props.problemId - Associated problem ID
 * @param {string} [props.problemTitle] - Problem title for initial root node
 * @param {Function} [props.onStatusChange] - Callback when problem status may have changed
 */
const RootCauseTree = ({ problemId, problemTitle, onStatusChange }) => {
    const [rootCause, setRootCause] = useState(problemTitle || '');
    const [childNodes, setChildNodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();

    /**
     * Load existing tree from backend
     */
    const loadTree = useCallback(async () => {
        if (!problemId) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const tree = await getRootCauseTree(problemId);
            setChildNodes(tree || []);
        } catch (err) {
            console.error('Kök neden ağacı yükleme hatası:', err);
            setError('Kök neden ağacı yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }, [problemId]);

    useEffect(() => {
        loadTree();
    }, [loadTree]);

    // Update rootCause when problemTitle changes
    useEffect(() => {
        if (problemTitle && !rootCause) {
            setRootCause(problemTitle);
        }
    }, [problemTitle, rootCause]);

    /**
     * Add initial root cause to start analysis
     */
    const handleAddRootCause = async () => {
        console.log('handleAddRootCause called with:', rootCause);
        
        if (!rootCause.trim()) {
            showAlert('Lütfen kök neden giriniz', 'error');
            return;
        }

        // Çift tıklama engelle
        if (isSubmitting) {
            console.log('Already submitting, ignoring...');
            return;
        }

        setIsSubmitting(true);

        if (problemId) {
            try {
                console.log('Adding root cause to backend, problemId:', problemId);
                
                const response = await addRootCause({
                    problem_id: problemId,
                    parent_id: null,
                    description: rootCause
                });
                
                console.log('Root cause added successfully:', response);
                
                await loadTree();
                showAlert('Analiz başlatıldı', 'polite');
                setRootCause('');
            } catch (err) {
                console.error('Error adding root cause:', err);
                showAlert(`Kök neden eklenirken hata oluştu: ${err.message}`, 'error');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('No problemId, using local state');
            const newRoot = {
                id: Date.now(),
                text: rootCause,
                description: rootCause,
                type: 'root',
                children: [],
                isRootCause: false,
                is_root_cause: false,
                action: ''
            };
            setChildNodes([newRoot]);
            setRootCause('');
            showAlert('Analiz başlatıldı (yerel mod)', 'polite');
            setIsSubmitting(false);
        }
    };

    /**
     * Add child node (sub-cause) to existing node
     */
    const handleAddChildNode = async (parentId, nodeText) => {
        if (!nodeText.trim()) return;

        if (problemId) {
            try {
                await addRootCause({
                    problem_id: problemId,
                    parent_id: parentId,
                    description: nodeText
                });
                await loadTree();
                showAlert('Alt neden eklendi', 'polite');
            } catch (err) {
                showAlert('Alt neden eklenirken hata oluştu', 'error');
            }
        } else {
            // Local state update for offline mode
            const addChild = (nodes) => {
                return nodes.map(node => {
                    if (node.id === parentId) {
                        return {
                            ...node,
                            children: [...(node.children || []), {
                                id: Date.now(),
                                text: nodeText,
                                type: 'child',
                                children: [],
                                isRootCause: false,
                                action: ''
                            }]
                        };
                    }
                    if (node.children?.length > 0) {
                        return { ...node, children: addChild(node.children) };
                    }
                    return node;
                });
            };
            setChildNodes(addChild(childNodes));
        }
    };

    /**
     * Mark a node as the root cause (only one can be marked)
     */
    const handleMarkAsRootCause = async (nodeId, newValue) => {
        try {
            if (problemId) {
                // First, find the node to get its details
                const findNode = (nodes) => {
                    for (const node of nodes) {
                        if (node.id === nodeId) return node;
                        if (node.children?.length > 0) {
                            const found = findNode(node.children);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                
                const targetNode = findNode(childNodes);
                if (targetNode) {
                    const response = await updateRootCause(nodeId, {
                        is_root_cause: newValue,
                        description: targetNode.description || targetNode.text,
                        action_plan: targetNode.action_plan || targetNode.action || ''
                    });
                    
                    // Problem durumu değiştiyse parent'a haber ver
                    if (response.problem_status_updated && onStatusChange) {
                        onStatusChange();
                    }
                }
            }

            const markNode = (nodes) => {
                return nodes.map(node => {
                    if (node.id === nodeId) {
                        return { ...node, is_root_cause: newValue, isRootCause: newValue };
                    }
                    // If marking as root cause, unmark all others
                    if (newValue) {
                        return {
                            ...node,
                            is_root_cause: false,
                            isRootCause: false,
                            children: node.children?.length > 0 ? markNode(node.children) : []
                        };
                    }
                    return {
                        ...node,
                        children: node.children?.length > 0 ? markNode(node.children) : []
                    };
                });
            };
            
            setChildNodes(markNode(childNodes));
            
            if (newValue) {
                showAlert('Kök neden işaretlendi - Şimdi kalıcı çözüm tanımlayın', 'polite');
            } else {
                showAlert('Kök neden işareti kaldırıldı', 'polite');
            }
        } catch (err) {
            console.error('Mark as root cause error:', err);
            showAlert('İşaretleme sırasında hata oluştu', 'error');
        }
    };

    /**
     * Update action plan for a root cause
     */
    const handleActionChange = async (nodeId, action) => {
        try {
            // Önce node'u bul
            const findNode = (nodes) => {
                for (const node of nodes) {
                    if (node.id === nodeId) return node;
                    if (node.children?.length > 0) {
                        const found = findNode(node.children);
                        if (found) return found;
                    }
                }
                return null;
            };
            
            const targetNode = findNode(childNodes);
            
            if (targetNode && problemId) {
                const isRootCause = targetNode.is_root_cause || targetNode.isRootCause;
                if (isRootCause) {
                    // Backend'e kaydet ve bekle
                    const response = await updateRootCause(nodeId, {
                        is_root_cause: isRootCause,
                        description: targetNode.description || targetNode.text,
                        action_plan: action
                    });
                    
                    // Problem durumu değiştiyse parent'a haber ver
                    if (response.problem_status_updated && onStatusChange) {
                        onStatusChange();
                        showAlert('Kalıcı çözüm kaydedildi - Problem durumu güncellendi', 'polite');
                    } else {
                        showAlert('Kalıcı çözüm aksiyonu kaydedildi', 'polite');
                    }
                }
            }
            
            // Local state'i güncelle
            const updateAction = (nodes) => {
                return nodes.map(node => {
                    if (node.id === nodeId) {
                        return { ...node, action, action_plan: action };
                    }
                    if (node.children?.length > 0) {
                        return { ...node, children: updateAction(node.children) };
                    }
                    return node;
                });
            };
            setChildNodes(updateAction(childNodes));
            
        } catch (err) {
            console.error('Action change error:', err);
            throw err; // Hatayı yukarı fırlat ki TreeNode yakalasın
        }
    };

    /**
     * Delete a root cause node
     */
    const handleDeleteNode = async (nodeId) => {
        console.log('handleDeleteNode called with nodeId:', nodeId);
        
        if (problemId) {
            try {
                console.log('Deleting from backend...');
                const response = await deleteRootCause(nodeId);
                console.log('Delete response:', response);
                
                await loadTree();
                showAlert('Neden silindi', 'polite');
            } catch (err) {
                console.error('Delete error:', err);
                showAlert(`Silme sırasında hata oluştu: ${err.message}`, 'error');
            }
        } else {
            // Local state'den sil
            const removeNode = (nodes) => {
                return nodes.filter(node => {
                    if (node.id === nodeId) return false;
                    if (node.children?.length > 0) {
                        node.children = removeNode(node.children);
                    }
                    return true;
                });
            };
            setChildNodes(removeNode(childNodes));
            showAlert('Neden silindi (yerel mod)', 'polite');
        }
    };

    /**
     * Handle keyboard navigation for accessibility
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddRootCause();
        }
    };

    /**
     * Count total nodes in tree
     */
    const countNodes = (nodes) => {
        return nodes.reduce((count, node) => {
            return count + 1 + (node.children ? countNodes(node.children) : 0);
        }, 0);
    };

    /**
     * Find root cause node
     */
    const findRootCauseNode = (nodes) => {
        for (const node of nodes) {
            // Check both camelCase and snake_case (API returns snake_case)
            if (node.isRootCause || Boolean(Number(node.is_root_cause))) return node;
            if (node.children?.length > 0) {
                const found = findRootCauseNode(node.children);
                if (found) return found;
            }
        }
        return null;
    };

    const totalNodes = countNodes(childNodes);
    const rootCauseNode = findRootCauseNode(childNodes);

    return (
        <div className="root-cause-container" role="region" aria-label="Kök Neden Analizi">
            {/* Stats Bar */}
            {childNodes.length > 0 && (
                <div className="root-cause-stats" role="status">
                    <div className="stat-item">
                        <span className="stat-label">Toplam Neden</span>
                        <span className="stat-value">{totalNodes}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Derinlik</span>
                        <span className="stat-value">
                            {childNodes.length > 0 ? Math.min(5, totalNodes) : 0} / 5
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Kök Neden</span>
                        <span className={`stat-value ${rootCauseNode ? 'stat-value--success' : 'stat-value--warning'}`}>
                            {rootCauseNode ? 'Belirlendi' : 'Bekliyor'}
                        </span>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="loading-state loading-container" role="status" aria-live="polite">
                    <IxSpinner size="large"></IxSpinner>
                    <span className="loading-state__text">Ağaç yükleniyor...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="error-container">
                    <IxMessageBar type="danger">
                        {error}
                    </IxMessageBar>
                    <IxButton variant="secondary" onClick={loadTree}>
                        Tekrar Dene
                    </IxButton>
                </div>
            )}

            {/* Initial Input - Start Analysis */}
            {!isLoading && !error && childNodes.length === 0 && (
                <div className="root-input-section">
                    <div className="input-header">
                        <IxIcon name={iconBulb} size="32"></IxIcon>
                        <div>
                            <label htmlFor="root-cause-input" className="input-label">
                                Problem Nedir?
                            </label>
                            <p className="input-hint">
                                Analiz edilecek problemi tanımlayın. Bu, 5 Neden analizinin başlangıç noktası olacak.
                            </p>
                        </div>
                    </div>
                    <div className="input-wrapper">
                        <IxInput
                            value={rootCause}
                            onValueChange={(e) => setRootCause(e.detail)}
                            onKeyDown={handleKeyDown}
                            placeholder="Örnek: Makine Durdu, Kalite Problemi, Üretim Gecikmesi"
                            style={{ flex: 1 }}
                        />
                        <IxButton 
                            variant="primary" 
                            onClick={handleAddRootCause}
                            disabled={!rootCause.trim() || isSubmitting}
                        >
                            <IxIcon name={iconRocket} slot="start"></IxIcon>
                            {isSubmitting ? 'Başlatılıyor...' : 'Analizi Başlat'}
                        </IxButton>
                    </div>
                </div>
            )}

            {/* Tree Visualization */}
            {!isLoading && !error && childNodes.length > 0 && (
                <div 
                    className="tree-container" 
                    role="tree" 
                    aria-label="Kök neden ağacı"
                >
                    {childNodes.map(node => (
                        <TreeNode 
                            key={node.id} 
                            node={node}
                            level={0}
                            onAddChild={handleAddChildNode}
                            onMarkAsRoot={handleMarkAsRootCause}
                            onActionChange={handleActionChange}
                            onDelete={handleDeleteNode}
                        />
                    ))}
                </div>
            )}

        </div>
    );
};

export default RootCauseTree;