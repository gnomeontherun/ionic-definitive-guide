'use strict';

angular.module('App')

.config(function($stateProvider) {
  // Declare the state for the portfolio, with the template and controller
  $stateProvider
    .state('tabs.portfolio', {
      url: '/portfolio',
      views: {
        portfolio: {
          controller: 'PortfolioController',
          templateUrl: 'views/portfolio/portfolio.html'
        }
      }
    });
})

.controller('PortfolioController', function($scope, $ionicModal, $ionicPopup, LocalStorageService, QuotesService) {
  // Create the portfolio model from localstorage, and other models
  $scope.portfolio = LocalStorageService.get('portfolio', []);
  $scope.item = {};
  $scope.state = {
    remove: false
  };
  // Private method to update the portfolio
  function updatePortfolio() {
    LocalStorageService.update('portfolio', $scope.portfolio);
  }
  // Method to get the latest quotes
  $scope.getQuotes = function() {
    var symbols = [];
    angular.forEach($scope.portfolio, function(stock) {
      if (symbols.indexOf(stock.symbol) < 0) {
        symbols.push(stock.symbol);
      }
    });

    if (symbols.length) {
      QuotesService.get(symbols).then(function(quotes) {
        var items = {};
        angular.forEach(quotes, function(quote) {
          items[quote.Symbol] = quote;
        });
        $scope.quotes = items;
      });
    }
  };
  // Method to calculate the current value of the stocks
  $scope.getCurrentValue = function(stock) {
    return parseFloat($scope.quotes[stock.symbol].LastTradePriceOnly) * stock.quantity;
  };
  // Method to calculate the change in value
  $scope.getChange = function(stock) {
    return $scope.getCurrentValue(stock) - stock.price * stock.quantity;
  };
  // Method to determine if the stock has positive or negative return for background color
  $scope.quoteClass = function(stock) {
    if (!stock) {
      return '';
    }
    var className = '';
    var currentValue = $scope.getCurrentValue(stock);
    if (currentValue && currentValue > stock.price) {
      className = 'positive';
    } else if (currentValue && currentValue < stock.price) {
      className = 'negative';
    }

    return className;
  }
  // Create an Ionic modal instance for adding a new stock
  $ionicModal.fromTemplateUrl('views/portfolio/add-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  // Open the modal
  $scope.openModal = function() {
    $scope.modal.show();
  };
  // Close the modal and reset the model
  $scope.closeModal = function() {
    $scope.item = {};
    $scope.modal.hide();
  };
  // Ensure the modal is completely destroyed after the scope is destroyed
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Method to add a new stock purchase
  $scope.addStock = function(item) {
    $scope.state.remove = false;
    QuotesService.get([item.symbol]).then(function(quote) {
      if (quote[0].Name) {
        item.symbol = item.symbol.toUpperCase();
        $scope.portfolio.push(item);
        updatePortfolio();
        $scope.closeModal();
        $scope.getQuotes();
      } else {
        $ionicPopup.alert({
          title: 'Could not find symbol.'
        });
      }
    });
  };
  // Method to remove an item from the portfolio
  $scope.remove = function($index) {
    $scope.portfolio.splice($index, 1);
    updatePortfolio();
  };
  // Get the quotes on load
  $scope.getQuotes();

});
