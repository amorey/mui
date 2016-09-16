/**
 * MUI CSS/JS select module
 * @module forms/select
 */

'use strict';


var jqLite = require('./lib/jqLite'),
    util = require('./lib/util'),
    formlib = require('./lib/forms'),
    wrapperClass = 'mui-select',
    cssSelector = '.mui-select > select',
    menuClass = 'mui-select__menu',
    selectedClass = 'mui--is-selected',
    disabledClass = 'mui--is-disabled',
    doc = document,
    win = window;


/**
 * Initialize select element.
 * @param {Element} selectEl - The select element.
 */
function initialize(selectEl) {
  // check flag
  if (selectEl._muiSelect === true) return;
  else selectEl._muiSelect = true;

  // use default behavior on touch devices
  if ('ontouchstart' in doc.documentElement) return;

  // initialize element
  new Select(selectEl);
}


/**
 * Creates a new Select object
 * @class
 */
function Select(selectEl) {
  // instance variables
  this.selectEl = selectEl;
  this.wrapperEl = selectEl.parentNode;
  this.useDefault = false;  // currently unused but let's keep just in case

  // attach event handlers
  jqLite.on(selectEl, 'mousedown', util.callback(this, 'mousedownHandler'));
  jqLite.on(selectEl, 'focus', util.callback(this, 'focusHandler'));
  jqLite.on(selectEl, 'click', util.callback(this, 'clickHandler'));
  
  // make wrapper focusable and fix firefox bug
  this.wrapperEl.tabIndex = -1;
  var callbackFn = util.callback(this, 'wrapperFocusHandler');
  jqLite.on(this.wrapperEl, 'focus', callbackFn);
}


/**
 * Disable default dropdown on mousedown.
 * @param {Event} ev - The DOM event
 */
Select.prototype.mousedownHandler = function(ev) {
  if (ev.button !== 0 || this.useDefault === true) return;
  ev.preventDefault();
}


/**
 * Handle focus event on select element.
 * @param {Event} ev - The DOM event
 */
Select.prototype.focusHandler = function(ev) {
  // check flag
  if (this.useDefault === true) return;

  var selectEl = this.selectEl,
      wrapperEl = this.wrapperEl,
      tabIndex = selectEl.tabIndex,
      keydownFn = util.callback(this, 'keydownHandler');

  // attach keydown handler
  jqLite.on(doc, 'keydown', keydownFn);

  // disable tabfocus once
  selectEl.tabIndex = -1;
  jqLite.one(wrapperEl, 'blur', function() {
    selectEl.tabIndex = tabIndex;
    jqLite.off(doc, 'keydown', keydownFn);
  });
  
  // defer focus to parent
  wrapperEl.focus();
}


/**
 * Handle keydown events on doc
 **/
Select.prototype.keydownHandler = function(ev) {
  var keyCode = ev.keyCode;

  // spacebar, down, up
  if (keyCode === 32 || keyCode === 38 || keyCode === 40) {
    // prevent win scroll
    ev.preventDefault();
    
    if (this.selectEl.disabled !== true) this.renderMenu();
  }
}


/**
 * Handle focus event on wrapper element.
 */
Select.prototype.wrapperFocusHandler = function() {
  // firefox bugfix
  if (this.selectEl.disabled) return this.wrapperEl.blur();
}


/**
 * Handle click events on select element.
 * @param {Event} ev - The DOM event
 */
Select.prototype.clickHandler = function(ev) {
  // only left clicks
  if (ev.button !== 0) return;
  this.renderMenu();
}


/**
 * Render options dropdown.
 */
Select.prototype.renderMenu = function() {
  // check and reset flag
  if (this.useDefault === true) return this.useDefault = false;

  new Menu(this.wrapperEl, this.selectEl);
}


/**
 * Creates a new Menu
 * @class
 */
function Menu(wrapperEl, selectEl) {
  // add scroll lock
  util.enableScrollLock();

  // instance variables
  this.indexMap = {};
  this.origIndex = null;
  this.currentIndex = null;
  this.selectEl = selectEl;
  this.menuEl = this._createMenuEl(wrapperEl, selectEl);
  this.clickCallbackFn = util.callback(this, 'clickHandler');
  this.keydownCallbackFn = util.callback(this, 'keydownHandler');
  this.destroyCallbackFn = util.callback(this, 'destroy');

  // add to DOM
  wrapperEl.appendChild(this.menuEl);
  jqLite.scrollTop(this.menuEl, this.menuEl._muiScrollTop);

  // blur active element
  setTimeout(function() {
    // ie10 bugfix
    if (doc.activeElement.nodeName.toLowerCase() !== "body") {
      doc.activeElement.blur();
    }
  }, 0);

  // attach event handlers
  jqLite.on(this.menuEl, 'click', this.clickCallbackFn);
  jqLite.on(doc, 'keydown', this.keydownCallbackFn);
  jqLite.on(win, 'resize', this.destroyCallbackFn);

  // attach event handler after current event loop exits
  var fn = this.destroyCallbackFn;
  setTimeout(function() {jqLite.on(doc, 'click', fn);}, 0);
}


/**
 * Create menu element
 * @param {Element} selectEl - The select element
 */
