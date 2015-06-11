'use strict';

angular.module('App')

.config(function($stateProvider) {
  $stateProvider
    .state('tabs', {
      abstract: true,
      url: '/tabs',
      templateUrl: 'views/tabs/tabs.html'
    });
});
