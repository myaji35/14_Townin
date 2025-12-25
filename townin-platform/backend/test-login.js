const bcrypt = require('bcrypt');

const password = 'townin2025!';
const hash = '$2b$10$qKF4YxRk.Qm7v3QJ8.F5BuDZjK3X8.tG9vQ0L7P8wNxY5mR2sT3uW';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password match:', result);
  }
});

// Also test creating a hash
bcrypt.hash(password, 10, (err, newHash) => {
  if (err) {
    console.error('Error creating hash:', err);
  } else {
    console.log('New hash:', newHash);
  }
});
