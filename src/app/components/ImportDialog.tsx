import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    importError: string | null;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onDrop, onFileInputChange, importError }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', bgcolor: 'background.default', color: 'primary.main' }}>
                Import File
                <Box sx={{ borderBottom: 2, borderColor: 'primary.main', mt: 1 }} />
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'background.default', color: 'primary.main' }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'primary.main' }}>
                    Please select a .json or .pnml file to import an Object-Centric Petri Net:
                </Typography>
                <Box
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('fileInput')?.click()}
                    sx={{
                        border: '2px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px', // Increased height
                        color: 'primary.main'
                    }}
                >
                    <Typography variant="body1" sx={{ mb: 2, color: 'primary.main' }}>
                        Drag and drop file here or click to select
                    </Typography>
                    <input
                        id="fileInput"
                        type="file"
                        accept=".json,.pnml"
                        onChange={onFileInputChange}
                        style={{ display: 'none' }}
                    />
                </Box>
                {importError && <Alert severity="error" sx={{ mt: 2, color: 'text.primary' }}>{importError}</Alert>}
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'background.default', color: 'primary.main' }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportDialog;