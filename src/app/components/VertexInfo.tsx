import React from 'react';

import './VertexInfo.css';

interface VertexInfoProps {
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

const VertexInfo: React.FC<VertexInfoProps> = ({ vertexId, vertexName, vertexType, objectType, darkMode, isSource, isSink, toggleSource, toggleSink }) => {
    const mode = darkMode ? ' dark' : ' light';
    const sourceButtonLabel = isSource ? 'First' : 'Not in firsts';
    const sinkButtonLabel = isSink ? 'Last' : 'Not in lasts';

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