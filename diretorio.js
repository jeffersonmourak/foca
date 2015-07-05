(function() {

    "use strict";

    var Mongoose = require("mongoose");

    function questionDirectory() {

        this.db = false;
        this.connected = false;

        this.questionSchema = Mongoose.Schema({
            id: Number,
            user: String,
            question: String
        });
        this.questionModel = Mongoose.model("question", this.questionSchema);

        this.init();
    }

    questionDirectory.prototype = {
        init: function() {
            var self = this;
            this.db = Mongoose.connection;

            this.db.on("error", console.error);

            this.db.once("open", function() {
                self.connected = true;
            });

            Mongoose.connect("mongodb://localhost/foca");

        },
        addQuestion: function(user, question,callback) {
        	if(callback === undefined){
        		callback = function(){};
        	}
            if (this.connected) {

                var thisQuestion = new this.questionModel({
                    id: "12",
                    user: user,
                    question: question
                });

                thisQuestion.save(function(err, question) {
                    if (err) {
                        console.error("Unable to save");
                    }
                });

            }
        },
        getUserQuestion: function(user,callback) {
        	if(callback === undefined){
        		callback = function(){};
        	}
            if (this.connected) {
                var questionList = this.questionModel.find({
                    user: user
                },callback);
            }
        },
        editQuestion: function(question_id, newMessage,callback){
        	if(callback === undefined){
        		callback = function(){};
        	}

        	if(this.connected){
        		this.questionModel.update({id:question_id} , {question:newMessage}, {multi:false}, callback);
        	}

        },
        removeQuestion: function(question_id,callback){
        	if(callback === undefined){
        		callback = function(){};
        	}

        	if(this.connected){
        		this.questionModel.remove({id:question_id},callback);
        	}
        }

    }

    GLOBAL["questionDirectory"] = questionDirectory;

}())

var questionsManager = new questionDirectory();

module.exports = {
	manager: questionsManager,
}