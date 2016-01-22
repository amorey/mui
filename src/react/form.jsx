/**
 * MUI React form module
 * @module react/form
 */

'use strict';

import React from 'react';


/**
 * Form constructor
 * @class
 */
class Form extends React.Component {
  static propTypes = {
    isInline: React.PropTypes.bool
  };

  static defaultProps = {
    className: '',
    isInline: false
  };

  render() {
    let cls = '';

    // inline form
    if (this.props.isInline) cls = 'mui-form--inline';

    return (
      <form
        className={cls + ' ' + this.props.className }
        style={this.props.style}
      >
        {this.props.children}
      </form>
    );
  }
}


/** Define module API */
export default Form;
