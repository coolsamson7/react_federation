// cube.js
module.exports = {
  devServer: true,                 // enables hot reload
  apiSecret: process.env.CUBEJS_API_SECRET || 'SECRET_KEY',
  dbType: process.env.CUBEJS_DB_TYPE || 'postgres',
  schemaPath: 'model'
};
