define([
  'underscore',
  'backbone',
  '../models/faqModel'
], function(_, Backbone,faqModel){

  var faqCollection = Backbone.Collection.extend({
      faq_id:null,
      model: faqModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'faqList';
      },
      parse : function(response){
        this.pageinfo = response.paginginfo;
        this.totalRecords = response.totalRecords;
        this.endRecords = response.end;
        this.flag = response.flag;
        this.msg = response.msg;
        this.loadstate = response.loadstate;
        return response.data;
      }
  });

  return faqCollection;

});