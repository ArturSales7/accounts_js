import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";

console.log(chalk.bold.cyan("Iniciando o Accounts..."));

function encerrarPrograma() {
  console.log(chalk.red("Encerrando o programa..."));
  setTimeout(() => {
    console.clear();
    process.exit();
  }, 2000);
}

function criarConta() {
  console.log(chalk.bold.green("\nCriando uma conta..."));

  inquirer
    .prompt([
      {
        type: "input",
        name: "accountName",
        message: "Digite o nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      let contas = [];
      if (fs.existsSync("database.json")) {
        contas = JSON.parse(fs.readFileSync("database.json"));
      }

      const contaExistente = contas.find((c) => c.name === accountName);

      if (contaExistente) {
        console.log(chalk.red("\n✖ Esse nome já está em uso! Tente outro."));
        criarConta();
        return;
      }

      inquirer
        .prompt([
          {
            type: "input",
            name: "accountPassword",
            message: "Digite a senha para a sua conta:",
          },
        ])
        .then((answer2) => {
          const accountPassword = answer2["accountPassword"];

          contas.push({
            id: contas.length + 1,
            name: accountName,
            password: accountPassword,
            balance: 0,
          });
          fs.writeFileSync("database.json", JSON.stringify(contas));

          console.log(chalk.bold.green("\n✔ Conta criada com sucesso!"));
          telaInicial();
        })
        .catch((err) => console.log(chalk.red(err)));
    })
    .catch((err) => console.log(chalk.red(err)));
}

function loginConta() {
  console.log(chalk.bold.green("\nEntrando na conta..."));

  inquirer
    .prompt([
      {
        type: "input",
        name: "accountName",
        message: "Digite o nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      inquirer
        .prompt([
          {
            type: "input",
            name: "accountPassword",
            message: "Digite a senha para a sua conta:",
          },
        ])
        .then((answer2) => {
          const accountPassword = answer2["accountPassword"];

          if (fs.existsSync("database.json")) {
            procurarConta(accountName, accountPassword);
          } else {
            console.log(chalk.red("Nenhuma conta cadastrada ainda!"));
            telaInicial();
          }
        })
        .catch((err) => console.log(chalk.red(err)));
    })
    .catch((err) => console.log(chalk.red(err)));
}

function procurarConta(accountName, accountPassword) {
  const contas = JSON.parse(fs.readFileSync("database.json"));

  const conta = contas.find(
    (conta) => conta.name === accountName && conta.password === accountPassword,
  );

  if (conta) {
    console.log(chalk.bold.green(`\n✔ Bem-vindo, ${accountName}!`));
    menuPrincipal(conta);
  } else {
    console.log(chalk.bold.red("\n✖ Nome ou senha incorretos!"));
    telaInicial();
  }
}

function menuPrincipal(conta) {
  console.log(chalk.bold.cyan("\n╔══════════════════════════╗"));
  console.log(chalk.bold.cyan("║   🏦  Menu Principal      ║"));
  console.log(chalk.bold.cyan("╚══════════════════════════╝\n"));

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "O que deseja fazer?",
        choices: ["Depositar", "Sacar", "Consultar Saldo", "Sair"],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Depositar") {
        depositar(conta);
      } else if (action === "Sacar") {
        sacar(conta);
      } else if (action === "Consultar Saldo") {
        consultarSaldo(conta);
      } else {
        telaInicial();
      }
    })
    .catch((err) => console.log(chalk.red(err)));
}

function depositar(conta) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "amount",
        message: "Digite o valor para depositar:",
      },
    ])
    .then((answer) => {
      const amount = parseFloat(answer["amount"]);

      if (amount <= 0) {
        console.log(chalk.red("\n✖ Valor inválido!"));
        menuPrincipal(conta);
      } else {
        conta.balance += amount;

        const contas = JSON.parse(fs.readFileSync("database.json"));
        const index = contas.findIndex((c) => c.id === conta.id);
        contas[index].balance = conta.balance;
        fs.writeFileSync("database.json", JSON.stringify(contas));

        console.log(
          chalk.bold.green(
            `\n✔ Depositado R$${amount.toFixed(2)} com sucesso!`,
          ),
        );
        menuPrincipal(conta);
      }
    })
    .catch((err) => console.log(chalk.red(err)));
}

function sacar(conta) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "amount",
        message: "Digite o valor para sacar:",
      },
    ])
    .then((answer) => {
      const amount = parseFloat(answer["amount"]);

      if (amount <= 0 || amount > conta.balance) {
        console.log(chalk.red("\n✖ Valor inválido ou saldo insuficiente!"));
        menuPrincipal(conta);
      } else {
        conta.balance -= amount;

        const contas = JSON.parse(fs.readFileSync("database.json"));
        const index = contas.findIndex((c) => c.id === conta.id);
        contas[index].balance = conta.balance;
        fs.writeFileSync("database.json", JSON.stringify(contas));

        console.log(
          chalk.bold.green(`\n✔ Sacado R$${amount.toFixed(2)} com sucesso!`),
        );
        menuPrincipal(conta);
      }
    })
    .catch((err) => console.log(chalk.red(err)));
}

function consultarSaldo(conta) {
  console.log(chalk.bold.cyan(`\nSeu saldo é: R$${conta.balance.toFixed(2)}`));
  menuPrincipal(conta);
}

function telaInicial() {
  console.log(chalk.bold.cyan("\n╔══════════════════════════╗"));
  console.log(chalk.bold.cyan("║   🏦  Bem-vindo ao Banco  ║"));
  console.log(chalk.bold.cyan("╚══════════════════════════╝\n"));

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "O que deseja fazer?",
        choices: ["Entrar", "Criar Conta"],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Entrar") {
        loginConta();
      } else {
        criarConta();
      }
    })
    .catch((err) => console.log(chalk.red(err)));
}

function iniciar() {
  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: chalk.green("Deseja iniciar o banco?"),
        choices: [
          { name: chalk.green("Sim"), value: "Sim" },
          { name: chalk.red("Não"), value: "Não" },
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Sim") {
        telaInicial();
      } else {
        encerrarPrograma();
      }
    })
    .catch((err) => console.log(chalk.red(err)));
}

iniciar();
