import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IxButton, IxModalHeader, IxModalContent, IxModalFooter, IxInput, IxTextarea, IxDateInput, Modal, showModal } from '@siemens/ix-react';
import './ProblemModal.css';

/**
 * Inner Modal Content Component
 */
const ModalContent = ({ onClose, onSubmit, initialData }) => {
    const modalRef = useRef(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        responsible_person: initialData?.responsible_person || '',
        team: initialData?.team || '',
        deadline: initialData?.deadline || '',
        status: initialData?.status || 'OPEN'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Problem başlığı zorunludur';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Başlık en az 5 karakter olmalıdır';
        }

        if (!formData.responsible_person.trim()) {
            newErrors.responsible_person = 'Sorumlu kişi zorunludur';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            modalRef.current?.close('submitted');
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        modalRef.current?.dismiss('cancelled');
    };

    const isEditMode = Boolean(initialData);
    const modalTitle = isEditMode ? 'Problem Düzenle' : 'Yeni Problem Ekle';

    return (
        <Modal ref={modalRef}>
            <IxModalHeader onCloseClick={handleCancel}>
                {modalTitle}
            </IxModalHeader>

            <IxModalContent>
                <form id="problem-form" onSubmit={handleSubmit} className="ix-form" noValidate>
                    <IxInput
                        label="Problem Başlığı"
                        required
                        value={formData.title}
                        onValueChange={(e) => handleChange('title', e.detail)}
                        placeholder="Problem başlığını girin"
                        invalidText={errors.title}
                    />

                    <IxTextarea
                        label="Detaylı Açıklama (D2)"
                        value={formData.description}
                        onValueChange={(e) => handleChange('description', e.detail)}
                        textareaRows={5}
                        placeholder="Problemin detaylarını açıklayın"
                    />

                    <div className="ix-form__row">
                        <IxInput
                            label="Sorumlu Kişi (D1)"
                            required
                            value={formData.responsible_person}
                            onValueChange={(e) => handleChange('responsible_person', e.detail)}
                            placeholder="Sorumlu kişi"
                            invalidText={errors.responsible_person}
                        />

                        <IxInput
                            label="Ekip"
                            value={formData.team}
                            onValueChange={(e) => handleChange('team', e.detail)}
                            placeholder="Ekip adı"
                        />
                    </div>

                    <IxDateInput
                        label="Termin Tarihi"
                        value={formData.deadline}
                        onValueChange={(e) => handleChange('deadline', e.detail)}
                        format="DD.MM.YYYY"
                        i18nPlaceholder="31.12.2025"
                    />
                </form>
            </IxModalContent>

            <IxModalFooter>
                <IxButton
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                >
                    İptal
                </IxButton>
                <IxButton
                    type="submit"
                    form="problem-form"
                    variant="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
                </IxButton>
            </IxModalFooter>
        </Modal>
    );
};

/**
 * Problem Modal Component - Uses showModal utility
 */
const ProblemModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {

    useEffect(() => {
        if (isOpen) {
            // showModal utility fonksiyonunu kullan
            showModal({
                content: <ModalContent onClose={onClose} onSubmit={onSubmit} initialData={initialData} />,
                size: '720'
            }).then((instance) => {
                // Modal kapandığında onClose çağır
                instance.onClose.once(() => {
                    onClose();
                });
                instance.onDismiss.once(() => {
                    onClose();
                });
            });
        }
    }, [isOpen, onClose, onSubmit, initialData]);

    return null; // Modal showModal ile açılıyor, burada bir şey render etmiyoruz
};

export default ProblemModal;
