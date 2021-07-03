const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.add('active')
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove('active')
    }
}

const LocalStorage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: LocalStorage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        const value = Transaction.all.filter(transaction => transaction.amount > 0).reduce((acumulador, valor) => acumulador + valor.amount, 0)
        return Utils.formatCurrency(value)
    },
    expenses() {
        const value = Transaction.all.filter(transaction => transaction.amount < 0).reduce((acumulador, valor) => acumulador + valor.amount, 0) * -1
        return Utils.formatCurrency(value)
    },
    total() {
        const value = Transaction.all.reduce((acumulador, valor) => acumulador + valor.amount, 0)
        if (value >= 0) {
            DOM.totalCard.classList.remove("total-red");
            DOM.totalCard.classList.add("total-green");
        } else {
            DOM.totalCard.classList.remove("total-green");
            DOM.totalCard.classList.add("total-red");
        }
        return Utils.formatCurrency(value)
    }
}

const Utils = {
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatAmount(amount) {
        return Number(amount) * 100
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const DOM = {
    totalCard: document.getElementById("cardTotal"),
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHtmlTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHtmlTransaction(transaction, index) {
        const cssClass = transaction.amount >= 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img title="Deletar transação" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
            </td>
        `

        return html
    },
    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Transaction.incomes()
        document.getElementById("expenseDisplay").innerHTML = Transaction.expenses()
        document.getElementById("totalDisplay").innerHTML = Transaction.total()
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    getValue() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validateFields() {
        const { description, amount, date } = Form.getValue()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },
    formatData() {
        let { description, amount, date } = Form.getValue()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        description = description.trim()

        return {
            amount,
            date,
            description,
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = ""
        Form.description.date = ""
        Form.description.description = ""
    },
    submit(event) {
        event.preventDefault()
        try {
            Form.validateFields(event)
            const transaction = Form.formatData(event)
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()
        LocalStorage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()