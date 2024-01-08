export class Photo {
  imageId: number;
  photoUrl: string;
  data: Blob;

  constructor(imageId: number, url: string, blob: Blob) {
    this.imageId = imageId;
    this.photoUrl = url;
    this.data = blob;
  }
}
