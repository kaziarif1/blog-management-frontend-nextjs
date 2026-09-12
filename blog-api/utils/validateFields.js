export const MIN_PASSWORD_LENGTH = 6;

export const validatePassword = (password) => {
    return typeof password === "string" && password.trim().length >= MIN_PASSWORD_LENGTH;
};

export const isNonEmptyString = (value) => {
    return typeof value === "string" && value.trim().length > 0;
};
