const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Incorrect Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(val) {
      if (val.length < 6) {
        throw new Error("Minimum 6 characters required");
      }
    },
  },
  tokens: [{ token: { type: String, required: true } }],
});

UserSchema.virtual("tasks", {
  ref: "task",
  localField: "_id",
  foreignField: "owner",
});

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable To Login");
  }

  const isMatch = await bcrypt.compare(password, user.password, (err, res) => {
    if (err) {
      console.log(err);
      return false;
    }
    if (res) {
      return true;
    }
  });

  if (!isMatch) {
    throw new Error("Wrong Password");
  }
  return user;
};

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  console.log(user.tokens);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// UserSchema.methods.getPublicProfile = function () {
//   const user = this;
//   const userObject = user.toObject();
//   delete userObject.password;
//   delete userObject.tokens;
//   return userObject;
// };

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

module.exports = mongoose.model("User", UserSchema);
