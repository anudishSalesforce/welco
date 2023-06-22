@isTest
private class RecentlyWonOpportunitiesTest {
    @testSetup
    static void DataSetup() {
        //get last weeks date
        Date lastWeek = Date.Today() - 75;
        
        //Account and Contact creation for Opportunity required fields.
        Account acc = new Account();
        acc.Name = 'Burlington Textiles Corp of America';
        insert acc;
        
        Contact cont = new Contact();
		cont.FirstName='Test';
		cont.LastName='Test';
		cont.Accountid= acc.id;
		insert cont;
        
        //Opportunity that should be found by RecentlyWonOpportunities
        Opportunity correctOpp = new Opportunity(Name = 'TestingTrue',
                                                 Sale_Type__c = 'Regular',
                                                 StageName = 'Closed Won',
                                                 CloseDate = Date.today(),
                                                 Supplier__c = 'BDI',
                                                 Category_Code__c = 'AAA',
                                                 Opportunity_Type__c = 'Units',
                                                 Units__c = 1,
                                                 ApplicationCircuit__c = 'pump',
                                                 Type_of_Placement__c = 'New Application',
                                                 AccountId = acc.id,
                                                 Primary_Contact__c = cont.id,
                                                 Primary_Contact_Role__c = 'Contractor',
                                                 Opportunity_Source__c = 'Customer Referral',
                                                 Reference__c = '123',
                                                 Amount = 1000);
        insert correctOpp;   

        
        //Opportunity that should not be found by RecentlyWonOpportunities
        Opportunity incorrectOpp = new Opportunity(Name = 'TestingFalse',
                                                   Sale_Type__c='Regular',
                                                   StageName = 'Closed Lost',
        										   CloseDate = lastWeek,
                                                   Supplier__c = 'BDI',
                                                   Category_Code__c = 'AAA',
                                                   Opportunity_Type__c ='Units',
                                                   Units__c=1,
                                                   ApplicationCircuit__c='pumps',
                                                   Type_of_Placement__c='New Application',
                                                   AccountId = acc.id,
                                                   Primary_Contact__c = cont.id,
                                                   Primary_Contact_Role__c = 'Contractor',
                                                   Opportunity_Source__c = 'Customer Referral',
                                                   Reference__c = '123');
        insert incorrectOpp;
        
        incorrectOpp.CloseDate = lastWeek;
        update incorrectOpp;
        
        
        //Closed/Won but more than a few days out.
        Opportunity incorrectOpp2 = new Opportunity(Name = 'TestingFalseAgain',
                                                    Sale_Type__c = 'Regular',
                                                    StageName = 'Closed Won',
                                                    CloseDate = lastWeek,
                                                    Supplier__c = 'BDI',
        											Category_Code__c = 'AAA',
                                                    Opportunity_Type__c = 'Units',
                                                    Units__c = 1,
                                                    ApplicationCircuit__c = 'pump',
                                                    Type_of_Placement__c = 'New Application',
                                                    AccountId = acc.id,
                                                    Primary_Contact__c = cont.id,
                                                    Primary_Contact_Role__c = 'Contractor',
                                                    Opportunity_Source__c = 'Customer Referral',
                                                    Reference__c = '123');
        insert incorrectOpp2; 
        
        incorrectOpp2.CloseDate = lastWeek;
        update incorrectOpp2;
    }
    @isTest static void testOpportunityFail(){
        Boolean success = true;
        RestRequest req = new RestRequest(); 
        RestResponse res = new RestResponse(); 
        req.requestURI = '/services/apexrest/RecentlyWonOpportunities/';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response= res;
        List<Opportunity> result = RecentlyWonOpportunities.doGet();
        
        for(integer i = 0; i < result.size(); i++){
            if(result[i].Name == 'TestingFalse'){
                success = false;
            }
        } 
        system.assert(success);
    }
    @isTest static void testOpportunitySuccess(){
        Boolean success = false;
        RestRequest req = new RestRequest(); 
        RestResponse res = new RestResponse(); 
        req.requestURI = '/services/apexrest/RecentlyWonOpportunities/';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response= res;
        List<Opportunity> result = RecentlyWonOpportunities.doGet();

        for(integer i = 0; i < result.size(); i++){  
            if(result[i].Name == 'TestingTrue'){
                success = true;
            }
        } 
		system.assert(success);
    }

}