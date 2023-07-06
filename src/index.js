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


// animations on load
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
        displayDailyData(weatherData);
});

// changes temp displayed from cel to far and back
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

    sunrise.textContent = removeLeadingZero(weatherData.forecast.forecastday[0].astro.sunrise);
    sunset.textContent = removeLeadingZero(weatherData.forecast.forecastday[0].astro.sunset);
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
        // convert current days temperature
        document.querySelectorAll("h1").forEach(temp => {
            temp.textContent = temp.getAttribute("data-cel");
            temp.setAttribute("data-temp", "celcius");
        });

        // convert current days hi and lo temperature
        document.querySelectorAll("h5").forEach(temp => {
            temp.textContent = temp.getAttribute("data-cel");
            temp.setAttribute("data-temp", "celcius");
        });

        // convert hourly forecast temperature values
        document.querySelectorAll(".forecastTemp").forEach(temp => {
            temp.textContent = temp.getAttribute("data-cel");
        });

        // convert daily avg temps values
        document.querySelectorAll(".avgtemp").forEach(temp => {
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

        document.querySelectorAll(".avgtemp").forEach(temp => {
            temp.textContent = temp.getAttribute("data-far");
            temp.setAttribute("data-temp", "fahrenheit")
        });
    }
}

// removes leading zero from sunrise and sunset temperature
function removeLeadingZero(timeString) {
    const [hours, minutes,] = timeString.split(':');
    const formattedHours = parseInt(hours, 10).toString();
    const formattedTime = `${formattedHours}:${minutes}`;

    return formattedTime;
}

// returns the current day name based on the provided date in the API data
let getDayNames = (weatherData) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNames = [];
    
    weatherData.forecast.forecastday.forEach(forecastDay => {
        const forecastDate = new Date(forecastDay.date);

        // returns a number associated with the day of the week
        // i.e. if the date is on a Tuesday it would return 2 
        // then pull the actual name of the day out of the array by
        // passing the value from getUTCDay() as the index
        const dayIndex = forecastDate.getUTCDay();
        dayNames.push(daysOfWeek[dayIndex]);
    });

    return dayNames;
}

let getRainDays = (weatherData) => {
    const rains = [weatherData.forecast.forecastday[0].day.daily_chance_of_rain + "%", weatherData.forecast.forecastday[1].day.daily_chance_of_rain + "%", weatherData.forecast.forecastday[2].day.daily_chance_of_rain + "%"];
    return rains;
}

let getHumidDays = (weatherData) => {
    const humidLevels = [weatherData.forecast.forecastday[0].day.avghumidity + "%", weatherData.forecast.forecastday[1].day.avghumidity + "%", weatherData.forecast.forecastday[2].day.avghumidity + "%"];
    return humidLevels;
}

let getAvgTempDaysF = (weatherData) => {
    const avgTempsF = [`${weatherData.forecast.forecastday[0].day.avgtemp_f}${degreeSymbol}F`, `${weatherData.forecast.forecastday[1].day.avgtemp_f}${degreeSymbol}F`, `${weatherData.forecast.forecastday[2].day.avgtemp_f}${degreeSymbol}F`];
    return avgTempsF;
}

let getAvgTempDaysC = (weatherData) => {
    const avgTempsC = [`${weatherData.forecast.forecastday[0].day.avgtemp_c}${degreeSymbol}C`, `${weatherData.forecast.forecastday[1].day.avgtemp_c}${degreeSymbol}C`, `${weatherData.forecast.forecastday[2].day.avgtemp_c}${degreeSymbol}C`];
    return avgTempsC;
}

let getDayConditions = (weatherData) => {
    const conditions = [weatherData.forecast.forecastday[0].day.condition.icon, weatherData.forecast.forecastday[1].day.condition.icon, weatherData.forecast.forecastday[2].day.condition.icon];
    return conditions;
}

function displayDailyData(weatherData) {
    document.querySelector("#dailyDetailsContainer").classList.remove("hidden");
    const dayNames = getDayNames(weatherData);
    const rainDays = getRainDays(weatherData);
    const humidDays = getHumidDays(weatherData);
    const tempDaysF = getAvgTempDaysF(weatherData);
    const tempDaysC = getAvgTempDaysC(weatherData);
    const conditionDays = getDayConditions(weatherData);
    const dayElements = document.querySelectorAll(".dayName");
    const rainElements = document.querySelectorAll(".rain");
    const humidElements = document.querySelectorAll(".humid");
    const avgTempElements = document.querySelectorAll(".avgtemp");
    const conditionElements = document.querySelectorAll(".condition");

    // sets data attributes on avgTemp elements so they can be converted to and from celcius later
    avgTempElements.forEach((avgTempElement, index) => {
        avgTempElement.setAttribute("data-temp", "fahrenheit");
        avgTempElement.setAttribute("data-cel", tempDaysC[index]);
        avgTempElement.setAttribute("data-far", tempDaysF[index]);
    });

    dayElements.forEach((dayElement, index) => {
        dayElement.textContent = dayNames[index];
    });

    rainElements.forEach((rainElement, index) => {
        rainElement.textContent = rainDays[index];
    });

    humidElements.forEach((humidElement, index) => {
        humidElement.textContent = humidDays[index];
    });

    avgTempElements.forEach((avgTempElement, index) => {
        avgTempElement.textContent = tempDaysF[index];
    });

    conditionElements.forEach((conditionElement, index) => {
        conditionElement.setAttribute("src", conditionDays[index]);
    });

    gsap.from(document.querySelector("#dailyDetailsContainer"), { duration: 1, opacity: 0, delay: 1 });
    gsap.from(document.querySelector("#dailyTitles"), { duration: 1, opacity: 0, delay: 1, stagger: .5 });
    gsap.from(document.querySelectorAll(".day"), { duration: 1, opacity: 0, delay: 1, stagger: .5 });
}