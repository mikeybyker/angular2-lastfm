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
var Artist = (function () {
    function Artist(bio, image, // Gets mutated by getImages
        mbid, name, listeners, ontour, similar, // Gets mutated by createSimilarArtists
        stats, streamable, tags, url) {
        if (bio === void 0) { bio = {}; }
        if (image === void 0) { image = []; }
        if (mbid === void 0) { mbid = ''; }
        if (name === void 0) { name = ''; }
        if (listeners === void 0) { listeners = ''; }
        if (ontour === void 0) { ontour = ''; }
        if (similar === void 0) { similar = {}; }
        if (stats === void 0) { stats = {}; }
        if (streamable === void 0) { streamable = ''; }
        if (tags === void 0) { tags = {}; }
        if (url === void 0) { url = ''; }
        this.bio = bio;
        this.image = image;
        this.mbid = mbid;
        this.name = name;
        this.listeners = listeners;
        this.ontour = ontour;
        this.similar = similar;
        this.stats = stats;
        this.streamable = streamable;
        this.tags = tags;
        this.url = url;
        this.image = this.image ? getImages(this.image) : {};
        this.similar = this.similar ? Artist.createSimilarArtists(this.similar) : [];
    }
    Artist.fromJSON = function (json) {
        var artist = Object.create(Artist.prototype);
        return Object.assign(artist, json, {
            image: json.image ? getImages(json.image) : {},
            similar: json.similar ? Artist.createSimilarArtists(json.similar) : []
        });
    };
    Artist.createSimilarArtists = function (similar) {
        if (!similar || !similar.artist) {
            return [];
        }
        return similar.artist
            .map(function (artist) {
            return Artist.fromJSON(artist);
        });
    };
    return Artist;
}());
exports.Artist = Artist;
