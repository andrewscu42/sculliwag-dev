import { LightningElement, wire, api } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import { reduceErrors } from 'c/ldsUtils';

export default class ContactList extends LightningElement {
    contacts;
    error;

    @api
    columns = [
        { label: 'First Name', fieldName: FIRST_NAME_FIELD.fieldApiName },
        { label: 'Last Name', fieldName: LAST_NAME_FIELD.fieldApiName },
        { label: 'Email', fieldName: EMAIL_FIELD.fieldApiName }
    ];

    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }

    get errors() {
        return reduceErrors(this.error);
    }
}