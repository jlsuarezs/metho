String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.capitalizeEveryFirstLetter = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

String.prototype.isLowerCase = function () {
    return this === this.toLowerCase();
}

String.prototype.isUpperCase = function () {
    return this == this.toUpperCase();
}

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

String.prototype.indexOfEnd = function(string) {
    var io = this.indexOf(string);
    return io == -1 ? -1 : io + string.length;
};

Array.prototype.fromObject = function (obj) {
    var ar = [];
    for(item in obj){
        ar.push(obj[item]);
    }
    return ar;
};

function random(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var unknown_subjects = ["Matière inconnue", "Unknown subject", "Materia desconocida"];
var name_labels = ["prénom", "nombre", "firstname", "lastname", "nom", "apellido"];
var author_label = ["auteur", "author", "autor"];

function wrapInBold (stringToWrap, arr_wrap) {
    if (found = new RegExp(arr_wrap.join("|"), 'i').exec(stringToWrap)) {
        var index = stringToWrap.indexOf(found[0]);
        stringToWrap = stringToWrap.splice(index, 0, "<b>");
        var lastIndex = stringToWrap.indexOfEnd(found[0]);
        stringToWrap = stringToWrap.splice(lastIndex, 0, "</b>");
    }

    return stringToWrap;
}
