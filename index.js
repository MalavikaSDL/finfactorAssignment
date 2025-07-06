require('dotenv').config();
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT || 3001;

const weatherCache = new NodeCache({ stdTTL: 600, maxKeys: 100 }); // Caching for 10 minutes, max 100 keys

// Middleware for parsing JSON bodies
app.use(express.json());

// Add CORS
const cors = require('cors');
app.use(cors());

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

app.get('/api/weather/current/:city', async (req, res) => {
  const city = req.params.city;
  const cacheKey = `weather:${city}`;
  const cachedData = weatherCache.get(cacheKey);

  if (cachedData) {
    console.log(`Cache hit for ${city}`);
    return res.json(cachedData);
  }

  console.log(`Cache miss for ${city}, fetching from API`);

  try {
    const response = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });


    const weatherData = response.data;
    weatherCache.set(cacheKey, weatherData);

    res.json(weatherData);
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error.message);
    if (error.response) {
      res.status(error.response.status).json({ message: error.response.data.message });
    } else if (error.request) {
      res.status(500).json({ message: 'No response received from weather API' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});


app.get('/', (req, res) => {
  res.send('Weather Backend Service');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});