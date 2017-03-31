//Controller for socket events used throughout the page.
angular.module('lobbyApp').controller ('socketCtrl', function ($scope, $window, socket) {
    //Send this event to notify server of a new connection.
    socket.on ('connect', function() {
        var userId = $window.userId;
        var username = $window.username;
        var userRole = $window.userRole;
        var moduleId = $window.moduleId;
        var tutorialId = $window.tutorialId;
        
        var data = {
            'userId' : userId,
            'username' : username,
            'userRole' : userRole,
            'moduleId' : moduleId,
            'tutorialId' : tutorialId
        };
        
        socket.emit ('new connection', data);
    });

    socket.on ('invalid', function() {
        socket.setConnectionState (socket.INVALID());
    });

    socket.on ('login', function(data) {
        socket.setUserType (data.userType);
        socket.setConnectionState (socket.CONNECTED());
    });
});