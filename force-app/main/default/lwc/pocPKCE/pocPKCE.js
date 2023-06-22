import {LightningElement,wire, api} from 'lwc';
import getVFOrigin from '@salesforce/apex/POC_PKCE.getVFOrigin';
import sharepointLogo from '@salesforce/resourceUrl/sharepoint_logo';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';

import CASE_SHAREPOINT_FOLDER_ID from '@salesforce/schema/Case.Sharepoint_Folder_ID__c';
import CASE_ID_FIELD from '@salesforce/schema/Case.Id';
import CASE_NAME_FIELD from '@salesforce/schema/Case.CaseNumber';

import CONTACT_SHAREPOINT_FOLDER_ID from '@salesforce/schema/Contact.Sharepoint_Folder_ID__c';
import CONTACT_ID_FIELD from '@salesforce/schema/Contact.Id';
import CONTACT_NAME_FIELD from '@salesforce/schema/Contact.Name';

import OPPORTUNITY_SHAREPOINT_FOLDER_ID from '@salesforce/schema/Opportunity.Sharepoint_Folder_ID__c';
import OPPORTUNITY_ID_FIELD from '@salesforce/schema/Opportunity.Id';
import OPPORTUNITY_NAME_FIELD from '@salesforce/schema/Opportunity.Name';

import ACCOUNT_SHAREPOINT_FOLDER_ID from '@salesforce/schema/Account.Sharepoint_Folder_ID__c';
import ACCOUNT_ID_FIELD from '@salesforce/schema/Account.Id';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

import LEAD_SHAREPOINT_FOLDER_ID from '@salesforce/schema/Lead.Sharepoint_Folder_ID__c';
import LEAD_ID_FIELD from '@salesforce/schema/Lead.Id';
import LEAD_NAME_FIELD from '@salesforce/schema/Lead.Name';

import WORK_ORDER_NUMBER_FIELD from '@salesforce/schema/Work_Order__c.Name';
import WORK_ORDER_ID_FIELD from '@salesforce/schema/Work_Order__c.Id';
import WORK_ORDER_SHAREPOINT_FOLDER_ID from '@salesforce/schema/Work_Order__c.Sharepoint_Folder_ID__c';

