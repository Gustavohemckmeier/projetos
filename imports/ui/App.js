import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import './App.html';
import './Task.js';
import './login.js';
import {ContatoCollection} from "../db/ContatoCollection";

const HIDE_COMPLETED_STRING = 'hideCompleted';
const IS_LOADING_STRING = "isLoading";

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

const getTasksFilter = () => {
    const user = getUser();

    const hideCompletedFilter = { isChecked: { $ne: true } };

    const userFilter = user ? { userId: user._id } : {};

    const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };

    return { userFilter, pendingOnlyFilter };
};

Template.mainContainer.onCreated(function mainContainerOnCreated() {
    this.state = new ReactiveDict()
    const handler = this.subscribe('contatos');
    Tracker.autorun(() => {
        this.state.set(IS_LOADING_STRING, !handler.ready());
    });
});

Template.form_filtro.onCreated(function mainContainerOnCreated() {
    this.filtro = new ReactiveVar("")
});

Template.mainContainer.events({
    'click #hide-completed-button'(event, instance) {
        const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted);
    },
    'click .user'() {
        Meteor.logout();
    },
});

Template.mainContainer.helpers({
    state: () => Template.instance().state,
    contato() {
        let filtro = {}
        const instance = Template.instance();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        const titulo = instance.state.get("titulo")
        const descricao = instance.state.get("descricao")

        if(!!titulo){
            filtro.titulo = { $regex: titulo, $options: 'i' }
        }
        if (!!descricao){
            filtro.descricao = { $regex: descricao, $options: 'i'}
        }

        const { pendingOnlyFilter, userFilter } = getTasksFilter();

        if (!isUserLogged()) {
            return [];
        }

        return ContatoCollection.find({
                ...hideCompleted ? pendingOnlyFilter : userFilter,
                ...!!filtro.titulo || !!filtro.descricao ? filtro : {},
            },
            {
                sort: { createdAt: -1 },
            }
        ).fetch();
    },
    hideCompleted() {
        return Template.instance().state.get(HIDE_COMPLETED_STRING);
    },
    incompleteCount() {
        if (!isUserLogged()) {
            return '';
        }

    },
    isUserLogged() {
        return isUserLogged();
    },
    getUser() {
        return getUser();
    },
    isLoading() {
        const instance = Template.instance();
        return instance.state.get(IS_LOADING_STRING);
    }

});

Template.form.events({
    'submit .js-taskInsert'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const { target } = event;
        const text = target.text.value;
        const titulo = target.titulo.value;
        const descricao = target.descricao.value;
        // Insert a task into the collection
        Meteor.call('tasks.insert', text, titulo, descricao);


        // Clear form
        target.text.value = '';
        target.titulo.value = '';
        target.descricao.value = '';
    },
});

Template.form_filtro.events({
    'submit .js-taskFiltro'(event, templateInstance) {
        event.preventDefault();

        const { target } = event;
        const titulo = target.titulo.value;
        const descricao = target.descricao.value;

        templateInstance.data.state.set("titulo", titulo)
        templateInstance.data.state.set("descricao", descricao)
    }
});

Template.form_contato.events({
    'submit .js-taskContato'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value fform_contatorom form element
        const { target } = event;
        const telefone = target.telefone.value;
        const email = target.email.value;
        // Insert a task into the collection

        Meteor.call('contato.insert', telefone, email);


        // Clear form
        target.telefone.value = '';
        target.email.value = '';
    },
    'input [name=telefone]': function (event){
        if(event.target.value.length > 14){
            event.target.value = event.target.value.substring(0, 14)
        }
    }
});



