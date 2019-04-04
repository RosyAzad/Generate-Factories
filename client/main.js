import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
 
import Tree from '../imports/ui/Tree.js';
 
Meteor.startup(() => {
  render(<Tree />, document.getElementById('render-target'));
});