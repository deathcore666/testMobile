import { Component, OnInit, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationsService } from '../../services/notifications.service';

import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

declare const THREE;
declare const bws;

@Component({
  selector: 'app-face-recognition',
  templateUrl: './face-recognition.page.html',
  styleUrls: ['./face-recognition.page.scss'],
})
export class FaceRecognitionPage implements OnInit, OnDestroy {
  @ViewChild('uuihead') headElement;
  @ViewChild('uuicanvas') canvasElement;
  private subs: Subscription[] = [];

  public bwsCapture: any;

  public token: string;
  public returnURL: string;
  public traits: any;
  public confirmPurchaseToken: string;

  // Optional params for enroll
  public state: string; // from url params
  public autostart = true; // from url params
  public trait: string; // from url params // backward compatibility (typically overwritten by $claims->traits)
  public task: string; // verification | identification | enrollment | livenessdetection
  public autoenroll = false;
  public maxHeight = 480;
  public maxtries = 15;
  public recordings = 3;
  public challenge = false;
  public challenges = [];
  public challengeResponse: boolean;

  // Displaying head
  public camera: any;
  public scene: any;
  public renderer: any;
  public startTime: any;
  public resetHead = false;
  public maxVertical = 0.25;
  public maxHorizontal = 0.25;

  // counter for current execution
  public currentExecution = 0;
  public currentTag = '';
  public parentTag = '';

  // enrollment without challenge response
  public enrollmentTags = ['left', 'right', 'right', 'left', 'up', 'down', 'down', 'up'];
  public predefinedTags = ['left', 'right', 'up', 'down'];

  public localizedData = {
    'titleEnrollment': 'Enrollment',
    'titleVerification': 'Verification',
    'titleIdentification': 'Identification',
    'titleLiveDetection':  'Liveness Detection',

    'buttonCancel.title': 'Abort and navigate back to caller',
    'buttonStart.title': 'Start the recording of images',
    'buttonContinue.title': 'Skip biometric process',
    'buttonContinue': 'Skip biometrics',
    'buttonMobileApp.title': 'Continue biometric process with BioID app',
    'buttonMobileApp': 'Start BioID app',

    'prompt': 'This web page requires the HTML5 Media Capture and Streams API (getUserMedia(), '
    + 'as supported by the actual versions of Opera, Firefox, Chrome and Edge). '
    + 'You also have to grant access to your camera.',
    'mobileapp': 'If you have installed the BioID App on your mobile device, you can use this app for enrollment or verification.',

    'uploadInfo': 'Uploading...',

    'capture-error': 'The user might have denied access to a camera.'
    + 'Please note, without access to a camera, biometric face/periocular recognition is not possible!',
    'nogetUserMedia': 'Your browser does not support the HTML5 Media Capture and Streams API. '
    + 'You might want to use the BioID mobile App instead.',
    'permissionDenied': 'Permission Denied!',

    'UserInstruction-3': '3 ...',
    'UserInstruction-2': '2 ...',
    'UserInstruction-1': '1 ...',
    'UserInstruction-FollowMe': 'Follow Me',
    'UserInstruction-NoMovement': 'Please move your head...',

    'Perform-enrollment': 'Training ...',
    'Perform-verification': 'Verifying ...',
    'Perform-identification': 'Identifying ...',
    'Perform-livenessdetection':  'Processing ...',

    'NoFaceFound': 'No face found',
    'MultipleFacesFound': 'Upload failed: multiple faces were found',
    'LiveDetectionFailed': 'Live detection failed. Retrying ...',
    'ChallengeResponseFailed': 'Challenge-Response failed!. Follow the head ...',
    'NotRecognized': 'You have not been recognized!. Retrying ...'
  };
  public uuititle: string;
  public uuierror: string;
  public uuiinstruction: string;
  public uuimessage: string;

  // Show/hide element
  public uuiinstructionHide = true;
  public uuisplashHide = true;
  public uuiwebappHide = true;
  public uuimessageHide = true;
  public uuiheadHide = true;
  public uuicanvasHide = true;

