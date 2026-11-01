Yes. For your exact requirement, I would structure it as a native-app-style Vanilla JS player:

YouTube is only the video engine.
controls: 0 disables YouTube's normal control bar.
The iframe has pointer-events: none, so users cannot click/interact with the YouTube iframe.
All interaction happens through your own controls.
YouTube attribution/logo may remain visible, but it isn't an interactive part of your player.
No links/buttons in your UI redirect to YouTube.
No framework — pure HTML + CSS + JavaScript.
Custom controls are generated and managed entirely by your code.

One unavoidable limitation is that YouTube controls the content rendered inside its cross-origin iframe, so you cannot programmatically remove YouTube's own branding/watermark. You can, however, make the iframe non-interactive as below.

Here is a complete single-file implementation.

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
>

<title>Custom YouTube Video Player</title>

<style>
/* =========================================================
   RESET
========================================================= */

* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100%;
    background: #080808;
    color: #fff;

    font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Arial,
        sans-serif;
}

button,
input {
    font: inherit;
}


/* =========================================================
   PLAYER
========================================================= */

.yt-player {
    --accent: #ff1744;
    --accent-hover: #ff3158;

    --control-height: 64px;

    position: relative;

    width: 100%;
    max-width: 1100px;

    margin: 40px auto;

    background: #000;

    overflow: hidden;

    border-radius: 14px;

    box-shadow:
        0 30px 80px rgba(0, 0, 0, .55);

    user-select: none;

    -webkit-user-select: none;

    touch-action: manipulation;
}


/* =========================================================
   VIDEO AREA
========================================================= */

.yt-video {
    position: relative;

    width: 100%;

    aspect-ratio: 16 / 9;

    background: #000;

    overflow: hidden;
}


/*
    IMPORTANT

    The iframe is intentionally NOT interactive.

    Therefore:
    - no YouTube click
    - no YouTube controls
    - no accidental YouTube navigation

    All interaction goes through our controls.
*/

.yt-video iframe {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    border: 0;

    pointer-events: none;
}


/* =========================================================
   TOP GRADIENT
========================================================= */

.yt-top-gradient {
    position: absolute;

    left: 0;
    right: 0;
    top: 0;

    height: 100px;

    background:
        linear-gradient(
            to bottom,
            rgba(0,0,0,.75),
            rgba(0,0,0,0)
        );

    pointer-events: none;

    z-index: 5;

    opacity: 1;

    transition: opacity .25s;
}


/* =========================================================
   TITLE
========================================================= */

.yt-title {
    position: absolute;

    left: 18px;
    top: 15px;

    right: 100px;

    color: #fff;

    font-size: 15px;

    font-weight: 600;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

    text-shadow:
        0 2px 5px rgba(0,0,0,.8);

    pointer-events: none;

    z-index: 10;
}


/* =========================================================
   LOADING
========================================================= */

.yt-loader {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 46px;
    height: 46px;

    margin:
        -23px
        0
        0
        -23px;

    border-radius: 50%;

    border:
        4px solid
        rgba(255,255,255,.22);

    border-top-color:
        #fff;

    animation:
        yt-spin .75s linear infinite;

    z-index: 30;

    pointer-events: none;
}

.yt-loader.hidden {
    display: none;
}

@keyframes yt-spin {

    to {
        transform: rotate(360deg);
    }

}


/* =========================================================
   CENTER PLAY
========================================================= */

.yt-center-play {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 74px;
    height: 74px;

    transform:
        translate(-50%, -50%);

    border: 0;

    border-radius: 50%;

    background:
        rgba(0,0,0,.68);

    color: #fff;

    display: flex;

    align-items: center;
    justify-content: center;

    font-size: 27px;

    cursor: pointer;

    z-index: 20;

    transition:
        transform .2s,
        background .2s,
        opacity .2s;
}

.yt-center-play:hover {

    background:
        var(--accent);

    transform:
        translate(-50%, -50%)
        scale(1.08);
}

.yt-center-play.hidden {

    opacity: 0;

    pointer-events: none;
}


/* =========================================================
   BOTTOM CONTROLS
========================================================= */

.yt-controls {

    position: absolute;

    left: 0;
    right: 0;
    bottom: 0;

    z-index: 20;

    padding:
        55px
        14px
        10px;

    background:
        linear-gradient(
            to top,
            rgba(0,0,0,.92),
            rgba(0,0,0,.65),
            rgba(0,0,0,0)
        );

    transition:
        opacity .25s;
}

.yt-player.controls-hidden
.yt-controls {

    opacity: 0;

    pointer-events: none;
}

.yt-player.controls-hidden
.yt-top-gradient {

    opacity: 0;
}


/* =========================================================
   PROGRESS
========================================================= */

