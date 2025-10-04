import * as bcrypt from "bcrypt";
import * as session from "../config/session.js";
const { bcrypt_hash } = session;
async function hash(password) {
    const salt = await bcrypt.genSalt(bcrypt_hash);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}
export default hash;
