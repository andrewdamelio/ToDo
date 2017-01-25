var ToDoApp = angular.module('ToDoApp', [
  'ngRoute',
  'controllers',
  'firebase'
]);
  
ToDoApp.value('appName', 'Todo AngularJS');

ToDoApp.run(function($rootScope, appName) {
    $rootScope.appName = appName;
});

ToDoApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'partials/todo.html',
    controller: 'ToDoAdd'
  }).
  when('/archive', {
    templateUrl: 'partials/archive.html',
    controller: 'ArchiveCtrl'
  }).  
  when('/item/:itemId', { 
    templateUrl: 'partials/edit.html',
    controller: 'ToDoEdit'
  }).
  when('/dashboard', {
    templateUrl: 'partials/dashboard.html', 
    controller: 'DashboardCtrl'
  }).  
  otherwise({
    redirectTo: '/'
  });
}]);  

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
 
ToDoApp.factory('FirebaseService', function ($firebase, $rootScope, $location) {
      var myDataRef;
      var todos;
      var list;
      var index;
      
      var returnToDo = function(list) {
          myDataRef = new Firebase('https://nero.firebaseio.com/'+list);
          todos = $firebase(myDataRef); 
          $rootScope.$broadcast('onUpdate');
          return todos;
      }

      var updateFirebase = function() { 
          todos.$save(); // optimize code here - pass in index i.e todos.$save('-JL5zwt2mw5ed01LdTGR');
      }

      var setList= function(currentList) {
         list = currentList;
      }

      var getList= function(currentList) {
         return list;
      }

      var handleRefresh = function () {   
          if (!todos) {
              $location.path("/");
          }
      }

      var getIndex = function(keys, id) {
          angular.forEach(keys, function(key) {   
             if (id === todos[key].index) {
               index=key;
             }
          });
          return index;   
      }

      var deleteItem = function(index) {
         //todos.$child(index).$remove();             
          todos.$remove(index);
      }
      
      return {
          returnToDo : returnToDo,
          updateFirebase : updateFirebase,
          setList : setList,
          getList : getList ,
          handleRefresh: handleRefresh,
          deleteItem : deleteItem,
          getIndex : getIndex
      }
});

ToDoApp.factory('helperService', function() {

    var sorts=[true,false,true];     // Active | All | Complete
    var sort=''                      // last sort
    
    var setSorts = function(value) {
        var val='';
        sorts=[true,true,true]
        if (value==='Active') {
            val=false;
            sorts[0]=false;
        }
        else if (value ==='Complete') {
            val=true;
            sorts[2]=false;
        }   
        else {
            val='';
            sorts[1]=false;            
        }
        sort=val;
        return val;
    }

    var getSorts = function() {
        return sorts;
    }

    var getSort = function() {
        return sort;
    }

    return {
      setSorts : setSorts,
      getSorts: getSorts,
      getSort: getSort
    }
});

ToDoApp.directive('login', ['$timeout',  function ($timeout) {
  var openApp = function(scope) {
            $(".login").fadeOut(100,function() {
                $(".app").css("visibility", "visible");
                $timeout(function(){
                   $(".app").slideDown(200);
                }, 100);            
            }); 
  }
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        element.on('click', function() {
          if (scope.cached) {
              openApp(scope);  
          }
          else {
             scope.todos.$on('loaded', function() { 
               openApp(scope);  
              })
          }
      })
    }
  }
}]);

ToDoApp.directive('logout', ['$location','$timeout', function ($location,$timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        element.on('click', function() {
             $(".app").fadeOut(150, function() {
                 $(".login").fadeIn(150, function() {
                    $timeout(function(){
                        scope.service.setSorts('All');          
                        $location.path("/");
                     }, 100);                     
                 });
             });
          })
    }
  };
}]);

ToDoApp.directive('dash', [function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        scope.toggleDash = function() {
            if (!scope.dash) {
              scope.dash=true;
              scope.dashURL='#/dashboard'
            }
            else {
              scope.dash=false;
              scope.dashURL='#/'
            }
          }
    }
  };
}])

ToDoApp.directive('sort', [function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
          scope.sorts=scope.service.getSorts();    // get starting settings of sort options
          scope.sort =scope.service.getSort();   // keep last sort option selected
          
          scope.$watch('service.getSort()',function() {
              scope.sorts=scope.service.getSorts();    // get starting settings of sort options
              scope.sort =scope.service.getSort();   // keep last sort option selected
          })
          scope.setSort = function(value) {
              scope.sort=scope.service.setSorts(value);
          };
      }
    };
}])

