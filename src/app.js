var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');
var cardindex = 0;
var storyLimit = 25;
var Settings = require('settings');
var mycustomsubs = [];
var customsSet = false;
var valueSet = JSON.stringify(localStorage.getItem("customsubkey"));
if (valueSet.indexOf("title") > -1) {
  customsSet = true;
}


// Set a configurable with just the close callback
Settings.config(
  { url: 'http://www.rossjeffcoat.com/pebble/config-page.php' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    console.log(JSON.stringify(e.options));
    var myDataReturn = JSON.stringify(e.options);
    if(myDataReturn .indexOf("title") > -1) {
      console.log('received data - saving to storage');
    var myData = JSON.stringify(e.options);
    localStorage.setItem('customsubkey', myData);
    console.log(myData);
      }

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);


// Default subs if none entered
var subs = [
  {
    "title": "pebble"
  },
  {
    "title": "todayilearned"
  },  
  {
    "title": "news"
  },   
  {
    "title": "quotesporn"
  },     
  {
    "title": "jokes"
  },
  {
    "title": "Set your subscriptions in the app settings on your phone"
  }
];

// put configured subs into local storage
localStorage.setItem('myKey', JSON.stringify(subs));
var mySubs = localStorage.getItem('myKey');
mySubs = JSON.parse(mySubs);

// get the subs from the local storage
var getSubs = localStorage.getItem('customsubkey');
mycustomsubs = JSON.parse(getSubs);
console.log(getSubs);

if (customsSet) {
// Create the Menu with subs
var subsMenu = new UI.Menu({
  sections: [{
    title: 'Subreddits',
    items: mycustomsubs
  }]
});
}
else {
// Create the Menu with subs
var subsMenu = new UI.Menu({
  sections: [{
    title: 'Subreddits',
    items: subs
  }]
}); 
}


// splash screen with logo
var splashScreen = new UI.Window({ fullscreen: true });
var image = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  image: 'images/big_redd_logo.png'
});

splashScreen.add(image);
splashScreen.show();

setTimeout(function() {
  // Display the mainScreen
  subsMenu.show();
  // Hide the splashScreen to avoid showing it when the user press Back.
  splashScreen.hide();
}, 800);


if (customsSet) {
// Loading card when data is grabbed
var loadingCard = new UI.Card({
  title: 'LOADING DATA',
  subtitle: 'waiting on phone...'
});  
}
else {
// Alt loading card if no defaults are set 
var loadingCard = new UI.Card({
  title: 'SET YOUR SUBS IN APP SETTINGS'
});  
}


// Add a click listener for select button click
subsMenu.on('select', function(event) {

// loading screen
loadingCard.show();
cardindex = 0;

if (customsSet) {
  var mySub = mycustomsubs[event.itemIndex].title;
}
else {
  var mySub = subs[event.itemIndex].title;
}

  
  var URL = 'http://api.reddit.com/r/' + mySub + '/hot?limit=' + storyLimit; 
  
ajax({url: URL, type: 'json'},
function(json) {
var bodyText = json.data.children[cardindex].data.selftext;
  if(bodyText.length > 2) {
  // Show a card with clicked item details
  var detailCard = new UI.Card({
    title: json.data.children[cardindex].data.title,
    body: json.data.children[cardindex].data.selftext,
    scrollable: true,
    style: 'large'
  });
  }
  else {
  var detailCard = new UI.Card({
    title: json.data.children[cardindex].data.title,
    body:  " ",
    scrollable: true,
    style: 'large'
  });    
  }

  // Show the new Card
  loadingCard.hide();
  detailCard.show();

detailCard.on('click', function(e) {
  
  var bodyText = json.data.children[cardindex].data.selftext;
  
  loadingCard.show();
  if (cardindex < storyLimit )
    {
      cardindex++;
    }
  else {
    cardindex = 0;
  }
  
  if(bodyText.length > 2) {
  detailCard.title(json.data.children[cardindex].data.title);
  detailCard.body(json.data.children[cardindex].data.selftext);    
  }
  else {
  detailCard.title(json.data.children[cardindex].data.title);
  detailCard.body(" ");    
  }
  loadingCard.hide();
  detailCard.show();
});    
  
},
  function(error) {
    console.log('Ajax failed: ' + error);
  }
     
 );
});