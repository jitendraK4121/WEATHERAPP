import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Snowflake, Wind, Droplets, Thermometer, Search, CalendarDays, AlertCircle } from 'lucide-react';

// --- Reusable Components (included for simplicity) ---

const Input = ({ className = "", ...props }) => (
    <input
        type="text"
        className={`w-full bg-white/20 backdrop-blur-sm text-white placeholder-gray-200 border border-white/30 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 ${className}`}
        {...props}
    />
);

const Button = ({ children, className = '', disabled = false, ...props }) => (
    <button
        className={`bg-white/20 backdrop-blur-sm text-white font-bold p-3 rounded-full hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 flex items-center justify-center ${className}`}
        disabled={disabled}
        {...props}
    >
        {children}
    </button>
);


// --- Main Weather App Component ---

export const WeatherApp = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('day-clear');

    const API_KEY = import.meta.env.VITE_API_KEY;

    const fetchWeather = async (searchCity) => {
        if (!searchCity) return;
        setLoading(true);
        setError(null);
        setWeather(null); // Clear previous results

        try {
            const response = await fetch(`https://weather.indianapi.in/global/weather?location=${searchCity}&days=3`, {
                headers: { "x-api-key": API_KEY }
            });
            
            if (!response.ok) {
                let errorMessage = `Request failed with status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } 
                    else if (errorData && errorData.detail) {
                        errorMessage = JSON.stringify(errorData.detail);
                    }
                } catch (jsonError) {
                    console.error("Could not parse error JSON:", jsonError);
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            setWeather(data);
        } catch (err) {
            setError(err.message);
            setWeather(null);
        }
        setLoading(false);
    };
    
    useEffect(() => {
        if (!weather) {
            setTheme('day-clear');
            return;
        };
        const condition = weather.current.condition.toLowerCase();
        if (condition.includes('rain') || condition.includes('drizzle')) setTheme('rainy');
        else if (condition.includes('cloud') || condition.includes('overcast')) setTheme('cloudy');
        else if (condition.includes('snow') || condition.includes('sleet')) setTheme('snowy');
        else if (condition.includes('clear') || condition.includes('sunny')) setTheme('day-clear');
        else if (condition.includes('haze') || condition.includes('mist') || condition.includes('fog')) setTheme('hazy');
        else setTheme('day-clear');
    }, [weather]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWeather(city);
    };

    const getWeatherIcon = (condition, size = 80) => {
        const lowerCaseCondition = (condition || '').toLowerCase();
        if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) return <CloudRain size={size} className="text-white drop-shadow-lg" />;
        if (lowerCaseCondition.includes('snow') || lowerCaseCondition.includes('sleet')) return <Snowflake size={size} className="text-white drop-shadow-lg" />;
        if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('overcast')) return <Cloud size={size} className="text-white drop-shadow-lg" />;
        return <Sun size={size} className="text-white drop-shadow-lg" />;
    };

    const formatForecastDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const themeClasses = {
        'day-clear': 'from-sky-400 to-blue-600',
        'cloudy': 'from-slate-400 to-gray-600',
        'rainy': 'from-slate-600 to-gray-800',
        'snowy': 'from-sky-200 to-blue-300',
        'hazy': 'from-gray-400 to-gray-500',
    };

    return (
        <div className={`min-h-screen w-full font-sans bg-gradient-to-br ${themeClasses[theme]} text-white p-4 sm:p-6 lg:p-8 transition-all duration-1000 flex items-center justify-center`}>
            <main className="w-full max-w-lg mx-auto flex flex-col gap-6">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input placeholder="Search for a city..." value={city} onChange={(e) => setCity(e.target.value)} />
                    <Button type="submit" disabled={loading || !city}>
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search size={20} />}
                    </Button>
                </form>

                <div className="flex flex-col gap-6">
                    {/* Initial State */}
                    {!loading && !error && !weather && (
                        <div className="h-96 flex items-center justify-center text-center animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-semibold opacity-80">Welcome to Weatherly</h2>
                                <p className="opacity-60 mt-2">Enter a city to get the forecast.</p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                         <div className="h-96 flex items-center justify-center text-center animate-fade-in">
                            <div>
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
                                <p className="mt-4 opacity-80">Fetching forecast...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="h-96 flex items-center justify-center text-center bg-red-900/40 backdrop-blur-sm p-6 rounded-2xl animate-fade-in">
                            <div>
                                <AlertCircle size={40} className="mx-auto text-red-300 mb-4" />
                                <p className="font-bold text-lg text-red-200">Request Failed</p>
                                <p className="text-red-300 mt-2 text-sm capitalize">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {/* THE FIX: Added a check to ensure weather.forecast is a valid array before mapping */}
                    {weather && weather.forecast && Array.isArray(weather.forecast) && !error && (
                        <>
                            {/* Current Weather Card */}
                            <div className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center animate-fade-in-up">
                                <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">{weather.location}</h2>
                                <div className="my-4">{getWeatherIcon(weather.current.condition)}</div>
                                <p className="text-6xl sm:text-7xl font-light">{Math.round(weather.current.temperature)}°C</p>
                                <p className="text-xl capitalize mt-2 mb-6">{weather.current.condition}</p>
                                <div className="w-full grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex flex-col items-center gap-1"><Thermometer size={20} className="opacity-80" /><span className="font-semibold">{Math.round(weather.current.feels_like)}°C</span><span className="text-xs opacity-70">Feels like</span></div>
                                    <div className="flex flex-col items-center gap-1"><Droplets size={20} className="opacity-80" /><span className="font-semibold">{weather.current.humidity}%</span><span className="text-xs opacity-70">Humidity</span></div>
                                    <div className="flex flex-col items-center gap-1"><Wind size={20} className="opacity-80" /><span className="font-semibold">{weather.current.wind_speed} km/h</span><span className="text-xs opacity-70">Wind</span></div>
                                </div>
                            </div>
                            
                            {/* Forecast Section */}
                            <div className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                                <div className="flex items-center gap-2 mb-4 opacity-80">
                                    <CalendarDays size={20} />
                                    <h3 className="font-bold">3-Day Forecast</h3>
                                </div>
                                <div className="flex justify-between gap-2">
                                    {weather.forecast.map((day, index) => (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2 p-2 bg-white/10 rounded-lg" style={{animation: `fade-in-up 0.8s ease-out ${0.3 + index * 0.1}s forwards`, opacity: 0}}>
                                            <span className="font-bold text-sm">{formatForecastDate(day.date)}</span>
                                            {/* THE FIX: Safely access hourly data with optional chaining and provide a fallback */}
                                            {getWeatherIcon(day.hourly?.[12]?.condition || 'Partly cloudy', 32)}
                                            <span className="text-sm font-semibold">{Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