.yt-progress-area {

    position: relative;

    width: 100%;

    height: 20px;

    cursor: pointer;

    display: flex;

    align-items: center;

    margin-bottom: 5px;
}

.yt-progress-track {

    position: absolute;

    left: 0;
    right: 0;

    height: 4px;

    border-radius: 10px;

    background:
        rgba(255,255,255,.28);

    transition:
        height .15s;
}

.yt-progress-area:hover
.yt-progress-track {

    height: 6px;
}


/* BUFFER */

.yt-buffer {

    position: absolute;

    left: 0;

    top: 0;

    width: 0;

    height: 100%;

    border-radius: inherit;

    background:
        rgba(255,255,255,.38);
}


/* PLAYED */

.yt-played {

    position: absolute;

    left: 0;

    top: 0;

    width: 0;

    height: 100%;

    border-radius: inherit;

    background:
        var(--accent);
}


/* THUMB */

.yt-progress-thumb {

    position: absolute;

    top: 50%;

    left: 0;

    width: 13px;
    height: 13px;

    border-radius: 50%;

    background:
        var(--accent);

    transform:
        translate(-50%, -50%)
        scale(0);

    transition:
        transform .15s;
}

.yt-progress-area:hover
.yt-progress-thumb {

    transform:
        translate(-50%, -50%)
        scale(1);
}


/* =========================================================
   SEEK TOOLTIP
========================================================= */

.yt-seek-tooltip {

    position: absolute;

    bottom: 25px;

    left: 0;

    transform:
        translateX(-50%);

    padding:
        5px
        8px;

    background:
        rgba(0,0,0,.9);

    color: #fff;

    font-size: 11px;

    border-radius: 4px;

    white-space: nowrap;

    pointer-events: none;

    opacity: 0;
}

.yt-progress-area:hover
.yt-seek-tooltip {

    opacity: 1;
}


/* =========================================================
   CONTROL ROW
========================================================= */

.yt-control-row {

    display: flex;

    align-items: center;

    min-height: 42px;

    gap: 3px;
}

.yt-left-controls,
.yt-right-controls {

    display: flex;

    align-items: center;

    gap: 2px;
}

.yt-spacer {
    flex: 1;
}


/* =========================================================
   BUTTON
========================================================= */

.yt-btn {

    width: 38px;
    height: 38px;

    padding: 0;

    border: 0;

    background: transparent;

    color: #fff;

    border-radius: 7px;

    display: flex;

    align-items: center;
    justify-content: center;

    cursor: pointer;

    font-size: 18px;

    transition:
        background .15s,
        color .15s,
        transform .1s;
}

.yt-btn:hover {

    background:
        rgba(255,255,255,.12);
}

.yt-btn:active {

    transform:
        scale(.9);
}


/* =========================================================
   VOLUME
========================================================= */

.yt-volume {

    display: flex;

    align-items: center;

    width: 120px;

    overflow: hidden;
}

.yt-volume-slider {

    width: 75px;

    accent-color:
        var(--accent);

    cursor: pointer;
}


/* =========================================================
   TIME
========================================================= */

.yt-time {

    margin-left: 5px;

    color: #eee;

    font-size: 12px;

    white-space: nowrap;
}


/* =========================================================
   MENU
========================================================= */

.yt-settings-wrapper {

    position: relative;
}

.yt-settings-menu {

    position: absolute;

    right: 0;

    bottom: 48px;

    width: 210px;

    padding: 6px;

    background:
        rgba(20,20,20,.98);

    border:
        1px solid
        rgba(255,255,255,.08);

    border-radius: 10px;

    box-shadow:
        0 15px 50px
        rgba(0,0,0,.65);

    display: none;

    z-index: 100;
}

.yt-settings-menu.open {

    display: block;
}

.yt-menu-title {

    padding:
        9px
        10px;

    color: #999;

    font-size: 11px;

    text-transform: uppercase;

    letter-spacing: .06em;
}

.yt-menu-item {

    width: 100%;

    border: 0;

    background: transparent;

    color: #fff;

    padding:
        10px;

    border-radius: 6px;

    cursor: pointer;

    display: flex;

    justify-content: space-between;

    text-align: left;

    font-size: 13px;
}

.yt-menu-item:hover {

    background:
        rgba(255,255,255,.08);
}

.yt-menu-item.active {

    color:
        var(--accent);
}


/* =========================================================
   CHAPTERS
========================================================= */

.yt-chapters {

    position: absolute;

    left: 12px;
    right: 12px;

    bottom: 110%;

    display: none;

    gap: 6px;

    padding: 8px;

    background:
        rgba(0,0,0,.9);

    border-radius: 8px;

    overflow-x: auto;
}

.yt-chapters.open {

    display: flex;
}

