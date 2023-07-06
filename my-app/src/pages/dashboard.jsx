
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Grid,
  Text,
  Image,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import { motion } from "framer-motion";

const WeatherApp = () => {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric"); // Default unit is metric (Celsius)

  useEffect(() => {
    if (weatherData) {
      // Convert temperature to Fahrenheit if the unit is imperial
      const temperature =
        unit === "imperial"
          ? convertToFahrenheit(weatherData.main.temp)
          : convertToCelsius(weatherData.main.temp);
      const updatedWeatherData = {
        ...weatherData,
        main: { ...weatherData.main, temp: temperature.toFixed(2) },
      };
      setWeatherData(updatedWeatherData);
      // Convert temperature to Fahrenheit if the unit is imperial
      const updatedForecastData = forecastData.map((data) => {
        const temperature =
          unit === "imperial"
            ? convertToFahrenheit(data.main.temp)
            : convertToCelsius(data.main.temp);
        return {
          ...data,
          main: { ...data.main, temp: temperature.toFixed(2) },
        };
      });

      setForecastData(updatedForecastData);
    }
  }, [unit]);

useEffect(() => {
  if (forecastData.length > 0) {
    // Filter forecast data to get one data point per day
    const filteredForecastData = forecastData.filter((data, index) => {
      return index % 8 === 0; // Retrieve data for every 8th index (corresponding to one day)
    });
    setForecastData(filteredForecastData);
  }
}, [unit]);

  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiKey = "2e32b4ee3cdcfb4fec331dc5373b40b9";
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${unit}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=${unit}&cnt=5`;

      const [currentWeatherResponse, forecastResponse] = await Promise.all([
        axios.get(currentWeatherUrl),
        axios.get(forecastUrl),
      ]);

      setWeatherData(currentWeatherResponse.data);
      setForecastData(forecastResponse.data.list);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch weather data. Please try again.");
      setLoading(false);
    }
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const convertToFahrenheit = (celsius) => {
    celsius = +celsius;
    return (celsius * 9) / 5 + 32;
  };

  const convertToCelsius = (fahrenheit) =>{
    fahrenheit = +fahrenheit;
    return ((fahrenheit - 32) * 5)/9;
  }

  return (
    <Box
      p={4}
      bg="linear-gradient(180deg, #FFD86F 0%, #FC6262 100%)"
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Heading
          textAlign="center"
          fontSize="3xl"
          color="white"
          mb={8}
          letterSpacing="tight"
        >
          Weather App
        </Heading>
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          p={8}
        >
          <form onSubmit={handleSubmit}>
            <FormControl id="location" mb={4}>
              <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                Enter city or ZIP code
              </FormLabel>
              <Input
                type="text"
                placeholder="E.g., New York, 10001"
                value={location}
                onChange={handleInputChange}
                bg="gray.100"
                _placeholder={{ color: "gray.400" }}
                _focus={{ outline: "none", boxShadow: "outline" }}
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
              />
            </FormControl>
            <Button
              type="submit"
              isLoading={loading}
              bgGradient="linear(to-r, #FFD86F, #FC6262)"
              color="white"
              _hover={{ bgGradient: "none", bg: "#FFD86F", color: "gray.800" }}
            >
              Get Weather
            </Button>
          </form>
          {error && (
            <Text color="red.500" mt={4} fontWeight="bold">
              {error}
            </Text>
          )}
          {weatherData && (
            <Box mt={8} textAlign="center">
              <Heading size="md" mb={2} color="gray.700">
                Current Weather
              </Heading>
              <Flex
                alignItems="center"
                justifyContent="center"
                bg="gray.200"
                borderRadius="md"
                p={4}
              >
                <Image
                  src={`https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                  alt="Weather Icon"
                  boxSize={12}
                  mr={4}
                />
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {weatherData.main.temp}°{unit === "metric" ? "C" : "F"}
                </Text>
                <Text fontSize="lg" color="gray.600" ml={4}>
                  {weatherData.weather[0].description}
                </Text>
              </Flex>
              <Grid
                templateColumns="repeat(3, 1fr)"
                gap={4}
                mt={8}
                color="gray.700"
              >
                <Box textAlign="center">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Humidity
                  </Text>
                  <Text>{weatherData.main.humidity}%</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Wind Speed
                  </Text>
                  <Text>{weatherData.wind.speed} m/s</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Pressure
                  </Text>
                  <Text>{weatherData.main.pressure} hPa</Text>
                </Box>
              </Grid>
            </Box>
          )}
          {forecastData.length > 0 && (
            <Box mt={8} textAlign="center">
              <Heading size="md" mb={2} color="gray.700">
                5-Day Forecast
              </Heading>
              <Grid templateColumns="repeat(5, 1fr)" gap={4} mt={4}>
                {forecastData.map((data) => (
                  <Box
                    key={data.dt}
                    p={2}
                    bg="gray.200"
                    borderRadius="md"
                    textAlign="center"
                  >
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
                      {new Date(data.dt * 1000).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </Text>
                    <Image
                      src={`https://openweathermap.org/img/w/${data.weather[0].icon}.png`}
                      alt="Weather Icon"
                      boxSize={8}
                      mx="auto"
                    />
                    <Text fontSize="sm" color="gray.600">
                      {data.weather[0].description}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" mt={2}>
                      {data.main.temp}°{unit === "metric" ? "C" : "F"}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}
          <Select
            mt={8}
            value={unit}
            onChange={handleUnitChange}
            bg="gray.100"
            _focus={{ outline: "none", boxShadow: "outline" }}
          >
            <option value="metric">Celsius</option>
            <option value="imperial">Fahrenheit</option>
          </Select>
        </Flex>
      </motion.div>
    </Box>
  );
};

export default WeatherApp;
