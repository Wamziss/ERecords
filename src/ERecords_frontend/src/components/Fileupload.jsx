import React, { useState } from 'react';

function Fileupload() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  return (
    <div>
        <button type="button" class="btn-close" aria-label="Close"></button>
      <h3>File Upload</h3>
      <input type="file" multiple onChange={handleFileChange} />
      
      <h4>My Files:</h4>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Fileupload;
