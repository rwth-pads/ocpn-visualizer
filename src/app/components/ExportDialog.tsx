import React, { useEffect } from 'react';

import './ExportDialog.css';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';

interface ExportDialogProps {
    darkMode: boolean;
    exportDialogOpen: boolean;
    setExportDialogOpen: (open: boolean) => void;
    exportPossible: boolean;
    ocpn: ObjectCentricPetriNet | null;
    svgRef: React.RefObject<SVGSVGElement>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ darkMode, exportDialogOpen, setExportDialogOpen, exportPossible, ocpn, svgRef }) => {
    const exportDialogRef = React.useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (exportDialogRef.current && !exportDialogRef.current.contains(event.target as Node)) {
            setExportDialogOpen(false);
        }
    }

    useEffect(() => {
        if (exportDialogOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [exportDialogOpen]);

    const exportAsPng = () => {
        console.log('Exporting as .png');
        // Export the SVG element as a PNG file.
        // TODO: Implement this functionality.
    }

    const exportAsSvg = () => {
        console.log('Exporting as .svg');
        // Export the SVG element as an SVG file.
        const svgElement = svgRef.current;
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ocpnName = ocpn ? ocpn.name : 'ocpn';
            a.download = `${ocpnName}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    return (
        <div
            ref={exportDialogRef}
            className={`export-dialog-container${darkMode ? ' dark' : ' light'}${exportDialogOpen ? ' show' : ''}`}>
            {exportPossible ? (
                <>
                    <div className={`export-dialog-header${darkMode ? ' dark' : ' light'}`}>
                        Export OCPN
                    </div>
                    <hr />
                    <div className={`export-dialog-content-text${darkMode ? ' dark' : ' light'}`}>
                        Choose the format you want to export the Object-Centric Petri Net as:
                    </div>
                    <div className={`export-dialog-content${darkMode ? ' dark' : ' light'}`}>
                        <div
                            onClick={exportAsPng}
                            className={`export-dialog-content-item${darkMode ? ' dark' : ' light'}`}>
                            Export as .png
                        </div>
                        <div
                            onClick={exportAsSvg}
                            className={`export-dialog-content-item${darkMode ? ' dark' : ' light'}`}>
                            Export as .svg
                        </div>
                    </div>
                    <div className={`export-dialog-content-text${darkMode ? ' dark' : ' light'}`}>
                        Note: The export will contain the currently visible part of the Object-Centric Petri Net.<br />
                        To adjust the view, zoom in or out and pan the view accordingly.
                    </div>
                    <hr />
                    <div className={`export-dialog-footer${darkMode ? ' dark' : ' light'}`}>
                        <span
                            className={`export-dialog-close-button${darkMode ? ' dark' : ' light'}`}
                            onClick={() => setExportDialogOpen(false)}>
                            Cancel
                        </span>
                    </div>
                </>
            ) : (
                <div className={`export-dialog-not-possible-container${darkMode ? ' dark' : ' light'}`}>
                    Please import an Object-Centric Petri Net first
                </div>
            )}
        </div>
    );
}

export default ExportDialog;