import { useState } from 'react';
import { searchFileByNISN, getDownloadLink, getViewLink, formatFileSize } from './services/googleDrive';
import './App.css';

function App() {
  const [nisn, setNisn] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setLoading(true);
    setSearched(true);

    try {
      const files = await searchFileByNISN(nisn);
      setResults(files);
      if (files.length === 0) {
        setError('Tidak ditemukan sertifikat dengan NISN tersebut');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setNisn(value);
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <h1>Cek Sertifikat TKA</h1>
          </div>
          <p className="subtitle">Masukkan NISN Anda untuk mengunduh sertifikat</p>
        </header>

        {/* Search Card */}
        <div className="search-card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <label htmlFor="nisn">Nomor Induk Siswa Nasional (NISN)</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="nisn"
                  value={nisn}
                  onChange={handleInputChange}
                  placeholder="Contoh: 1234567890"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="search-button"
              disabled={loading || nisn.length !== 10}
            >
              {loading ? "Mencari..." : "Cari Sekarang"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="results-section">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="results-container">
                <h3 className="section-title">Hasil Pencarian</h3>
                <div className="results-list">
                  {results.map((file) => (
                    <div key={file.id} className="file-box">
                      <div className="file-main">
                        <span className="file-type-icon">📄</span>
                        <div className="file-details">
                          <span className="file-label">Nama File</span>
                          <p className="file-name">{file.name}</p>
                          <div className="file-meta">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="dot">•</span>
                            <span>{new Date(file.createdTime).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="file-actions">
                        <a
                          href={getViewLink(file.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-btn secondary"
                        >
                          Pratinjau
                        </a>
                        <a
                          href={getDownloadLink(file.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-btn primary"
                        >
                          Unduh PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>© 2026 Admin TKA. Sistem Pencarian Sertifikat Otomatis.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
