var controllers = angular.module('controllers', []);
 

 

controllers.controller('MainCtrl',['$scope', '$window', 'FirebaseService','$location',  function($scope, $window, FirebaseService, $location) {
    

    $scope.todos = FirebaseService.returnToDo('test');
    $scope.newTodoBg='#FFFFFF';
    $scope.sortHolder='';

    $scope.logout =function() {
        console.log("HI")
         $scope.newUser='';
         $(".app").addClass("hidden");
         $(".login").removeClass("hidden");
           $location.path("/"); 
    }



    $scope.setUser = function(user) {
           console.log(user);
           FirebaseService.setUser(user);
           $scope.todos = FirebaseService.returnToDo(FirebaseService.getUser());
           $(".app").removeClass("hidden");
           $(".login").addClass("hidden");

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
//            todo.bg="#FFFFFF"
            FirebaseService.updateFirebase();
    };

    $scope.returnSort = function() {
        return $scope.sort;
    };

    $scope.setSort = function(value) {
        $scope.sort=value;  
        $scope.sortHolder=value;
        if (!value) {value="all"};
        $(".btn").addClass("btn-default");
        $("#"+value).removeClass("btn-default");


    };
 

    $scope.getTotalAll = function () {
        var count = 0;
        angular.forEach($scope.todos, function (todo) {
            if (!todo.archiveCheck && todo.text) {
                    count++;

            }
            
        });
        return count;
    };

     $scope.getTotalLeft = function() {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            if (todo.text && !todo.done && !todo.archiveCheck) {
                count++;
            }   
        });
        return count;
     };



    $scope.getTotalDone = function () {
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
    


}]);

controllers.controller('ToDoEdit', ['$scope', '$routeParams', 'FirebaseService', function($scope, $routeParams,FirebaseService) {
        
       var keys = $scope.todos.$getIndex();
       var itemId = $routeParams.itemId;
       var indexKey;

        angular.forEach(keys, function(key) {           // make into fireservice index function lookup takes index and treutrns keyIndex
           if (itemId === $scope.todos[key].text) {
             indexKey=key;
           }
        });       

       $scope.editText=$scope.todos[indexKey].text;
       $scope.editColor=$scope.todos[indexKey].bg;
       var todo = $scope.todos[indexKey];
       todo.done ? todo.done=false : todo.done=true;
       FirebaseService.updateFirebase();
         

       $scope.update = function() {
                $scope.todos[indexKey].text =$scope.editText;
                $scope.todos[indexKey].bg = $scope.editColor;
                FirebaseService.updateFirebase();
       }
}]);

controllers.controller('ToDoArchive',['$scope', 'FirebaseService', function($scope, FirebaseService ) {
    $scope.undo = function (todo) {
        todo.archiveCheck=false;
        todo.done=false;
        FirebaseService.updateFirebase();
    };   
  
    $scope.remove = function (text) { 
        var keys = $scope.todos.$getIndex();
        var indexKey;

        angular.forEach(keys, function(key) { // make into fireservice index function lookup takes index and treutrns keyIndex
           if (text === $scope.todos[key].text) {
             indexKey=key;
           }
        });
        $scope.todos.$child(indexKey).$remove(); 
    };
    
    
}]);




controllers.controller('ToDoCtrl',['$scope', 'FirebaseService', function($scope, FirebaseService ) {
    $scope.setSort($scope.sortHolder);

    $scope.addTodo = function () {
         $scope.todos.$add({              // used to be $scope.myDataRef.push({
                text: $scope.newTodoText,
                done: false,
                date: '',
                bg:   $scope.newTodoBg ? $scope.newTodoBg : '',
                archiveCheck: false
            });



            $scope.clearData();                          // clear newTodo data object
            $scope.bounce();                             // call bounce animation --> NEEDS TO BE UPDATED with nganiamte
           
     
    };  

    $scope.clearData = function () {
        $scope.newTodoText=''
        $scope.newTodoDate='';
        $scope.newTodoBg='#FFFFFF';
    };
    
  
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






