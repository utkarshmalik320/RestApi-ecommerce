const Joi = require('joi');
const _ = require('lodash');
const ResponseService = require('../../services/ResponseService');
const ConstantService = require('../../services/ConstantService');
const prisma = require('../../../prisma/client');
const {parse} = require('dotenv');

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
      sails.log.info('====================== CREATE ORDER : ORDER REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extracting order details from request
      const request = {
        orderNumber: req.body.orderNumber,
        totalAmount: req.body.totalAmount,
        userId: req.body.userId,
        productDetails: req.body.productDetails,  // Assuming this is an array of product objects
        status: req.body.status
      };

      // Creating Valid Schema for Request
      const schema = Joi.object({
        orderNumber: Joi.string().required(),
        totalAmount: Joi.number().positive().required(),
        userId: Joi.number().integer().required(),
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
          userId: request.userId,
          status: request.status,
          productDetails: {
            create: request.productDetails.map(product => ({
              productName: product.productName,
              quantity: product.quantity,
            })),
          },
        },
      });

      sails.log.info('Order created successfully:', newOrder);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Order created successfully.',
        data: newOrder,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while creating the order.',
      });
    }
  },

  /**
   * Get All Orders.
   * API Endpoint :   /orders/details
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  getAllOrders: async (req, res) => {
    try {
      sails.log.info('====================== GET ALL ORDERS ==============================');

      // Extract userId from request query or params
      const userId = parseInt(req.query.userId, 10); // Using query parameter for userId

      if (isNaN(userId)) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: 'Invalid userId provided.',
        });
      }

      // Fetch all orders from the database for the specific userId
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
        },
      });

      if (orders.length === 0) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'No orders found for this account.',
          data: [],
        });
      }

      sails.log.info('Orders retrieved successfully:', orders);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Orders retrieved successfully.',
        data: orders,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while retrieving the orders.',
      });
    }
  },

  /**
   * Get Single Order for a specific Account.
   * API Endpoint :   /orders/by/account
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  getSingleOrder: async (req, res) => {
    try {
      sails.log.info('====================== GET SINGLE ORDER ==============================');
      sails.log.info('REQ BODY :', req.body);


      // Extract product info from Request
      const request = {
        userId: req.body.userId,
        orderId: req.body.orderId,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        userId: Joi.number().required(),
        orderId: Joi.number().required(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);

      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Validate accountId and orderId
      if (!request.userId || !request.orderId) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: 'accountId and orderId must be provided in the request body.',
        });
      }

      // Fetch the specific order from the database for the given accountId and orderId
      const order = await prisma.order.findFirst({
        where: {
          userId: request.userId,
          id: request.orderId,
        },
      });

      if (_.isEmpty(order)) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Order not found for the specified account.',
        });
      }

      sails.log.info('Order retrieved successfully:', order);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Order retrieved successfully.',
        data: order,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while retrieving the order.',
      });
    }
  },

  /**
   * Update Order Status for a specific Order.
   * API Endpoint :   /orders/status/update
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and information or relevant error code with message.
   */
  updateOrderStatus: async (req, res) => {
    try {
      sails.log.info('====================== UPDATE ORDER STATUS ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extract accountId and orderId from request body
      const request = {
        userId: req.body.userId,
        orderId: req.body.orderId,
        status: req.body.status // Also extract status for later use
      };

      // Creating Valid Schema for Request
      const schema = Joi.object({
        userId: Joi.number().required(),
        orderId: Joi.number().required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'canceled').required() // Validate status
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);

      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Prepare the data to update
      const updateData = {
        status: request.status,
      };

      // If status is 'canceled', set deletedAt to the current date
      if (request.status === 'canceled') {
        updateData.deletedAt = new Date(); // Set the current date and time
      }

      // Update the order status in the database
      const updatedOrder = await prisma.order.updateMany({
        where: {
          id: request.orderId, // Use the validated orderId
          userId: request.userId, // Use the validated accountId
        },
        data: updateData,
      });

      // Check if the order was updated
      if (updatedOrder.count === 0) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Order not found or no changes made.',
        });
      }

      sails.log.info('Order status updated successfully:', updatedOrder);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Order status updated successfully.',
        data: { orderId: request.orderId, newStatus: request.status },
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while updating the order status.',
      });
    }
  },



};
