const apiKey = "f72ba97e436535027a0bb3071d32cf5b"; // Replace with your OpenWeatherMap API key
let isCelsius = true;

async function getWeather(city) {
  if (!city) city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a location!");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      alert("Location not found!");
      return;
    }

    displayWeather(data);

    // Save to history
    saveToHistory(data.name);

    // Show AQI
    getAirQuality(data.coord.lat, data.coord.lon);

    // Show 7-day forecast
    getForecast(data.coord.lat, data.coord.lon);

    // Show map
    document.getElementById("mapFrame").src =
      `https://www.openstreetmap.org/export/embed.html?bbox=${data.coord.lon-0.1}%2C${data.coord.lat-0.1}%2C${data.coord.lon+0.1}%2C${data.coord.lat+0.1}&layer=mapnik&marker=${data.coord.lat}%2C${data.coord.lon}`;

  } catch (error) {
    alert("Error fetching weather data!");
    console.error(error);
  }
}

function displayWeather(data) {
  document.getElementById("cityName").innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("dateTime").innerText = new Date().toLocaleString();
  document.getElementById("temperature").innerText = `🌡️ Temp: ${data.main.temp}°C`;
  document.getElementById("humidity").innerText = `💧 Humidity: ${data.main.humidity}%`;
  document.getElementById("description").innerText = `🌤️ ${data.weather[0].description}`;

  const condition = data.weather[0].main.toLowerCase();
  let tip = "";

  if (condition.includes("cloud")) {
    tip = "☁️ Cloudy skies ahead — might be a cozy day!";
    document.body.style.backgroundImage = "url('cloud.jpg')";
  } else if (condition.includes("rain")) {
    tip = "☔ Don't forget your umbrella, it's raining!";
    document.body.style.backgroundImage = "url('rainy.webp')";
  } else if (condition.includes("clear")) {
    tip = "☀️ Perfect sunny day — stay hydrated!";
    document.body.style.backgroundImage = "url('clear.jpeg')";
  } else if (condition.includes("snow")) {
    tip = "❄️ Snowy vibes! Stay warm and safe!";
    document.body.style.backgroundImage = "url('snow.jpeg')";
  } else if (condition.includes("thunderstorm")) {
    tip = "⚡ Stay indoors, thunderstorm outside!";
    document.body.style.backgroundImage = "url('thunder.jpeg')";
  } else if (condition.includes("mist") || condition.includes("fog")) {
    tip = "🌫️ Low visibility, drive safe!";
    document.body.style.backgroundImage = "url('mist.jpeg')";
  } else {
    tip = "🌍 Have a great day, no matter the weather!";
    document.body.style.backgroundImage = "url('fog.jpeg')";
  }

  document.getElementById("weatherTip").innerText = tip;
}

// 📍 Get weather using live location
function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      displayWeather(data);
      getForecast(lat, lon);
      getAirQuality(lat, lon);
    });
  } else {
    alert("Geolocation not supported by your browser.");
  }
}

// 🌡️ Toggle temperature units
function toggleTempUnit() {
  isCelsius = !isCelsius;
  const tempElem = document.getElementById("temperature");
  let temp = parseFloat(tempElem.innerText.split(": ")[1]);
  if (isCelsius) {
    temp = ((temp - 32) * 5) / 9;
    tempElem.innerText = `🌡️ Temp: ${temp.toFixed(1)}°C`;
  } else {
    temp = (temp * 9) / 5 + 32;
    tempElem.innerText = `🌡️ Temp: ${temp.toFixed(1)}°F`;
  }
}

// 📅 Get 7-day forecast
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  let forecastHTML = "";
  for (let i = 0; i < data.list.length; i += 8) { 
    const day = data.list[i];
    forecastHTML += `
      <div class="forecast-day">
        <p>${new Date(day.dt * 1000).toDateString()}</p>
        <p>🌡️ ${day.main.temp}°C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  }
  document.getElementById("forecastContainer").innerHTML = forecastHTML;
}

// 🌫️ Get Air Quality
async function getAirQuality(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  const aqiLevels = ["Good 😊", "Fair 🙂", "Moderate 😐", "Poor 😷", "Very Poor 😵"];
  document.getElementById("aqi").innerText = `🌬️ Air Quality: ${aqiLevels[data.list[0].main.aqi - 1]}`;
}

// ⭐ Save search history
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  if (!history.includes(city)) history.push(city);
  localStorage.setItem("history", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let listHTML = "";
  history.forEach(city => {
    listHTML += `<li onclick="getWeather('${city}')">${city}</li>`;
  });
  document.getElementById("historyList").innerHTML = listHTML;
}

window.onload = loadHistory;
