define([
    'underscore',
    'backbone',
    '../models/SliderSectionModel'
  ], function(_, Backbone,SliderSectionModel){
  
    var sliderSectionCollection = Backbone.Collection.extend({
        slider_id:null,
        item_id:null,
        model: SliderSectionModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'sliderSectionMasterList';
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
  
    return sliderSectionCollection;
  
  });