import {
  Http,
  Response,
  Headers,
  URLSearchParams
} from '@angular/http';
import {
  Injectable,
  Inject
} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

interface LastFMOptions {
  autocorrect?: number,
  lang?: string,
  limit?: number,
  location?: string,
  mbid?: string,
  page?: number,
  album?: string,
  artist?: string,
  method?: string,
  track?: string
}

interface LastFMConfig {
  apiKey: string,
  endPoint?: string,
  format?: string
}

interface AlbumJSON {
  artist: any;
  image: Array<any>;
  listeners: string;
  mbid: string;
  name: string;
  playcount: Number;
  tags: any;
  tracks: any;
  url: string;
  wiki: any;
}

// Convert last.fm array for easier use
const getImages = (image) => {
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
  let o: any = {};
  image
    .filter(o => o['#text'])
    .forEach((element, index, array) => o[element.size] = element['#text']);
  return o;
}

export class Album {

  static fromJSON(json: AlbumJSON): Album {
    let artist = Object.create(Album.prototype);
    return Object.assign(artist, json, {
      image: json.image ? getImages(json.image) : {}
    });
  }

  constructor(
    public image: any = [],        // Gets mutated by getImages
    public listeners: string = '',
    public mbid: string = '',
    public name: string = '',
    public playcount: string = '',
    public tags: any = {},
    public tracks: any = {},
    public url: string = '',
    public wiki: any = {}
  ) {
    this.image = this.image ? getImages(this.image) : {};
  }

}
// The data structure as loaded from last.fm
interface ArtistJSON {
  bio: any;
  image: Array<any>;
  mbid: string;
  name: string;
  listeners: string;
  ontour: string;
  similar: any;
  stats: any;
  streamable: string;
  tags: any;
  url: string;
}

export class Artist {

  static fromJSON(json: ArtistJSON): Artist {
    let artist = Object.create(Artist.prototype);
    return Object.assign(artist, json, {
      image: json.image ? getImages(json.image) : {},
      similar: json.similar ? Artist.createSimilarArtists(json.similar) : []
    });
  }

  static createSimilarArtists(similar): Array<Artist> {
    if (!similar || !similar.artist) {
      return [];
    }
    return similar.artist
      .map((artist: any) => {
        return Artist.fromJSON(artist);
      });
  }

  constructor(
    public bio: any = {},
    public image: any = [],            // Gets mutated by getImages
    public mbid: string = '',
    public name: string = '',
    public listeners: string = '',
    public ontour: string = '',
    public similar: any = {},          // Gets mutated by createSimilarArtists
    public stats: any = {},
    public streamable: string = '',
    public tags: any = {},
    public url: string = ''
  ) {
    this.image = this.image ? getImages(this.image) : {};
    this.similar = this.similar ? Artist.createSimilarArtists(this.similar) : [];
  }
}


@Injectable()
export class LastFM {

  mbidPattern: RegExp = /^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/;
  assignParams: Function;

  constructor( @Inject('LastFMConfig') private config: LastFMConfig, public http: Http) {
    config.endPoint || (config.endPoint = 'http://ws.audioscrobbler.com/2.0/');
    config.format || (config.format = 'json');
    const assign = (common, options, settings) => Object.assign({}, common, options, settings);
    this.assignParams = this.partially(assign, { format: config.format, api_key: config.apiKey });
  }

  partially(fn, ...args1) {
    return (...args2) => fn(...args1, ...args2);
  }

  getApiKey() {
    return this.config.apiKey;
  }

  getSearchParams(params: LastFMOptions): URLSearchParams {
    const search: URLSearchParams = new URLSearchParams();
    // Really?! No method to accept object?!
    for (const key in params) {
      search.set(key, params[key]);
    }
    return search;
  }

  private createParams(settings: LastFMOptions = {}, options: LastFMOptions = {}): URLSearchParams {
    let params: LastFMOptions = this.assignParams(options, settings);
    return this.getSearchParams(params);
  }

