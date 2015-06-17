'use strict';

angular.module('App')

.config(function($stateProvider) {
  // Declare the state for the quotes, with the template and controller
  $stateProvider
    .state('tabs.quotes', {
      url: '/quotes',
      views: {
        quotes: {
          controller: 'QuotesController',
          templateUrl: 'views/quotes/quotes.html'
        }
      }
    });
})

.controller('QuotesController', function($scope, $ionicPopup, $ionicLoading, LocalStorageService, QuotesService) {

  // Get symbols from localstorage, set default values
  var symbols = LocalStorageService.get('quotes', ['YHOO', 'AAPL', 'GOOG', 'MSFT', 'FB', 'TWTR']);
  $scope.form = {
    query: ''
  };
  $scope.state = {
    reorder: false
  };
  // Function to update the symbols in localstorage
  function updateSymbols() {
    var symbols = [];
    angular.forEach($scope.quotes, function(stock) {
      symbols.push(stock.Symbol);
    })
    LocalStorageService.update('quotes', symbols);
  }
  // Method to handle reordering of items in the list
  $scope.reorder = function(stock, $fromIndex, $toIndex) {
    $scope.quotes.splice($fromIndex, 1);
    $scope.quotes.splice($toIndex, 0, stock);
    updateSymbols();
  };
  // Method to load quotes, or show an alert on error, and finally close the loader
  $scope.getQuotes = function() {
    QuotesService.get(symbols).then(function(quotes) {
      $scope.quotes = quotes;
    }, function(error) {
      $ionicPopup.alert({
        template: 'Could not load quotes right now. Please try again later.'
      });
    }).finally(function() {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
  // Method to load a quote's data and add it to the list, or show alert for not found
  $scope.add = function() {
    if ($scope.form.query) {
      QuotesService.get([$scope.form.query]).then(function(results) {
        if (results[0].Name) {
          $scope.quotes.push(results[0]);
          $scope.form.query = '';
          updateSymbols();
        } else {
          $ionicPopup.alert({
            title: 'Could not locate symbol.'
          });
        }
      });
    }
  };
  // Method to remove a quote from the list
  $scope.remove = function($index) {
    $scope.quotes.splice($index, 1);
    updateSymbols();
  };
  // Method to give a class based on the quote price vs closing
  $scope.quoteClass = function(quote) {
    if (quote.PreviousClose < quote.LastTradePriceOnly) {
      return 'positive';
    }
    if (quote.PreviousClose > quote.LastTradePriceOnly) {
      return 'negative';
    }
    return '';
  };
  // Start by showing the loader the first time, and request the quotes
  $ionicLoading.show();
  $scope.getQuotes();

});
