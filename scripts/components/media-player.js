pakka.addBinder('bind-playbutton', function(el, prop, context) {
    return function(value) {
        // console.log(value);
        if (value === true) {
            pakka.removeClass(el, '_play');
            pakka.addClass(el, '_pause');
        } else {
            pakka.removeClass(el, '_pause');
            pakka.addClass(el, '_play');
        }
    }
});

pakka.addBinder('bind-showhide', function(el, prop, context) {
    return function(value) {
        if (value === true) {
            pakka.removeClass(el, 'hide');
            pakka.addClass(el, 'show');
        } else {
            pakka.removeClass(el, 'show');
            pakka.addClass(el, 'hide');
        }
    }
});




pakka.addBinder('bind-singers-formatted', function(el, prop, context) {
    return function(value) {
        el.innerHTML = _arrayToString(value);

    }
});



var nowPlayingComponent = pakka({
    name: 'now-playing-template',
    html: document.getElementById('now-playing-template').innerHTML,
    controller: function(context) {
        context.playNext = function(event) {
            var songsFound = {};
            pakka.each(musicPlayer.songsList(), song => {
                if (song.$get('songData').name === context.$get('songData').name &&
                    song.$get('songData').album === context.$get('songData').album) {
                    songsFound = song;
                    return;
                }
            });

            var currentIdx = musicPlayer.songsList().indexOf(songsFound);
            var nextIdx = 0;

            if (currentIdx > -1 && currentIdx < musicPlayer.songsList().length - 1) {
                nextIdx = currentIdx + 1;
            }
            musicPlayer.playThisSong(event, musicPlayer.songsList()[nextIdx]);
        }

        context.playPause = function(event) {
            // console.log(1);
            context.$set('isPlaying', !context.$get('isPlaying'));
        }

        context.playPrevous = function(event) {
            var songsFound = {};
            pakka.each(musicPlayer.songsList(), song => {
                if (song.$get('songData').name === context.$get('songData').name &&
                    song.$get('songData').album === context.$get('songData').album) {
                    songsFound = song;
                    return;
                }
            });

            var currentIdx = musicPlayer.songsList().indexOf(songsFound);
            var prevIdx = 0;

            if (currentIdx == 0) {
                prevIdx = musicPlayer.songsList().length - 1;
            } else {
                prevIdx = currentIdx - 1;
            }
            musicPlayer.playThisSong(event, musicPlayer.songsList()[prevIdx]);
        }
    }
});


// Making a component where all the songs will be displayed which is already added 
var songListItemComponent = pakka({
    name: 'song-list-item-component',
    html: document.getElementById('music-item-template').innerHTML,
    controller: function(context) {
        context.play = function(event) {
            musicPlayer.playThisSong(event, context);
        }

        context.edit = function(event) {
            pakka.addClass(document.getElementById("update-singer-modal"), "showmodal");
            app.$get("udpateSinger").$set("songIdx", musicPlayer.songsList().indexOf(context));
            app.$get("udpateSinger").$set("songData", context.$get('songData'));
            //app.$get("udpateSinger").$set("parentContext", context);
        }

        context.delete = function(event) {
            context.$destroy();
        }

        // show hide details 
        context.showHide = function(event) {
            // console.log('enter');
            context.$set('isHidden', !context.$get('isHidden'));

        }

        //load inner details
        setTimeout(function() {
            var songDetail = new songListItemDetailComponent();
            songDetail.$set("songData", context.$get('songData'));
            //songDetail.$set("singers", _arrayToString(context.$get('songData.singers')));
            context.$set('songDetail', songDetail);
        });

        context.$watch('songData', function(songData) {
            if (context != undefined && context.$get('songDetail') != undefined)
                context.$get('songDetail').$set('songData', songData);

        })
    }
});

var songListItemDetailComponent = pakka({
    name: 'song-list-item-component',
    html: document.getElementById('music-item-detail-template').innerHTML,
    controller: function(context) {

    }
});





// Static data
var initialSongData = [{
    name: "song 1",
    album: "album 1",
    singers: ["singer 1", "singer 2"]
}, {
    name: "song 2",
    album: "album 2",
    singers: ["singer 2", "singer 3"]
}, {
    name: "song 3",
    album: "album 1",
    singers: ["singer 3", "singer 4"]
}];


