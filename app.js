let WEATHER_API_KEY = 'bc37c4c6e4e2fd9161be60e50b4ec6a6';
let GIPHY_API_KEY = 'uPDmIhxOnFGaxw5OyJte2lCjscc1pcAu&s';

const locationSearch = document.querySelector('#locationSearch');
const moodImg = document.querySelector('#moodImage');
let imgText = document.querySelector('#imgText');
let degrees = document.querySelector('.degrees');
let feelsLike = document.querySelector("#feels-like");
let wind = document.querySelector('#wind');
let humidity = document.querySelector('#humidity');
let weatherDescription = document.querySelector('#weatherDescription');
let locationText = document.querySelector('#locationText');

locationSearch.addEventListener('click', function() {
    loadingButton();
    if (validate() == true) {
        let locationAPIcall = determineWeatherAPICall();
        (async function () {
            const [weatherData, locationData, weatherError] = await getWeather(locationAPIcall);
            if (!weatherData) {
                moodImg.src = weatherError;
            }
            let gifSearch = setGiphySearchTerm(weatherData.weather[0].main);
            const [gifData, gifError] = await getGif(gifSearch);
            //render gif
            moodImg.src = (!gifData) ? gifError : gifData;
            imgText.textContent = `Randomized search for "${gifSearch}" from giphy.com`;
            //render all other data
            renderData(weatherData, locationData);
            normalButton();
        })();
    }
});

window.addEventListener('keypress', function(e) {
    if(e.keyCode == 13) {
        e.preventDefault();
        if (validate() == true) {
            loadingButton();
            console.log("enter was pressed");
            let locationAPIcall = determineWeatherAPICall();
            (async function () {
                const [weatherData, locationData, weatherError] = await getWeather(locationAPIcall);
                if (!weatherData) {
                    moodImg.src = weatherError;
                }
                let gifSearch = setGiphySearchTerm(weatherData.weather[0].main);
                const [gifData, gifError] = await getGif(gifSearch);
                //render gif
                moodImg.src = (!gifData) ? gifError : gifData;
                imgText.textContent = `Randomized search for "${gifSearch}" from giphy.com`;
                //render all other data
                renderData(weatherData, locationData);
                normalButton();
        })();
    }
    }
});

window.addEventListener('load', function() {
    loadingButton();
    let locationAPIcall = `https://api.openweathermap.org/geo/1.0/direct?q=Denver&appid=${WEATHER_API_KEY}`;
    (async function () {
        const [weatherData, locationData, weatherError] = await getWeather(locationAPIcall);
        if (!weatherData) {
            moodImg.src = weatherError;
        }
        let gifSearch = setGiphySearchTerm(weatherData.weather[0].main);
        const [gifData, gifError] = await getGif(gifSearch);
        //render gif
        moodImg.src = (!gifData) ? gifError : gifData;
        imgText.textContent = `Randomized search for "${gifSearch}" from giphy.com`;
        //render all other data
        renderData(weatherData, locationData);
        normalButton();
    })();
})

function renderData(weatherData, locationData) {
    degrees.textContent = Math.round(weatherData.main.temp);
    feelsLike.textContent = `Feels like: ${Math.round(weatherData.main.feels_like)}`;
    wind.textContent = `Wind: ${Math.round(weatherData.wind.speed)} MPH`;
    humidity.textContent = `Humidity: ${Math.round(weatherData.main.humidity)}%`;
    weatherDescription.textContent = weatherData.weather[0].description.toUpperCase();
    locationText.textContent = locationData.state ? `${locationData.name}, ${locationData.state}` : `${locationData.name} - ${locationData.zip}`;
}

function determineWeatherAPICall() {
    let searchText = document.querySelector('#location').value;
    let locationAPIcall = '';
    //if search is a zip code (begins with a number), call the zip api
    if (/^\d/.test(searchText)) {
        locationAPIcall = `https://api.openweathermap.org/geo/1.0/zip?zip=${searchText}&appid=${WEATHER_API_KEY}`
    }
    //otherwise call the location api
    else locationAPIcall = `https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${WEATHER_API_KEY}`;
    return locationAPIcall;
}

async function getWeather(locationAPIcall) {
    try {
        let locationResponse = await fetch(locationAPIcall, {mode: 'cors'});
        let json = await locationResponse.json();
        const lat = Array.isArray(json) ? json[0].lat : json.lat;
        const lon = Array.isArray(json) ? json[0].lon : json.lon;
        let locationData = Array.isArray(json) ? json[0] : json;
        let weatherAPIcall = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`;
        let weatherResponse = await fetch(weatherAPIcall, {mode: 'cors'});
        let weatherData = await weatherResponse.json();
        return [weatherData, locationData, null];
      } catch {
          return [null, null, 'error.jpg']
      }
}

async function getGif(term) {
    try {
        let fetchURL = `https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_API_KEY}=${term}&weirdness=10`;
        moodImg.src = '';
        let response = await fetch(fetchURL, {mode: 'cors'});
        let json = await response.json();
        return [json.data.images.original.url, null];
        }
      catch {
        return [null, "https://media.giphy.com/media/RIq4nU3TgUQztUhYRr/giphy.gif"]; 
      }   
};

function setGiphySearchTerm(weatherData) {
    console.log(typeof weatherData);
    let search = '';
    switch(weatherData) {
        case "Clear":
            search = 'sunny mood';
            break;
        case "Thunderstorm":
            search = 'thunderstorm';
            break;
        case "Drizzle":
            search = 'drizzle';
            break;
        case "Rain":
            search = 'rainy mood';
            break;
        case "Snow":
            search = 'snowstorm';
            break;
        case "Atmosphere":
            search = 'mist';
            break;
        case "Clouds":
            search = 'cloudy';
            break;
        default:
            search = '404';
            break;
    }
    console.log("search term is " + search);
    return search;
}

let buttonSpinner = document.querySelector('.loadingSpinner');

function loadingButton() {
   locationSearch.disabled = true;
   locationSearch.textContent = 'Loading...';
   buttonSpinner.classList.add('spinner-border', 'spinner-border-sm');
   buttonSpinner.role = 'status';
   buttonSpinner.ariaHidden = 'true'; 
}

function normalButton() {
    buttonSpinner.classList.remove('spinner-border', 'spinner-border-sm');
    buttonSpinner.role = 'status';
    buttonSpinner.ariaHidden = 'true';  
    locationSearch.disabled = false;
    locationSearch.textContent = 'Search';
}

function validate() {
    let searchText = document.querySelector('#location').value;
    let warningText = document.querySelector('.validation');
    if (!searchText || searchText.length < 3) {
        warningText.textContent = "Please enter valid city or zip";
        return false;
    }
    else {
        warningText.textContent = '';
        return true;
    }
}

