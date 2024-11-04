"use client";

import React, { useState } from 'react';
import Header from './components/ui/Header';
import ConfigurationBar from './components/ui/ConfigurationSidebar';
import VisualizationArea from './components/ui/VisualizationArea';
import { ThemeProvider } from './context/ThemeContext';
// import { preprocess, breakCycles, assignLayers, orderVertices, positionVertices, routeEdges } from './utils/sugiyama';

const Home = () => {
  return (
    <ThemeProvider>
      <div>
        <Header />
      </div>
      <div style={{ display: 'flex'}}>
        <ConfigurationBar />
        <VisualizationArea />
      </div>
    </ThemeProvider>
  );
};

export default Home;