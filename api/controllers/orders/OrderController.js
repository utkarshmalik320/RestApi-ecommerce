const Joi = require('joi');
const _ = require('lodash');
const ResponseService = require("../../services/ResponseService");
const ConstantService = require("../../services/ConstantService");
const prisma = require("../../../prisma/client");
const {parse} = require("dotenv");

module.exports = {

  /**
   * Add a new Product.
   * API Endpoint :   /order/create
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  createOrder: async (req, res) => {
    try {
      sails.log.info("====================== CREATE ORDER : ORDER REQUEST ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extracting order details from request
      const request = {
        orderNumber: req.body.orderNumber,
        totalAmount: req.body.totalAmount,
        accountId: req.body.accountId,
        productDetails: req.body.productDetails,  // Assuming this is an array of product objects
        status: req.body.status
      };

      // Creating Valid Schema for Request
      const schema = Joi.object({
        orderNumber: Joi.string().required(),
        totalAmount: Joi.number().positive().required(),
        accountId: Joi.number().integer().required(),
        productDetails: Joi.array().items(
          Joi.object({
            productName: Joi.string().required(),  // Each product must have a name
            quantity: Joi.number().positive().required()  // Each product must have a positive quantity
          })
        ).required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered').required()
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Create the new order with associated products
      const newOrder = await prisma.order.create({
        data: {
          orderNumber: request.orderNumber,
          totalAmount: request.totalAmount,
          accountId: request.accountId,
          status: request.status,
          productDetails: {
            create: request.productDetails.map(product => ({
              productName: product.productName,
              quantity: product.quantity,
            })),
          },
        },
      });

      sails.log.info("Order created successfully:", newOrder);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Order created successfully.",
        data: newOrder,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while creating the order.",
      });
    }
  },

};
