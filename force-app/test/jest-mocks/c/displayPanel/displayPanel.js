import { LightningElement, api } from 'lwc';

export default class DisplayPanel extends LightningElement {
    @api errors;
    @api notes;
    // Add other @api properties passed to the component
}

