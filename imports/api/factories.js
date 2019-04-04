import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import last from 'lodash/last';


export const Factories = new Mongo.Collection('factories');

//adding publication to all the Factories
if (Meteor.isServer) {
    Meteor.publish('factories', function tasksPublication() {
      return Factories.find();
    });
  }

Meteor.methods({
    //method to create root node
    'factories.insertRoot'() {
        const factory = Factories.findOne({isRoot : true});
        if(factory == undefined){
        Factories.insert({
            path: '/root',
            type: 'factory',
            isRoot: true,
        });
    }      
    },

    //method to remove the factory
    'factories.remove'(factoryId) {
        check(factoryId, String);
        const factory = Factories.findOne(factoryId);

        if (factory.children != undefined) {
            factory.children.forEach(function (child) {
                Factories.remove({ path: child });
            });
        }
        Factories.remove(factoryId);
        Factories.update({ path: '/root' }, { $pull: { children: factory.path } });

    },

    //method to update factory name
    'factories.updateFactoryName'(factoryId, updatedFactoryName) {
        check(factoryId, String);
        check(updatedFactoryName, String);
        const factory = Factories.findOne(factoryId);
        
        if(updatedFactoryName == '' || updatedFactoryName === undefined){
            throw new Meteor.Error('Factory name cannot be empty');
        }
        Factories.update({_id: factoryId}, {$set :{path:'/root/'+updatedFactoryName}})
        var updatedChildren = [];
        if (factory.children != undefined) {
            factory.children.forEach(function (child) {
                var childFactory = Factories.findOne({path: child});
                var childFactoryId = childFactory._id;
                var childName =last(child.split('/'));
                var updatedChild = '/root/'+updatedFactoryName+'/'+childName;
                updatedChildren.push(updatedChild);
                Factories.update({_id: childFactoryId}, { $set:{path : updatedChild } });
            });
        }
        Factories.update({_id: factoryId}, {$set :{children: updatedChildren}});
        Factories.update({ path: '/root' ,children: factory.path },{$set :{'children.$' : '/root/'+updatedFactoryName }});

    },

    //method to create sub-factories
    'factories.insertChildNodes'(factoryId,text, childNodeCount, minValue, maxValue) {
        check(factoryId, String);
        
        Factories.update({ _id: factoryId }, { $set :{
            minValue: minValue,
            maxValue: maxValue
        }})
        if (childNodeCount > 15) {
            childNodeCount = 15;
        }
        const factory = Factories.findOne(factoryId);
        
        if (factory.children != undefined) {
             factory.children.forEach(function (child) {
                Factories.remove({ path: child });
            });
            factory.children.forEach(function (child) {
                Factories.update({ path: factory.path }, { $pull: { children: child } });
            });
        }
        var uniqueRandomNumbers = [];
        while (uniqueRandomNumbers.length < childNodeCount) {
            var random = Math.random();
            var randomNumber = Math.floor((random * ((Number(maxValue)+1) - Number(minValue)) + Number(minValue)));
            if (uniqueRandomNumbers.indexOf(randomNumber) == -1) {
                uniqueRandomNumbers.push(randomNumber);
            }
        }
        for (var i = 0; i < uniqueRandomNumbers.length; i++) {
            Factories.update({ _id: factoryId }, { $push: { children: factory.path + '/' + uniqueRandomNumbers[i] } });
            Factories.insert({
                path: factory.path + '/' + uniqueRandomNumbers[i],
                type: 'subFactory'
            });
        }
    },

    //method to create factory
    'factories.insertFactory'(text, min, max) {
        check(text, String);

        if (text == 'root') {
            throw new Meteor.Error('root cannot be a factory name ');
        }
        else if (text == '') {
            throw new Meteor.Error('Please insert factory name to add it');
        }
        else if (Factories.findOne({ path: '/root/' + text })) {
            throw new Meteor.Error('Factory with same name present');
        }
        else {
            Factories.update({ path: '/root' }, { $push: { children: '/root/' + text } });
            Factories.insert({
                path: '/root/' + text,
                type: 'factory',
                minValue: min,
                maxValue: max
            });
        }
    },
})

