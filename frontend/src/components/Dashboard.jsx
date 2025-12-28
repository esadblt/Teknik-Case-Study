import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { IxPill, IxButton, IxSpinner, IxMessageBar, IxContentHeader } from '@siemens/ix-react';
import { getProblems, createProblem } from '../services/problemService';
import ProblemModal from './ProblemModal';
import { showToast } from '../utils/toast';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './Dashboard.css';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Status Badge Component for AG Grid using IX Pill
 */
const StatusBadge = ({ value }) => {
    const isOpen = value === 'OPEN';
    const statusText = isOpen ? 'Açık' : 'Kapalı';
    
    return (
        <IxPill 
            variant={isOpen ? 'alarm' : 'success'}
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
            width: 80,
            filter: true,
            sortable: true
        },
        { 
            field: "title", 
            headerName: "Problem Başlığı", 
            flex: 2, 
            filter: true,
            sortable: true
        },
        { 
            field: "responsible_person", 
            headerName: "Sorumlu", 
            flex: 1,
            filter: true,
            sortable: true
        },
        { 
            field: "team", 
            headerName: "Ekip", 
            flex: 1,
            filter: true,
            sortable: true
        },
        { 
            field: "status", 
            headerName: "Durum", 
            width: 140,
            cellRenderer: StatusBadge,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            sortable: true
        },
        { 
            field: "deadline", 
            headerName: "Termin", 
            width: 130,
            filter: true,
            sortable: true
        },
        { 
            field: "created_at", 
            headerName: "Tarih", 
            width: 150,
            filter: true,
            sortable: true
        }
    ]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProblems();
            setRowData(data);
        } catch (err) {
            setError('Veriler yüklenirken bir hata oluştu.');
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
        } catch (error) {
            console.error('Problem eklenirken hata:', error);
            showToast('Problem eklenirken bir hata oluştu', 'error');
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
                    variant="primary" 
                    onClick={handleAddProblem}
                >
                    Yeni Problem Ekle
                </IxButton>
            </div>

            {isLoading && (
                <div className="loading-container">
                    <IxSpinner size="large"></IxSpinner>
                </div>
            )}

            {error && (
                <IxMessageBar type="danger">
                    {error}
                </IxMessageBar>
            )}

            {!isLoading && !error && (
                <div className="ag-theme-quartz dashboard-table">
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        theme="legacy"
                        domLayout="normal"
                        onRowClicked={handleRowClick}
                        rowSelection="single"
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