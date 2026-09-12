const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
    return typeof email === "string" && EMAIL_REGEX.test(email);
};
