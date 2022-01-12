import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/db/TasksCollection';

Meteor.publish('tasks', function publishTasks() {
    console.log("dsadsad")
    return TasksCollection.find({ userId: this.userId });
});