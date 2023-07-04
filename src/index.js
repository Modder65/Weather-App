import "./style.css";
import logo from "./assets/images/logo.svg";
import githubLogo from "./assets/images/github.svg";
import { fetchWeatherData } from "./data.js";
import { gsap } from "gsap";

let degreeSymbol = "\u00B0"
let header = document.querySelector("header");
let headerLogo = header.querySelector("img");
let form = header.querySelector("form");
let search = document.querySelector("input");
let content = document.querySelector("#contentContainer");
let currentWeatherContainer = document.querySelector("#currentWeatherContainer");
let forecastContainer = document.querySelector("#forecastContainer");
let weatherDetails = document.querySelector("#weatherDetails");
let systemChanger = document.querySelector("#systemChanger");
let footer = document.querySelector("footer");

headerLogo.setAttribute("src", logo);
footer.querySelector("Img").setAttribute("src", githubLogo);
currentWeatherContainer.querySelector("h1").setAttribute("data-temp", "fahrenheit");
currentWeatherContainer.querySelector("h5").setAttribute("data-temp", "fahrenheit");


let weatherData;
let cityName;


//animations
gsap.from(header, { duration: 1, y: "-100%", ease: "bounce" });
gsap.from(".headerItem", { duration: 1, opacity: 0, delay: 1, stagger: .5 });
gsap.from(footer, { duration: 1, y: "100%", ease: "bounce" });
gsap.from("#footerContent", { duration: 1, opacity: 0, delay: 1, stagger: .5 });



form.addEventListener("submit", async (e) => {
    e.preventDefault();
    cityName = search.value.trim();
   
        weatherData = await fetchWeatherData(cityName);
        displayForecastData(weatherData);
        displayWeatherData(weatherData, cityName);
        displayExtraDetails(weatherData);
    
});

//changes temp displayed from cel to far and back
systemChanger.addEventListener("click", () => {
    convertTemperature();
});

// displays 3 day hourly forecast data for the specific chosen area in the correct timezone
function displayForecastData(weatherData) {
    forecastContainer.classList.remove("hidden");
    // clears the data from forecastContainer so it uses the data of the newly fetched weather data instead of only the data 
    // from the first area that was fetched
    forecastContainer.innerHTML = "";
  
    const targetTimeZone = weatherData.location.tz_id;
    console.log(targetTimeZone);
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
  
    // Loop through each forecast day
    weatherData.forecast.forecastday.forEach((forecastDay) => {
      // Loop through the hours in the forecast day
      forecastDay.hour.forEach((hourData) => {
        const timeEpoch = hourData.time_epoch * 1000;
        const date = new Date(timeEpoch);
        const time = new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "numeric",
          timeZone: targetTimeZone,
        }).format(date);
  
        // skips past previous hours of the current day
        if (date.getDate() === currentDate.getDate() && date.getHours() < currentHour) {
          return; 
        }
  
        const condition = hourData.chance_of_rain + "%";
        const icon = hourData.condition.icon;
        const temperature = hourData.temp_f;
  
        const forecastItem = document.createElement("div");
        forecastItem.innerHTML = `
          <p>${time}</p>
          <p style="color: blue;">${condition}</p>
          <img src="${icon}" alt="Weather Icon">
          <p class="forecastTemp" data-cel="${hourData.temp_c}${degreeSymbol}C" data-far="${temperature}${degreeSymbol}F">${temperature}${degreeSymbol}F</p>
        `;
  
        forecastContainer.appendChild(forecastItem);
      });
    });
  
    gsap.from(forecastContainer, { x: "100%", duration: 1.5, ease: "power2.out" });
  }
  

