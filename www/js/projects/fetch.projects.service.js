angular.module("metho.service.projects.fetch", [])

.factory("Fetch", function ($http, $q) {
    var methods = {};
    var cacheByISBN = {};
    var cacheByName = {};

    var parseFromISBNdb = function (response) {
        var newobj = {};
        // Titre
        newobj.title = response.title.replace(/\ufffd/g, "é").trim();
        // Publisher/Editor
        newobj.editor = response.publisher_name.replace(/\ufffd/g, "é").trim();
        // Date de publication
        if (!!response.edition_info && response.edition_info.match(/[0-9]{4}/)) {
            var working_on_date = response.edition_info.match(/[0-9]{4}/);
            newobj.publicationDate = response.edition_info.match(/[0-9]{4}/)[0].trim();
        } else if (!!response.publisher_text && response.publisher_text.match(/[0-9]{4}/)) {
            var working_on_date = response.publisher_text.match(/[0-9]{4}/);
            newobj.publicationDate = response.publisher_text.match(/[0-9]{4}/)[0].trim();
        } else {
            var working_on_date = "";
            newobj.publicationDate = "";
        }

        // Lieu de publication
        if (response.publisher_text != "") {
            var working_on_location = response.publisher_text.replace(/\ufffd/g, "é");
            working_on_location = working_on_location.replace(response.publisher_name, "");
            working_on_location = working_on_location.replace(working_on_date, "");
            working_on_location = working_on_location.replace(/[^a-zA-z\s]/g, "");
            working_on_location = working_on_location.trim();
            if (working_on_location != "") {
                newobj.publicationLocation = working_on_location;
            }
        }
        // Nombre de pages
        if (response.physical_description_text != "") {
            var arr_pages = response.physical_description_text.split(" ");
            if (arr_pages.indexOf("p.") != -1) {
                var indexOfPages = arr_pages.indexOf("p.") - 1;
                newobj.pageNumber = arr_pages[indexOfPages];
            } else if (arr_pages.indexOf("pages") != -1) {
                var indexOfPages = arr_pages.indexOf("pages") - 1;
                newobj.pageNumber = arr_pages[indexOfPages];
            }
        }
        response.author1firstname = "";
        response.author1lastname = "";
        response.author2lastname = "";
        response.author2firstname = "";
        response.author3lastname = "";
        response.author3firstname = "";
        // Auteur
        if (response.author_data.length) {
            for (var i = 0; i < response.author_data.length; i++) {
                if (response.author_data[i].name.split(",")[0] == response.author_data[i].name) {
                    newobj["author" + String(i + 1) + "firstname"] = response.author_data[i].name.split(" ")[0].replace(/\ufffd/g, "é").trim();
                    newobj["author" + String(i + 1) + "lastname"] = response.author_data[i].name.split(" ")[1].replace(/\ufffd/g, "é").trim();
                } else {
                    newobj["author" + String(i + 1) + "lastname"] = response.author_data[i].name.split(",")[0].replace(/\ufffd/g, "é").trim();
                    newobj["author" + String(i + 1) + "firstname"] = response.author_data[i].name.split(",")[1].replace(/\ufffd/g, "é").trim();
                }
            }
            var authorNum = response.author_data.length;
            if (authorNum >= 1 && authorNum <= 3) {
                newobj.hasAuthors = "13";
            } else if (authorNum > 3) {
                newobj.hasAuthors = "more3";
            }else {
                newobj.hasAuthors = "13";
            }
        }

        return newobj;
    }

    methods.fromISBNdb = function (isbn) {
        var p = $q.defer();

        $http({
            method: "GET",
            url: "http://isbndb.com/api/v2/json/YVFT6RLV/book/" + isbn
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
                cacheByName[name] = objects;
                p.resolve(objects);
            }
        }

        var onFailure = function (response) {
            p.reject(response.status);
        }

        if (author != "" && author != null) {
            $http({
                method: "GET",
                url: "http://isbndb.com/api/v2/json/YVFT6RLV/books?q=" + encodeURIComponent(name + " " + author) + "&i=combined"
            }).then(onSuccess).catch(onFailure);
        }else {
            $http({
                method: "GET",
                url: "http://isbndb.com/api/v2/json/YVFT6RLV/books?q=" + encodeURIComponent(name)
            }).then(onSuccess).catch(onFailure);
        }

        return p.promise;
    }


    return methods;
});
