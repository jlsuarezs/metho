angular.module("metho.service.projects.fetch", [])

.factory("Fetch", function ($http, $q) {
    var methods = {};
    var cacheByISBN = {};
    var cacheByName = {};
    var keys = ["S07CWYQY", "YVFT6RLV"];

    var parseFromISBNdb = function (response) {
        var newobj = {};
        // Titre
        if (response.title.isUpperCase()) {
            newobj.title = response.title.replace(/\ufffd/g, "é").trim().toLowerCase().capitalizeEveryFirstLetter();
        }else if (response.title.isLowerCase()) {
            newobj.title = response.title.replace(/\ufffd/g, "é").trim().capitalizeEveryFirstLetter();
        }else {
            newobj.title = response.title.replace(/\ufffd/g, "é").trim();
        }
        // Publisher/Editor
        newobj.editor = response.publisher_name.replace(/\ufffd/g, "é").trim().toLowerCase().capitalizeEveryFirstLetter();
        // Date de publication
        if (!!response.edition_info && response.edition_info.match(/[0-9]{4}/)) {
            newobj.publicationDate = response.edition_info.match(/[0-9]{4}/)[0].trim();
        } else if (!!response.publisher_text && response.publisher_text.match(/[0-9]{4}/)) {
            newobj.publicationDate = response.publisher_text.match(/[0-9]{4}/)[0].trim();
        } else {
            newobj.publicationDate = "";
        }

        // Lieu de publication
        if (response.publisher_text != "") {
            newobj.publicationLocation = response.publisher_text.replace(/\ufffd/g, "é").replace(response.publisher_name, "").replace(newobj.publicationDate, "").replace(/[^a-zA-z\s]/g, "").trim().toLowerCase().capitalizeFirstLetter();
        }
        // Nombre de pages
        if (response.physical_description_text != "") {
            var arr_pages = response.physical_description_text.split(" ");
            if (arr_pages.indexOf("p.") != -1) {
                newobj.pageNumber = arr_pages[arr_pages.indexOf("p.") - 1];
            } else if (arr_pages.indexOf("pages") != -1) {
                newobj.pageNumber = arr_pages[arr_pages.indexOf("pages") - 1];
            }
        }
        // Auteur
        if (response.author_data.length) {
            for (var i = 0; i < response.author_data.length; i++) {
                if (response.author_data[i].name.split(",")[0] == response.author_data[i].name) {
                    newobj["author" + String(i + 1) + "firstname"] = response.author_data[i].name.split(" ")[0].replace(/\ufffd/g, "é").trim().capitalizeFirstLetter();
                    newobj["author" + String(i + 1) + "lastname"] = response.author_data[i].name.split(" ")[1].replace(/\ufffd/g, "é").trim().capitalizeFirstLetter();
                } else {
                    newobj["author" + String(i + 1) + "lastname"] = response.author_data[i].name.split(",")[0].replace(/\ufffd/g, "é").trim().capitalizeFirstLetter();
                    newobj["author" + String(i + 1) + "firstname"] = response.author_data[i].name.split(",")[1].replace(/\ufffd/g, "é").trim().capitalizeFirstLetter();
                }
            }
            if (response.author_data.length >= 1 && response.author_data.length <= 3) {
                newobj.hasAuthors = "13";
            } else if (response.author_data.length > 3) {
                newobj.hasAuthors = "more3";
            }else {
                newobj.hasAuthors = "13";
            }
        }

        return newobj;
    }

    var pickKey = function () {
        return keys[random(0, keys.length - 1)];
    }

    methods.fromISBNdb = function (isbn) {
        var p = $q.defer();

        $http({
            method: "GET",
            url: "http://isbndb.com/api/v2/json/" + pickKey() + "/book/" + isbn
        }).then(function (response) {
            if (!!response.data.error) {
                p.reject(404);
            }else {
                var newobject = parseFromISBNdb(response.data.data[0]);
                cacheByISBN[isbn] = newobject;
                p.resolve(newobject);
            }
        }).catch(function (response) {
            p.reject(response.status);
        });

        return p.promise;
    }

    methods.fromNameISBNdb = function (name, author) {
        var p = $q.defer();

        var onSuccess = function (response) {
            if (!!response.data.error) {
                p.reject(404);
            }else {
                var objects = [];
                for (var i = 0; i < response.data.data.length; i++) {
                    objects[i] = parseFromISBNdb(response.data.data[i]);
                }
                cacheByName[name.toLowerCase()] = objects;
                p.resolve(objects);
            }
        }

        var onFailure = function (response) {
            p.reject(response.status);
        }

        if (cacheByName[name.toLowerCase()]) {
            p.resolve(cacheByName[name.toLowerCase()]);
        }else {
            if (author != "" && author != null) {
                $http({
                    method: "GET",
                    url: "http://isbndb.com/api/v2/json/" + pickKey() + "/books?q=" + encodeURIComponent(name + " " + author) + "&i=combined"
                }).then(onSuccess).catch(onFailure);
            }else {
                $http({
                    method: "GET",
                    url: "http://isbndb.com/api/v2/json/" + pickKey() + "/books?q=" + encodeURIComponent(name)
                }).then(onSuccess).catch(onFailure);
            }
        }

        return p.promise;
    }


    return methods;
});
