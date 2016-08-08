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
var http_1 = require('@angular/http');
var core_1 = require('@angular/core');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/operator/map');
require('rxjs/add/observable/throw');
require('rxjs/add/operator/catch');
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
        this.assignParams = this.curry(assign, { format: config.format, api_key: config.api_key });
    }
    LastFM.prototype.curry = function (fn) {
        var args1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args1[_i - 1] = arguments[_i];
        }
        return function () {
            var args2 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args2[_i - 0] = arguments[_i];
            }
            return fn.apply(void 0, args1.concat(args2));
        };
    };
    LastFM.prototype.getApiKey = function () {
        return this.config.api_key;
    };
    LastFM.prototype.getSearchParams = function (params) {
        var search = new http_1.URLSearchParams();
        // Really?! No method to accept object?!
        for (var key in params) {
            search.set(key, params[key]);
        }
        return search;
    };
    LastFM.prototype.createParams = function (settings, options) {
        if (settings === void 0) { settings = {}; }
        if (options === void 0) { options = {}; }
        var params = this.assignParams(options, settings);
        return this.getSearchParams(params);
    };
    /**
    *   error.json() : any
    *   Attempts to return body as parsed JSON object, or raises an exception.
    */
    LastFM.prototype.handleError = function (error) {
        var o = error.json(), msg = o.message || error.statusText;
        return Observable_1.Observable.throw(msg || 'Server Error');
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
    /*
        Check there's an mbid and an image of specified size (default extralarge image source)
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
        var updated = this.updateSettings(settings), params = this.createParams(options, updated);
        return this.http.get(this.config.endPoint, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    /**
    *    @data : received from lastfm
    *    @path : the path to the required data eg. 'results.artistmatches.artist'
    *    @empty: what to return if there were no results
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
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getAlbumInfo = function (artistOrMbid, album, options) {
        var _this = this;
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        return this._getAlbumInfo.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'album', {});
        });
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
        };
        return this._http(settings, options);
    };
    LastFM.prototype.searchAlbum = function (artistOrMbid, album, options) {
        var _this = this;
        if (album === void 0) { album = ''; }
        if (options === void 0) { options = {}; }
        return this._searchAlbum.apply(this, arguments)
            .map(function (data) { return _this.validateData(data, 'results.albummatches.album'); });
    };
    // End Album
    // Artist
    // Docs: http://www.last.fm/api/show/artist.getInfo
    LastFM.prototype._getArtistInfo = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.getinfo'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getArtistInfo = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getArtistInfo.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'artist', {});
        });
    };
    // Docs: http://www.last.fm/api/show/artist.getSimilar
    LastFM.prototype._getSimilar = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.getsimilar'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getSimilar = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getSimilar.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'similarartists.artist');
        });
    };
    // Docs: http://www.last.fm/api/show/artist.getTopAlbums
    LastFM.prototype._getTopAlbums = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.gettopalbums'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopAlbums = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopAlbums.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'topalbums.album');
        });
    };
    // Docs: http://www.last.fm/api/show/artist.getTopTags
    LastFM.prototype._getArtistTopTags = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.gettoptags'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getArtistTopTags = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getArtistTopTags.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'toptags.tag');
        });
    };
    // Docs: http://www.last.fm/api/show/artist.getTopTracks
    LastFM.prototype._getTopTracks = function (artistOrMbid, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            method: 'artist.gettoptracks'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopTracks = function (artistOrMbid, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopTracks.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'toptracks.track');
        });
    };
    // Docs: http://www.last.fm/api/show/artist.search
    LastFM.prototype._searchArtists = function (artist, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artist,
            method: 'artist.search'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.searchArtists = function (artist, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._searchArtists.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'results.artistmatches.artist');
        });
    };
    // End Artist
    // Charts
    // Docs: http://www.last.fm/api/show/chart.getTopArtists
    LastFM.prototype._getTopArtists = function (options) {
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'chart.gettopartists'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopArtists = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopArtists.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'artists.artist');
        });
    };
    // Docs: http://www.last.fm/api/show/chart.getTopTags
    LastFM.prototype._getChartsTopTags = function (options) {
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'chart.gettoptags'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getChartsTopTags = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getChartsTopTags.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'tags.tag');
        });
    };
    // Docs: http://www.last.fm/api/show/chart.getTopTrack
    LastFM.prototype._getChartsTopTracks = function (options) {
        if (options === void 0) { options = {}; }
        var settings = {
            method: 'chart.gettoptracks'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getChartsTopTracks = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getChartsTopTracks.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'tracks.track');
        });
    };
    // End Charts
    // Geo
    // Docs: http://www.last.fm/api/show/chart.getTopArtists
    LastFM.prototype._getTopGeoArtists = function (country, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            country: country,
            method: 'geo.gettopartists'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopGeoArtists = function (country, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopGeoArtists.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'topartists.artist');
        });
    };
    // Docs: http://www.last.fm/api/show/geo.getTopTracks
    LastFM.prototype._getTopGeoTracks = function (country, options) {
        if (options === void 0) { options = {}; }
        var settings = {
            country: country,
            method: 'geo.gettoptracks'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTopGeoTracks = function (country, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._getTopGeoTracks.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'tracks.track');
        });
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
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTrackInfo = function (artistOrMbid, track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._getTrackInfo.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'track', {});
        });
    };
    // Docs: http://www.last.fm/api/show/track.getSimilar
    LastFM.prototype._getSimilarTrack = function (artistOrMbid, track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            track: track,
            method: 'track.getsimilar'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getSimilarTrack = function (artistOrMbid, track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._getSimilarTrack.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'similartracks.track');
        });
    };
    // Docs: http://www.last.fm/api/show/track.getTopTags
    LastFM.prototype._getTrackTopTags = function (artistOrMbid, track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            artist: artistOrMbid,
            track: track,
            method: 'track.gettoptags'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.getTrackTopTags = function (artistOrMbid, track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._getTrackTopTags.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'toptags.tag');
        });
    };
    // Docs: http://www.last.fm/api/show/track.search
    LastFM.prototype._searchTrack = function (track, options) {
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        var settings = {
            track: track,
            method: 'track.search'
        };
        return this._http(settings, options);
    };
    LastFM.prototype.searchTrack = function (track, options) {
        var _this = this;
        if (track === void 0) { track = ''; }
        if (options === void 0) { options = {}; }
        return this._searchTrack.apply(this, arguments)
            .map(function (data) {
            return _this.validateData(data, 'results.trackmatches.track');
        });
    };
    LastFM = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject('LastFMConfig')), 
        __metadata('design:paramtypes', [Object, http_1.Http])
    ], LastFM);
    return LastFM;
}());
exports.LastFM = LastFM;
//# sourceMappingURL=lastfm.service.js.map