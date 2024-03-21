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

  static async readUser(email) {
    try {
      const user = await userModel.findByPk(email);
      if (!user) {
        throw {
          message: "User not found",
        };
      }
      return {
        success: true,
        error: null,
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(email, { name, password }) {
    try {
      if (!email) {
        throw {
          message: "email can not be null",
        };
      }

      const user = await userModel.findByPk(email);
      if (!user) {
        throw {
          message: "User not Found",
        };
      }

      if (password) {
        const passwordMatch = await bcrypt.compare(
          password,
          user.dataValues.password
        );
        if (passwordMatch) {
          throw {
            message: "New password must be different from the previous one",
          };
        }
      }

      await user.update({ name, password });
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }
  static async deleteUser(email) {
    try {
      const user = await userModel.findByPk(email);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      await user.destroy();
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Error deleting user");
    }
  }
}

module.exports = user;
