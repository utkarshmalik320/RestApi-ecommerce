const ConstantService = require('../services/ConstantService'); // Update the path as needed
module.exports = {

  /**
   * JSON standard response to be sent.
   *
   * @param res - Response object
   * @param status - Status of request
   * @param message - Message regarding execution of request
   * @param data - Custom data
   * @param meta - Any meta data
   * @returns {*}
   */

  json:  (res, status, message, data, meta) => {
    let response = {
      message: message,
    };
    if (typeof data !== 'undefined') {
      response.data = data;
    }
    if (typeof meta !== 'undefined') {
      response.meta = meta;
    }

    if (status === ConstantService.responseCode.INTERNAL_SERVER_ERROR) {
      sails.log.error(message);
      response.message = ConstantService.responseMessage.ERR_OOPS_SOMETHING_WENT_WRONG;
    }

    // LogService.info('RESPONSE :', response);
    return res.status(status).json(response);
  },

  /**
   * JSON standard response to be sent without meta and message.
   * Log the response.
   *
   * @param res - Response object
   * @param status - Status of request
   * @param data - Custom data
   * @returns {*}
   */

  jsonResponse:  (res, status, data) => {
    let response = {};
    if (typeof data !== 'undefined') {
      response = data;
    }

    // LogService.info('RESPONSE :', response);
    return res.status(status).json(response);
  },

  /**
   * JSON standard response to be sent without meta and message.
   *
   * @param res - Response object
   * @param status - Status of request
   * @param data - Custom data
   * @returns {*}
   */

  jsonResponseOnly:  (res, status, data) => {
    let response = {};
    if (typeof data !== 'undefined') {
      response = data;
    }
    return res.status(status).json(response);
  }
};
