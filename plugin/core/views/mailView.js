
define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  'text!../templates/mail_temp.html',
  '../models/sendEmailModel',
  '../../companyMaster/models/companySingleModel',
  "../../emailMaster/collections/emailMasterCollection",
], function ($, _, Backbone, Swal, mail_temp, sendEmailModel, infosettingsModel, emailsTemplateList) {
  var mailView = Backbone.View.extend({
    model: '',
    emailMasterList: '',
    enteredEmailsArray: [],
    totalEmailIDs: '',
    ccArray: [],
    bccArray: [],
    attachmentArray: [],
    toField: true,
    ccField: true,
    BccField: true,
    editor: {},
    toClose: 'sendEmailView',
    initialize: function (options) {
      var selfobj = this;
      // $(".customMail").removeChild(); 
      this.enteredEmailsArray = [];
      this.bccArray = [];
      this.ccArray = [];
      this.model = new sendEmailModel();
      console.log('options : ',options);
      this.invoicePdfName = options.invoicePDf;
      this.subject = options.subject;
      this.loadFrom = options.loadFrom ? options.loadFrom : null;
      this.scanDetails = options.searchmail;
      this.invoiceObj = options.invoiceObj ? options.invoiceObj : null;
      this.infoSettingModel = new infosettingsModel();
      selfobj.emailMasterList = new emailsTemplateList();
      $(".maxActive").hide();
      $(".buttonDetails.BCC").hide();
      selfobj.emailMasterList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: 'active' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });
      this.infoSettingModel.set({ infoID: DEFAULTCOMPANY });
      this.infoSettingModel.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      this.model.attributes.toField = [];
      $('#toField').val('');
      if (options.customer_mail != '' && options.customer_mail != '-') {
        this.enteredEmailsArray.push(options.customer_mail);
        // var htmlToAppend = '<span class="tm-tag-eml"><span>' + options.customer_mail + '</span> <a class="removeMail" data-rem-type= "to" data-to-remove = ' + options.customer_mail + ' >x</a></span>';
        // $(htmlToAppend).insertBefore('#toField');
        this.model.attributes.toField.push(options.customer_mail);
        this.customerEmail = options.customer_mail;
        // $('#toField').val(options.customer_mail);
      } else {
        this.customerEmail = "";
      }
      selfobj.model.set({ 'subject': '' });
      if (selfobj.subject && selfobj.subject != '' ) {
        selfobj.model.set({ 'subject': selfobj.subject });
      }
      selfobj.model.set({ 'mail_description': '' });
      selfobj.render();
    },
    events:
    {
      "click .multiOptionSel": "multioption",
      "change .textchange": "updateOtherDetails",
      "change .getTemplate": "updateTemplateDetails",
      "click .selectMail": "setTosendEmail",
      "click .sendEmail": "sendEmail",
      "input #toField": "getCustomerEmailsList",
      "input #cc": "setCc",
      "input #bcc": "setBcc",
      "input #cc": "setCc",
      "click .selectCc": "setToCc",
      "click .selectBcc": "setToBcc",
      "click .setFocus": "getFocus",
      "click .removeMail": "removeMail",
      "click .closeFull": "closeFull",
      "click .minimize": "minimize",
      "click .close": "mailHide",
      "click .openFull": "maximize",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .ccBtn": "openComposeMail",
      "click .bccBtn": "displayList",
      "change #fileInputValue": "fileInput",
      "click .removeAttachment": "removeAttachment",
      "blur #toField": "closeSuggestionTo",
      "blur #cc": "closeSuggestionCc",
      "blur #bcc": "closeSuggestionBcc",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    attachEvents: function () {
      this.$el.off("change", ".textchange", this.updateOtherDetails);
      this.$el.on("change", ".textchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".sendEmail", this.sendEmail);
      this.$el.on("click", ".sendEmail", this.sendEmail.bind(this));
      this.$el.off('input', '#toFField', this.getCustomerEmailsList);
      this.$el.on('input', '#toField', this.getCustomerEmailsList.bind(this));
      this.$el.off('change', '.getTemplate', this.updateTemplateDetails);
      this.$el.on('change', '.getTemplate', this.updateTemplateDetails.bind(this));
      this.$el.off('input', '#cc', this.setCc);
      this.$el.on('input', '#cc', this.setCc.bind(this));
      this.$el.off('input', '#bcc', this.setBcc);
      this.$el.on('input', '#bcc', this.setBcc.bind(this));
      this.$el.off('click', '.selectMail', this.setTosendEmail);
      this.$el.on('click', '.selectMail', this.setTosendEmail.bind(this));
      this.$el.off('click', '.selectCc', this.setToCc);
      this.$el.on('click', '.selectCc', this.setToCc.bind(this));
      this.$el.off('click', '.minimize', this.minimize);
      this.$el.on('click', '.minimize', this.minimize.bind(this));
      this.$el.off('click', '.selectBcc', this.setToBcc);
      this.$el.on('click', '.selectBcc', this.setToBcc.bind(this));
      this.$el.off('click', '.removeMail', this.removeMail);
      this.$el.on('click', '.removeMail', this.removeMail.bind(this));
      this.$el.off('click', '.setFocus', this.getFocus);
      this.$el.on('click', '.setFocus', this.getFocus.bind(this));
      this.$el.off("change", ".textchange", this.updateOtherDetails);
      this.$el.on("change", ".textchange", this.updateOtherDetails.bind(this));
      this.$el.off('click', '.close', this.mailHide);
      this.$el.on('click', '.close', this.mailHide.bind(this));
      this.$el.off('click', '.openFull', this.maximize);
      this.$el.on('click', '.openFull', this.maximize.bind(this));
      this.$el.off('click', '.closeFull', this.closeFull);
      this.$el.on('click', '.closeFull', this.closeFull.bind(this));
      this.$el.off('click', '.ccBtn', this.openComposeMail);
      this.$el.on('click', '.ccBtn', this.openComposeMail.bind(this));
      this.$el.off('click', '.bccBtn', this.displayList);
      this.$el.on('click', '.bccBtn', this.displayList.bind(this));
      this.$el.off('change', '#fileInputValue', this.fileInput);
      this.$el.on('change', '#fileInputValue', this.fileInput.bind(this));
      this.$el.off('click', '.removeAttachment', this.removeAttachment);
      this.$el.on('click', '.removeAttachment', this.removeAttachment.bind(this));
      this.$el.off('blur', '#toField', this.closeSuggestionTo);
      this.$el.on('blur', '#toField', this.closeSuggestionTo.bind(this));
      this.$el.off('blur', '#cc', this.closeSuggestionCc);
      this.$el.on('blur', '#c', this.closeSuggestionCc.bind(this));
      this.$el.off('blur', '#bcc', this.closeSuggestionBcc);
      this.$el.on('blur', '#bcc', this.closeSuggestionBcc.bind(this));
    },
    updateTemplateDetails: function (e) {
      // e.stopPropagation();
      var selfobj = this;
      let emailCnt = "";
      if (e != undefined) {
        var selfobj = this;
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        let cost = $("<div>");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        // filterOption.set(newdetails);
        var emailItem = selfobj.emailMasterList.models.find((item) => {
          return item && item.attributes.tempID == valuetxt;
        });
        emailCnt = emailItem ? emailItem.attributes.emailContent : undefined;
        emailTempName = emailItem ? emailItem.attributes.tempName : undefined;
      }
      if (emailCnt != "") {
        $("#mail_description").empty().append(emailCnt);
        selfobj.model.set({ 'mail_description': emailCnt });
        $("#subject").val(emailTempName);
        selfobj.model.set({ 'subject': emailTempName });
      } else {
        selfobj.model.set({ 'subject': '' });
        if (selfobj.subject && selfobj.subject != '' ) {
          selfobj.model.set({ 'subject': selfobj.subject });
        }
        selfobj.model.set({ 'mail_description': '' });
      }
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean'],
        ['image']                              // remove formatting button
      ];

      selfobj.editor = new Quill($("#mail_description").get(0), {
        modules: {
          imageResize: {
            displaySize: true,

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
      // editor.setHTML('hello ');

      selfobj.editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = selfobj.editor.getContents();
          var text = selfobj.editor.getText();
          var justHtml = selfobj.editor.root.innerHTML;
          selfobj.model.set({ 'mail_description': justHtml });
        }
      });
      // $("#mail_description").addClass("Hellod");
      // $("#mail_description").html(emailCnt);
    },
    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr('id');
      var newdetails = [];

      if (toID != 'toField' && toID != 'cc' && toID != 'bcc') {
        newdetails["" + toID] = valuetxt;
        this.model.set(newdetails);
      } else {
        switch (toID) {
          case 'toField':
            this.toField = true;
            this.ccField = false;
            this.BccField = false;
            if (validateEmail(valuetxt)) {
              if (this.enteredEmailsArray.indexOf(valuetxt) == -1) {
                var htmlToAppend = '<span class="tm-tag-eml"><span>' + valuetxt + '</span> <a data-rem-type = "to" class= "removeMail" data-to-remove = ' + valuetxt + ' >x</a></span>';
                this.enteredEmailsArray.push(valuetxt);
                this.model.set('toField', this.enteredEmailsArray);
                $(htmlToAppend).insertBefore('#toField');
                $(".toSend").hide();
              }
              $(e.currentTarget).val('')
            }
            break;

          case 'cc':
            this.toField = false;
            this.ccField = true;
            this.BccField = false;
            if (validateEmail(valuetxt)) {
              if (this.ccArray.indexOf(valuetxt) == -1) {
                var htmlToAppend = '<span class="tm-tag-cc"><span>' + valuetxt + '</span> <a data-rem-type = "cc" class= "removeMail" data-to-remove = ' + valuetxt + ' >x</a></span>';
                this.ccArray.push(valuetxt);
                this.model.set('cc', this.ccArray);
                $(htmlToAppend).insertBefore('#cc');
                $(".toCc").hide();
              }
              $(e.currentTarget).val('')
            }
            break;

          case 'bcc':
            this.toField = true;
            this.ccField = false;
            this.BccField = true;
            if (validateEmail(valuetxt)) {
              if (this.bccArray.indexOf(valuetxt) == -1) {
                var htmlToAppend = '<span class="tm-tag-bcc"><span>' + valuetxt + '</span> <a data-rem-type = "bcc" class= "removeMail" data-to-remove = ' + valuetxt + ' >x</a></span>';
                this.bccArray.push(valuetxt);
                this.model.set('bcc', this.bccArray);
                $(htmlToAppend).insertBefore('#bcc');
                $('.toBcc').hide();
              }
            }
            break;
          default:
            break;
        }
      }
      function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    },
    getFocus: function (e) {
      e.stopPropagation();
      var el = $(e.currentTarget).find('input');
      var id = $(el).attr('id');
      $(el).focus();
      if (!id) {
        this.hideCC("hide");
        this.hideToField("hide");
        this.hideBcc("hide");
      } else {
        switch (id) {
          case "cc":
            this.hideCC("showAll");
            this.hideToField("hide");
            this.hideBcc("hide");
            break;
          case "bcc":
            this.hideCC("hide");
            this.hideToField("hide");
            this.hideBcc("showAll");
            break;
          case "toField":
            this.hideCC("hide");
            this.hideToField("showAll");
            this.hideBcc("hide");
            break;
          case "subject":
            this.hideCC("hide");
            this.hideToField("hide");
            this.hideBcc("hide");
            break;

          default:
            break;
        }
      }

    },
    openComposeMail: function (e) {
      $('.Cc').addClass('active');
      $(e.currentTarget).addClass('activeCc');
      $(".buttonDetails").hide();
      $(".buttonDetails.BCC").show();
    },
    displayList: function (e) {
      $('.Bcc').addClass('active');
      $(e.currentTarget).addClass('activebcc');
    },
    getCustomerEmailsList: function (e) {
      var selfobj = this;
      var email = $(e.currentTarget).val();
      var inputLength = email.length;
      $(e.currentTarget).width(inputLength * 12);
      $(".toSend").show();
      var dropdownContainer = $(".toSend");
      if (email != "") {
        $.ajax({
          url: APIPATH + 'getCustomerEmailList',
          method: 'POST',
          data: { text: email },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              result = [];
              // $.each(res.data, function (index, value) {

              //   dropdownContainer.append('<div class="dropdown-item selectMail" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
              // });
              $.each(res.data, function (index, value) {
                if (selfobj.enteredEmailsArray.indexOf(value.email) === -1) {
                  dropdownContainer.append('<div class="dropdown-item selectMail" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
                } else {
                  dropdownContainer.append('<div class="dropdown-item selectMail disableTO" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
                }
              });

              dropdownContainer.show();
            } else {
              dropdownContainer.hide();
            }
          }
        });

        $("#toField").on("keyup", function (event) {
          if (event.keyCode === 13) {

            var enteredEmail = $(this).val();

            if (enteredEmail) {
              if (validateEmail(enteredEmail)) {
                var htmlToAppend = '<span class="tm-tag-eml"><span>' + enteredEmail + '</span> <a data-rem-type = "to" class= "removeMail" data-to-remove = ' + enteredEmail + ' >x</a></span>';
                // $(".tm-input").append(htmlToAppend);
                $("#toFeild").val('');
                if (selfobj.enteredEmailsArray.indexOf(enteredEmail) == -1) {
                  selfobj.enteredEmailsArray.push(enteredEmail);
                  $(htmlToAppend).insertBefore('#toField');
                  selfobj.model.set({ "toField": selfobj.enteredEmailsArray });
                }
                $(this).val("");
                $(".toSend").hide();
              } else {
                // $('#toFeild').next('.error-message').text(errorMessage).addClass('error');
              }
            }
          } else {
            var enteredEmail = $(this).val();
            var length = $('.tm-input span').length;
            if (length == 0) {
              if (enteredEmail.length == 0) {
                selfobj.enteredEmailsArray.pop(enteredEmail);
                selfobj.model.attributes.toField.pop(enteredEmail);
              }
            }
          }
        });

        $("#toField").on("change", function (event) { });
        function validateEmail(email) {
          var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(email);
        }
      } else {
        dropdownContainer.hide();
      }
    },
    setCc: function (e) {
      selfobj = this;
      var email = $(e.currentTarget).val();
      var inputLength = email.length;
      $(e.currentTarget).width(inputLength * 10);
      $(".toCc").hide();
      var dropdownContainer = $(".toCc");
      if (email != "") {
        $.ajax({
          url: APIPATH + 'getCustomerEmailList',
          method: 'POST',
          data: { text: email },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              result = [];
              $.each(res.data, function (index, value) {
                if (selfobj.ccArray.indexOf(value.email) === -1) {
                  dropdownContainer.append('<div class="dropdown-item selectCc" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
                } else {
                  dropdownContainer.append('<div class="dropdown-item selectCc disableCC" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
                }
              });
              dropdownContainer.show();
            } else {
              dropdownContainer.hide();
            }
          }
        });
      }
      $("#cc").on("keyup", function (event) {
        if (event.keyCode === 13) {
          var enteredEmail = $(this).val();
          if (enteredEmail) {
            if (validateEmail(enteredEmail)) {
              var htmlToAppend = '<span class="tm-tag-cc"><span>' + enteredEmail + '</span> <a data-rem-type= "cc"  class= "removeMail" data-to-remove = ' + enteredEmail + ' >x</a></span>';
              // $(".tm-input-cc").append(htmlToAppend);

              $("#cc").val('');
              if (selfobj.ccArray.indexOf(enteredEmail) === -1) {
                selfobj.ccArray.push(enteredEmail);
                $(htmlToAppend).insertBefore('#cc');
                selfobj.model.set({ "cc": selfobj.ccArray });
              }
              $(this).val("");
            }
          }
        }
        // dropdownContainer.hide();

      });
      function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    },
    setBcc: function (e) {
      selfobj = this;

      var email = $(e.currentTarget).val();
      var inputLength = email.length;
      $(e.currentTarget).width(inputLength * 10);

      var dropdownContainer = $(".toBcc");
      if (email != "") {
        $.ajax({
          url: APIPATH + 'getCustomerEmailList',
          method: 'POST',
          data: { text: email },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              result = [];


              $.each(res.data, function (index, value) {
                if (selfobj.bccArray.indexOf(value.email) === -1) {
                  dropdownContainer.append('<div class="dropdown-item selectBcc" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
                } else {
                  dropdownContainer.append('<div class="dropdown-item selectBcc disableCC" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
                }
              });

              dropdownContainer.show();
            } else {
              dropdownContainer.hide();
            }
          }
        });
      }

      $("#bcc").on("keyup", function (event) {
        if (event.keyCode === 13) {
          var enteredEmail = $(this).val();
          if (enteredEmail) {
            if (validateEmail(enteredEmail)) {
              var htmlToAppend = '<span class="tm-tag-bcc"><span>' + enteredEmail + '</span> <a class= "removeMail" data-rem-type= "bcc" data-to-remove = ' + enteredEmail + ' >x</a></span>';
              // $(".tm-input-bcc").append(htmlToAppend);
              // $(htmlToAppend).insertBefore('#bcc');
              $("#bcc").val('');
              if (selfobj.bccArray.indexOf(enteredEmail) === -1) {
                selfobj.bccArray.push(enteredEmail);
                $(htmlToAppend).insertBefore('#bcc');
                selfobj.model.set({ "bcc": selfobj.bccArray });
              }
              $(this).val("");
            } else {
            }
          }
        }
        // dropdownContainer.hide();
      });
      function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    },
    setTosendEmail: function (e) {
      let selfobj = this;
      // if(selfobj.model.attributes.toField){
      //   this.totalEmailIDs = selfobj.model.attributes.toField.length;

      // }else{
      //   this.totalEmailIDs = '';
      // }

      var email = $(e.currentTarget).text();
      var htmlToAppend = '<span class="tm-tag-eml"><span>' + email + '</span> <a class="removeMail" data-rem-type= "to" data-to-remove = ' + email + ' >x</a></span>';
      // var totlaEmail = '<span class="totalemail">' + totalEmailIDs + 'more</span>';
      $(".toSend").hide();
      if (selfobj.enteredEmailsArray.indexOf(email) === -1) {
        selfobj.enteredEmailsArray.push(email);
        $(htmlToAppend).insertBefore('#toField');
        // $(totlaEmail).insertBefore('#toField');   
        selfobj.model.set({ "toField": selfobj.enteredEmailsArray });
      }
      $("#toField").val('');
    },
    setToCc: function (e) {
      let selfobj = this;
      var email = $(e.currentTarget).text();
      var htmlToAppend = '<span class="tm-tag-cc"><span>' + email + '</span> <a class="removeMail" data-rem-type= "cc" data-to-remove = ' + email + ' >x</a></span>';
      $(".toCc").hide();
      if (selfobj.ccArray.indexOf(email) === -1) {
        selfobj.ccArray.push(email);
        $(htmlToAppend).insertBefore('#cc');
        selfobj.model.set({ "cc": selfobj.ccArray });
      }
      $("#cc").val('');
    },
    setToBcc: function (e) {
      let selfobj = this;
      var email = $(e.currentTarget).text();
      var htmlToAppend = '<span class="tm-tag-bcc"><span>' + email + '</span> <a class="removeMail" data-rem-type= "bcc" data-to-remove = ' + email + ' >x</a></span>';
      if (selfobj.bccArray.indexOf(email) === -1) {
        $(htmlToAppend).insertBefore('#bcc');
        selfobj.bccArray.push(email);
        selfobj.model.set({ "bcc": selfobj.bccArray });
      }
      $(".toBcc").hide();
      $("#bcc").val('');
    },
    hideToField: function (type) {
      var selfobj = this;
      if (type == "showAll") {
        $(".email-displayed").remove();
        $(".tm-input").children("span").css({ "display": "inline-block" });
        $("#toField").show();
      } else {
        let emailLength = 0;
        if (selfobj.model.attributes.toField != undefined) {
          emailLength = selfobj.model.attributes.toField.length;
        } else {
          emailLength = 0;
        }
        if (emailLength > 1) {
          $(".tm-input").children("span").css({ "display": "none" });
          let totalEmail = '<span class="totalemail email-displayed">' + (emailLength - 1) + ' more </span>';
          $(".tm-input").append(totalEmail);
          $(".tm-input").children(':first-child').css({ "display": "inline-block" });
          $("#toField").hide();
        } else {
          $('.totalemail.email-displayed').hide();
        }
      }
    },
    hideCC: function (type) {
      var selfobj = this;
      if (type == "showAll") {
        $(".email-displayedCC").remove();
        $(".tm-input-cc").children("span").css({ "display": "inline-block" });
        $("#cc").show();
      } else {
        let emailLength = 0;
        if (selfobj.model.attributes.cc != undefined) {
          emailLength = selfobj.model.attributes.cc.length;
        } else {
          emailLength = 0;
        }
        if (emailLength > 1) {
          $(".email-displayedCC").remove();
          $(".tm-input-cc").children("span").css({ "display": "none" });
          let totalEmail = '<span class="totalemailCC email-displayedCC">' + (emailLength - 1) + ' more </span>';
          $(".tm-input-cc").append(totalEmail);
          $(".tm-input-cc").children(':first-child').css({ "display": "inline-block" });
          $("#cc").hide();
        } else {
          $('.totalemailCC.email-displayedCC').hide();
        }
      }
    },
    hideBcc: function (type) {
      var selfobj = this;
      if (type == "showAll") {
        $(".email-displayedBcc").remove();
        $(".tm-input-bcc").children("span").css({ "display": "inline-block" });
        $("#bcc").show();
      } else {
        let emailLength = 0;
        if (selfobj.model.attributes.bcc != undefined) {
          emailLength = selfobj.model.attributes.bcc.length;
        } else {
          emailLength = 0;
        }
        if (emailLength > 1) {
          $(".email-displayedBcc").remove()
          $(".tm-input-bcc").children("span").css({ "display": "none" });
          let totalEmail = '<span class="displayedBcc email-displayedBcc">' + (emailLength - 1) + ' more </span>';
          $(".tm-input-bcc").append(totalEmail);
          $(".tm-input-bcc").children(':first-child').css({ "display": "inline-block" });
          $("#bcc").hide();
        } else {
          $('.displayedBcc.email-displayedBcc').hide();
        }
      }
    },
    removeMail: function (e) {
      var selfobj = this;
      var emailSpan = $(e.currentTarget).attr('data-to-remove');
      var remType = $(e.currentTarget).attr('data-rem-type');
      switch (remType) {
        case 'to':
          $(e.currentTarget).closest('.tm-tag-eml').remove();
          selfobj.model.attributes.toField = selfobj.model.attributes.toField.filter(function (emails) {
            return emails !== emailSpan;
          });
          selfobj.enteredEmailsArray = selfobj.enteredEmailsArray.filter(function (emails) {
            return emails !== emailSpan;
          });

          break;

        case 'cc':
          $(e.currentTarget).closest('.tm-tag-cc').remove();
          selfobj.model.attributes.cc = selfobj.model.attributes.cc.filter(function (emails) {
            return emails !== emailSpan;
          });
          selfobj.ccArray = selfobj.ccArray.filter(function (emails) {
            return emails !== emailSpan;
          });

          break;

        case 'bcc':
          $(e.currentTarget).closest('.tm-tag-bcc').remove();
          selfobj.model.attributes.bcc = selfobj.model.attributes.bcc.filter(function (emails) {
            return emails !== emailSpan;
          });
          selfobj.bcc = selfobj.bcc.filter(function (emails) {
            return emails !== emailSpan;
          });
          break;

        default:
          break;
      }
    },
    // --- HANDLE SEND EMAIL OVERLAY ---
    mailHide: function (e) {
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActive');
    },
    maximize: function () {
      $(".opercityBg").show();
      $(".customMail").show();
      $(".customMailMinimize").hide();
      $('.customMail').addClass('maxActive');
      $('.openFull').remove('maxActive');
      $(".closeFull").show();
      $('.openFull').remove('maxActiveRemove');
    },
    minimize: function () {
      $(".customMail").hide();
      $(".customMailMinimize").show();
      $(".opercityBg").hide();
      $('.openFull').addClass('maxActiveRemove');
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
    },
    closeFull: function () {
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $(".closeFull").hide();
      $(".opercityBg").hide();
      $(".maxActive").hide();
      // var element = document.querySelector(".openFull");
      // element.classList.remove("maxActive");
    },
    closeSuggestionTo: function () {
      setTimeout(function () {
        $('.toSend').hide();
      }, 500);
    },
    closeSuggestionCc: function () {
      setTimeout(function () {
        $('.toSend').hide();
      }, 500);
    },
    closeSuggestionBcc: function () {
      setTimeout(function () {
        $('.toSend').hide();
      }, 500);
    },
     // UPLOAD ATTACHMENTS
    fileInput: function (event) {
      var selfobj = this;
      const selectedFile = event.target.files[0];
      const fileSizeKB = selectedFile.size / 1024;
      textContent = selectedFile.name + ' (' + fileSizeKB.toFixed(2) + ' KB)';
      var attmt = UPLOADS + '/temp-attachment/' + selectedFile.name;
      var formData = new FormData();
      formData.append('fileInputValue', selectedFile);
      if (!selfobj.attachmentArray.some(item => item.fileName === selfobj.invoicePdfName)) {
        $.ajax({
          url: APIPATH + 'uploadAttachment',
          method: 'POST',
          datatype: 'JSON',
          data: formData,
          contentType: false,
          processData: false,
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") showResponse(event, res, '');
            if (res.flag == "S") {
              showResponse(event, res, '');
              selfobj.attachmentArray.push({
                'path': "temp-attachment/",
                'fileName': selectedFile.name,
              });
              const downloadLink = $('<a>')
                .attr('href', URL.createObjectURL(selectedFile))
                .attr('download', selectedFile.name)
                .text(textContent);

              // Append the download link to the uploadedFilesList
              $(".uploadedFilesList").append(
                $('<div class="uploadedFile">').append(
                  $('<span>').append(downloadLink),
                  $('<button type="button" data-path="temp-attachment/" data-fileName="' + selectedFile.name + '" class="btn removeAttachment">')
                    .append('<i class="material-icons"> clear</i>')
                )
              );
              // Remove any existing click event handler before attaching a new one
              downloadLink.off('click').on('click', function (event) {
                event.stopPropagation(); // Prevent other click events from triggering
                // Perform the download
                $(this).get(0).click();
              });
            } else {
              showResponse('', { "flag": "F", "msg": "failed to upload..!" }, '');
            }
          }
        });
      }
    },
    // REMOVE ATTACHMENTS
    removeAttachment: function (e) {
      e.stopImmediatePropagation();
      var selfobj = this;
      selfobj.invoicePdfName = $(e.currentTarget).attr('data-fileName');
      var filePath = $(e.currentTarget).attr('data-path');
      var attmt = UPLOADS + '/' + filePath + '/' + selfobj.invoicePdfName;
      $.ajax({
        url: APIPATH + 'removeEmailAttachments/' + selfobj.invoicePdfName,
        method: 'GET',
        datatype: 'JSON',
        data: { 'filePath': filePath },
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            var alFile = selfobj.attachmentArray.find((file) => {
              if (file.fileName == selfobj.invoicePdfName) {
                return file;
              }
            });
            showResponse('', { "flag": "S", "msg": "Attachement removed..! - " + selfobj.invoicePdfName }, '');
            selfobj.attachmentArray.pop(alFile);
            let section = $(e.currentTarget).closest(".uploadedFile");
            section.remove();
          } else {
            showResponse('', { "flag": "F", "msg": "Attachement removed..! - " + selfobj.invoicePdfName }, '');
          }
        }
      });
    },
    // SEND EMAIL
    sendEmail: function (e) {
      e.preventDefault();
      let selfobj = this;
      var methodt = "POST";
      selfobj.attachmentArray = JSON.stringify(selfobj.attachmentArray);
      selfobj.model.set({ 'attachmentArray': selfobj.attachmentArray });
      // var sendEmail = true;
      // if (this.model.get('subject') == '' || this.model.get('subject') == null) {
      //   if (!confirm('Send this message without a subject?') == true){
      //     sendEmail = false;
      //   }
      // } 
      // if (this.model.get('mail_description') == '' || this.model.get('mail_description') == null) {
      //   if (!confirm('Send this message without a text in the body?') == true){
      //     sendEmail = false;
      //   }
      // } 
          // Subject Validation (Revised)
      let subject = this.model.get('subject');
      if (subject === '' || subject === null) {
        alert("Please enter a subject for your email."); 
        return; 
      }
      if (this.model.get('mail_description') == '' || this.model.get('mail_description') == null) {
        if (!confirm('Send this message without a text in the body?')) {
          return; 
        }
      }

      // if(!sendEmail){return}; 
      $(e.currentTarget).html("<span>Sending..</span>");
      $(e.currentTarget).attr("disabled", "disabled");
      this.model.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: methodt
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "S") {
          $(e.currentTarget).html("<span>Sent</span>");
          selfobj.model.clear();
          $(".customMail").hide();
          if (selfobj.loadFrom == 'invoice') {
            selfobj.invoiceObj.updateMailFlags();
          }else if(selfobj.loadFrom == 'customer'){
            selfobj.scanDetails.filterSearch();
          }
        } else {
          showResponse(e, res, "Send");
          $(e.currentTarget).attr("disabled", "");
        }
      });
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        toField: {
          required: true,
        },
        subject: {
          required: true,
        },
      };
      var feildsrules = feilds;
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if (!_.isEmpty(dynamicRules)) {

      //   var feildsrules = $.extend({}, feilds, dynamicRules);
      //   // var feildsrules = {
      //   // ...feilds,
      //   // ...dynamicRules
      //   // };
      // }
      var messages = {
        toField: "Please enter recievers email",
        subject: "Please Enter subject ",

      };
      $("#sendmail").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    render: function () {
      var selfobj = this;
      var source = mail_temp;
      var template = _.template(source);
      this.$el.html(template({ "emailMasterList": selfobj.emailMasterList.models, cutomerMail: this.customerEmail, infoSetting: this.infoSettingModel.attributes,'subject':selfobj.model.get('subject') }));
      $('#customMail').empty();
      $("#customMail").append(this.$el);

      var truncateElements = document.querySelectorAll('.truncate');
      truncateElements.forEach(function (element) {
        var maxLength = 60;
        var text = element.textContent;
        if (text.length > maxLength) {
          element.textContent = text.substring(0, maxLength) + '...';
        }
      });
      this.initializeValidate();
      $(window).click(function () {
        $('.toSend').hide();
        // selfobj.hideToField("hide");
        // selfobj.hideCC("hide");
        // selfobj.hideBcc("hide");
      });
      selfobj.updateTemplateDetails();
      // $(".ws-select").selectpicker();
      // $(".ws-select").selectpicker("refresh");
      $('body').off('change', '.getTemplate');
      if (selfobj.invoicePdfName != undefined) {
        var download = UPLOADS + '/temp-invoice/' + selfobj.invoicePdfName;

        if (!selfobj.attachmentArray.some(item => item.fileName === selfobj.invoicePdfName)) {
          selfobj.attachmentArray.push({
            'path': "temp-invoice/",
            'fileName': selfobj.invoicePdfName,
          });
        }

        var downloadLink = $('<a>')
          .attr('href', download)
          .attr('target', '_blank')
          .text(selfobj.invoicePdfName);
        $(".uploadedFilesList").append(
          $('<div class="uploadedFile">').append(
            $('<span>').append(downloadLink),
            $('<button type="button" data-path="temp-invoice/" data-fileName="' + selfobj.invoicePdfName + '" class="btn  removeInvoicePDF removeAttachment">')
              .append('<i class="material-icons"> clear</i>')
          )
        );
      }
      selfobj.attachEvents();
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });
  return mailView;
});
