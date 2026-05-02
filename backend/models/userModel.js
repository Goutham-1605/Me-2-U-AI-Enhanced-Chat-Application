const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },

    Email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    Password: {
      type: String,
      required: true,
    },

    Pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerified: {
  type: Boolean,
  default: false,
},
verificationToken: {
  type: String,
},
verificationTokenExpires: {
  type: Date,
},
  },
  
  {
    timestamps: true,
  }
);



userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};



userSchema.pre("save", async function () {
  if (!this.isModified("Password")) {
    return ;
  }

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  
});


const User = mongoose.model("User", userSchema);

module.exports = User;