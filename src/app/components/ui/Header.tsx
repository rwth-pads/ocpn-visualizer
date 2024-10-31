import React from 'react';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

const Header: React.FC = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <header className="header">
      <h3>OCPN Visualizer</h3>
      <div className='button-container'>
        <ImportButton onFileParsed={(file: any) => console.log(file)} />
        <ExportButton />
      </div>
      <div className='icon-theme-toggle' onClick={toggleMode}>
        <img src={mode === 'dark' ? '/icons/moon.svg' : '/icons/sun.svg'} alt={mode === 'dark' ? 'Dark Mode' : 'Light Mode'} />
      </div>
    </header>
  );
};

export default Header;