.yt-chapter {

    flex: 0 0 auto;

    padding:
        7px
        10px;

    background:
        #242424;

    border-radius: 5px;

    color: #ddd;

    font-size: 11px;

    cursor: pointer;
}

.yt-chapter:hover {

    background:
        #333;
}

.yt-chapter.active {

    background:
        var(--accent);

    color: #fff;
}


/* =========================================================
   TOAST
========================================================= */

.yt-toast {

    position: absolute;

    left: 50%;
    top: 50%;

    transform:
        translate(-50%, -50%);

    padding:
        8px
        14px;

    border-radius: 7px;

    background:
        rgba(0,0,0,.82);

    color: #fff;

    font-size: 13px;

    pointer-events: none;

    opacity: 0;

    z-index: 50;

    transition:
        opacity .2s;
}

.yt-toast.show {

    opacity: 1;
}


/* =========================================================
   ERROR
========================================================= */

.yt-error {

    position: absolute;

    inset: 0;

    z-index: 40;

    background:
        radial-gradient(
            circle,
            #222,
            #050505
        );

    display: none;

    align-items: center;
    justify-content: center;

    text-align: center;

    padding: 25px;
}

.yt-error.show {

    display: flex;
}

.yt-error h3 {

    margin:
        0 0 8px;

    font-size: 18px;
}

.yt-error p {

    margin: 0;

    color: #aaa;

    font-size: 13px;
}


/* =========================================================
   THEATER MODE
========================================================= */

.yt-player.theater {

    width: 100%;

    max-width: none;

    margin:
        0;

    border-radius: 0;
}

.yt-player.theater
.yt-video {

    aspect-ratio: auto;

    height:
        min(80vh, 850px);
}


/* =========================================================
   FULLSCREEN
========================================================= */

.yt-player:fullscreen {

    width: 100vw;

    height: 100vh;

    max-width: none;

    margin: 0;

    border-radius: 0;
}

.yt-player:fullscreen
.yt-video {

    height: 100%;

    aspect-ratio: auto;
}


/* =========================================================
   MINI PLAYER
========================================================= */

.yt-player.mini {

    position: fixed;

    right: 18px;
    bottom: 18px;

    width: 360px;

    margin: 0;

    z-index: 999999;

    border-radius: 10px;

    box-shadow:
        0 15px 50px
        rgba(0,0,0,.75);
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 700px) {

    .yt-player {

        width: 100%;

        margin: 0;

        border-radius: 0;
    }

    .yt-controls {

        padding:
            45px
            7px
            7px;
    }

    .yt-btn {

        width: 34px;
        height: 34px;

        font-size: 16px;
    }

    .yt-volume {

        width: 36px;
    }

    .yt-volume-slider {

        display: none;
    }

    .yt-time {

        font-size: 10px;
    }

    .yt-desktop-only {

        display: none;
    }

    .yt-center-play {

        width: 64px;
        height: 64px;

        font-size: 24px;
    }

    .yt-player.mini {

        right: 8px;
        bottom: 8px;

        width: 300px;
    }

}
</style>
</head>


<body>


<!-- =======================================================
     PLAYER
======================================================= -->

<div
    class="yt-player"
    id="ytPlayer"
