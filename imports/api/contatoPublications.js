import { Meteor } from 'meteor/meteor';
import { ContatoCollection } from '/imports/db/ContatoCollection';

Meteor.publish('contatos', function() {
    console.log("Dsadas")
    return ContatoCollection.find({ userId: this.userId });
});