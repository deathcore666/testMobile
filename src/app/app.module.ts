import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { Device } from '@ionic-native/device/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { RouterModule } from '@angular/router';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';

import { IonicGestureConfig } from './services/hammer.service';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

import { SharedModule } from './shared/shared.module';
import { SearchbarModalComponent } from './shared/searchbar-modal/searchbar-modal.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { InterceptorService } from './services/interceptor.service';

@NgModule({
  declarations: [AppComponent, SearchbarModalComponent],
  entryComponents: [SearchbarModalComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    RouterModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeStorage,
    FingerprintAIO,
    Device,
    BarcodeScanner,
    Clipboard,
    TitleCasePipe,
    File,
    FileChooser,
    Camera,
    Vibration,
    Deeplinks,
    NFC,
    Ndef,
    ImagePicker,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