  /**
  *   error.json() : any
  *   Attempts to return body as parsed JSON object, or raises an exception.
  */
  private handleError(error: Response): Observable<any> {
    let o: any = error.json(),
      msg: string = o.message || error.statusText;
    return Observable.throw(new Error(msg || 'Server Error'));
  }
  isMbid(str) {
    return this.mbidPattern.test(str);
  }
  updateSettings(settings: LastFMOptions, fieldName?: string): LastFMOptions {
    fieldName = fieldName || 'artist';
    if (this.isMbid(settings[fieldName])) {
      const newValues: LastFMOptions = { mbid: settings[fieldName] };
      newValues[fieldName] = '';
      const updated: LastFMOptions = Object.assign({}, settings, newValues);
      // or...delete the property. mbid takes precedence, regardless
      // delete updated[fieldName];
      return updated;
    }
    return settings;
  }
  checkCanShow(results: any): boolean {
    if (!results || !results.artistmatches) {
      return false;
    }
    // Having at least one potential to show from the results is nice...
    function hasImage(element, index, array): boolean {
      return !!element['#text'];
    }
    return results.artistmatches.artist
      .some((element, index, array) => element.mbid && element.image.some(hasImage));
  }
  /**
   * Check there's an mbid and an image of specified size (default extralarge image source)
   */
  checkUsableImage(result: any, size: number = 3): boolean {
    if (result.mbid && result.image && result.image[size] && result.image[size]['#text'] !== '') {
      return true;
    }
    return false;
  }

  private _http(settings: LastFMOptions = {}, options: LastFMOptions = {}): Observable<any> {
    const updated: LastFMOptions = this.updateSettings(settings),
      params: URLSearchParams = this.createParams(options, updated);
    return this.http.get(this.config.endPoint, { search: params })
      .map(res => res.json())
      .catch(this.handleError);
  }

  /**
   * @data : received from lastfm
   * @path : the path to the required data eg. 'results.artistmatches.artist'
   * @empty: what to return if there were no results
   */
  private validateData(data: any = {}, path: string = '', empty: any = []) {
    if (data && data.error) {
      return data;
    }
    const value = path.split('.').reduce((a, b) => a[b] || {}, data);
    return Object.keys(value).length === 0 ? empty : value;
  }


  Album = {
    getInfo: this.getAlbumInfo.bind(this),
    getTopTags: this.getAlbumTopTags.bind(this),
    search: this.searchAlbum.bind(this),

    _getInfo: this._getAlbumInfo.bind(this),
    _getTopTags: this._getAlbumTopTags.bind(this),
    _search: this._searchAlbum.bind(this)
  };