//::::::::: NEW SONG 
// Creating a new component as form 
var newSongComponent = pakka({
    name: 'new-song-component',
    html: '<div id="addNewSongModal" class="modal">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<span class="close" click-handle="closeModalBtn">&times;</span>' +
        '<h2>Add a song</h2>' +
        '</div>' +
        '<div class="modal-body text-center">' +
        '' +
        '<input class="form-control" type="text" placeholder="Enter song name" bind-property="songData.name" /><br />' +
        '<input class="form-control" type="text" placeholder="Enter album name" bind-property="songData.album" /> <br />' +
        '<input class="form-control" type="text" placeholder="Enter singer name" bind-property="songData.singers" />' +
        '<button click-handle="addSong" class="modal-song-btn">Add</button>' +
        '' +
        '</div>' +
        '</div>' +
        '</div>',
    controller: function(context) {
        event && event.preventDefault();
        context.addSong = function(event) {
            if (typeof(musicPlayer.newSong().$get('songData').name) !== 'undefined' && typeof(musicPlayer.newSong().$get('songData').album) !== 'undefined' && typeof(musicPlayer.newSong().$get('songData').singers) !== 'undefined') {
                var item = new songListItemComponent();
                //copy data from newComponent to songitem component
                item.$set('songData', Object.assign({}, musicPlayer.newSong().$get('songData')));
                musicPlayer.songsList().push(item);
                app.$set('songsList', musicPlayer.songsList());
                //  pakka.removeClass(document.getElementById("addNewSongModal"), "showmodal");

                pakka.addClass(document.getElementById("successModal"), "showmodal");
                setTimeout(function() {
                    pakka.removeClass(document.getElementById("successModal"), "showmodal");
                    pakka.removeClass(document.getElementById("addNewSongModal"), "showmodal");
                }, 2000);
            }
        }

        context.closeModalBtn = function(event) {
            pakka.removeClass(document.getElementById("addNewSongModal"), "showmodal");
            pakka.addClass(document.getElementById("addNewSongModal"), "hidemodal");
        }

    },
});

// Creating a new component as form
var updateSingerComponent = pakka({
    name: 'update-singer-component',
    html: document.getElementById('update-singer-template').innerHTML,
    controller: function(context) {
        // event.preventDefault();
        context.update = function(event) {
            pakka.apply(musicPlayer.songsList()[context.$get("songIdx")], 'songData', context.$get("songData"));
            pakka.addClass(document.getElementById("success-singer-Modal"), "showmodal");
            setTimeout(function() {
                pakka.removeClass(document.getElementById("success-singer-Modal"), "showmodal");
                pakka.removeClass(document.getElementById("update-singer-modal"), "showmodal");
            }, 2000);


        }

        context.closeUpdateSingerModal = function() {
            pakka.removeClass(document.getElementById("update-singer-modal"), "showmodal");
        }
    },
});




var musicPlayer = {
    nowPlaying: function() { return app.$get("now-playing") },
    songsList: function() { return app.$get("songsList") },
    newSong: function() { return app.$get("newSong") },
    playThisSong: function(event, context) {
        musicPlayer.nowPlaying().$set("songData", context.$get('songData'));
        musicPlayer.nowPlaying().$set("singers", _arrayToString(context.$get('songData.singers')));
        musicPlayer.nowPlaying().$set("isPlaying", true);
    }
};



app.showAddSongModal = function(event) {
    console.log('1');
    pakka.removeClass(document.getElementById("addNewSongModal"), "hidemodal");
    pakka.addClass(document.getElementById("addNewSongModal"), "showmodal");
}







function init() {
    // Looping through static data to bind text on song list component
    var songList = [];
    pakka.each(initialSongData, song => {
        var item = new songListItemComponent();
        item.$set("songData", song);
        songList.push(item);
    });

    app.$set("songsList", songList);
    app.$set("now-playing", new nowPlayingComponent());
    app.$set('newSong', new newSongComponent());
    app.$set('udpateSinger', new updateSingerComponent());
}
init();

_arrayToString = function arrayToString(value) {
    if (Array.isArray(value)) {
        return value.join();
    } else {
        return value;
    }
}
