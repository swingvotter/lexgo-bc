
function removeNewlines(text) {
  // Using replace with regex to remove all \n
  return text.replace(/\n/g, ' ');
}

module.exports = removeNewlines