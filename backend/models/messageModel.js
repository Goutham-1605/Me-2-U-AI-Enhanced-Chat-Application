const mongoose= require('mongoose');
const messageModel = mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    content:{type:String,trim: true},

    Chat:{type:mongoose.Schema.Types.ObjectId, ref:"Chat"},


},
{
    timestamps: true
}
);
const message = mongoose.model("message",messageModel);
module.exports= message;