import { http, HttpResponse } from 'msw';
import { authHandlers } from './auth';
import { bouncerHandlers } from './bouncer';
import { residentVehicleHandlers } from './resident-vehicle';
import { visitorVehicleHandlers } from './visitor-vehicle';
import { vehicleReportHandlers } from './vehicle-report';
import { noticeHandlers } from './notice';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),
  ...authHandlers,
  ...bouncerHandlers,
  ...residentVehicleHandlers,
  ...visitorVehicleHandlers,
  ...vehicleReportHandlers,
  ...noticeHandlers,
];
