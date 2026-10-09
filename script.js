// ========================================== //
// 🌦️ WEATHER INTELLIGENCE TERMINAL GLOBAL HOIST//
// ========================================== //

// High-Performance global simulation trackers hoisted above early execution scopes
let animationFrameId = null;
let particlesArray = [];
let activeMarker = null;

// Private activation credentials key token assigned by OpenWeather standard configurations
const apiKey = "bf723626604b51731d9854b253ff4a43";

/**
 * Asynchronous function wrapper created to parse operational remote endpoint urls
 * @param {String} city - Text content value node submitted inside form fields
 */
async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error("Target Meteorological Station Not Found Or City Offline");
        const data = await response.json();
        
        updateUI(data);
        getExtendedForecast(data.coord.lat, data.coord.lon);
        getAirQuality(data.coord.lat, data.coord.lon);

        if (data.coord) {
            map.flyTo([data.coord.lat, data.coord.lon], 11, {
                animate: true,
                duration: 2.2
            });
            placeMapMarker(data.coord.lat, data.coord.lon, data.name, Math.round(data.main.temp));
            if (data.weather && data.weather[0]) {
                triggerDynamicWeatherAnimation(data.weather[0].main);
            }
        }
    } catch (error) {
        console.error("Operational data acquisition stream crashes:", error.message);
        alert(error.message);
    }
}

/**
 * Weather Lookup processing utilizing explicit geospatial coordinates mappings arrays
 */
async function getWeatherByCoords(lat, lon, locationName = null) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error("Failed to synchronize coordinates metrics maps signatures arrays");
        const data = await response.json();
        
        const displayName = locationName ? locationName : data.name;
        data.name = displayName;
        
        updateUI(data);
        getExtendedForecast(lat, lon);
        getAirQuality(lat, lon);

        map.flyTo([lat, lon], 12, { animate: true, duration: 2.2 });
        placeMapMarker(lat, lon, displayName, Math.round(data.main.temp));
        if (data.weather && data.weather[0]) {
            triggerDynamicWeatherAnimation(data.weather[0].main);
        }
    } catch (error) {
        console.error("Location weather lookup failed:", error.message);
        alert(error.message);
    }
}

/**
 * Fetches 5-day daily forecast aggregates (Filtered to 1 clean instance per 24 hours segment loop)
 */
async function getExtendedForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) return;
        const data = await response.json();

        const forecastContainer = document.getElementById("forecastContainer");
        if (!forecastContainer) return;
        forecastContainer.innerHTML = "";

        const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

        dailyData.forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            const temp = Math.round(day.main.temp);
            const icon = day.weather[0].icon;

            const card = document.createElement("div");
            card.className = "flex-1 bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center flex flex-col items-center justify-center min-w-[65px] h-full shadow-lg hover:border-blue-500/40 transition transform hover:scale-102";
            card.innerHTML = `
                <p class="text-[9px] font-bold uppercase text-blue-300 tracking-wider">${date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" class="w-7 h-7 my-0.5" alt="Forecast Status">
                <p class="text-xs font-extrabold text-white">${temp}°C</p>
                <p class="text-[7px] font-medium text-slate-400 capitalize truncate max-w-full">${day.weather[0].description}</p>
            `;
            forecastContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Forecast Error:", err.message);
    }
}

/**
 * Air Quality Index Pollution Layer Processor Evaluator
 */
async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (!response.ok) return;
        const data = await response.json();
        
        const aqiElement = document.getElementById("aqiDisplay");
        if (!aqiElement) return;

        const aqiLevel = data.list[0].main.aqi; 
        const aqiMap = {
            1: { text: "Good 🟢", color: "text-green-400" },
            2: { text: "Fair 🟡", color: "text-yellow-400" },
            3: { text: "Moderate 🟠", color: "text-orange-400" },
            4: { text: "Poor 🔴", color: "text-red-400" },
            5: { text: "Hazardous 🟪", color: "text-purple-400 animate-pulse" }
        };

        aqiElement.innerHTML = `AQI: <span class="${aqiMap[aqiLevel].color} font-bold">${aqiMap[aqiLevel].text}</span>`;
    } catch (err) {
        console.error("Air evaluation grids connection failure:", err.message);
    }
}

/**
 * Parses and maps valid responsive data trees into interface DOM containers
 */
