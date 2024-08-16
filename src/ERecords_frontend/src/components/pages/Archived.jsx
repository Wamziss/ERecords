import React from 'react'
import Sidebar from '../Sidebar'

function Archived() {
    const styles ={
        mainContainer: {
          display: 'flex',
          fontFamily: 'verdana',
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100vh',
          overflowY: 'scroll',
        }
        }
  return (
    <div style={styles.mainContainer} className='row'>
        <Sidebar/>
        <div className='main-contentarea'>
            Hiiiii
        </div>
    </div>
  )
}

export default Archived