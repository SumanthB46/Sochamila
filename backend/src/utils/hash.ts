import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error("Hash error:", error);
    throw error;
  }
};

export const comparePassword = async (
  password: string,
  hash: string
) => {
  try {
    console.log("Comparing password. Hash exists:", !!hash, "Password length:", password.length);
    const result = await bcrypt.compare(password, hash);
    console.log("Password comparison result:", result);
    return result;
  } catch (error) {
    console.error("Compare password error:", error);
    throw error;
  }
};
