"use strict";
// Convert last.fm array for easier use
var getImages = function (image) {
    // image is the array of images from last fm
    // small, medium, large, extralarge, mega
    // let [small, medium, large, extralarge, mega] = image;
    // return {
    //     small,
    //     medium,
    //     large,
    //     extralarge,
    //     mega,
    // }
    var o = {};
    image
        .filter(function (o) { return o['#text']; })
        .forEach(function (element, index, array) { return o[element.size] = element['#text']; });
    return o;
};
var Album = (function () {
    function Album(image, // Gets mutated by getImages
        listeners, mbid, name, playcount, tags, tracks, url, wiki) {
        if (image === void 0) { image = []; }
        if (listeners === void 0) { listeners = ''; }
        if (mbid === void 0) { mbid = ''; }
        if (name === void 0) { name = ''; }
        if (playcount === void 0) { playcount = ''; }
        if (tags === void 0) { tags = {}; }
        if (tracks === void 0) { tracks = {}; }
        if (url === void 0) { url = ''; }
        if (wiki === void 0) { wiki = {}; }
        this.image = image;
        this.listeners = listeners;
        this.mbid = mbid;
        this.name = name;
        this.playcount = playcount;
        this.tags = tags;
        this.tracks = tracks;
        this.url = url;
        this.wiki = wiki;
        this.image = this.image ? getImages(this.image) : {};
    }
    Album.fromJSON = function (json) {
        var artist = Object.create(Album.prototype);
        return Object.assign(artist, json, {
            image: json.image ? getImages(json.image) : {}
        });
    };
    return Album;
}());
exports.Album = Album;
