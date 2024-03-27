const bcrypt = require("bcrypt");
const { bcrypt_hash } = require("../config/session");

async function hash(password) {
  
  const salt = await bcrypt.genSalt(bcrypt_hash);

  
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

export default hash;
