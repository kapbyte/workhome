import express from 'express';
import { sequelize } from './model/model.js';
import router from './config/router/index.js';

const app = express();
app.use(express.json());

app.set('sequelize', sequelize);
app.set('models', sequelize.models);
router(app);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Ensure that the database is synced before starting the server
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Express App Listening on Port ${PORT}`);
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
};

startServer();

export default app;
