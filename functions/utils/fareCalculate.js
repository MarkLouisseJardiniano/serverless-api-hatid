function fareCalculate(vehicleType, distanceInKm) {
    const baseFares = {
        tricycle: 15,
        jeep: 20,
    };

    const distanceFares = {
        tricycle: 12, // cost per kilometer
        jeep: 15, // cost per kilometer
    };

    const bookingFees = {
        tricycle: 15,
        jeep: 20,
    };

    // Retrieve the specific fares for the vehicle type
    const baseFare = baseFares[vehicleType] || 0;
    const distanceFare = distanceFares[vehicleType] || 0;
    const bookingFee = bookingFees[vehicleType] || 0;

    // Calculate total fare
    const fare = baseFare + (distanceFare * distanceInKm) + bookingFee;

    return fare;
}

module.exports = fareCalculate;
