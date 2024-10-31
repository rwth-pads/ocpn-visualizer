import React, { useState } from 'react';
import Modal from './ImportModal';
import './Button.css';

interface ImportButtonProps {
  onFileParsed: (file: File) => void;
}

const ImportButton: React.FC<ImportButtonProps> = ({ onFileParsed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);  

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button className='import-button' onClick={handleButtonClick}>Import</button>
      {isModalOpen && <Modal onClose={handleCloseModal} onFileParsed={onFileParsed} />}
    </div>
  );
};

export default ImportButton;
