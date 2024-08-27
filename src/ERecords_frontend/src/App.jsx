import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';
import Fileupload from './components/pages/Fileupload';
import FileContent from './components/subcomponents/FileContent';
import Shared from './components/pages/Shared';
import Archived from './components/pages/Archived';
import Settings from './components/pages/Settings';

function App() {

  const path = window.location.pathname;

  const renderPage = () => {
    switch (path) { 
        case '/':
          return <Home />;    
        case '/Files':
          return <Fileupload />;    
        case '/Files/Filecontent':
          return <FileContent />  ;
        case '/Shared':
          return <Shared/>;   
        case '/Archived':
          return <Archived />;  
        case '/Settings':
          return <Settings />;  
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