// const fields = [WORKORDERNUMBER_FIELD, LEAD_NAME_FIELD, LEAD_SHAREPOINT_FOLDER_ID]; 
export default class PocPkce extends LightningElement {
    accessToken;
    workstationId;
    loadFrame;
    TOKEN = 'sfad_sptoken';
    WORKSTATION = 'sfad_workstation';
    COM = '.com';
    //Sharepoint Global ID = {Hostname},{SiteID},{WebID}
    globalSPID = "welcoca.sharepoint.com,2ad0fe68-8dfa-4e16-9f9f-662e33f09081,5ab599a3-5faa-49b5-8142-64630a0e849d";
    //ID for the sharepoint document library
    docLibID = "b!aP7QKvqNFk6fn2YuM_CQgaOZtVqqX7VJgUJkYwoOhJ1bbEUGTyfVQagAAgZeq5Qh"
    docLibFolders;
    documents;
    documentLibrary;
    fileImageUrl;
    sharepointLogoIcon = sharepointLogo;
    spFolderName;
    folderLink;
    isChecked = false;
    objectName;
    chosenFolder;
    parentFolderID
    @api objectApiName;
    hasRendered = false;
    folderExists;
    sharepointFolderId;
    isAuthenticated = false;
    // get vf origin
    
    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields: "$fields" })
    fieldValues({data, error}) {
        if (data) {
            switch(this.objectApiName) {
                case "Work_Order__c":
                    this.objectName = getFieldValue(data, WORK_ORDER_NUMBER_FIELD);
                    this.sharepointFolderId = getFieldValue(data, WORK_ORDER_SHAREPOINT_FOLDER_ID);
                    
                    //cut the work order number from "Job #20-121" -> "20-121" 
                    this.objectName = this.objectName.substring(5,11);
                  break;
                case "Lead":
                    this.objectName = getFieldValue(data, LEAD_NAME_FIELD);
                    this.sharepointFolderId = getFieldValue(data, LEAD_SHAREPOINT_FOLDER_ID);
                  break;
                case "Account":
                    this.objectName = getFieldValue(data, ACCOUNT_NAME_FIELD);
                    this.sharepointFolderId = getFieldValue(data, ACCOUNT_SHAREPOINT_FOLDER_ID);
                  break;
                case "Opportunity":
                    this.objectName = getFieldValue(data, OPPORTUNITY_NAME_FIELD);
                    this.sharepointFolderId = getFieldValue(data, OPPORTUNITY_SHAREPOINT_FOLDER_ID);
                  break;
                case "Case":
                    this.objectName = getFieldValue(data, CASE_NAME_FIELD);
                    this.sharepointFolderId = getFieldValue(data, CASE_SHAREPOINT_FOLDER_ID);
                  break;
                case "Contact":
                    this.objectName = getFieldValue(data, CONTACT_NAME_FIELD);
                    this.sharepointFolderId = getFieldValue(data, CONTACT_SHAREPOINT_FOLDER_ID);
                  break;
                default:
                  // code block
              }
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getVFOrigin)
    vfOrigin;

    isFolder;

    //matches the Salesforce API name to the Sharepoint folder ID
    //If I am in a Work Order Object use the api name "Work_Order__c" 
    //to determine the correct sharepoint folder
    objectFolderMapping = new Map([
        ["Work_Order__c" , "01OIRAARNITIAAA6TVYFHKNYLU4QWROU4A"],
        ["Lead" , "01OIRAARNY7BTNFCLIWZH3HVIHFQQ5VSIL"],
        ["Account", "01OIRAAROU5RC4JQVKQ5EL75MAFORK5T7Q"],
        ["Opportunity", "01OIRAARKX3FAPQSBWFVBLX7IWBUTWCYWJ"],
        ["Case", "01OIRAARN6OS5VEMIRD5CYFB6ZBQHTWBSW"],
        ["Contact", "01OIRAARI2OO4UTSXQHVAYW2IBCPICREXU"]
    ]);

    //returns the fields based on the type of object we are working with since each field has its own unique api name
    get fields() {
        if (this.objectApiName === "Work_Order__c") {
            return [WORK_ORDER_ID_FIELD, WORK_ORDER_NUMBER_FIELD, WORK_ORDER_SHAREPOINT_FOLDER_ID];
        } else if(this.objectApiName === "Lead") {
            return [LEAD_ID_FIELD, LEAD_SHAREPOINT_FOLDER_ID, LEAD_NAME_FIELD];
        } else if(this.objectApiName === "Account") {
            return [ACCOUNT_ID_FIELD, ACCOUNT_SHAREPOINT_FOLDER_ID, ACCOUNT_NAME_FIELD];
        } else if(this.objectApiName === "Opportunity") {
            return [OPPORTUNITY_ID_FIELD, OPPORTUNITY_SHAREPOINT_FOLDER_ID, OPPORTUNITY_NAME_FIELD];
        } else if(this.objectApiName === "Case") {
            return [CASE_ID_FIELD, CASE_SHAREPOINT_FOLDER_ID, CASE_NAME_FIELD];
        } else if(this.objectApiName === "Contact") {
            return [CONTACT_ID_FIELD, CONTACT_SHAREPOINT_FOLDER_ID, CONTACT_NAME_FIELD];
        }
    }

    connectedCallback() {
        //bind event listener for data received from visualforce auth call
        window.addEventListener("message", this.handleAuthResponse.bind(this));
    }
    renderedCallback() {
        const sessionToken = sessionStorage.getItem(this.TOKEN);
        if(sessionToken){ //check session storage for existing token or workstation id.
            console.log('>>> Session Stored Token: ' + sessionToken);
                //Checking if the sessionToken is invalid and will set isAuthenticated
                this.checkAccessToken();
                
            if(this.isAuthenticated){
                console.log("is authenticated");
                this.getSharepointFolders();
            }
            //if there is a session token, but its no longer valid
            else{
                this.loadFrame = true;
            }
        }else{ //if there is no token or id, then call initiate VF Auth call
            console.log('>>> No token stored. Removed timeout.');
            this.loadFrame = true; //render the iframe
        }
    }

    handleAuthResponse(message) {
        if (message.data && (message.origin === this.vfOrigin.data + this.COM)) {
            const resp = message.data;
            if(resp.startsWith('vf-ready')){ //when the vf page is ready, start the auth call
                console.log('>>> Loaded.');
            }else{ //we assume any other message would be the access token
                this.isAuthenticated = true;
                this.accessToken = resp;
                sessionStorage.setItem(this.TOKEN, this.accessToken);
                this.getSharepointFolders().catch();
                
            }
        }
        
    }

    async getSharepointFolders(){
        const response = await fetch(`
        https://graph.microsoft.com/v1.0/sites/${this.globalSPID}/drives/${this.docLibID}/root/children`,{
            headers:{
                'Authorization': `Bearer ${sessionStorage.getItem(this.TOKEN)}`
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();

        this.docLibFolders = data.value;


        //get name of current folder 
        this.parentFolderID = this.objectFolderMapping.get(this.objectApiName);
        this.spFolderName = data.value.find(x => x.id === this.parentFolderID).name;

        //waiting for salesforce record data...
        await this.waitForData();
        
        //gets the correct sharepoint folder
        if(this.sharepointFolderId === null){
            //if the sharepointFolderId is null then we cant check it so just mark as checked
            this.isChecked = true;
        }else{
            this.getActiveFolder();
        }        
    }

    waitForData() {
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                if (this.objectName) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100);
        });
    }

    async getActiveFolder(){
        const response = await fetch(`
        https://graph.microsoft.com/v1.0/sites/${this.globalSPID}/drives/${this.docLibID}/items/${this.sharepointFolderId}`,{
            headers:{
                'Authorization': `Bearer ${sessionStorage.getItem(this.TOKEN)}`
            }
        })
        //folder doesnt exist:
        if (!response.ok) {
            if(response.status === 404){
                console.log("Folder for this object is not created");
                this.isChecked = true;
            }
            //throw an error for any other status code other than 404
            else{
                throw new Error(`HTTP error: ${response.status}`);
            }
        }
        else{
            const data = await response.json();
            this.folderExists = true;
            this.isChecked = true;
            this.folderLink = data.webUrl;
            this.chosenFolder = data.name;
        }

    }

    //Updates the Sharepoint Folder Id in the salesforce object with the sharepoint id
    updateSharepointReferenceField(id){
        const fields = {};
        switch(this.objectApiName) {
            case "Work_Order__c":
                fields[WORK_ORDER_ID_FIELD.fieldApiName] = this.recordId;
                fields[WORK_ORDER_SHAREPOINT_FOLDER_ID.fieldApiName] = id;
                break;
            case "Lead":
                fields[LEAD_ID_FIELD.fieldApiName] = this.recordId;
                fields[LEAD_SHAREPOINT_FOLDER_ID.fieldApiName] = id;
                break;
            case "Account":
                fields[ACCOUNT_ID_FIELD.fieldApiName] = this.recordId;
                fields[ACCOUNT_SHAREPOINT_FOLDER_ID.fieldApiName] = id;
                break;
            case "Opportunity":
                fields[OPPORTUNITY_ID_FIELD.fieldApiName] = this.recordId;
                fields[OPPORTUNITY_SHAREPOINT_FOLDER_ID.fieldApiName] = id;
                break;
            case "Case":
                fields[CASE_ID_FIELD.fieldApiName] = this.recordId;
                fields[CASE_SHAREPOINT_FOLDER_ID.fieldApiName] = id;
                break;
            case "Contact":
                fields[CONTACT_ID_FIELD.fieldApiName] = this.recordId;
                fields[CONTACT_SHAREPOINT_FOLDER_ID.fieldApiName] = id;
                break;
            default:
                console.log("im hitting the default?");
            // code block
        }
        
        const recordInput = { 
            fields: fields 
        };

        updateRecord(recordInput)
        .then(() => {
            // Handle successful update
        })
        .catch(error => {
            console.log("sharepoint update id error:");
            console.log(error);
            // Handle error
        });
    }

    //creates a folder for the salesforce object
    async createFolder(){
        console.log(this.objectName);
        const folderResponse = await fetch(`
        
        https://graph.microsoft.com/v1.0/sites/${this.globalSPID}/drives/${this.docLibID}/items/${this.parentFolderID}/children`,{
            method: "POST",    
            headers:{
                'Authorization': `Bearer ${sessionStorage.getItem(this.TOKEN)}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name":this.objectName,
                "folder":{},
                "@microsoft.graph.conflictBehavior":"rename"
           })
        })
        if (!folderResponse.ok) {
            throw new Error(`HTTP error: ${folderResponse.status}`);
        }
        //folder was created properly
        else{
            const data = await folderResponse.json();
            this.updateSharepointReferenceField(data.id);
            this.folderExists = true;
            this.folderLink = data.webUrl;
            this.chosenFolder = data.name;
            //refresh view to show link to sharepoint site
        }

    }

    async checkAccessToken(){
        const response = await fetch(`
        https://graph.microsoft.com/v1.0/me`,{
            headers:{
                'Authorization': `Bearer ${sessionStorage.getItem(this.TOKEN)}`
            }
        })
        //folder doesnt exist:
        if (!response.ok) {
            if(response.status === 401){
                console.log("Access Token is invalid");                
                this.isAuthenticated = false;
            }
            //throw an error for any other status code other than 401
            else{
                throw new Error(`HTTP error: ${response.status}`);
            }
        }
        else{
            this.isAuthenticated = true;
        }
    }

    initiateVFAuthCall() {
        let iframe = this.template.querySelector("iframe");
        if (iframe) {
        let message = 'pkce_login';
          // call vf to initiate auth flow
          console.log("message:")
          console.log(message)
          console.log("this.vfOrigin:")
          console.log(this.vfOrigin)
          iframe.contentWindow.postMessage(message, this.vfOrigin.data + this.COM);
        } else {
          console.error('Unable to find iframe element in DOM');
        }
    }

    
}