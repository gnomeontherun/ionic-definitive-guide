'use strict';

angular.module('App')

.factory('QuotesService', function($q, $http) {

  // Create a quotes service to simplify how to load data from Yahoo Finance
  var QuotesService = {};

  QuotesService.get = function(symbols) {
    // Convert the symbols array into the format required for YQL
    symbols = symbols.map(function(symbol) {
      return "'" + symbol.toUpperCase() + "'";
    });
    // Create a new deferred object
    var defer = $q.defer();
    // Make the http request
    $http.get('https://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in (' + symbols.join(',') + ')&format=json&env=http://datatables.org/alltables.env').success(function(quotes) {
      // The API is funny, if only one result is returned it is an object, multiple results are an array. This forces it to be an array for consistency
      if (quotes.query.count === 1) {
        quotes.query.results.quote = [quotes.query.results.quote];
      }
      // Resolve the promise with the data
      defer.resolve(quotes.query.results.quote);
    }).error(function(error) {
      // If an error occurs, reject the promise with the error
      defer.reject(error);
    });
    // Return the promise
    return defer.promise;
  };

  return QuotesService;
});
