define([
  "jquery",
  "underscore",
  "backbone",
  "datepickerBT",
  "Swal",
  "moment",
  'minicolors',
  "../models/singleSliderSectionModel",
  '../../readFiles/views/readFilesView',
  '../../core/views/multiselectOptions',
  "text!../templates/sliderSectionSingle_temp.html",
],  function ($, _, Backbone, datepickerBT, Swal, moment,minicolors, singleSliderSectionModel, readFilesView, multiselectOptions, sliderSectionSingleTemp,){
      var sliderSectionSingleView = Backbone.View.extend({
        fontlist:{},
        subset:{},
          initialize: function (options) {
              var selfobj = this;
              this.item_id = options.item_id;
              this.model = new singleSliderSectionModel();
              this.toClose = "sliderSectionSingleView";
              this.searchSlide = options.searchSlide;
              this.multiselectOptions = new multiselectOptions();
              scanDetails = options.searchSlide;
              this.slider_id = options.slider_id;
              this.render();
              if(options.item_id != "" && options.item_id != undefined && options.item_id != null ){
                  this.model.set({item_id:options.item_id});
                  this.model.fetch({headers: {
                    'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                  },error: selfobj.onErrorHandler}).done(function(res){
                    if (res.flag == "F") showResponse('',res,'');
                    if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                    $(".popupLoader").hide();
                    selfobj.render();
                  });
              }
              this.getGoogleFontList();
          },

          getGoogleFontList:function(){
            var selfobj = this;
            let key = "AIzaSyBUmzF2VHfHBeFo-gVbTgWvGXHwCFOWXEc";
            $.ajax({
              url: "https://www.googleapis.com/webfonts/v1/webfonts?key="+key,
              method: 'GET',
              datatype: 'JSON',
              success: function (res) {
                if (res.flag == "F") showResponse('',res,'');
                selfobj.fontlist = res.items;
                selfobj.render();
              }
            });
      
          },

          events: {
          //      "click .saveSliderDetails": "saveSliderDetails",
          //      "blur .txtchange":"updateOtherDetails",
          //      "change .dropval":"updateOtherDetails",
          //      "click .loadMedia": "loadMedia",
          //      "change .dropdownVal": "setDropVal",
          },
        
          attachEvents: function () {
            this.$el.off('click', '.saveSliderDetails', this.saveSliderDetails);
            this.$el.on('click', '.saveSliderDetails', this.saveSliderDetails.bind(this));
            this.$el.off('blur','.txtchange', this.updateOtherDetails);
            this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
            this.$el.off('change','.dropval', this.updateOtherDetails);
            this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
            this.$el.off('change','.dropdownVal', this.setDropVal);
            this.$el.on('change','.dropdownVal', this.setDropVal.bind(this));
            this.$el.off("click", ".loadMedia", this.loadMedia);
             this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
          },

          setOldValues:function(){
            var selfobj = this;
            setvalues = ["status"];
            selfobj.multiselectOptions.setValues(setvalues,selfobj);
          },

          setValues:function(e){
            var selfobj = this;
            var da = selfobj.multiselectOptions.setCheckedValue(e);
            selfobj.model.set(da);
          },

          getSelectedFile:function(url){
            $('.'+this.elm).val(url);
            $('.'+this.elm).change();
            $("#profile_pic_view1").attr("src",url);
            $("#profile_pic_view1").css({"max-width":"100%"});
            $('#largeModal').modal('toggle');
            this.model.set({"cover_image":url});
          },

          loadMedia: function(e){
            e.stopPropagation();
            $('#largeModal').modal('toggle');
            this.elm = "profile_pic";
            new readFilesView({loadFrom:"addpage",loadController:this});
          },

          setDropVal: function (e) {
            e.stopImmediatePropagation();
            var selfobj = this;
            let newdetails = {};
            let id = $(e.currentTarget).attr("id");
            let inID = $(e.currentTarget).attr("data-toChange");
            let ob = selfobj.model.get(inID);
            if (ob == null || ob == undefined) {
                ob = {};
            }
            if (typeof ob === "string") {
                ob = JSON.parse(ob);
            }
            ob[id] = $(e.currentTarget).val();

            if (id === "titleFontSize" || id === "titleFontWeight" || id === "descFontSize" || id === "descFontWeight") {
              ob[id] = $(e.currentTarget).val();
            } else if (id === "titleFontFamily" || id === "descFontFamily") {
                let option = $('option:selected', e.currentTarget).attr('data-key');
                selfobj.subset[id] = selfobj.fontlist[option].variants;
                let uniqueValues = new Set(Object.values(selfobj.subset[id]));
                if (uniqueValues.size === 1) {
                    if (id === "titleFontFamily") {
                        ob['titleFontWeight'] = Array.from(uniqueValues)[0];
                    } else if (id === "descFontFamily") {
                        ob['descFontWeight'] = Array.from(uniqueValues)[0];
                    }
                }
            }
        
            newdetails[inID] = ob;
            selfobj.model.set(newdetails);
        
            if (id === "titleFontFamily" || id === "descFontFamily") {
                selfobj.render();
            }
          },          

          saveSliderDetails: function (e) {
            e.stopPropagation();
            e.preventDefault();
            let selfobj = this;
            var mid = this.model.get("item_id");
            this.model.set({ slider_id: this.slider_id });
            let isNew = $(e.currentTarget).attr("data-action");
            if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            }
            if (mid == "" || mid == null) {
              var methodt = "PUT";
            } else {
              var methodt = "POST";
            }
            if ($("#sliderDetails").valid()) {
              $(e.currentTarget).html("<span>Saving..</span>");
              $(e.currentTarget).attr("disabled", "disabled");
              this.model.save({},{
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                      SadminID: $.cookie("authid"),
                      token: $.cookie("_bb_key"),
                      Accept: "application/json",
                    },
                    error: selfobj.onErrorHandler,
                    type: methodt,
              })
              .done(function (res) {
                if (res.flag == "F") showResponse(e,res,'');
                if (res.statusCode == 994) {
                  app_router.navigate("logout", { trigger: true });
                }
                if (isNew == "new") {
                  showResponse(e, res, "Save & New");
                } else {
                  showResponse(e, res, "Save");
                }
                if(res.flag == "S") {
                  if(isNew == "new"){
                    // selfobj.searchSlide.getSectionList();
                    // setTimeout(function () {
                      selfobj.model.set({ "slider_data": {} });
                      selfobj.model.clear().set(selfobj.model.defaults);
                      selfobj.render();
                    // }, 1000);
                    }
                    else{
                      handelClose(selfobj.toClose);
                      selfobj.searchSlide.getSectionList();
                  }
                }
              });
            }
          },

          updateOtherDetails: function(e){
            var valuetxt = $(e.currentTarget).val();
            var toID = $(e.currentTarget).attr("id");
            var newdetails=[];
            newdetails[""+toID]= valuetxt;
            this.model.set(newdetails);
            if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
              this.model.set(toID, this.model.get(toID).join(","));
            }
          },

          initializeValidate: function () {
            var selfobj = this;
            var feilds = {
              title: {
                required: true,
              },
            };
            var feildsrules = feilds;
            var messages = {
              title: "Please enter Title ",
            };
            $("#sliderDetails").validate({
              rules: feildsrules,
              messages: messages,
            });

            $('.color').minicolors({
              format: "rgb",
              opacity: true,
              change: function (value, opacity) {
                let id = $(this).attr("id");
                let inID = $(this).attr("data-toChange");
                let ob = selfobj.model.get(inID);
                  if (typeof (ob) == "string") {
                    ob = JSON.parse(ob);
                  }
                  ob[id] = value;
                  let newdetails = [];
                  newdetails["" + inID] = ob;
                  selfobj.model.set(newdetails);
              },
              theme: 'bootstrap',
            });
          },

          render: function () {
              var selfobj = this;
              var source = sliderSectionSingleTemp;
              var template = _.template(source);
              $("#" + this.toClose).remove();
          
              var fontVars = [
                  { varName: 'sliderData', attrName: 'slider_data', fontFamilyKey: 'titleFontFamily', fontWeightKey: 'titleFontWeight' },
                  { varName: 'sliderData', attrName: 'slider_data', fontFamilyKey: 'descFontFamily', fontWeightKey: 'descFontWeight' }
              ];
          
              fontVars.forEach(function(fontVarObj) {
                  var fontFamily = selfobj.model.attributes[fontVarObj.attrName] ? selfobj.model.attributes[fontVarObj.attrName][fontVarObj.fontFamilyKey] : null;
                  var fontWeights = selfobj.subset[fontVarObj.fontFamilyKey];
                  if (fontFamily && fontWeights) {
                      var matchingKey = findMatchingKey(fontFamily, selfobj.fontlist);
                      if (matchingKey !== null) {
                          var availableWeights = selfobj.fontlist[matchingKey].variants;
                          // Update dropdown options for font weights
                          var $fontWeightDropdown = $('#' + fontVarObj.fontWeightKey);
                          $fontWeightDropdown.empty(); // Clear existing options
                          availableWeights.forEach(function(weight) {
                              $fontWeightDropdown.append('<option value="' + weight + '">' + weight + '</option>');
                          });
                      } else {
                          console.log("No matching key found for " + fontVarObj.varName);
                      }
                  }
              });
          
              function findMatchingKey(fontFamily, fontList) {
                  for (var key in fontList) {
                      if (fontList.hasOwnProperty(key)) {
                          var font = fontList[key];
                          if (fontFamily && fontFamily === font.family) {
                              return key;
                          }
                      }
                  }
                  return null;
              }
          
              var subsetForTitle = selfobj.subset ? selfobj.subset['titleFontFamily'] : [];
              var subsetForDesc = selfobj.subset ? selfobj.subset['descFontFamily'] : [];
        
              this.$el.html(template({ model: selfobj.model.attributes,   "fontlist": selfobj.fontlist, subsetForTitle: subsetForTitle, subsetForDesc: subsetForDesc,}));
              this.$el.addClass("tab-pane in active panel_overflow");
              this.$el.attr("id", this.toClose);
              this.$el.addClass(this.toClose);
              this.$el.data("role", "tabpanel");
              this.$el.data("current", "yes");
              $(".ws-tab").append(this.$el);
              $("#" + this.toClose).show();
              $(".ws-select").selectpicker();
              selfobj.initializeValidate();
              selfobj.attachEvents();
              selfobj.setOldValues();
              rearrageOverlays("Single Slider", this.toClose);
              var __toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'direction': 'rtl' }],                         // text direction
                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'align': [] }],
                ['link'],
                ['clean']                                         // remove formatting button
              ];
              var editor = new Quill($("#description").get(0), {
                modules: {
                  toolbar: __toolbarOptions
                },
                theme: 'snow'
              });
              editor.on('text-change', function (delta, oldDelta, source) {
                if (source == 'api') {
                  console.log("An API call triggered this change.");
                } else if (source == 'user') {
                  var delta = editor.getContents();
                  var text = editor.getText();
                  var justHtml = editor.root.innerHTML;
                  selfobj.model.set({ "description": justHtml });
                }
              });
              return this;
            },
            
            onDelete: function () {
              this.remove();
            },
      });
      return sliderSectionSingleView;
  })