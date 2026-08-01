export type AvailabilityWindow = {
  availableFrom: Date | null;
  availableTo: Date | null;
};

export function isWithinAvailabilityWindow(
  { availableFrom, availableTo }: AvailabilityWindow,
  now = new Date(),
) {
  return (!availableFrom || availableFrom <= now) && (!availableTo || availableTo >= now);
}

export function availabilityWindowWhere(now = new Date()) {
  return [
    { OR: [{ availableFrom: null }, { availableFrom: { lte: now } }] },
    { OR: [{ availableTo: null }, { availableTo: { gte: now } }] },
  ];
}
