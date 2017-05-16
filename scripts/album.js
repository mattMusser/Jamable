var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + songLength + '</td>'
    + '</tr>'
    ;

    var $row = $(template);

    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
            //Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            //Switch from Play -> Pause button to indicate new song is playing
            setSong(songNumber);
            //Play the currentSoundFile
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();

            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});

            $(this).html(pauseButtonTemplate);

            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()){
              //Revert the icon in the song row to the pause button
                $(this).html(pauseButtonTemplate);
              //Revert the icon in the player bar to the pause button
                $('.main-controls .play-pause').html(playerBarPauseButton);
              //Start plaing the song again
                currentSoundFile.play();
            } else {
                   $(this).html(pauseButtonTemplate);
                   $('.main-controls .play-pause').html(playerBarPlayButton);
                   currentSoundFile.pause();
            }
        }
    };

    var onHover = function(event) {

      var songNumberCell = $(this).find('.song-item-number');
      //var songNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
      var songNumber = parseInt(songNumberCell.attr('data-song-number'));

      if (songNumber !== currentlyPlayingSongNumber) {
          songNumberCell.html(playButtonTemplate);
      }
    };

    var offHover = function(event) {

        //var songNumberCell = $(this).find('.song-item-number');
         getSongNumberCell(currentlyPlayingSongNumber);

        var songNumberCell = $(this).find('.song-item-number');
         //var songNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }

        console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

// Assigns currentlyPlayingSongNumber and curretSongFromAlbum a new value based on the new song number.
var setSong = function(songNumber) {
    if (currentSoundFile) {
      currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });

    setVolume(currentVolume);
};
//Changes the current song's playback location.
var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);//Uses the Buzz settime() method to change the position in a song to a specified time
    }
}

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
}

var getSongNumberCell = function(number){
    // Return the song number element that corresponds to that song number
     //songNumberCell = $(this).find('.song-item-number');
     return $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
}


var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for(var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

//The Seek Bars
var updateSeekBarWhileSongPlays = function(){
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100; //Determines the percentage
    offsetXPercent = Math.max(0, offsetXPercent); //Make sure the percentage isn't less than zero
    offsetXPercent = Math.min(100, offsetXPercent); //Make sure the percentage doesn't exceed 100

    var percentageString = offsetXPercent + '%'; //Convert percentage to a string
    $seekBar.find('.fill').width(percentageString); //Set the width of the .fill class
    $seekBar.find('.thumb').css({left: percentageString}); //Set the left value of the .thumb class
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar'); //Find all elements with class of seek-bar within the element with a class of play-bar.

    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();

        var seekBarFillRatio = offsetX /barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio  * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }

        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var setCurrenttimeInPlayBar = function(currentTime) { // #1
    //Sets the text of the element with the .current-time class to the current time in the song

    //Add the method to updateSeekBarWhileSongPlays() so the current time updates with song playback
 };

 var setTotalTimeInPlayerBar = function(totalTime) { //#2
     //Sets the text of the element with the .total-time class to the length of the song.

     //Add the method to updatePlayerBarSong() so the total time is set when a song first plays.
 };

 var filterTimeCode = function(timeInSeconds) { //#3
     //Uses the parseFloat() method to get the seconds in number form

     //Store variables for whole seconds and whole minutes

     //Return time in the formate X:XX
 };

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Incrementing the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    //currentlyPlayingSongNumber = currentSongIndex + 1;
    //currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    setSong(currentSongIndex + 1)
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);

    $lastSongNumberCell.html(lastSongNumber);

};

var previousSong = function () {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Decrementing the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    //currentlyPlayingSongNumber = currentSongIndex + 1;
    //currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    // Update the Play Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var togglePlayFromPlayerbar = function() {
    var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    //If a song is paused and the play button is clicked in the player bar
    if (currentSoundFile.isPaused()) {
        //Change the song number cell from a play button to a pause button
        $currentlyPlayingCell.html(pauseButtonTemplate);
        //Change the HTML of the player bar's play button to a pause button
        $(this).html(playerBarPauseButton);
        //Play the song
        currentSoundFile.play();
        //If a song is playing (so a current sound file exists) and the pause button is clicked
    } else if (currentSoundFile) {
              //Change the song number cell from a pause button to a play button
              $currentlyPlayingCell.html(playButtonTemplate);
              //Change the HTML of the player bar's pause button to a play button
              $(this).html(playerBarPlayButton);
              //Pause the song
              currentSoundFile.pause();
     }
};


//Load the first album, Picasso, by default.
var currentAlbumIndex = 0;
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

//Store current song and album information.
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');
$(document).ready(function() {
    //setCurrentAlbum(albums[currentAlbumIndex]);
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerbar);
});
