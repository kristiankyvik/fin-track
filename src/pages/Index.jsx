import React, { useState } from "react";
import { Box, Button, Flex, Heading, Input, Select, Stack, Text, useToast, VStack, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash, FaFileDownload } from "react-icons/fa";

// Transaction item component
const TransactionItem = ({ transaction, onEdit, onDelete }) => (
  <Flex justifyContent="space-between" alignItems="center" p={2} borderWidth="1px" borderRadius="lg">
    <Box>
      <Text fontSize="sm">{new Date(transaction.date).toLocaleDateString()}</Text>
      <Text fontWeight="bold">
        {transaction.type === "income" ? "+" : "-"}${transaction.amount}
      </Text>
      <Text fontSize="sm">{transaction.category}</Text>
    </Box>
    <Box>
      <IconButton aria-label="Edit transaction" icon={<FaEdit />} size="sm" mr={2} onClick={() => onEdit(transaction)} />
      <IconButton aria-label="Delete transaction" icon={<FaTrash />} size="sm" onClick={() => onDelete(transaction.id)} />
    </Box>
  </Flex>
);

// Main component
const Index = () => {
  // State
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2023-04-01", amount: 500, type: "income", category: "Salary" },
    { id: 2, date: "2023-04-03", amount: 50, type: "expense", category: "Groceries" },
  ]);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState({});
  const [editMode, setEditMode] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Toast
  const toast = useToast();

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (editMode) {
      // Edit transaction
      setTransactions((prev) => prev.map((t) => (t.id === form.id ? { ...t, ...form } : t)));
    } else {
      // Add new transaction
      const newTransaction = {
        id: Date.now(),
        ...form,
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    }

    toast({
      title: `Transaction ${editMode ? "updated" : "added"}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setForm({});
    setEditMode(false);
    onClose();
  };

  const handleEdit = (transaction) => {
    setForm(transaction);
    setEditMode(true);
    onOpen();
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Transaction deleted.",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  const calculateBalance = () =>
    transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);

  const handleExport = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(transactions))}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((transaction) => {
    return (!filter.type || transaction.type === filter.type) && (!filter.category || transaction.category === filter.category) && (!filter.dateFrom || new Date(transaction.date) >= new Date(filter.dateFrom)) && (!filter.dateTo || new Date(transaction.date) <= new Date(filter.dateTo));
  });

  // JSX
  return (
    <VStack spacing={4}>
      <Heading>Personal Finance Manager</Heading>

      <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={onOpen}>
        Add Transaction
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editMode ? "Edit Transaction" : "Add Transaction"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={3}>
              <Input placeholder="Amount" name="amount" type="number" value={form.amount || ""} onChange={handleInputChange} />
              <Select name="type" value={form.type || ""} onChange={handleInputChange}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              <Input placeholder="Category" name="category" value={form.category || ""} onChange={handleInputChange} />
              <Input placeholder="Date" name="date" type="date" value={form.date || ""} onChange={handleInputChange} />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box w="100%">
        <Heading size="md">Filters</Heading>
        <Flex>
          <Select name="type" placeholder="Type" onChange={handleFilterChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Input placeholder="Category" name="category" onChange={handleFilterChange} />
          <Input placeholder="From" type="date" name="dateFrom" onChange={handleFilterChange} />
          <Input placeholder="To" type="date" name="dateTo" onChange={handleFilterChange} />
        </Flex>
      </Box>

      <Box w="100%">
        <Heading size="md">Transactions</Heading>
        <VStack spacing={2}>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </VStack>
      </Box>

      <Flex justifyContent="space-between" alignItems="center" w="100%">
        <Heading size="md">Total Balance: ${calculateBalance()}</Heading>
        <Button leftIcon={<FaFileDownload />} colorScheme="green" onClick={handleExport}>
          Export Transactions
        </Button>
      </Flex>
    </VStack>
  );
};

export default Index;