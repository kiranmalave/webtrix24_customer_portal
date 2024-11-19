define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'minicolors',
  'Quill',
  'Swal',
  'jqueryUI',
  'templateEditor',
  'custom',
  '../models/pagesMasterSingleModel',
  '../../readFiles/views/readFilesView',
  '../../category/collections/categoryCollection',
  '../../menu/collections/menuCollection',
  '../../imageSlider/collections/imageSliderCollection',
  '../../templates/collections/templateCollection',
  'text!../templates/pagesMasterSingleTempEdit.html',
], function($,_,Backbone,validate,inputmask,minicolors,Quill,Swal,jqueryUI,templateEditor,custom,pagesMasterSingleModel,readFilesView,categoryCollection,menuCollection,imageSliderCollection,templateCollection,pagesMasterTemp){

  var pagesMasterSingleDesign = Backbone.View.extend({
      initialize: function(options){
        var selfobj = this;
        var pageID=options.action;
        this.pageID = pageID;
        this.model = new pagesMasterSingleModel();
        this.templateList = [];
        this.categories = [];
        this.imgSliders = [];
        // this.fAQTemplates = [];
        // this.ourWorksTemplates = [];
        // this.blogsTemplates = [];
        // this.listPagesTemplates = [];
        // this.testimonialsTemplates = [];
        // this.servicesTemplates = [];
        // this.ourClientsTemplates = [];
        // this.ourTeamTemplates = [];
        // this.careerTemplates = [];

        // this.blogsTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/blog3.jpg", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp4" }
        // ];
        // this.listPagesTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/blog3.jpg", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp4" }
        // ];
        // this.testimonialsTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi-2.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi-3.png", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi-2.png", value: "temp4" },
        // ];
        // this.servicesTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/blog3.jpg", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp4" }
        // ];
        // this.ourClientsTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp3" },
        // ];
        // this.ourTeamTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/team3.jpg", value: "temp3" }
        // ];
        // this.careerTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi-2.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi-3.png", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/View-testi-2.png", value: "temp4" },
        // ];
        // this.fAQTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/blog3.jpg", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp4" }
        // ];
        // this.ourWorksTemplates = [
        //   { imagePath: APPPATH+"assets/templateEditor/images/col-blog.png", value: "temp1" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp2" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/blog3.jpg", value: "temp3" },
        //   { imagePath: APPPATH+"assets/templateEditor/images/row-blog.png", value: "temp4" }
        // ];
        this.imageSliderCollection = new imageSliderCollection();
        this.imageSliderCollection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          var imgSliders =[];
          for (var i = 0; i < res.data.length; i++) {
            imgSliders[0] = res.data[i].slider_id;
            imgSliders[1] = res.data[i].title;
            selfobj.imgSliders.push(imgSliders.slice());
          }
          // console.log("selfobj.imgSliders",selfobj.imgSliders);
        });
        this.categoryCollection = new categoryCollection();
        this.categoryCollection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          var categories =[];
          for (var i = 0; i < res.data.length; i++) {
            categories[0] = res.data[i].category_id;
            categories[1] = res.data[i].categoryName;
            selfobj.categories.push(categories.slice());
          }
        });
        this.menuList = [];
        this.menuCollection = new menuCollection();
        this.menuCollection.fetch({
            headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', show_on_website: 'yes'}
        }).done(function (res) {
            // console.log("res menuCollection",res);
            var menuList =[];
            for (var i = 0; i < res.data.length; i++) {
              menuList[0] = res.data[i].menuID;
              menuList[1] = res.data[i].module_name;
              menuList[2] = res.data[i].menuName;
              menuList[3] = res.data[i].table_name;
              menuList[4] = res.data[i].custom_module;
              selfobj.menuList.push(menuList.slice());
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        });

        this.templateCollection = new templateCollection();
        this.templateCollection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          console.log("template collection",res);
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          // Initialize templateList
          selfobj.templateList = {};

          // Iterate through the data and populate templateList
          res.data.forEach(function(template) {
            var moduleName = template.module_name;
            if (!selfobj.templateList[moduleName]) {
              selfobj.templateList[moduleName] = [];
            }
            selfobj.templateList[moduleName].push({
              imagePath: template.temp_image,
              value: template.temp_name
            });
          });

          console.log("templateList", selfobj.templateList);
        });
       
        if(pageID!=0){
          this.model.set({pageID:pageID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler}).done(function(res){
            if (res.flag == "F") showResponse('',res,'');
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
            selfobj.setValues();
          });
        }else{
            selfobj.render();
            $(".popupLoader").hide();
        }
      },
      events:
      {
        "click #saveuserRoleDetails":"saveuserRoleDetails",
        "click .item-container li":"setValues",
        "blur .txtchange":"updateOtherDetails",
        "change .multiSel":"setValues",
        "click .checkVal":"updateOtherDetailsCheck",
        "change .bDate":"updateOtherDetails",
        "change .dropval":"updateOtherDetails",
        "click .multiselect": "getMulipleSelectedValue",
        "keyup .titleChange": "updateURL",
        "click .loadMedia": "loadMedia",
      },
      onErrorHandler: function(collection, response, options){
          Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
          $(".profile-loader").hide();
      },
      getSelectedFile:function(url){
        $('.'+this.elm).val(url);
        $('.'+this.elm).change();
        $('#largeModal').modal('toggle');
      },
      updateURL: function(e){
        var url = $(e.currentTarget).val().trim().replace(/[^A-Z0-9]+/ig, "_");
        $("#pageLink").val(url);
        this.model.set({"pageLink":url});
      },
      updateOtherDetails: function(e){
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails=[];
        newdetails[""+toID]= valuetxt;
        this.model.set(newdetails);
      },
      updateOtherDetailsCheck: function(e){
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails=[];
        var ische = $(e.currentTarget).is(":checked");
        if(ische){
          newdetails[""+toID]= "yes";
        }else{
          newdetails[""+toID]= "no";
        }
        
        this.model.set(newdetails);
      },
      setValues:function(e){
          setvalues = ["category"];
          var selfobj = this;

          $.each(setvalues,function(key,value){
            var modval = selfobj.model.get(value);
            if(modval != null){
              var modeVal = modval.split(",");
            }else{ var modeVal = {};}

            $(".category").each(function(){
              var currentval = $(this).attr("data-value");
              var selecterobj = $(this);
              $.each(modeVal,function(key,dbvalue){
                if(dbvalue.trim().toLowerCase() == currentval.toLowerCase()){
                  $(selecterobj).addClass("active");
                }
              });
            });
            
          });
          setTimeout(function(){
          if(e != undefined && e.type == "click")
          {
            var newsetval = [];
            var objectDetails = [];
            var classname = $(e.currentTarget).attr("class").split(" ");
            $(".item-container li."+classname[0]).each(function(){
              var isclass = $(this).hasClass("active");
              if(isclass){
                var vv = $(this).attr("data-value");
                newsetval.push(vv);
              }
          
            });
  
            if (0 < newsetval.length) {
              var newsetvalue = newsetval.toString();
            }
            else{var newsetvalue = "";}

            objectDetails[""+classname[0]] = newsetvalue;
            $("#valset__"+classname[0]).html(newsetvalue);
            selfobj.model.set(objectDetails);
          }
        }, 500);
      },
      saveuserRoleDetails: function(e){
        e.preventDefault();
        var pageID = this.model.get("pageID");
      
        if(pageID == "" || pageID == null){
          var methodt = "PUT";
        }else{
          var methodt = "POST";
        }
        
          var selfobj = this;
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({},{headers:{
            'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            if(res.flag == "F"){
              showResponse(e,res,'');
              $(e.currentTarget).html("<span>Error</span>");
            }else{
              $(e.currentTarget).html("<span>Saved</span>");
              showResponse('',{ flag:'F' , msg: 'Page Saved' },'');
              if(selfobj.pageID == 0){
                app_router.navigate("pages",{trigger:true});
              }
            }
            setTimeout(function(){
              $(e.currentTarget).html("<span>Save</span>");
              $(e.currentTarget).removeAttr("disabled");
              }, 3000);
          });
        
      },
      initializeValidate:function(){
        var selfobj = this;
          
      },
      render: function(){
          var selfobj = this;
          var source = pagesMasterTemp;
          var template = _.template(source);
          this.$el.html(template(this.model.attributes));
         
          $(".main_container").removeClass("content");
          $(".main_container").empty();
          $(".main_container").append(this.$el);
          setTimeout(function(){
          var tt = $(".emailTemplate");
            if(tt.hasClass("email_temp_int")){
            }else{
              tt.addClass("email_temp_int");
              tt.templateDesign({
                  playground:$(".playgrounddiv"),
                  playgroundElements:$(".playgroundelements"),
                  nextbtn:$("#nextbtn"),
                  savebtn:$(".getHTML"),
                  temptemplate:$(".emailTemplateDump"),
                  version:"block", // inline
                  mediaLink:"block",
                  mediaModel:"largeModal",
                  categories :selfobj.categories,
                  imgSliders :selfobj.imgSliders,
                  menuList :selfobj.menuList,
                  templateList: selfobj.templateList,

                  // fAQTemplates :selfobj.fAQTemplates,
                  // ourWorksTemplates :selfobj.ourWorksTemplates,
                  // blogsTemplates :selfobj.blogsTemplates,
                  // listPagesTemplates :selfobj.listPagesTemplates,
                  // testimonialsTemplates :selfobj.testimonialsTemplates,
                  // servicesTemplates :selfobj.servicesTemplates,
                  // ourClientsTemplates :selfobj.ourClientsTemplates,
                  // ourTeamTemplates :selfobj.ourTeamTemplates,
                  // careerTemplates :selfobj.careerTemplates,
                 
                  HTMLUpdate : function(data){
                    var codeD =[];
                    codeD["pageCode"]= $(".playgrounddiv").html();
                    codeD["pageContent"]= $(".emailTemplateDump").html();
                    codeD["pageCss"]= data.css;
                    selfobj.model.set(codeD);
                    selfobj.initializeValidate();
                    selfobj.saveuserRoleDetails(data.els);
                  },
                });
            }
          },2000);
          rearrageOverlays("pagesMaster",this.toClose);
          $('body').off('click', '.loadMedia');
          $("body").on("click",".loadMedia",function(e){
            $('#largeModal').modal('toggle');
            selfobj.elm = $(e.currentTarget).attr("data-change");
            new readFilesView({loadFrom:"addpage",loadController:selfobj});
          });
          
          return this;
      }
  });

  return pagesMasterSingleDesign;

});


