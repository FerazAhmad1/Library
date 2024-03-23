const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.protector = async ({ token }) => {
  try {
    if (!token) {
      throw {
        message: "Please send token",
      };
    }
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      console.log("Ffffffffff", decoded);
    } catch (error) {
      throw {
        message: "UnAthurorized user",
      };
    }

    const user = await User.findByPk(decoded.email);

    if (!user) {
      throw {
        message: "The user belongs to this token does not exist",
      };
    }

    return { user };
  } catch (error) {
    throw error;
  }
};
