var root = angular.module("root", ["ngMaterial", "angularUtils.directives.dirPagination"]);

// set api name here
root.value("apiName", "mongoman");  // set in app/confdata.js as well!

root.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme("default")
        // .dark()
        .primaryPalette("brown")
        .accentPalette("teal");
});

root.controller("mainController", function ($scope, $mdSidenav, apiName, $http) {
    $scope.api = "/" + apiName + "/";
    $scope.dbName = "";
    $scope.collections = [];
    $scope.collection = null;
    $scope.documents = null;
    $scope.newDoc = "";
    $scope.filter = "";
    $scope.pagination = {
		currentPage : 1,
		itemsPerPage : 10,
        options : [5, 10, 20, 50, 100]
	};

    $scope.toggleSidenav = function (menuId) {
        $mdSidenav(menuId).toggle();
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
            } else {
                $scope.documents = res.data;
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

    $scope.calcGlobalIndex = function (index) {
        return ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage + index;
    };

    $scope.remove = function (index) {
        if (!confirm("Are you sure you want to remove the selected document?")) {
            return;
        }
        $scope.postAndRefreshDocs("remove", {
            collection : $scope.collection,
            document : angular.toJson($scope.documents[$scope.calcGlobalIndex(index)])
        }, "Document deleted successfully.");
    };

    $scope.export = function () {
        $scope.exportObject($scope.documents, $scope.collection);
    };

    $scope.exportDoc = function (index) {
        $scope.exportObject($scope.documents[$scope.calcGlobalIndex(index)], $scope.collection + "_doc");
    };

    $scope.copyDocToClipBoard = function (index) {
        prompt("Copy to clipboard: Ctrl+C, Enter", angular.toJson($scope.documents[$scope.calcGlobalIndex(index)]));
    };

    $scope.applyFilter = function () {
        $http.post($scope.api + "filter", {
            collection : $scope.collection,
            filter : $scope.filter
        }).then(function (res) {
            if (res.data === void 0 || res.data === null || res.data.length === 0) {
                $scope.documents = null;
            } else {
                $scope.documents = res.data;
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