function displayWeatherData(weatherData) {
    currentWeatherContainer.classList.remove("hidden")
    
    currentWeatherContainer.querySelector("h2").textContent = weatherData.location.name;
    currentWeatherContainer.querySelector("h4").textContent = weatherData.current.condition.text;
    currentWeatherContainer.querySelector("h1").textContent = weatherData.current.temp_f + degreeSymbol + "F";
    currentWeatherContainer.querySelector("h5").textContent = `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_f}${degreeSymbol}F   Lo:${weatherData.forecast.forecastday[0].day.mintemp_f}${degreeSymbol}F`;


    currentWeatherContainer.querySelector("h1").setAttribute("data-cel", weatherData.current.temp_c + degreeSymbol + "C");
    currentWeatherContainer.querySelector("h1").setAttribute("data-far", weatherData.current.temp_f + degreeSymbol + "F");


    currentWeatherContainer.querySelector("h5").setAttribute("data-cel", `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_c}${degreeSymbol}C   Lo:${weatherData.forecast.forecastday[0].day.mintemp_c}${degreeSymbol}C`);
    currentWeatherContainer.querySelector("h5").setAttribute("data-far", `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_f}${degreeSymbol}F   Lo:${weatherData.forecast.forecastday[0].day.mintemp_f}${degreeSymbol}F`);

    gsap.from(currentWeatherContainer, { x: "-100%", duration: 1.5, ease: "power2.out"});
}

function displayExtraDetails(weatherData) {
    weatherDetails.classList.remove("hidden");

    let sunrise = document.querySelector(".sunrise");
    let sunset = document.querySelector(".sunset");
    let chanceOfRain = document.querySelector(".rainchance");
    let humidity = document.querySelector(".humidity");
    let wind = document.querySelector(".wind");
    let feelsLike = document.querySelector(".feelslike");
    let precip = document.querySelector(".precip");
    let pressure = document.querySelector(".pressure");
    let visibility = document.querySelector(".visibility");
    let uvIndex = document.querySelector(".uv-index");
    sunrise.textContent = weatherData.forecast.forecastday[0].astro.sunrise;
    sunset.textContent = weatherData.forecast.forecastday[0].astro.sunset;
    chanceOfRain.textContent = weatherData.forecast.forecastday[0].day.daily_chance_of_rain + "%";
    humidity.textContent =  weatherData.current.humidity + "%";
    wind.textContent = `${weatherData.current.wind_dir} ${weatherData.current.wind_mph} mph`;
    feelsLike.setAttribute("data-cel", `${weatherData.current.feelslike_c}${degreeSymbol}C`);
    feelsLike.setAttribute("data-far", `${weatherData.current.feelslike_f}${degreeSymbol}F`)
    feelsLike.textContent = `${weatherData.current.feelslike_f}${degreeSymbol}F`;
    precip.textContent = `${weatherData.forecast.forecastday[0].day.totalprecip_in} in`;
    pressure.textContent = `${weatherData.current.pressure_in} in`;
    visibility.textContent = `${weatherData.forecast.forecastday[0].day.avgvis_miles} mi`;
    uvIndex.textContent = `${weatherData.forecast.forecastday[0].day.uv}`;

    let windowHeight = window.innerHeight;
    gsap.from(weatherDetails, { y: windowHeight, duration: 1.5, ease: "power2.out" });
}

function convertTemperature() {
    if (currentWeatherContainer.querySelector("h1").getAttribute("data-temp") === "fahrenheit") {
        //convert current days temperature
        document.querySelectorAll("h1").forEach(temp => {
            temp.textContent = temp.getAttribute("data-cel");
            temp.setAttribute("data-temp", "celcius");
        });

        //convert current days hi and lo temperature
        document.querySelectorAll("h5").forEach(temp => {
            temp.textContent = temp.getAttribute("data-cel");
            temp.setAttribute("data-temp", "celcius");
        });

        //convert hourly forecast temperature values
        document.querySelectorAll(".forecastTemp").forEach(temp => {
            temp.textContent = temp.getAttribute("data-cel");
        });
    } else {
        document.querySelectorAll("h1").forEach(temp => {
            temp.textContent = temp.getAttribute("data-far");
            temp.setAttribute("data-temp", "fahrenheit");
        });

        document.querySelectorAll("h5").forEach(temp => {
            temp.textContent = temp.getAttribute("data-far");
            temp.setAttribute("data-temp", "fahrenheit");
        });

        document.querySelectorAll(".forecastTemp").forEach(temp => {
            temp.textContent = temp.getAttribute("data-far");
            temp.setAttribute("data-temp", "fahrenheit")
        });
    }
}