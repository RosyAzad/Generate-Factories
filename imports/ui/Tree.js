import React, { Component } from 'react';
import PropTypes from 'prop-types';
import values from 'lodash/values';
import FactoryNode from './FactoryNode';
import { withTracker } from 'meteor/react-meteor-data';
import { Factories } from '../api/factories.js';

//Tree Component for rendering root node and Factory nodes
export class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: {},
    }
  }

  componentDidMount() {
    this.setState = ({
      nodes: this.props.factories
    });
    const result = (this.props.factories).filter(node => node.isRoot);
    if (result.length == 0)
      Meteor.call('factories.insertRoot');
  }

  //check if root node exists, then return it
  getRootNode = () => {
    this.setState = ({
      nodes: this.props.factories
    })
    const result = values(this.props.factories).filter(node => node.isRoot);
    return result[0];
  }

  //get the child nodes of factories
  getFactories = (node) => {
    this.setState = ({
      nodes: this.props.factories
    })
    const nodes = this.setState.nodes;
    if (!node.children) return [];
    var result = [];
    node.children.forEach((child, index) => {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].path == child) {
          result.push(nodes[i]);
        }
      }
    });
    return result;
  }

  render() {
    const rootNode = this.getRootNode();
    return (
      <React.Fragment>
        {
          (rootNode != undefined ?
          <div>
            <FactoryNode
              node={rootNode}
              getFactories={this.getFactories}
            />
          </div> : "")
        }
      </React.Fragment>
    )
  }
}

// subscribe to Factories publication when Tree Component is created 
export default withTracker(() => {
  Meteor.subscribe('factories');
  return {
    factories: Factories.find({}).fetch(),
  };
})(Tree);