Menu.prototype._createMenuEl = function(wrapperEl, selectEl) {
  var menuEl = doc.createElement('div'),
      childEls = selectEl.children,
      indexNum = 0,
      indexMap = this.indexMap,
      selectedRow = 0,
      loopEl,
      rowEl,
      optionEls,
      inGroup,
      i,
      iMax,
      j,
      jMax;

  menuEl.className = menuClass;

  for (i=0, iMax=childEls.length; i < iMax; i++) {
    loopEl = childEls[i];

    if (loopEl.tagName === 'OPTGROUP') {
      // add row item to menu
      rowEl = doc.createElement('div');
      rowEl.textContent = loopEl.label;
      rowEl.className = 'mui-optgroup__label';
      menuEl.appendChild(rowEl);

      inGroup = true;
      optionEls = loopEl.children;
    } else {
      inGroup = false;
      optionEls = [loopEl];
    }

    // loop through option elements
    for (j=0, jMax=optionEls.length; j < jMax; j++) {
      loopEl = optionEls[j];

      // add row item to menu
      rowEl = doc.createElement('div');
      rowEl.textContent = loopEl.textContent;

      // handle optgroup options
      if (inGroup) jqLite.addClass(rowEl, 'mui-optgroup__option');

      if (loopEl.disabled) {
        // do not attach muiIndex to disable <option> elements to make them
        // unselectable.
        rowEl.className = disabledClass;
      } else {
        rowEl._muiIndex = indexNum;

        // handle selected options
        if (loopEl.selected) {
          rowEl.className = selectedClass;
          selectedRow = menuEl.children.length;
        }
      }

      // add to index map
      indexMap[indexNum] = rowEl;
      indexNum += 1;

      menuEl.appendChild(rowEl);
    }
  }

  // save indices
  var selectedIndex = selectEl.selectedIndex;

  this.origIndex = selectedIndex;
  this.currentIndex = selectedIndex;

  // set position
  var props = formlib.getMenuPositionalCSS(
    wrapperEl,
    menuEl.children.length,
    selectedRow
  );

  jqLite.css(menuEl, props);
  menuEl._muiScrollTop = props.scrollTop;

  return menuEl;
}


/**
 * Handle keydown events on doc element.
 * @param {Event} ev - The DOM event
 */
Menu.prototype.keydownHandler = function(ev) {
  var keyCode = ev.keyCode;

  // tab
  if (keyCode === 9) return this.destroy();
  
  // escape | up | down | enter
  if (keyCode === 27 || keyCode === 40 || keyCode === 38 || keyCode === 13) {
    ev.preventDefault();
  }

  if (keyCode === 27) {
    this.destroy();
  } else if (keyCode === 40) {
    this.increment();
  } else if (keyCode === 38) {
    this.decrement();
  } else if (keyCode === 13) {
    this.selectCurrent();
    this.destroy();
  }
}


/**
 * Handle click events on menu element.
 * @param {Event} ev - The DOM event
 */
Menu.prototype.clickHandler = function(ev) {
  // don't allow events to bubble
  ev.stopPropagation();

  var index = ev.target._muiIndex;

  // ignore clicks on non-items                                               
  if (index === undefined) return;

  // select option
  this.currentIndex = index;
  this.selectCurrent();

  // destroy menu
  this.destroy();
}


/**
 * Increment selected item
 */
Menu.prototype.increment = function() {
  for (var nextIndex = this.currentIndex + 1; nextIndex < this.selectEl.length; nextIndex++) {
    if (this.indexMap[nextIndex]._muiIndex !== undefined) {
      // un-select old row
      jqLite.removeClass(this.indexMap[this.currentIndex], selectedClass);

      // select new row
      this.currentIndex = nextIndex;
      jqLite.addClass(this.indexMap[this.currentIndex], selectedClass);

      break;
    }
  }
}


/**
 * Decrement selected item
 */
Menu.prototype.decrement = function() {
  for (var prevIndex = this.currentIndex - 1; prevIndex >= 0; prevIndex--) {
    if (this.indexMap[prevIndex]._muiIndex !== undefined) {
      // un-select old row
      jqLite.removeClass(this.indexMap[this.currentIndex], selectedClass);

      // select new row
      this.currentIndex = prevIndex;
      jqLite.addClass(this.indexMap[this.currentIndex], selectedClass);

      break;
    }
  }
}


/**
 * Select current item
 */
Menu.prototype.selectCurrent = function() {
  if (this.currentIndex !== this.origIndex) {
    this.selectEl.selectedIndex = this.currentIndex;

    // trigger change event
    util.dispatchEvent(this.selectEl, 'change');
  }
}


/**
 * Destroy menu and detach event handlers
 */
Menu.prototype.destroy = function() {
  // remove element and focus element
  var parentNode = this.menuEl.parentNode;
  if (parentNode) parentNode.removeChild(this.menuEl);

  this.selectEl.focus();

  // remove scroll lock
  util.disableScrollLock(true);

  // remove event handlers
  jqLite.off(this.menuEl, 'click', this.clickCallbackFn);
  jqLite.off(doc, 'keydown', this.keydownCallbackFn);
  jqLite.off(doc, 'click', this.destroyCallbackFn);
  jqLite.off(win, 'resize', this.destroyCallbackFn);
}


/** Define module API */
module.exports = {
  /** Initialize module listeners */
  initListeners: function() {
    // markup elements available when method is called
    var elList = doc.querySelectorAll(cssSelector);
    for (var i=elList.length - 1; i >= 0; i--) initialize(elList[i]);

    // listen for new elements
    util.onNodeInserted(function(el) {
      if (el.tagName === 'SELECT' &&
          jqLite.hasClass(el.parentNode, wrapperClass)) {
        initialize(el);
      }
    });
  }
};
