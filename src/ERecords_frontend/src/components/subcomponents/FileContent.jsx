import React, { useEffect, useState } from 'react';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';

const FileContent = () => {
    const [fileContent, setFileContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFileContent = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            console.log('Token:', token); // Log token value

            if (token) {
                try {
                    const content = await ERecords_backend.getContentByToken(token);
                    console.log('Fetched content:', content); // Log fetched content
                    if (content) {
                        setFileContent(content);
                    } else {
                        setError('Content not found or invalid token.');
                    }
                } catch (error) {
                    console.error("Failed to fetch file content:", error);
                    setError('An error occurred while fetching the content.');
                }
            } else {
                setError('No token provided.');
            }
        };

        fetchFileContent();
    }, []);

    return (
        <div>
            <h1>File Content</h1>
            {error ? <p>{error}</p> : <pre style={{padding: '30px', display: 'flex', flexWrap: 'wrap'}}>{fileContent}</pre>}
        </div>
    );
};

export default FileContent;

