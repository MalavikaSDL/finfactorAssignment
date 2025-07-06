import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherQuote, setWeatherQuote] = useState('');

  const getWeatherQuote = (data) => {
    if (!data) return '';

    const temp = data.main.temp;
    const description = data.weather[0].description.toLowerCase();
    const windSpeed = data.wind.speed;

    if (temp > 30) {
      return "It's quite hot! Stay hydrated and find some shade.";
    } else if (temp < 10) {
      return "Bundle up! It's a bit chilly out there.";
    }

    if (description.includes('clear sky')) {
      return "A clear sky! Perfect weather to enjoy the outdoors.";
    } else if (description.includes('clouds')) {
      return "Looks like some clouds today. Still a good day!";
    } else if (description.includes('rain')) {
      return "Don't forget your umbrella! Rain is expected.";
    } else if (description.includes('snow')) {
      return "Snowing today! Be careful and enjoy the winter wonderland.";
    }

    if (windSpeed > 10) {
      return "It's a bit windy out there!";
    }

    return "Enjoy the weather!";
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setWeatherQuote(''); 

    try {
      const response = await axios.get(`http://localhost:3001/api/weather/current/${city}`);
      const data = response.data;
      setWeatherData(data);
      setWeatherQuote(getWeatherQuote(data)); 
    } catch (err) {
      setWeatherQuote(''); 
      if (err.response && err.response.status === 404) {
        setError(`City "${city}" not found.`);
      } else {
        setError(err.response?.data?.message || 'Error fetching weather data');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Weather Search</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setError(null); 
            setWeatherQuote(''); 
          }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {weatherData && (
        <div className="weather-info">
          <h2>{weatherData.name}, {weatherData.sys.country}</h2>
          <div className="weather-details">
            <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
            <p><strong>Feels like:</strong> {weatherData.main.feels_like}°C</p>
            <p><strong>Condition:</strong> {weatherData.weather[0].description}</p>
            <p><strong>Humidity:</strong> {weatherData.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weatherData.wind.speed} m/s</p>
            <p><strong>Pressure:</strong> {weatherData.main.pressure} hPa</p>
            {/* Displaying sunrise and sunset times - converting from Unix timestamp */}
            <p><strong>Sunrise:</strong> {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p><strong>Sunset:</strong> {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
            {/* Add more interesting attributes if available and relevant */}
            {weatherData.visibility && <p><strong>Visibility:</strong> {weatherData.visibility} meters</p>}
            {weatherData.clouds && weatherData.clouds.all !== undefined && <p><strong>Cloudiness:</strong> {weatherData.clouds.all}%</p>}
          </div>
        </div>
      )}

      {weatherData && weatherQuote && !error && <p className="weather-quote">{weatherQuote}</p>} {/* Display the quote only if weatherData exists, there's a quote, and no error */}

    </div>
  );
}

export default App;
