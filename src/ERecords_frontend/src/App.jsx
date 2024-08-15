import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';
import Layout from './components/Layout';
function App() {

  const path = window.location.pathname;

  const renderPage = () => {
    switch (path) {
      case '/Layout':
        return <Layout />;    
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
