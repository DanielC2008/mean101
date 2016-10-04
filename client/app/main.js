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
		let typing = false;
		$scope.userTyping = false;

		$scope.sendMessage = () => {
			const msg = {
				author: $scope.author,
				content: $scope.content
			}
			//instead of angular handling post we use the socket
			if (socket.connected) {
				socket.emit('postMessage', msg)
				$scope.content = ''
				return

			}
			$http.post('api/messages', msg)
			.then(() => $scope.messages.push(msg))
		}

		$scope.$watch('content', (curr, old) => {
			if (typing && curr.length === 0) {
				typing = false
				socket.emit('stop typing');
			} else if (curr && curr.length > 0) {
				typing = true
				socket.emit('typing', {
					user: $scope.author
				})
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

		socket.on('typing', (user) => {
			$scope.userTyping = user.user
			$scope.$apply()
		})

		socket.on('stop typing', () => {
			$scope.userTyping = false
			$scope.$apply()
		})
	})

