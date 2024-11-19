
define([
    'jquery',
    'underscore',
    'backbone',
    'Swal',
    "../../core/views/timeselectOptions",
    '../collections/categoryCollection',
    '../views/categorySingleView',
    'text!../templates/subCategoryRow_temp.html',
    'text!../templates/subCategory_temp.html',
], function ($, _, Backbone,Swal, timeselectOptions, categoryCollection, categorySingleView, subCategoryRow_temp, subCategory_temp) {

    var subCategoryView = Backbone.View.extend({
        fileObj : {},
        initialize: function (options) {
            fileObj = this;
            var selfobj = this;
            this.taskMenuID ;
            this.totalrec = 0;
            $(".profile-loader").show();
            this.catName = options.catName;
            this.render();
            this.category_id = options.category_id;
            this.category_slug = options.categorySlug;
            this.timeselectOptions = new timeselectOptions();
            this.collection = new categoryCollection();
            this.collection.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', parent_id : this.category_id }
              }).done(function (res) {
                if (res.flag == "F") {
                  Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
                } 
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                this.totalrec = res.paginginfo.totalRecords;
                if(selfobj.totalrec == 0){
                  $('.activities').hide();
                  $('.noCategoryRec').show();
                }else{
                  $('.activities').show();
                  $('.noCategoryRec').hide();
                }
                $(".popupLoader").hide();
                $('body').find(".loder").hide();                
            });
            this.collection.on('add', this.addOne, this);
            this.collection.on('reset', this.addAll, this);
            this.render();
            this.setupSortable();
        },

        events:
        { },

        addOne: function (objectModel) {
            var selfobj = this;
            var template = _.template(subCategoryRow_temp);
            selfobj.totalrec = selfobj.collection.length;
            $("#activityRow").append(template({ categoryDetails: objectModel }));
        },
        addAll: function () { 
            this.collection.sort();
            $("#activityRow").empty();
            this.collection.forEach(this.addOne, this);
        },

        setupSortable: function(event) {
            var selfobj = this;
            var $elm = $("#activityRow");
            var isSort = $elm.sortable("instance");
            if (isSort == undefined) {
                $elm.sortable({
                    placeholder: "ui-state-highlight",
                    forcePlaceholderSize: true,
                    update: function(event, ui) {
                      setTimeout(function() {
                        selfobj.savePositions(event);
                      }, 1000);
                    }
                });
            } else {
                $elm.sortable("refresh");
            }
        },

        savePositions: function () {
            var selfobj = this;
            var action = "changePositions";
            var serializedData = $("#activityRow .subCategories").map(function () {
              return $(this).data("categoryid");
            }).get();
            console.log(serializedData);
            $.ajax({
              url: APIPATH + 'categoryIndexUpdate',
              method: 'POST',
              data: { action: action, menuIDs: serializedData },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F") {
                  Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
                } 
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              }
            });
          },


        render: function () {
            var selfobj = this;
            var template = _.template(subCategory_temp);
            this.$el.html(template({categoryName: this.catName}));
            $('#activityMedia').empty();
            $("#activityMedia").append(this.$el);
            setToolTip();
            $(".profile-loader").hide();
            return this;
        }
    });

    return subCategoryView;

});
