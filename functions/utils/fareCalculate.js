function fareCalculate(vehicleType, distance) {
    const fares = {
        Tricycle: {
            baseFare: 15,
            distanceFare: 12,
            bookingFee: 20
        },
        Jeep: {
            baseFare: 15,
            distanceFare: 12,
            bookingFee: 20
        }
    };

    // Retrieve the specific fares for the vehicle type
    const { baseFare, distanceFare, bookingFee } = fares[vehicleType] || { baseFare: 0, distanceFare: 0, bookingFee: 0 };

    // Calculate total fare
    const fare = baseFare + (distanceFare * distance) + bookingFee;

    return fare;
}

module.exports = fareCalculate;
