const db = require("./customersRepository");

function verifyIExistAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = db.findOne((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found." });
  }

  request.customer = customer;

  return next();
}

module.exports = { verifyIExistAccountCPF };