>


    <!-- VIDEO -->

    <div
        class="yt-video"
        id="ytVideo"
    >

        <div
            id="youtubeFrame"
        ></div>


        <!-- TOP GRADIENT -->

        <div
            class="yt-top-gradient"
        ></div>


        <!-- TITLE -->

        <div
            class="yt-title"
            id="ytTitle"
        >
            Loading...
        </div>


        <!-- LOADER -->

        <div
            class="yt-loader"
            id="ytLoader"
        ></div>


        <!-- CENTER PLAY -->

        <button
            class="yt-center-play"
            id="ytCenterPlay"
            aria-label="Play video"
        >
            ▶
        </button>


        <!-- TOAST -->

        <div
            class="yt-toast"
            id="ytToast"
        ></div>


        <!-- ERROR -->

        <div
            class="yt-error"
            id="ytError"
        >

            <div>

                <h3>
                    Video unavailable
                </h3>

                <p
                    id="ytErrorText"
                >
                    Unable to load this video.
                </p>

            </div>

        </div>


        <!-- CONTROLS -->

        <div
            class="yt-controls"
            id="ytControls"
        >


            <!-- CHAPTERS -->

            <div
                class="yt-chapters"
                id="ytChapters"
            ></div>


            <!-- PROGRESS -->

            <div
                class="yt-progress-area"
                id="ytProgress"
            >

                <div
                    class="yt-progress-track"
                >

                    <div
                        class="yt-buffer"
                        id="ytBuffer"
                    ></div>

                    <div
                        class="yt-played"
                        id="ytPlayed"
                    ></div>

                </div>

                <div
                    class="yt-progress-thumb"
                    id="ytProgressThumb"
                ></div>

                <div
                    class="yt-seek-tooltip"
                    id="ytSeekTooltip"
                >
                    0:00
                </div>

            </div>


            <!-- CONTROL ROW -->

            <div
                class="yt-control-row"
            >


                <!-- LEFT -->

                <div
                    class="yt-left-controls"
                >

                    <!-- PLAY -->

                    <button
                        class="yt-btn"
                        id="ytPlay"
                        title="Play / Pause"
                    >
                        ▶
                    </button>


                    <!-- BACK -->

                    <button
                        class="yt-btn"
                        id="ytBack"
                        title="Back 10 seconds"
                    >
                        ↶
                    </button>


                    <!-- FORWARD -->

                    <button
                        class="yt-btn"
                        id="ytForward"
                        title="Forward 10 seconds"
                    >
                        ↷
                    </button>


                    <!-- VOLUME -->

                    <div
                        class="yt-volume"
                    >

                        <button
                            class="yt-btn"
                            id="ytMute"
                            title="Mute"
                        >
                            🔊
                        </button>

                        <input
                            class="yt-volume-slider"
                            id="ytVolume"
                            type="range"
                            min="0"
                            max="100"
                            value="100"
                        >

                    </div>


                    <!-- TIME -->

                    <span
                        class="yt-time"
                        id="ytTime"
                    >
                        0:00 / 0:00
                    </span>

                </div>


                <div
                    class="yt-spacer"
                ></div>


                <!-- RIGHT -->

                <div
                    class="yt-right-controls"
                >


                    <!-- CHAPTERS -->

                    <button
                        class="yt-btn yt-desktop-only"
                        id="ytChapterButton"
                        title="Chapters"
                    >
                        ☰
                    </button>


                    <!-- SETTINGS -->

                    <div
                        class="yt-settings-wrapper"
                    >

                        <button
                            class="yt-btn"
                            id="ytSettings"
                            title="Settings"
                        >
                            ⚙
                        </button>


                        <div
                            class="yt-settings-menu"
                            id="ytSettingsMenu"
                        >

                            <div
                                class="yt-menu-title"
                            >
                                Playback speed
                            </div>


                            <button
                                class="yt-menu-item"
                                data-speed="0.5"
                            >
                                <span>
                                    0.5×
                                </span>
                            </button>


                            <button
                                class="yt-menu-item"
                                data-speed="0.75"
                            >
                                <span>
                                    0.75×
                                </span>
                            </button>


                            <button
                                class="yt-menu-item active"
                                data-speed="1"
                            >
                                <span>
                                    Normal
                                </span>
                            </button>


                            <button
                                class="yt-menu-item"
                                data-speed="1.25"
                            >
                                <span>
                                    1.25×
                                </span>
                            </button>


                            <button
                                class="yt-menu-item"
                                data-speed="1.5"
                            >
                                <span>
                                    1.5×
                                </span>
                            </button>


                            <button
                                class="yt-menu-item"
                                data-speed="1.75"
                            >
                                <span>
                                    1.75×
                                </span>
                            </button>


                            <button
                                class="yt-menu-item"
                                data-speed="2"
                            >
                                <span>
                                    2×
                                </span>
                            </button>

                        </div>

                    </div>


                    <!-- THEATER -->

                    <button
                        class="yt-btn"
                        id="ytTheater"
                        title="Theater mode"
                    >
                        ▭
                    </button>


                    <!-- MINI -->

                    <button
                        class="yt-btn yt-desktop-only"
                        id="ytMini"
                        title="Mini player"
                    >
                        ▱
                    </button>


                    <!-- FULLSCREEN -->

                    <button
                        class="yt-btn"
                        id="ytFullscreen"
                        title="Fullscreen"
                    >
                        ⛶
                    </button>

                </div>

            </div>

        </div>

    </div>

</div>


<!-- =======================================================
     YOUTUBE API
======================================================= -->

<script
    src="https://www.youtube.com/iframe_api"
></script>


<script>
"use strict";


/* =========================================================
   CONFIG
========================================================= */

const PLAYER_CONFIG = {

    /*
        CHANGE THIS
    */

    videoId: "dQw4w9WgXcQ",


    /*
        Resume playback
    */

    resume: true,


    /*
        Automatically hide controls
    */

    autoHideControls: true,


    /*
        Time before controls disappear
    */

    controlsTimeout: 3000,


    /*
        Seek amount
    */

    seekSeconds: 10,


    /*
        Chapters

        Remove this array if you don't
        need chapters.
    */

    chapters: [

        {
            title: "Introduction",
            time: 0
        },

        {
            title: "Main Content",
            time: 60
        },

        {
            title: "Advanced Section",
            time: 180
        },

        {
            title: "Conclusion",
            time: 360
        }

    ]

};


