define([
    'plugin/formAnsMaster/views/formAnsMasterView',
    'plugin/ticket/views/ticketView',
  ], function (formAnsMasterView,ticketView) {
    return {
      templates:{
      // courseView:courseView,
      // formAnsMasterView:formAnsMasterView,
      // ticketView:ticketView,
      },
      routes:{
        'formAnsMaster': 'formAnsMasterView_',
        'ticket': 'ticketView_',
      },
      formAnsMasterView_:function(action){
        if (this.preTemp()) {
           new formAnsMasterView({ action: action });
         }
       },
       ticketView_:function(action){
        if (this.preTemp()) {
           new ticketView({ action: action });
         }
       },
      
    };
});  