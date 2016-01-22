/**
 * MUI React dropdowns module
 * @module react/dropdowns
 */
/* jshint quotmark:false */
// jscs:disable validateQuoteMarks

'use strict';

import React from 'react';

import * as util from '../js/lib/util';


const PropTypes = React.PropTypes;


/**
 * DropdownItem constructor
 * @class
 */
class DropdownItem extends React.Component {
  constructor(props) {
    super(props);

    this.onClickCB = util.callback(this, 'onClick');
  }

  static propTypes =  {
    link: PropTypes.string,
    onClick: PropTypes.func
  };

  static defaultProps = {
    link: null,
    onClick: null
  };

  onClick(ev) {
    if (this.props.onClick) this.props.onClick(this, ev);
  }

  render() {
    return (
      <li>
        <a href={this.props.link} onClick={this.onClickCB}>
          {this.props.children}
        </a>
      </li>
    );
  }
}


/** Define module API */
export default DropdownItem;
