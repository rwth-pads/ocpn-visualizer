import React, { useEffect } from 'react';
import ObjectCentricPetriNet from '../utils/classes/ObjectCentricPetriNet';
import OCPNConfig from '../utils/classes/OCPNConfig';
import './ExportDialog.css';

interface ExportDialogProps {
    darkMode: boolean;
    exportDialogOpen: boolean;
    setExportDialogOpen: (open: boolean) => void;
    exportPossible: boolean;
    ocpn: ObjectCentricPetriNet | null;
    userConfig: OCPNConfig;
    svgRef: React.RefObject<SVGSVGElement>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ darkMode, exportDialogOpen, setExportDialogOpen, exportPossible, ocpn, userConfig, svgRef }) => {
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
        // console.log('Exporting as .png');
        const svgElement = svgRef.current;
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = svgElement.clientWidth || 1000;
                canvas.height = svgElement.clientHeight || 1000;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Draw the SVG onto the canvas.
                    ctx.fillStyle = userConfig.svgBackgroundColor ? userConfig.svgBackgroundColor : 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    // Convert the canvas content to a PNG Blob.
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const a = document.createElement('a');
                            const ocpnName = ocpn ? ocpn.name : 'ocpn';
                            const fileName = `${ocpnName}.png`;
                            a.href = URL.createObjectURL(blob);
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }
                    }, 'image/png');
                }
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
        // setExportDialogOpen(false);
    };

    const exportAsSvg = () => {
        // console.log('Exporting as .svg');
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
        // setExportDialogOpen(false);
    }

    return (
        <div
            ref={exportDialogRef}
            className={`export-dialog-container${darkMode ? ' dark' : ' light'}${exportDialogOpen ? ' show' : ''}${exportPossible ? '' : ' not-possible'}`}>
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