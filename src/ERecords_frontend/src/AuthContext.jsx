// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authClient, setAuthClient] = useState(null);

    useEffect(() => {
        const initializeAuthClient = async () => {
            try {
                const client = await AuthClient.create();
                setAuthClient(client);
            } catch (error) {
                console.error("AuthClient creation failed:", error);
            }
        };

        initializeAuthClient();
    }, []);

    return (
        <AuthContext.Provider value={authClient}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
