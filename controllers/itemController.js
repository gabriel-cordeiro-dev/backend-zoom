const { connectToDatabase } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createItem = async (req, res) => {
  try {
    const { ano, capacidade, mes, category, mes_num } = req.body;

    if (!ano || !capacidade || !mes || !category) {
      return res.status(400).json({ error: 'Please fill all fields.' });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO bronze.capacidade_producao (
        id,
        ano,
        capacidade,
        mes,
        category,
        mes_num
      ) VALUES ('${id}', '${ano}', '${capacidade}', '${mes}', '${category}', '${mes_num}')
    `;

    // Establish the database connection using connectToDatabase function
    connectToDatabase()
      .then(async (client) => {
        try {
          const session = await client.openSession();

          const queryOperation = await session.executeStatement(query, { runAsync: true });
          await queryOperation.completionPromise;

          await session.close();

          console.log('Item created successfully.');

          return res.status(201).json({ id, ano, capacidade, mes, category });
        } catch (error) {
          console.error('Database Error:', error);
          return res.status(500).json({ error: 'Error saving item in the database.' });
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        console.error('Database Connection Error:', error);
        return res.status(500).json({ error: 'Failed to connect to the database.' });
      });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAllItems = async (req, res) => {
    try {
      const query = 'SELECT * FROM bronze.capacidade_producao';
      const client = await connectToDatabase();
      const session = await client.openSession();
      const queryOperation = await session.executeStatement(query, { runAsync: true });
  
      const result = await queryOperation.fetchAll();
  
      if (result) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ error: 'No items found.' });
      }
    } catch (error) {
      console.error('Database Error:', error);
      return res.status(500).json({ error: 'Error fetching items from the database.' });
    }
};

const deleteItemById = async (req, res) => {
    try {
      const id = req.params.id;
  
      const query = `DELETE FROM bronze.capacidade_producao WHERE id = '${id}'`;
      const client = await connectToDatabase();
      const session = await client.openSession();
      const queryOperation = await session.executeStatement(query, { runAsync: true });
      await queryOperation.completionPromise;
  
      await session.close();
      client.close();
  
      return res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
      console.error('Database Error:', error);
      return res.status(500).json({ error: 'Error deleting item from the database.' });
    }
};

const updateItemById = async (req, res) => {
try {
    const id = req.params.id;

    const { ano, capacidade, mes, category, mes_num } = req.body;

    const query = `UPDATE bronze.capacidade_producao SET ano = '${ano}', capacidade = '${capacidade}', mes = '${mes}', category = '${category}', mes_num = '${mes_num}' WHERE id = '${id}'`;
    const client = await connectToDatabase();
    const session = await client.openSession();
    const queryOperation = await session.executeStatement(query, { runAsync: true });
    await queryOperation.completionPromise;

    await session.close();
    client.close();

    return res.status(200).json({ message: 'Item updated successfully.' });
} catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Error updating item from the database.' });
}
};

module.exports = {
  createItem,
  getAllItems,
  deleteItemById,
  updateItemById
};
