let weatherAPIKey = "ec88c6fc8b604936b91225404232706";

// gets weather data for the location that was entered by the user and verified to be a valid city
export async function fetchWeatherData(cityName) {
    try {
        let response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weatherAPIKey}&q=${cityName}&days=1&aqi=no&alerts=no`);
        let data = await response.json();
            console.log(data);
            return data;
    } catch(error) {
       console.error(`Error fetching weather data: ${error}`);
       return null;
    }
}   
