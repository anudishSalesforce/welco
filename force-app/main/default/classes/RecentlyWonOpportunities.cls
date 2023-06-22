@RestResource(urlMapping='/api/wonOpportunities/*')
global with sharing class RecentlyWonOpportunities
{
    @HttpGet
    global static List<Opportunity> doGet() 
    {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        List<Opportunity> result = [SELECT Id, Name, CloseDate, Account.Name, Supplier__c, Amount FROM Opportunity WHERE IsWon = True AND CloseDate = LAST_N_DAYS:2];
        return result;
    }
   

}