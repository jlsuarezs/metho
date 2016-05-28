angular.module('metho.directive.autofocus', [])

.directive('ngAutofocus', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $timeout(function () {
                element[0].focus();
            }, attrs.delay);
        }
    };
});
