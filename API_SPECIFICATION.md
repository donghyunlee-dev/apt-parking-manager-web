# API 명세서 (Mock API)

## 🔐 인증 API

### POST /api/auth/login
요청
```json
{
  "apt_code": "string",
  "fin_no": "string"
}
```
응답 (200)
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "bouncer_code": "string",
      "bouncer_name": "string",
      "apt_code": "string"
    },
    "apartment": {
      "apt_code": "string",
      "apt_name": "string"
    }
  }
}
```
에러 응답
- 401: 인증 실패
- 404: 아파트 코드 없음

### POST /api/auth/logout
요청
```json
{}
```
응답 (200)
```json
{ "success": true }
```

### GET /api/auth/me
응답 (200)
```json
{
  "success": true,
  "data": {
    "user": { "bouncer_code": "string", "bouncer_name": "string" },
    "apartment": { "apt_code": "string", "apt_name": "string" }
  }
}
```

## 🧍 경비원 관리

### GET /api/bouncers
쿼리
- `name` (optional)
- `used` (optional: Y|N)
- `page`, `pageSize`

응답 (200)
```json
{ "success": true, "data": { "items": [], "total": 0 } }
```

### POST /api/bouncers
요청
```json
{
  "bouncer_name": "string",
  "fin_no": "string",
  "used": "Y"
}
```
응답 (201)
```json
{ "success": true, "data": { "bouncer_code": "string" } }
```

### PUT /api/bouncers/:code
요청
```json
{ "bouncer_name": "string", "used": "Y" }
```
응답 (200)
```json
{ "success": true }
```

### DELETE /api/bouncers/:code
응답 (200)
```json
{ "success": true }
```

### GET /api/bouncers/fin
쿼리
- `fin_no`

응답 (200)
```json
{ "success": true, "data": { "duplicated": false } }
```

## 🚗 입주민 차량 관리

### GET /api/resident-vehicles
쿼리
- `vehicle_number`, `building`, `unit`, `phone`
- `sort`, `page`, `pageSize`

응답 (200)
```json
{ "success": true, "data": { "items": [], "total": 0 } }
```

### POST /api/resident-vehicles
요청
```json
{
  "building": "string",
  "unit": "string",
  "vehicle_number": "string",
  "phone_number": "string",
  "image_url": "string"
}
```
응답 (201)
```json
{ "success": true, "data": { "vehicle_id": "string" } }
```

### POST /api/resident-vehicles/bulk
요청
```json
{ "file": "binary" }
```
응답 (200)
```json
{ "success": true, "data": { "total": 0, "success": 0, "failed": 0 } }
```

### PUT /api/resident-vehicles/:id
요청
```json
{ "building": "string", "unit": "string", "phone_number": "string" }
```
응답 (200)
```json
{ "success": true }
```

### DELETE /api/resident-vehicles/:id
응답 (200)
```json
{ "success": true }
```

### GET /api/resident-vehicles/template
응답 (200)
```json
{ "success": true, "data": { "url": "string" } }
```

## 🚙 방문 차량 관리

### GET /api/visitor-vehicles
쿼리
- `status` (active|expired)
- `vehicle_number`, `building`, `unit`, `phone`
- `start_date`, `end_date`
- `page`, `pageSize`

응답 (200)
```json
{ "success": true, "data": { "items": [], "total": 0 } }
```

### POST /api/visitor-vehicles
요청
```json
{
  "building": "string",
  "unit": "string",
  "vehicle_number": "string",
  "visitor_phone": "string",
  "visit_start_date": "string",
  "visit_end_date": "string"
}
```
응답 (201)
```json
{ "success": true, "data": { "visitor_id": "string" } }
```

### PUT /api/visitor-vehicles/:id
요청
```json
{
  "visit_start_date": "string",
  "visit_end_date": "string",
  "visitor_phone": "string"
}
```
응답 (200)
```json
{ "success": true }
```

### DELETE /api/visitor-vehicles/:id
응답 (200)
```json
{ "success": true }
```

### GET /api/visitor-vehicles/:id/history
응답 (200)
```json
{ "success": true, "data": { "items": [] } }
```

### GET /api/visitor-vehicles/statistics
응답 (200)
```json
{ "success": true, "data": { "summary": {}, "byDate": [] } }
```

## 🔎 차량 조회 및 리포트

### GET /api/vehicles/search
쿼리
- `number`

응답 (200)
```json
{ "success": true, "data": { "vehicle_number": "string", "vehicle_type": "resident" } }
```

### GET /api/dashboard/stats
응답 (200)
```json
{ "success": true, "data": { "total_resident_vehicles": 0, "total_visitor_vehicles": 0 } }
```

### GET /api/scan-logs
쿼리
- `from`, `to`, `page`, `pageSize`

응답 (200)
```json
{ "success": true, "data": { "items": [], "total": 0 } }
```

### GET /api/reports/daily
응답 (200)
```json
{ "success": true, "data": { "items": [] } }
```

### GET /api/reports/export
쿼리
- `type` (csv|xlsx)

응답 (200)
```json
{ "success": true, "data": { "url": "string" } }
```

## 📣 공지사항 관리

### GET /api/notices
쿼리
- `visible` (true|false)
- `important` (true|false)
- `search` (title contains)
- `sort`
- `page`, `pageSize`

응답 (200)
```json
{ "success": true, "data": { "items": [], "total": 0 } }
```

### POST /api/notices
요청
```json
{
  "title": "string",
  "content": "string",
  "is_important": true,
  "is_visible": true,
  "start_date": "string",
  "end_date": "string"
}
```
응답 (201)
```json
{ "success": true, "data": { "notice_id": "string" } }
```

### PUT /api/notices/:id
요청
```json
{ "title": "string", "content": "string", "is_visible": true }
```
응답 (200)
```json
{ "success": true }
```

### DELETE /api/notices/:id
응답 (200)
```json
{ "success": true }
```

### PATCH /api/notices/:id/visibility
요청
```json
{ "is_visible": true }
```
응답 (200)
```json
{ "success": true }
```
