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


function createForecastItem(weatherData) {
    for (let i = 0; i < weatherData.forecast.forecastday[0].hour.length; i++) {
        const time = new Date(weatherData.forecast.forecastday[0].hour[i].time_epoch * 1000).getHours();
        const condition = weatherData.forecast.forecastday[0].hour[i].chance_of_rain + "%";
        const icon = weatherData.forecast.forecastday[0].hour[i].condition.icon;
        const temperature = weatherData.forecast.forecastday[0].hour[i].temp_f;

        let forecastItem = document.createElement("div");
        let timeElement = document.createElement("p")
        let conditionElement = document.createElement("p");
        let iconElement = document.createElement("img");
        let temperatureElement = document.createElement("p");

        forecastContainer.appendChild(forecastItem);
        forecastItem.appendChild(timeElement);
        forecastItem.appendChild(conditionElement);
        forecastItem.appendChild(iconElement);
        forecastItem.appendChild(temperatureElement);

        timeElement.textContent = `${time}:00`;
        conditionElement.textContent = condition;
        conditionElement.style.color = "blue";
        iconElement.setAttribute("src", icon);
        temperatureElement.classList.add("forecastTemp");
        temperatureElement.textContent = `${temperature}${degreeSymbol}F`;
    }
}

function displayWeatherData(weatherData) {
    currentWeatherContainer.querySelector("h2").textContent = weatherData.location.name;
    currentWeatherContainer.querySelector("h4").textContent = weatherData.current.condition.text;
    currentWeatherContainer.querySelector("h1").textContent = weatherData.current.temp_f + degreeSymbol + "F";
    currentWeatherContainer.querySelector("h5").textContent = `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_f}${degreeSymbol}F   Lo:${weatherData.forecast.forecastday[0].day.mintemp_f}${degreeSymbol}F`;


    currentWeatherContainer.querySelector("h1").setAttribute("data-cel", weatherData.current.temp_c + degreeSymbol + "C");
    currentWeatherContainer.querySelector("h1").setAttribute("data-far", weatherData.current.temp_f + degreeSymbol + "F");


    currentWeatherContainer.querySelector("h5").setAttribute("data-cel", `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_c}${degreeSymbol}C   Lo:${weatherData.forecast.forecastday[0].day.mintemp_c}${degreeSymbol}C`);
    currentWeatherContainer.querySelector("h5").setAttribute("data-far", `Hi:${weatherData.forecast.forecastday[0].day.maxtemp_f}${degreeSymbol}F   Lo:${weatherData.forecast.forecastday[0].day.mintemp_f}${degreeSymbol}F`);


    document.querySelectorAll(".forecastTemp").forEach(temp => {
        temp.setAttribute("data-cel", weatherData.forecast.forecastday[0].hour[0].temp_c + degreeSymbol + "C");
        temp.setAttribute("data-far", weatherData.forecast.forecastday[0].hour[0].temp_f + degreeSymbol + "F");
    });
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