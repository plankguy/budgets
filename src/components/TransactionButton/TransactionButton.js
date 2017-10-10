import React from 'react';
import PropTypes from 'prop-types';

import styles from './TransactionButton.scss';

const PROP_TYPES = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const DEFAULT_PROPS = {
  label: '',
  type: '',
};

// const buttonClass =

const TransactionButton = ({ label, type }) => (
  <button className={type === 'outgoing' ? styles.outgoingButton : styles.incomingButton}>
    {label}
  </button>
);

TransactionButton.propTypes = PROP_TYPES;
TransactionButton.defaultProps = DEFAULT_PROPS;

export default TransactionButton;
