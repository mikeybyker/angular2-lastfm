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
