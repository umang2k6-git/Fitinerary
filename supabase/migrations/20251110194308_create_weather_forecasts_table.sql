/*
  # Create Weather Forecasts Table

  1. New Tables
    - `weather_forecasts`
      - `id` (uuid, primary key) - Unique identifier for each weather forecast record
      - `location` (text) - City or destination name
      - `country` (text) - Country name
      - `latitude` (numeric) - Latitude coordinate for precise location
      - `longitude` (numeric) - Longitude coordinate for precise location
      - `forecast_date` (date) - The date for which the forecast is valid
      - `temperature_max` (numeric) - Maximum temperature in Celsius
      - `temperature_min` (numeric) - Minimum temperature in Celsius
      - `weather_condition` (text) - Main weather condition (e.g., Clear, Cloudy, Rainy)
      - `weather_description` (text) - Detailed weather description
      - `weather_icon` (text) - Weather icon code from API
      - `precipitation_probability` (numeric) - Chance of precipitation (0-100)
      - `humidity` (numeric) - Humidity percentage
      - `wind_speed` (numeric) - Wind speed in km/h
      - `forecast_data` (jsonb) - Full forecast data from API for future reference
      - `created_at` (timestamptz) - When this forecast was cached
      - `updated_at` (timestamptz) - Last time this forecast was updated

  2. Indexes
    - Index on location and forecast_date for quick lookups
    - Index on created_at for cache cleanup queries

  3. Security
    - Enable RLS on `weather_forecasts` table
    - Add policy for authenticated users to read weather forecasts
    - Add policy for service role to insert/update weather forecasts

  4. Notes
    - Weather forecasts are cached for 6 hours before being refreshed
    - Old forecasts (older than 7 days from today) are automatically cleaned up
    - This table serves both as a cache and historical weather data
*/

CREATE TABLE IF NOT EXISTS weather_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  country text NOT NULL,
  latitude numeric,
  longitude numeric,
  forecast_date date NOT NULL,
  temperature_max numeric,
  temperature_min numeric,
  weather_condition text,
  weather_description text,
  weather_icon text,
  precipitation_probability numeric DEFAULT 0,
  humidity numeric,
  wind_speed numeric,
  forecast_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_location_date 
  ON weather_forecasts(location, forecast_date);

CREATE INDEX IF NOT EXISTS idx_weather_forecasts_created_at 
  ON weather_forecasts(created_at);

-- Enable Row Level Security
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all weather forecasts
CREATE POLICY "Authenticated users can read weather forecasts"
  ON weather_forecasts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role can insert weather forecasts
CREATE POLICY "Service role can insert weather forecasts"
  ON weather_forecasts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can update weather forecasts
CREATE POLICY "Service role can update weather forecasts"
  ON weather_forecasts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Service role can delete old weather forecasts
CREATE POLICY "Service role can delete old weather forecasts"
  ON weather_forecasts
  FOR DELETE
  TO service_role
  USING (true);