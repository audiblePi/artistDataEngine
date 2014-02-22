var input;
var name;
var myArtist;
var artistArray; //fb JSON array
var similarArtistArray = new Array();

/*************************
Artist Object Constructor
*************************/
function Artist(name)
{
    this.name=name;
    
    this.rocktstarStatus="empty";
    this.hotness="empty";
    this.hotSong="empty";
    this.discovery="empty";
    this.similarArtistsArray=similarArtistArray;
    this.likes="empty";
    this.location="empty";
    this.pic="empty";
    this.talkingAbout = "empty"//talking_about_count
    this.wereHereCount="empty";
    this.followers="empty";
    this.twitterHandle="empty";
    this.spotifyId="empty";
    this.spotifyTopTrackId="empty";
    this.spotifyPopularity="empty";
}//end currentArtist Object 

function startQuery() 
{
    var input = document.getElementById("input");
    var name = input.value;
    myArtist = new Artist(name);
    
    getEchoData(myArtist.name);
    findSimilarArtists();
    queryFb();   
    getSpotifyPopularity();
    clearContainer();
    showResults();
    
    calculateStarStatus("rs", myArtist.hotness);
    calculateStarStatus("fb", myArtist.likes);
    calculateStarStatus("sp", myArtist.spotifyPopularity);
}//end startQuery()




/**********************
Echonest API call that returns
    hotttness, 
    15 hotest songs array, 
    artist location
    discovery rating
    twitter handle
***********************/
function getEchoData(name)
{
    var apiKey = "H0EBFFIJHFKHYFA4X";
    var webServiceUrl = "http://developer.echonest.com/api/v4/artist/search?api_key=" + apiKey + "&name=" + name + "&bucket=hotttnesss&bucket=artist_location&bucket=songs&bucket=discovery&bucket=images&format=json";
    var data;  
    var artists;
    
    /*************************************************
    hotnes, hottest songs, location, discovery, images
    **************************************************/
    //window.alert(webServiceUrl);
    function query(webServiceUrl) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", webServiceUrl, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    data = JSON.parse(query(webServiceUrl));
    
    if (data.response.status.code == 0) 
        {
            artists = data.response.artists;
        }//end if()
    
    /**********************
    twitter handle
    ***********************/
    var webService2Url = "http://developer.echonest.com/api/v4/artist/twitter?api_key=" + apiKey + "&name=" + name + "&format=json";
    var data2;  
    var twitter;
    
    function query(webService2Url) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", webService2Url, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    data2 = JSON.parse(query(webService2Url));
    
    if (data2.response.status.code == 0 &&  data2.response.artist.twitter != null) 
        {
            myArtist.twitterHandle = "@" + data2.response.artist.twitter;
        }//end if()
        else
            myArtist.twitterHandle = "";

    //weed out empty json
    if (artists.length < 1)
    {
        var input = document.getElementById("input");
        input.value = "";
        input.placeholder = "Could not find artist";
        //clearResults();
        return false;
    }
    else
    {
        var location = document.getElementById("location");
        if (artists[0].artist_location.city != null)
            myArtist.location = artists[0].artist_location.city + ", " + artists[0].artist_location.region;
            else
                location.innerHTML= "???";

        //store data in object
        myArtist.name = artists[0].name;
        myArtist.hotness = artists[0].hotttnesss;
            myArtist.hotness = truncateDecimals(myArtist.hotness, 4);
        myArtist.hotSong = artists[0].songs[0].title;
        myArtist.discovery = artists[0].discovery;
            myArtist.discovery = truncateDecimals(myArtist.discovery, 4);
        return true;
    }
}//end getEchoData()

function findSimilarArtists(){
    var apiKey = "H0EBFFIJHFKHYFA4X";
    var webServiceUrl = "http://developer.echonest.com/api/v4/artist/similar?api_key=" + apiKey + "&name=" + myArtist.name + "&format=json";
    var data;  
    var similarArtists;
    
    /**********************
    15 similarArtists
    ***********************/
    function query(webServiceUrl) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", webServiceUrl, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    data = JSON.parse(query(webServiceUrl));
    
    if (data.response.status.code == 0) 
        {
            myArtist.similarArtistArray = data.response.artists;
        }//end if()
    
    if (myArtist.similarArtistArray.length < 1)
    {
        var input = document.getElementById("input");
        
        input.value = "";
        input.placeholder = "Could not find artist";
    }
}//endfindSimilarArtists()





