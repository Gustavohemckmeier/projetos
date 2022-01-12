import { Template } from 'meteor/templating';

import './Task.html';

Template.task.events({
    'click .delete'() {
        Meteor.call('tasks.remove', this._id);
    },
});