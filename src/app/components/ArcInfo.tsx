import React from 'react';

import './VertexInfo.css';

interface ArcInfoProps {
    darkMode: boolean;
    arcId: string;
    source: string;
    target: string;
    reversed: boolean;
    weight: number;
    path: string[];
    minLayer: number;
    maxLayer: number;
    type1: boolean;
    objectType: string;
}

const ArcInfo: React.FC<ArcInfoProps> = ({ darkMode, arcId, source, target, reversed, weight, path, minLayer, maxLayer, type1, objectType }) => {
    const mode = darkMode ? ' dark' : ' light';

    return (
        <div className={`vertex-info-container${mode}`}>
            <div className={`vertex-info`}>
                <div>ArcId: {arcId}</div>
                <div>Source: {source}</div>
                <div>Target: {target}</div>
                <div>Reversed: {reversed ? 'Yes' : 'No'}</div>
                <div>Weight: {weight}</div>
                <div>Path: {path.join(', ')}</div>
                <div>MinLayer: {minLayer}</div>
                <div>MaxLayer: {maxLayer}</div>
                <div>Type1: {type1 ? 'Yes' : 'No'}</div>
                <div>ObjectType: {objectType}</div>
            </div>
        </div>
    );
};

export default ArcInfo;