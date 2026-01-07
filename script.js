const API_KEY = "ed16349b4b2a44ce81d151320260701";

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("locationInput").value;
  if (city) fetchWeather(city);
});

window.addEventListener("load", autoDetectLocation);

// ---------------------- CORE FUNCTIONS ----------------------

function autoDetectLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      fetchWeather(`${latitude},${longitude}`);
    }
  );
}
function fetchWeather(query) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=7&alerts=yes`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error.message);
        return;
      }

      renderCurrentWeather(data);
      renderForecast(data.forecast.forecastday);
      renderAlerts(data.alerts);
    })
    .catch(err => {
      console.error(err);
      alert("Unable to fetch weather data");
    });
}

function renderCurrentWeather(data) {
  document.getElementById("currentWeather").classList.remove("hidden");

  document.getElementById("cityName").innerText = data.location.name;
  document.getElementById("conditionText").innerText = data.current.condition.text;

  document.getElementById("dayTemp").innerText =
    data.forecast.forecastday[0].day.maxtemp_c;

  document.getElementById("nightTemp").innerText =
    data.forecast.forecastday[0].day.mintemp_c;

  document.getElementById("weatherIcon").innerText =
    getWeatherIcon(data.current.condition.text);
}

function renderForecast(days) {
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";
  forecastEl.classList.remove("hidden");

  days.forEach(day => {
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `
      <span>${new Date(day.date).toLocaleDateString("en", { weekday: "short" })}</span>
      <span>${getWeatherIcon(day.day.condition.text)}</span>
      <span>${day.day.maxtemp_c}°</span>
      <span>${day.day.mintemp_c}°</span>
    `;
    forecastEl.appendChild(div);
  });
}

function renderAlerts(alerts) {
  const alertBox = document.getElementById("alertBox");

  if (alerts && alerts.alert.length > 0) {
    alertBox.classList.remove("hidden");
    alertBox.innerText = "⚠️ " + alerts.alert[0].headline;

    if (Notification.permission === "granted") {
      new Notification("Weather Alert", {
        body: alerts.alert[0].headline
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  } else {
    alertBox.classList.add("hidden");
  }
}

// ---------------------- ICON LOGIC ----------------------

function getWeatherIcon(condition) {
  const text = condition.toLowerCase();

  if (text.includes("sun")) return "☀️";
  if (text.includes("rain")) return "🌧";
  if (text.includes("snow")) return "❄️";
  if (text.includes("storm") || text.includes("thunder")) return "⛈";
  if (text.includes("cloud")) return "☁️";

  return "⛅";
}