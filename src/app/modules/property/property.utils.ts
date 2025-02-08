import { TReservation } from './property.interface';

export function sortReservationsByDates(
  reservations: TReservation[],
  targetRoomId: number,
  query: { startDate: string; endDate: string }
): TReservation[] {
  const { startDate, endDate } = query;
  console.log('query from sort', query);
  const start = new Date(startDate.split('/').reverse().join('-'));
  const end = new Date(endDate.split('/').reverse().join('-'));

  // Filter the reservations to only include those with the target room_id and overlapping the date range
  const filteredReservations = reservations.filter(reservation =>
    reservation.rooms.some(room => {
      const dfrom = new Date(room.dfrom.split('/').reverse().join('-'));
      const dto = new Date(room.dto.split('/').reverse().join('-'));
      return room.id_zak_room === targetRoomId && dfrom <= end && dto >= start;
    })
  );

  return filteredReservations.sort((a, b) => {
    // Check if the reservation is canceled
    const aIsCancelled = a.status === 'Cancelled';
    const bIsCancelled = b.status === 'Cancelled';

    // Keep non-canceled reservations at the top and move canceled reservations to the end
    if (aIsCancelled && !bIsCancelled) return 1;
    if (!aIsCancelled && bIsCancelled) return -1;

    // If both or neither are canceled, proceed with sorting based on dates
    const aDfrom = new Date(a.rooms[0].dfrom.split('/').reverse().join('-')); // Convert dfrom to Date
    const bDfrom = new Date(b.rooms[0].dfrom.split('/').reverse().join('-')); // Convert dfrom to Date
    const aDto = new Date(a.rooms[0].dto.split('/').reverse().join('-')); // Convert dto to Date
    const bDto = new Date(b.rooms[0].dto.split('/').reverse().join('-')); // Convert dto to Date

    // First, sort by 'dfrom' (arrival date) in ascending order (earlier dates first)
    if (aDfrom < bDfrom) return -1;
    if (aDfrom > bDfrom) return 1;

    // If 'dfrom' values are the same, sort by 'dto' (departure date) in ascending order (earlier dates first)
    if (aDto < bDto) return -1;
    if (aDto > bDto) return 1;

    return 0;
  });
}

//sort by created At
export function sortReservationsByCreatedBy(
  reservations: TReservation[],
  targetRoomId: number
): TReservation[] {
  // Filter the reservations to only include those with the target room_id
  const filteredReservations = reservations.filter(reservation =>
    reservation.rooms.some(room => room.id_zak_room === targetRoomId)
  );

  return filteredReservations.sort((a, b) => {
    // Proceed with sorting based on created dates
    const aCreated = new Date(a.created.split('/').reverse().join('-')); // Convert created to Date
    const bCreated = new Date(b.created.split('/').reverse().join('-')); // Convert created to Date

    // Sort by 'created' (creation date) in descending order (later dates first)
    if (aCreated < bCreated) return 1;
    if (aCreated > bCreated) return -1;

    return 0;
  });
}
