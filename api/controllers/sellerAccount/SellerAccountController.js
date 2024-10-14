const Joi = require('joi');
const _ = require('lodash');
const ResponseService = require('../../services/ResponseService'); // Update the path as needed
const ConstantService = require('../../services/ConstantService'); // Update the path as needed
const prisma = require('../../../prisma/client'); // Import Prisma client
const bcrypt = require('bcrypt');
const {parse} = require('dotenv');


module.exports = {
  /**
   * Add a new seller.
   * API Endpoint :   /seller/account/add
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  addSeller: async (req, res) => {
    try {
      sails.log.info('====================== ADD : SELLER REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extracting Seller info from Request
      const request = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        password: req.body.password, // Ensure this is hashed before saving
        companyName: req.body.companyName,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        name: Joi.string().required(),
        phoneNumber: Joi.string().optional(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(), // Ensure a minimum length
        companyName: Joi.string().required(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check for existing seller by email
      const existingSeller = await prisma.seller.findUnique({
        where: {email: request.email},
      });

      if (existingSeller) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: 'A seller with this email already exists.',
        });
      }

      // Hash the password (Use a library like bcrypt)
      const hashedPassword = await bcrypt.hash(request.password, 10);

      // Create the new seller account
      const newSeller = await prisma.seller.create({
        data: {
          name: request.name,
          phoneNumber: request.phoneNumber,
          email: request.email,
          password: hashedPassword,
          companyName: request.companyName,
        },
      });

      // Log the successful seller creation
      sails.log.info('Seller created successfully:', newSeller);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Seller created successfully.',
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while creating the seller.',
      });
    }
  },

  /**
   * Edit an existing seller.
   * API Endpoint :   /seller/edit/:id
   * API Method   :   PUT
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  editSeller: async (req, res) => {
    try {
      sails.log.info('====================== EDIT : SELLER REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extracting Seller info from Request
      const request = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        companyName: req.body.companyName,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        name: Joi.string().optional(),
        phoneNumber: Joi.string().optional(),
        email: Joi.string().email().optional(),
        companyName: Joi.string().optional(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }


      const existingAccount = await prisma.seller.findUnique({
        where: {email: request.email},
      });

      if (_.isEmpty(existingAccount)) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: 'An account with this email already doesnt exists.',
        });
      }

      // Update seller in the database
      const updatedSeller = await prisma.seller.update({
        where: {email: request.email},
        data: request,
      });

      sails.log.info('Seller updated successfully:', updatedSeller);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Seller updated successfully.',
        data: updatedSeller,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while updating the seller.',
      });
    }
  },

  /**
   * Soft delete a seller.
   * API Endpoint :   /seller/delete/:id
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  deleteSeller: async (req, res) => {
    try {
      const sellerId = parseInt(req.query.id); // Get seller ID from request parameters
      sails.log.info('====================== DELETE : SELLER REQUEST ==============================');
      sails.log.debug('sellerId  :', sellerId);
      // Soft delete the seller by setting deletedAt timestamp
      const deletedSeller = await prisma.seller.update({
        where: {
          id: sellerId
        },
        data: {
          deletedAt: new Date(), // Set deletedAt to the current date/time
        },
      });

      sails.log.info(`Seller with ID ${sellerId} marked as deleted successfully.`);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Seller marked as deleted successfully.',
        data: deletedSeller,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while marking the seller as deleted.',
      });
    }
  },

  /**
   * Fetch user details.
   * API Endpoint :   /account/seller/details
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With user details or relevant error code with message.
   */
  fetchSellerDetails: async (req, res) => {
    try {
      sails.log.info('====================== FETCH : SELLER ACCOUNT DETAILS REQUEST ==============================');
      sails.log.info('REQ QUERY :', req.query);

      const sellerId = parseInt(req.query.id);
      sails.log.debug('sellerId' , sellerId)

      // Fetch the user details
      const sellerAccountDetails = await prisma.seller.findUnique({
        where: { id: sellerId},
      });

      if (!sellerAccountDetails) {
        sails.log.warn('Seller not found:', sellerId);
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Seller  not found.',
        });
      }

      // Check if the user has been soft-deleted (i.e., deletedAt is not null)
      if (sellerAccountDetails.deletedAt !== null) {
        sails.log.warn('Seller account has been deleted:', sellerId);
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Seller Account has been deleted.',
        });
      }

      // Return user details if found and not deleted
      sails.log.info('Seller Account details fetched successfully:', sellerAccountDetails);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Seller Account details fetched successfully.',
        data: sellerAccountDetails,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while fetching seller details.',
      });
    }
  }


}
