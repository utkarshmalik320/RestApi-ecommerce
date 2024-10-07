const Joi = require('joi');
const prisma = require("../../../prisma/client");

module.exports = {

  /**
   * Add to Cart Product
   * API Endpoint :   /add/to/cart
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  addToCart: async (req, res) => {
    try {
      sails.log.info("====================== ADD TO CART ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extract product info from Request
      const request = {
        accountId: req.body.accountId,
        productId: req.body.productId,
        productName: req.body.productName,
        variant: req.body.variant || null,
        brandId: req.body.brandId || null,
        brandName: req.body.brandName || null,
        quantity: req.body.quantity || 1,
        price: req.body.price,
      };

      // Creating Valid Schema for Request
      const schema = Joi.object().keys({
        accountId: Joi.number().required(),
        productId: Joi.number().required(),
        productName: Joi.string().required(),
        variant: Joi.string().optional().allow(null),
        brandId: Joi.number().optional().allow(null),
        brandName: Joi.string().optional().allow(null),
        quantity: Joi.number().integer().positive().min(1).optional(),
        price: Joi.number().positive().positive().min(1).optional(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Check if the product exists and fetch its price
      const product = await prisma.product.findUnique({
        where: {
          id: request.productId,
        },
      });

      if (!product) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "Product not found.",
        });
      }

      // Calculate total amount based on quantity and product price
      const totalAmount = request.price * request.quantity;

        // Add product to cart if it does not already exist
        const newCartItem = await prisma.cart.create({
          data: {
            accountId: request.accountId,
            productId: request.productId,
            productName: request.productName,
            variant: request.variant,
            brandId: request.brandId,
            brandName: request.brandName,
            quantity: request.quantity,
            price: request.price,
            totalAmount: totalAmount,
          },
        });

        sails.log.info("Product added to cart successfully:", newCartItem);
        return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
          message: "Product added to cart successfully.",
          data: newCartItem,
        });
    } catch (exception) {
      sails.log.error("Error adding product to cart:", exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while adding product to cart.",
      });
    }
  },

  /**
   * Remove from Cart Product
   * API Endpoint :   /remove/from/cart
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */
  removeFromCart: async (req, res) => {
    try {
      sails.log.info("====================== REMOVE FROM CART ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extract cart item ID and product ID from the request
      const request = {
        cartId: req.body.cartId,
        productId: req.body.productId,
      };

      // Create Valid Schema for Request
      const schema = Joi.object().keys({
        cartId: Joi.string().required(),
        productId: Joi.number().required(),
      });

      // Validate Request against Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Fetch the cart item by ID, including product details (price)
      const cartItem = await prisma.cart.findFirst({
        where: {
          id: request.cartId,
          productId: request.productId, // Match both cartId and productId
          deletedAt: null, // Only fetch active items
        },
      });

      if (!cartItem) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "Cart item not found.",
        });
      }

      // Calculate the amount to subtract (product price * quantity)
      const amountToSubtract = cartItem.price * cartItem.quantity;

      // Update the cart item: Set quantity to 0, and mark as deleted
      const updatedCartItem = await prisma.cart.update({
        where: {
          id: cartItem.id, // Ensure we're using the correct cart item ID
        },
        data: {
          quantity: 0, // Set quantity to 0 to mark as removed
          totalAmount: {
            decrement: amountToSubtract, // Decrement the total amount
          },
          deletedAt: new Date(), // Mark the item as deleted (soft delete)
        },
      });

      sails.log.info("Product removed from cart successfully:", updatedCartItem);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Product removed from cart successfully.",
        data: updatedCartItem, // Return updated cart item details
      });
    } catch (exception) {
      sails.log.error("Error removing product from cart:", exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while removing product from cart.",
      });
    }
  },

  /**
   * Fetch Cart Details
   * API Endpoint :   /fetch/cart/details
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and cart details or relevant error code with message.
   */
  fetchCartDetails: async (req, res) => {
    try {
      sails.log.info("====================== FETCH CART DETAILS ==============================");
      sails.log.info("REQ BODY :", req.body);

      // Extract account ID from the request
      const request = {
        cartId: req.body.cartId,
        accountId: req.body.productId,
      }


      const schema = Joi.object().keys({
        accountId: Joi.number().required(),
        cartId: Joi.string().required(),
      });

      // Validate Request from Valid Schema
      const validateResult = schema.validate(request);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
          message: validateResult.error.message,
        });
      }

      // Fetch cart items for the given account ID, including product details
      const cartItems = await prisma.cart.findMany({
        where: {
          accountId: request.accountId,
          id: request.cartId,
          deletedAt: null,
        },
      });

      if (!cartItems.length) {
        return ResponseService.jsonResponse(res, ConstantService.responseCode.NOT_FOUND, {
          message: "No items found in the cart.",
        });
      }

      sails.log.info("Cart details fetched successfully:", cartItems);

      // Return Success Response
      return ResponseService.jsonResponse(res, ConstantService.responseCode.SUCCESS, {
        message: "Cart details fetched successfully.",
        data: cartItems,
      });
    } catch (exception) {
      sails.log.error("Error fetching cart details:", exception);
      return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, {
        message: "An error occurred while fetching cart details.",
      });
    }
  },

};
