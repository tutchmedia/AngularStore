
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
      })
      .otherwise({
        redirectTo: '/store'
    });


}])
.service('countryService', ['parseRepositories', function($repos) {
    var Countries = $repos.CreateRepository('Products', {
        'all' : {
            'queries':['query.ascending("title");','query.limit(1000);', 'query.include("flag");']
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
    ]);

    return Countries;


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
.controller('testCtrl', ['$scope', 'countryService', '$routeParams', 'cartService', function($scope, countries, $routeParams, cartService){
    $scope.Countries = [];
    $scope.editCountry = countries.create();
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.maxSize = 100;

    $scope.filterCountries = [];

    $scope.cart = cartService;

    // Initialization
    countries.all().then(function(result){
        $scope.Countries = result;
    });


    // Fetch a single product
    if ($routeParams.productSku != null) {

        countries.get($routeParams.productSku).then(
            function(result) {
                $scope.product = result;
            }
        );

        //$scope.Countries = countries.get($routeParams.productSku);
    }





}])
.controller('storeController', ['$scope', '$routeParams', 'countryService', 'cartService', function($scope, $routeParams, countries, cartService){

    $scope.cart = cartService;

}]);
