import React, { useEffect } from 'react';

import './ImportDialog.css';

interface ImportDialogProps {
    darkMode: boolean;
    importDialogOpen: boolean;
    onClose: () => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    importError: string | null;
    failedFiles: string[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({ darkMode, importDialogOpen, onClose, onDrop, onFileInputChange, importError, failedFiles }) => {
    const importDialogRef = React.useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (importDialogRef.current && !importDialogRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    useEffect(() => {
        if (importDialogOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [importDialogOpen]);

    return (
        <div
            ref={importDialogRef}
            className={`import-dialog-container${darkMode ? ' dark' : ' light'}${importDialogOpen ? ' show' : ''}`}
        >
            <div className={`import-dialog-header${darkMode ? ' dark' : ' light'}`}>
                Import File
            </div>
            <hr />
            <div className={`import-dialog-content-text${darkMode ? ' dark' : ' light'}`}>
                Please select a .json or .pnml file to import an Object-Centric Petri Net:
            </div>
            <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput')?.click()}
                className={`import-dialog-drop-area${darkMode ? ' dark' : ' light'}`}
            >
                <div className={`import-dialog-drop-area-text${darkMode ? ' dark' : ' light'}`}>
                    Drag and drop a file here or click to select.
                </div>
                <input
                    id='fileInput'
                    type='file'
                    multiple={true}
                    accept='.json,.pnml'
                    onChange={onFileInputChange}
                    style={{ display: 'none' }}
                />
            </div>
            {importError && (
                <div className={`import-dialog-error${darkMode ? ' dark' : ' light'}`}>
                    <span id='import-error-general'>
                        Error importing file{failedFiles.length > 1 ? 's' : ''}:
                    </span>
                    {failedFiles.length > 0 && (
                        <ul>
                            {failedFiles.map((fileName, index) => (
                                <li key={index}>{fileName}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className={`import-dialog-footer${darkMode ? ' dark' : ' light'}`}>
                <span
                    className={`import-dialog-close-button${darkMode ? ' dark' : ' light'}`}
                    onClick={onClose}
                >
                    Cancel
                </span>
            </div>
        </div>
    );
};

export default ImportDialog;