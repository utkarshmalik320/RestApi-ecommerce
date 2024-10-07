// config/routes.js
module.exports.routes = {
  // =================user Controller=====================================

  'POST /user/add': { controller: 'user/userController', action: 'adduser'},
  'POST /user/edit': { controller: 'user/userController', action: 'edituser'},
  'DELETE /user/delete': { controller: 'user/userController', action: 'deleteuser'},
  'GET /user/details': { controller: 'user/userController', action: 'fetchUserDetails'},

  // =================Apps Controller=====================================
  'POST /user/reset-password': { controller: 'apps/AppsController', action: 'resetPassword'},
  'POST /user/login': { controller: 'apps/AppsController', action: 'loginuser'},
  'POST /user/logout': { controller: 'apps/AppsController', action: 'logoutuser'},

  // =================Product Controller=====================================
  'POST /product/add': { controller: 'products/ProductController', action: 'addProduct'},
  'POST /product/edit': { controller: 'products/ProductController', action: 'editProduct'},
  'DELETE /product/delete': { controller: 'products/ProductController', action: 'deleteProduct'},
  'GET /product/all': { controller: 'products/ProductController', action: 'getAllProducts'},
  'GET /product/details': { controller: 'products/ProductController', action: 'getProductDetails'},
  'POST /product/category': { controller: 'products/ProductController', action: 'fetchProductsByCategory'},
  'GET /product/category/all': { controller: 'products/ProductController', action: 'fetchUniqueCategories'},

  // =================Order Controller=====================================
  'POST /order/create': { controller: 'orders/OrderController', action: 'createOrder'},
  'GET /orders/details': { controller: 'orders/OrderController', action: 'getAllOrders'},
  'POST /orders/by/user': { controller: 'orders/OrderController', action: 'getSingleOrder'},
  'POST /orders/status/update': { controller: 'orders/OrderController', action: 'updateOrderStatus'},


  // =================Seller user Controller=====================================
  'POST /seller/account/add': { controller: 'sellerAccount/SellerAccountController', action: 'addSeller'},
  'POST /seller/account/edit': { controller: 'sellerAccount/SellerAccountController', action: 'editSeller'},
  'DELETE /seller/account/delete': { controller: 'sellerAccount/SellerAccountController', action: 'deleteSeller'},
  'GET /account/seller/details': { controller: 'sellerAccount/SellerAccountController', action: 'fetchSellerDetails'},


  // =================Seller Account Controller=====================================
  'POST /seller/account/login': { controller: 'sellerApps/SellerAppsController', action: 'login'},
  'POST /seller/account/logout': { controller: 'sellerApps/SellerAppsController', action: 'logout'},
  'POST /seller/account/reset-password': { controller: 'sellerApps/SellerAppsController', action: 'resetPassword'},

  // =================Add To Cart Controller=====================================
  'POST /add/to/cart/': { controller: 'cart/CartController', action: 'addToCart'},
  'POST /remove/from/cart': { controller: 'cart/CartController', action: 'removeFromCart'},
  'GET /fetch/cart/details': { controller: 'cart/CartController', action: 'fetchCartDetails'},

};
