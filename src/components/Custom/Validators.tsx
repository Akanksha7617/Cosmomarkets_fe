const PasswordValidator = (_: any, value: string) => {
  // Regular expression to validate the password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  if (!value || value.match(passwordRegex)) {
    return Promise.resolve();
  }

  return Promise.reject('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
};

export {PasswordValidator}
