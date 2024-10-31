import React, { useState, ChangeEvent } from 'react';

interface FileInputProps {
  onFileParsed: (content: string | ArrayBuffer | null) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onFileParsed }) => {
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content !== undefined) {
          setFileContent(content);
          onFileParsed(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".json" onChange={handleFileChange} />
    </div>
  );
};

export default FileInput;