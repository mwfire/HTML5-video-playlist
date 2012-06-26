### HTML5 video playlist for videojs
#### Notes
This is, let's say, version 0.1 and therefore neither finished nor perfectly coded. I am getting into writing jQuery plugins and using git the first time, so this can be considered a test rather than a finished plugin. It is also somehow limited, as I intend to use this for a certain project. However, if you want to use this, feel free to do so.    
  
I appreciate any comment and advice!  
  
Thanks for listening  

#### Usage

	// First Video will be initially shown, others are previews:  
	var myvideojsplaylist = new $.videojsPlaylist();  
	  
	// video names without suffix  
	myvideojsplaylist.initVideos( ['Movie1', 'Movie2', 'Movie3', 'Movie4'] );

#### HTML structure (default)

    <div id="video_canvas">  
         <div id="video_wrapper"></div>    
         <div id="video_pane"></div>    
    </div>

#### Settings
	// write HTML to DOM?  
	write_tags 		:	true,  
	
	// path to video files  
	video_folder 	: 	"",  
		
	// div container of the main video  
	video_div_id 	: 	"video_wrapper",  
		
	// div container of the preview videos  
	playlist_div_id : 	"video_pane",  
		
	// main video width in px  
	video_width 	: 	"740",  
		
	// main video height in px  
	video_height 	: 	"417",  
		
	// should main video start on load?  
	video_autoplay 	: 	false,  
	
	// preview videos width in px  
	preview_width 	: 	"220",  
	  
	// preview videos height in px  
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

#### Movie types and name declarations

You will need mp4, ogv, and webm versions of your movies. I recommend miro video converter http://www.mirovideoconverter.com/  
Alse, keep your preview videos small.  
  
Main videos do not require special names, just make sure to put them in the video array.   
Your thumb has to be a jpg examed exactly like the corresponding movie, with a "_thumb" added to the name.  
Example: moviename_thumb.jpg  
  
Your poster needs to be a jpg with "_poster" at the end.  
Example: moviename_poster.jpg  
  
Preview videos must also be supplied in all web video formats, with a "_preview"  added to the name.  
Example: moviename_preview.mp4  

That means you will have 8 (whoa!) files for each movie: 3 preview movies, 3 main movies, 1 thumbnail, and 1 poster image. 