  Artist = {
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

  Charts = {
    getTopArtists: this.getTopArtists.bind(this),
    getTopTags: this.getChartsTopTags.bind(this),
    getTopTracks: this.getChartsTopTracks.bind(this),

    _getTopArtists: this._getTopArtists.bind(this),
    _getTopTags: this._getChartsTopTags.bind(this),
    _getTopTracks: this._getChartsTopTracks.bind(this)
  };

  Geo = {
    getTopArtists: this.getTopGeoArtists.bind(this),
    getTopTracks: this.getTopGeoTracks.bind(this),

    _getTopArtists: this._getTopGeoArtists.bind(this),
    _getTopTracks: this._getTopGeoTracks.bind(this)
  };

  Track = {
    getInfo: this.getTrackInfo.bind(this),
    getSimilar: this.getSimilarTrack.bind(this),
    getTopTags: this.getTrackTopTags.bind(this),
    search: this.searchTrack.bind(this),

    _getInfo: this._getTrackInfo.bind(this),
    _getSimilar: this._getSimilarTrack.bind(this),
    _getTopTags: this._getTrackTopTags.bind(this),
    _search: this._searchTrack.bind(this)
  };


  // Album

  // Docs: http://www.last.fm/api/show/album.getInfo
  _getAlbumInfo(artistOrMbid: string, album: string = '', options: LastFMOptions = {}): Observable<any> {
    let settings = {
      artist: artistOrMbid,
      album: album,
      method: 'album.getinfo'
      // mbid: mbid,
      // autocorrect: 1,
      // lang: 'de'
    };
    return this._http(settings, options);
  }

  getAlbumInfo(artistOrMbid: string, album: string = '', options: LastFMOptions = {}): Observable<Album> {
    return this._getAlbumInfo.apply(this, arguments)
      .map(data => this.validateData(data, 'album', null))
      // .filter(album => !!album.artist) // make sure there is album data *
      .map(album => Album.fromJSON(album));
    // * this would prevent it sending through errors...so we wouldn't be able to handle/show user
  }


  // Docs: http://www.last.fm/api/show/album.getTopTags
  /*
      Note: Docs say artist & album optional if mbid is used...
      That appers wrong - supplying mbid returns error artist/album missing.
  */
  _getAlbumTopTags(artistOrMbid: string, album: string = '', options: any = {}): Observable<Array<any>> {
    let settings = {
      method: 'album.gettoptags',
      album: album,
      artist: artistOrMbid
      // mbid :mbid,
      // autocorrect: 1
    };
    return this._http(settings, options);
  }
  getAlbumTopTags(artistOrMbid: string, album: string = '', options: any = {}): Observable<Array<any>> {
    return this._getAlbumTopTags.apply(this, arguments)
      .map(data => this.validateData(data, 'toptags.tag'));
  }


  // Docs: http://www.last.fm/api/show/album.search
  _searchAlbum(album: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      album: album,
      method: 'album.search'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  searchAlbum(artistOrMbid: string, album: string = '', options: any = {}): Observable<Array<Album>> {
    return this._searchAlbum.apply(this, arguments)
      .map(data => this.validateData(data, 'results.albummatches.album'))
      .map(albums => {
        return albums
          .map((album) => Album.fromJSON(album));
      });
  }


  // End Album

  // Artist
  // Docs: http://www.last.fm/api/show/artist.getInfo
  _getArtistInfo(artistOrMbid: string, options: any = {}): Observable<any> {
    let settings = {
      artist: artistOrMbid,
      method: 'artist.getinfo'
      // mbid: mbid,
      // autocorrect: 1,
      // lang: 'de'
    };
    return this._http(settings, options);
  }
  getArtistInfo(artistOrMbid: string, options: any = {}): Observable<Artist> {
    return this._getArtistInfo.apply(this, arguments)
      .map(data => this.validateData(data, 'artist', null))
      .map(artist => Artist.fromJSON(artist));
  }


  // Docs: http://www.last.fm/api/show/artist.getSimilar
  _getSimilar(artistOrMbid: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      artist: artistOrMbid,
      method: 'artist.getsimilar'
      // mbid: mbid,
      // limit: 10,
      // autocorrect: 1
    };
    return this._http(settings, options);
  }
  getSimilar(artistOrMbid: string, options: any = {}): Observable<Array<Artist>> {
    return this._getSimilar.apply(this, arguments)
      .map(data => this.validateData(data, 'similarartists.artist'))
      .map(artists => {
        return artists
          .map((artist) => Artist.fromJSON(artist));
      });
  }


  // Docs: http://www.last.fm/api/show/artist.getTopAlbums
  _getTopAlbums(artistOrMbid: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      artist: artistOrMbid,
      method: 'artist.gettopalbums'
      // mbid: mbid,
      // limit: 10,
      // autocorrect: 1,
      // page: 1
    };
    return this._http(settings, options);
  }
  getTopAlbums(artistOrMbid: string, options: any = {}): Observable<Array<Album>> {
    return this._getTopAlbums.apply(this, arguments)
      .map(data => this.validateData(data, 'topalbums.album'))
      .map(albums => {
        // albums is an array - *not* of Album objects, just objects...
        return albums
          .map((album) => Album.fromJSON(album));
      });
  }


