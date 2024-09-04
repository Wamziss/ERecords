import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Determine the active link based on the current URL
        const path = location.pathname;
        const index = ['Files', 'Shared', 'Archived', 'Mails', 'Settings', 'Home'].findIndex(item => path.startsWith(`/${item}`));
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [location.pathname]);

    const handleClick = (index, href) => {
        setActiveIndex(index);
        navigate(href); // Use navigate for client-side routing
    };

    const styles = {
        sidebar: {
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: '#000',
            color: '#f5f5f5',
            height: '100%',
            position: 'fixed',
            width: '17%'
        },
        logo: {
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 20,
            height: '5%',
        },
        navLink: {
            color: '#f5f5f5',
            fontSize: 15,
            padding: '10px 15px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '15px',
            cursor: 'pointer'
        },
        navLinkHover: {
            backgroundColor: '#6E06B3',
        },
        icon: {
            marginRight: 10,
        },
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                E-RECORDS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: "95%", justifyContent: 'space-between', paddingTop: 30 }}>
                <ul className="nav flex-column p-4">
                    {['Files', 'Shared', 'Archived', 'Mails'].map((item, index) => (
                        <li
                            className="nav-item mb-2"
                            key={index}
                        >
                            <a
                                className="nav-link"
                                style={{
                                    ...styles.navLink,
                                    ...(activeIndex === index ? styles.navLinkHover : {}),
                                }}
                                onClick={() => handleClick(index, `/${item}`)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E06B3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeIndex === index ? '#6E06B3' : 'transparent'}
                            >
                                <i className={`bi ${index === 0 ? 'bi-folder-fill' : index === 1 ? 'bi-folder-symlink-fill' : index === 2 ? 'bi-archive-fill' : 'bi-envelope-fill'}`} style={styles.icon}></i>{item}
                            </a>
                        </li>
                    ))}
                </ul>
                <ul className="nav flex-column p-3">
                    {['Settings', 'Logout'].map((item, index) => (
                        <li
                            className="nav-item mb-2"
                            key={index + 4}
                        >
                            <a
                                className="nav-link"
                                style={{
                                    ...styles.navLink,
                                    ...(activeIndex === index + 3 ? styles.navLinkHover : {}),
                                }}
                                onClick={() => handleClick(index + 4, item === 'Logout' ? '/' : `/${item}`)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E06B3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeIndex === index + 4 ? '#6E06B3' : 'transparent'}
                            >
                                <i className={`bi ${index === 0 ? 'bi-gear-fill' : 'bi-box-arrow-right'}`} style={styles.icon}></i> {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;




// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { useNavigate } from 'react-router-dom';

// function Sidebar() {
//     const [activeIndex, setActiveIndex] = useState(0);
//     // const navigate = useNavigate();

//     // Determine the active link based on the current URL
//     useEffect(() => {
//         const path = window.location.pathname;
//         const index = ['Files', 'Shared', 'Archived', 'Settings', 'Home', 'Mails'].indexOf(path.split('/')[1]);
//         if (index !== -1) {
//             setActiveIndex(index);
//         }
//     }, []);

//     const handleClick = (index, href) => {
//         setActiveIndex(index);
//         if (href) {
//             window.location.href = href;
//         }
//     };
//     // const handleClick = (index, href) => {
//     //     setActiveIndex(index);
//     //     if (href) {
//     //         navigate(href);
//     //     }
//     // };

//     const styles = {
//         sidebar: {
//             paddingTop: 20,
//             paddingBottom: 20,
//             backgroundColor: '#000',
//             color: '#f5f5f5',
//             height: '100%',
//             position: 'fixed',
//             width: '17%'
//         },
//         logo: {
//             color: 'white',
//             textAlign: 'center',
//             fontWeight: 'bold',
//             fontSize: 20,
//             height: '5%',
//         },
//         navLink: {
//             color: '#f5f5f5',
//             fontSize: 15,
//             padding: '10px 15px',
//             textDecoration: 'none',
//             display: 'flex',
//             alignItems: 'center',
//             borderRadius: '15px',
//             cursor: 'pointer'
//         },
//         navLinkHover: {
//             backgroundColor: '#6E06B3',
//         },
//         icon: {
//             marginRight: 10,
//         },
//     };

//     return (
//         <div style={styles.sidebar}>
//             <div style={styles.logo}>
//                 E-RECORDS
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', height: "95%", justifyContent: 'space-between', paddingTop: 30 }}>
//                 <ul className="nav flex-column p-4">
//                     {['Files', 'Shared', 'Archived', 'Mails'].map((item, index) => (
//                         <li
//                             className="nav-item mb-2"
//                             key={index}
//                             onClick={() => handleClick(index, `/${item}`)}
//                         >
//                             <a
//                                 className="nav-link"
//                                 style={{
//                                     ...styles.navLink,
//                                     ...(activeIndex === index ? styles.navLinkHover : {}),
//                                 }}
//                                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E06B3'}
//                                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeIndex === index ? '#6E06B3' : 'transparent'}
//                             >
//                                 <i className={`bi ${index === 0 ? 'bi-folder-fill' : index === 1 ? 'bi-folder-symlink-fill' : index === 2 ? 'bi-archive-fill' : 'bi-envelope-fill'}`} style={styles.icon}></i>{item}
//                             </a>
//                         </li>
//                     ))}
//                 </ul>
//                 <ul className="nav flex-column p-3">
//                     {['Settings', 'Logout'].map((item, index) => (
//                         <li
//                             className="nav-item mb-2"
//                             key={index + 3}
//                             onClick={() => handleClick(index + 3, item === 'Logout' ? '/' : `/${item}`)}
//                         >
//                             <a
//                                 className="nav-link"
//                                 style={{
//                                     ...styles.navLink,
//                                     ...(activeIndex === index + 3 ? styles.navLinkHover : {}),
//                                 }}
//                                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E06B3'}
//                                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeIndex === index + 3 ? '#6E06B3' : 'transparent'}
//                             >
//                                 <i className={`bi ${index === 0 ? 'bi-gear-fill' : 'bi-box-arrow-right'}`} style={styles.icon}></i> {item}
//                             </a>
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//     );
// }

// export default Sidebar;



