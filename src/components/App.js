import React, { Component } from 'react';
import moment from 'moment';

import TransactionButton from './TransactionButton/TransactionButton';

import styles from './App.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.total}>
          $578.90
        </div>
        <div className={styles.time}>
          {moment().format('MMMM Do YYYY, h:mm:ss a')}
        </div>
        <nav className={styles.transactionTools}>
          <span className={styles.tool}>
            <TransactionButton
              label="&ndash;"
              type="outgoing" />
          </span>
          <span className={styles.tool}>
            <TransactionButton
              label="+"
              type="incoming" />
          </span>
        </nav>
      </div>
    );
  }
}

export default App;