/**********************
FB API FQL call that returns
    likes
    talking about count
***********************/
function queryFb()
{
    var id = "201647356689498";
    var secret = "20ebdcc025e0db5b6045a603684d2cea";
    var getAccessToken = "https://graph.facebook.com/oauth/access_token?client_id=" + id + "&client_secret=" + secret + "&grant_type=client_credentials";
    var token;
    var count;
    
    /**********************
    access token
    ***********************/
    function query(getAccessToken) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", getAccessToken, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    token = query(getAccessToken);
    
    /**********************
    facebook likes
    ***********************/
    var likeSearch = "https://graph.facebook.com/fql?q=SELECT name, fan_count FROM page WHERE name='" + myArtist.name + "' AND type='musician/band'&" + token;
    
    function search(likeSearch) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", likeSearch, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    count = JSON.parse(search(likeSearch));
       
    if (count.data.length > 0)      
        myArtist.likes = count.data[0].fan_count;
    else
        {
            myArtist.pic = "";
            return;
        }
    
    /**********************
    talking_about_count
    ***********************/
    var tbSearch = "https://graph.facebook.com/fql?q=SELECT name, talking_about_count FROM page WHERE name='" + myArtist.name + "' AND type='musician/band'&" + token;
    var talkingAbout;
    
    function search(tbSearch) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", tbSearch, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    talkingAbout = JSON.parse(search(tbSearch));
    myArtist.talkingAbout = talkingAbout.data[0].talking_about_count;
    
    /**********************
    pic url
    ***********************/
    var picSearch = "https://graph.facebook.com/fql?q=SELECT name, pic FROM page WHERE name='" + myArtist.name + "' AND type='musician/band'&" + token;
    var pic;
    
    function search(picSearch) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", picSearch, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    pic = JSON.parse(search(picSearch));
    myArtist.pic = pic.data[0].pic;
    
    /**********************
    we are here/ page visits
    ***********************/
    var pvSearch = "https://graph.facebook.com/fql?q=SELECT name, were_here_count FROM page WHERE name='" + myArtist.name + "' AND type='musician/band'&" + token;
    var pv;

    function search(pvSearch) 
            {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", pvSearch, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    pv = JSON.parse(search(pvSearch));
    myArtist.wereHereCount = pv.data[0].were_here_count;
}//end queryFb()





/**********************
twitter API FQL call that returns
    followers
***********************/
function getTwitterFollowers()
{
    var accessToken = "72133488-x3KFdFtdfUmn3DX5wzBFGfjZj2UbiVRmm0PWj2lMn";
    var accessSecret = "IwQEJkOOxPBKk2W6FpvEUoP3eIAPPW82AJuALYBQagT1T";
    var consumerKey = "gAgM6Yu62G4T6YJSTYwWOA";
    var consumerSecret = "2zSVaRIpgnYPFdG7Yr9e0HfuRe4Hl1Btv74uRVCyk";
    var webServiceUrl = "https://api.twitter.com/1.1/users/search.json?&count=3&page=1&q=" + myArtist.name + "&oauth_consumer_key=" + consumerKey + consumerSecret + "&oauth_nonce=ddfef0c06d2d1d22504a3cf0447cfb59&oauth_signature=ftwyFwPozLRHbWYERoS%2BMA4AWNM%3D&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1385704509&oauth_token=" + accessToken + accessSecret + "&oauth_version=1.0";
    var data;  
    var artists;
    
    function query(webServiceUrl) {
                var xmlHttp = null;
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", webServiceUrl, false );
                xmlHttp.send( null );
                return xmlHttp.responseText;
              }
    data = JSON.parse(query(webServiceUrl));
    
    if (data.response.status.code == 0) 
        {
            artists = data.response.artists;
        }//end if()
        else
            return;
}//getTwitterFolowers()





/**********************
spotify API call that returns
    popularity rating
***********************/
function getSpotifyPopularity()
{
    var spotifyUrl = "http://ws.spotify.com/search/1/artist.json?q=" + myArtist.name;
    var data;  
        
    function spotifySearch(url) 
        {
            var xmlHttp2 = null;
            xmlHttp2 = new XMLHttpRequest();
            xmlHttp2.open( "GET", url, false );
            xmlHttp2.send( null );
        
            return xmlHttp2.responseText;
        }
    
    data = JSON.parse(spotifySearch(spotifyUrl));
        
    if (data.info.num_results > 0) 
    {
        myArtist.spotifyPopularity = data.artists[0].popularity;
    }//end if()
    else
        return;
}//end searchSpotify()




function calculateStarStatus(code, input)
{
    var id = code + "Stars";
    var stars = document.getElementById(id);
    
    switch(code)
    {
        case "fb":
        {
            if (input == 0 )
                stars.src = "img/star0.png";
            else if (input < 200)
            {
                //hotness = 0;
                //window.alert(hotness);
                stars.src = "img/star1.png";
            }
                else if (input < 1000)
                {
                    //hotness = 1;
                    //window.alert(hotness);
                    stars.src = "img/star2.png";
                }
                    else if (input < 5000)
                    {
                        //hotness = 2;
                        //window.alert(hotness);
                        stars.src = "img/star3.png";
                    }
                        else if (input < 10000)
                        {
                            //hotness = 3;
                            //window.alert(hotness);
                            stars.src = "img/star4.png";
                        }
                            else if (input < 10000000000000)
                            {
                                //hotness = 4;
                                //window.alert(hotness);
                                stars.src = "img/star5.png";
                            }
                                else
                                {
                                    //window.alert("fb error");
                                }
            break;
        }
        default:
        {
            if(input == 0 )
                stars.src = "img/star0.png";
            else if (input < .200)
            {
                //hotness = 0;
                //window.alert(hotness);
                stars.src = "img/star1.png";
            }
                else if (input < .400)
                {
                    //hotness = 1;
                    //window.alert(hotness);
                    stars.src = "img/star2.png";
                }
                    else if (input < .600)
                    {
                        //hotness = 2;
                        //window.alert(hotness);
                        stars.src = "img/star3.png";
                    }
                        else if (input < .800)
                        {
                            //hotness = 3;
                            //window.alert(hotness);
                            stars.src = "img/star4.png";
                        }
                            else if (input < 1.000)
                            {
                                //hotness = 4;
                                //window.alert(hotness);
                                stars.src = "img/star5.png";
                            }
                                else
                                {
                                    //window.alert(input);
                                }
            break;
        }
    }//end switch
}//endCalculateStarStatus



function clearContainer()  
{
    var title = document.getElementById("title");
    title.setAttribute("style", "margin-top:30px");
}//end clearContainer()


function showResults()
{
    var pic = document.getElementById("pic");
    var artistNameContainer = document.getElementById("artistNameContainer");
    
    var location = document.getElementById("location");
    
    var rs = document.getElementById("rs");
    var rsLeft = document.getElementById("rsLeft");
    var rsRight = document.getElementById("rsRight");
    
    var fb = document.getElementById("fB");
    var fbLeft = document.getElementById("fbLeft");
    var fbRight = document.getElementById("fbRight");
    
    var twitter = document.getElementById("twitter");
    var twLeft = document.getElementById("twLeft");
    var twRight = document.getElementById("twRight");
    
    var socialUpdates = document.getElementById("socialUpdates");
    
    var spotify = document.getElementById("spotify");
    var spLeft = document.getElementById("spLeft");
    var spRight = document.getElementById("spRight");
    
    var spotifyPlayer = document.getElementById("spotifyPlayer");
    var footer = document.getElementById("footer");

    if (myArtist.pic != "empty")
        pic.innerHTML = "<img src='" + myArtist.pic + "' height='100' width='100'>";
    
    artistNameContainer.innerHTML = myArtist.name;
    location.innerHTML = myArtist.location;
    
    rs.setAttribute("class", "leftDataBox");
    rsLeft.setAttribute("class", "leftDetailBox");
    rsRight.setAttribute("class", "rightDetailBox");
    rsLeft.innerHTML = "<b>echnoNest</b><br>.           current hotttnesss: " + myArtist.hotness + "<br>.           discovery rating: " + myArtist.discovery;
    rsRight.innerHTML = "<img id='rsStars' src='img/star0.png' width='100'>";
    
    fb.setAttribute("class", "leftDataBox");
    fbLeft.setAttribute("class", "leftDetailBox");
    fbRight.setAttribute("class", "rightDetailBox");
    fbLeft.innerHTML = "<b>faceBook</b><br>.           page likes: " + myArtist.likes + "<br>.           talking about: " + myArtist.talkingAbout;
    fbRight.innerHTML = "<img id='fbStars' src='img/star0.png' width='100'>";
    
    spotify.setAttribute("class", "rightDataBox");
    spLeft.setAttribute("class", "leftDetailBox");
    spRight.setAttribute("class", "rightDetailBox");
    spLeft.innerHTML = "<b>spotify</b><br>.           popularity: " + myArtist.spotifyPopularity;
    spRight.innerHTML = "<img id='spStars' src='img/star0.png' width='100'>";
    
    socialUpdates.setAttribute("class", "leftDataBox");

    buildRecommendations();
}//end showResults()


function buildRecommendations()  
{
    var recommendation = document.getElementById("recommendationContainer");
    var htmlString = "Related Artists:<br>";
    
    for(var i=0; i<3; i++)
    {
        if (i==2)
        htmlString = htmlString + myArtist.similarArtistArray[i].name;
        else
            htmlString = htmlString + myArtist.similarArtistArray[i].name + ", ";
    }
    recommendation.innerHTML = htmlString;
}//end buildRecommendation()



/******************
helper function
******************/
function truncateDecimals (num, digits) 
{
  var numS = num.toString(),
      decPos = numS.indexOf('.'),
      result = numS.substr(0, 1+decPos + digits);

  return parseFloat(result);
}//end truncateDecimals()


function start() 
{
} // end function start()

window.addEventListener("load", start, false);