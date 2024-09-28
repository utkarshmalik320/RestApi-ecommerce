const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
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
}
