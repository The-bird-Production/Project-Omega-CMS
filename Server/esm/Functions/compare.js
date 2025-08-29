import * as bcrypt from "bcrypt";
async function compare(hashedPassword, password) {
    return await bcrypt.compare(password, hashedPassword);
}
export default compare;
