'use strict'

const socket = io()
socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log('Socket disconnect'))



angular
	.module('mean101', ['ngRoute'])
	.config(($routeProvider) =>
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
	.controller('ChatCtrl', function($scope, $http, $window) {
		$scope.typing = false;

		$scope.sendMessage = () => {
			const msg = {
				author: $scope.author,
				content: $scope.content
			}
			//instead of angular handling post we use the socket
			if (socket.connected) {
				socket.emit('postMessage', msg)
				return $scope.content = ''

			}
			$http.post('api/messages', msg)
			.then(() => $scope.messages.push(msg))
		}

		$scope.$watch('content', (curr, old) => {
			console.log(curr);
			if ($scope.typing && curr.length === 0) {
				socket.emit('stop typing');
			} else if (curr && curr.length > 0) {
				socket.emit('typing')
			}
		})

		//populating the initial messages
		$http.get('/api/messages')
			.then(({data: {messages}}) => {
				$scope.messages = messages
			})

		//receive new message
		socket.on('newMessage', msg => {
			$scope.messages.push(msg)
			//scope.apply for async stuff
			$scope.$apply()
		})

		socket.on('typing', () => {
			$scope.typing = true
			$scope.$apply()
		})

		socket.on('stop typing', () => {
			$scope.typing = false
			$scope.$apply()
		})
	})

