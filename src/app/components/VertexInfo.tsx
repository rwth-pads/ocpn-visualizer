import React from 'react';
import OCPNConfig from '../utils/classes/OCPNConfig';

import './VertexInfo.css';

interface VertexInfoProps {
    userConfig: OCPNConfig;
    vertexId: string;
    vertexName: string;
    vertexType: string;
    objectType: string | null;
    darkMode: boolean;
    isSource: boolean;
    isSink: boolean;
    toggleSource: (vertexId: string) => void;
    toggleSink: (vertexId: string) => void;
}

const VertexInfo: React.FC<VertexInfoProps> = ({ userConfig, vertexId, vertexName, vertexType, objectType, darkMode, isSource, isSink, toggleSource, toggleSink }) => {
    const mode = darkMode ? ' dark' : ' light';
    const sourceButtonLabel = isSource ? 'Source' : 'No source';
    const sinkButtonLabel = isSink ? 'Sink' : 'No sink';

    return (
        <div className={`vertex-info-container${mode}`}>
            <div className={`vertex-info`}>
                Name: {vertexName}<br />
                Id: {vertexId}
                {vertexType === 'place' && (
                    <>
                        <br />
                        <p>Object type: {objectType}</p>
                    </>
                )}
            </div>
            <div className={`vertex-actions`}>
                <button
                    className={`vertex-action-button${mode}`}
                    onClick={() => toggleSource(vertexId)}
                >
                    {sourceButtonLabel}
                </button>
                <button
                    className={`vertex-action-button${mode}`}
                    onClick={() => toggleSink(vertexId)}
                >
                    {sinkButtonLabel}
                </button>
            </div>
        </div>
    );
};

export default VertexInfo;