const Joi = require('joi'); // Ensure you have Joi installed
const ResponseService = require('../../services/ResponseService');
const ConstantService = require('../../services/ConstantService');
const prisma = require('../../../prisma/client');


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
      sails.log.info('====================== ADD : PRODUCT REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extract product info from Request
      const request = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        brandName: req.body.brandName,
        category: req.body.category,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        price: Joi.number().positive().required(),
        brandName: Joi.string().required(),
        category: Joi.string().required(),

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
          category: request.category,
        },
      });

      sails.log.info('Product created successfully:', newProduct);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Product created successfully.',
        data: newProduct,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while creating the product.',
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
      sails.log.info('====================== EDIT : PRODUCT REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

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
        where: {id: request.productId},
        data: {
          name: request.name,
          description: request.description,
          price: request.price,
          brandName: request.brandName,
          category: request.category,
        },
      });

      sails.log.info('Product updated successfully:', updatedProduct);

      // Return success response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Product updated successfully.',
        data: updatedProduct,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while updating the product.',
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
      sails.log.info('====================== DELETE : PRODUCT REQUEST ==============================');
      sails.log.info('REQ PARAMS :', req.query);

      const {productId} = req.query;

      // Creating valid schema for deleting product
      const schema = Joi.object().keys({
        productId: Joi.number().integer().required(),
      });

      // Validate the request
      const validateResult = schema.validate({productId});
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check if the product exists before deleting (soft delete)
      const existingProduct = await prisma.product.findUnique({
        where: {id: Number(productId)},
      });

      if (!existingProduct) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Product not found.',
        });
      }

      if (existingProduct.deletedAt) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: 'Product is already deleted.',
        });
      }

      // Perform soft delete by updating the deletedAt field with the current timestamp
      const deletedProduct = await prisma.product.update({
        where: {id: Number(productId)},
        data: {
          deletedAt: new Date(), // Setting the current timestamp for soft deletion
        },
      });

      sails.log.info('Product soft deleted successfully:', productId);

      // Return success response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Product soft deleted successfully.',
        data: deletedProduct,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while deleting the product.',
      });
    }
  },

  /**
   * Get All Products.
   * API Endpoint :   /product/all
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and all product details or relevant error code with message.
   */
  getAllProducts: async (req, res) => {
    try {
      sails.log.info('====================== GET : ALL PRODUCTS REQUEST ==============================');

      // Get skip and limit values from the query parameters
      const {skip = 0, limit = 10} = req.query;

      // Validate skip and limit to ensure they are non-negative integers
      const skipNumber = Math.max(0, parseInt(skip, 10));
      const limitNumber = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1

      const products = await prisma.product.findMany({
        where: {
          deletedAt: null, // Fetch only non-deleted products
        },
        skip: Number(skipNumber), // Skip the specified number of records
        take: Number(limitNumber), // Limit the number of results returned
      });

      // Fetch total count for pagination
      const totalCount = await prisma.product.count({
        where: {
          deletedAt: null, // Count only non-deleted products
        },
      });

      sails.log.info('All products fetched successfully:', products);

      // Return success response with products and total count for pagination
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'All products fetched successfully.',
        data: products,
        totalCount, // Total count for pagination purposes
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while fetching the products.',
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
      sails.log.info('====================== GET : PRODUCT DETAILS REQUEST ==============================');
      sails.log.info('REQ BODY :', req.query);

      const {productId} = req.query;

      // Creating valid schema for fetching product details
      const schema = Joi.object().keys({
        productId: Joi.number().integer().required(),
      });

      // Validate the request
      const validateResult = schema.validate({productId});
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Fetch the product details
      const product = await prisma.product.findUnique({
        where: {id: Number(productId)},
      });

      if (!product) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Product not found.',
        });
      }

      if (product.deletedAt !== null) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Product has been deleted.',
        });
      }

      sails.log.info('Product details fetched successfully:', product);

      // Return success response with product details
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Product details fetched successfully.',
        data: product,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while fetching the product details.',
      });
    }
  },

  /**
   * Get All Products by Category
   * API Endpoint :   /product/category
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and all product details or relevant error code with message.
   */
  fetchProductsByCategory: async (req, res) => {
    try {
      sails.log.info('====================== FETCH BY PRODUCTS : PRODUCT REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extract category, skip, and limit info from Request
      const request = {
        category: req.body.category,
        skip: req.body.skip || 0,
        limit: req.body.limit || 10
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        category: Joi.string().required(),
        skip: Joi.number().integer().min(0).optional(), // Optional parameter for pagination
        limit: Joi.number().integer().min(1).optional(), // Optional parameter for pagination
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Fetch products with the given category
      const products = await prisma.product.findMany({
        where: {
          category: {
            contains: request.category,
            mode: 'insensitive'
          },
          deletedAt: null // Ensure we're not fetching deleted products
        },
        skip: request.skip, // Pagination: number of records to skip
        take: request.limit // Pagination: number of records to fetch
      });

      // Check if products are found
      if (products.length === 0) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'No products found for this category.',
        });
      }

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Products fetched successfully.',
        data: products,
      });
    } catch (exception) {
      sails.log.error('Error fetching products by category:', exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while fetching products.',
      });
    }
  },

  /**
   * Get All Products by Category
   * API Endpoint :   /product/category/all
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and all product details or relevant error code with message.
   */
  fetchUniqueCategories: async (req, res) => {
    try {
      sails.log.info('====================== FETCH UNIQUE CATEGORIES ==============================');

      // Fetch unique categories from the product table
      const uniqueCategories = await prisma.product.findMany({
        select: {
          category: true // Only select the category field
        },
        distinct: ['category'], // Get distinct values for the category field
      });

      // Check if any categories were found
      if (uniqueCategories.length === 0) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'No categories found.',
        });
      }

      // Extract categories from the result
      const categories = uniqueCategories.map(product => product.category);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Unique categories fetched successfully.',
        data: categories,
      });
    } catch (exception) {
      sails.log.error('Error fetching unique categories:', exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while fetching unique categories.',
      });
    }
  },

  /**
   * Get All Products by Category
   * API Endpoint :   /product/category/all
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and all product details or relevant error code with message.
   */
  addProductReview: async (req, res) => {
    try {
      sails.log.info('====================== ADD : PRODUCT REVIEW REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extract review and rating info from Request
      const request = {
        userId: req.body.userId,
        productId: req.body.productId,
        rating: req.body.rating,
        comment: req.body.comment,
        images:req.body.images,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        userId: Joi.number().integer().required(),
        productId: Joi.number().integer().required(),
        rating: Joi.number().integer().min(1).max(5).optional(),
        comment:Joi.string().required(),
        images: Joi.array().items(Joi.string().uri()).optional()
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check if the product exists
      const productExists = await prisma.product.findUnique({
        where: {id: request.productId},
      });
      sails.log.info('Products fetched successfully.', productExists);
      if (!productExists || productExists.deletedAt) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Product not found.',
        });
      }

      // Update the product with the new review
      const updatedProduct = await prisma.review.create({
        data: {
          userId:request.userId,
          productId: request.productId,
          rating: request.rating,
          comment:request.comment,
          images:request.images,
        },
      });

      sails.log.debug('Product updated successfully.', updatedProduct);

      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Review and rating added successfully.',
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while adding the review.',
      });
    }
  },

  /**
   * Update Product Review
   * API Endpoint :   /product/review/update
   * API Method   :   PUT
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse with success code 200 if updated, or relevant error code with message.
   */
  updateProductReview: async (req, res) => {
    try {
      sails.log.info('====================== UPDATE : PRODUCT REVIEW REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      // Extract review and rating info from Request
      const request = {
        userId: req.body.userId,
        reviewId: req.body.reviewId,
        rating: req.body.rating,
        comment: req.body.comment,
        images: req.body.images,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        userId: Joi.number().integer().required(),
        reviewId: Joi.number().integer().required(),
        rating: Joi.number().integer().min(1).max(5).optional(),
        comment: Joi.string().optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check if the review exists
      const reviewExists = await prisma.review.findUnique({
        where: { id: request.reviewId, userId: request.userId },
      });

      if (!reviewExists) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Review not found.',
        });
      }

      // Update the review with the new data
      const updatedReview = await prisma.review.update({
        where: { id: request.reviewId },
        data: {
          rating: request.rating,
          comment: request.comment,
          images: request.images,
        },
      });

      sails.log.info('Review updated successfully.', updatedReview);

      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Review updated successfully.',
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while updating the review.',
      });
    }
  },

  /**
   * Delete Product Review
   * API Endpoint :   /product/review/delete
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse with success code 200 if deleted, or relevant error code with message.
   */
  deleteProductReview: async (req, res) => {
    try {
      sails.log.info('====================== DELETE : PRODUCT REVIEW REQUEST ==============================');
      sails.log.info('REQ BODY :', req.body);

      const request = {
        userId: req.body.userId,
        reviewId: req.body.reviewId,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        userId: Joi.number().integer().required(),
        reviewId: Joi.number().integer().required(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check if the review exists
      const reviewExists = await prisma.review.findUnique({
        where: { id: request.reviewId, userId: request.userId },
      });

      if (!reviewExists) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: 'Review not found.',
        });
      }

      const softDeletedReview = await prisma.review.update({
        where: { id: request.reviewId },
        data: {
          deletedAt: new Date(), // Soft delete by setting the current date
        },
      });

      sails.log.info('Review deleted successfully.' ,softDeletedReview);

      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Review deleted successfully.',
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while deleting the review.',
      });
    }
  },

  /**
   * Get All Reviews for a Product
   * API Endpoint :   /product/review/all
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse with success code 200 and all reviews or relevant error code with message.
   */
  getAllProductReviews: async (req, res) => {
    try {
      sails.log.info('====================== FETCH : ALL PRODUCT REVIEWS REQUEST ==============================');
      sails.log.info('REQ QUERY :', req.query);

      const request = {
        productId: req.query.productId,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        productId: Joi.number().integer().required(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Fetch all reviews for the product
      const reviews = await prisma.review.findMany({
        where: { productId: Number(request.productId) },
      });

      sails.log.info('Product reviews fetched successfully.', reviews);

      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: 'Product reviews fetched successfully.',
        data: reviews,
      });
    } catch (exception) {
      sails.log.error(exception);
      return ResponseService.jsonResponse(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: 'An error occurred while fetching the reviews.',
      });
    }
  }





};
