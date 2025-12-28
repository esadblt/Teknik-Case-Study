/**
 * Application Messages
 * Centralized message constants for consistency
 * Supports future i18n implementation
 */

export const MESSAGES = {
    // Root Cause Messages
    ROOT_CAUSE: {
        REQUIRED: 'Lütfen kök neden giriniz',
        ADDED: 'Analiz başlatıldı',
        CHILD_ADDED: 'Alt neden eklendi',
        DELETED: 'Neden silindi',
        MARKED: 'Kök neden işaretlendi - Şimdi kalıcı çözüm tanımlayın',
        UNMARKED: 'Kök neden işareti kaldırıldı',
        LOAD_ERROR: 'Kök neden ağacı yüklenirken hata oluştu',
        ADD_ERROR: 'Kök neden eklenirken hata oluştu',
        UPDATE_ERROR: 'Güncelleme sırasında hata oluştu',
        DELETE_ERROR: 'Silme sırasında hata oluştu',
        MARK_ERROR: 'İşaretleme sırasında hata oluştu',
        ACTION_SAVED: 'Kalıcı çözüm aksiyonu kaydedildi',
        ACTION_STATUS_UPDATED: 'Kalıcı çözüm kaydedildi - Problem durumu güncellendi',
    },

    // Problem Messages
    PROBLEM: {
        CREATED: 'Problem başarıyla eklendi',
        UPDATED: 'Problem başarıyla güncellendi',
        DELETED: 'Problem silindi',
        LOAD_ERROR: 'Problem yüklenirken bir hata oluştu',
        LIST_ERROR: 'Veriler yüklenirken bir hata oluştu',
        CREATE_ERROR: 'Problem eklenirken bir hata oluştu',
        UPDATE_ERROR: 'Güncelleme sırasında bir hata oluştu',
        DELETE_ERROR: 'Silme sırasında bir hata oluştu',
    },

    // Common Messages
    COMMON: {
        LOADING: 'Yükleniyor...',
        ERROR: 'Bir hata oluştu',
        CONFIRM_DELETE: 'Silmek istediğinize emin misiniz?',
        RETRY: 'Tekrar Dene',
        CANCEL: 'İptal',
        SAVE: 'Kaydet',
        EDIT: 'Düzenle',
        DELETE: 'Sil',
        ADD: 'Ekle',
        CLOSE: 'Kapat',
    },

    // Validation Messages
    VALIDATION: {
        REQUIRED: 'Bu alan zorunludur',
        MIN_LENGTH: (min) => `En az ${min} karakter olmalıdır`,
        MAX_LENGTH: (max) => `En fazla ${max} karakter olabilir`,
        INVALID_DATE: 'Geçerli bir tarih giriniz',
        INVALID_EMAIL: 'Geçerli bir e-posta adresi giriniz',
    },

    // Status Labels
    STATUS: {
        OPEN: 'Açık',
        CLOSED: 'Kapalı',
        PENDING: 'Bekliyor',
        DETERMINED: 'Belirlendi',
    },

    // Help Messages
    HELP: {
        FIVE_WHY_TITLE: '5 Neden Analizi Nasıl Yapılır?',
        FIVE_WHY_STEPS: [
            'Her nedene "Neden bu oluyor?" sorusunu sorun',
            'Yanıtı alt neden olarak ekleyin',
            'Bu işlemi 5 kez tekrarlayın',
            'Gerçek kök nedeni bulduğunuzda işaretleyin',
            'Kök neden için kalıcı çözüm tanımlayın',
        ],
    },
};

// Form Labels
export const LABELS = {
    PROBLEM: {
        TITLE: 'Problem Başlığı',
        DESCRIPTION: 'Açıklama',
        RESPONSIBLE: 'Sorumlu',
        TEAM: 'Ekip',
        DEADLINE: 'Termin',
        STATUS: 'Durum',
        CREATED_AT: 'Oluşturulma Tarihi',
    },
    ROOT_CAUSE: {
        DESCRIPTION: 'Kök Neden',
        ACTION_PLAN: 'Kalıcı Çözüm Aksiyonu',
        IS_ROOT_CAUSE: 'Kök Neden mi?',
    },
};

// Placeholder Texts
export const PLACEHOLDERS = {
    PROBLEM: {
        TITLE: 'Problem başlığını giriniz',
        DESCRIPTION: 'Detaylı açıklama giriniz',
        RESPONSIBLE: 'Sorumlu kişiyi giriniz',
        TEAM: 'Ekip adını giriniz',
    },
    ROOT_CAUSE: {
        INITIAL: 'Örnek: Makine Durdu, Kalite Problemi, Üretim Gecikmesi',
        CHILD: 'Neden bu oluyor?',
        ACTION: 'Kalıcı düzeltici aksiyon tanımlayın',
    },
};

export default MESSAGES;
