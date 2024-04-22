
//! ==============> HTMLVARIABLES
const forecastContainer = document.querySelector(".forecast-cards")
const locationElement = document.querySelector(".location");
const searchInput = document.getElementById("searchInput");
const allClockBars = document.querySelectorAll(".clock");
const cityContainer = document.querySelector(".city-items");
const emptyBtn = document.querySelector(".empty");

//*  =============> APP VARIABLES
let citiesArr = JSON.parse(localStorage.getItem("cities")) || [];




//? ================> FUNCTIONS
async function getWeather(location = "london") {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=7a847fcc64d04e4fa9a190354231608&q=${location}&days=7`);
  if (response.status != 200) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Make sure you entered a valid city or Location',
    })
    searchInput.value = ""
    return
    }
  const data = await response.json();
    displayWeather(data);
  searchInput.value = "";
} 

function success(position) {
    const currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
    getWeather(currentLocation);
}

function displayWeather(data) {
    const dayes = data.forecast.forecastday;
    locationElement.innerHTML = `<span class="city-name">${data.location.name}</span>, ${data.location.country}`
    let cardsHTML = "";

    for (const [index, day] of dayes.entries()) {
        const date = new Date(day.date);
        const weekDay = date.toLocaleDateString("en-us", { weekday: "long" });

        cardsHTML += `
        <div class="${index == 0 ? "card active" : "card"}" data-index = ${index}>
        <div class="card-header">
          <div class="day">${weekDay}</div>
          <div class="time">${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes()} ${date.getHours() > 11 ? "Pm" : "Am"}</div>
        </div>
        <div class="card-body">
          <img src= "./images/conditions/${day.day.condition.text}.svg" />
          <div class="degree">${day.hour[date.getHours()].temp_c}°C</div>
        </div>
        <div class="card-data">
          <ul class="left-column">
            <li>Real Feel: <span class="real-feel">${day.hour[date.getHours()].feelslike_c}°C</span></li>
            <li>Wind: <span class="wind">${day.hour[date.getHours()].wind_kph}K/h</span></li>
            <li>Pressure: <span class="pressure">${day.hour[date.getHours()].pressure_mb}Mb</span></li>
            <li>Humidity: <span class="humidity">${day.hour[date.getHours()].humidity}%</span></li>
          </ul>
          <ul class="right-column">
            <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
            <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
          </ul>
        </div>
      </div>
      `
  }
  
  forecastContainer.innerHTML = cardsHTML;

  const allCards = document.querySelectorAll(".card");

  for (const card of allCards) {
    card.addEventListener("click", function (e) {
      const activeCard = document.querySelector(".card.active");
      activeCard.classList.remove("active");
      e.currentTarget.classList.add("active");
      ChanceOfRain(dayes[e.currentTarget.dataset.index]);
    })
  }


  let exist = citiesArr.find((currentCity) => currentCity.city == data.location.name);
  if (exist) return;
  citiesArr.push({ city: data.location.name, country: data.location.country });
  localStorage.setItem("cities", JSON.stringify(citiesArr));
  displayCityImg(data.location.name, data.location.country);
}

function ChanceOfRain(weatherInfo) {
  for (const bar of allClockBars) {
    const clock = bar.dataset.clock;
    const height = weatherInfo.hour[clock].chance_of_rain;
    bar.querySelector(".percent").style.height = `${height}%`;
  }
}

async function getCityImg(city) {
  const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`);
  const data = await response.json();
  const random = Math.trunc(Math.random() * data.results.length);
  return data.results[random];

}

async function displayCityImg(city , country) {
  const cityInfo = await getCityImg(city);
    let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${cityInfo.urls.regular}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>
`;
  cityContainer.innerHTML += itemContent;
  
}



//TODO  =============> EVENTS
window.addEventListener("load", function () {

    navigator.geolocation.getCurrentPosition(success);
   
  for (let i = 0; i < citiesArr.length; i++){
    displayCityImg(citiesArr[i].city, citiesArr[i].country);
  }
})

searchInput.addEventListener("blur", function () {
  getWeather(searchInput.value);
})

searchInput.addEventListener("keyup", function (e) {
  console.log(e.code)
  if (e.code == "Enter") {
    getWeather(searchInput.value);
  }
})


