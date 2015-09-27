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
    $scope.filter = "";
    $scope.pagination = {
		currentPage : 1,
		itemsPerPage : 10,
        options : [5, 10, 20, 50, 100]
	};

    $http.get($scope.api + "dbname").then(function (res) {
        $scope.dbName = res.data;
    });

    $http.get($scope.api + "collections").then(function (res) {
        $scope.collections = res.data;
    });

    $scope.repaginate = function () {
        var start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
        var end = start + $scope.pagination.itemsPerPage;
        $scope.paginatedDocuments = $scope.documents.slice(start, end);
    };

    $scope.setCollection = function (c) {
        $scope.collection = c;
        $http.get($scope.api + "documents/" + $scope.collection).then(function (res) {
            if (res.data === void 0 || res.data === null || res.data.length === 0) {
                $scope.documents = null;
                $scope.paginatedDocuments = [];
            } else {
                $scope.documents = res.data;
                $scope.$watch("pagination.currentPage + '#' + pagination.itemsPerPage", function () {
    				$scope.repaginate();
    			});
            }
        });
    };

    $scope.postAndRefreshDocs = function (apiFunctionName, data, successMessage, callback) {
        $http.post($scope.api + apiFunctionName, data).then(function (res) {
            if (res.data.success && res.data.success === true) {
                $scope.setCollection($scope.collection);
                if (callback) {
                    callback();
                }
                if (successMessage) {
                    alert(successMessage);
                }
            } else {
                alert("An error occured.");
            }
        }, function () {
            alert("An error occured.");
        });
    };

    $scope.exportObject = function (obj, fileName) {
        saveAs(new Blob([
            angular.toJson(obj)
        ], {
            type : "application/json;charset=utf-8"
        }), fileName + ".json");
    };

    $scope.addDoc = function () {
        $scope.postAndRefreshDocs("newdocument", {
            collection : $scope.collection,
            document : $scope.newDoc
        }, "Document(s) added successfully.", function () {
            $scope.newDoc = "";
        });
    };

    $scope.removeAll = function () {
        if (!confirm("Are you sure? This will remove all documents from the selected collection!")) {
            return;
        }
        $scope.postAndRefreshDocs("clear", {
            collection : $scope.collection
        }, "Document(s) deleted successfully.");
    };

    $scope.remove = function (index) {
        if (!confirm("Are you sure you want to remove the selected document?")) {
            return;
        }
        $scope.postAndRefreshDocs("clear", {
            collection : $scope.collection,
            document : angular.toJson($scope.paginatedDocuments[index])
        }, "Document deleted successfully.");
    };

    $scope.export = function () {
        $scope.exportObject($scope.documents, $scope.collection);
    };

    $scope.exportDoc = function (index) {
        $scope.exportObject($scope.paginatedDocuments[index], $scope.collection + "_doc");
    };

    $scope.applyFilter = function () {
        $http.post($scope.api + "filter", {
            collection : $scope.collection,
            filter : $scope.filter
        }).then(function (res) {
            if (res.data === void 0 || res.data === null || res.data.length === 0) {
                $scope.documents = null;
                $scope.paginatedDocuments = [];
            } else {
                $scope.documents = res.data;
                $scope.repaginate();
            }
        }, function () {
            alert("An error occured.");
        });
    };

    $scope.resetFilter = function () {
        $scope.setCollection($scope.collection);
        $scope.filter = "";
    };
});
