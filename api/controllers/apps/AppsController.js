const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ResponseService = require("../../services/ResponseService");
const ConstantService = require("../../services/ConstantService");
const prisma = require("../../../prisma/client");

module.exports = {

  /**
   * Add a new account.
   * API Endpoint :   /account/reset-password
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  resetPassword: async (req, res) => {
    try {
      sails.log.info("====================== RESET-PASSWORD : ACCOUNT REQUEST ==============================");
      sails.log.info("REQ BODY :", req.body);
      const { email, newPassword } = req.body;

      // Validate request
      const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        newPassword: Joi.string().min(6).required(),
      });

      const validateResult = schema.validate({ email, newPassword });
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Find the account
      const existingAccount = await prisma.account.findUnique({
        where: { email },
      });

      if (!existingAccount) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: "No account found with this email.",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      await prisma.account.update({
        where: { email },
        data: { password: hashedPassword },
      });

      sails.log.info("Password reset successfully for:", email);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Password reset successfully.",
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while resetting the password.",
      });
    }
  },

  /**
   * Login account.
   * API Endpoint :   /account/login
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  loginAccount : async (req, res) => {
    sails.log.info("====================== LOGIN : ACCOUNT REQUEST ==============================");
    sails.log.info("REQ BODY :", req.body);
    try {
      const request = {
        email: req.body.email,
        password: req.body.password,
      }

      const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
      });

      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }
      // Find the account by email
      const account = await prisma.account.findUnique({
        where: { email: request.email },
      })

      // If the account is not found or is deleted
      if (_.isEmpty(account)) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "Account not found.",
        });
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(request.password, account.password); // Assuming you have stored the hashed password

      if (!isPasswordValid) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.UNAUTHORIZED, {
          message: "Invalid credentials.",
        });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: account.id, email: request.email }, 'your_jwt_secret', {
        expiresIn: '1h', // Token expiration time
      });

      // Return the token
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Login successful.",
        token: token,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while logging in.",
      });
    }
  },

  /**
   * Logout account.
   * API Endpoint :   /account/logout
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  logoutAccount :async (req, res) => {
    sails.log.info("====================== LOGOUT : ACCOUNT REQUEST ==============================");
    sails.log.info("REQ BODY :", req.body);
    return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
      message: "Logout successful.",
    });
  },



}
