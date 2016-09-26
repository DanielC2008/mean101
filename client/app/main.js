'use strict'

angular
	.module('mean101', ['ngRoute'])
	.config($routeProvider =>
		$routeProvider
			.when('/', {
				controller: 'main',
				templateUrl: 'partials/main.html'
			})
			.when('/chat', {
				controller: 'ChatCtrl',
				templateUrl: 'partials/chat.html'
			})
	)
	.controller('main', function($scope, $http) {
		$http.get('/api/title')
			.then(({data: {title}}) =>
			$scope.title = title
		)
	})
	.controller('ChatCtrl', function($scope, $http) {
		$scope.sendMessage = () => {
			const msg = {
				author: $scope.author,
				content: $scope.content
			}
			$http.post('api/messages', msg)
			.then(() => $scope.messages.push(msg))
		}

		$http.get('/api/messages')
			.then(({data: {messages}}) => {
				$scope.messages = messages
			})
	})
