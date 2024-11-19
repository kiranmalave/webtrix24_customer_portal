
define([
  'jquery',
  'underscore',
  'backbone',
  'minicolors',
  'Swal',
  '../models/themeOptionModel',
  '../../readFiles/views/readFilesView',
  '../../core/views/countryExtList',
  '../../core/views/multiselectOptions',
  '../../core/views/mailView',
  'text!../templates/themeOption_temp.html',
], function ($, _, Backbone, minicolors,Swal, themeOptionModel, readFilesView,countryExtList,multiselectOptions, mailView, themeOptionTemp) {

  var themeOptionView = Backbone.View.extend({
    fontlist:{},
    subset:{},
    initialize: function (options) {
      this.toClose = "themeOptionFilterView";
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.multiselectOptions = new multiselectOptions();
      this.countryListView = new countryExtList();
      this.countryExtList = this.countryListView.countryExtList;
      this.model = new themeOptionModel();
      readyState = true;
      this.render();
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
        selfobj.setOldValues();
      });
      this.stripViewOptions = [];
      this.stripViewOptions = [
        {"label": "Desktop", "value": "Desktop"},
        {"label": "Tablet", "value": "Tablet"},
        {"label": "Mobile", "value": "Mobile"},
      ]
      this.getGoogleFontList();
    
    },
    events:
    {
      "click .multiOptionSel": "multioption",
      "change .txtchange": "updateOtherDetails",
      "change .fontChange": "fontChange",
      "change .dropval": "updateOtherDetails",
      "click .selectImg": "updateOtherDetails",
      "change .dropdownVal": "setDropVal",
      "click .savethemeDetails": "savethemeDetails",
      "change .switch": "switch",
      "click .loadMedia": "loadMedia",
      "click .headerImg": "selectHeader",
      "change .switchSocial": "switchSocial",
      "click .deleteImage": "deleteImage",
      "change .countrySelect": "setCountryCode",
      "click .copyMenuLink" : "copyMenuLink",
      "click .multiSel": "setValues",
      "click .loadview": "loadSubView",
      "change .headerStripSelect": "headerStripSelect",
    },

    headerStripSelect:function(e){
      e.stopPropagation();
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toName] = valuetxt;
      this.model.set(newdetails);
      if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
        this.model.set(toName, this.model.get(toName).join(","));
      }
      console.log("selfobj.model",selfobj.model);
    },

    setCountryCode: function(e){
      e.stopPropagation();
      var selfobj = this;
      var value = $(e.currentTarget).val();
      $(".countrySelect .filter-option-inner-inner").text(value);
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = value;
      selfobj.model.set(newdetails);
    },

    deleteImage:function(e){
      var selfobj = this;
      var toID = $(e.currentTarget).attr("data-id");
      var newdetails = [];
      newdetails["" + toID] = null;
      selfobj.model.set(newdetails);
      $('.'+toID).hide();
    },

    loadSubView: function (e) {
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "mail": {
          $(".customMail").show();
          $('.customMail').remove('maxActive');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-custMail");
          new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail });
          $('body').find(".loder").hide();
          break;
        }
      }
    },

    updateOtherDetails: function (e) {
      e.stopImmediatePropagation()
      var selfobj = this;
      var toID = $(e.currentTarget).attr("data-id");
      if (toID == "header_layout") {
        var valuetxt = $(e.currentTarget).attr("data-toChange");
        $(e.currentTarget).closest('ol').find('li').removeClass('active');
        $(e.currentTarget).closest('li').addClass('active');
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        selfobj.model.set(newdetails);
      } else if(toID == "footer_layout"){
        $('.footerLayoutOne').hide();
        $('.footerLayoutTwo').hide();
        $('.footerLayoutThree').hide();
        $('.footerLayoutFour').hide();
        var valuetxt = $(e.currentTarget).attr("data-toChange");
        if(valuetxt == 'one'){
          $('.footerLayoutOne').show();
        }else if(valuetxt == 'two'){
          $('.footerLayoutTwo').show();
        }else if(valuetxt == 'three'){
          $('.footerLayoutThree').show();
        }else{
          $('.footerLayoutFour').show();
        }
        $(e.currentTarget).closest('span').removeClass('active');
        $(e.currentTarget).closest('span').addClass('active');
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        selfobj.model.set(newdetails);
      }else {
        var toID = $(e.currentTarget).attr("id");
        var valuetxt = $(e.currentTarget).val();
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        selfobj.model.set(newdetails);
      }
    },
    
    switch: function () {
      var selfobj = this;
      var newdetails = [];
      $('.switch input:checkbox').each(function () {
        var $this = $(this);
        var isChecked = $this.is(":checked");
        var value = isChecked ? "yes" : "no";
        var elID = this.id;
        newdetails["" + elID] = value;
        selfobj.model.set(newdetails);
        if(selfobj.model.attributes.google_reCaptcha == 'yes'){
          $('.googleCaptchaCls').show();
        }else{
          $('.googleCaptchaCls').hide();
        }
      });
    },   

    switchSocial: function () {
      var selfobj = this;
      var newdetails = [];
      $('.switchSocial input:checkbox').each(function () {
        var $this = $(this);
        var isChecked = $this.is(":checked");
        var value = isChecked ? "y" : "n";
        var elID = this.id;
        newdetails["" + elID] = value;
        selfobj.model.set(newdetails);
      });
    },

    setDropVal: function (e) {
      e.stopImmediatePropagation();
      var selfobj = this;
      let newdetails = {};
      let id = $(e.currentTarget).attr("id");
      let inID = $(e.currentTarget).attr("data-toChange");
      let ob = selfobj.model.get(inID);
      if(ob == null || ob == undefined){
        ob = {};
      }
      if (typeof ob === "string") {
        ob = JSON.parse(ob);
      }
      if (id === "fontSize" || id === "fontWeight") {
        ob[id] = $(e.currentTarget).val();
      } else if (id === "fontFamily") {
        ob['fontFamily'] = $(e.currentTarget).val();
        let option = $('option:selected', e.currentTarget).attr('data-key');
        selfobj.subset[inID] = selfobj.fontlist[option].variants;
        let uniqueValues = new Set(Object.values(selfobj.subset[inID]));
        if (uniqueValues.size === 1) {
            ob['fontWeight'] = Array.from(uniqueValues)[0];
        }
      }
      
      newdetails[inID] = ob;
      selfobj.model.set(newdetails);

      if (id === "fontFamily") {
        selfobj.render();
      }

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
          let ct=[];
          selfobj.fontlist.forEach(element => {
            if(!ct.includes(element.category))
            ct.push(element.category);
          });
          // console.log(ct);
          selfobj.render();
        }
      });

    },
    savethemeDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var methodt = "POST";
      var myContent = tinymce.get("termsConditions").getContent();
      this.model.set({ 'termsConditions': myContent });
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if ($("#themeDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            showResponse(e,res,'');
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    getSelectedFile: function (url, id) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      // $("."+ id).val(url);
      $("."+ id).attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      var newdetails = [];
      newdetails["" + id] = url;
      this.model.set(newdetails);
      $('.'+id).show();
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var elementID = $(e.currentTarget).attr('id');
      new readFilesView({ loadFrom: "addpage", loadController: this, elementID: elementID });
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    initializeValidate: function (e) {
      var selfobj = this;
      var feilds = {

      };
      var feildsrules = feilds;
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if (!_.isEmpty(dynamicRules)) {
      //   var feildsrules = $.extend({}, feilds, dynamicRules);

      // }
      $("#logo_width").inputmask({ regex: "[0-9]*" });
      $("#contact_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      var messages = {

      };
      $("#themeDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $('.color').minicolors({
        format: "rgb",
        opacity: true,
        change: function (value, opacity) {
          if ($(this).hasClass("subObj")) {
            let inID = $(this).attr("data-toChange");
            let ob = selfobj.model.get(inID);
            if (typeof (ob) == "string") {
              ob = JSON.parse(ob);
            }
            ob.color = value;
            let elID = $(this).attr("data-toChange");
            let newdetails = [];
            newdetails["" + elID] = ob;
            selfobj.model.set(newdetails);
          } else {
            let elID = this.id;
            let newdetails = [];
            newdetails["" + elID] = value;
            selfobj.model.set(newdetails);
          }
        },
        theme: 'bootstrap',
      });
    },
    
    fontChange:function(e){
        var selfobj= this;
        let option = $('option:selected', e.currentTarget).attr('data-key');
        selfobj.subset = selfobj.fontlist[option].variants;
        let value = $(e.currentTarget).val();
        selfobj.model.set({"fontFamily":value});
        selfobj.render();
    },

    fromEditors: function () {
      // tinyMCE.EditorManager.editors.splice(1, 1);//removing second element in array.
      // delete tinyMCE.EditorManager.editors[1];

      if (tinyMCE.activeEditor != undefined) {
        tinyMCE.activeEditor.remove("termsConditions");
      }
      //tinymce.EditorManager.editors = [];
      tinyMCE.init({
        selector: "#termsConditions",
        deprecation_warnings: false,
        removed_menuitems: 'newdocument | wordcount | sourcecode | image | media ',
        height: 300,
        plugins: ["advlist autolink link image lists charmap print preview hr anchor pagebreak save",
          "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
          " table contextmenu directionality emoticons template paste textcolor"],
        toolbar: "insertfile undo redo  | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link  | print preview  fullpage | forecolor backcolor emoticons ",

        style_formats: [{ title: "Bold text", inline: "b" },
        { title: "Red text", inline: "span", styles: { color: "#ff0000" } },
        { title: "Red header", block: "h1", styles: { color: "#ff0000" } },
        { title: "Example 1", inline: "span", classes: "example1" },
        { title: "Example 2", inline: "span", classes: "example2" },
        { title: "Table styles" },
        { title: "Table row 1", selector: "tr", classes: "tablerow1" }],

      })
      tinyMCE.init({});
    },

    setupTextArea:function(){
      var selfobj = this;
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],      
        [{ 'header': 1 }, { 'header': 2 }],            
        [{ 'direction': 'rtl' }],                         
        [{ 'size': ['small', false, 'large', 'huge'] }], 
        [{ 'align': [] }],
        ['link'],
        ['clean']                                       
      ];
      $('body').find('.footer_rich_text').each(function(index, element) {
        var editor = new Quill(element, {
            modules: {
                toolbar: __toolbarOptions
            },
            theme: 'snow'
        });

        editor.on('text-change', function(delta, oldDelta, source) {
            if (source === 'user') {
                var justHtml = editor.root.innerHTML;
      
                let newdetails = {};
                let id = $(element).attr("id");
                let inID = $(element).attr("data-toChange");
                let ob = selfobj.model.get(inID);
                if(ob == null || ob == undefined){
                  ob = {};
                }
                if (typeof ob === "string") {
                  ob = JSON.parse(ob);
                }
                ob[id] = justHtml;

                newdetails[inID] = ob;
                selfobj.model.set(newdetails);
                console.log("selfobj.model :",selfobj.model);
            }
        });
      });

      var footerEditor = new Quill($("#footer_strip_text").get(0), {
        modules: {
          imageResize: {
            displaySize: true
          },
          toolbar: {
            container: __toolbarOptions,
            handlers: {
              image: imageHandler
            }
          },
        },
        theme: 'snow'
      });

      function imageHandler() {
        var range = this.quill.getSelection();
        var value = prompt('please copy paste the image url here.');
        if (value) {
          this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
      }
      footerEditor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = footerEditor.getContents();
          var text = footerEditor.getText();
          var justHtml = footerEditor.root.innerHTML;
          selfobj.model.set({ "footer_strip_text": justHtml });
        }
      });
    },

    copyMenuLink: function(event) {
      var footerMenuContent = "{{footermenu}}";
      var tempInput = document.createElement("input");
      tempInput.value = footerMenuContent;
      document.body.appendChild(tempInput);
      tempInput.select();
      tempInput.setSelectionRange(0, 99999);
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      var copiedMessage = document.createElement("div");
      copiedMessage.className = "toolt";
      copiedMessage.textContent = "Copied";
      document.body.appendChild(copiedMessage);
      setTimeout(function() {
          document.body.removeChild(copiedMessage);
      }, 2000);
    }, 

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["header_text_layout"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
  
    render: function () {
      var selfobj = this;
      var template = _.template(themeOptionTemp);
      var fontVars = [
          { varName: 'bodyFontVar', attrName: 'body_font' },
          { varName: 'navFontVar', attrName: 'navigation_style_and_anchor' },
          { varName: 'paraFontVar', attrName: 'para_and_small_elm' },
          { varName: 'h1FontVar', attrName: 'heading_h1_style' },
          { varName: 'h2FontVar', attrName: 'heading_h2_style' },
          { varName: 'h3FontVar', attrName: 'heading_h3_style' },
          { varName: 'h4FontVar', attrName: 'heading_h4_style' },
          { varName: 'h5FontVar', attrName: 'heading_h5_style' },
          { varName: 'h6FontVar', attrName: 'heading_h6_style' }
      ];
  
      fontVars.forEach(function(fontVarObj) {
          var fontVar = selfobj.model.attributes[fontVarObj.attrName] ? selfobj.model.attributes[fontVarObj.attrName]['fontFamily'] : {};
          if(fontVar){
            var matchingKey = findMatchingKey(fontVar, selfobj.fontlist);
            if (fontVar && fontVar !== '' && fontVar !== null && fontVar !== undefined) {
                if (matchingKey !== null) {
                    selfobj.subset[fontVarObj.attrName] = selfobj.fontlist[matchingKey].variants;
                } else {
                    // console.log("No matching key found for " + fontVarObj.varName);
                }
            }
          }
      });

      function findMatchingKey(fontVar, fontList) {
        var matchingKey = null;
        for (var key in fontList) {
            if (fontList.hasOwnProperty(key)) {
                var font = fontList[key];
                if (fontVar && fontVar !== '' && fontVar === font.family) {
                    matchingKey = key;
                    break;
                }
            }
        }
        return matchingKey;
      }
  
      // Adjust your data structure accordingly if needed
      var subsetForBody = selfobj.subset ? selfobj.subset['body_font'] : [];
      var subsetForNav = selfobj.subset ? selfobj.subset['navigation_style_and_anchor'] : [];
      var subsetForPara = selfobj.subset ? selfobj.subset['para_and_small_elm'] : [];
      var subsetForH1 = selfobj.subset ? selfobj.subset['heading_h1_style'] : [];
      var subsetForH2 = selfobj.subset ? selfobj.subset['heading_h2_style'] : [];
      var subsetForH3 = selfobj.subset ? selfobj.subset['heading_h3_style'] : [];
      var subsetForH4 = selfobj.subset ? selfobj.subset['heading_h4_style'] : [];
      var subsetForH5 = selfobj.subset ? selfobj.subset['heading_h5_style'] : [];
      var subsetForH6 = selfobj.subset ? selfobj.subset['heading_h6_style'] : [];
      
      this.$el.html(template({ 
        closeItem: this.toClose, 
        "model": this.model.attributes,
        "fontlist": selfobj.fontlist,
        "subsetForBody": subsetForBody,
        "subsetForNav": subsetForNav,
        "subsetForPara": subsetForPara,
        "subsetForH1": subsetForH1,
        "subsetForH2": subsetForH2,
        "subsetForH3": subsetForH3,
        "subsetForH4": subsetForH4,
        "subsetForH5": subsetForH5,
        "subsetForH6": subsetForH6,
        "countryExtList": selfobj.countryExtList,
        "stripViewOptions": selfobj.stripViewOptions,
      }));
      
      $(".app_playground").append(this.$el);
      this.initializeValidate();
      this.setOldValues();
      $(".ws-select").selectpicker("refresh");

      if(selfobj.model.attributes.google_reCaptcha == 'yes'){
        $('body').find(".googleCaptchaCls").show();
      }else{
        $('body').find(".googleCaptchaCls").hide();
      }
      if(selfobj.model.attributes.page_banner_image){
        $('body').find(".page_banner_image").show();
      }else{
        $('body').find(".page_banner_image").hide();
      }
      if(selfobj.model.attributes.header_page_logo){
        $('body').find(".header_page_logo").show();
      }else{
        $('body').find(".header_page_logo").hide();
      }
      if(selfobj.model.attributes.logo_for_inner_pages){
        $('body').find(".logo_for_inner_pages").show();
      }else{
        $('body').find(".logo_for_inner_pages").hide();
      }
      if(selfobj.model.attributes.favicon){
        $('body').find(".favicon").show();
      }else{
        $('body').find(".favicon").hide();
      }

        $('.footerLayoutOne').hide();
        $('.footerLayoutTwo').hide();
        $('.footerLayoutThree').hide();
        $('.footerLayoutFour').hide();
        var valuetxt = selfobj.model.attributes.footer_layout;
        if(valuetxt == 'one'){
          $('.footerLayoutOne').show();
        }else if(valuetxt == 'two'){
          $('.footerLayoutTwo').show();
        }else if(valuetxt == 'three'){
          $('.footerLayoutThree').show();
        }else if(valuetxt == 'four'){
          $('.footerLayoutFour').show();
        }

        if(selfobj.model.attributes.countryCode){
          $(".countrySelect .filter-option-inner-inner").text(selfobj.model.attributes.countryCode);
        }

      setToolTip();
      this.fromEditors();
      selfobj.setupTextArea();
      return this;
    },
  });

  return themeOptionView;

});