/* =========================================================
   DOM
========================================================= */

const root =
    document.getElementById("ytPlayer");

const video =
    document.getElementById("ytVideo");

const frame =
    document.getElementById("youtubeFrame");

const title =
    document.getElementById("ytTitle");

const loader =
    document.getElementById("ytLoader");

const centerPlay =
    document.getElementById("ytCenterPlay");

const controls =
    document.getElementById("ytControls");

const play =
    document.getElementById("ytPlay");

const back =
    document.getElementById("ytBack");

const forward =
    document.getElementById("ytForward");

const mute =
    document.getElementById("ytMute");

const volume =
    document.getElementById("ytVolume");

const time =
    document.getElementById("ytTime");

const progress =
    document.getElementById("ytProgress");

const played =
    document.getElementById("ytPlayed");

const buffer =
    document.getElementById("ytBuffer");

const thumb =
    document.getElementById("ytProgressThumb");

const seekTooltip =
    document.getElementById("ytSeekTooltip");

const settings =
    document.getElementById("ytSettings");

const settingsMenu =
    document.getElementById("ytSettingsMenu");

const theater =
    document.getElementById("ytTheater");

const mini =
    document.getElementById("ytMini");

const fullscreen =
    document.getElementById("ytFullscreen");

const chaptersButton =
    document.getElementById("ytChapterButton");

const chapters =
    document.getElementById("ytChapters");

const toast =
    document.getElementById("ytToast");

const error =
    document.getElementById("ytError");

const errorText =
    document.getElementById("ytErrorText");


/* =========================================================
   STATE
========================================================= */

let yt = null;

let hideTimer = null;

let toastTimer = null;

let progressTimer = null;

let saveTimer = null;

let dragging = false;


/* =========================================================
   YOUTUBE API READY
========================================================= */

window.onYouTubeIframeAPIReady = function () {

    yt = new YT.Player(
        "youtubeFrame",
        {

            videoId:
                PLAYER_CONFIG.videoId,

            playerVars: {

                /*
                    IMPORTANT
                */

                controls: 0,

                playsinline: 1,

                rel: 0,

                iv_load_policy: 3,

                fs: 0,

                disablekb: 1

            },

            events: {

                onReady:
                    onReady,

                onStateChange:
                    onStateChange,

                onError:
                    onError

            }

        }
    );

};


/* =========================================================
   READY
========================================================= */

function onReady() {

    loader.classList.add(
        "hidden"
    );


    /*
        Get title
    */

    try {

        const data =
            yt.getVideoData();

        title.textContent =
            data.title ||
            "Video";

    } catch {

        title.textContent =
            "Video";

    }


    /*
        Volume
    */

    yt.setVolume(
        Number(volume.value)
    );


    /*
        Build chapters
    */

    buildChapters();


    /*
        Restore previous position
    */

    restorePosition();


    /*
        Start update loop
    */

    progressTimer =
        setInterval(
            update,
            200
        );


    /*
        Save playback position
    */

    saveTimer =
        setInterval(
            savePosition,
            3000
        );

}


/* =========================================================
   STATE CHANGE
========================================================= */

function onStateChange(event) {

    switch (event.data) {

        case YT.PlayerState.PLAYING:

            loader.classList.add(
                "hidden"
            );

            play.textContent =
                "❚❚";

            centerPlay.classList.add(
                "hidden"
            );

            showControls();

            startHideTimer();

            break;


        case YT.PlayerState.PAUSED:

            loader.classList.add(
                "hidden"
            );

            play.textContent =
                "▶";

            centerPlay.classList.remove(
                "hidden"
            );

            showControls();

            break;


        case YT.PlayerState.BUFFERING:

            loader.classList.remove(
                "hidden"
            );

            break;


        case YT.PlayerState.ENDED:

            loader.classList.add(
                "hidden"
            );

            play.textContent =
                "↻";

            centerPlay.textContent =
                "↻";

            centerPlay.classList.remove(
                "hidden"
            );

            showControls();

            removeSavedPosition();

            break;

    }

}


/* =========================================================
   ERROR
========================================================= */

function onError(event) {

    loader.classList.add(
        "hidden"
    );

    error.classList.add(
        "show"
    );


    const errors = {

        2:
            "The video ID is invalid.",

        5:
            "This video cannot be played in the embedded player.",

        100:
            "This video was removed or is private.",

        101:
            "The video owner does not allow embedding.",

        150:
            "The video owner does not allow embedding."

    };


    errorText.textContent =
        errors[event.data] ||
        "Unable to play this video.";

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!yt) {
        return;
    }


    const state =
        yt.getPlayerState();


    if (
        state ===
        YT.PlayerState.PLAYING
    ) {

        yt.pauseVideo();

    } else {

        if (
            state ===
            YT.PlayerState.ENDED
        ) {

            yt.seekTo(
                0,
                true
            );

        }

        yt.playVideo();

    }

}


