export const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/;

export const formatUnit = (building: string, unit: string) => `${building}동 ${unit}호`;
