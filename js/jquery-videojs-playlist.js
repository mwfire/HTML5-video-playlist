/*******************************************************************************
*
* project: 		HTML5 video playlist for videojs
* description:	create video playlist with preview for videojs
* author:		MWFire (Martin Wildfeuer), http://www.mwfire.de
* copyright:	(C) 2012 MWFire
* license:		http://www.gnu.org/licenses/gpl.html
*
* Requires:		jQuery / videojs
*
********************************************************************************
*
* ------------------------------------------------------------------------------
* Usage:
* ------------------------------------------------------------------------------
*
* // First Video will be initially shown, others are previews:
* var myvideojsplaylist = new $.videojsPlaylist();
*
* // video names without suffix
* myvideojsplaylist.initVideos( ['Movie1', 'Movie2', 'Movie3', 'Movie4'] );
*
* ------------------------------------------------------------------------------
* HTML structure:
* ------------------------------------------------------------------------------
*
* <div id="video_canvas">
*	<div id="video_wrapper"></div>
*    <div id="video_pane"></div>
* </div>
*
* ------------------------------------------------------------------------------
* Movie types and name declarations:
* ------------------------------------------------------------------------------
*
* You will need mp4, ogv, and webm versions of your movies.
* I recommend miro video converter http://www.mirovideoconverter.com/
* Keep your preview videos small
*
* main videos do not require special names, just make sure to put them in the
* video array.
* Your thumb has to be a jpg examed exactly like the corresponding movie, with
* a "_thumb" added to the name. Example: moviename_thumb.jpg
*
* Your poster needs to be a jpg with "_poster" at the end.
* Example: moviename_poster.jpg
*
* Preview videos must also be supplied in all web video formats, with a "_preview"
* added to the name. Example: moviename_preview.mp4
*
* That means you will have 8 (whoa!) files for each movie:
* 3 preview movies, 3 main movies, 1 thumbnail, and 1 poster image. 
*
* ------------------------------------------------------------------------------
* ToDo:
* ------------------------------------------------------------------------------
*
* - link to videojs events?
* - scrollbar option?
* - show poster when main video is finished
*
*******************************************************************************/


