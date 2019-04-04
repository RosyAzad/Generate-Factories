import React from "react";
import ReactDOM from "react-dom";
import last from 'lodash/last';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import styled from 'styled-components';

const RangeBox = styled.div`
width: 40px;
float: left;
color: #808080;
overflow: hidden;
display: contents;
`;

const RangeBoxContainer = styled.div`
float: left;
margin-left: 60px;
`;

const getFactoryLabel = (node) => last(node.path.split('/'));

export default class CustomMenu extends React.Component {
    constructor(props){
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleFactoryInsert = this.handleFactoryInsert.bind(this);
        this.handleNodeInsert = this.handleNodeInsert.bind(this);
        this.handleNumberInput = this.handleNumberInput.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }


    //deletes the factory
    handleDelete(e, data, id) {
        Meteor.call('factories.remove', data._id, (err) => { if (err != undefined) alert(err); });
    }

    //creates a new factory
    handleFactoryInsert(e, data, id) {

        const factoryData = this.refs.factoryName.value;
        var reg = /[^a-zA-Z0-9\!\@\#\$\%\^\*\_\|]+/;
        if (reg.test(factoryData)) {
            alert("Factory name can't have other than a-zA-Z0-9!@#$%^*_|");
        }
        else {
            this.refs.factoryName.value = '';
            const minValue = this.refs.minValue.value;
            this.refs.minValue.value = '';
            const maxValue = this.refs.maxValue.value;
            this.refs.maxValue.value = '';

            Meteor.call('factories.insertFactory', factoryData, minValue, maxValue, (err) => { if (err != undefined) alert(err); });
        }
    }

    //create sub-factories
    handleNodeInsert(e, data, id) {
        const nodeCount = this.refs.childNodeCount.value;
        this.refs.childNodeCount.value = '';
        const minValue = this.refs.minValue.value != '' ? this.refs.minValue.value : data.minValue;
        this.refs.minValue.value = '';
        const maxValue = this.refs.maxValue.value != '' ? this.refs.maxValue.value : data.maxValue;
        this.refs.maxValue.value = '';
        const maxSubFactories = Number(maxValue) - Number(minValue) + 1;
        console.log(this.refs.childNodeCount.value);
        if (nodeCount == '') {
            alert('Please specify number of nodes to generate');
        }
        else if (minValue == '' || maxValue == '') {
            alert('Please specify range');
        }
        else if (Number(minValue) > Number(maxValue)) {
            alert('Max value should be greater than min value to specify range');
        }
        else if (Number(nodeCount) <= 15 && maxSubFactories < Number(nodeCount)) {
            alert('Please increase the range to generate subfactories');
        }
        else if (Number(nodeCount) > 15 && maxSubFactories < 15) {
            alert('Please increase the range to generate maximum of 15 subfactories');
        }
        else {
            if (Number(nodeCount) > 15 && maxSubFactories > 15) {
                alert('There is a limit of 15 subFactories that can be generated');
            }
            Meteor.call('factories.insertChildNodes', data._id, id, nodeCount, minValue, maxValue, (err) => { if (err != undefined) alert(err); });
        }
    }

    //validations for numeric fields. The user can't enter e,-,+,. for max, min and create sub-factories fields
    handleNumberInput(event) {
        if (event.key === 'e' || event.key === '-' || event.key === '+' || event.key === '.') {
            event.returnValue = false;
            if (event.preventDefault) event.preventDefault();
        }
    }

    //event-handler for updating factory name
    handleKeyPress = (e, factory) => {
        const keyCode = event.keyCode || event.which;
        if (keyCode === 13) {
            event.returnValue = false
            const updatedFactoryName = this.refs.factoryName.innerText.split('\n')[0];;
            const reg = /[^a-zA-Z0-9\!\@\#\$\%\^\*\_\|]+/;
            if (updatedFactoryName === '' || updatedFactoryName === undefined) {
                alert("Factory name cannot be empty");
                this.refs.factoryName.innerText = getFactoryLabel(factory);
            }
            else if (reg.test(updatedFactoryName)) {
                alert("Factory name can't have other than a-zA-Z0-9!@#$%^*_|");
                this.refs.factoryName.innerText = getFactoryLabel(factory);
            }
            else {
                Meteor.call('factories.updateFactoryName', factory._id, updatedFactoryName, (err) => { if (err != undefined) alert(err); });
            }
            if (event.preventDefault) event.preventDefault()

        }

    }

    render() {
        return (
            <div >
                <ContextMenuTrigger id={this.props.uniqueId}>
                    <div style={{ width: '150px', float: "left" }} contentEditable={this.props.uniqueId == undefined ||
                        this.props.uniqueId == '' || this.props.uniqueId === 'root' ? false : true} ref="factoryName" onKeyPress={() => this.handleKeyPress(event, this.props.contextNode)}>{this.props.uniqueId}
                    </div>
                    {this.props.contextNode != undefined && this.props.uniqueId != 'root' ? (
                        <RangeBoxContainer>
                            <RangeBox >{this.props.contextNode.minValue}</RangeBox>
                            <RangeBox >-</RangeBox>
                            <RangeBox >{this.props.contextNode.maxValue}</RangeBox>
                        </RangeBoxContainer>) : ""}
                </ContextMenuTrigger>
                <div>
                    <ContextMenu id={this.props.uniqueId}>
                        {this.props.uniqueId === 'root' ?

                            <input style={{ width: '96%' }} ref="factoryName" type="text" pattern="[a-zA-Z0-9!@#$%^*_|]{6,25}" placeholder="Enter factory" ></input> :
                            <input style={{ width: '96%' }} type="number" min="1" ref="childNodeCount" onKeyDown={this.handleNumberInput} placeholder="Subfactories count" ></input>}
                        <div>
                            <label>min </label><input type="number" min="0" ref="minValue" step="1" onKeyDown={this.handleNumberInput} placeholder={this.props.uniqueId != 'root'
                                && this.props.contextNode != undefined ? this.props.contextNode.minValue : ""}></input></div>
                        <label>max</label><input type="number" min="0" ref="maxValue" step="1" onKeyDown={this.handleNumberInput} placeholder={this.props.uniqueId != 'root' && this.props.contextNode != undefined ? this.props.contextNode.maxValue : ""}></input>
                        {this.props.uniqueId === 'root' ?
                            <MenuItem data={this.props.contextNode} onClick={(event, data) => this.handleFactoryInsert(event, data, this.props.uniqueId)}>
                                Add Factory
                            </MenuItem> :
                            <MenuItem data={this.props.contextNode} onClick={(event, data) => this.handleNodeInsert(event, data, this.props.uniqueId)}>
                                Generate
                            </MenuItem>}
                        {this.props.uniqueId != 'root' ?
                            <MenuItem divider /> : ""}
                        {this.props.uniqueId != 'root' ?
                            <MenuItem data={this.props.contextNode} onClick={(event, data) => this.handleDelete(event, data, this.props.uniqueId)}>
                                Delete
        </MenuItem> : ""}
                    </ContextMenu>
                </div>

            </div>
        );
    }
}
