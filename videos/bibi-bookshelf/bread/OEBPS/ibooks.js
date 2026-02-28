/*
 * Based on Apple's iBook JS Framework
 * Stripped down and enhanced for Book Creator
 */

// Top-level object containing some core constants providing information about the environment.
var iBook = {}

// Indicates whether the platform is an iBook.IS_IPAD.
iBook.IS_IPAD = (navigator.platform == 'iPad')

// Indicates whether the platform supports touches.
iBook.SUPPORTS_TOUCHES = ('createTouch' in document)

// The interaction start event name
iBook.START_EVENT = iBook.SUPPORTS_TOUCHES ? 'touchstart' : 'mousedown'

// The interaction move event name
iBook.MOVE_EVENT = iBook.SUPPORTS_TOUCHES ? 'touchmove' : 'mousemove'

// The interaction end event name
iBook.END_EVENT = iBook.SUPPORTS_TOUCHES ? 'touchend' : 'mouseup'

// The CSS selector for media elements.
iBook.MEDIA_BASE_CSS_SELECTOR = '.ibooks-media'

// The HTML attribute for the audio source
iBook.MEDIA_AUDIO_SOURCE_ATTRIBUTE = 'data-ibooks-audio-src'

// The HTML attribute for the audio reset on play
iBook.MEDIA_AUDIO_RESET_ATTRIBUTE = 'data-ibooks-audio-reset-on-play'

// The HTML attribute for pausing iBooks read aloud
iBook.MEDIA_PAUSE_READ_ALOUD_ATTRIBUTE = 'data-ibooks-pause-readaloud'

iBook.HYPERLINK_ATTRIBUTE = 'data-bookcreator-link'

// CSS class name on active elements
iBook.ACTIVE_CSS_CLASS = 'active'

// Tap threshold value, in pixels
iBook.TAP_THRESHOLD = 10

iBook.handleLink = function (e)
{
    var link = e.target.getAttribute(iBook.HYPERLINK_ATTRIBUTE)
    if (link)
    {
        e.preventDefault()
		window.location.href = link
    }
}

iBook.getEventClientX = function (event) {
    if (event.changedTouches && event.changedTouches.length == 1) {
        // Touch interface
        return event.changedTouches.item(0).clientX
    }
    else {
        // Desktop interface
        return event.clientX
    }
}

iBook.getEventClientY = function (event) {
    if (event.changedTouches && event.changedTouches.length == 1) {
        // Touch interface
        return event.changedTouches.item(0).clientY
    }
    else {
        // Desktop interface
        return event.clientY
    }
}

/* ==================== BASE CONTROLLER ==================== */

function iBooksBaseController()
{
    // Set true for an onscreen log
    if (false)
    {
        var logArea = document.createElement('textarea')
        logArea.id = 'logArea'
        logArea.style.position = 'absolute'
        logArea.style.bottom = '5px'
        logArea.style.left = '5px'
        logArea.style.width = '420px'
        logArea.style.height = '150px'
        logArea.style.zIndex = 4000
        var body = document.getElementById('main')
        body.appendChild(logArea)
        
        iBook.log = function (msg) {
            var logArea = document.getElementById('logArea')
            if (!msg) msg = 'null'
            logArea.value = msg + '\n' + logArea.value
        }
    }
    else
    {
        iBook.log = function (msg) {}
    }
    
    this.media = new iBooksMediaController()
    this.link = new iBooksLinkController()
}

// On DOM content loaded, instantiate the iBook base controller
window.addEventListener('DOMContentLoaded', function() {
    window.iBookController = new iBooksBaseController()
}, false)

/* ==================== ELEMENT PROTOTYPE ADDITIONS ==================== */

// Indicates whether the element has a given class name within its <code>class</code> attribute.
Element.prototype.hasClassName = function (className)
{
    return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(this.className)
}

// Adds the given class name to the element's <code>class</code> attribute if it's not already there.
Element.prototype.addClassName = function (className)
{
    if (!this.hasClassName(className))
    {
        this.className = [this.className, className].join(' ')
        return true
    }
    else
    {
        return false
    }
}

// Removes the given class name from the element's <code>class</code> attribute if it's there.
Element.prototype.removeClassName = function (className)
{
    if (this.hasClassName(className))
    {
        var curClasses = this.className
        this.className = curClasses.replace(new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)', 'g'), ' ')
        return true
    }
    return false
}

// Adds or removes the given class name from the element's <code>class</code> attribute based on a condition. If no
// condition is set, the class will be added if it is not already present and removed if it is.
Element.prototype.toggleClassName = function (className, condition)
{
    if (condition == null)
    {
        condition = !this.hasClassName(className)
    }
    this[condition ? 'addClassName' : 'removeClassName'](className)
}

/* ==================== LINK CONTROLLER ==================== */

function iBooksLinkController()
{
    // <img data-bookcreator-link="page002.xhtml" .../> or <img data-bookcreator-link="http://www.google.com" .../>
    var imgElements = document.documentElement.getElementsByTagName('img')
    
    for (var i = 0, max = imgElements.length; i < max; i++)
    {
        var img = imgElements[i]
        var link = img.getAttribute(iBook.HYPERLINK_ATTRIBUTE)
        if (link)
        {
            // iBook.log("adding image click:" + link);
            img.addEventListener('click', iBook.handleLink, false)
        }
    }
    
    document.querySelectorAll('.item.link a').forEach(function (a) {
    	var remote = a.href.toLowerCase()
    	remote = remote.startsWith('http:') || remote.startsWith('https:')
    	var link = a.parentNode
        if (!remote && a.parentNode.getAttribute('data-bookcreator-content-type') !== 'application/pdf') {
        	a.setAttribute('disabled', 'true')
        }
    })
}

