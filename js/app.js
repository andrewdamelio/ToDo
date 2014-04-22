var ToDoApp = angular.module('ToDoApp', [
  'ngRoute',
  'controllers',
  'firebase'
]);

ToDoApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'partials/todo.html',
    controller: 'ToDoCtrl'
  }).
  when('/archive', {
    templateUrl: 'partials/archive.html',
    controller: 'ToDoArchive'
  }).  
  when('/:itemId', { 
    templateUrl: 'partials/edit.html',
    controller: 'ToDoEdit'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);  

ToDoApp.directive('footer', [function () {
  return {
    restrict: 'E',
    replace:  true,
    template: "<div class='panel-footer'><div class='pull-right'><font size='-2' ><b>built with&nbsp;</b><sup><a href='https://angularjs.org/'><img src='assets/angular.png' height='20px'/></a>&nbsp;&nbsp;<a href='https://www.firebase.com/'><img src='assets/firebase.jpeg' height='20px'/></a></sup></font></div></br></div>"
  }
}])
         


ToDoApp.filter('array', function() {
  return function(items) {
    var filtered = [];
    angular.forEach(items, function(item) {
      if (item.text) {
           filtered.push(item);
      }
    });

   return filtered;
  };
});

ToDoApp.directive('transit', function(){
      var linker = function(scope, element, attrs) {
        element.hover(
          function () {
              $(this).transition({ scale: 1.4 });
          },
          function () {
            $(this).transition({ scale: 1 });
          }
        );        
      };
      
      return {
        link: linker
      }
    })
    

ToDoApp.factory('FirebaseService', function ($firebase) {
      var myDataRef;
      var todos;
      var user;

      var returnToDo = function(user) {
          if (!user) {
           myDataRef = new Firebase('https://nero.firebaseio.com/andydrew'); 
          }
          else {
            myDataRef = new Firebase('https://nero.firebaseio.com/'+user);
          }
          todos = $firebase(myDataRef); 
          return todos;
      }

      var updateFirebase = function() { 
          todos.$save();
      }

      var setUser= function(currentUser) {
         user = currentUser;
      }

      var getUser= function(currentUser) {
         return user;
      }
      return {
          returnToDo : returnToDo,
          updateFirebase : updateFirebase,
          setUser : setUser,
          getUser : getUser 
      }
});

