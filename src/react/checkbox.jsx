/**
 * MUI React checkbox module
 * @module react/checkbox
 */

'use strict';

import React from 'react';


const PropTypes = React.PropTypes;


/**
 * Checkbox constructor
 * @class
 */
class Checkbox extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    isDisabled: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    label: null,
    value: null,
    isDisabled: false
  };

  render() {
    return (
      <div
        className={'mui-checkbox ' + this.props.className}
        style={this.props.style}
      >
        <label>
          <input
              type="checkbox"
              value={this.props.value}
              disabled={this.props.isDisabled}
          />
          {this.props.label}
        </label>
      </div>
    );
  }
}


/** Define module API */
export default Checkbox;
