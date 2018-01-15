// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: '0xe21822c5ca46db9e51b76d974122711e63c6241d', // default address to use for any transaction Truffle makes during migrations
      network_id: '*',
      gas: 4612388 // Gas limit used for deploys
    }
  }
}