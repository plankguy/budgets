import React from 'react';
import PropTypes from 'prop-types';

import styles from './OutgoingButton.scss';

const PROP_TYPES = {
  label: PropTypes.string.isRequired,
};

const DEFAULT_PROPS = {
  label: '',
};

const OutgoingButton = ({ label }) => (
  <button className={styles.OutgoingButton}>
    {label}
  </button>
);

OutgoingButton.propTypes = PROP_TYPES;
OutgoingButton.defaultProps = DEFAULT_PROPS;

export default OutgoingButton;
