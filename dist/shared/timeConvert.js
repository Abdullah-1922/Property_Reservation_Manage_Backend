"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTimeWithinRange = exports.convertTo24HourFormat = void 0;
const convertTo24HourFormat = (time) => {
    const [hourMin, period] = time.split(' ');
    const [hours, minutes] = hourMin.split(':').map(Number);
    let formattedHours = hours;
    if (period === 'PM' && hours !== 12)
        formattedHours += 12;
    if (period === 'AM' && hours === 12)
        formattedHours = 0;
    return `${formattedHours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
};
exports.convertTo24HourFormat = convertTo24HourFormat;
/**
 * Checks if a given time is within a specified range.
 */
const isTimeWithinRange = (currentTime, startTime, endTime) => {
    const current = (0, exports.convertTo24HourFormat)(currentTime);
    const start = (0, exports.convertTo24HourFormat)(startTime);
    const end = (0, exports.convertTo24HourFormat)(endTime);
    return current >= start && current <= end;
};
exports.isTimeWithinRange = isTimeWithinRange;
