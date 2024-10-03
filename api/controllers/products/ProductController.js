const Joi = require('joi'); // Ensure you have Joi installed
const ResponseService = require("../../services/ResponseService");
const ConstantService = require("../../services/ConstantService");
const prisma = require("../../../prisma/client");

module.exports = {

  /**
   * Add a new Product.
   * API Endpoint :   /product/add
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  addProduct: async (req, res) => {
    try {
      sails.log.info("====================== ADD : PRODUCT REQUEST ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extract product info from Request
      const request = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        price: Joi.number().positive().required(), // Ensure the price is a positive number
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Create the new product
      const newProduct = await prisma.product.create({
        data: {
          name: request.name,
          description: request.description,
          price: request.price,
        },
      });

      sails.log.info("Product created successfully:", newProduct);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Product created successfully.",
        data: newProduct,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while creating the product.",
      });
    }
  },

};
