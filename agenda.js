(function() {
    "use strict";

    var Mongoose = require("mongoose");
    var WatchJS = require("watchjs");
    var watch = WatchJS.watch;

    function dateParser(date) {
        var date = new Date(date);
        return {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            weekDay: date.getDay()
        }
    }

    function Calendar(user) {

        // user data

        this.user = user;
        this.week = [];

        //date Models of today

        this.dateModel = new Date();
        this.weekDay = this.dateModel.getDay();
        this.day = this.dateModel.getDate();
        this.month = this.dateModel.getMonth();
        this.year = this.dateModel.getFullYear();
        this.fistWeekDay = this.day - this.weekDay;

        //database

        this.db = {
            connection: false,
            connected: false
        }

        this.CalendarSchema = Mongoose.Schema({
            id: String,
            user: String,
            event: String,
            date: String
        });
        this.calendarModel = Mongoose.model("calendar", this.CalendarSchema);

        this.init();
    }

    GLOBAL['Calendar'] = Calendar;

    Calendar.prototype = {
        init: function() {
            var self = this;
            this.db.connection = Mongoose.connection;

            this.db.connection.on("error", console.error);

            this.db.connection.once("open", function() {
                self.db.connected = true;
            });

            Mongoose.connect("mongodb://localhost/foca");

            this.generateWeek();

        },
        generateWeek: function() {
            var self = this;
            watch(this.db, "connected", function() {
                self.calendarModel.find({
                    user: self.user
                }, function(err, results) {

                	var week = [{},{},{},{},{},{},{}];

                    var weekEvents = [];

                    for (var i in results) {
                        var event = results[i];
                        var date = dateParser(event.date);
                        if ((date.day >= self.fistWeekDay && date.day <= self.fistWeekDay + 6) || date.month == self.month) {
                            weekEvents.push({
                                name: event.event,
                                date: date
                            });
                        }
                    }

                    for (var j in weekEvents) {
                        var weekEvent = weekEvents[j];
                        var weekDay = weekEvent.date.day - self.fistWeekDay

                        week[weekDay].name = weekEvent.name;

                        self.week = week;

                    }

                });
            });
        },
        getWeek: function() {
            return this.week;
        },
        addEvent: function(eventId, date) {
            var self = this;

            if (date == "TODAY") {
                date = this.dateModel.toJSON();
            }

            watch(this.db, "connected", function() {
                var newEvent = new self.calendarModel({
                    user: self.user,
                    event: eventId,
                    date: date
                });

                var id = newEvent["_id"];
                
                newEvent.id = id;
                newEvent.save();
            })
        },
        removeEvent: function(eventID){
        	this.calendarModel.remove({id:eventID}, function(){});
        }
    }

}())

module.exports = {
	calendar: Calendar
}