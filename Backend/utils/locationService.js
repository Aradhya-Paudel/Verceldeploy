const axios = require('axios');

const API_KEY = process.env.LOCATIONIQ_API_KEY;
const BASE_URL_SEARCH = 'https://us1.locationiq.com/v1/search';
const BASE_URL_REVERSE = 'https://us1.locationiq.com/v1/reverse';
const BASE_URL_STATIC = 'https://maps.locationiq.com/v3/staticmap';

const geocodeAddress = async (address) => {
    if (!API_KEY) return null;
    try {
        const response = await axios.get(BASE_URL_SEARCH, {
            params: {
                key: API_KEY,
                q: address,
                format: 'json',
                limit: 1
            }
        });
        if (response.data && response.data.length > 0) {
            const { lat, lon, display_name } = response.data[0];
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                displayName: display_name
            };
        }
        return null;
    } catch (error) {
        console.error('LocationIQ Geocoding Error:', error.message);
        return null; // Graceful failure
    }
};

const reverseGeocode = async (latitude, longitude) => {
    if (!API_KEY) return null;
    try {
        const response = await axios.get(BASE_URL_REVERSE, {
            params: {
                key: API_KEY,
                lat: latitude,
                lon: longitude,
                format: 'json'
            }
        });
        if (response.data && response.data.display_name) {
            return response.data.display_name;
        }
        return null;
    } catch (error) {
        console.error('LocationIQ Reverse Geocoding Error:', error.message);
        return null;
    }
};

const generateStaticMapUrl = (latitude, longitude, markers = []) => {
    if (!API_KEY) return null;

    // Primary marker
    const markerParams = [`icon:large-red-cutout|${latitude},${longitude}`];

    // Additional markers
    markers.forEach(m => {
        markerParams.push(`icon:small-blue-cutout|${m.lat},${m.lon}`);
    });

    const params = new URLSearchParams({
        key: API_KEY,
        center: `${latitude},${longitude}`,
        zoom: 13,
        size: '600x400',
        format: 'png',
        markers: markerParams.join('|')
    });

    return `${BASE_URL_STATIC}?${decodeURIComponent(params.toString())}`;
};

const generateRouteMapUrl = (startLat, startLon, endLat, endLon) => {
    if (!API_KEY) return null;

    const midLat = (startLat + endLat) / 2;
    const midLon = (startLon + endLon) / 2;

    const markers = `icon:large-green-cutout|${startLat},${startLon}|icon:large-red-cutout|${endLat},${endLon}`;
    const path = `weight:5|color:blue|${startLat},${startLon}|${endLat},${endLon}`;

    const params = new URLSearchParams({
        key: API_KEY,
        center: `${midLat},${midLon}`,
        zoom: 12,
        size: '800x600',
        format: 'png',
        markers: markers,
        path: path
    });

    return `${BASE_URL_STATIC}?${decodeURIComponent(params.toString())}`;
};

const generateOverviewMapUrl = (hospitals) => {
    if (!API_KEY || !hospitals || hospitals.length === 0) return null;

    let totalLat = 0;
    let totalLon = 0;
    const markers = [];

    hospitals.forEach(h => {
        totalLat += h.latitude;
        totalLon += h.longitude;
        markers.push(`icon:small-red-cutout|${h.latitude},${h.longitude}`);
    });

    const midLat = totalLat / hospitals.length;
    const midLon = totalLon / hospitals.length;

    const params = new URLSearchParams({
        key: API_KEY,
        center: `${midLat},${midLon}`,
        zoom: 11,
        size: '800x600',
        format: 'png',
        markers: markers.join('|')
    });

    return `${BASE_URL_STATIC}?${decodeURIComponent(params.toString())}`;
}

module.exports = {
    geocodeAddress,
    reverseGeocode,
    generateStaticMapUrl,
    generateRouteMapUrl,
    generateOverviewMapUrl
};