function updateUI(data) {
    const tempElement = document.getElementById("temp");
    const cityElement = document.getElementById("cityName");
    const descElement = document.getElementById("description");
    const humidityElement = document.getElementById("humidity");
    const windElement = document.getElementById("windSpeed");
    const iconElement = document.getElementById("weatherIcon");
    const displayWidget = document.getElementById("weatherDisplay");
    const weatherCard = document.getElementById("weatherCard");

    if (tempElement) tempElement.innerText = `${Math.round(data.main.temp)} °C`;
    if (cityElement) cityElement.innerText = data.name.toUpperCase();
    
    if (descElement && data.weather && data.weather[0]) descElement.innerText = data.weather[0].description;
    if (humidityElement) humidityElement.innerText = `${data.main.humidity}%`;
    if (windElement) windElement.innerText = `${Math.round(data.wind.speed * 3.6)} km/h`;

    if (iconElement && data.weather && data.weather[0] && data.weather[0].icon) {
        iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        iconElement.classList.remove("hidden");
    }

    if (displayWidget) displayWidget.classList.remove("hidden");
    if (weatherCard) {
        weatherCard.classList.remove("hidden");
        weatherCard.classList.add("flex");
    }
}

function placeMapMarker(lat, lon, title, temp) {
    if (activeMarker) map.removeLayer(activeMarker); 
    activeMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<div class="text-slate-900 font-sans font-bold text-xs text-center"><b>${title.toUpperCase()}</b><br><span class="text-blue-600">${temp}°C</span></div>`)
        .openPopup();
}

// ========================================== //
// 🗺️ LEAFLET SYSTEM INTERACTIVE MAP SECTION   //
// ========================================== //

const map = L.map('map', {
    center: [20.5937, 78.9629], 
    zoom: 5,
    zoomControl: false
});

L.control.zoom({ position: 'bottomleft' }).addTo(map);

const speedOptions = {
    keepBuffer: 6,       
    updateWhenIdle: true, 
    maxZoom: 20
};

const standardMap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { ...speedOptions, attribution: '&copy; Google Maps' }).addTo(map);
const satelliteMap = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { ...speedOptions, attribution: '&copy; Google Satellite' });
const terrainMap = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', { ...speedOptions, attribution: '&copy; Google Terrain' });

const cloudLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.45 });
const rainLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.55 });

const baseMaps = { 
    "Standard View": standardMap, 
    "Satellite Orbit": satelliteMap, 
    "Terrain Elevation": terrainMap 
};
const overlayMaps = { 
    "Live Clouds Radar": cloudLayer, 
    "Live Rain Radar": rainLayer 
};

L.control.layers(baseMaps, overlayMaps, { position: 'bottomright', collapsed: false }).addTo(map);

map.on("click", (e) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng; 

    L.popup()
        .setLatLng([lat, lon])
        .setContent(`<div class="p-1 text-center font-sans flex flex-col gap-1 items-center pointer-events-auto"><span class="text-[10px] text-slate-500 font-bold">GRID SYNCED</span><button onclick="getWeatherByCoords(${lat}, ${lon})" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer border-none shadow-md transition transform active:scale-95">ANALYZE REGION 🌦️</button></div>`)
        .openOn(map);
});

// ========================================== //
// 🔮 DYNAMIC ASYNCHRONOUS AUTOCOMPLETE LAYER //
// ========================================== //

let debounceTimer;
const poiInput = document.getElementById("poiInput");
const placesSidebar = document.getElementById("placesSidebar");
const placesListContainer = document.getElementById("placesListContainer");
const autocompleteDropdown = document.getElementById("autocompleteDropdown");

if (poiInput) {
    poiInput.addEventListener("input", (e) => {
        const value = e.target.value.trim();
        
        if (value.length < 2) {
            if (autocompleteDropdown) {
                autocompleteDropdown.innerHTML = "";
                autocompleteDropdown.classList.add("hidden");
            }
            return;
        }

        const weatherCard = document.getElementById("weatherCard");
        if (weatherCard) {
            weatherCard.classList.add("hidden");
            weatherCard.classList.remove("flex");
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchGlobalPlaces(value);
        }, 350);
    });
}

/**
 * Autocomplete location processor mapped directly under header search box layout bounds
 */