;(function($) {

    $.videojsPlaylist = function( options ) {

        var plugin = this;
		plugin.options = options;
		plugin.settings = {}

        // helper variables
		plugin.main_video;
		plugin.main_video_src;
		plugin.isiPhone 		=  _V_.isIPhone(); // from videojs
		plugin.playerTech;
		plugin.videos;
	
		// default settings
		plugin.settings = $.extend({
		
			// write HTML to DOM?
			write_tags 		:	true,
			// path to video files
			video_folder 	: 	"", 
			// div container of the main video
			video_div_id 	: 	"video_wrapper",
			// div container of the preview videos
			playlist_div_id : 	"video_pane",
			// main video width
			video_width 	: 	"740",
			// main video height
			video_height 	: 	"417",
			// should main video start on load?
			video_autoplay 	: 	false,
			// preview videos width
			preview_width 	: 	"220",
			// preview videos height
			preview_height 	: 	"139",
			// should preview videos preload?
			preview_preload : 	false,
			// should preview videos loop?
			preview_loop	: 	true,
			// volume of preview videos?
			preview_volume 	: 	0,
			// should preview video be replaced with current main video?
			preview_replace : 	true,
			// where to start with the preview video playlist.
			// set to 1 as main video (offset 0) is already main video
			preview_offset	:	1
		
		}, options);

		
		/********************************************************************************
		*
		* Private: bind hover and click action to preview video list element
		*
		********************************************************************************/
		
		var previewHoverBind = function(id, video) {
			$('#video_link_' + id).on('mouseenter', function() { $('#video_link_' + id).children('.preview_poster').stop().fadeOut('slow'); setTimeout(function() { video.play(); video.currentTime(0);  }, 500); });		
			$('#video_link_' + id).on('mouseleave', function() { $('#video_link_' + id).children('.preview_poster').fadeIn('fast'); video.pause(); });
			$('#video_link_' + id).on('click', function() { $('#video_link_' + id).children('.preview_poster').fadeIn('fast'); plugin.setVideo( plugin.videos[id], id) });
		}
		
		
		/********************************************************************************
		*
		* Private: write preview video HTML to chosen div
		*
		********************************************************************************/

		var writePreviewVideosToDOM = function() {

			var output = '<ul>';
			
			for( var k = plugin.settings.preview_offset; k< plugin.videos.length; k++ ) {	
				output += '<li id="video_link_' +  k + '" style="width:' + plugin.settings.preview_height + 'px; height:' + plugin.settings.preview_height +'px; cursor:pointer" >\
					<div class="preview_poster" style="height:' + plugin.settings.preview_height + 'px; width:' + plugin.settings.preview_width +'px;">\
						<img src="' + plugin.settings.video_folder + plugin.videos[k] + '_thumb.jpg" width="' + plugin.settings.preview_width + '" height="' + plugin.settings.preview_height + '">\
					</div>';
				
				if(!plugin.isiPhone && plugin.playerTech != "flash") { // No preview Vids for iPhone and Flash, sorry!
					output += '<div class="preview_video">\
							<video id="preview_vid_' + k + '" class="video-js"' + (( plugin.settings.preview_loop ) ? " loop " : " ")  +'preload="' + (( plugin.settings.preview_preload ) ? "auto" : "none")  +'" width="' + plugin.settings.preview_width + '" height="' + plugin.settings.preview_height + '" data-setup="{}">\
								<source src="' + plugin.settings.video_folder + plugin.videos[k] +'_preview.mp4" type="video/mp4" />\
								<source src="' + plugin.settings.video_folder + plugin.videos[k] +'_preview.theora.ogv" type="video/ogg" />\
								<source src="' + plugin.settings.video_folder + plugin.videos[k] +'.webm" type="video/webm" />\
							</video>\
						</div>';
				}
				
				output +='</li>';
			}
			
			output += '</ul>';
			
			$('#' + plugin.settings.playlist_div_id).append(output);
			
			initPreviewVideos();
			
		}
		
		
		/********************************************************************************
		*
		* Private: initialize videos for videojs and create the references
		*
		********************************************************************************/
		
		var initPreviewVideos = function() {
	
			if(!plugin.isiPhone && plugin.playerTech != "flash") { // No preview Vids for iPhone and Flash, sorry!
				// Init preview videos
				for( var k=plugin.settings.preview_offset; k< plugin.videos.length; k++ ) {	
					_V_('preview_vid_' + k).ready(function(){
						// Reference 
						plugin['preview_vid_' + k] = this;
						this.volume(plugin.settings.preview_volume);
						// Bind Hovers
						previewHoverBind( k, this );
					})		 	 
				}
			}
		}
		
		
		/********************************************************************************
		*
		* Private: write main video HTML to chosen div
		*
		********************************************************************************/

		var writeMainVideoToDOM = function() {
			
			// Write main video HTML
			var output = '<video id="main_video" class="video-js vjs-default-skin"' + (( plugin.settings.video_autoplay ) ? " autoplay " : " ")  + 'controls preload="none"  width="' + plugin.settings.video_width + '" height="' + plugin.settings.video_height + '" poster="' + plugin.settings.video_folder + plugin.videos[0] +'_poster.jpg" data-setup="{}">\
							<source src="' + plugin.settings.video_folder + plugin.videos[0] +'.mp4" type="video/mp4" />\
							<source src="' + plugin.settings.video_folder + plugin.videos[0] +'.theora.ogv" type="video/ogg" />\
							<source src="' + plugin.settings.video_folder + plugin.videos[0] +'.webm" type="video/webm" />\
						  </video>';
			$('#' + plugin.settings.video_div_id ).append(output);
			
			
			initMainVideo();
		}
		
		
		/********************************************************************************
		*
		* Private: initialize main video for videojs and create the reference "main_video"
		*
		********************************************************************************/
		
		var initMainVideo = function() {
			
			// Init main video
			_V_('main_video').ready(function(){
				
				// HTML5 or Flash fallback
				plugin.playerTech = this.techName;
				
				// Bind Hovers
				plugin.main_video = this;
				plugin.main_video_src = plugin.videos[0];
			})	
		}
		
		
		/********************************************************************************
		*
		* Public: set selected video; if preview_replace is set, the video/thumbs of
		* #preview_vid_x will be replaced, also onclick event 
		*
		********************************************************************************/
		
		plugin.setVideo = function(video_source, preview_replace_id) {
							
			var current_src = plugin.main_video_src; // store current source for binding
			
			if( plugin.settings.preview_replace ) {
				
				if(!plugin.isiPhone && plugin.playerTech != "flash") { // No preview Vids for iPhone and Flash, sorry!
					
					// Replace clicked preview with currently playing video
					plugin['preview_vid_' + preview_replace_id].src(
							{ type: "video/mp4", src: plugin.settings.video_folder + plugin.main_video_src + "_preview.mp4" },
							{ type: "video/ogg", src: plugin.settings.video_folder + plugin.main_video_src + "_preview.theora.ogv" },
							{ type: "video/webm", src: plugin.settings.video_folder + plugin.main_video_src + "_preview.webm" }
					);
				}
	
				// Replace preview thumbnail with new one
				$('#video_link_' + preview_replace_id).children('.preview_poster').children('img').attr('src', plugin.settings.video_folder + current_src + '_thumb.jpg');
				
				// Replace Preview link witch current one
				$('#video_link_' + preview_replace_id).unbind('click').on('click', function() { $('#video_link_' + preview_replace_id).children('.preview_poster').fadeIn('fast'); plugin.setVideo( current_src, preview_replace_id ); } );
		
			}
			
			// Replace main video src with new one			
			plugin.main_video.pause();
			plugin.main_video.triggerReady();
			plugin.main_video_src = video_source;
			plugin.main_video.src(plugin.settings.video_folder + video_source + '.mp4');
			plugin.main_video.load();
			console.log("main_video_src after: " + plugin.main_video_src);
			setTimeout(function() { plugin.main_video.play(); }, 500);
		}


		/********************************************************************************
		*
		* Public: this is where it begins: videos are stored and init/write
		* methods are called
		*
		********************************************************************************/
		
		plugin.initVideos = function(video_sources) {
			
			if(!$.isArray(video_sources) || $.isEmptyObject(video_sources)) {
				throw 'No valid video sources! ( jquery-videojs-playlist )';
			} else {
				plugin.videos = video_sources;
				
				if(plugin.settings.write_tags) {
					writeMainVideoToDOM();
					writePreviewVideosToDOM();
				} else {
					initMainVideo();
					initPreviewVideos();
				}
			}
		}

    }

})(jQuery);