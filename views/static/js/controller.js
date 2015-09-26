var root = angular.module("root", ["ui.bootstrap"]);

// set api name here
root.value("apiName", "mongoman");  // set in app/confdata.js as well!

root.controller("mainController", function ($scope, apiName, $http) {
    $scope.api = "/" + apiName + "/";
    $scope.dbName = "";
    $scope.collections = null;
    $scope.collection = null;
    $scope.documents = null;
    $scope.newDoc = "";
    $scope.pagination = {
		currentPage : 1,
		itemsPerPage : 10
	};

    $http.get($scope.api + "dbname").then(function (res) {
        $scope.dbName = res.data;
    });

    $http.get($scope.api + "collections").then(function (res) {
        $scope.collections = res.data;
    });

    $scope.setCollection = function (c) {
        $scope.collection = c;
        $http.get($scope.api + "documents/" + $scope.collection).then(function (res) {
            if (res.data === void 0 || res.data === null || res.data.length === 0) {
                $scope.documents = null;
                $scope.paginatedDocuments = [];
            } else {
                $scope.documents = res.data;
                $scope.$watch("pagination.currentPage", function (val) {
    				var start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
    				var end = start + $scope.pagination.itemsPerPage;
    				$scope.paginatedDocuments = $scope.documents.slice(start, end);
    			});
            }
        });
    };

    $scope.addDoc = function () {
        $http.post($scope.api + "newdocument", {
            collection : $scope.collection,
            document : $scope.newDoc
        }).then(function (res) {
            if (res.data.success && res.data.success === true) {
                $scope.setCollection($scope.collection);
                $scope.newDoc = "";
                alert("Document(s) added successfully.");
            } else {
                alert("An error occured.");
            }
        }, function () {
            alert("An error occured.");
        });
    };

    $scope.removeAll = function () {
        if (!confirm("Are you sure? This will remove all documents from the selected collection!")) {
            return;
        }
        $http.post($scope.api + "clear", {
            collection : $scope.collection
        }).then(function (res) {
            if (res.data.success && res.data.success === true) {
                $scope.setCollection($scope.collection);
                alert("Document(s) deleted successfully.");
            } else {
                alert("An error occured.");
            }
        }, function () {
            alert("An error occured.");
        });
    };

    $scope.remove = function (index) {
        $http.post($scope.api + "remove", {
            collection : $scope.collection,
            document : angular.toJson($scope.paginatedDocuments[index])
        }).then(function (res) {
            if (res.data.success && res.data.success === true) {
                $scope.setCollection($scope.collection);
                alert("Document deleted successfully.");
            } else {
                alert("An error occured.");
            }
        }, function () {
            alert("An error occured.");
        });
    };

    $scope.export = function () {
        saveAs(new Blob([
            angular.toJson($scope.documents)
        ], {
            type : "application/json;charset=utf-8"
        }), $scope.collection + ".json");
    };
});
