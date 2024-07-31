const geolib = require('geolib');

function calculateDistance(pickupLocation, destinationLocation) {
    const distance = geolib.getDistance(
        { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
        { latitude: destinationLocation.latitude, longitude: destinationLocation.longitude }
    );

    // Convert distance from meters to kilometers
    return distance / 1000;
}

module.exports = calculateDistance;
