angular.module('metho.service.settings', [])

// Service sharing settings (allowing to edit them)
.factory('Settings', function(localStorageService) {
    // Default values
    if (localStorageService.get("setting-advanced") == null) {
        localStorageService.set("setting-advanced", false);
    }

    if (localStorageService.get("setting-askForOrder") == null) {
        localStorageService.set("setting-askForOrder", true);
    }

    if (localStorageService.get("setting-defaultOrder") == null) {
        localStorageService.set("setting-defaultOrder", "alpha");
    }

    if (localStorageService.get("setting-scanBoardingDone") == null) {
        localStorageService.set("setting-scanBoardingDone", false);
    }

    var settings = {
        advanced: localStorageService.get("setting-advanced"),
        askForOrder: localStorageService.get("setting-askForOrder"),
        defaultOrder: localStorageService.get("setting-defaultOrder"),
        scanBoardingDone: localStorageService.get("setting-scanBoardingDone")
    };

    return {
        set: function(key, value) {
            settings[key] = value;
            localStorageService.set("setting-" + key, value);
        },
        get: function(key) {
            return settings[key];
        },
        all: function() {
            return settings;
        }
    };
});
