import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import getContacts from '@salesforce/apex/ContactController.getContacts';
import { reduceErrors } from 'c/ldsUtils';

export default class WireServiceExample extends LightningElement {
    @api recordId;

    // LDS Wire Adapter - getRecord
    @wire(getRecord, { 
        recordId: '$recordId', 
        fields: [ACCOUNT_NAME_FIELD, ACCOUNT_INDUSTRY_FIELD] 
    })
    wiredRecord;

    // Apex Wire Adapter - getContacts
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

    contacts;
    error;

    // Getter for account name using getFieldValue
    get accountName() {
        return getFieldValue(this.wiredRecord.data, ACCOUNT_NAME_FIELD);
    }

    // Getter for account industry
    get accountIndustry() {
        return getFieldValue(this.wiredRecord.data, ACCOUNT_INDUSTRY_FIELD);
    }

    // Getter for processed errors
    get errors() {
        return reduceErrors(this.error);
    }
}

