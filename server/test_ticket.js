import http from 'http';

// Test 1: with a valid userId
const data = JSON.stringify({
  userId: '507f1f77bcf86cd799439011',
  subject: 'Test Subject',
  message: 'Test message body'
});

const req = http.request({
  hostname: 'localhost', port: 5000, path: '/api/tickets', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', body));
});
req.on('error', e => console.error('SERVER NOT RUNNING:', e.message));
req.write(data);
req.end();
