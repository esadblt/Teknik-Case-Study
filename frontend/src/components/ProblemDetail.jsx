import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IxIcon, IxPill, IxButton, IxSpinner, IxMessageBar, IxContentHeader, IxTabs, IxTabItem, IxCard, IxCardContent, IxTypography, IxLayoutGrid, IxRow, IxCol } from '@siemens/ix-react';
import { iconArrowLeft, iconPen, iconClock } from '@siemens/ix-icons/icons';
import { getProblem, updateProblem } from '../services/problemService';
import RootCauseTree from './RootCauseTree';
import ProblemModal from './ProblemModal';
import { showToast } from '../utils/toast';
import './ProblemDetail.css';

/**
 * Problem Detail Component
 * Displays problem information with 8D methodology structure
 * Includes RootCauseTree for D4-D5 "5 Why" Analysis
 * 
 * @component
 */
const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [problem, setProblem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    /**
     * Load problem data
     */
    const loadProblem = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProblem(id);
            setProblem(data);
        } catch (err) {
            setError('Problem yüklenirken bir hata oluştu.');
            console.error('Problem yükleme hatası:', err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProblem();
    }, [loadProblem]);

    /**
     * Handle problem update
     */
    const handleUpdate = async (formData) => {
        try {
            await updateProblem(id, formData);
            setIsEditModalOpen(false);
            loadProblem();
            showToast('Problem başarıyla güncellendi', 'success');
        } catch (err) {
            console.error('Güncelleme hatası:', err);
            showToast('Güncelleme sırasında bir hata oluştu', 'error');
        }
    };

    /**
     * Navigate back to dashboard
     */
    const handleBack = () => {
        navigate('/');
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Get status display properties
     */
    const getStatusInfo = (status) => {
        return status === 'OPEN' 
            ? { text: 'Açık', className: 'status--open' }
            : { text: 'Kapalı', className: 'status--closed' };
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="problem-detail" role="main" aria-busy="true">
                <div className="loading-container">
                    <IxSpinner size="large"></IxSpinner>
                    <p className="loading-text">Problem yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="problem-detail" role="main">
                <IxMessageBar type="danger">
                    {error}
                </IxMessageBar>
                <div className="error-actions">
                    <IxButton variant="secondary" onClick={handleBack}>
                        Geri Dön
                    </IxButton>
                    <IxButton variant="primary" onClick={loadProblem}>
                        Tekrar Dene
                    </IxButton>
                </div>
            </div>
        );
    }

    // No data state
    if (!problem) {
        return (
            <div className="problem-detail" role="main">
                <IxMessageBar type="warning">
                    Problem bulunamadı.
                </IxMessageBar>
                <IxButton variant="secondary" onClick={handleBack}>
                    Geri Dön
                </IxButton>
            </div>
        );
    }

    const statusInfo = getStatusInfo(problem.status);

    return (
        <div className="problem-detail" role="main">
            {/* Header with IX Content Header */}
            <IxContentHeader
                headerTitle={problem.title}
                headerSubtitle={`Problem #${problem.id}`}
                hasBackButton
                onBackButtonClick={handleBack}
            >
                <IxPill 
                    slot="header-actions"
                    variant={problem.status === 'OPEN' ? 'alarm' : 'success'}
                >
                    {statusInfo.text}
                </IxPill>
                <IxButton 
                    slot="header-actions"
                    variant="primary"
                    onClick={() => setIsEditModalOpen(true)}
                >
                    <IxIcon name={iconPen} slot="start"></IxIcon>
                    Düzenle
                </IxButton>
            </IxContentHeader>

            {/* Tab Navigation with IX Tabs */}
            <div className="tabs-wrapper">
                <IxTabs>
                    <IxTabItem 
                        selected={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    >
                        Genel Bakış
                    </IxTabItem>
                    <IxTabItem 
                        selected={activeTab === 'root-cause'}
                        onClick={() => setActiveTab('root-cause')}
                    >
                        Kök Neden Analizi (D4-D5)
                    </IxTabItem>
                </IxTabs>
            </div>

            {/* Tab Content */}
            <div className="problem-detail__content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div 
                        id="tab-overview" 
                        role="tabpanel"
                        aria-labelledby="tab-overview"
                        className="tab-panel"
                    >
                        {/* 8D Steps Overview - Row 1 */}
                        <IxLayoutGrid>
                            <IxRow>
                                {/* D1: Team */}
                                <IxCol size="6" sizeSm="12">
                                    <IxCard variant="filled">
                                        <IxCardContent>
                                            <div className="card-title-row">
                                                <span className="eight-d-badge">D1</span>
                                                <IxTypography format="h4">Ekip Oluşturma</IxTypography>
                                            </div>
                                            <div className="card-info-grid">
                                                <div className="info-block">
                                                    <IxTypography format="label" color="soft">SORUMLU KİŞİ</IxTypography>
                                                    <IxTypography format="body">{problem.responsible_person || '-'}</IxTypography>
                                                </div>
                                                <div className="info-block">
                                                    <IxTypography format="label" color="soft">EKİP</IxTypography>
                                                    <IxTypography format="body">{problem.team || '-'}</IxTypography>
                                                </div>
                                            </div>
                                        </IxCardContent>
                                    </IxCard>
                                </IxCol>

                                {/* Timeline Info */}
                                <IxCol size="6" sizeSm="12">
                                    <IxCard variant="filled">
                                        <IxCardContent>
                                            <div className="card-title-row">
                                                <IxIcon name={iconClock} size="24" color="color-primary"></IxIcon>
                                                <IxTypography format="h4">Zaman Bilgisi</IxTypography>
                                            </div>
                                            <div className="card-info-grid">
                                                <div className="info-block">
                                                    <IxTypography format="label" color="soft">OLUŞTURULMA</IxTypography>
                                                    <IxTypography format="body">{formatDate(problem.created_at)}</IxTypography>
                                                </div>
                                                <div className="info-block">
                                                    <IxTypography format="label" color="soft">TERMİN</IxTypography>
                                                    <IxTypography format="body">{formatDate(problem.deadline)}</IxTypography>
                                                </div>
                                            </div>
                                        </IxCardContent>
                                    </IxCard>
                                </IxCol>
                            </IxRow>

                            {/* D2: Problem Description - Full Width */}
                            <IxRow className="mt-3">
                                <IxCol>
                                    <IxCard variant="filled">
                                        <IxCardContent>
                                            <div className="card-title-row">
                                                <span className="eight-d-badge">D2</span>
                                                <IxTypography format="h4">Problem Tanımı</IxTypography>
                                            </div>
                                            <IxTypography format="body" className="description-text">
                                                {problem.description || 'Henüz açıklama eklenmemiş.'}
                                            </IxTypography>
                                        </IxCardContent>
                                    </IxCard>
                                </IxCol>
                            </IxRow>

                        </IxLayoutGrid>
                    </div>
                )}

                {/* Root Cause Analysis Tab */}
                {activeTab === 'root-cause' && (
                    <div 
                        id="tab-root-cause" 
                        role="tabpanel"
                        aria-labelledby="tab-root-cause"
                        className="tab-panel"
                    >
                        <div className="root-cause-section">
                            <div className="section-header">
                                <h2 className="section-title">5 Neden Analizi (Why-Why)</h2>
                                <p className="section-description">
                                    Her "Neden?" sorusuna yanıt vererek kök nedene ulaşın. 
                                    Kök nedeni bulduğunuzda işaretleyin ave kalıcı çözümü tanımlayın.
                                </p>
                            </div>
                            
                            <RootCauseTree 
                                problemId={parseInt(id)} 
                                problemTitle={problem.title}
                                onStatusChange={loadProblem}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <ProblemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdate}
                initialData={problem}
            />
        </div>
    );
};

export default ProblemDetail;
