const { connectToDatabase, findUserByEmail } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
    const { email, senha } = req.body;
  
    if (!email || !senha) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }
  
    // Verifique se o e-mail possui o domínio correto
    if (!email.endsWith('@zoomtecnologia.com.br')) {
      return res.status(400).json({ error: 'Invalid email domain. Only @zoomtecnologia.com.br is allowed.' });
    }
  
    try {
      // Verifique se o usuário já está cadastrado
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists.' });
      }
  
      // Crie um ID único para o novo usuário
      const userId = uuidv4();
  
      // Criptografe a senha usando bcrypt
      const hashedPassword = await bcrypt.hash(senha, 10);
  
      // Insira o novo usuário no banco de dados
      const query = `INSERT INTO bronze.logins (id, email, senha) VALUES ('${userId}', '${email}', '${hashedPassword}')`;
      const client = await connectToDatabase();
      const session = await client.openSession();
      const queryOperation = await session.executeStatement(query, { runAsync: true });
      await queryOperation.completionPromise;
      await session.close();
      client.close();
  
      return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Registration Error:', error);
      return res.status(500).json({ error: 'Error during user registration.' });
    }
  };

  const login = async (req, res) => {
    const { email, senha } = req.body;
  
    if (!email || !senha) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }
  
    try {
      const user = await findUserByEmail(email);
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
  
      // Compare a senha usando bcrypt
      const passwordMatch = await bcrypt.compare(senha, user.senha);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
  
      const token = jwt.sign({ userId: user.id, userEmail: user.email }, 'your-secret-key', { expiresIn: '1h' });
  
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Authentication Error:', error);
      return res.status(500).json({ error: 'Error during authentication.' });
    }
  };
  

module.exports = { register,login };
