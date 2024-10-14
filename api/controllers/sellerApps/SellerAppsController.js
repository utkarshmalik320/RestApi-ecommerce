const ResponseService = require('../../services/ResponseService'); // Update the path as needed
const ConstantService = require('../../services/ConstantService'); // Update the path as needed
const prisma = require('../../../prisma/client'); // Import Prisma client
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

module.exports = {

  /**
   * Login a seller.
   * API Endpoint :   /seller/account/login
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  login: async (req, res) => {
    try {
      sails.log.info('====================== LOGIN : SELLER ACCOUNT REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

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


      // Find the seller by email
      const seller = await prisma.seller.findUnique({
        select: {
          password: true, // Correctly selecting the password field
        },
        where: {
          email: request.email,
        },
      });

      if (_.isEmpty(seller)) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.UNAUTHORIZED, {
          message: 'Invalid email or password.',
        });
      }
      sails.log.debug('seller', seller);

      // Check password
      const isPasswordValid = await bcrypt.compare(request.password, seller.password);
      if (!isPasswordValid) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.UNAUTHORIZED, {
          message: 'Invalid email or password.',
        });
      }

      // Generate a JWT token (adjust your secret and expiration as necessary)
      const token = jwt.sign({id: seller.id, email: seller.email}, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Login successful.',
        token,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while logging in.',
      });
    }
  },

  /**
   * Logout a seller.
   * API Endpoint :   /seller/account/logout
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and message.
   */
  logout: async (req, res) => {
    try {
      sails.log.info('====================== LOGOUT : SELLER ACCOUNT REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Logout successful.',
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while logging out.',
      });
    }
  },

  /**
   * Reset the seller's password.
   * API Endpoint :   /seller/account/reset-password
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  resetPassword: async (req, res) => {
    try {
      sails.log.info('====================== RESET-PASSWORD : SELLER ACCOUNT REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      const request = {
        email: req.body.email,
        newPassword: req.body.newPassword,
      }

      const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        newPassword: Joi.string().min(6).required(),
      });

      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Find the seller by email
      const seller = await prisma.seller.findUnique({
        where: {email: request.email},
      });

      if (_.isEmpty(seller)) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: 'Seller not found.',
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(request.newPassword, 10);

      // Update the seller's password
      await prisma.seller.update({
        where: {email: request.email},
        data: {password: hashedPassword},
      });

      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Password reset successfully.',
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while resetting the password.',
      });
    }
  },

}
