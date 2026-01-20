import { config } from '../config';

const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

/**
 * Mencari file di Google Drive berdasarkan NISN
 * @param {string} nisn - Nomor Induk Siswa Nasional
 * @returns {Promise<Array>} - Array of file objects
 */
export async function searchFileByNISN(nisn) {
    if (!nisn || nisn.trim() === '') {
        throw new Error('NISN tidak boleh kosong');
    }

    // Validasi NISN (hanya angka, 10 digit)
    const cleanNISN = nisn.trim();
    if (!/^\d{10}$/.test(cleanNISN)) {
        throw new Error('NISN harus berupa 10 digit angka');
    }

    // Query untuk mencari file yang mengandung NISN di namanya
    // dan berada di folder yang ditentukan
    const query = `name contains '${cleanNISN}' and '${config.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`;

    const params = new URLSearchParams({
        q: query,
        key: config.GOOGLE_API_KEY,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink, size, createdTime)',
    });

    try {
        const response = await fetch(`${GOOGLE_DRIVE_API_URL}?${params}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Drive API Error:', errorData);

            if (response.status === 403) {
                throw new Error('API Key tidak valid atau tidak memiliki akses ke Google Drive API');
            }
            if (response.status === 404) {
                throw new Error('Folder tidak ditemukan');
            }
            throw new Error('Gagal mengakses Google Drive API');
        }

        const data = await response.json();
        return data.files || [];
    } catch (error) {
        if (error.message.includes('API Key') || error.message.includes('Folder')) {
            throw error;
        }
        console.error('Search error:', error);
        throw new Error('Terjadi kesalahan saat mencari file. Periksa koneksi internet Anda.');
    }
}

/**
 * Generate direct download link untuk file Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {string} - Direct download URL
 */
export function getDownloadLink(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Generate view link untuk file Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {string} - View URL
 */
export function getViewLink(fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Format file size ke human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
