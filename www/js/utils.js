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
