const geolib = require('geolib');

function calculateDistance(pickupLocation, destinationLocation) {
    const distance = geolib.getDistance(
        { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
        { latitude: destinationLocation.lat, longitude: destinationLocation.lng }
    );

    // Convert distance from meters to kilometers
    return distance / 1000;
}

module.exports = calculateDistance;
