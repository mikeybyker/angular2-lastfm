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
