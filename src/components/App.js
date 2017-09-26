import React, { Component } from 'react';

import styles from './App.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.total}>
          $578.90
        </div>
      </div>
    );
  }
}

export default App;
