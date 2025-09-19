const bcrypt = require('bcryptjs')

const password = 'admin123'
const hash = bcrypt.hashSync(password, 12)

console.log('Password:', password)
console.log('Hash:', hash)
console.log('Verification:', bcrypt.compareSync(password, hash))
