import React, { useState, useEffect } from 'react';

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch file list on component mount
    useEffect(() => {
        fetchFileList();
    }, []);

    const fetchFileList = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/drive/files');
            const data = await response.json();
            if (data.success) {
                setFileList(data.files);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            setMessage('Error fetching file list');
        }
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select a file first');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/api/drive/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                setMessage('File uploaded successfully!');
                setSelectedFile(null);
                // Refresh file list
                fetchFileList();
            } else {
                setMessage('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setMessage('Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/drive/download/${fileId}`);
            const data = await response.json();
            
            if (data.success) {
                setMessage('File downloaded successfully!');
            } else {
                setMessage('Download failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            setMessage('Error downloading file');
        }
    };

    return (
        <div className="file-upload-container">
            <h2>Google Drive File Manager</h2>
            
            {/* File Upload Section */}
            <div className="upload-section">
                <input
                    type="file"
                    onChange={handleFileSelect}
                    className="file-input"
                />
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                    className="upload-button"
                >
                    {loading ? 'Uploading...' : 'Upload to Drive'}
                </button>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            {/* File List Section */}
            <div className="file-list">
                <h3>Files in Drive</h3>
                {fileList.length > 0 ? (
                    <ul>
                        {fileList.map((file) => (
                            <li key={file.id}>
                                <span>{file.name}</span>
                                <button
                                    onClick={() => handleDownload(file.id)}
                                    className="download-button"
                                >
                                    Download
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No files found</p>
                )}
            </div>

            <style jsx>{`
                .file-upload-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .upload-section {
                    margin: 20px 0;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .file-input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .upload-button, .download-button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .upload-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                .message {
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }

                .success {
                    background-color: #d4edda;
                    color: #155724;
                }

                .error {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .file-list {
                    margin-top: 20px;
                }

                .file-list ul {
                    list-style: none;
                    padding: 0;
                }

                .file-list li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }

                .download-button {
                    background-color: #28a745;
                }

                .download-button:hover {
                    background-color: #218838;
                }
            `}</style>
        </div>
    );
};

export default FileUpload; 