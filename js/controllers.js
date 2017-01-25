var controllers = angular.module('controllers', []);
 

controllers.controller('MainCtrl',['$scope', '$window', 'FirebaseService','$location','$timeout', '$rootScope', 'helperService', function($scope, $window, FirebaseService, $location, $timeout,$rootScope, helperService) {
    
    $scope.$on("onUpdate", function() {
        console.log("Loaded: "+ $rootScope.appName +" --- list: "+$scope.list);
    });



    $scope.login = function(list) {
        if (list) {
           $scope.logging=true;
           FirebaseService.setList(list);
           $scope.list=FirebaseService.getList();
           $scope.todos = FirebaseService.returnToDo($scope.list);
           if( $scope.userCache.indexOf(list) >=0) {
                $scope.cached=true;
           } 
           else {
            $scope.userCache.push(list);
           }
           $scope.title=" - "+$scope.list; 
        }
    }

    $scope.logout = function() {
        $scope.title='- AngularJS';
        $scope.dash?$scope.toggleDash():''
        $scope.list='';
        $scope.newList.id='';
        $scope.cached=false;
        $scope.logging=false;
    }
    $scope.toogleStatus = function(todo) {
            var date= new Date();
            if (todo.done) {
                todo.done=false;
            }
            else {
                todo.done=true;
                todo.date = date;
            }
            FirebaseService.updateFirebase();
    };
    
    $scope.getLeftTodo = function() {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            if (todo.text && !todo.done     && !todo.archiveCheck) {
                count++;
            }   
        });
        return count;
    };

    $scope.getDoneTodo = function () {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            if (todo.text && todo.done && !todo.archiveCheck) {
                count++;
            }   
        });
        return count;
    };

    $scope.toggleArchives = function(){
         $location.path("/archive"); 
    };

    $scope.toggleList = function(){
         $location.path("/"); 
    };

    $scope.reFresh = function() {
        FirebaseService.handleRefresh();
    }

    // init
    
    $(".app").hide();
    $(".login").css("visibility", "visible");

    $scope.cached=false;
    $scope.userCache=[];
    $scope.logging=false;

    $scope.todos ='';
    $scope.user ='';

    $scope.dash=false;
    $scope.dashURL='#/dashboard'
    $scope.newTodoBg='#FFFFFF';
    $scope.title='- AngularJS';

    $scope.service = helperService;

}]);

controllers.controller('ToDoEdit', ['$scope', '$routeParams','FirebaseService', function($scope, $routeParams, FirebaseService) {
    $scope.reFresh();
        
    if ($scope.todos) {
       
        var keys = $scope.todos.$getIndex();
        var itemId = $routeParams.itemId;
        var indexKey = FirebaseService.getIndex(keys, itemId);

        $scope.editText=$scope.todos[indexKey].text;            //debounce hack refactor needed
        $scope.editColor=$scope.todos[indexKey].bg;
        var todo = $scope.todos[indexKey];
        todo.done ? todo.done=false : todo.done=true;
        FirebaseService.updateFirebase();
         
        $scope.update = function() {
                $scope.todos[indexKey].text =$scope.editText;
                if ($scope.editText) {
                    $scope.todos[indexKey].bg = $scope.editColor;
                    FirebaseService.updateFirebase();
                }
                if (!$scope.editText) {
                    FirebaseService.deleteItem(indexKey);
                    $scope.toggleList(); 
                }
        }
    }
}]);

controllers.controller('ToDoAdd',['$scope', 'FirebaseService', function($scope, FirebaseService ) {

    $scope.rand = function() {
            return Math.random().toString(36).substr(2); // remove `0.`
    };
    
    $scope.addTodo = function () {
         $scope.todos.$add({              // used to be $scope.myDataRef.push({
                text: $scope.newTodoText,
                done: false,
                date: '',
                bg:   $scope.newTodoBg ? $scope.newTodoBg : '',
                archiveCheck: false,
                index: $scope.rand()
            });
            $scope.newTodoText=''
            $scope.newTodoDate='';
            $scope.newTodoBg='#FFFFFF';         
            $scope.bounce();                             // call bounce animation --> NEEDS TO BE UPDATED with nganiamte
    };            
    
   // move to diretive
   $scope.bounce = function() {
        $("h2").animate({"font-size":"+=9px"},200,'swing',function(){
            $(this).animate({"font-size":"-=9px"},200)
        })
    };

    $scope.archive = function() {
        angular.forEach($scope.todos, function(todo) {
            if (todo.done) {
                todo.archiveCheck=true;
            }
        });
        FirebaseService.updateFirebase();
    };
}]);


controllers.controller('ArchiveCtrl', ['$scope',  function ($scope) {
    $scope.reFresh();
}]);


controllers.controller('DashboardCtrl', ['$scope', function ($scope) {
    $scope.reFresh();

    $scope.statuses= [
        {name: "Active"},
        {name: "Complete"},
    ];
    $scope.jobs =[];

    angular.forEach($scope.todos, function(todo) {
        if (todo.done && todo.text) {
            $scope.jobs.push({done: "Complete"});    
        }
        else if (!todo.done && todo.text) {
            $scope.jobs.push({done: "Active"});    
        }
    });
}]);