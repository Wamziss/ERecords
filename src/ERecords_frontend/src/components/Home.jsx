import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import security from '../assets/security.png';
import speed from '../assets/speed.png'
import transparency from '../assets/transparency.png'
import blockchain from '../assets/blockchain.jpg'
import share from '../assets/share.jpg'
import access from '../assets/access.jpg'
import { AuthClient } from '@dfinity/auth-client';

function Home() {

    const handleSignIn = async (event) => {
        event.preventDefault();
        try {
          const authClient = await AuthClient.create();
          await authClient.login({
            identityProvider: process.env.II_URL,
            onSuccess: () => {
              console.log("Logged in!");
              window.location.href = "/Layout"; // Change the URL to navigate to the "/UserManagement" page
            },
          }).catch((error) => {
            console.error("Login failed:", error);
          });
        } catch (error) {
          console.error("AuthClient creation failed:", error);
        }
      };

    return (
        <div className="landing-page">
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <a className="navbar-brand" href="#">E-RECORDS</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Features</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link btn text-white" style={{backgroundColor: '#6e06b3'}} onClick={(event) => handleSignIn(event)}>Get Started</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <header className="hero-section text-center d-flex align-items-center justify-content-center">
                <div className="container" style={{padding: 20, width: '80%' }}>
                    <h1 className="display-4">Secure & Decentralized Records Management</h1>
                    <p className="lead">Manage and store your records securely on the blockchain with E-Records.</p>
                    {/* <p>Share your documents with confidence, knowing they're tamper-proof.</p>
                    <p>Access your files anytime, anywhere, with our decentralized storage solution.</p> */}
                    <a href="#" className="action-btn btn btn-lg mt-4" style={{}}>Get Started</a>
                </div>
            </header>

            <section className="features-section py-5">
                <div className="container text-center">
                    <h2>Why Choose E-Records?</h2>
                    <p className="lead mb-5">We offer the most secure and transparent records management on the blockchain.</p>
                    <div className="row justify-content-evenly">
                        <div className="col-md-3 feature-card">
                            <img src={security} alt="Feature 1" className="img-fluid mb-3" />
                            <h4>Security</h4>
                            <p>Your records are encrypted and stored securely on the blockchain.</p>
                        </div>
                        <div className="col-md-3 feature-card">
                            <img src={speed} alt="Feature 2" className="img-fluid mb-3" />
                            <h4>Speed</h4>
                            <p>Access your records instantly from anywhere in the world.</p>
                        </div>
                        <div className="col-md-3 feature-card">
                            <img src={transparency} alt="Feature 3" className="img-fluid mb-3" />
                            <h4>Transparency</h4>
                            <p>Every transaction is recorded and viewable on the blockchain.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-section py-5 bg-light">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <img src="placeholder_about.png" alt="About Us" className="img-fluid" />
                        </div>
                        <div className="col-md-6">
                            <h2>About E-Records</h2>
                            <p>E-Records is at the forefront of decentralized record management, providing unparalleled security, speed, and transparency. Our blockchain-based platform ensures that your data remains safe and accessible, no matter where you are.</p>
                            <a href="#" className="btn btn-primary mt-3">Learn More</a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section py-5 text-white">
                <div className="container text-center">
                    <h2>Ready to Secure Your Records?</h2>
                    <p style={{color: '#333'}}>Join the many users who trust E-Records for their record management needs.</p>
                    <a href="#" className="btn btn-lg mt-3 action-btn">Get Started Now → </a>
                </div>
            </section>

            <footer className="footer text-white py-4 text-center">
                
                    <p>&copy; 2024 E-Records. All rights reserved.</p>
                
            </footer>
        </div>
    );
}

export default Home;
