const { v4: uuidv4 } = require("uuid");

const customers = [];

function getAll() {
  return customers;
}

function create(customer) {
  return {
    ...customer,
    id: uuidv4(),
  };
}

function save(customer) {
  customers.push(customer);
}

function findOne(func) {
  return customers.find(func);
}

function update(customer) {
  const { cpf } = customer;

  const customerIndex = customers.findIndex((customer) => customer.cpf === cpf);
  customers[customerIndex] = customer;
}

module.exports = {
  create,
  save,
  findOne,
  getAll,
  update,
};
