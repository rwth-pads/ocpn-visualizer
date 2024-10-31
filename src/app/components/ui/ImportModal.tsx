import React, { useState, ChangeEvent } from 'react';

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
    color: '#000', // Added text color
};

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#000', // Added text color
};

interface ModalProps {
    onClose: () => void;
    onFileParsed?: (file: File) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onFileParsed }) => {
    const [importedFiles, setImportedFiles] = useState<string[]>([]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileName = file.name;
            setImportedFiles((prevFiles) => [...prevFiles, fileName]);
            if (onFileParsed) {
                onFileParsed(file);
            }
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2>Import File</h2>
                <input type="file" accept=".json" onChange={handleFileChange} />
                <ul>
                    {importedFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Modal;