play.addEventListener(
    "click",
    togglePlay
);

centerPlay.addEventListener(
    "click",
    togglePlay
);


/* =========================================================
   SEEK
========================================================= */

function seekBy(seconds) {

    if (!yt) {
        return;
    }


    const current =
        yt.getCurrentTime();

    const duration =
        yt.getDuration();


    const target =
        Math.max(
            0,
            Math.min(
                duration,
                current + seconds
            )
        );


    yt.seekTo(
        target,
        true
    );


    showToast(
        seconds > 0
            ? `+${seconds}s`
            : `${seconds}s`
    );

}


back.addEventListener(
    "click",
    () => {

        seekBy(
            -PLAYER_CONFIG.seekSeconds
        );

    }
);


forward.addEventListener(
    "click",
    () => {

        seekBy(
            PLAYER_CONFIG.seekSeconds
        );

    }
);


/* =========================================================
   PROGRESS UPDATE
========================================================= */

function update() {

    if (!yt) {
        return;
    }


    const duration =
        yt.getDuration();

    const current =
        yt.getCurrentTime();


    if (!duration) {
        return;
    }


    if (!dragging) {

        const percentage =
            (current / duration) * 100;


        played.style.width =
            `${percentage}%`;


        thumb.style.left =
            `${percentage}%`;

    }


    time.textContent =
        `${formatTime(current)} / ${formatTime(duration)}`;


    /*
        Buffer
    */

    const loaded =
        yt.getVideoLoadedFraction();


    buffer.style.width =
        `${loaded * 100}%`;


    /*
        Chapter state
    */

    updateChapterState();

}


/* =========================================================
   PROGRESS SEEK
========================================================= */

function seekFromPointer(event) {

    if (!yt) {
        return;
    }


    const rect =
        progress.getBoundingClientRect();


    const percent =
        Math.max(
            0,
            Math.min(
                1,
                (event.clientX - rect.left) /
                rect.width
            )
        );


    const duration =
        yt.getDuration();


    yt.seekTo(
        duration * percent,
        true
    );

}


progress.addEventListener(
    "click",
    event => {

        seekFromPointer(event);

    }
);


/* =========================================================
   PROGRESS TOOLTIP
========================================================= */

progress.addEventListener(
    "mousemove",
    event => {

        if (!yt) {
            return;
        }


        const rect =
            progress.getBoundingClientRect();


        const percent =
            Math.max(
                0,
                Math.min(
                    1,
                    (event.clientX - rect.left) /
                    rect.width
                )
            );


        const duration =
            yt.getDuration();


        const seconds =
            duration * percent;


        seekTooltip.textContent =
            formatTime(seconds);


        seekTooltip.style.left =
            `${percent * 100}%`;

    }
);


/* =========================================================
   DRAG SEEK
========================================================= */

progress.addEventListener(
    "mousedown",
    () => {

        dragging = true;

    }
);


document.addEventListener(
    "mouseup",
    () => {

        dragging = false;

    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (!dragging || !yt) {
            return;
        }


        const rect =
            progress.getBoundingClientRect();


        const percent =
            Math.max(
                0,
                Math.min(
                    1,
                    (event.clientX - rect.left) /
                    rect.width
                )
            );


        const duration =
            yt.getDuration();


        yt.seekTo(
            duration * percent,
            true
        );

    }
);


/* =========================================================
   TOUCH SEEK
========================================================= */

progress.addEventListener(
    "touchstart",
    event => {

        dragging = true;

        event.preventDefault();

    },
    {
        passive: false
    }
);


progress.addEventListener(
    "touchmove",
    event => {

        if (!yt) {
            return;
        }


        const touch =
            event.touches[0];


        const rect =
            progress.getBoundingClientRect();


        const percent =
            Math.max(
                0,
                Math.min(
                    1,
                    (touch.clientX - rect.left) /
                    rect.width
                )
            );


        yt.seekTo(
            yt.getDuration() * percent,
            true
        );


        event.preventDefault();

    },
    {
        passive: false
    }
);


progress.addEventListener(
    "touchend",
    () => {

        dragging = false;

    }
);


/* =========================================================
   VOLUME
========================================================= */

volume.addEventListener(
    "input",
    () => {

        const value =
            Number(volume.value);


        yt.setVolume(
            value
        );


        if (value === 0) {

            yt.mute();

        } else {

            yt.unMute();

        }


        updateMuteIcon();

    }
);


/* =========================================================
   MUTE
========================================================= */

mute.addEventListener(
    "click",
    () => {

        if (yt.isMuted()) {

            yt.unMute();


            const value =
                Number(volume.value) || 70;


            yt.setVolume(
                value
            );

        } else {

            yt.mute();

        }


        updateMuteIcon();

    }
);


