const validateEmail = (emailAddress) => {
  return /\S+@\S+\.\S+/.test(emailAddress)
}

module.exports = { validateEmail }