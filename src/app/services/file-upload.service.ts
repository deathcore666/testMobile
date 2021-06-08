import { Injectable } from '@angular/core';
import { File as IonicFileService, FileEntry, IFile } from '@ionic-native/file/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Platform } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';

@Injectable({
  providedIn: 'root'
})

export class FileUploaderService {
  public files: any;

  constructor(
    private ionicFileService: IonicFileService,
    private fileChooser: FileChooser,
    private camera: Camera,
    private platform: Platform,
    private imagePicker: ImagePicker
  ) {}

  public async uploadFromImagePicker(): Promise<any[]> {
    try {
      if (this.platform.is('android')) {
        let imagePaths: string[];
        await this.fileChooser.open().then(async (res) => {
          imagePaths = [res];
          const imageFiles = await this.getMultipleFiles(imagePaths);
          return this.setFiles(imageFiles);
        }).catch(() => {
          return this.setFiles([]);
        });
      } else if (this.platform.is('ios')) {
        await this.imagePicker.requestReadPermission().then(async () => {
          await this.imagePicker.getPictures({maximumImagesCount: 4}).then(async (results: string[]) => {
            const imagePaths: string[] = [];

            results.forEach((result: string) => {
              result = 'file://' + result;
              imagePaths.push(result);
            });
            const imageFiles = await this.getMultipleFiles(imagePaths);
            return this.setFiles(imageFiles);
          });
        });
      }
      } catch (thrown) {
        return thrown;
      }
  }

  public async takePhoto(): Promise<any[]> {
    try {
      let imagePaths: string[];
      const options: CameraOptions = {
        quality: 100,
        cameraDirection: this.camera.Direction.FRONT = 0,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      };

      await this.camera.getPicture(options).then(async (imageData) => {
        if (imageData) {
          imagePaths = [imageData];
          const imageFiles = await this.getMultipleFiles(imagePaths);
          return this.setFiles(imageFiles);
        }
      }).catch(() => {
        return this.setFiles([]);
      });
    } catch (thrown) {
      return thrown;
    }
  }

  private async getMultipleFiles(filePaths: string[]): Promise<File[]> {
    const fileEntryPromises: Promise<FileEntry>[] = filePaths.map(filePath => {
      return this.ionicFileService.resolveLocalFilesystemUrl(filePath);
    }) as Promise<FileEntry>[];

    const fileEntries: FileEntry[] = await Promise.all(fileEntryPromises);
    const CordovaFilePromises: Promise<IFile>[] = fileEntries.map(fileEntry => {
      return this.convertFileEntryToCordovaFile(fileEntry);
    });

    const cordovaFiles: IFile[] = await Promise.all(CordovaFilePromises);

    const filePromises: Promise<File>[] = cordovaFiles.map(cordovaFile => {
      return this.convertCordovaFileToJavascriptFile(cordovaFile);
    });

    return await Promise.all(filePromises);
  }

  public setFiles(files) {
    return this.files = files;
  }

  public getFiles() {
    return this.files;
  }

  private convertFileEntryToCordovaFile(fileEntry: FileEntry): Promise<IFile> {
    return new Promise<IFile>((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
  }

  private convertCordovaFileToJavascriptFile(cordovaFile: IFile): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.error) {
          reject(reader.error);
        } else {
          const blob: any = new Blob([reader.result], { type: cordovaFile.type });
          blob.lastModifiedDate = new Date();
          blob.name = cordovaFile.name;
          resolve(blob as File);
        }
      };
      reader.readAsArrayBuffer(cordovaFile);
    });
  }
}
