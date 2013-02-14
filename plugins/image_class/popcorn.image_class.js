// PLUGIN: IMAGE

(function ( Popcorn ) {

/**
 * Images_class popcorn plug-in
 * Shows an image element
 * Options parameter will need a start, end, href, target and src.
 * Start is the time that you want this plug-in to execute
 * End is the time that you want this plug-in to stop executing
 * href is the url of the destination of a anchor - optional
 * Target is the id of the document element that the iframe needs to be attached to,
 * this target element must exist on the DOM
 * Src is the url of the image that you want to display
 * text is the overlayed text on the image - optional
 *
 * @param {Object} options
 *
 * Example:
   var p = Popcorn('#video')
      .image({
        start: 5, // seconds
        end: 15, // seconds
        href: 'http://www.drumbeat.org/',
        src: 'http://www.drumbeat.org/sites/default/files/domain-2/drumbeat_logo.png',
        text: 'DRUMBEAT',
        target: 'imagediv',
        lclass: 'css class pour balise a',
        tclass: 'css pour text",
        attrib: 'setAttribute value pour attribut',
        attribval: 'val for attribute'
      } )
 *
 */

  var VIDEO_OVERLAY_Z = 2000,
      CHECK_INTERVAL_DURATION = 10;

  function trackMediaElement( mediaElement ) {
    var checkInterval = -1,
        container = document.createElement( "div" ),
        videoZ = getComputedStyle( mediaElement ).zIndex;

    container.setAttribute( "data-popcorn-helper-container", true );

    container.style.position = "absolute";

    if ( !isNaN( videoZ ) ) {
      container.style.zIndex = videoZ + 1;
    }
    else {
      container.style.zIndex = VIDEO_OVERLAY_Z;
    }

    document.body.appendChild( container );

    function check() {
      var mediaRect = mediaElement.getBoundingClientRect(),
          containerRect = container.getBoundingClientRect();

      if ( containerRect.left !== mediaRect.left ) {
        container.style.left = mediaRect.left + "px";
      }
      if ( containerRect.top !== mediaRect.top ) {
        container.style.top = mediaRect.top + "px";
      }
    }

    return {
      element: container,
      start: function() {
        checkInterval = setInterval( check, CHECK_INTERVAL_DURATION );
      },
      stop: function() {
        clearInterval( checkInterval );
        checkInterval = -1;
      },
      destroy: function() {
        document.body.removeChild( container );
        if ( checkInterval !== -1 ) {
          clearInterval( checkInterval );
        }
      }
    };
  }

  Popcorn.plugin( "image_class", {
      manifest: {
        about: {
          name: "Popcorn image_class Plugin",
          version: "0.2",
          author: "Franck RONDOT (Based on image popcorn.js plugins)",
          website: "http://www.franck-rondot.com/"
        },
        options: {
          start: {
            elem: "input",
            type: "number",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "number",
            label: "End"
          },
          src: {
            elem: "input",
            type: "url",
            label: "Image URL",
            "default": "http://mozillapopcorn.org/wp-content/themes/popcorn/images/for_developers.png"
          },
          href: {
            elem: "input",
            type: "url",
            label: "Link",
            "default": "http://mozillapopcorn.org/wp-content/themes/popcorn/images/for_developers.png",
            optional: true
          },
          target: "image-container",
          text: {
            elem: "input",
            type: "text",
            label: "Caption",
            "default": "Popcorn.js",
            optional: true
          },
         lclass: {
            elem: "input",
            type: "text",
            label: "Link Class",
            "default": "fancybox-media",
            optional: true
          },
         tclass: {
            elem: "input",
            type: "text",
            label: "Text Class",
            "default": "",
            optional: true
          },
        attrib: {
            elem: "input",
            type: "text",
            label: "Attribute",
            "default": "",
            optional: true
          },
         attribval: {
            elem: "input",
            type: "text",
            label: "Valeur attribute",
            "default": "",
            optional: true
          }
        }
      },
      _setup: function( options ) {
        var img = document.createElement( "img" ),
            target = document.getElementById( options.target );

		// Modif FR pas de tag a si pas de href
		// dans ce cas juste a affichage image
		if (typeof (options.href) != 'undefined') {
        	options.anchor = document.createElement( "a" );
        	
        	options.anchor.style.position = "relative";
        	options.anchor.style.textDecoration = "none";
        	options.anchor.style.display = "none";

			options.anchor.setAttribute('class', options.lclass);
		
			if (options.attrib) {
				options.anchor.setAttribute(options.attrib, options.attribval);
			}
        } else {
        	options.anchor = img;
        	
        	options.anchor.style.position = "relative";
        	options.anchor.style.textDecoration = "none";
        	options.anchor.style.display = "none";
        }

        // add the widget's div to the target div.
        // if target is <video> or <audio>, create a container and routinely 
        // update its size/position to be that of the media
        if ( target ) {
          if ( [ "VIDEO", "AUDIO" ].indexOf( target.nodeName ) > -1 ) {
            options.trackedContainer = trackMediaElement( target );
            options.trackedContainer.element.appendChild( options.anchor );
          }
          else {
            target && target.appendChild( options.anchor );
          }          
        }

        img.addEventListener( "load", function() {

		  // Modif FR pas de tag a si pas de href
		  // dans ce cas juste a affichage image
		  if (typeof (options.href) != 'undefined') {
          	// borders look really bad, if someone wants it they can put it on their div target
          	img.style.borderStyle = "none";

          	options.anchor.href = options.href || options.src || "#";
          	options.anchor.target = "_blank";
		  }
          var fontHeight, divText;

          img.style.height = target.style.height;
          img.style.width = target.style.width;

          options.anchor.appendChild( img );

          // If display text was provided, display it:
          if ( options.text ) {
            divText = document.createElement( "div" );

			divText.setAttribute('class', options.tclass);

            divText.innerHTML = options.text || "";

            options.anchor.insertBefore( divText, img );
          }
        }, false );

        img.src = options.src;

        options.toString = function() {
          var string = options.src || options._natives.manifest.options.src[ "default" ],
              match = string.replace( /.*\//g, "" );
          return match.length ? match : string;
        };
      },

      /**
       * @member image
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ) {
        options.anchor.style.display = "inline";
        if ( options.trackedContainer ) {
          options.trackedContainer.start();
        }
      },
      /**
       * @member image
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        options.anchor.style.display = "none";
        if ( options.trackedContainer ) {
          options.trackedContainer.stop();
        }
      },
      _teardown: function( options ) {
        if ( options.trackedContainer ) {
          options.trackedContainer.destroy();
        }
        else if ( options.anchor.parentNode ) {
          options.anchor.parentNode.removeChild( options.anchor );
        }
      }
  });
})( Popcorn );
