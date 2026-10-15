const bcrypt = require('bcrypt');
const hash = '$2b$10$wjazkoTzSEFyGIzTUXByCugJ1Jub573MJOu5PkqnGcYgeVQZCgFk2';
const pass = 'Ms12345';
bcrypt.compare(pass, hash).then(res => console.log('Match Ms12345:', res));
const pass2 = 'ms12345';
bcrypt.compare(pass2, hash).then(res => console.log('Match ms12345:', res));
