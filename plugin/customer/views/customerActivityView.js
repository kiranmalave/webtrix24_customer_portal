
define([
    'jquery',
    'underscore',
    'backbone',
    'Swal',
    "../../core/views/timeselectOptions",
    '../collections/customerActivityCollection',
    '../../task/views/taskSingleView',
    'text!../templates/customerActivityRow_temp.html',
    'text!../templates/customerActivity_temp.html',
    '../../menu/collections/menuCollection',
], function ($, _, Backbone, Swal, timeselectOptions, customerActivityModel, taskSingleView, customerActivityRow_temp, customerActivity_temp, menuCollection) {

    var customerActivityView = Backbone.View.extend({
        fileObj: {},
        view: 'upcoming',
        totalRec: 0,
        initialize: function (options) {
            fileObj = this;
            var selfobj = this;
            this.taskMenuID;
            $(".profile-loader").show();
            this.custName = options.customerName;
            this.totalRec = 0;
            this.render();
            this.customer_id = options.customer_id;
            this.timeselectOptions = new timeselectOptions();
            this.collection = new customerActivityModel();
            this.collection.on('add', this.addOne, this);
            this.collection.on('reset', this.addAll, this);
            this.getHistory("upcoming");
            this.menuList = new menuCollection();
            this.menuList.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
            }).done(function (res) {
                console.log("res", res);
                res.data.forEach(function (menu) {
                    if (menu.menuLink == 'task') {
                        selfobj.taskMenuID = menu.menuID;
                    }
                });
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                $(".profile-loader").hide();
            });
        },

        getHistory: function (historyType) {
            let selfobj = this;
            $("#activityRow").empty();
            this.collection.reset();
            var data = { customer_id: this.customer_id, historyType: historyType };
            this.collection.fetch({
                headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: data
            }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".profile-loader").hide();
                $('body').find(".loder").hide();
            });
        },

        events:
        {
            "click .closeModal": "closeModal",
            "click .loadView": "loadView",
        },

        UpcommingAct: function (e) {
            $(e.currentTarget).addClass('activeAcrive');
            $(".btnPast").removeClass('activeAcrive');
        },

        loadView: function (e) {
            
            let selfobj = this;
            let show = $(e.currentTarget).attr("data-page");
            selfobj.view = show;
            $(".noActivity").show();
            switch (show) {
                case "past": {
                    $(e.currentTarget).addClass('activeAcrive');
                    $('.btnUpcomming').removeClass('activeAcrive');
                    selfobj.getHistory("past");
                    break;
                }
                case "upcoming": {
                    $(e.currentTarget).addClass('activeAcrive');
                    $('.btnPast').removeClass('activeAcrive');
                    selfobj.getHistory("upcoming");
                    break;
                }
            }
        },

        lazyLoad: function(){
            let selfobj = this;
            if(this.view == "past"){
                var data = { customer_id: this.customer_id, historyType: 'past', curpage: this.collection.pageinfo.nextpage};
                this.collection.fetch({
                    headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: data
                }).done(function (res) {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".profile-loader").hide();
                    $('body').find(".loder").hide();
                });
                this.collection.on('add', this.addOne, this);
                this.collection.on('reset', this.addAll, this);
            }
        },

        closeModal: function () {
            $('#activityModal').modal('toggle');
        },

        addOne: function (objectModel) {
            let selfobj = this;
            this.totalRec = this.collection.length
            if (selfobj.totalRec == 0) {
                $(".noActivity").show();
              } else {
                $(".noActivity").hide();
              }
            objectModel.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.activity_date) });
            if(objectModel.attributes.start_date){
                objectModel.set({ "start_date": selfobj.timeselectOptions.changeTimeFormat(objectModel.attributes.start_date) });
            }
            var template = _.template(customerActivityRow_temp);
            $("#activityRow").append(template({ activityDetails: objectModel, view: selfobj.view }));
        },
        addAll: function () {
            $("#activityRow").empty();
            this.collection.forEach(this.addOne, this);
        },


        render: function () {
            var selfobj = this;
            var template = _.template(customerActivity_temp);
            this.$el.html(template({ customerActivity: selfobj.collection, name: this.custName }));
            $('#activityMedia').empty();
            $("#activityMedia").append(this.$el);
            $(".activities").scroll(function () {
                var element = $(this);
                var scrollHeight = element.prop('scrollHeight');
                var scrollTop = element.scrollTop();
                var innerHeight = element.innerHeight();
                var remainingScroll = scrollHeight - (scrollTop + innerHeight);
                let rounded = Math.round(remainingScroll);
                if(rounded <= 0){
                    selfobj.lazyLoad();
                }
              });
            setToolTip();
            $(".profile-loader").hide();
            return this;
        }
    });

    return customerActivityView;

});