function updateMuteIcon() {

    if (yt.isMuted()) {

        mute.textContent =
            "🔇";

        return;

    }


    const value =
        yt.getVolume();


    if (value < 50) {

        mute.textContent =
            "🔉";

    } else {

        mute.textContent =
            "🔊";

    }

}


/* =========================================================
   SETTINGS
========================================================= */

settings.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        settingsMenu.classList.toggle(
            "open"
        );

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".yt-settings-wrapper"
            )
        ) {

            settingsMenu.classList.remove(
                "open"
            );

        }

    }
);


document
    .querySelectorAll(
        ".yt-menu-item"
    )
    .forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    const speed =
                        Number(
                            item.dataset.speed
                        );


                    yt.setPlaybackRate(
                        speed
                    );


                    document
                        .querySelectorAll(
                            ".yt-menu-item"
                        )
                        .forEach(
                            button => {

                                button.classList.remove(
                                    "active"
                                );

                            }
                        );


                    item.classList.add(
                        "active"
                    );


                    settingsMenu.classList.remove(
                        "open"
                    );


                    showToast(
                        `Speed ${speed}×`
                    );

                }
            );

        }
    );


/* =========================================================
   FULLSCREEN
========================================================= */

fullscreen.addEventListener(
    "click",
    toggleFullscreen
);


function toggleFullscreen() {

    if (!document.fullscreenElement) {

        if (
            root.requestFullscreen
        ) {

            root.requestFullscreen();

        }

    } else {

        document.exitFullscreen();

    }

}


/* =========================================================
   THEATER
========================================================= */

theater.addEventListener(
    "click",
    () => {

        root.classList.toggle(
            "theater"
        );

    }
);


/* =========================================================
   MINI PLAYER
========================================================= */

mini.addEventListener(
    "click",
    () => {

        root.classList.toggle(
            "mini"
        );

    }
);


/* =========================================================
   CHAPTERS
========================================================= */

function buildChapters() {

    chapters.innerHTML = "";


    PLAYER_CONFIG
        .chapters
        .forEach(
            chapter => {

                const element =
                    document.createElement(
                        "button"
                    );


                element.className =
                    "yt-chapter";


                element.type =
                    "button";


                element.textContent =
                    `${formatTime(chapter.time)}  ${chapter.title}`;


                element.addEventListener(
                    "click",
                    () => {

                        yt.seekTo(
                            chapter.time,
                            true
                        );

                        chapters.classList.remove(
                            "open"
                        );

                    }
                );


                chapters.appendChild(
                    element
                );

            }
        );

}


chaptersButton.addEventListener(
    "click",
    () => {

        chapters.classList.toggle(
            "open"
        );

    }
);


function updateChapterState() {

    if (!yt) {
        return;
    }


    const current =
        yt.getCurrentTime();


    const chapterElements =
        chapters.querySelectorAll(
            ".yt-chapter"
        );


    PLAYER_CONFIG
        .chapters
        .forEach(
            (chapter, index) => {

                const next =
                    PLAYER_CONFIG
                        .chapters[index + 1];


                const active =
                    current >= chapter.time &&
                    (
                        !next ||
                        current < next.time
                    );


                chapterElements[index]
                    ?.classList
                    .toggle(
                        "active",
                        active
                    );

            }
        );

}


/* =========================================================
   CONTROLS AUTO HIDE
========================================================= */

function showControls() {

    root.classList.remove(
        "controls-hidden"
    );


    clearTimeout(
        hideTimer
    );

}


function startHideTimer() {

    if (
        !PLAYER_CONFIG.autoHideControls
    ) {

        return;

    }


    clearTimeout(
        hideTimer
    );


    hideTimer =
        setTimeout(
            () => {

                if (
                    yt &&
                    yt.getPlayerState() ===
                    YT.PlayerState.PLAYING
                ) {

                    root.classList.add(
                        "controls-hidden"
                    );

                }

            },
            PLAYER_CONFIG.controlsTimeout
        );

}


video.addEventListener(
    "mousemove",
    () => {

        showControls();

        startHideTimer();

    }
);


video.addEventListener(
    "touchstart",
    () => {

        showControls();

        startHideTimer();

    },
    {
        passive: true
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
            Don't intercept form controls.
        */

        const tag =
            document.activeElement?.tagName;


        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
        ) {

            return;

        }


        switch (
            event.key.toLowerCase()
        ) {

            case " ":

                event.preventDefault();

                togglePlay();

                break;


            case "arrowleft":

                event.preventDefault();

                seekBy(-5);

                break;


            case "arrowright":

                event.preventDefault();

                seekBy(5);

                break;


            case "j":

                seekBy(-10);

                break;


            case "l":

                seekBy(10);

                break;


            case "m":

                toggleMute();

                break;


            case "f":

                toggleFullscreen();

                break;


            case "t":

                root.classList.toggle(
                    "theater"
                );

                break;


            case "escape":

                settingsMenu.classList.remove(
                    "open"
                );

                chapters.classList.remove(
                    "open"
                );

                break;

        }

    }
);


