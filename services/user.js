const userModel = require("../models/user.js");
const bcrypt = require("bcrypt");

const signInToken = (id, email) => {
  const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  console.log(token);
  return token;
};
class user {
  static async addUser(name, email, password) {
    try {
      const response = await userModel.create({ name, email, password });
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async loginHandler(email, password) {
    try {
      const user = await userModel.findOne({
        where: {
          email,
        },
      });
      console.log(user);
      if (!user) {
        return {
          success: false,
          error: "this email is not registerd with us",
          token: null,
        };
      }
      const correctPassword = await bcrypt.compare(
        password,
        user.dataValues.password
      );
      console.log(correctPassword);
      if (correctPassword) {
        const token = signInToken(user.dataValues.id, user.dataValues.email);
        return {
          success: true,
          error: null,
          token,
        };
      }

      return {
        success: false,
        error: "Invalid email or password",
        token: null,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = user;
