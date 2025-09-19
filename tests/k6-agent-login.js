import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  const url = `${__ENV.BASE_URL || 'http://localhost:3000'}/api/agent/auth`;
  const payload = JSON.stringify({
    email: 'agent@example.com',
    password: 'password123',
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  const res = http.post(url, payload, params);
  check(res, {
    'status is 200 or 401/429': (r) => [200, 401, 429].includes(r.status),
  });
  sleep(1);
}
