import React from 'react';
import Sidebar from '../Sidebar';

function Settings() {
    const styles = {
        mainContainer: {
            display: 'flex',
            fontFamily: 'verdana',
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100vh',
            overflowY: 'scroll',
        },
        contentArea: {
            padding: '20px',
            width: '100%',
        },
        section: {
            marginBottom: '20px',
        },
        sectionTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        option: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #ddd',
        },
        label: {
            fontSize: '16px',
        },
        switch: {
            cursor: 'pointer',
        }
    };

    return (
        <div style={styles.mainContainer} className='row'>
            <Sidebar />
            <div className='main-contentarea' style={styles.contentArea}>
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Appearance</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Dark Theme</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Security</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Enable Two-Factor Authentication</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div style={styles.option}>
                        <span style={styles.label}>Auto-lock after inactivity</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Notifications</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Email Notifications</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div style={styles.option}>
                        <span style={styles.label}>Push Notifications</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Privacy</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Hide Activity Status</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;


