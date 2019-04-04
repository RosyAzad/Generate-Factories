import React from 'react';
import styled from 'styled-components';
import last from 'lodash/last';
import PropTypes from 'prop-types';
import CustomMenu from './CustomMenu';

const getFactoryLabel = (node) => last(node.path.split('/'));

//styled component for rendering factories
const FactoryStyle = styled.div`
  background: ${props => props.isRoot === true ? '#add8e6' : props.type === 'factory' ? "#C6E2FF" :"" };
  border-left: ${props => (props.level > 1 ? 2 : 0)}px solid rgba(128, 4, 77, 0.3); 
  border-top: ${props => (props.level > 1 ? 2 : 0)}px solid rgba(128, 4, 77, 0.3); 
  border-bottom: ${props => (props.level > 1 ? 2 : 0)}px solid rgba(128, 4, 77, 0.3); 
  margin-left: ${props => getPaddingLeft(props.level, props.type)}px;
  display: flex;
  flex-direction: row;
  padding: 6px 9px; 
  &:hover {
    background: #d3d3d3;
  }
`;

//funtional component for displaying the factories according to their level in tree
const getPaddingLeft = (level, type) => {
    let paddingLeft = level * 20;
    if (type === 'subFactory') paddingLeft += 20;
    return paddingLeft;
}
//class component for rendering factories 
export default class FactoryNode extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <FactoryStyle level={this.props.level} type={this.props.node.type} isRoot= {this.props.node.isRoot}>
                    <div>
                        {this.props.node.type === 'factory' ?
                            <CustomMenu uniqueId={getFactoryLabel(this.props.node)}
                                contextNode={this.props.node} /> : ""}
                        {this.props.node.type === 'subFactory' ? getFactoryLabel(this.props.node) : ""}
                    </div>

                </FactoryStyle>
                {this.props.getFactories(this.props.node).map(childNode => (
                    <div>
                        <FactoryNode
                            {...this.props}
                            node={childNode}
                            level={this.props.level + 1}
                        />
                    </div>
                ))}
            </div>
        );
    }
}
FactoryNode.propTypes = {
    getFactories: PropTypes.func.isRequired,
    level: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
};

FactoryNode.defaultProps = {
    level: 0,
};