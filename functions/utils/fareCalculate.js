function fareCalculate(vehicleType, distanceInKm) {
    const baseFares = {
        Tricycle: 15,
        Jeep: 20,
    };

    const distanceFares = {
        Tricycle: 12, // cost per kilometer
        Jeep: 15, // cost per kilometer
    };

    const bookingFees = {
        Tricycle: 15,
        Jeep: 20,
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
