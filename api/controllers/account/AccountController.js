const Joi = require('joi');
const _ = require('lodash');
const ResponseService = require('../../services/ResponseService'); // Update the path as needed
const ConstantService = require('../../services/ConstantService'); // Update the path as needed
const prisma = require('../../../prisma/client'); // Import Prisma client
const bcrypt = require('bcrypt');

module.exports = {

  /**
   * Add a new account.
   * API Endpoint :   /account/add
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  addAccount: async (req, res) => {
    try {
      sails.log.info("====================== ADD : ACCOUNT REQUEST ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extracting Account info from Request
      const request = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password, // Ensure this is hashed before saving
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phoneNumber: Joi.string().optional(),
        password: Joi.string().min(6).required(), // Ensure a minimum length
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check for existing account by email
      const existingAccount = await prisma.account.findUnique({
        where: { email: request.email },
      });

      if (existingAccount) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: "An account with this email already exists.",
        });
      }

      // Hash the password (Use a library like bcrypt)
      const hashedPassword = await bcrypt.hash(request.password, 10);

      // Create the new address entry first
      // Now create the new account, linking it to the address
      const newAccount = await prisma.account.create({
        data: {
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phoneNumber: request.phoneNumber,
          password: hashedPassword,
        },
      });

      // Log the successful account creation
      sails.log.info("Account created successfully:", newAccount);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Account created successfully.",
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while creating the account.",
      });
    }
  },

  /**
   * Edit Account Details.
   * API Endpoint :   /account/update
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  editAccount: async (req, res) => {
    try {
      const accountId = req.params.id; // Assuming the account ID is passed as a URL parameter
      const request = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
      };

      // Validate Request from Valid Schema
      const schema = Joi.object().keys({
        email: Joi.string().email().optional(),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        phoneNumber: Joi.string().optional(),
      });

      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check for existing account by email
      const existingAccount = await prisma.account.findUnique({
        where: { email: request.email },
      });

      if (existingAccount && existingAccount.id !== accountId) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: "An account with this email already exists.",
        });
      }

      // Update the account
      const updatedAccount = await prisma.account.update({
        where: { id: accountId },
        data: {
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          phoneNumber: request.phoneNumber,
        },
      });

      sails.log.info("Account updated successfully:", updatedAccount);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Account updated successfully.",
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while updating the account.",
      });
    }
  },

  /**
   * Delete a new account.
   * API Endpoint :   /account/delete
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  deleteAccount: async (req, res) => {
    try {
      const accountId = req.params.id; // Assuming the account ID is passed as a URL parameter

      // Delete the account
      const deletedAccount = await prisma.account.delete({
        where: { id: accountId },
      });

      sails.log.info("Account deleted successfully:", deletedAccount);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Account deleted successfully.",
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while deleting the account.",
      });
    }
  },


};
