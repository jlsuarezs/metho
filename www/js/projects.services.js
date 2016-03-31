angular.module('metho.services.projects', [])

// Service to share project info from project tab to project detail
.factory('ShareProject', function() {
  var name = "";
  var matter = "";

  return {
    setName: function(settingVal) {
        name = settingVal;
    },
    getName: function() {
        return name;
    },
    setMatter: function (settingVal) {
        matter = settingVal;
    },
    getMatter: function () {
        return matter;
    }
  };
})

// Service to share source info from project detail to source detail
.factory('ShareSource', function() {
  var source = null;

  return {
    setSource: function(settingVal) {
        source = settingVal;
    },
    getSource: function() {
        return source;
    }
  };
})

// Service to parse the source in multiple views of Projects
.factory('$parseSource', function() {
  return {
    parseSource: function(sourceToParse) {
        sourceToParse.parsedSource = "";
        switch (sourceToParse.type) {
            case "book":
                sourceToParse.parsedType = "Livre";
                break;
            case "internet":
                sourceToParse.parsedType = "Site web";
                break;
            case "article":
                sourceToParse.parsedType = "Article de périodique";
                break;
            case "cd":
                sourceToParse.parsedType = "Cédérom";
                break;
            case "movie":
                sourceToParse.parsedType = "Document audiovisuel";
                break;
            case "interview":
                sourceToParse.parsedType = "Entrevue";
                break;
            default:

        }
        sourceToParse.errors = [];
        sourceToParse.warnings = [];
        if (sourceToParse.type == "book") {
            if (sourceToParse.hasAuthors == "13") {

                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                    sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du deuxième auteur", var:"author2lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du deuxième auteur", var:"author2firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }

                if ((sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) || (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null)) {
                    // Author 3 last name
                    if (sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) {
                        sourceToParse.parsedSource += " et " + sourceToParse.author3lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du troisième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du troisième auteur", var:"author3lastname"});
                        sourceToParse.parsedSource += ", ?";
                    }
                    // Author 3 first name
                    if (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author3firstname.trim() + ". ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du troisième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du troisième auteur", var:"author3firstname"});
                        sourceToParse.parsedSource += ", ?.";
                    }
                }else {
                    sourceToParse.parsedSource += ". ";
                }
            }else if (sourceToParse.hasAuthors == "more3") {
                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                    sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du deuxième auteur", var:"author2lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du deuxième auteur", var:"author2firstname"});
                        sourceToParse.parsedSource += "?";
                    }

                    sourceToParse.parsedSource += " et al. ";
                }else {
                    sourceToParse.parsedSource += " et al. ";
                }
            }else if (sourceToParse.hasAuthors == "collective") {
                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                    sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du deuxième auteur", var:"author2lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du deuxième auteur", var:"author2firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                    sourceToParse.parsedSource += " (dir). ";
                }else {
                    sourceToParse.parsedSource += " (dir). ";
                }
            }else {
                sourceToParse.parsedSource += "?. ";
                sourceToParse.errors.push({errorTitle:"Nombre d'auteurs non spécifié", promptTitle:"Nombre d'auteurs", promptText:"Sélectionnez le nombre d'auteurs", var:"hasAuthors", template:"<p class='center'><select id='authortype'><option value='13'>1 à 3 auteurs</option><option value='more3'>Plus de 3 auteurs</option><option value='collective'>Collectif</option></select></p>", complex:true, id:"authortype", type:"select"});
            }

            // Titre
            if (sourceToParse.title != null && sourceToParse.title.trim() != "") {
                sourceToParse.parsedSource += "<em>" + sourceToParse.title.trim() + "</em>, ";
            }else {
                sourceToParse.errors.push({errorTitle:"Aucun titre spécifié", promptTitle:"Titre", promptText:"Entrez le titre", var:"title"});
                sourceToParse.parsedSource += "<em>?</em>, ";
            }

            // Édition
            if (sourceToParse.editionNumber != null && sourceToParse.editionNumber != "") {
                switch (sourceToParse.editionNumber) {
                    case 1:
                        sourceToParse.parsedSource += "1<sup>re</sup> ";
                        break;
                    default:
                        sourceToParse.parsedSource += sourceToParse.editionNumber + "<sup>e</sup> ";
                }
                sourceToParse.parsedSource += "édition, ";
            }

            // Collection
            if (sourceToParse.collection != null && sourceToParse.collection != "") {
                sourceToParse.parsedSource += "coll. " + sourceToParse.collection.trim() + ", ";
            }

            // Traduction
            if (sourceToParse.hasBeenTranslated) {
                // Langue
                if (sourceToParse.translatedFrom != null && sourceToParse.translatedFrom != "") {
                    if ((/^[aeiou]$/i).test(sourceToParse.translatedFrom.substr(0, 1))) {
                        sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                    }else if (sourceToParse.translatedFrom.toLowerCase().substr(0, 1) == "h") {
                        var arr_la = ["hawaïen", "hébreu", "hindi"];
                        var arr_du = ["hongrois", "huron"];
                        if (arr_la.indexOf(sourceToParse.translatedFrom.toLowerCase().trim()) != -1) {
                            sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                        }else if (arr_du.indexOf(sourceToParse.translatedFrom.toLowerCase().trim()) != -1) {
                            sourceToParse.parsedSource += "trad. du " + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                        }else {
                            sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                        }
                    }else {
                        sourceToParse.parsedSource += "trad. du " + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Aucune langue d'origine de la traduction spécifiée", promptTitle:"Langue de traduction", promptText:"Entrez la langue de traduction", var:"translatedFrom"});
                    sourceToParse.parsedSource += "trad. de ? ";
                }

                // Traducteurs
                if ((sourceToParse.translator1lastname != "" && sourceToParse.translator1lastname != null) || (sourceToParse.translator1firstname != "" && sourceToParse.translator1firstname != null)) {
                    sourceToParse.parsedSource += "par ";
                    // Translator's first name
                    if (sourceToParse.translator1firstname.trim() != "" && sourceToParse.translator1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.translator1firstname.trim() + " ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du premier traducteur manquant", promptTitle:"Traducteur", promptText:"Entrez le prénom du premier traducteur", var:"translator1firstname"});
                        sourceToParse.parsedSource += "? ";
                    }
                    // Translator's last name
                    if (sourceToParse.translator1lastname.trim() != "" && sourceToParse.translator1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.translator1lastname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du premier traducteur manquant", promptTitle:"Traducteur", promptText:"Entrez le nom du premier traducteur", var:"translator1lastname"});
                        sourceToParse.parsedSource += "? ";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom du premier traducteur manquant", promptTitle:"Traducteur", promptText:"Entrez le prénom du premier traducteur", var:"translator1firstname"});
                    sourceToParse.errors.push({errorTitle:"Nom du premier traducteur manquant", promptTitle:"Traducteur", promptText:"Entrez le nom du premier traducteur", var:"translator1lastname"});
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.translator2lastname.trim() != "" && sourceToParse.translator2lastname != null) || (sourceToParse.translator2firstname.trim() != "" && sourceToParse.translator2firstname != null)) {
                    // Translator 2 first name
                    if (sourceToParse.translator2firstname.trim() != "" && sourceToParse.translator2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.translator2firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du deuxième traducteur manquant", promptTitle:"Traducteur", promptText:"Entrez le prénom du deuxième traducteur", var:"translator2firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                    // Translator 2 last name
                    if (sourceToParse.translator2lastname.trim() != "" && sourceToParse.translator2lastname != null) {
                        sourceToParse.parsedSource += " " + sourceToParse.translator2lastname.trim() + ", ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du deuxième traducteur manquant", promptTitle:"Traducteur", promptText:"Entrez le nom du deuxième traducteur", var:"translator2lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                }else {
                    sourceToParse.parsedSource += ", ";
                }
            }

            // Lieu
            if (sourceToParse.publicationLocation != null && sourceToParse.publicationLocation.trim() != "") {
                sourceToParse.parsedSource += sourceToParse.publicationLocation.capitalizeFirstLetter().trim() + ", ";
            }else {
                sourceToParse.parsedSource += "s.l., ";
                sourceToParse.warnings.push({errorTitle:"Lieu d'édition non spécifié", promptTitle:"Lieu d'édition", promptText:"Entrez le lieu d'édition", var:"publicationLocation"});
            }

            // Éditeur
            if (sourceToParse.editor != null && sourceToParse.editor.trim() != "") {
                sourceToParse.parsedSource += sourceToParse.editor.trim() + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Éditeur non spécifié", promptTitle:"Éditeur", promptText:"Entrez l'éditeur", var:"editor"});
            }

            // Date
            if (sourceToParse.publicationDate != null && sourceToParse.publicationDate != "") {
                sourceToParse.parsedSource += sourceToParse.publicationDate + ", ";
                var today = new Date();
                if (today.getFullYear() < Number(sourceToParse.publicationDate)) {
                    sourceToParse.warnings.push({errorTitle:"Date de publication supérieure à la date courante", promptTitle:"Date d'édition", promptText:"Entrez la date d'édition", var:"publicationDate"});
                }
            }else {
                sourceToParse.parsedSource += "s.d., ";
                sourceToParse.warnings.push({errorTitle:"Date d'édition non spécifiée", promptTitle:"Date d'édition", promptText:"Entrez la date d'édition", var:"publicationDate"});
            }

            // Volume
            if (sourceToParse.volumeNumber != null && sourceToParse.volumeNumber != "") {
                sourceToParse.parsedSource += "vol. " + sourceToParse.volumeNumber + ", ";
            }

            // Nombre de pages
            if (sourceToParse.pageNumber != null && sourceToParse.pageNumber != "") {
                sourceToParse.parsedSource += sourceToParse.pageNumber + " p.";
                if (sourceToParse.pageNumber > 15000) {
                    sourceToParse.warnings.push({errorTitle:"Nombre de pages trop élevé", promptTitle:"Nombre de pages", promptText:"Entrez le nombre de pages", var:"pageNumber"});
                }else if (sourceToParse.pageNumber < 0) {
                    sourceToParse.warnings.push({errorTitle:"Nombre de pages trop bas", promptTitle:"Nombre de pages", promptText:"Entrez le nombre de pages", var:"pageNumber"});
                }
            }else {
                sourceToParse.parsedSource += "? p.";
                sourceToParse.errors.push({errorTitle:"Nombre de page non spécifié", promptTitle:"Nombre de pages", promptText:"Entrez le nombre de pages", var:"pageNumber"});
            }
            sourceToParse.pageNumber = Number(sourceToParse.pageNumber);

            return sourceToParse;
        }else if (sourceToParse.type == "article") {
            // Auteur
            if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null)|| (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                    sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase() + ", ";
                }else {
                    sourceToParse.parsedSource += "?, ";
                    sourceToParse.errors.push({errorTitle:"Nom de l'auteur non spécifié", promptTitle:"Auteur", promptText:"Entrez le nom de l'auteur", var:"author1lastname"});
                }

                if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                    sourceToParse.parsedSource += sourceToParse.author1firstname.toUpperCase() + ". ";
                }else {
                    sourceToParse.parseSource += "?. ";
                    sourceToParse.errors.push({errorTitle:"Prénom de l'auteur non spécifié", promptTitle:"Auteur", promptText:"Entrez le prénom de l'auteur", var:"author1firstname"});
                }
            }else {
                sourceToParse.parsedSource += "?. ";
                sourceToParse.errors.push({errorTitle:"Prénom de l'auteur non spécifié", promptTitle:"Auteur", promptText:"Entrez le prénom de l'auteur", var:"author1firstname"});
                sourceToParse.errors.push({errorTitle:"Nom de l'auteur non spécifié", promptTitle:"Auteur", promptText:"Entrez le nom de l'auteur", var:"author1lastname"});
            }

            // Titre de l'Article
            if (sourceToParse.title != "" && sourceToParse.title != null) {
                sourceToParse.parsedSource += "«" + sourceToParse.title + "», ";
            }else {
                sourceToParse.parsedSource += "«?», ";
                sourceToParse.errors.push({errorTitle:"Titre de l'article non spécifié", promptTitle:"Titre de l'article", promptText:"Entrez le titre de l'article", var:"title"});
            }

            // Nom du périodique
            if (sourceToParse.editor != "" && sourceToParse.editor != null) {
                sourceToParse.parsedSource += "<em>" + sourceToParse.editor + "</em>, ";
            }else {
                sourceToParse.parsedSource += "<em>?</em>, ";
                sourceToParse.errors.push({errorTitle:"Nom du périodique non spécifié", promptTitle:"Nom du périodique", promptText:"Entrez le nom du périodique", var:"editor"});
            }

            // Numéro du périodique
            if (sourceToParse.editionNumber != "" && sourceToParse.editionNumber != null) {
                sourceToParse.parsedSource += sourceToParse.editionNumber + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Numéro de volume ou de périodique non spécifié", promptTitle:"Numéro de volume", promptText:"Entrez le numéro de volume", var:"editionNumber"});
            }

            // Date de publication
            if (sourceToParse.publicationDate != "" && sourceToParse.publicationDate != null) {
                sourceToParse.parsedSource += sourceToParse.publicationDate + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Date de publication non spécifiée", promptTitle:"Date de publication", promptText:"Entrez la date de publication", var:"publicationDate"});
            }

            // Indication des pages
            if ((sourceToParse.endPage != "" && sourceToParse.endPage != null) || (sourceToParse.startPage != "" && sourceToParse.startPage != null)) {
                if (sourceToParse.startPage != "" && sourceToParse.startPage != null) {
                    sourceToParse.parsedSource += "p. " + sourceToParse.startPage;
                }else {
                    sourceToParse.parsedSource += "p. ?";
                    sourceToParse.errors.push({errorTitle:"La page de début n'est pas spécifiée", promptTitle:"Page de début", promptText:"Entrez la page de début", var:"startPage"});
                }
                sourceToParse.parsedSource += "-";

                if (sourceToParse.endPage != "" && sourceToParse.endPage != null) {
                    sourceToParse.parsedSource += sourceToParse.endPage;
                }else {
                    sourceToParse.parsedSource += "?";
                    sourceToParse.errors.push({errorTitle:"La page de fin n'est pas spécifiée", promptTitle:"Page de fin", promptText:"Entrez la page de fin", var:"endPage"});
                }
                sourceToParse.parsedSource += ".";
            }else {
                sourceToParse.parsedSource += "p. ?-?.";
                sourceToParse.errors.push({errorTitle:"La page de début n'est pas spécifiée", promptTitle:"Page de début", promptText:"Entrez la page de début", var:"startPage"});
                sourceToParse.errors.push({errorTitle:"La page de fin n'est pas spécifiée", promptTitle:"Page de fin", promptText:"Entrez la page de fin", var:"endPage"});
            }

            return sourceToParse;
        }else if (sourceToParse.type == "internet") {
            if (sourceToParse.hasAuthors) {
                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                    sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du deuxième auteur", var:"author2lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du deuxième auteur", var:"author2firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }

                if ((sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) || (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null)) {
                    // Author 3 last name
                    if (sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) {
                        sourceToParse.parsedSource += " et " + sourceToParse.author3lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du troisième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du troisième auteur", var:"author3lastname"});
                        sourceToParse.parsedSource += ", ?";
                    }
                    // Author 3 first name
                    if (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author3firstname.trim() + ". ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du troisième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du troisième auteur", var:"author3firstname"});
                        sourceToParse.parsedSource += ", ?.";
                    }
                }else {
                    sourceToParse.parsedSource += ". ";
                }
            }else {
                if (sourceToParse.editor != null && sourceToParse.editor != "") {
                    sourceToParse.parsedSource += sourceToParse.editor + ", ";
                }else {
                    sourceToParse.parsedSource += "?, ";
                    sourceToParse.errors.push({errorTitle:"Titre de la page d'accueil non spécifié", promptTitle:"Titre de la page d'accueil", promptText:"Entrez le titre de la page d'accueil", var:"editor"});
                }
            }

            // Titre de l'article
            if (sourceToParse.title != null && sourceToParse.title != "") {
                sourceToParse.parsedSource += "«" + sourceToParse.title + "», ";
            }else {
                sourceToParse.parsedSource += "«?», ";
                sourceToParse.errors.push({errorTitle:"Titre de la page non spécifié", promptTitle:"Titre de la page", promptText:"Entrez le titre de la page", var:"title"})
            }

            // Titre de la page d'accueil (si il y a des auteurs)
            if (sourceToParse.hasAuthors) {
                if (sourceToParse.editor != null && sourceToParse.editor != "") {
                    sourceToParse.parsedSource += "<em>" + sourceToParse.editor + "</em>, ";
                }else {
                    sourceToParse.parsedSource += "<em>?</em>, ";
                    sourceToParse.errors.push({errorTitle:"Titre de la page d'accueil non spécifié", promptTitle:"Titre de la page d'accueil", promptText:"Entrez le titre de la page d'accueil", var:"editor"});
                }
            }

            // Type de support
            sourceToParse.parsedSource += "[en ligne]. ";

            // URL
            if (sourceToParse.url != null && sourceToParse.url != "") {
                sourceToParse.parsedSource += "[" + sourceToParse.url + "] ";
            }else {
                sourceToParse.parsedSource += "[?] ";
                sourceToParse.errors.push({errorTitle:"Adresse web non spécifiée", promptTitle:"Adresse web", promptText:"Entrez l'adresse web", var:"url"});
            }

            // Date de consultation
            if (sourceToParse.consultationDate != null && sourceToParse.consultationDate != "") {
                sourceToParse.parsedSource += "(" + new Date(sourceToParse.consultationDate).toLocaleDateString() + ").";
            }else {
                sourceToParse.parsedSource += "(?).";
                sourceToParse.errors.push({errorTitle:"Date de consultation non spécifié", promptTitle:"Date de consultation", promptText:"Entrez le date de consultation", var:"consultationDate", type:"input", template:"<p class='center'><input type='date' id='consultationDate'></p>", complex:true, id:"consultationDate"});
            }

            return sourceToParse;
        }else if (sourceToParse.type == "cd") {
            if (sourceToParse.hasAuthors) {
                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du premier auteur", var:"author1firstname"});
                    sourceToParse.errors.push({errorTitle:"Nom du premier auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du premier auteur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du deuxième auteur", var:"author2lastname"});
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du deuxième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du deuxième auteur", var:"author2firstname"});
                        sourceToParse.parsedSource += "?";
                    }
                }

                if ((sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) || (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null)) {
                    // Author 3 last name
                    if (sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) {
                        sourceToParse.parsedSource += " et " + sourceToParse.author3lastname.toUpperCase().trim();
                    }else {
                        sourceToParse.errors.push({errorTitle:"Nom du troisième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le nom du troisième auteur", var:"author3lastname"});
                        sourceToParse.parsedSource += ", ?";
                    }
                    // Author 3 first name
                    if (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author3firstname.trim() + ". ";
                    }else {
                        sourceToParse.errors.push({errorTitle:"Prénom du troisième auteur manquant", promptTitle:"Auteur", promptText:"Entrez le prénom du troisième auteur", var:"author3firstname"});
                        sourceToParse.parsedSource += ", ?.";
                    }
                }else {
                    sourceToParse.parsedSource += ". ";
                }
            }

            // Titre de l'article
            if (sourceToParse.title != null && sourceToParse.title != "") {
                sourceToParse.parsedSource += "<em>" + sourceToParse.title + "</em>, ";
            }else {
                sourceToParse.parsedSource += "<em>?</em>, ";
                sourceToParse.errors.push({errorTitle:"Titre du document non spécifié", promptTitle:"Titre du document", promptText:"Entrez le titre du document", var:"title"})
            }

            // Type de support
            sourceToParse.parsedSource += "[cédérom], ";

            // Lieu de publication
            if (sourceToParse.publicationLocation != null && sourceToParse.publicationLocation != "") {
                sourceToParse.parsedSource += sourceToParse.publicationLocation + ", ";
            }else {
                sourceToParse.parsedSource += "s.l., ";
                sourceToParse.warnings.push({errorTitle:"Lieu de publication non spécifiée", promptTitle:"Lieu de publication", promptText:"Entrez la lieu de publication", var:"publicationLocation"});
            }

            // Éditeur
            if (sourceToParse.editor != null && sourceToParse.editor != "") {
                sourceToParse.parsedSource += sourceToParse.editor + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Éditeur non spécifiée", promptTitle:"Éditeur", promptText:"Entrez l'éditeur", var:"editor"});
            }

            // Date de publication
            if (sourceToParse.publicationDate != null && sourceToParse.publicationDate != "") {
                sourceToParse.parsedSource += sourceToParse.publicationDate + ".";
            }else {
                sourceToParse.parsedSource += "s.d.";
                sourceToParse.warnings.push({errorTitle:"Date de publication non spécifiée", promptTitle:"Date de publication", promptText:"Entrez la date de publication", var:"publicationDate"});
            }

            return sourceToParse;
        }else if (sourceToParse.type == "movie") {
            if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                // Author last name
                if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                    sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                }else {
                    sourceToParse.errors.push({errorTitle:"Nom de l'auteur/réalisateur manquant", promptTitle:"Auteur/Réalisateur", promptText:"Entrez le nom de l'auteur/réalisateur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?, ";
                }
                // Author first name
                if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                    sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom de l'auteur/réalisateur manquant", promptTitle:"Auteur/Réalisateur", promptText:"Entrez le prénom de l'auteur/réalisateur", var:"author1firstname"});
                    sourceToParse.parsedSource += "?";
                }
            }else {
                sourceToParse.errors.push({errorTitle:"Prénom de l'auteur/réalisateur manquant", promptTitle:"Auteur/Réalisateur", promptText:"Entrez le prénom de l'auteur/réalisateur", var:"author1firstname"});
                sourceToParse.errors.push({errorTitle:"Nom de l'auteur/réalisateur manquant", promptTitle:"Auteur/Réalisateur", promptText:"Entrez le nom de l'auteur/réalisateur", var:"author1lastname"});
                sourceToParse.parsedSource += "?";
            }

            if (sourceToParse.hasAuthors == true) { // Use longer syntax because it might have string value
                sourceToParse.parsedSource += "et al., ";
            }else {
                sourceToParse.parsedSource += ". ";
            }

            // Titre de l'épisode
            if (sourceToParse.episodeTitle != null && sourceToParse.episodeTitle != "") {
                sourceToParse.parsedSource += "«" + sourceToParse.episodeTitle + "», ";
            }

            // Nom de l'émission ou du document
            if (sourceToParse.title != null && sourceToParse.title != "") {
                sourceToParse.parsedSource += "<em>" + sourceToParse.title + "</em>, ";
            }else {
                sourceToParse.parsedSource += "<em>?</em>, ";
                sourceToParse.errors.push({errorTitle:"Nom de l'émission manquant", promptTitle:"Nom de l'émission", promptText:"Entrez le nom de l'émission", var:"title"})
            }

            // Lieu de production
            if (sourceToParse.productionLocation != null && sourceToParse.productionLocation != "") {
                sourceToParse.parsedSource += sourceToParse.productionLocation + ", ";
            }else {
                sourceToParse.parsedSource += "s.l., ";
                sourceToParse.warnings.push({errorTitle:"Lieu de production non spécifié", promptTitle:"Lieu de production", promptText:"Entrez le lieu de production", var:"productionLocation"});
            }

            // Producteur
            if (sourceToParse.productor != null && sourceToParse.productor != "") {
                sourceToParse.parsedSource += sourceToParse.productor + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Producteur non spécifié", promptTitle:"Producteur", promptText:"Entrez le producteur", var:"productor"});
            }

            // Diffuseur
            if (sourceToParse.broadcaster != null && sourceToParse.broadcaster != "") {
                sourceToParse.parsedSource += sourceToParse.broadcaster + ", ";
            }else {
                sourceToParse.warnings.push({errorTitle:"Diffuseur non spécifié", promptTitle:"Diffuseur", promptText:"Entrez le diffuseur", var:"broadcaster"});
            }

            // Durée
            if (sourceToParse.duration != null && sourceToParse.duration != "") {
                sourceToParse.parsedSource += sourceToParse.duration + " min., ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Durée non spécifié", promptTitle:"Durée", promptText:"Entrez la durée", var:"duration"});
            }

            // Date de publication
            if (sourceToParse.publicationDate != null && sourceToParse.publicationDate != "") {
                sourceToParse.parsedSource += sourceToParse.publicationDate + ", ";
            }else {
                sourceToParse.warnings.push({errorTitle:"Date de publication non spécifié", promptTitle:"Date de publication", promptText:"Entrez la date de publication", var:"publicationDate"});
                sourceToParse.parsedSource += "s.d., ";
            }

            // Support
            if (sourceToParse.support) {
                switch (sourceToParse.support) {
                    case "dvd":
                        sourceToParse.parsedSource += "[DVD], ";
                        break;
                    case "cd":
                        sourceToParse.parsedSource += "[cédérom], ";
                        break;
                    case "internet":
                        sourceToParse.parsedSource += "[en ligne], ";
                        break;
                    default:
                        sourceToParse.parsedSource += "[?], ";
                        sourceToParse.errors.push({errorTitle:"Type de support non spécifié", promptTitle:"Type de support", promptText:"Entrez le type de support", var:"support"});
                }
            }

            // Date de visionnement
            if (sourceToParse.consultationDate != null && sourceToParse.consultationDate != "") {
                sourceToParse.parsedSource += "(" + new Date(sourceToParse.consultationDate).toLocaleDateString() + ").";
            }else {
                sourceToParse.errors.push({errorTitle:"Date de consultation non spécifié", promptTitle:"Date de consultation", promptText:"Entrez le date de consultation", var:"consultationDate", type:"input", template:"<p class='center'><input type='date' id='consultationDate'></p>", complex:true, id:"consultationDate"});
                sourceToParse.parsedSource += "(?).";
            }

            return sourceToParse;
        }else if (sourceToParse.type == "interview") {
            sourceToParse.title = "";
            if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                // Author last name
                if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                    sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                }else {
                    sourceToParse.errors.push({errorTitle:"Nom de l'intervieweur manquant", promptTitle:"Intervieweur", promptText:"Entrez le nom de l'intervieweur", var:"author1lastname"});
                    sourceToParse.parsedSource += "?, ";
                }
                // Author first name
                if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                    sourceToParse.parsedSource += sourceToParse.author1firstname.trim() + ". ";
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom de l'intervieweur manquant", promptTitle:"Intervieweur", promptText:"Entrez le prénom de l'intervieweur", var:"author1firstname"});
                    sourceToParse.parsedSource += "?. ";
                }
            }else {
                sourceToParse.errors.push({errorTitle:"Prénom de l'intervieweur manquant", promptTitle:"Intervieweur", promptText:"Entrez le prénom de l'intervieweur", var:"author1firstname"});
                sourceToParse.errors.push({errorTitle:"Nom de l'intervieweur manquant", promptTitle:"Intervieweur", promptText:"Entrez le nom de l'intervieweur", var:"author1lastname"});
                sourceToParse.parsedSource += "?. ";
            }
            // Texte
            sourceToParse.parsedSource += "Entrevue avec ";
            // Titre de civilité
            switch (sourceToParse.civility) {
                case "mister":
                    sourceToParse.parsedSource += "M. ";
                    break;
                case "miss":
                    sourceToParse.parsedSource += "M<sup>me</sup> ";
                    break;
                case "miss_young":
                    sourceToParse.parsedSource += "M<sup>lle</sup> ";
                    break;
                default:
                    sourceToParse.errors.push({errorTitle:"Titre de civilité manquant", promptTitle:"Titre de civilité", promptText:"Sélectionnez le titre de civilité", var:"civility", complex:true, template:"<p class='center'><select id='civilityId'><option value='mister'>M.</option><option value='miss'>M<sup>me</sup></option><option value='miss_young'>M<sup>lle</sup></option></select></p>", id:"civilityId", type:"select"});
                    sourceToParse.parsedSource += "? ";
            }
            // Personne rencontrée
            if ((sourceToParse.interviewed1lastname != "" && sourceToParse.interviewed1lastname != null) || (sourceToParse.interviewed1firstname != "" && sourceToParse.interviewed1firstname != null)) {
                // interviewed first name
                if (sourceToParse.interviewed1firstname != "" && sourceToParse.interviewed1firstname != null) {
                    sourceToParse.parsedSource += sourceToParse.interviewed1firstname.trim() + " ";
                    sourceToParse.title += sourceToParse.interviewed1firstname.trim() + " ";
                }else {
                    sourceToParse.errors.push({errorTitle:"Prénom de la personne rencontrée manquant", promptTitle:"Prénom de la personne rencontrée", promptText:"Entrez le prénom de la personne rencontrée", var:"interviewed1firstname"});
                    sourceToParse.parsedSource += "? ";
                    sourceToParse.title += "? ";
                }
                // interviewed last name
                if (sourceToParse.interviewed1lastname != "" && sourceToParse.interviewed1lastname != null) {
                    sourceToParse.parsedSource += sourceToParse.interviewed1lastname.trim() + ", ";
                    sourceToParse.title += sourceToParse.interviewed1lastname.trim();
                }else {
                    sourceToParse.errors.push({errorTitle:"Nom de la personne rencontrée manquant", promptTitle:"Nom de la personne rencontrée", promptText:"Entrez le nom de la personne rencontrée", var:"interviewed1lastname"});
                    sourceToParse.parsedSource += "?, ";
                    sourceToParse.title += "?";
                }
            }else {
                sourceToParse.errors.push({errorTitle:"Prénom de la personne rencontrée manquant", promptTitle:"Prénom de la personne rencontrée", promptText:"Entrez le prénom de la personne rencontrée", var:"interviewed1firstname"});
                sourceToParse.errors.push({errorTitle:"Nom de la personne rencontrée manquant", promptTitle:"Nom de la personne rencontrée", promptText:"Entrez le nom de la personne rencontrée", var:"interviewed1lastname"});
                sourceToParse.parsedSource += "?, ";
            }

            // Titre de la personne
            if (sourceToParse.interviewedTitle != null && sourceToParse.interviewedTitle != "") {
                sourceToParse.parsedSource += sourceToParse.interviewedTitle + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Titre de la personne rencontrée manquant", promptTitle:"Titre de la personne rencontrée", promptText:"Entrez le titre de la personne rencontrée", var:"interviewedTitle"});
            }

            // Location
            if (sourceToParse.publicationLocation != null && sourceToParse.publicationLocation != "") {
                sourceToParse.parsedSource += sourceToParse.publicationLocation + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push({errorTitle:"Lieu de l'entrevue manquant", promptTitle:"Lieu de l'entrevue", promptText:"Entrez le lieu de l'entrevue", var:"publicationLocation"});
            }

            // Date de l'entrevue
            if (sourceToParse.consultationDate != null && sourceToParse.consultationDate != "") {
                sourceToParse.parsedSource += "le " + new Date(sourceToParse.consultationDate).toLocaleDateString() + ".";
            }else {
                sourceToParse.errors.push({errorTitle:"Date de consultation non spécifié", promptTitle:"Date de consultation", promptText:"Entrez le date de consultation", var:"consultationDate", type:"input", template:"<p class='center'><input type='date' id='consultationDate'></p>", complex:true, id:"consultationDate"});
                sourceToParse.parsedSource += "le ?.";
            }

            return sourceToParse;
        }else {
            return null;
        }
    }
  };
});
