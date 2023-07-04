import "./style.css";
import logo from "./assets/images/logo.svg";
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
let systemChanger = document.querySelector("#systemChanger");

headerLogo.setAttribute("src", logo);
currentWeatherContainer.querySelector("h1").setAttribute("data-temp", "fahrenheit");
currentWeatherContainer.querySelector("h5").setAttribute("data-temp", "fahrenheit");


let weatherData;
let cityName;


//animations
gsap.from(header, { duration: 1, y: "-100%", ease: "bounce" });
gsap.from(".headerItem", { duration: 1, opacity: 0, delay: 1, stagger: .5 });




form.addEventListener("submit", async (e) => {
    e.preventDefault();
    cityName = search.value.trim();
    if (cityName.length === 0) {
        alert("Please enter the name of a city")
    } else {
        weatherData = await fetchWeatherData(cityName);
        createForecastItem(weatherData);
        displayWeatherData(weatherData, cityName);
    }
});

//changes temp displayed from cel to far and back
systemChanger.addEventListener("click", () => {
    convertTemperature();
});

//displays 3 day hourly forecast data for the specific chosen area in the correct timezone
function createForecastItem(weatherData) {
    forecastContainer.classList.remove("hidden");
    //clears the data from forecastContainer so it uses the data of the newly fetched weather data instead of only the data 
    //from the first area that was fetched
    forecastContainer.innerHTML = "";
  
    const targetTimeZone = weatherData.location.tz_id;
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
  
    weatherData.forecast.forecastday.forEach((forecastDay) => {
      forecastDay.hour.forEach((hourData) => {
        const timeEpoch = hourData.time_epoch * 1000;
        const date = new Date(timeEpoch);
        const time = new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "numeric",
          timeZone: targetTimeZone,
        }).format(date);
  
        if (date.getDate() === currentDate.getDate() && date.getHours() < currentHour) {
          return; // Skip past hours of the current day
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
    gsap.from(currentWeatherContainer, { x: "-100%", duration: 1, ease: "power2.out"});
    currentWeatherContainer.querySelector("h2").textContent = weatherData.location.name;
    currentWeatherContainer.querySelector("h4").textContent = weatherData.current.condition.text;
    currentWeatherContainer.querySelector("h1").textContent = weatherData.current.temp_f + degreeSymbol + "F";
    currentWeatherContainer.querySelector("h5").textContent = `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_f}${degreeSymbol}F   Lo:${weatherData.forecast.forecastday[0].day.mintemp_f}${degreeSymbol}F`;


    currentWeatherContainer.querySelector("h1").setAttribute("data-cel", weatherData.current.temp_c + degreeSymbol + "C");
    currentWeatherContainer.querySelector("h1").setAttribute("data-far", weatherData.current.temp_f + degreeSymbol + "F");


    currentWeatherContainer.querySelector("h5").setAttribute("data-cel", `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_c}${degreeSymbol}C   Lo:${weatherData.forecast.forecastday[0].day.mintemp_c}${degreeSymbol}C`);
    currentWeatherContainer.querySelector("h5").setAttribute("data-far", `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_f}${degreeSymbol}F   Lo:${weatherData.forecast.forecastday[0].day.mintemp_f}${degreeSymbol}F`);
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