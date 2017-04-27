"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/map");
require("rxjs/add/observable/throw");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/of");
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
    function Album(image, // Populated by getImages
        listeners, mbid, name, playcount, tags, tracks, url, wiki, error, message) {
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
        this.error = error;
        this.message = message;
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
var Artist = (function () {
    function Artist(bio, image, // Populated by getImages
        mbid, name, listeners, ontour, similar, // Populated by createSimilarArtists
        stats, streamable, tags, url, error, message) {
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
        this.error = error;
        this.message = message;
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
var LastFM = (function () {
    function LastFM(config, http) {
        this.config = config;
        this.http = http;
        this.mbidPattern = /^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/;
        this.Album = {
            getInfo: this.getAlbumInfo.bind(this),
            getTopTags: this.getAlbumTopTags.bind(this),
            search: this.searchAlbum.bind(this),
            _getInfo: this._getAlbumInfo.bind(this),
            _getTopTags: this._getAlbumTopTags.bind(this),
            _search: this._searchAlbum.bind(this)
        };
        this.Artist = {
            getInfo: this.getArtistInfo.bind(this),
            getSimilar: this.getSimilar.bind(this),
            getTopAlbums: this.getTopAlbums.bind(this),
            getTopTags: this.getArtistTopTags.bind(this),
            getTopTracks: this.getTopTracks.bind(this),
            search: this.searchArtists.bind(this),
            _getInfo: this._getArtistInfo.bind(this),
            _getSimilar: this._getSimilar.bind(this),
            _getTopAlbums: this._getTopAlbums.bind(this),
            _getTopTags: this._getArtistTopTags.bind(this),
            _getTopTracks: this._getTopTracks.bind(this),
            _search: this._searchArtists.bind(this)
        };
        this.Charts = {
            getTopArtists: this.getTopArtists.bind(this),
            getTopTags: this.getChartsTopTags.bind(this),
            getTopTracks: this.getChartsTopTracks.bind(this),
            _getTopArtists: this._getTopArtists.bind(this),
            _getTopTags: this._getChartsTopTags.bind(this),
            _getTopTracks: this._getChartsTopTracks.bind(this)
        };
        this.Geo = {
            getTopArtists: this.getTopGeoArtists.bind(this),
            getTopTracks: this.getTopGeoTracks.bind(this),
            _getTopArtists: this._getTopGeoArtists.bind(this),
            _getTopTracks: this._getTopGeoTracks.bind(this)
        };
        this.Track = {
            getInfo: this.getTrackInfo.bind(this),
            getSimilar: this.getSimilarTrack.bind(this),
            getTopTags: this.getTrackTopTags.bind(this),
            search: this.searchTrack.bind(this),
            _getInfo: this._getTrackInfo.bind(this),
            _getSimilar: this._getSimilarTrack.bind(this),
            _getTopTags: this._getTrackTopTags.bind(this),
            _search: this._searchTrack.bind(this)
        };
        config.endPoint || (config.endPoint = 'http://ws.audioscrobbler.com/2.0/');
        config.format || (config.format = 'json');
        var assign = function (common, options, settings) { return Object.assign({}, common, options, settings); };
        this.assignParams = this.partially(assign, { format: config.format, api_key: config.apiKey });
    }
    LastFM.prototype.partially = function (fn) {
        var args1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args1[_i - 1] = arguments[_i];
        }
        return function () {
            var args2 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args2[_i] = arguments[_i];
            }
            return fn.apply(void 0, args1.concat(args2));
        };
    };
    LastFM.prototype.getApiKey = function () {
        return this.config.apiKey;
    };
    /**
    *   error.json() : any
    *   Attempts to return body as parsed JSON object, or raises an exception.
    */
    LastFM.prototype.handleError = function (error) {
        var o = error.json(), msg = o.message || error.statusText;
        return Observable_1.Observable.throw(new Error(msg || 'Server Error'));
    };
    LastFM.prototype.isMbid = function (str) {
        return this.mbidPattern.test(str);
    };
    LastFM.prototype.updateSettings = function (settings, fieldName) {
        fieldName = fieldName || 'artist';
        if (this.isMbid(settings[fieldName])) {
            var newValues = { mbid: settings[fieldName] };
            newValues[fieldName] = '';
            var updated = Object.assign({}, settings, newValues);
            // or...delete the property. mbid takes precedence, regardless
            // delete updated[fieldName];
            return updated;
        }
        return settings;
    };
    LastFM.prototype.checkCanShow = function (results) {
        if (!results || !results.artistmatches) {
            return false;
        }
        // Having at least one potential to show from the results is nice...
        function hasImage(element, index, array) {
            return !!element['#text'];
        }
        return results.artistmatches.artist
            .some(function (element, index, array) { return element.mbid && element.image.some(hasImage); });
    };
    /**
     * Check there's an mbid and an image of specified size (default extralarge image source)
     */
    LastFM.prototype.checkUsableImage = function (result, size) {
        if (size === void 0) { size = 3; }
        if (result.mbid && result.image && result.image[size] && result.image[size]['#text'] !== '') {
            return true;
        }
        return false;
    };
    LastFM.prototype._http = function (settings, options) {
        if (settings === void 0) { settings = {}; }
        if (options === void 0) { options = {}; }
        var updated = this.updateSettings(settings), params = this.assignParams(options, updated);
        return this.http.get(this.config.endPoint, { params: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    /**
     * @data : received from lastfm
     * @path : the path to the required data eg. 'results.artistmatches.artist'
     * @empty: what to return if there were no results
     */
    LastFM.prototype.validateData = function (data, path, empty) {
        if (data === void 0) { data = {}; }
        if (path === void 0) { path = ''; }
        if (empty === void 0) { empty = []; }
        if (data && data.error) {
            return data;
        }
        var value = path.split('.').reduce(function (a, b) { return a[b] || {}; }, data);
        return Object.keys(value).length === 0 ? empty : value;
    };
    // Album
    // Docs: http://www.last.fm/api/show/album.getInfo
    LastFM.prototype._getAlbumInfo = function (artistOrMbid, album, options) {
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            album: album,
            method: 'album.getinfo'
            // mbid: mbid,
            // autocorrect: 1,
            // lang: 'de'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getAlbumInfo = function (artistOrMbid, album, options) {
        var _this = this;
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        return this._getAlbumInfo.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'album', null); })
            .map(function (album) { return Album.fromJSON(album); });
    };
    // Docs: http://www.last.fm/api/show/album.getTopTags
    /*
        Note: Docs say artist & album optional if mbid is used...
        That appers wrong - supplying mbid returns error artist/album missing.
    */
    LastFM.prototype._getAlbumTopTags = function (artistOrMbid, album, options) {
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'album.gettoptags',
            album: album,
            artist: artistOrMbid
            // mbid :mbid,
            // autocorrect: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getAlbumTopTags = function (artistOrMbid, album, options) {
        var _this = this;
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        return this._getAlbumTopTags.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'toptags.tag'); });
    };
    // Docs: http://www.last.fm/api/show/album.search
    LastFM.prototype._searchAlbum = function (album, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            album: album,
            method: 'album.search'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.searchAlbum = function (artistOrMbid, album, options) {
        var _this = this;
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        return this._searchAlbum.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'results.albummatches.album'); })
            .map(function (albums) {
            return albums
                .map(function (album) { return Album.fromJSON(album); });
        });
    };
    // End Album
    // Artist
    // Docs: http://www.last.fm/api/show/artist.getInfo
    LastFM.prototype._getArtistInfo = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.getinfo'
            // mbid: mbid,
            // autocorrect: 1,
            // lang: 'de'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getArtistInfo = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getArtistInfo.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'artist', null); })
            .map(function (artist) { return Artist.fromJSON(artist); });
    };
    // Docs: http://www.last.fm/api/show/artist.getSimilar
    LastFM.prototype._getSimilar = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.getsimilar'
            // mbid: mbid,
            // limit: 10,
            // autocorrect: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getSimilar = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getSimilar.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'similarartists.artist'); })
            .map(function (data) {
            return data.error ? data : data
                .map(function (artist) { return Artist.fromJSON(artist); });
        });
    };
    // Docs: http://www.last.fm/api/show/artist.getTopAlbums
    LastFM.prototype._getTopAlbums = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.gettopalbums'
            // mbid: mbid,
            // limit: 10,
            // autocorrect: 1,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopAlbums = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopAlbums.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'topalbums.album'); })
            .map(function (data) {
            return data.error ? data : data
                .map(function (album) { return Album.fromJSON(album); });
        });
    };
    // Docs: http://www.last.fm/api/show/artist.getTopTags
    LastFM.prototype._getArtistTopTags = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.gettoptags'
            // mbid: mbid,
            // autocorrect: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getArtistTopTags = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getArtistTopTags.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'toptags.tag'); });
    };
    // Docs: http://www.last.fm/api/show/artist.getTopTracks
    LastFM.prototype._getTopTracks = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.gettoptracks'
            // mbid: mbid,
            // limit: 10,
            // autocorrect: 1,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopTracks = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopTracks.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'toptracks.track'); });
    };
    // Docs: http://www.last.fm/api/show/artist.search
    LastFM.prototype._searchArtists = function (artist, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artist,
            method: 'artist.search'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.searchArtists = function (artist, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._searchArtists.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'results.artistmatches.artist', []); })
            .map(function (artists) {
            return artists
                .filter(function (artist) { return _this.checkUsableImage(artist); })
                .map(function (artist) { return Artist.fromJSON(artist); });
        });
    };
    // End Artist
    // Charts
    // Docs: http://www.last.fm/api/show/chart.getTopArtists
    LastFM.prototype._getTopArtists = function (options) {
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'chart.gettopartists'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopArtists = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopArtists.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'artists.artist'); })
            .map(function (artists) {
            return artists
                .map(function (artist) { return Artist.fromJSON(artist); });
        });
    };
    // Docs: http://www.last.fm/api/show/chart.getTopTags
    LastFM.prototype._getChartsTopTags = function (options) {
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'chart.gettoptags'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getChartsTopTags = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getChartsTopTags.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'tags.tag'); });
    };
    // Docs: http://www.last.fm/api/show/chart.getTopTrack
    LastFM.prototype._getChartsTopTracks = function (options) {
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'chart.gettoptracks'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getChartsTopTracks = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getChartsTopTracks.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'tracks.track'); });
    };
    // End Charts
    // Geo
    // Docs: http://www.last.fm/api/show/chart.getTopArtists
    LastFM.prototype._getTopGeoArtists = function (country, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            country: country,
            method: 'geo.gettopartists'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopGeoArtists = function (country, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopGeoArtists.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'topartists.artist'); })
            .map(function (data) {
            return data.error ? data : data
                .map(function (artist) { return Artist.fromJSON(artist); });
        });
    };
    // Docs: http://www.last.fm/api/show/geo.getTopTracks
    LastFM.prototype._getTopGeoTracks = function (country, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            country: country,
            method: 'geo.gettoptracks'
            // limit: 10,
            // page: 1,
            // location: 'Manchester
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopGeoTracks = function (country, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopGeoTracks.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'tracks.track'); });
    };
    // End Geo
    // Track
    // Docs: http://www.last.fm/api/show/track.getInfo
    LastFM.prototype._getTrackInfo = function (artistOrMbid, track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            track: track,
            method: 'track.getInfo'
            // mbid: mbid,
            // autocorrect: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTrackInfo = function (artistOrMbid, track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._getTrackInfo.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'track', {}); });
    };
    // Docs: http://www.last.fm/api/show/track.getSimilar
    LastFM.prototype._getSimilarTrack = function (artistOrMbid, track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            track: track,
            method: 'track.getsimilar'
            // mbid: mbid,
            // autocorrect: 1,
            // limit: 10
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getSimilarTrack = function (artistOrMbid, track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._getSimilarTrack.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'similartracks.track'); });
    };
    // Docs: http://www.last.fm/api/show/track.getTopTags
    LastFM.prototype._getTrackTopTags = function (artistOrMbid, track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            track: track,
            method: 'track.gettoptags'
            // mbid: mbid,
            // autocorrect: 1,
            // limit: 10
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTrackTopTags = function (artistOrMbid, track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._getTrackTopTags.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'toptags.tag'); });
    };
    // Docs: http://www.last.fm/api/show/track.search
    LastFM.prototype._searchTrack = function (track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            track: track,
            method: 'track.search'
            // limit: 10,
            // page: 1
        };
        return this._http(settings, options);
    };
    LastFM.prototype.searchTrack = function (track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._searchTrack.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'results.trackmatches.track'); });
    };
    return LastFM;
}());
LastFM = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject('LastFMConfig')),
    __metadata("design:paramtypes", [Object, http_1.Http])
], LastFM);
exports.LastFM = LastFM;
//# sourceMappingURL=lastfm.service.js.map