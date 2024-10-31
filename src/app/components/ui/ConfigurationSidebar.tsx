import React, { useState } from 'react';
import ConfigContainer from './ConfigContainer';
import { useTheme } from '../../context/ThemeContext';
import { IoMdMenu, IoIosColorPalette } from "react-icons/io";
import { PiGraph } from 'react-icons/pi';
import { FaRegQuestionCircle } from "react-icons/fa";
import './ConfigurationSidebar.css';

const ConfigurationSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openConfigId, setOpenConfigId] = useState<string | null>(null);
  const { mode } = useTheme();

  const toggleSidebar = () => {
    setOpenConfigId(null);
    setIsOpen(!isOpen);
  };

  const handleConfigClick = (id: string, isMenu: boolean) => {
    if (isMenu) {
      toggleSidebar();
    } else {
      if (!isOpen) {
        // If the sidebar is closed, open the sidebar first.
        setIsOpen(true);
      }
      // If already open, close the config, otherwise open it.
      setOpenConfigId(openConfigId === id ? null : id);
    }
  }

  const configItems = [
    {
      id: 'menu',
      name: "Configuration Menu",
      svg: <IoMdMenu style={{ width: '100%', height: '100%' }} />,
      isMenu: true,
      children: null,
      onClick: () => handleConfigClick('menu', true)
    },
    {
      id: 'style',
      name: "Style Options",
      svg: <IoIosColorPalette style={{ width: '100%', height: '100%' }} />,
      isMenu: false,
      children: <p>Style options content...</p>,
      onClick: () => handleConfigClick('style', false)
    },
    {
      id: 'layout',
      name: "Layout Options",
      svg: <PiGraph style={{ width: '100%', height: '100%' }} />,
      isMenu: false,
      children: <p>Layout options content...</p>,
      onClick: () => handleConfigClick('layout', false)
    },
    {
      id: 'help',
      name: "Explanation",
      svg: <FaRegQuestionCircle style={{ width: '90%', height: '90%' }} />,
      isMenu: false,
      children: null,
      onClick: null
    }
    // Add more config items here
  ];

  return (
    <div className='configuration-container'>
      <div className={`configuration-bar ${isOpen ? 'open' : 'closed'} ${openConfigId ? 'has-expanded-item' : ''}`}>
        {configItems.map((item) => (
          <ConfigContainer
            key={item.id}
            name={item.name}
            svg={item.svg}
            isOpen={openConfigId === item.id}
            onClick={item.onClick || undefined}
          >
            {item.children}
          </ConfigContainer>
        ))}
      </div>
    </div>
  );
};

export default ConfigurationSidebar;