﻿/*! BioID Web Service - 2018-04-07
*   image capture and recognition library - v2.0.0
*   https://www.bioid.com
*   Copyright (C) BioID GmbH.
*/


(function (bws, $, undefined) {
    // execute javascript in 'strict mode'
    'use strict';

    // init image capture and recognition library
    bws.initcapture = function (canvasElement, issuedToken, options) {
        var defaults = {
            apiurl: 'https://bws.bioid.com/extension/',
            task: 'verification', // | identification | enrollment | livenessdetection
            trait: 'FACE',
            maxheight: 480,
            recordings: 3,
            maxupload: 20,
            challengeResponse: false,
            motionareaheight: 160,
            threshold: 25,
            mirror: true   
        };

        // apply options to our default settings
        var settings = $.extend({}, defaults, options);
        // for backward compatibility apply host if it has been set 
        if (typeof settings.host !== 'undefined') { settings.apiurl = 'https://' + settings.host + '/extension/'; }

        // the canvas to draw the image and overlays
        var canvas = canvasElement;
        if (!canvas) { // we can't do anything without a canvas
            alert('Please provide a valid canvas element to initialize the BWS capture module!');
        }

        // the issued token
        var token = issuedToken;

        // private helper elements
        var video = document.createElement('video');
        // required for iOS 11 Safari
        video.setAttribute('playsinline', '');
        var copycanvas = document.createElement('canvas');
        var motioncanvas = document.createElement('canvas');

        // template for motion detection
        var template = null;

        // we need to put some additional things into our closure
        var videoStream;
        var processInterval; 

        // timer for 'No Motion' and 'No Activity'
        var noMotionTimer;
        var noActivityTimer;

        // possible status values: 
        //  UserInstruction-Start, UserInstruction-1, UserInstruction-2, UserInstruction-3, UserInstruction-NoMovement, 
        //  Uploading, Uploaded, DisplayTag, Perform-verification, Perform-identification, Perform-enrollment, Perform-livenessdetection,
        //  NoFaceFound, MultipleFacesFound, LiveDetectionFailed, ChallengeResponseFailed, NotRecognized, NoTemplateAvailable
        var statusCallback; // arguments: status { message | tag } { dataURL }
        var doneCallback; // arguments: error

        var uploaded = 0, uploading = 0, captured = 0, capturing = false;
        var tag = 'any'; // any, up, down, left, right
        var tags = [];

        /* ----------------------- Public function for capturing ------------------------- */

        // public method to start capturing. The functions
        // onSuccess(), onFailure(error) and onDone(error) must be applied,
        // onStatus(status, message, dataURL) is optional
        var start = function (onSuccess, onFailure, onDone, onStatus) {
            console.log('Starting capture...');
            doneCallback = onDone;          
            statusCallback = onStatus;
           
            if (videoStream) {
                // we have been started already
                return;
            }
            
            var constraints = { audio: false, video: { facingMode: "user" } }; 
            navigator.mediaDevices.getUserMedia(constraints)
            .then(function (mediaStream) {
                console.log('Video capture stream has been created with constraints:', constraints);
                videoStream = mediaStream;
                video.srcObject = mediaStream;
                video.onloadedmetadata = function (e) {
                    video.play();
                    console.log('Playing live media stream');        
                    // init the various canvases ...
                    initializeCanvases();
                    console.log('capture started');
                    onSuccess();
                };
            })
            .catch(function (err) {
                console.log(err)
                console.log('getUserMedia failed with error:', err);
                onFailure(err);
            });
            
        };

        // public method to pause capturing
        var stop = function () {
            console.log('Pausing capture...');
            recording(false);
            video.pause();
            clearInterval(processInterval);
            videoStream = null;
        };

        // public method to mirror the display of the captured image
        var mirror = function () {
            let copy = copycanvas.getContext('2d');
            copy.translate(copycanvas.width, 0);
            copy.scale(-1, 1);
        };

        // public method to start the biometric process
        var startRecording = function (challenges, countdown) {
            recording(false);
            tags = challenges ? challenges : [];
            if (countdown && statusCallback) {
                // use countdown
                statusCallback('UserInstruction-3');
                setTimeout(function () { statusCallback('UserInstruction-2'); }, 400);
                setTimeout(function () { statusCallback('UserInstruction-1'); }, 800);
                setTimeout(initRecording, 1200);
            }
            else {
                initRecording();
            }
        };

        /* ------------------------ Private image capturing functions ------------------ */

        // private method to init the size of the canvases
        function initializeCanvases() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            // we prefer 3 : 4 face image resolution
            let aspectratio = video.videoWidth / video.videoHeight < 3 / 4 ? video.videoWidth / video.videoHeight : 3 / 4;
            copycanvas.height = video.videoHeight > settings.maxheight ? settings.maxheight : video.videoHeight;
            copycanvas.width = copycanvas.height * aspectratio;
            motioncanvas.height = settings.motionareaheight;
            motioncanvas.width = motioncanvas.height * aspectratio;

            // if mirroring required
            if (settings.mirror) { mirror(); }

            // set an interval-timer to grab about 20 frames per second
            processInterval = setInterval(processFrame, 50);
        }

        function initRecording() {
            if (statusCallback) { statusCallback('UserInstruction-Start'); }
            recording(true);
            startActivityTimer();
        }

        // start or stop recording
        function recording(capture) {
            clearInterval(noMotionTimer);
            clearInterval(noActivityTimer);
            uploaded = 0;
            uploading = 0;
            template = null;
            capturing = capture;
        }

        // private worker method for each frame
        function processFrame() {
            let x = 0, y = 0, w = copycanvas.width, h = copycanvas.height, aspectratio = w / h;
            let cutoff = video.videoWidth - (video.videoHeight * aspectratio);
            let draw = canvas.getContext('2d');
            let copy = copycanvas.getContext('2d');

            // we draw the frames manually using the private video element and the copy interim canvas
            copy.drawImage(video, cutoff / 2, 0, video.videoWidth - cutoff, video.videoHeight, 0, 0, copycanvas.width, copycanvas.height);

            // ensure that the canvas does not scale internally
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            // white background
            draw.fillStyle = '';
            draw.fillRect(0, 0, canvas.width, canvas.height);

            // center image in canvas
            if (canvas.width / canvas.height > aspectratio) {
                // center horizontally
                y = 0;
                h = canvas.height;
                w = h * aspectratio;
                x = (canvas.width - w) / 2;
            }
            else {
                // center vertically
                x = 0;
                w = canvas.width;
                h = w / aspectratio;
                y = (canvas.height - h) / 2;
            }

            draw.drawImage(copycanvas, 0, 0, copycanvas.width, copycanvas.height, x, y, w, h);

            // Drawing ellipse liveview
            let scaleX = 0.8;
            let scaleY = 1.1;
            let gradient = draw.createRadialGradient(canvas.width/2 * 1/scaleX, canvas.height/2 * 1/scaleY, 0, canvas.width/2 * 1/scaleX, canvas.height/2 * 1/scaleY, w * 0.5);
            gradient.addColorStop(0.98, 'transparent');
            // gradient.addColorStop(0.99, 'rgba(255, 255, 255, 1)');
            draw.fillStyle = gradient;
            draw.setTransform(scaleX, 0, 0, scaleY, 0, 0);
            draw.fillRect(0, 0, canvas.width * 1 / scaleX, canvas.height * 1 / scaleY);       

            if (capturing && uploaded < settings.recordings) {
                // we may need to switch on the tags again ??????
                //if (settings.challengeResponse && tag === 'any') { setTag(); }

                if (captured > settings.maxupload) {
                    stop();
                    doneCallback('The maximum number of uploads has been reached!');
                }

                // scale current image into the motion canvas
                let motionctx = motioncanvas.getContext('2d');
                motionctx.drawImage(copycanvas, copycanvas.width / 8, copycanvas.height / 8, copycanvas.width - copycanvas.width / 4, copycanvas.height - copycanvas.height / 4, 0, 0, motioncanvas.width, motioncanvas.height);
                let currentImageData = motionctx.getImageData(0, 0, motioncanvas.width, motioncanvas.height);

                let movement = 100;
                if (template) {
                    // calculate motion
                    movement = motionDetection(currentImageData, template);
                }

                // trigger if movement is above threshold (default: when 20% of maximum movement is exceeded)
                if (movement > settings.threshold) {
                    if (uploaded + uploading < settings.recordings) {
                        // in case we are not already bussy with some uploads start upload procedure
                        upload();
                        // current image is the new reference frame - create template
                        template = createTemplate(currentImageData);
                    }
                }
            }
        }

        /* ------------------------ Timer functions ----------------------------------- */

        // we give a NoMovement response every 6 seconds
        function startMotionTimer() {
            clearInterval(noMotionTimer);
            noMotionTimer = setInterval(function () {
                if (uploading + uploaded < settings.recordings) {
                    if (statusCallback) { statusCallback('UserInstruction-NoMovement'); }
                }
            }, 5000);
        }

        // after a given time without activity from the user we abort the process
        function startActivityTimer() {
            clearInterval(noActivityTimer);
            noActivityTimer = setInterval(function () {
                if (uploading === 0) {
                    stop();
                    doneCallback('Activity time is over!');
                }
                else {
                    startActivityTimer();
                }
            }, 30000);
        }

        /* ------------------------ BWS Web Api calls --------------------------------- */

        // uploads an image to the BWS
        function upload() {
            startMotionTimer();

            // start upload procedure, but only if we still have to
            if (capturing && uploaded + uploading < settings.recordings) {
                captured++;
                uploading++;
                let dataURL = copycanvas.toDataURL();
                console.log('sizeof dataURL', dataURL.length);

                if (statusCallback) {
                    statusCallback('Uploading');
                }

                if (!$.support.cors) {
                    // the call below typically requires Cross-Origin Resource Sharing!
                    console.log('this browser does not support cors, e.g. IE8 or 9');
                }

                console.log(settings.apiurl + 'upload?tag=' + tag + '&index=' + captured + '&trait=' + settings.trait);
                
                let jqxhr = $.ajax({
                    type: 'POST',
                    url: settings.apiurl + 'upload?tag=' + tag + '&index=' + captured + '&trait=' + settings.trait,
                    data: dataURL,
                    // don't forget the authentication header
                    headers: { 'Authorization': 'Bearer ' + token }
                }).done(function (data, textStatus, jqXHR) {
                    uploading--;
                    if (data.Accepted) {
                        uploaded++;
                        console.log('upload succeeded', data.Warnings);
                        if (statusCallback) { statusCallback('Uploaded', data.Warnings.toString(), dataURL); }
                    } else {
                        console.log('upload error', data.Error);
                        if (statusCallback) { statusCallback(data.Error); }
                        if (uploaded < 1) {
                            // restart process (retry)
                            // TODO: hmmm, really?
                            doneCallback('NoFaceFound', true);
                        }
                        else {
                            // use performTask to cleanup already uploaded image
                            // TODO: this is a dummy call!
                            performTask();
                        }
                    }
                    if (uploaded >= settings.recordings && uploading === 0) {
                        // go for biometric task
                        performTask();
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    // ups, call failed, typically due to
                    // Unauthorized (invalid token) or
                    // BadRequest (Invalid or unsupported sample format) or
                    // InternalServerError (An exception occured)
                    console.log('upload failed', textStatus, errorThrown, jqXHR.responseText);
                    stop();
                    // redirect to caller with error response..
                    doneCallback(errorThrown);
                });
                // show a new tag if neccessary
                if (uploaded < settings.recordings-1) {
                    setTag();
                }
            }
        }

        // perform biometric task enrollment, verification or identification with already uploaded images
        function performTask() {
            // we already have all images the motion timer is no longer required
            clearInterval(noMotionTimer);

            // check which task should be executed and set right url extension
            let url = settings.apiurl;
            if (settings.task === 'enrollment') { url += 'enroll'; }
            else if (settings.task === 'identification') { url += 'identify'; }
            else if (settings.task === 'livenessdetection') { url += 'livenessdetection'; }
            else { url += 'verify'; }

            if (statusCallback) { statusCallback('Perform-' + settings.task); }

            // perform the call
            let jqxhr = $.ajax({
                type: 'GET',
                url: url,
                headers: { 'Authorization': 'Bearer ' + token }
            }).done(function (data, textStatus, jqXHR) {
                if (data.Success) {
                    console.log('task succeeded');
                    stop();
                    doneCallback();
                } else {
                    console.log('task failed', data.Error);
                    let err = data.Error ? data.Error : 'NotRecognized';
                    if (statusCallback) { statusCallback(err); }
                    recording(false); // stop() -> in case of NoTemplateAvailable or no re-tries any more!?
                    doneCallback(err, err !== 'NoTemplateAvailable');
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                // ups, call failed, typically due to
                // Unauthorized (invalid token) or
                // BadRequest (Invalid package) or
                // InternalServerError (An exception occured)
                console.log('task failed', textStatus, errorThrown, jqXHR.responseText);
                stop();
                // redirect to caller with error response..
                doneCallback(errorThrown);
            });
        }

        /* ------------------------ Set challenge response tag ------------------------- */

        // generate a new challenge response tag or resets it to 'any'
        function setTag() {
            if (settings.challengeResponse) {
                let currentRecording = uploaded + uploading;
                if (currentRecording > 0 && currentRecording < settings.recordings) {
                    if (tags.length >= currentRecording) {
                        // use the preset (typically via the BWS access token) tags!
                        tag = tags[currentRecording - 1];
                    }
                    else {
                        let newtag = tag;
                        if (currentRecording % 2 === 1) {
                            // create a random tag
                            let r = Math.random();
                            if (currentRecording === 1) {
                                if (r < 0.25) { newtag = 'up'; }
                                else if (r < 0.5) { newtag = 'down'; }
                                else if (r < 0.75) { newtag = 'left'; }
                                else { newtag = 'right'; }
                            }
                            else {
                                // create a tag in a direction different to the last movement axis 
                                if (tag === 'up' || tag === 'down') {
                                    if (r < 0.5) { newtag = 'left'; }
                                    else { newtag = 'right'; }
                                }
                                else {
                                    if (r < 0.5) { newtag = 'up'; }
                                    else { newtag = 'down'; }
                                }
                            }
                        }
                        else {
                            // create a tag in the opposite direction of the last tag
                            switch (tag) {
                                case 'left':
                                    newtag = 'right';
                                    break;
                                case 'right':
                                    newtag = 'left';
                                    break;
                                case 'up':
                                    newtag = 'down';
                                    break;
                                case 'down':
                                    newtag = 'up';
                                    break;
                                default:
                                    break;
                            }
                        }
                        console.log('Switched tag for recording #' + currentRecording + ' from ' + tag + ' to ' + newtag);
                        tag = newtag;
                    }
                }
                else { tag = 'any'; }
            }

            if (statusCallback) { statusCallback('DisplayTag', tag); }
            
            if (capturing) {
                // give user some time to react!
                capturing = false;
                setTimeout(function () { if (template !== null) capturing = true; }, 1000);
            }        
        }

        /* ------------------------ Motion Detection functions ------------------------ */

        // template for cross-correlation
        function createTemplate(imageData) {
            // cut out the template
            // we use a small width, quarter-size image around the center as template
            var template = {
                centerX: imageData.width / 2,
                centerY: imageData.height / 2,
                width: imageData.width / 4,
                height: imageData.height / 4 + imageData.height / 8
            };

            template.xPos = template.centerX - template.width / 2;
            template.yPos = template.centerY - template.height / 2;
            template.buffer = new Uint8ClampedArray(template.width * template.height);

            let counter = 0;
            let p = imageData.data;
            for (let y = template.yPos; y < template.yPos + template.height; y++) {
                // we use only the green plane here 
                let bufferIndex = (y * imageData.width * 4) + template.xPos * 4 + 1;
                for (let x = template.xPos; x < template.xPos + template.width; x++) {
                    let templatepixel = p[bufferIndex];
                    template.buffer[counter++] = templatepixel;
                    // we use only the green plane here 
                    bufferIndex += 4;
                }
            }
            console.log('Created new cross-correlation template', template);
            return template;
        }

        // motion detection by a normalized cross-correlation
        function motionDetection(imageData, template) {
            // this is the major computing step: Perform a normalized cross-correlation between the template of the first image and each incoming image
            // this algorithm is basically called "Template Matching" - we use the normalized cross correlation to be independent of lighting changes
            // we calculate the correlation of template and image over the whole image area
            let bestHitX = 0,
                bestHitY = 0,
                maxCorr = 0,
                searchWidth = imageData.width / 4,
                searchHeight = imageData.height / 4,
                p = imageData.data;

            for (let y = template.centerY - searchHeight; y <= template.centerY + searchHeight - template.height; y++) {
                for (let x = template.centerX - searchWidth; x <= template.centerX + searchWidth - template.width; x++) {
                    let nominator = 0, denominator = 0, templateIndex = 0;

                    // Calculate the normalized cross-correlation coefficient for this position
                    for (let ty = 0; ty < template.height; ty++) {
                        // we use only the green plane here 
                        let bufferIndex = x * 4 + 1 + (y + ty) * imageData.width * 4;
                        for (let tx = 0; tx < template.width; tx++) {
                            let imagepixel = p[bufferIndex];
                            nominator += template.buffer[templateIndex++] * imagepixel;
                            denominator += imagepixel * imagepixel;
                            // we use only the green plane here 
                            bufferIndex += 4;
                        }
                    }
                       
                    // The NCC coefficient is then (watch out for division-by-zero errors for pure black images)
                    let ncc = 0.0;
                    if (denominator > 0) {
                        ncc = nominator * nominator / denominator;
                    }
                    // Is it higher than what we had before?
                    if (ncc > maxCorr) {
                        maxCorr = ncc;
                        bestHitX = x;
                        bestHitY = y;
                    }
                }
            }
            // now the most similar position of the template is (bestHitX, bestHitY). Calculate the difference from the origin
            let distX = bestHitX - template.xPos,
                distY = bestHitY - template.yPos,
                movementDiff = Math.sqrt(distX * distX  + distY * distY);
            // the maximum movement possible is a complete shift into one of the corners, i.e
            let maxDistX = searchWidth - template.width / 2,
                maxDistY = searchHeight - template.height / 2,
                maximumMovement = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);

            // the percentage of the detected movement is therefore
            var movementPercentage = movementDiff / maximumMovement * 100;
            if (movementPercentage > 100) {
                movementPercentage = 100;
            }
            //console.log('Calculated movement: ', movementPercentage);
            return movementPercentage;
        }

        return {
            start: start,
            stop: stop,
            startRecording: startRecording,
            stopRecording: function () { recording(false); },
            upload: upload,
            mirror: mirror,
            getUploading: function () { return uploading; },
            getUploaded: function () { return uploaded; }
        };   
    };
}(window.bws = window.bws || {}, jQuery));