/* ==================== MEDIA CONTROLLER ==================== */

function iBooksMediaController()
{
    this.allMedia = []

    var audioElements = document.querySelectorAll(iBook.MEDIA_BASE_CSS_SELECTOR + '-audio')

    if (audioElements) {
        for (var i = audioElements.length - 1; i >= 0; i--) {
            this.allMedia.push(new iBooksAudioController(audioElements[i]))
        }
    }
    
    var videoElements = document.documentElement.getElementsByTagName('video')
    
    for (var i = 0, max = videoElements.length; i < max; i++) {
        this.allMedia.push(new iBooksVideoController(videoElements[i]))
    }
}

/* ==================== VIDEO CONTROLLER ==================== */

function iBooksVideoController(element)
{
    this.media = element
    this.media.addEventListener('play', this, false)
}

iBooksVideoController.prototype.pause = function()
{
    this.media.pause()
}

iBooksVideoController.prototype.handleEvent = function(event)
{
    if (event.type == 'play') {
        // iBooks will stop any other media automatically
        // but let's also call pause() on each item to reset the UI
        
        var allMedia = iBookController.media.allMedia
        
        for (var i = 0, max = allMedia.length; i < max; i++) {
            if (allMedia[i].media != this.media) {
                allMedia[i].pause()
            }
        }
    }
}

/* ==================== AUDIO CONTROLLER ==================== */
/**
 *  This is called when we've found a valid iBooks audio HTML element.
 *
 *  By default, audio will pause itself on touch, then resume playing when touched again.
 *  To reset the audio track, include the HTML attribute <code>iBook.MEDIA_AUDIO_RESET_ATTRIBUTE</code>
 *  and set the value to equal to <code>true<code>.
 *
 *  For example:
 *  <div class="ibooks-media-audio" data-ibooks-audio-src="audio/src.m4a">Play audio</div>
 *
 *  @property {Object} element The required object to instantiate the <code>iBooksAudioController</code>
 */
function iBooksAudioController(element)
{
    // iBook.log("iBooksAudioController construction:" + element);
    
    this.el = element
    this.el.addEventListener(iBook.START_EVENT, this, false)
    this.src = this.el.getAttribute(iBook.MEDIA_AUDIO_SOURCE_ATTRIBUTE)
    this.resetAudioOnPlay = false // For future maybe
    this.setAudio()
}

// Creates a new audio element, set the source, then load it.
iBooksAudioController.prototype.setAudio = function()
{
    this.media = new Audio()
    this.media.src = this.src
    this.media.addEventListener('ended', this, false)
    document.documentElement.appendChild(this.media)
}

iBooksAudioController.prototype.play = function()
{
    var allMedia = iBookController.media.allMedia
    
    for (var i = 0, max = allMedia.length; i < max; i++) {
        allMedia[i].pause()
    }
        
    if (this.resetAudioOnPlay) {
        // Remove the existing element to prevent duplicates.
        document.documentElement.removeChild(this.media)
        this.setAudio()
    }
    
    this.el.addClassName(iBook.ACTIVE_CSS_CLASS)
    this.media.play()
}

iBooksAudioController.prototype.pause = function()
{
    this.media.pause()
    this.el.removeClassName(iBook.ACTIVE_CSS_CLASS)
}

// When the audio ends, remove its active class
iBooksAudioController.prototype.ended = function()
{
    this.el.removeClassName(iBook.ACTIVE_CSS_CLASS)
}

/**
 *  On touch start, add an event listener for touch end. Store the
 *  touch start X, Y coordinates for later use.
 */
iBooksAudioController.prototype.touchStart = function(event)
{
//    iBook.log("iBooksAudioController.prototype.touchStart");
    
    this.startX = iBook.getEventClientX(event)
    this.startY = iBook.getEventClientY(event)
    window.addEventListener(iBook.END_EVENT, this, false)
}

/**
 *  On touch end, remove our event listeners. Determine if the user action was a
 *  tap, or gesture; if the action was a tap then add <code>iBook.ACTIVE_CSS_CLASS</code>
 *  to the body class and prevent default. Otherwise, allow iBooks to handle the event.
 */
iBooksAudioController.prototype.touchEnd = function(event)
{
    /*
    iBook.log("iBooksAudioController.prototype.touchEnd");
    
    iBook.log("event.pageX=" + event.pageX);
    iBook.log("event.clientX=" + event.clientX);
    if (event.changedTouches && event.changedTouches.length == 1)
        iBook.log("event.changedTouches.item(0).clientX=" + event.changedTouches.item(0).clientX);
    */
    
    window.removeEventListener(iBook.END_EVENT, this, false)
    
    this.xTap = (Math.abs(this.startX - iBook.getEventClientX(event)) < iBook.TAP_THRESHOLD)
    this.yTap = (Math.abs(this.startY - iBook.getEventClientY(event)) < iBook.TAP_THRESHOLD)
    
    if (this.xTap && this.yTap) {
        event.preventDefault()
        if (this.media.paused)
            this.play()
        else
            this.pause()
    }
}

// Event triage.
iBooksAudioController.prototype.handleEvent = function(event)
{
    // iBook.log("iBooksAudioController.prototype.handleEvent:" + event.type);

    switch(event.type){
        case iBook.START_EVENT:
            this.touchStart(event)
            break
        case iBook.END_EVENT:
            this.touchEnd(event)
            break
        case 'ended':
            this.ended()
            break
    }
}

