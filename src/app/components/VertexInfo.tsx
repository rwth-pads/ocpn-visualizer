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
}

const VertexInfo: React.FC<VertexInfoProps> = ({ vertexId, vertexName, vertexType, objectType, darkMode, isSource, isSink }) => {
    const mode = darkMode ? ' dark' : ' light';
    const sourceButtonLabel = isSource ? 'Remove from sources' : 'Add to sources';
    const sinkButtonLabel = isSink ? 'Remove from sinks' : 'Add to sinks';

    return (
        <div className={`vertex-info-container${mode}`}>
            <div className={`vertex-info`}>
                Name: {vertexName}
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
                    onClick={() => { console.log(`Toggle source ${vertexId}`) }}
                >
                    {sourceButtonLabel}
                </button>
                <button
                    className={`vertex-action-button${mode}`}
                    onClick={() => { console.log(`Toggle sink ${vertexId}`) }}
                >
                    {sinkButtonLabel}
                </button>
            </div>
        </div>
    );
};

export default VertexInfo;