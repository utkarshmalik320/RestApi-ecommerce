// config/routes.js
module.exports.routes = {
  // =================Account Controller=====================================

  'POST /account/add': { controller: 'account/AccountController', action: 'addAccount'},
  'POST /account/edit': { controller: 'account/AccountController', action: 'editAccount'},
  'DELETE /account/delete': { controller: 'account/AccountController', action: 'deleteAccount'},

  // =================Apps Controller=====================================
  'POST /account/reset-password': { controller: 'apps/AppsController', action: 'resetPassword'},

};
