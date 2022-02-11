const express = require("express");
const db = require("./customersRepository");
const { verifyIExistAccountCPF } = require("./middlewares");

const router = express.Router();

function getBalance(statement) {
  return statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
}

router.get("/accounts", (_, response) => {
  return response.json(db.getAll());
});

router.post("/accounts", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = db.findOne((customer) => customer.cpf === cpf);

  if (!!customerAlreadyExists) {
    return response.status(400).json({
      error: "Customer already exists!",
    });
  }

  const customer = db.create({
    cpf,
    name,
    statement: [],
  });

  db.save(customer);

  return response.status(201).send();
});

router.get("/statement", verifyIExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;
  let statement = [];

  if (!date) {
    statement = customer.statement;
  } else {
    const dateFormatted = new Date(date + " 00:00:00");

    statement = customer.statement.filter(
      (operation) =>
        operation.created_at.toDateString() === dateFormatted.toDateString()
    );
  }

  return response.json(statement);
});

router.post("/deposit", verifyIExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  customer.statement.push({
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  });

  db.update(customer);

  return response.status(201).json(customer.statement);
});

router.post("/withdraw", verifyIExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { amount } = request.body;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds." });
  }

  customer.statement.push({
    description: "Saque",
    amount,
    created_at: new Date(),
    type: "debit",
  });

  db.update(customer);

  return response.status(201).send();
});

router.put("/accounts", verifyIExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { name } = request.body;

  db.update({ ...customer, name });

  return response.sendStatus(201);
});

module.exports = router;