/* =========================================================
   TOUCH DOUBLE TAP
========================================================= */

let lastTap = 0;

video.addEventListener(
    "touchend",
    event => {

        const now =
            Date.now();


        const difference =
            now - lastTap;


        if (
            difference > 0 &&
            difference < 300
        ) {

            const touch =
                event.changedTouches[0];


            const rect =
                video.getBoundingClientRect();


            const x =
                touch.clientX -
                rect.left;


            if (
                x <
                rect.width / 2
            ) {

                seekBy(-10);

            } else {

                seekBy(10);

            }

        }


        lastTap = now;

    }
);


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            700
        );

}


/* =========================================================
   RESUME
========================================================= */

function storageKey() {

    return (
        "custom-youtube-player:" +
        PLAYER_CONFIG.videoId
    );

}


function restorePosition() {

    if (
        !PLAYER_CONFIG.resume
    ) {

        return;

    }


    const saved =
        Number(
            localStorage.getItem(
                storageKey()
            )
        );


    if (
        !saved ||
        saved < 10
    ) {

        return;

    }


    setTimeout(
        () => {

            const duration =
                yt.getDuration();


            if (
                duration &&
                saved <
                duration - 5
            ) {

                yt.seekTo(
                    saved,
                    true
                );


                showToast(
                    `Resumed at ${formatTime(saved)}`
                );

            }

        },
        800
    );

}


function savePosition() {

    if (!yt) {
        return;
    }


    const state =
        yt.getPlayerState();


    if (
        state !==
            YT.PlayerState.PLAYING &&
        state !==
            YT.PlayerState.PAUSED
    ) {

        return;

    }


    const current =
        yt.getCurrentTime();


    if (current > 5) {

        localStorage.setItem(
            storageKey(),
            Math.floor(current)
        );

    }

}


function removeSavedPosition() {

    localStorage.removeItem(
        storageKey()
    );

}


window.addEventListener(
    "beforeunload",
    savePosition
);


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds)
    ) {

        return "0:00";

    }


    seconds =
        Math.max(
            0,
            Math.floor(seconds)
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remaining =
        seconds % 60;


    if (hours > 0) {

        return (
            `${hours}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(remaining).padStart(2, "0")}`
        );

    }


    return (
        `${minutes}:` +
        `${String(remaining).padStart(2, "0")}`
    );

}


/* =========================================================
   INITIAL UI
========================================================= */

showControls();

</script>

</body>
</html>
The important part for your requirement

This line is what makes the YouTube iframe non-interactive:

.yt-video iframe {
    pointer-events: none;
}

Combined with:

playerVars: {
    controls: 0,
    playsinline: 1,
    rel: 0,
    iv_load_policy: 3,
    fs: 0,
    disablekb: 1
}

the intended interaction model is:

                    YOUR WEBSITE
                         │
             ┌───────────┴───────────┐
             │                       │
       Custom controls          YouTube iframe
             │                       │
             │                  VIDEO ONLY
             │                       │
             ▼                       │
       YouTube Player API ◄──────────┘

So a user doesn't need to click the YouTube video itself. For example:

Play

yt.playVideo();

Pause

yt.pauseVideo();

Seek

yt.seekTo(120, true);

Volume

yt.setVolume(80);

Speed

yt.setPlaybackRate(1.5);

This is much closer to the architecture of an app that treats YouTube as a video backend rather than as a YouTube webpage.

One caveat worth knowing

There is no supported API that lets your website take ownership of the actual YouTube iframe DOM or guarantee that YouTube will never render any of its own attribution/branding. That's why this implementation doesn't attempt to remove YouTube branding.

Instead, it makes the iframe non-clickable from your page and puts the entire player experience in your own UI.

For a production version, I would take this one step further and turn it into:

CustomYouTubePlayer
│
├── Player lifecycle
├── YouTube API adapter
├── Custom controls
├── Timeline engine
├── Touch gesture engine
├── Fullscreen manager
├── Mini-player manager
├── Chapter manager
├── Settings manager
├── Resume manager
├── Playlist manager
├── Keyboard manager
└── Event system

with an API such as:

const player = new CustomYouTubePlayer({
    container: "#player",
    videoId: "VIDEO_ID"
});

player.play();
player.pause();
player.seek(120);
player.setVolume(75);
player.setPlaybackRate(1.5);
player.fullscreen();

That would be the version I'd use if this is going into an actual website/app rather than being a demo.