  // Docs: http://www.last.fm/api/show/artist.getTopTags
  _getArtistTopTags(artistOrMbid: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      artist: artistOrMbid,
      method: 'artist.gettoptags'
      // mbid: mbid,
      // autocorrect: 1
    };
    return this._http(settings, options);
  }
  getArtistTopTags(artistOrMbid: string, options: any = {}): Observable<Array<any>> {
    return this._getArtistTopTags.apply(this, arguments)
      .map(data => this.validateData(data, 'toptags.tag'));
  }


  // Docs: http://www.last.fm/api/show/artist.getTopTracks
  _getTopTracks(artistOrMbid: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      artist: artistOrMbid,
      method: 'artist.gettoptracks'
      // mbid: mbid,
      // limit: 10,
      // autocorrect: 1,
      // page: 1
    };
    return this._http(settings, options);
  }
  getTopTracks(artistOrMbid: string, options: any = {}): Observable<Array<any>> {
    return this._getTopTracks.apply(this, arguments)
      .map(data => this.validateData(data, 'toptracks.track'));
  }


  // Docs: http://www.last.fm/api/show/artist.search
  _searchArtists(artist: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      artist: artist,
      method: 'artist.search'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  searchArtists(artist: string, options: any = {}): Observable<Array<Artist>> {
    return this._searchArtists.apply(this, arguments)
      .map(data => this.validateData(data, 'results.artistmatches.artist', []))
      .map(artists => {
        return artists
          // Remove those with no image
          .filter(artist => this.checkUsableImage(artist))
          .map((artist) => Artist.fromJSON(artist));
      });
  }


  // End Artist

  // Charts

  // Docs: http://www.last.fm/api/show/chart.getTopArtists
  _getTopArtists(options: any = {}): Observable<Array<any>> {
    let settings = {
      method: 'chart.gettopartists'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  getTopArtists(options: any = {}): Observable<Array<Artist>> {
    return this._getTopArtists.apply(this, arguments)
      .map(data => this.validateData(data, 'artists.artist'))
      .map(artists => {
        return artists
          .map((artist) => Artist.fromJSON(artist));
      });
  }


  // Docs: http://www.last.fm/api/show/chart.getTopTags
  _getChartsTopTags(options: any = {}): Observable<Array<any>> {
    let settings = {
      method: 'chart.gettoptags'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  getChartsTopTags(options: any = {}): Observable<Array<any>> {
    return this._getChartsTopTags.apply(this, arguments)
      .map(data => this.validateData(data, 'tags.tag'));
  }


  // Docs: http://www.last.fm/api/show/chart.getTopTrack
  _getChartsTopTracks(options: any = {}): Observable<Array<any>> {
    let settings = {
      method: 'chart.gettoptracks'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  getChartsTopTracks(options: any = {}): Observable<Array<any>> {
    return this._getChartsTopTracks.apply(this, arguments)
      .map(data => this.validateData(data, 'tracks.track'));
  }

  // End Charts

  // Geo

  // Docs: http://www.last.fm/api/show/chart.getTopArtists
  _getTopGeoArtists(country: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      country: country,
      method: 'geo.gettopartists'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  getTopGeoArtists(country: string, options: any = {}): Observable<Array<Artist>> {
    return this._getTopGeoArtists.apply(this, arguments)
      .map(data => this.validateData(data, 'topartists.artist'))
      .map(artists => {
        return artists
          .map((artist) => Artist.fromJSON(artist));
      });
  }


  // Docs: http://www.last.fm/api/show/geo.getTopTracks
  _getTopGeoTracks(country: string, options: any = {}): Observable<Array<any>> {
    let settings = {
      country: country,
      method: 'geo.gettoptracks'
      // limit: 10,
      // page: 1,
      // location: 'Manchester
    };
    return this._http(settings, options);
  }
  getTopGeoTracks(country: string, options: any = {}): Observable<Array<any>> {
    return this._getTopGeoTracks.apply(this, arguments)
      .map(data => this.validateData(data, 'tracks.track'));
  }

  // End Geo

  // Track

  // Docs: http://www.last.fm/api/show/track.getInfo
  _getTrackInfo(artistOrMbid: string, track: string = '', options: LastFMOptions = {}): Observable<any> {
    let settings = {
      artist: artistOrMbid,
      track: track,
      method: 'track.getInfo'
      // mbid: mbid,
      // autocorrect: 1
    };
    return this._http(settings, options);
  }
  getTrackInfo(artistOrMbid: string, track: string = '', options: LastFMOptions = {}): Observable<any> {
    return this._getTrackInfo.apply(this, arguments)
      .map(data => this.validateData(data, 'track', {}));
  }


  // Docs: http://www.last.fm/api/show/track.getSimilar
  _getSimilarTrack(artistOrMbid: string, track: string = '', options: LastFMOptions = {}): Observable<Array<any>> {
    let settings = {
      artist: artistOrMbid,
      track: track,
      method: 'track.getsimilar'
      // mbid: mbid,
      // autocorrect: 1,
      // limit: 10
    };
    return this._http(settings, options);
  }
  getSimilarTrack(artistOrMbid: string, track: string = '', options: LastFMOptions = {}): Observable<Array<any>> {
    return this._getSimilarTrack.apply(this, arguments)
      .map(data => this.validateData(data, 'similartracks.track'));
  }


  // Docs: http://www.last.fm/api/show/track.getTopTags
  _getTrackTopTags(artistOrMbid: string, track: string = '', options: LastFMOptions = {}): Observable<Array<any>> {
    let settings = {
      artist: artistOrMbid,
      track: track,
      method: 'track.gettoptags'
      // mbid: mbid,
      // autocorrect: 1,
      // limit: 10
    };
    return this._http(settings, options);
  }
  getTrackTopTags(artistOrMbid: string, track: string = '', options: LastFMOptions = {}): Observable<Array<any>> {
    return this._getTrackTopTags.apply(this, arguments)
      .map(data => this.validateData(data, 'toptags.tag'));
  }


  // Docs: http://www.last.fm/api/show/track.search
  _searchTrack(track: string = '', options: LastFMOptions = {}): Observable<Array<any>> {
    let settings = {
      track: track,
      method: 'track.search'
      // limit: 10,
      // page: 1
    };
    return this._http(settings, options);
  }
  searchTrack(track: string = '', options: LastFMOptions = {}): Observable<Array<any>> {
    return this._searchTrack.apply(this, arguments)
      .map(data => this.validateData(data, 'results.trackmatches.track'));
  }

  // End Track

}
