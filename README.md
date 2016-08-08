# Angular2 LastFM

An [Angular2](https://angular.io/) LastFm API service. The services covered are those not requiring authentication. A [Last.FM](http://www.last.fm/api) API Key is required.

### Usage

Import and include LastFM as a provider, and add your API key as a seperate LastFMConfig provider.

```javascript
import {LastFM}    from './lastfm/lastfm.service';

@Component({
    selector: 'your-app',
    providers:[LastFM, provide('LastFMConfig', {
        useValue: {
            api_key: 'YOUR_API_KEY'
        }
    })],
    template: ` <h1>etc.</h1>`
    // ...
})

```

Inject into your constructor...
```javascript
constructor(private _lastFM: LastFM) {}
```

Each call will return an Observable you can subscribe to.

```javascript
// e.g.
this._lastFM.Artist.search('The Cure')
    .subscribe(artists => {
        // do something with an array of artists...
    });

// or use an aysnc pipe in the template and let it subscribe for you
this.results = this._lastFM.Artist.search('The Cure');

```

Send in an object to set any options - see [Last.FM](http://www.last.fm/api) for options available for each call.

```javascript
// e.g.
this._lastFM.Artist.getSimilar('The Cure', {limit: 10})
    .subscribe(artists => {
        // do something with an array of (upto) 10 artists...
    });
```


### MusicBrainz Identifier

If a [MusicBrainz Identifier](https://musicbrainz.org/doc/MusicBrainz_Identifier) (mbid) is accepted by a method, the other parameters are not required. An mbid always takes precedence over other parameters.

```javascript
// e.g.
this._lastFM.Track.getSimilar('The Cure', 'Faith')
    .subscribe(tracks => {
        // do something with an array of tracks...
    });

// Or using mbid...
this._lastFM.Track.getSimilar('e7da35ed-ad25-4721-a3b2-43784fa4f856')
    .subscribe(tracks => {
        // do something with an array of tracks...
    });
```

### Full Response Data

The main methods dig out and return the relevant data from the last.fm response. If you require the full response, append an underscore to the method name.

```javascript
// e.g.
this._lastFM.Artist._getTopAlbums('The Cure')
    .subscribe(response => {
        // To get the array of albums,
        // look for...
        console.log(response.data.topalbums.album);
    });
```

### Methods

The following methods are available:

#### Albums
  - LastFM.Album.getInfo(artist or mbid, album, options);
  - LastFM.Album.getTopTags(artist or mbid, album, options);
  - LastFM.Album.search(album, options);

#### Artist
  - LastFM.Artist.getInfo(artist or mbid, options);
  - LastFM.Artist.getSimilar(artist or mbid, options);
  - LastFM.Artist.getTopAlbums(artist or mbid, options);
  - LastFM.Artist.getTopTags(artist or mbid, options);
  - LastFM.Artist.getTopTracks(artist or mbid, options);
  - LastFM.Artist.search(artist, options);

#### Charts
  - LastFM.Charts.getTopArtists(options);
  - LastFM.Charts.getTopTags(options);
  - LastFM.Charts.getTopTracks(options);

#### Geo
  - LastFM.Geo.getTopArtists(country, options);
  - LastFM.Geo.getTopTracks(country, options);

#### Track
  - LastFM.Track.getInfo(artist or mbid, track, options);
  - LastFM.Track.getSimilar(artist or mbid, track, options);
  - LastFM.Track.getTopTags(artist or mbid, track, options);
  - LastFM.Track.search(track, options);


### Example
There is an API explorer in the examples folder - to view the output from each call to last.fm.
Add your api key and run on a local server.


### Note
For no great reason, the dist folder contains the compiled js (plus .map), and a minified version. You can recreate this output by running
```javascript
npm start
```
But really, you'll be wanting to use the typescript file in the src folder.

### Version
0.9.0

Mike