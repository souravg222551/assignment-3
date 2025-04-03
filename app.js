(function () {
    'use strict';

    angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

    // Controller
    NarrowItDownController.$inject = ['MenuSearchService'];
    function NarrowItDownController(MenuSearchService) {
        var ctrl = this;
        ctrl.searchTerm = "";
        ctrl.found = [];
        ctrl.nothingFound = false;

        ctrl.narrowItDown = function () {
            if (!ctrl.searchTerm.trim()) {
                ctrl.found = [];
                ctrl.nothingFound = true;
                return;
            }
            MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
            .then(function (items) {
                ctrl.found = items;
                ctrl.nothingFound = items.length === 0;
            });
        };

        ctrl.removeItem = function (index) {
            ctrl.found.splice(index, 1);
        };
    }

    // Service
    MenuSearchService.$inject = ['$http'];
    function MenuSearchService($http) {
        var service = this;
        var API_URL = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json";

        service.getMatchedMenuItems = function (searchTerm) {
            return $http.get(API_URL).then(function (response) {
                var allItems = Object.values(response.data);
                var foundItems = [];

                allItems.forEach(function (category) {
                    category.menu_items.forEach(function (item) {
                        if (item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                            foundItems.push(item);
                        }
                    });
                });

                return foundItems;
            });
        };
    }

    // Directive
    function FoundItemsDirective() {
        return {
            template: `
                <ul>
                    <li ng-repeat="item in items">
                        {{ item.name }} ({{ item.short_name }}) - {{ item.description }}
                        <button ng-click="onRemove({ index: $index })">Don't want this one!</button>
                    </li>
                </ul>
            `,
            scope: {
                items: '<',
                onRemove: '&'
            }
        };
    }
})();