ToDoApp.directive('controls', function (FirebaseService) {
    var linker = function (scope, element, attrs) {
      $('.search').focus(function() {
          $(".glyphicon-search").addClass('search-focus');
      });
      $('.search').blur(function() {
          $(".glyphicon-search").removeClass('search-focus');
      });
 
      scope.delete = function (id) {
          var keys = scope.todos.$getIndex();
          FirebaseService.deleteItem(FirebaseService.getIndex(keys, id));
      };

      scope.undo = function (todo) {
            todo.archiveCheck=false;
            todo.done=false;
            FirebaseService.updateFirebase();
      };   
    };
    return {
        restrict: 'A',
        link:linker
    };
});

ToDoApp.directive('footer', [function () {
  return {
    restrict: 'E',
    replace:  true,
    template: "<div class='panel-footer'><github></github><div class='pull-right'><font size='-2' ><b>built with&nbsp;</b><sup><a href='https://angularjs.org/'><img src='assets/angular.png' height='20px'/></a>&nbsp;&nbsp;<a href='https://www.firebase.com/'><img src='assets/firebase.jpeg' height='20px'/></a></sup></font></div></br></div>"
  }
}]);
        
ToDoApp.directive('github', [function () {
  return {
    restrict: 'E',
    replace: true,
    template: "<a href='https://github.com/andrewdamelio/ToDo'><svg class='github' version='1.1' id='Layer_2' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='15.835px' height='18.164px' viewBox='242.137 3.418 15.835 18.164' enable-background='new 242.137 3.418 15.835 18.164' xml:space='preserve'>                <path fill='#333' stroke='#333' stroke-width='1' stroke-miterlimit='10' d='M256.255,3.943c0,0-0.904-0.292-2.967,1.107c-0.864-0.239-1.787-0.359-2.704-0.363c-0.919,0.004-1.843,0.124-2.705,0.363c-2.063-1.398-2.97-1.107-2.97-1.107c-0.587,1.486-0.217,2.585-0.106,2.858c-0.691,0.755-1.112,1.719-1.112,2.898c0,4.14,2.522,5.066,4.92,5.339c-0.309,0.271-0.587,0.747-0.686,1.445c-0.616,0.276-2.18,0.752-3.144-0.897c0,0-0.57-1.038-1.655-1.114c0,0-1.055-0.013-0.074,0.657c0,0,0.708,0.332,1.199,1.58c0,0,0.634,2.101,3.638,1.448c0.006,0.901,0.016,1.581,0.016,1.838c0,0.281,0-0.266-0.021,0.541c0.193,0.675,1.512,0.531,2.698,0.531c1.187,0,2.291,0.167,2.65-0.551c0.14-0.686,0.029-0.238,0.029-0.521c0-0.355,0.011-1.52,0.011-2.964c0-1.008-0.345-1.667-0.733-2c2.406-0.268,4.933-1.181,4.933-5.331c0-1.179-0.419-2.143-1.109-2.898C256.476,6.528,256.847,5.429,256.255,3.943z'></path></svg></a"
    }
}]);





// Credit to Lukas Ruebbelke for the below - this guy rocks check him out! https://github.com/simpulton
ToDoApp.directive('chart', function () {
    var parseDataForCharts = function (sourceArray, sourceProp, referenceArray, referenceProp) {
        
        var data = [];
        referenceArray.each(function (r) {
            var count = sourceArray.count(function (s) {
                return s[sourceProp] == r[referenceProp];
            });
            data.push([r[referenceProp], count]);
        });
        return data;
    };

    var linker = function (scope, element, attrs) {
        scope.data = parseDataForCharts(scope.sourceArray, attrs['sourceProp'], scope.referenceArray, attrs['referenceProp']);

        if (element.is(':visible')) {

            $.plot(element, [ scope.data ], {
                series: {
                    bars: {
                        show: true,
                        barWidth: 0.7,
                        align: "center"
                    }
                },
                xaxis: {
                    mode: "categories",
                    tickLength: 0
                }
            });
        }
    };

    return {
        restrict: 'A',
        link: linker,
        scope: {
            sourceArray: '=',
            referenceArray: '='
        }
    };
});


