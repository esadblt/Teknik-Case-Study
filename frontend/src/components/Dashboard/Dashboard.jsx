import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { IxPill, IxButton, IxSpinner, IxMessageBar, IxContentHeader, IxTooltip } from '@siemens/ix-react';
import { themeSwitcher } from '@siemens/ix';
import { getIxTheme } from '@siemens/ix-aggrid';
import * as agGrid from 'ag-grid-community';
import { getProblems, createProblem } from '../../services/problemService';
import ProblemModal from '../ProblemModal/ProblemModal';
import { showToast } from '../../utils/toast';
import { announcePolitely, announceAssertively } from '../../utils/accessibility';

// Note: ag-grid.css removed to avoid conflict with IX theme
import './Dashboard.css';

ModuleRegistry.registerModules([AllCommunityModule]);

// Siemens IX AG Grid Theme
const ixTheme = getIxTheme(agGrid);

/**
 * Get current IX theme variant (dark/light)
 */
const getCurrentThemeVariant = () => {
    const isDark = themeSwitcher.getCurrentTheme()?.includes('dark') ?? true;
    return isDark ? 'dark' : 'light';
};

/**
 * Format date to Turkish format (DD.MM.YYYY)
 */
const formatDateTR = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

/**
 * Status Badge Component for AG Grid using IX Pill
 */
const StatusBadge = ({ value }) => {
    const isOpen = value === 'OPEN';
    const statusText = isOpen ? 'Açık' : 'Kapalı';

    return (
        <IxPill
            variant={isOpen ? 'alarm' : 'success'}
            aria-label={`Durum: ${statusText}`}
        >
            {statusText}
        </IxPill>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [rowData, setRowData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [colDefs] = useState([
        {
            field: "id",
            headerName: "ID",
            width: 70,
            minWidth: 60,
            filter: true,
            sortable: true,
            hide: false
        },
        {
            field: "title",
            headerName: "Problem Başlığı",
            flex: 2,
            minWidth: 200,
            filter: true,
            sortable: true
        },
        {
            field: "responsible_person",
            headerName: "Sorumlu",
            flex: 1,
            minWidth: 120,
            filter: true,
            sortable: true
        },
        {
            field: "team",
            headerName: "Ekip",
            flex: 1,
            minWidth: 100,
            filter: true,
            sortable: true
        },
        {
            field: "status",
            headerName: "Durum",
            width: 120,
            minWidth: 100,
            cellRenderer: StatusBadge,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            sortable: true
        },
        {
            field: "deadline",
            headerName: "Termin",
            width: 120,
            minWidth: 100,
            filter: true,
            sortable: true,
            valueFormatter: (params) => formatDateTR(params.value)
        },
        {
            field: "created_at",
            headerName: "Tarih",
            width: 120,
            minWidth: 100,
            filter: true,
            sortable: true,
            valueFormatter: (params) => formatDateTR(params.value)
        }
    ]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            announcePolitely('Veriler yükleniyor...');
            const data = await getProblems();
            setRowData(data);
            announcePolitely(`${data.length} problem yüklendi`);
        } catch (err) {
            setError('Veriler yüklenirken bir hata oluştu.');
            announceAssertively('Hata: Veriler yüklenirken bir problem oluştu');
            console.error('Veri yükleme hatası:', err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle row click - navigate to problem detail
     * @param {Object} event - AG Grid row click event
     */
    const handleRowClick = useCallback((event) => {
        const problemId = event.data.id;
        navigate(`/problem/${problemId}`);
    }, [navigate]);

    const handleAddProblem = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        try {
            await createProblem(formData);
            setIsModalOpen(false);
            loadData();
            showToast('Problem başarıyla eklendi', 'success');
            announcePolitely('Yeni problem başarıyla eklendi');
        } catch (error) {
            console.error('Problem eklenirken hata:', error);
            showToast('Problem eklenirken bir hata oluştu', 'error');
            announceAssertively('Hata: Problem eklenirken bir sorun oluştu');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <IxContentHeader
                    headerTitle="8D Problem Takip Listesi"
                    headerSubtitle={`${rowData.length} problem kayıtlı`}
                >
                </IxContentHeader>
                <IxButton
                    id="add-problem-btn"
                    variant="primary"
                    onClick={handleAddProblem}
                    aria-label="Yeni problem ekle"
                >
                    Yeni Problem Ekle
                </IxButton>
                <IxTooltip for="add-problem-btn">
                    Yeni bir 8D problem kaydı oluşturmak için tıklayın
                </IxTooltip>
            </div>

            {isLoading && (
                <div
                    className="loading-state loading-container"
                    role="status"
                    aria-live="polite"
                    aria-label="Veriler yükleniyor"
                >
                    <IxSpinner size="large" aria-hidden="true"></IxSpinner>
                    <span className="visually-hidden">Veriler yükleniyor, lütfen bekleyin</span>
                </div>
            )}

            {error && (
                <IxMessageBar type="danger" role="alert" aria-live="assertive">
                    {error}
                </IxMessageBar>
            )}

            {!isLoading && !error && (
                <div className="dashboard-table">
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        theme={ixTheme}
                        domLayout="normal"
                        onRowClicked={handleRowClick}
                        rowSelection={{ mode: 'singleRow', checkboxes: false }}
                        suppressCellFocus={false}
                        getRowId={(params) => String(params.data.id)}
                        rowClass="clickable-row"
                    />
                </div>
            )}

            <ProblemModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default Dashboard;