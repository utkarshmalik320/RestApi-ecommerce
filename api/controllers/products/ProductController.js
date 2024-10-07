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
        brandName : req.body.brandName,
        category: req.body.category,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        price: Joi.number().positive().required(),
        brandName:Joi.string().required(),
        category:Joi.string().required(),

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
          brandName: request.brandName,
          category:request.category,
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

  /**
   * Edit Product Details.
   * API Endpoint :   /product/edit
   * API Method   :   PUT
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and updated product details or relevant error code with message.
   */
  editProduct: async (req, res) => {
    try {
      sails.log.info("====================== EDIT : PRODUCT REQUEST ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extract product info from Request
      const request = {
        productId: req.body.productId,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        brandName: req.body.brandName,
        category: req.body.category,
      };

      // Creating valid schema for updating product details
      const schema = Joi.object().keys({
        productId: Joi.number().integer().required(),
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        price: Joi.number().positive().optional(),
        brandName: Joi.string().optional(),
        category: Joi.string().optional(),
      });

      // Validate the request
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Update the product details
      const updatedProduct = await prisma.product.update({
        where: { id: request.productId },
        data: {
          name: request.name,
          description: request.description,
          price: request.price,
          brandName: request.brandName,
          category: request.category,
        },
      });

      sails.log.info("Product updated successfully:", updatedProduct);

      // Return success response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Product updated successfully.",
        data: updatedProduct,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while updating the product.",
      });
    }
  },

  /**
   * Delete Product.
   * API Endpoint :   /product/delete
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and message or relevant error code with message.
   */
   deleteProduct: async (req, res) => {
    try {
      sails.log.info("====================== DELETE : PRODUCT REQUEST ==============================");
      sails.log.info("REQ PARAMS :", req.query);

      const { productId } = req.query;

      // Creating valid schema for deleting product
      const schema = Joi.object().keys({
        productId: Joi.number().integer().required(),
      });

      // Validate the request
      const validateResult = schema.validate({ productId });
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check if the product exists before deleting (soft delete)
      const existingProduct = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (!existingProduct) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "Product not found.",
        });
      }

      if (existingProduct.deletedAt) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: "Product is already deleted.",
        });
      }

      // Perform soft delete by updating the deletedAt field with the current timestamp
      const deletedProduct = await prisma.product.update({
        where: { id: Number(productId) },
        data: {
          deletedAt: new Date(), // Setting the current timestamp for soft deletion
        },
      });

      sails.log.info("Product soft deleted successfully:", productId);

      // Return success response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Product soft deleted successfully.",
        data: deletedProduct,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while deleting the product.",
      });
    }
  },

  /**
   * Get Product Details by ID.
   * API Endpoint :   /product/details
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and product details or relevant error code with message.
   */
  getProductDetails: async (req, res) => {
    try {
      sails.log.info("====================== GET : PRODUCT DETAILS REQUEST ==============================");
      sails.log.info("REQ BODY :", req.query);

      const { productId } = req.query;

      // Creating valid schema for fetching product details
      const schema = Joi.object().keys({
        productId: Joi.number().integer().required(),
      });

      // Validate the request
      const validateResult = schema.validate({ productId });
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Fetch the product details
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (!product) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "Product not found.",
        });
      }

      if (product.deletedAt !== null) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "Product has been deleted.",
        });
      }

      sails.log.info("Product details fetched successfully:", product);

      // Return success response with product details
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Product details fetched successfully.",
        data: product,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while fetching the product details.",
      });
    }
  },


};
