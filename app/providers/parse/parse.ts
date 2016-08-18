import {Injectable} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Language} from '../language/language';

@Injectable()
export class Parse {
  private sourceToParse: any;

  constructor(public translate: TranslateService) {}

  parse(source: any) {
    this.sourceToParse = source;
    this.sourceToParse.parsedSource = "";
    switch (this.sourceToParse.type) {
      case "book":
        this.sourceToParse.parsedType = this.translate.instant("PROJECT.TYPES.BOOK");
        break;
      case "internet":
        this.sourceToParse.parsedType = this.translate.instant("PROJECT.TYPES.INTERNET");
        break;
      case "article":
        this.sourceToParse.parsedType = this.translate.instant("PROJECT.TYPES.ARTICLE");
        break;
      case "cd":
        this.sourceToParse.parsedType = this.translate.instant("PROJECT.TYPES.CD_PARSE");
        break;
      case "movie":
        this.sourceToParse.parsedType = this.translate.instant("PROJECT.TYPES.MOVIE");
        break;
      case "interview":
        this.sourceToParse.parsedType = this.translate.instant("PROJECT.TYPES.INTERVIEW");
        break;
      default:

    }
    this.sourceToParse.errors = [];
    this.sourceToParse.warnings = [];

    // Solve error with timezones
    var _userOffset = new Date().getTimezoneOffset() * 60000;
    if (this.sourceToParse.type == "book") {
      if (this.sourceToParse.hasAuthors == "13") {

        if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
          // Author last name
          if (this.sourceToParse.author1lastname) {
            this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
          } else {
            this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
            this.sourceToParse.parsedSource += "?, ";
          }
          // Author first name
          if (this.sourceToParse.author1firstname) {
            this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim();
          } else {
            this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
            this.sourceToParse.parsedSource += "?";
          }
        } else {
          this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
          this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
          this.sourceToParse.parsedSource += "?";
        }

        if (this.sourceToParse.author2lastname || this.sourceToParse.author2firstname) {
          // Author 2 last name
          if (this.sourceToParse.author2lastname) {
            this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2lastname.toUpperCase().trim();
          } else {
            this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname");
            this.sourceToParse.parsedSource += "?, ";
          }
          // Author 2 first name
          if (this.sourceToParse.author2firstname) {
            this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2firstname.trim();
          } else {
            this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname");
            this.sourceToParse.parsedSource += "?";
          }
        }

        if (this.sourceToParse.author3lastname || this.sourceToParse.author3firstname) {
          // Author 3 last name
          if (this.sourceToParse.author3lastname) {
            this.sourceToParse.parsedSource += " et " + this.sourceToParse.author3lastname.toUpperCase().trim();
          } else {
            this.addError("THIRD_AUTHOR_LASTNAME", "author3lastname");
            this.sourceToParse.parsedSource += ", ?";
          }
          // Author 3 first name
          if (this.sourceToParse.author3firstname) {
            this.sourceToParse.parsedSource += ", " + this.sourceToParse.author3firstname.trim() + ". ";
          } else {
            this.addError("THIRD_AUTHOR_FIRSTNAME", "author3firstname");
            this.sourceToParse.parsedSource += ", ?.";
          }
        } else {
          this.sourceToParse.parsedSource += ". ";
        }
      } else if (this.sourceToParse.hasAuthors == "more3") {
          if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
              // Author last name
              if (this.sourceToParse.author1lastname) {
                  this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
              } else {
                  this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                  this.sourceToParse.parsedSource += "?, ";
              }
              // Author first name
              if (this.sourceToParse.author1firstname) {
                  this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim();
              } else {
                  this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                  this.sourceToParse.parsedSource += "?";
              }
          } else {
              this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
              this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
              this.sourceToParse.parsedSource += "?";
          }

          if (this.sourceToParse.author2lastname || this.sourceToParse.author2firstname) {
              // Author 2 last name
              if (this.sourceToParse.author2lastname) {
                  this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2lastname.toUpperCase().trim();
              } else {
                  this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname");
                  this.sourceToParse.parsedSource += "?, ";
              }
              // Author 2 first name
              if (this.sourceToParse.author2firstname) {
                  this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2firstname.trim();
              } else {
                  this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname");
                  this.sourceToParse.parsedSource += "?";
              }

              this.sourceToParse.parsedSource += " et al. ";
          } else {
              this.sourceToParse.parsedSource += " et al. ";
          }
        } else if (this.sourceToParse.hasAuthors == "collective") {
            if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
                // Author last name
                if (this.sourceToParse.author1lastname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                } else {
                    this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
                // Author first name
                if (this.sourceToParse.author1firstname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim();
                } else {
                    this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                    this.sourceToParse.parsedSource += "?";
                }
            } else {
                this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                this.sourceToParse.parsedSource += "?";
            }

            if (this.sourceToParse.author2lastname || this.sourceToParse.author2firstname) {
                // Author 2 last name
                if (this.sourceToParse.author2lastname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2lastname.toUpperCase().trim();
                } else {
                    this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
                // Author 2 first name
                if (this.sourceToParse.author2firstname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2firstname.trim();
                } else {
                    this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname");
                    this.sourceToParse.parsedSource += "?";
                }
                this.sourceToParse.parsedSource += " (dir). ";
            } else {
                this.sourceToParse.parsedSource += " (dir). ";
            }
        } else {
            this.sourceToParse.parsedSource += "?. ";
            this.addComplexError("AUTHOR_NUMBER", "hasAuthors", {
                options: [
                  {
                    text: 'PROJECT.PARSE.AUTHOR_NUMBER.AUTHOR_1TO3',
                    value: '13'
                  },
                  {
                    text: 'PROJECT.PARSE.AUTHOR_NUMBER.AUTHOR_MORE_3',
                    value: 'more3'
                  },
                  {
                    text: 'PROJECT.PARSE.AUTHOR_NUMBER.AUTHOR_COLLECTIVE',
                    value: 'collective'
                  }
                ],
                type:"select"
            });
        }

        // Titre
        if (this.sourceToParse.title) {
            this.sourceToParse.parsedSource += "<em>" + this.sourceToParse.title.trim() + "</em>, ";
        } else {
            this.addError("BOOK_TITLE", "title");
            this.sourceToParse.parsedSource += "<em>?</em>, ";
        }

        // Édition
        if (this.sourceToParse.editionNumber) {
            switch (this.sourceToParse.editionNumber) {
                case 1:
                    this.sourceToParse.parsedSource += "1<sup>re</sup> ";
                    break;
                default:
                    this.sourceToParse.parsedSource += this.sourceToParse.editionNumber + "<sup>e</sup> ";
            }
            this.sourceToParse.parsedSource += "édition, ";
        }

        // Collection
        if (this.sourceToParse.collection) {
            this.sourceToParse.parsedSource += "coll. " + this.sourceToParse.collection.trim() + ", ";
        }

        // Traduction
        if (this.sourceToParse.hasBeenTranslated) {
            // Langue
            if (this.sourceToParse.translatedFrom) {
                if ((/^[aeiou]$/i).test(this.sourceToParse.translatedFrom.substr(0, 1))) {
                    this.sourceToParse.parsedSource += "trad. de l'" + this.sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                } else if (this.sourceToParse.translatedFrom.toLowerCase().substr(0, 1) == "h") {
                    var arr_la = ["hawaïen", "hébreu", "hindi"];
                    var arr_du = ["hongrois", "huron"];
                    if (arr_la.indexOf(this.sourceToParse.translatedFrom.toLowerCase().trim()) != -1) {
                        this.sourceToParse.parsedSource += "trad. de l'" + this.sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                    } else if (arr_du.indexOf(this.sourceToParse.translatedFrom.toLowerCase().trim()) != -1) {
                        this.sourceToParse.parsedSource += "trad. du " + this.sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                    } else {
                        this.sourceToParse.parsedSource += "trad. de l'" + this.sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                    }
                } else {
                    this.sourceToParse.parsedSource += "trad. du " + this.sourceToParse.translatedFrom.toLowerCase().trim() + " ";
                }
            } else {
                this.addError("TRANSLATION_LANGUAGE", "translatedFrom");
                this.sourceToParse.parsedSource += "trad. de ? ";
            }

            // Traducteurs
            if (this.sourceToParse.translator1lastname || this.sourceToParse.translator1firstname) {
                this.sourceToParse.parsedSource += "par ";
                // Translator's first name
                if (this.sourceToParse.translator1firstname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.translator1firstname.trim() + " ";
                } else {
                    this.addError("FIRST_TRANSLATOR_FIRSTNAME", "translator1firstname");
                    this.sourceToParse.parsedSource += "? ";
                }
                // Translator's last name
                if (this.sourceToParse.translator1lastname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.translator1lastname.trim();
                } else {
                    this.addError("FIRST_TRANSLATOR_LASTNAME", "translator1lastname");
                    this.sourceToParse.parsedSource += "? ";
                }
            } else {
                this.addError("FIRST_TRANSLATOR_FIRSTNAME", "translator1firstname");
                this.addError("FIRST_TRANSLATOR_LASTNAME", "translator1lastname");
                this.sourceToParse.parsedSource += "?";
            }

            if (this.sourceToParse.translator2lastname || this.sourceToParse.translator2firstname) {
                // Translator 2 first name
                if (this.sourceToParse.translator2firstname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.translator2firstname.trim();
                } else {
                    this.addError("SECOND_TRANSLATOR_FIRSTNAME", "translator2firstname");
                    this.sourceToParse.parsedSource += "?";
                }
                // Translator 2 last name
                if (this.sourceToParse.translator2lastname) {
                    this.sourceToParse.parsedSource += " " + this.sourceToParse.translator2lastname.trim() + ", ";
                } else {
                    this.addError("SECOND_TRANSLATOR_LASTNAME", "translator2lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
            } else {
                this.sourceToParse.parsedSource += ", ";
            }
        }

        // Lieu
        if (this.sourceToParse.publicationLocation) {
            this.sourceToParse.parsedSource += this.capitalizeFirstLetter(this.sourceToParse.publicationLocation.trim()) + ", ";
        } else {
            this.sourceToParse.parsedSource += "s.l., ";
            this.addWarning("EDITION_LOCATION", "publicationLocation");
        }

        // Éditeur
        if (this.sourceToParse.editor) {
            this.sourceToParse.parsedSource += this.sourceToParse.editor.trim() + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("EDITOR", "editor");
        }

        // Date
        if (this.sourceToParse.publicationDate) {
            this.sourceToParse.parsedSource += this.sourceToParse.publicationDate + ", ";
            var today = new Date();
            if (today.getFullYear() < Number(this.sourceToParse.publicationDate)) {
                this.addWarning("EDITION_DATE_TOO_HIGH", "publicationDate");
            }
        } else {
            this.sourceToParse.parsedSource += "s.d., ";
            this.addWarning("EDITION_DATE", "publicationDate");
        }

        // Volume
        if (this.sourceToParse.volumeNumber) {
            this.sourceToParse.parsedSource += "vol. " + this.sourceToParse.volumeNumber + ", ";
        }

        // Nombre de pages
        if (this.sourceToParse.pageNumber && !isNaN(this.sourceToParse.pageNumber)) {
            if (this.sourceToParse.pageNumber >= 1000) {
                this.sourceToParse.parsedSource += this.format(this.sourceToParse.pageNumber) + " p.";
            }else {
                this.sourceToParse.parsedSource += this.sourceToParse.pageNumber + " p.";
            }

            if (this.sourceToParse.pageNumber > 15000) {
                this.addWarning("PAGE_NUMBER_TOO_HIGH", "pageNumber");
            } else if (this.sourceToParse.pageNumber <= 0) {
                this.addWarning("PAGE_NUMBER_TOO_LOW", "pageNumber");
            }
            this.sourceToParse.pageNumber = Number(this.sourceToParse.pageNumber);
        } else {
            this.sourceToParse.parsedSource += "? p.";
            this.sourceToParse.pageNumber = '';
            this.addError("PAGE_NUMBER", "pageNumber");
        }
    } else if (this.sourceToParse.type == "article") {
        // Auteur
        if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
            if (this.sourceToParse.author1lastname) {
                this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase() + ", ";
            } else {
                this.sourceToParse.parsedSource += "?, ";
                this.addError("AUTHOR_ARTICLE_LASTNAME", "author1lastname");
            }

            if (this.sourceToParse.author1firstname) {
                this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.toUpperCase() + ". ";
            } else {
                this.sourceToParse.parseSource += "?. ";
                this.addError("AUTHOR_ARTICLE_FIRSTNAME", "author1firstname");
            }
        } else {
            this.sourceToParse.parsedSource += "?. ";
            this.addError("AUTHOR_ARTICLE_FIRSTNAME", "author1firstname");
            this.addError("AUTHOR_ARTICLE_LASTNAME", "author1lastname");
        }

        // Titre de l'Article
        if (this.sourceToParse.title) {
            this.sourceToParse.parsedSource += "«" + this.sourceToParse.title + "», ";
        } else {
            this.sourceToParse.parsedSource += "«?», ";
            this.addError("ARTICLE_TITLE", "title");
        }

        // Nom du périodique
        if (this.sourceToParse.editor) {
            this.sourceToParse.parsedSource += "<em>" + this.sourceToParse.editor + "</em>, ";
        } else {
            this.sourceToParse.parsedSource += "<em>?</em>, ";
            this.addError("PERIODIC_NAME", "editor");
        }

        // Numéro du périodique
        if (this.sourceToParse.editionNumber) {
            this.sourceToParse.parsedSource += this.sourceToParse.editionNumber + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("PERIODIC_NUMBER", "editionNumber");
        }

        // Date de publication
        if (this.sourceToParse.publicationDate) {
            this.sourceToParse.parsedSource += this.sourceToParse.publicationDate + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("EDITION_DATE", "publicationDate");
        }

        // Indication des pages
        if (this.sourceToParse.endPage || this.sourceToParse.startPage) {
            if (this.sourceToParse.startPage) {
                this.sourceToParse.parsedSource += "p. " + this.sourceToParse.startPage;
            } else {
                this.sourceToParse.parsedSource += "p. ?";
                this.addError("START_PAGE", "startPage");
            }
            this.sourceToParse.parsedSource += "-";

            if (this.sourceToParse.endPage) {
                this.sourceToParse.parsedSource += this.sourceToParse.endPage;
            } else {
                this.sourceToParse.parsedSource += "?";
                this.addError("END_PAGE", "endPage");
            }
            this.sourceToParse.parsedSource += ".";
        } else {
            this.sourceToParse.parsedSource += "p. ?-?.";
            this.addError("START_PAGE", "startPage");
            this.addError("END_PAGE", "endPage");
        }
    } else if (this.sourceToParse.type == "internet") {
        if (this.sourceToParse.hasAuthors) {
            if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
                // Author last name
                if (this.sourceToParse.author1lastname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                } else {
                    this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
                // Author first name
                if (this.sourceToParse.author1firstname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim();
                } else {
                    this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                    this.sourceToParse.parsedSource += "?";
                }
            } else {
                this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                this.sourceToParse.parsedSource += "?";
            }

            if (this.sourceToParse.author2lastname || this.sourceToParse.author2firstname) {
                // Author 2 last name
                if (this.sourceToParse.author2lastname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2lastname.toUpperCase().trim();
                } else {
                    this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
                // Author 2 first name
                if (this.sourceToParse.author2firstname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2firstname.trim();
                } else {
                    this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname");
                    this.sourceToParse.parsedSource += "?";
                }
            }

            if (this.sourceToParse.author3lastname || this.sourceToParse.author3firstname) {
                // Author 3 last name
                if (this.sourceToParse.author3lastname) {
                    this.sourceToParse.parsedSource += " et " + this.sourceToParse.author3lastname.toUpperCase().trim();
                } else {
                    this.addError("THIRD_AUTHOR_LASTNAME", "author3lastname");
                    this.sourceToParse.parsedSource += ", ?";
                }
                // Author 3 first name
                if (this.sourceToParse.author3firstname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author3firstname.trim() + ". ";
                } else {
                    this.addError("THIRD_AUTHOR_FIRSTNAME", "author3firstname");
                    this.sourceToParse.parsedSource += ", ?.";
                }
            } else {
                this.sourceToParse.parsedSource += ". ";
            }
        } else {
            if (this.sourceToParse.editor) {
                this.sourceToParse.parsedSource += this.sourceToParse.editor + ", ";
            } else {
                this.sourceToParse.parsedSource += "?, ";
                this.addError("HOMEPAGE_TITLE", "editor");
            }
        }

        // Titre de l'article
        if (this.sourceToParse.title) {
            this.sourceToParse.parsedSource += "«" + this.sourceToParse.title + "», ";
        } else {
            this.sourceToParse.parsedSource += "«?», ";
            this.addError("PAGE_TITLE", "title");
        }

        // Titre de la page d'accueil (si il y a des auteurs)
        if (this.sourceToParse.hasAuthors) {
            if (this.sourceToParse.editor) {
                this.sourceToParse.parsedSource += "<em>" + this.sourceToParse.editor + "</em>, ";
            } else {
                this.sourceToParse.parsedSource += "<em>?</em>, ";
                this.addError("HOMEPAGE_TITLE", "editor");
            }
        }

        // Type de support
        this.sourceToParse.parsedSource += "[en ligne]. ";

        // URL
        if (this.sourceToParse.url) {
            if (this.sourceToParse.url.search(/^((http|https):\/\/){1}(www\.){1}[^\/._]{2,}\.{1}[a-z]{2,}$/) != -1) {
                this.sourceToParse.parsedSource += "[" + this.sourceToParse.url + "] ";
                // console.log("normal");
            }else if (this.sourceToParse.url.search(/^((http|https):\/\/)?(www\.)?[^\/_]{2,}\.{1}[a-z]{2,}(\/.*)?$/i) != -1) {
                var http = this.sourceToParse.url.search(/^(http:\/\/){1}/);
                var https = this.sourceToParse.url.search(/^(https:\/\/){1}/);
                this.sourceToParse.url = this.sourceToParse.url.replace(/www.|http:\/\/|https:\/\//gi, "");
                let slashIndex = this.sourceToParse.url.search(/\/.*$/);
                // console.log(this.sourceToParse.url);
                if (slashIndex != -1) {
                    let afterSlash = slashIndex - this.sourceToParse.url.length;
                    this.sourceToParse.url = this.sourceToParse.url.slice(0, afterSlash);
                    console.log(this.sourceToParse.url);
                }

                this.sourceToParse.url = "www." + this.sourceToParse.url;

                if (http != -1) {
                    this.sourceToParse.url = "http://" + this.sourceToParse.url;
                }else if (https != -1) {
                    this.sourceToParse.url = "https://" + this.sourceToParse.url;
                }else {
                    this.sourceToParse.url = "http://" + this.sourceToParse.url;
                }

                this.sourceToParse.parsedSource += "[" + this.sourceToParse.url + "] ";
            }else {
                this.sourceToParse.parsedSource += "[" + this.sourceToParse.url + "] ";
                this.addWarning("INVALID_URL", "url");
            }
        } else {
            this.sourceToParse.parsedSource += "[?] ";
            this.addError("URL", "url");
        }

        // Date de consultation
        if (this.sourceToParse.consultationDate) {
            this.sourceToParse.parsedSource += "(" + new Date(this.sourceToParse.consultationDate).toLocaleDateString('fr', {timeZone:"UTC"}) + ")";
        } else {
            this.sourceToParse.parsedSource += "(?)";
        }
    } else if (this.sourceToParse.type == "cd") {
        if (this.sourceToParse.hasAuthors) {
            if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
                // Author last name
                if (this.sourceToParse.author1lastname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
                } else {
                    this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
                // Author first name
                if (this.sourceToParse.author1firstname) {
                    this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim();
                } else {
                    this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                    this.sourceToParse.parsedSource += "?";
                }
            } else {
                this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname");
                this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname");
                this.sourceToParse.parsedSource += "?";
            }

            if (this.sourceToParse.author2lastname || this.sourceToParse.author2firstname) {
                // Author 2 last name
                if (this.sourceToParse.author2lastname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2lastname.toUpperCase().trim();
                } else {
                    this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname");
                    this.sourceToParse.parsedSource += "?, ";
                }
                // Author 2 first name
                if (this.sourceToParse.author2firstname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author2firstname.trim();
                } else {
                    this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname");
                    this.sourceToParse.parsedSource += "?";
                }
            }

            if (this.sourceToParse.author3lastname || this.sourceToParse.author3firstname) {
                // Author 3 last name
                if (this.sourceToParse.author3lastname) {
                    this.sourceToParse.parsedSource += " et " + this.sourceToParse.author3lastname.toUpperCase().trim();
                } else {
                    this.addError("THIRD_AUTHOR_LASTNAME", "author3lastname");
                    this.sourceToParse.parsedSource += ", ?";
                }
                // Author 3 first name
                if (this.sourceToParse.author3firstname) {
                    this.sourceToParse.parsedSource += ", " + this.sourceToParse.author3firstname.trim() + ". ";
                } else {
                    this.addError("THIRD_AUTHOR_LASTNAME", "author3firstname");
                    this.sourceToParse.parsedSource += ", ?.";
                }
            } else {
                this.sourceToParse.parsedSource += ". ";
            }
        }

        // Titre de l'article
        if (this.sourceToParse.title) {
            this.sourceToParse.parsedSource += "<em>" + this.sourceToParse.title + "</em>, ";
        } else {
            this.sourceToParse.parsedSource += "<em>?</em>, ";
            this.addError("DOCUMENT_TITLE", "title");
        }

        // Type de support
        this.sourceToParse.parsedSource += "[cédérom], ";

        // Lieu de publication
        if (this.sourceToParse.publicationLocation) {
            this.sourceToParse.parsedSource += this.sourceToParse.publicationLocation + ", ";
        } else {
            this.sourceToParse.parsedSource += "s.l., ";
            this.addWarning("PUBLICATION_LOCATION", "publicationLocation");
        }

        // Éditeur
        if (this.sourceToParse.editor) {
            this.sourceToParse.parsedSource += this.sourceToParse.editor + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("EDITOR", "editor");
        }

        // Date de publication
        if (this.sourceToParse.publicationDate) {
            this.sourceToParse.parsedSource += this.sourceToParse.publicationDate + ".";
        } else {
            this.sourceToParse.parsedSource += "s.d.";
            this.addWarning("PUBLICATION_DATE", "publicationDate");
        }
    } else if (this.sourceToParse.type == "movie") {
        if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
            // Author last name
            if (this.sourceToParse.author1lastname  && this.sourceToParse.author1lastname != null) {
                this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
            } else {
                this.addError("DIRECTOR_LASTNAME", "author1lastname");
                this.sourceToParse.parsedSource += "?, ";
            }
            // Author first name
            if (this.sourceToParse.author1firstname  && this.sourceToParse.author1firstname != null) {
                this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim();
            } else {
                this.addError("DIRECTOR_FIRSTNAME", "author1firstname");
                this.sourceToParse.parsedSource += "?";
            }
        } else {
            this.addError("DIRECTOR_FIRSTNAME", "author1firstname");
            this.addError("DIRECTOR_LASTNAME", "author1lastname");
            this.sourceToParse.parsedSource += "?";
        }

        if (this.sourceToParse.hasAuthors) {
            this.sourceToParse.parsedSource += "et al., ";
        } else {
            this.sourceToParse.parsedSource += ". ";
        }

        // Titre de l'épisode
        if (this.sourceToParse.episodeTitle) {
            this.sourceToParse.parsedSource += "«" + this.sourceToParse.episodeTitle + "», ";
        }

        // Nom de l'émission ou du document
        if (this.sourceToParse.title) {
            this.sourceToParse.parsedSource += "<em>" + this.sourceToParse.title + "</em>, ";
        } else {
            this.sourceToParse.parsedSource += "<em>?</em>, ";
            this.addError("EMISSION_TITLE", "title");
        }

        // Lieu de production
        if (this.sourceToParse.productionLocation) {
            this.sourceToParse.parsedSource += this.sourceToParse.productionLocation + ", ";
        } else {
            this.sourceToParse.parsedSource += "s.l., ";
            this.addWarning("PRODUCTION_LOCATION", "productionLocation");
        }

        // Producteur
        if (this.sourceToParse.productor) {
            this.sourceToParse.parsedSource += this.sourceToParse.productor + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("PRODUCTOR", "productor");
        }

        // Diffuseur
        if (this.sourceToParse.broadcaster) {
            this.sourceToParse.parsedSource += this.sourceToParse.broadcaster + ", ";
        } else {
            this.addWarning("BROADCASTER", "broadcaster");
        }

        // Durée
        if (this.sourceToParse.duration) {
            this.sourceToParse.parsedSource += this.sourceToParse.duration + " min., ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("LENGTH", "duration");
        }

        // Date de publication
        if (this.sourceToParse.publicationDate) {
            this.sourceToParse.parsedSource += this.sourceToParse.publicationDate + ", ";
        } else {
            this.addWarning("PUBLICATION_DATE", "publicationDate");
            this.sourceToParse.parsedSource += "s.d., ";
        }

        // Support
        if (this.sourceToParse.support) {
            if (this.sourceToParse.support == "dvd") {
                this.sourceToParse.parsedSource += "[DVD], ";
            } else if (this.sourceToParse.support == "cd") {
                this.sourceToParse.parsedSource += "[cédérom], ";
            } else if (this.sourceToParse.support == "internet") {
                this.sourceToParse.parsedSource += "[en ligne], ";
            }
        }else {
            this.sourceToParse.parsedSource += "[?], ";
            this.addComplexError("SUPPORT", "support", {
                type:"select",
                options: [
                  {
                    text: "PROJECT.DETAIL.MODAL.MOVIE.SUPPORT_DVD",
                    value: "dvd"
                  },
                  {
                    text: "PROJECT.DETAIL.MODAL.MOVIE.SUPPORT_CD",
                    value: "cd"
                  },
                  {
                    text: "PROJECT.DETAIL.MODAL.MOVIE.SUPPORT_INTERNET",
                    value: "internet"
                  }
                ]
            });
        }

        // Date de visionnement
        if (this.sourceToParse.consultationDate) {
            this.sourceToParse.parsedSource += "(" + new Date(this.sourceToParse.consultationDate).toLocaleDateString('fr', {timeZone:"UTC"}) + ").";
        } else {
            this.sourceToParse.parsedSource += "(?).";
        }
    } else if (this.sourceToParse.type == "interview") {
        this.sourceToParse.title = "";
        if (this.sourceToParse.author1lastname || this.sourceToParse.author1firstname) {
            // Author last name
            if (this.sourceToParse.author1lastname) {
                this.sourceToParse.parsedSource += this.sourceToParse.author1lastname.toUpperCase().trim() + ", ";
            } else {
                this.addError("INTERVIEWER_LASTNAME", "author1lastname");
                this.sourceToParse.parsedSource += "?, ";
            }
            // Author first name
            if (this.sourceToParse.author1firstname) {
                this.sourceToParse.parsedSource += this.sourceToParse.author1firstname.trim() + ". ";
            } else {
                this.addError("INTERVIEWER_FIRSTNAME", "author1firstname");
                this.sourceToParse.parsedSource += "?. ";
            }
        } else {
            this.addError("INTERVIEWER_FIRSTNAME", "author1firstname");
            this.addError("INTERVIEWER_LASTNAME", "author1lastname");
            this.sourceToParse.parsedSource += "?. ";
        }
        // Texte
        this.sourceToParse.parsedSource += "Entrevue avec ";
        // Titre de civilité
        switch (this.sourceToParse.civility) {
          case "mister":
            this.sourceToParse.parsedSource += "M. ";
            break;
          case "miss":
            this.sourceToParse.parsedSource += "M<sup>me</sup> ";
            break;
          case "miss_young":
            this.sourceToParse.parsedSource += "M<sup>lle</sup> ";
            break;
          default:
            this.addComplexError("CIVILITY_TITLE", "civility", {
                options: [
                  {
                    text: 'PROJECT.DETAIL.MODAL.INTERVIEW.CIVILITY_MISTER',
                    value: '13'
                  },
                  {
                    text: 'PROJECT.DETAIL.MODAL.INTERVIEW.CIVILITY_MISS',
                    value: 'more3'
                  },
                  {
                    text: 'PROJECT.DETAIL.MODAL.INTERVIEW.CIVILITY_MISS_YOUNG',
                    value: 'collective'
                  }
                ],
                type:"select"
            });
            this.sourceToParse.parsedSource += "? ";
        }
        // Personne rencontrée
        if (this.sourceToParse.interviewed1lastname || this.sourceToParse.interviewed1firstname) {
            // interviewed first name
            if (this.sourceToParse.interviewed1firstname) {
                this.sourceToParse.parsedSource += this.sourceToParse.interviewed1firstname.trim() + " ";
                this.sourceToParse.title += this.sourceToParse.interviewed1firstname.trim() + " ";
            } else {
                this.addError("INTERVIEWED_FIRSTNAME", "interviewed1firstname");
                this.sourceToParse.parsedSource += "? ";
                this.sourceToParse.title += "? ";
            }
            // interviewed last name
            if (this.sourceToParse.interviewed1lastname) {
                this.sourceToParse.parsedSource += this.sourceToParse.interviewed1lastname.trim() + ", ";
                this.sourceToParse.title += this.sourceToParse.interviewed1lastname.trim();
            } else {
                this.addError("INTERVIEWED_LASTNAME", "interviewed1lastname");
                this.sourceToParse.parsedSource += "?, ";
                this.sourceToParse.title += "?";
            }
        } else {
            this.addError("INTERVIEWED_FIRSTNAME", "interviewed1firstname");
            this.addError("INTERVIEWED_LASTNAME", "interviewed1lastname");
            this.sourceToParse.parsedSource += "?, ";
        }

        // Titre de la personne
        if (this.sourceToParse.interviewedTitle) {
            this.sourceToParse.parsedSource += this.sourceToParse.interviewedTitle + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("INTERVIEWED_TITLE", "interviewedTitle");
        }

        // Location
        if (this.sourceToParse.publicationLocation) {
            this.sourceToParse.parsedSource += this.sourceToParse.publicationLocation + ", ";
        } else {
            this.sourceToParse.parsedSource += "?, ";
            this.addError("INTERVIEW_LOCATION", "publicationLocation");
        }

        // Date de l'entrevue
        if (this.sourceToParse.consultationDate) {
            this.sourceToParse.parsedSource += "le " + new Date(this.sourceToParse.consultationDate).toLocaleDateString('fr', {timeZone:"UTC"}) + ".";
        } else {
            this.sourceToParse.parsedSource += "le ?.";
        }
    } else {
        return null;
    }
    return this.sourceToParse;
  }

  private addError(errorId: string, variable: string) {
    this.sourceToParse.errors.push({
      errorTitle: this.translate.instant("PROJECT.PARSE." + errorId + ".DESC"),
      promptTitle: this.translate.instant("PROJECT.PARSE." + errorId + ".TITLE"),
      promptText: this.translate.instant("PROJECT.PARSE." + errorId + ".TEXT"),
      var: variable,
      key: errorId
    });
  }

  private addComplexError(errorId: string, variable: string, complex: any) {
    complex.options = complex.options.map((option) => {
      option.text = this.translate.instant(option.text);
      return option;
    });
    this.sourceToParse.errors.push({
      errorTitle: this.translate.instant("PROJECT.PARSE." + errorId + ".DESC"),
      promptTitle: this.translate.instant("PROJECT.PARSE." + errorId + ".TITLE"),
      promptText: this.translate.instant("PROJECT.PARSE." + errorId + ".TEXT"),
      var: variable,
      complex: true,
      type: complex.type,
      key: errorId,
      options: complex.options ? complex.options : []
    });
  }

  private addWarning(errorId: string, variable: string) {
    this.sourceToParse.warnings.push({
      errorTitle: this.translate.instant("PROJECT.PARSE." + errorId + ".DESC"),
      promptTitle: this.translate.instant("PROJECT.PARSE." + errorId + ".TITLE"),
      promptText: this.translate.instant("PROJECT.PARSE." + errorId + ".TEXT"),
      var: variable
    });
  }

  private capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  private format(num) {
		let numString = num.toString();
		let after = "";
		let count = 0;
		for (var i = numString.length-1; i >= 0; i--) {
			if (count != 0 && count % 3 == 0) {
        after = numString[i] + ' ' + after;
      } else {
        after = numString[i] + after;
      }
			count++;
		}
		return after;
  }
}
