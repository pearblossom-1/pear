function isApprovalCode(value) {
  return /^app-\d{3,4}$/i.test(value);
}
module.exports = { isApprovalCode };
