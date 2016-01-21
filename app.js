'use strict';
angular.module('app', ['parse', 'ngRoute', 'ui.bootstrap'])
.config(['$routeProvider', 'parseRepositoriesProvider', function($routeProvider, provider){
   provider.init(Parse, "pCoojHpPizZaqvWg8HHl62N1NbANUvdS7plu3llV", "vr4HSF6g1NvR6h6umcZgRzCdHy1snnBNU1rvb9pZ")


   $routeProvider.
      when('/store', {
        templateUrl: 'partials/store.html',
        controller: 'testCtrl'
      }).
      when('/product/:productSku', {
        templateUrl: 'partials/product.html',
        controller: 'testCtrl'
      }).
      when('/cart', {
        templateUrl: 'partials/shoppingCart.html',
        controller: 'storeController'
      }).
      when('/signin', {
        templateUrl: 'partials/login.html',
        controller: 'loginController'
      }).
      when('/signout', {
        templateUrl: 'partials/logout.html',
        controller: 'signoutController'
      }).
      when('/account', {
        templateUrl: 'partials/account.html',
        controller: 'accountController'
      })
      .otherwise({
        redirectTo: '/store'
    });


}])
.service('siteSettings', function() {

  return {
    siteTitle: "My Store",
    siteSubTitle: "A tag line for this web site."
  }


})
.service('countryService', ['parseRepositories', function($repos) {

    var Countries = $repos.CreateRepository('Products', {
        'all' : {
            'queries':['query.ascending("title");','query.limit(1000);', 'query.include("flag");']
        },
        'get' : {
            'queries':['query.equalTo("cat", );']
        }
    });

    //delete Countries.create;
    delete Countries.delete;

    $repos.GettersAndSetters(Countries, [
        {angular:'sku', parse:'objectId'},
        {angular:'name', parse:'title'},
        {angular:'image', parse:'image'},
        {angular:'price', parse:'price'},
        {angular:'description', parse:'description'},
        {angular:'inStock', parse:'inStock'},
        {angular:'category', parse:'cat'}
    ]);

    return Countries;


}])
.service('categoryService', ['parseRepositories', function($repos) {

    var Categories = $repos.CreateRepository('Categories', {
        'all' : {
            'queries':['query.ascending("name");','query.limit(1000);']
        }
    });

    //delete Categories.delete;

    $repos.GettersAndSetters(Categories, [
        {angular:'c_id', parse:'objectId'},
        {angular:'name', parse:'name'},
        {angular:'cat_id', parse:'cat_id'}
    ]);

    return Categories;
}])
.service('loginService', ['parseRepositories', function($repos) {

    var User = $repos.CreateRepository('_User', {
        'all' : {
            'queries':['query.limit(100);']
        }
    });

    //delete Countries.create;
    //delete Countries.delete;

    $repos.GettersAndSetters(User, [
        {angular:'id', parse:'objectId'},
        {angular:'username', parse:'username'},
        {angular:'password', parse:'password'}
    ]);

    return User;


}])
.service('cartService', [ function() {

    var myCart = new shoppingCart("AngularStore");

    // enable PayPal checkout
    // note: the second parameter identifies the merchant; in order to use the
    // shopping cart with PayPal, you have to create a merchant account with
    // PayPal. You can do that here:
    // https://www.paypal.com/webapps/mpp/merchant
    myCart.addCheckoutParameters("PayPal", "paypaluser@youremail.com");

    // enable Google Wallet checkout
    // note: the second parameter identifies the merchant; in order to use the
    // shopping cart with Google Wallet, you have to create a merchant account with
    // Google. You can do that here:
    // https://developers.google.com/commerce/wallet/digital/training/getting-started/merchant-setup
    myCart.addCheckoutParameters("Google", "xxxxxxx",
        {
            ship_method_name_1: "UPS Next Day Air",
            ship_method_price_1: "20.00",
            ship_method_currency_1: "USD",
            ship_method_name_2: "UPS Ground",
            ship_method_price_2: "15.00",
            ship_method_currency_2: "USD"
        }
    );

    // enable Stripe checkout
    // note: the second parameter identifies your publishable key; in order to use the
    // shopping cart with Stripe, you have to create a merchant account with
    // Stripe. You can do that here:
    // https://manage.stripe.com/register
    myCart.addCheckoutParameters("Stripe", "pk_test_xxxx",
        {
            chargeurl: "https://localhost:1234/processStripe.aspx"
        }
    );

    return myCart;


}])
.controller('rootCtrl', ['$scope','siteSettings','$rootScope','parseRepositories','cartService', function($scope, siteSettings, $rootScope, $repos, cartService) {
    $scope.siteTitle = siteSettings.siteTitle;
    $scope.siteSubTitle = siteSettings.siteSubTitle;

    $scope.cart = cartService;

    $rootScope.currentUser = Parse.User.current();

    $rootScope.loggedIn = function() {
      if($rootScope.currentUser === null) {
        return false;
      } else {
        return true;
      }
    };

    $scope.logout = function() {
      $rootScope.currentUser = null;
      Parse.User.logOut();
    };




}])
.controller('testCtrl', ['$scope', 'countryService', '$routeParams', 'cartService', 'siteSettings', 'categoryService', function($scope, countries, $routeParams, cartService, siteSettings, categories){
    $scope.Countries = [];
    $scope.Categories = [];
    $scope.editCountry = countries.create();
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.maxSize = 100;

    $scope.filterCountries = [];


    // Initialization
    countries.all().then(function(result){
        $scope.Countries = result;
    });

    categories.all().then(function(result){
        $scope.Categories = result;
    });


    // Fetch a single product
    if ($routeParams.productSku != null) {

        countries.get($routeParams.productSku).then(
            function(result) {
                $scope.product = result;
            }
        );
    }



}])
.controller('storeController', ['$scope', '$routeParams', 'categoryService', 'cartService', 'siteSettings', function($scope, $routeParams, categories, cartService, siteSettings){

    $scope.cart = cartService;

    console.log("Testing.");


}])
.controller('loginController', ['$scope', '$routeParams', 'loginService', 'siteSettings', '$location', '$route', '$rootScope', function($scope, $routeParams, users, siteSettings, $location, $route, $rootScope) {

    console.log("Login Controller Loaded");
    // Do check to forward the user away from the login page if they are already signed in
    if($rootScope.loggedIn() === true) {
      $location.path("/");
    }

    function loginSuccessful(user) {
      $rootScope.$apply(function() {
        $rootScope.currentUser = Parse.User.current();
        $location.path("/");
      });
    }

    function loginUnsuccessful(user, error) {
      alert("Error: " + error.message + " (" + error.code + ")");
    }

    $scope.login = function() {
      var username = $scope.login.username;
      var password = $scope.login.password;

      Parse.User.logIn(username, password, {
        success: loginSuccessful,
        error: loginUnsuccessful
      });
    };


}])
.controller('signoutController', ['$scope', '$routeParams', 'loginService', '$location', 'siteSettings', function($scope, $routeParams, users, $location, settings) {

    console.log("Logged Out");

    Parse.User.logOut();
    settings.currentUser = Parse.User.current();
    $location.path('/');

}])
.controller('accountController', ['$scope', '$routeParams', 'loginService', '$location', 'siteSettings', '$rootScope', function($scope, $routeParams, users, $location, settings, $rootScope) {

    console.log("Logged Out");

    $scope.currentUser = $rootScope.currentUser;



}]);