  public uuiuploadedHide = [
    { hide: true, src: '' },
    { hide: true, src: '' },
    { hide: true, src: '' },
    { hide: true, src: '' },
  ];
  public uuiuploadHide = [
    { hide: true },
    { hide: true },
    { hide: true },
    { hide: true },
  ];
  public uuiwaitHide = [
    { hide: true },
    { hide: true },
    { hide: true },
    { hide: true },
  ];
  public uuiimageHide = [
    { hide: true },
    { hide: true },
    { hide: true },
    { hide: true },
  ];

  constructor(
    private router: Router,
    private activetedRoute: ActivatedRoute,
    private notifications: NotificationsService,
  ) {
    const subRoute = this.activetedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token'); 
      this.task = params.get('task'); 
      this.returnURL = params.get('url'); 
      this.traits = params.get('traits'); 
      this.confirmPurchaseToken = params.get('confirmPurchaseToken'); 
    });
    this.subs.push(subRoute);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onHeadResize();
  }

  ngOnInit() {
    if (this.traits) {
      if (this.traits === 1) {
        this.trait = 'Face';
      } else if (this.traits === 2) {
        this.trait = 'Periocular';
      } else if (this.traits === 3) {
        this.trait = 'Face,Periocular';
      }
    }

    this.challengeResponse = this.challenge ? true : false;

    // START
    this.initialize();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }
  public async initialize() {

    /** For title */
    if (this.task === 'enrollment') {
      this.uuititle = 'titleEnrollment';
    } else if (this.task === 'identification') {
      this.uuititle = 'titleIdentification';
    } else if (this.task === 'livenessdetection') {
      this.uuititle = 'titleLiveDetection';
    }
  }

  /* ------------------ Start BWS capture jQuery plugin -----------------------------------*/

  // startup code
  public onStart() {
    this.bwsCapture.start(() => {
      this.uuicanvasHide = false;
      this.captureStarted();
    }, async (error) => {
      // show button for BioID app (interapp communication)
      if (error !== undefined) {
        // different browsers use different errors
        if (error.code === 1 || error.name === 'PermissionDeniedError') {
          // in the spec we find code == 1 and name == PermissionDeniedError for the permission denied error
          await this.notifications.showNotification('Permission denied!', 'error');
        } else {
          // otherwise try to print the error
          await this.notifications.showNotification(this.localizedData['capture-error'], 'error');
        }
      } else {
        // no error info typically says that browser doesn't support getUserMedia
        await this.notifications.showNotification(this.localizedData['nogetUserMedia'], 'error');
      }
    }, async (error, retry) => {
      // done
      this.stopRecording();
      this.currentExecution++;

      if (error !== undefined && retry && this.currentExecution < this.maxtries) {
        // if failed restart if retries are left, but wait a bit until the user has read the error message!
        setTimeout(() => { this.startRecording(true); }, 1800);
      } else {

        // done: redirect to caller ...
        if (this.task === 'enrollment') {
          this.router.navigate(['/confirm-face-recognition', {
            token: this.token,
            state: this.state,
            error: error !== undefined || this.currentExecution > this.maxtries ? true : false
          }]);
        }
        if (this.task === 'verification') {
          this.router.navigate(['/verify-by-face-recognition', {
            token: this.token,
            state: this.state,
            error: error !== undefined || this.currentExecution > this.maxtries ? true : false,
            confirmPurchaseToken: this.confirmPurchaseToken && this.confirmPurchaseToken.length !== 0 ? this.confirmPurchaseToken : null
          }]);
        }
      }
    }, async (status, message, dataURL) => {
      const uiCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('uuicanvas');

      if (status === 'DisplayTag') {
        this.setCurrentTag(message);
        this.uuiinstruction = this.localizedData['UserInstruction-FollowMe'];
      } else {
        // user instructions
        if (status.indexOf('UserInstruction') > -1) {
          if (status === 'UserInstruction-Start') {
            let counter = this.recordings;
            if (counter > 4) {
              counter = 4;
            }
            for (let i = 0; i < counter; i++) {
              this.uuiuploadedHide[i].hide = true;
              this.uuiuploadHide[i].hide = true;
              this.uuiwaitHide[i].hide = false;
              this.uuiimageHide[i].hide = false;
            }
            this.resetHeadDisplay();
          } else {
            this.uuiinstruction = this.localizedData[status];
          }
        }

        // perform tasks
        if (status.indexOf('Perform') > -1 || status.indexOf('Retry') > -1) {
          // hide head and userinstruction
          this.hideHead();
          this.uuiinstructionHide = true;

          uiCanvas.style.filter = 'blur(10px)';

          // show message
          await this.notifications.showNotification(this.localizedData[status], 'success');
        }

        // results of uploading or perform task
        if (status.indexOf('Failed') > -1 ||
          status.indexOf('NotRecognized') > -1 ||
          status.indexOf('NoFaceFound') > -1 ||
          status.indexOf('MultiFacesFound') > - 1) {

          // hide head and userinstruction
          this.hideHead();
          this.uuiinstructionHide = true;

          uiCanvas.style.filter = 'blur(10px)';

          // show message
          await this.notifications.showNotification(this.localizedData[status], 'error');

          setTimeout(() => {
            uiCanvas.style.filter = '';
          }, 1900);
        }

        // display some animations/images depending on the status
        const uploaded = this.bwsCapture.getUploaded();
        let recording = uploaded + this.bwsCapture.getUploading();
        // use modulo calculation for images more than 4
        let modRecording = ((recording - 1) % 4) + 1;
        const modUploaded = ((uploaded - 1) % 4) + 1;

        if (status === 'Uploading') {
          // begin an upload - current image
          this.uuiwaitHide[modRecording].hide = true;
          this.uuiuploadHide[modRecording].hide = false;
          this.uuiuploadedHide[modRecording].hide = true;
        } else if (status === 'Uploaded') {
          // successfull upload (we should have a dataURL)
          if (dataURL) {
            this.uuiuploadHide[modUploaded].hide = true;
            this.uuiuploadedHide[modUploaded].src = dataURL;
            this.uuiuploadedHide[modUploaded].hide = false;
          }
        } else if (status === 'NoFaceFound' || status === 'MultipleFacesFound') {
          // upload failed
          recording++;
          modRecording = ((recording - 1) % 4) + 1;
          this.uuiuploadHide[modRecording].hide = true;
          this.uuiwaitHide[modRecording].hide = false;
        }
      }
    });
}

  // called from Start button and onStart to initiate a new recording
  public startRecording(countdown) {
    const tags = this.challengeResponse && this.challenges.length > this.currentExecution
    && this.challenges[this.currentExecution].length > 0 ? this.challenges[this.currentExecution] : [];

    this.bwsCapture.startRecording(tags, countdown);
  }

  public stopRecording() {
    this.uuiinstructionHide = true;
    this.hideHead();

    this.bwsCapture.stopRecording();
    for (let i = 0; i < 4; i++) {
      this.uuiimageHide[i].hide = true;
    }
  }

  // called by onStart to update GUI
  public captureStarted() {
    this.uuisplashHide = true;
    this.uuiwebappHide = false;
    this.uuimessageHide = false;
    this.uuiinstructionHide = false;

    if (this.autostart) {
      setTimeout(() => { this.startRecording(true); }, 1000);
    }
  }

  public initHead() {
    const container = document.getElementById('uuihead');
    document.body.appendChild(container);

    const width = this.headElement.nativeElement.offsetWidth;
    const height = this.headElement.nativeElement.offsetHeight;

    const elem = document.getElementById('uuiwebapp');
    elem.appendChild(container);

    // camera
    this.camera = new THREE.PerspectiveCamera(20, width / height, 1, 1000);
    this.camera.position.set(0, 0, 5);

    // scene
    this.scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0x4953FF, 0.4);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x3067FF, 0.8);
    this.camera.add(pointLight);
    this.scene.add(this.camera);

    // texture
    const manager = new THREE.LoadingManager();

    // model
    const onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
      }
    };
    const onError = function (xhr) { console.log('Error with get head model'); };
    const loader = new THREE.OBJLoader(manager);
    const material = new THREE.MeshLambertMaterial({ transparent: false, opacity: 0.6 });

    loader.load('./assets/model/head.obj', (head) => {
      head.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          //   child.material = material;
        }
      });
      head.name = 'BioIDHead';
      head.position.y = 0;
      this.scene.add(head);
    }, onProgress, onError);

    // renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0); // the default
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    container.appendChild(this.renderer.domElement);
  }

  public onHeadResize() {
    let width = 0;
    let height = 0;
    const canvasWidth = this.canvasElement.nativeElement.offsetWidth;
    const canvasHeight = this.canvasElement.nativeElement.offsetHeight;

    if (canvasWidth > canvasHeight) {
      height = canvasHeight - canvasHeight / 3;
      width = height * 3 / 4;
    } else {
      width = canvasWidth - canvasWidth / 3;
      height = width * 4 / 3;
    }

    // Avoid floating for canvas size (performance issue)
    width = Math.floor(width);
    height = Math.floor(height);

    document.getElementById('uuihead').style.marginTop = `${Math.floor(-height / 2)}px`;
    document.getElementById('uuihead').style.marginLeft = `${Math.floor(-width / 2)}px`;
    document.getElementById('uuihead').style.width = `${width}`;
    document.getElementById('uuihead').style.height = `${height}`;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);
  }

  public showHead() {
    this.onHeadResize();
    this.uuiheadHide = false;
  }

  public hideHead() {
    this.uuiheadHide = true;
  }

  public resetHeadDisplay() {
    this.currentTag = '';
    this.parentTag = '';
    this.resetHead = true;
  }

  public animateHead() {
    // animation time
    const speed = 0.000005;
    const endTime = new Date().getTime();
    const deltaTime = (endTime - this.startTime);
    const delta = deltaTime * speed;

    const head = this.scene.getObjectByName('BioIDHead');
    let doAnimation = false;

    if (head) {
      if (this.resetHead) {
        // reset head rotation to center
        head.rotation.x = 0;
        head.rotation.y = 0;
        this.resetHead = false;
        doAnimation = true;
        this.showHead();
      } else {
        if (this.currentTag === 'any') {
          if (this.task === 'enrollment') {
            // get predefined direction for better enrollment
            const recording = this.bwsCapture.getUploaded() + this.bwsCapture.getUploading() - 1;
            this.currentTag = this.enrollmentTags[recording];
          } else {
            this.currentTag = this.predefinedTags[Math.floor(Math.random() * Math.floor(4))];
          }
        }

        if (this.currentTag === 'down') {
          head.rotation.y = 0;
          if (this.parentTag === 'up') {
            if (head.rotation.x <= 0) {
              head.rotation.x += delta;
              doAnimation = true;
            }
          } else {
            if (head.rotation.x >= 0 && head.rotation.x < this.maxVertical) {
              head.rotation.x += delta;
              doAnimation = true;
            }
          }
        } else if (this.currentTag === 'up') {
          head.rotation.y = 0;
          if (this.parentTag === 'down') {
            if (head.rotation.x >= 0) {
              head.rotation.x -= delta;
              doAnimation = true;
            }
          } else {
            if (head.rotation.x >= -this.maxVertical && head.rotation.x <= 0) {
              head.rotation.x -= delta;
              doAnimation = true;
            }
          }
        } else if (this.currentTag === 'left') {
          head.rotation.x = 0;
          if (this.parentTag === 'right') {
            if (head.rotation.y >= 0) {
              head.rotation.y -= delta;
              doAnimation = true;
            }
          } else {
            if (head.rotation.y >= -this.maxHorizontal && head.rotation.y <= 0) {
              head.rotation.y -= delta;
              doAnimation = true;
            }
          }
        } else if (this.currentTag === 'right') {
          head.rotation.x = 0;
          if (this.parentTag === 'left') {
            if (head.rotation.y <= 0) {
              head.rotation.y += delta;
              doAnimation = true;
            }
          } else {
            if (head.rotation.y >= 0 && head.rotation.y <= this.maxHorizontal) {
              head.rotation.y += delta;
              doAnimation = true;
            }
          }
        }
      }

      if (doAnimation) {
        requestAnimationFrame(this.animateHead.bind(this));
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  public setCurrentTag(tag) {
    if (this.currentTag !== '') {
      this.parentTag = this.currentTag;
    }
    this.currentTag = tag;
    this.startTime = new Date().getTime();

    this.animateHead();
  }

  public async stopRecognition() {
    this.bwsCapture.stop();
    // this.navCtrl.remove(this.navCtrl.getActive().index);
    if (this.task === 'enrollment') {
      this.router.navigate(['/confirm-face-recognition', {
        token: this.token,
        state: this.state,
        error: true
      }]);
    }
    if (this.task === 'verification') {
      this.router.navigate(['/verify-by-face-recognition', {
        token: this.token,
        state: this.state,
        error: true
      }]);
    }
  }

}