async function searchGlobalPlaces(query) {
    try {
        if (!autocompleteDropdown) return;
        
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`);
        if (!response.ok) return;
        const destinations = await response.json();

        autocompleteDropdown.innerHTML = "";  

        if (destinations.length === 0) {
            const noRes = document.createElement("div");
            noRes.className = "p-3 text-xs text-slate-400 font-medium italic";
            noRes.innerText = "No locations discovered.";
            autocompleteDropdown.appendChild(noRes);
            autocompleteDropdown.classList.remove("hidden");
            return;
        }

        destinations.forEach(place => {
            const itemNode = document.createElement("div");
            itemNode.className = "p-3 border-b border-white/5 cursor-pointer text-xs font-semibold text-slate-200 flex flex-col gap-0.5 hover:bg-blue-500/10 transition-all";
            
            const shortName = place.display_name.split(',').slice(0, 2).join(',');
            const extendedContext = place.display_name.split(',').slice(2, 4).join(',');

            itemNode.innerHTML = `
                <span class="text-blue-400 font-bold">📍 ${shortName}</span>
                <span class="text-[10px] text-slate-400 truncate max-w-full pl-4">${extendedContext || 'Global Target Grid'}</span>
            `;

            itemNode.addEventListener("click", () => {
                const lat = parseFloat(place.lat);
                const lon = parseFloat(place.lon); 
                
                if (poiInput) poiInput.value = shortName;
                autocompleteDropdown.classList.add("hidden");

                const weatherCard = document.getElementById("weatherCard");
                if (weatherCard) {
                    weatherCard.classList.remove("hidden");
                    weatherCard.classList.add("flex");
                }

                getWeatherByCoords(lat, lon, shortName);
            });

            autocompleteDropdown.appendChild(itemNode);
        });
        
        autocompleteDropdown.classList.remove("hidden");
    } catch (error) {
        console.error("Discovery error logs:", error.message);
    } 
}

// Global click dismiss bounds handler
document.addEventListener("click", (e) => {
    if (poiInput && !poiInput.contains(e.target) && autocompleteDropdown && !autocompleteDropdown.contains(e.target)) {
        autocompleteDropdown.classList.add("hidden");
    }
});

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                alert("GPS permission denied by security shell.");
            }
        );
    } else {
        alert("Geolocation is not supported by your current browser.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const weatherForm = document.getElementById("weatherForm");
    if (weatherForm) {
        weatherForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const city = document.getElementById("cityInput").value.trim(); 
            if (city !== "") getWeather(city);
        });
    }

    const locateBtn = document.getElementById("locateBtn");
    if (locateBtn) locateBtn.addEventListener("click", (e) => { e.preventDefault(); locateUser(); });
    
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener("click", () => {
            if (placesSidebar) placesSidebar.classList.add("hidden");
            const weatherCard = document.getElementById("weatherCard");
            if (weatherCard) {
                weatherCard.classList.remove("hidden");
                weatherCard.classList.add("flex");
            }
        });
    }

    const navCheckWeather = document.getElementById("navCheckWeather");
    const weatherCard = document.getElementById("weatherCard");
    if (navCheckWeather && weatherCard) {
        navCheckWeather.addEventListener("click", (e) => {
            e.stopPropagation();
            weatherCard.classList.toggle("hidden");
            if (!weatherCard.classList.contains("hidden")) weatherCard.classList.add("flex");
        });
    }
});

// ========================================== //
// ❄️🌧️ HIGH-PERFORMANCE WEATHER FX ENGINE    //
// ========================================== //

const canvas = document.getElementById("weatherParticleCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
    constructor(type) {
        this.type = type;
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        
        if (this.type === "snow") {
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.6 + 0.4;
        } else if (this.type === "rain") {
            this.length = Math.random() * 20 + 10;
            this.speedY = Math.random() * 8 + 6;
            this.speedX = -1 - Math.random() * 2;
            this.opacity = Math.random() * 0.3 + 0.2;
        }
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > canvas.height || this.x < -20) this.reset();
    }

    draw() {
        ctx.beginPath();
        if (this.type === "snow") {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === "rain") {
            ctx.strokeStyle = `rgba(147, 197, 253, ${this.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.speedX * 0.5, this.y + this.length);
            ctx.stroke();
        }
    }
}

function initWeatherSimulator(type, density) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray = [];
    
    for (let i = 0; i < density; i++) {
        particlesArray.push(new Particle(type));
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
}

function triggerDynamicWeatherAnimation(condition) {
    const c = condition.toLowerCase();
    if (c.includes("snow")) {
        initWeatherSimulator("snow", 200);
    } else if (c.includes("rain") || c.includes("drizzle") || c.includes("mist")) {
        initWeatherSimulator("rain", 250);
    } else {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

document.getElementById("simSnowBtn").addEventListener("click", () => initWeatherSimulator("snow", 200));
document.getElementById("simRainBtn").addEventListener("click", () => initWeatherSimulator("rain", 250));
document.getElementById("simClearBtn").addEventListener("click", () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});