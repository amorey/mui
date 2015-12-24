/**
 * MUI test react appbar library
 * @module test/react-tests/test-appbar
 */

import assert from 'assert';
import React from 'react';
import ReactUtils from 'react-addons-test-utils';

import { Button } from '../../src/react/button.jsx';

import { getShallowRendererOutput } from '../lib/react-helpers';


describe('react/button', () => {
  it('renders properly', () => {
    let node = getShallowRendererOutput(<Button>test</Button>);
    assert.equal(node.type, 'button');
    assert.equal(node.props.className, 'mui-btn');
    assert.equal(node.props.children[0], 'test');
  });

  
  it('supports colors', () => {
    let node = getShallowRendererOutput(<Button color="primary">test</Button>);
    assert.equal(/mui-btn--primary/.test(node.props.className), true);
  });


  it('supports variants', () => {
    let node = getShallowRendererOutput(
      <Button variant="raised">
        test
      </Button>
    );
    assert.equal(/mui-btn--raised/.test(node.props.className), true);
  });


  it('supports sizes', () => {
    let node = getShallowRendererOutput(<Button size="large">test</Button>);
    assert.equal(/mui-btn--large/.test(node.props.className), true);
  });
  

  it('supports click callbacks', done => {
    // define callback
    let fn = () => {
      done();
    }

    let elem = <Button onClick={ fn }>test</Button>;
    let node = ReactUtils.renderIntoDocument(elem);

    // click on button
    ReactUtils.Simulate.click(node.refs.buttonEl);    
  });


  it('renders ripples on click', () => {
    let elem = <Button>test</Button>;
    let node = ReactUtils.renderIntoDocument(elem);

    // click on button
    //ReactUtils.Simulate.mouseDown(node.refs.buttonEl);

    //console.log(elem);
  });
});
