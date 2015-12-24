/**
 * MUI React button module
 * @module react/button
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import * as jqLite from '../js/lib/jqLite';
import * as util from '../js/lib/util';

let rippleIter = 0;

const PropTypes = React.PropTypes,
      btnClass = 'mui-btn',
      rippleClass = 'mui-ripple-effect',
      btnAttrs = {color: 1, variant: 1, size: 1};


/**
 * Button element
 * @class
 */
class Button extends React.Component {
  state = {
    ripples: {},
    buttonElDOMNode: null
  }

  static propTypes = {
    color: PropTypes.oneOf(['default', 'primary', 'danger', 'dark',
      'accent']),
    variant: PropTypes.oneOf(['default', 'flat', 'raised', 'fab']),
    size: PropTypes.oneOf(['default', 'small', 'large']),
    onClick: PropTypes.func,
    isDisabled: PropTypes.bool
  }

  static defaultProps = {
    color: 'default',
    variant: 'default',
    size: 'default',
    onClick: null,
    isDisabled: false
  }

  componentDidMount() {
    // cache reference to button DOM node
    this.setState({buttonElDOMNode: ReactDOM.findDOMNode(this.refs.buttonEl)});
  }

  onClick(ev) {
    let onClickFn = this.props.onClick;
    onClickFn && onClickFn(ev);
  }

  onMouseDown(ev) {
    // get (x, y) position of click
    let offset = jqLite.offset(this.state.buttonElDOMNode);

    // choose diameter
    let diameter = offset.height;
    if (this.props.variant === 'fab') diameter = diameter / 2;

    // add ripple to state
    let ripples = this.state.ripples;
    let key = Date.now();

    ripples[key] = {
      xPos: ev.pageX - offset.left,
      yPos: ev.pageY - offset.top,
      diameter: diameter,
      teardownFn: this.teardownRipple.bind(this, key)
    };

    this.setState({ ripples });
  }

  onTouchStart(ev) {
    
  }

  teardownRipple(key) {
    // delete ripple
    let ripples = this.state.ripples;
    delete ripples[key];
    this.setState({ ripples });
  }

  render() {
    let cls = btnClass,
        k,
        v;
    
    const ripples = this.state.ripples;

    // button attributes
    for (k in btnAttrs) {
      v = this.props[k];
      if (v !== 'default') cls += ' ' + btnClass + '--' + v;
    }

    return (
      <button
        ref="buttonEl"
        className={ cls }
        disabled={ this.props.isDisabled }
        onClick={ this.onClick.bind(this) }
        onMouseDown={ this.onMouseDown.bind(this) }
      >
        { this.props.children }
        { 
          Object.keys(ripples).map((k, i) => {
            let v = ripples[k];

            return (
              <Ripple
                key={ k }
                xPos={ v.xPos }
                yPos={ v.yPos }
                diameter={ v.diameter }
                onTeardown={ v.teardownFn }
              />
            );
          })
        }
      </button>
    );
  }
}


/**
 * Ripple component
 * @class
 */
class Ripple extends React.Component {
  static propTypes = {
    xPos: PropTypes.number,
    yPos: PropTypes.number,
    diameter: PropTypes.number,
    onTeardown: PropTypes.func
  }

  static defaultProps = {
    xPos: 0,
    yPos: 0,
    diameter: 0,
    onTeardown: null
  }

  componentDidMount() {
    // trigger teardown in 2 sec
    setTimeout(() => {
      let fn = this.props.onTeardown;
      fn && fn();
    }, 2000);
  }

  render() {
    let diameter = this.props.diameter,
        radius = diameter / 2;

    let style = {
      height: diameter,
      width: diameter,
      top: this.props.yPos - radius,
      left: this.props.xPos - radius
    };
    
    return <div className={ rippleClass } style={ style } />;
  }
}


/** Define module API */
export { Button };
