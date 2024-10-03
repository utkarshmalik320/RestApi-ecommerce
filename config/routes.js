// config/routes.js
module.exports.routes = {
  // =================Account Controller=====================================

  'POST /account/add': { controller: 'account/AccountController', action: 'addAccount'},
  'POST /account/edit': { controller: 'account/AccountController', action: 'editAccount'},
  'DELETE /account/delete': { controller: 'account/AccountController', action: 'deleteAccount'},

  // =================Apps Controller=====================================
  'POST /account/reset-password': { controller: 'apps/AppsController', action: 'resetPassword'},
  'POST /account/login': { controller: 'apps/AppsController', action: 'loginAccount'},
  'POST /account/logout': { controller: 'apps/AppsController', action: 'logoutAccount'},

  // =================Product Controller=====================================
  'POST /product/add': { controller: 'products/ProductController', action: 'addProduct'},

  // =================Order Controller=====================================
  'POST /order/create': { controller: 'orders/OrderController', action: 'createOrder'},

  // =================Seller Account Controller=====================================
  'POST /seller/account/add': { controller: 'sellerAccount/SellerAccountController', action: 'addSeller'},
  'POST /seller/account/edit': { controller: 'sellerAccount/SellerAccountController', action: 'editSeller'},
  'DELETE /seller/account/delete': { controller: 'sellerAccount/SellerAccountController', action: 'deleteSeller'},


  // =================Seller Account Controller=====================================
  'POST /seller/account/login': { controller: 'sellerApps/SellerAppsController', action: 'login'},
  'POST /seller/account/logout': { controller: 'sellerApps/SellerAppsController', action: 'logout'},
  'POST /seller/account/reset-password': { controller: 'sellerApps/SellerAppsController', action: 'resetPassword'},

};
