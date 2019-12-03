# 🔱 Test-Assignment-Metaquotes.js
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Test assignment for Metaquotes

### [Read the assignment](https://www.metaquotes.net/ru/company/vacancies/tests/javascript)

## Foreword

This application was written in plain JS without using any libraries. 
This means that there are no frameworks or dependencies getting in the way of learning how it works.
It represents temperature and precipitation graphics serverd from IndexedDB, 
or in case when data is not found there, loaded from local server
By default an application shows the temperature chart from 1886 to 2006
In order to change chart / data range, a user need to pic a nuew data from the drop down box and click
either temperature or precipitation button (depends on which chart user wants to see)

## Author

- [Igor Vasiliev](https://github.com/TheHelmsman/)

## How to install
```
git clone https://github.com/TheHelmsman/test-addignment-metaquotes.git
```

### Next step
```
yarn install
```

### How to run
Application depends on two json files which can be served using simple server
To run server use follwing command
```
cd server
node server.js
```

In order to start application in development mode, use following command
```
yarn start
```

To build application use
```
yarn build
```

## License

This project is open source and available under the [MIT License](LICENSE).