# On-chain CV contract

## Content

- [About](#about)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Testing](#testing)
- [References](#references)

## About

This is a smart contract to store and update personal CV information on the Ethereum Blockchain.
It has only one interactive feature - user can set likes on published cases.

Actually it is just a simple way to show to potential employer my performance level, but you can use
the idea  for any purposes. And now you are reading an example of how I can write `README.md` files.

You can see the realisation of this project [here](https://asolovov-crypto-cv.vercel.app/). Also
check front-end app repository [here](https://github.com/asolovov/cryptocv-front).

## Getting started

Start with cloning the repository by running `git clone` and installing all the dependencies:

```bash
npm install
```

Add `.env` file. You can see example in `./.env.example`. Be informed, that crating `.env` file is
obligatorily. Variables required:
- `PROVIDER_URL` - is a provider URL to deploy the contract. For example [Infura](https://www.infura.io/)
- `PRIVATE_KEY` - is your blockchain wallet private key. If you use metamask,
  that [is how you can export it](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key#:~:text=On%20the%20account%20page%2C%20click,click%20%E2%80%9CConfirm%E2%80%9D%20to%20proceed.)
- `ETHERSCAN_API_KEY` - [Etherscan API key](https://etherscan.io/apis) to automatically validate deployed contract. If
  you do not want to deploy contract on external blockchain, or you want to validate it manualy just
  leave the variable blank `""` and change the `scripts/deploy.ts` file.

Finally run following command to check, that project is installed correctly:

```bash
npx hardhat test
```

## Usage

Contract has several simple methods that you can use to get, add, update and delete data.
Basically smart-contract is playing role of a back-end app that communicates with blockchain where
all CV information is stored.

### Main info

#### Model

Truncated example of data stored in my current CV. If you want to use this contract with provided
front-end app, data model should be the same. Otherwise, you can store here any string data.

```json
{
  "name": "Andrey Solovov",
  "position": "Blockchain Developer",
  "hello": "Hello there! Welcome to my crazy web3 CV...",
  "helloPDF": "Hello there! Welcome to my offline CV...",
  "location": "Tbilisi, Georgia",
  "background": "Since 2017, I have worked as...",
  "education": [
    { "year": 2013, "description": "Griboedov Institute ..." }
  ],
  "contacts": {
    "email": { "value": "andre.solovov@gmail.com", "link": "" },
    "tg": { "value": "@sigurdrus", "link": "https://t.me/sigurdrus" },
    "linkedIn": { "value": "andrey-solovov", "link": "https://www.linkedin.com/in/andrey-solovov-bb665884" },
    "github": { "value": "/asolovov", "link": "https://github.com/asolovov" }
  },
  "skills": [
    { "name": "Solidity", "description": "Strong knowledge, main cases, QA" }
  ]
}
```

#### Update Main Info

- method: `updateMainInfo`
- type: `write`
- params: `info: string`
- requirements: only contract owner

#### Get Main Info

- method: `getMainInfo`
- type: `read`
- returns: `string`

### Cases

#### Model

Case data has the following structure:

```solidity
struct Case {
    uint256 id;        // Sets automatically when case added 
    string info;       // JSON string
    uint256 startDate; // Timestamp (I use epoch type). Can not be 0
    uint256 endDate;   // Timestamp (I use epoch type)
    uint256 likes;     // Sets automatically when like is set
}
```

Truncated example of a case `info` field stored in my current CV. If you want to use this contract with provided
front-end app, data model should be the same. Otherwise, you can store here any string data.

```json
{
  "name": "Project name",
  "link": "https://url",
  "performance": "QA: test cases with...",
  "team": "Uddug",
  "description": "The contract implemented the ERC721 standard...",
  "features": [
    "Public and private sale",
    "Deny-listing addresses",
    "Freezing collection",
    "Editions of ERC721 tokens"
  ]
}
```

#### Add case

- method: `addCase`
- type: `write`
- params: 
  - `info: string` 
  - `startDate: uint256` 
  - `endDate: uint256`
- requirements: 
  - only contract owner
  - `startDate` cant not be 0

**Notes:** 
Start date uses as a validation field to check, if given case ID refers to a deleted or valid case. 

#### Update case

- method: `updateCase`
- type: `write`
- params:
    - `caseId: uint256`
    - `info: string`
    - `startDate: uint256`
    - `endDate: uint256`
- requirements:
    - only contract owner
    - `startDate` cant not be 0
    - `caseId` should be valid

#### Remove case

- method: `removeCase`
- type: `write`
- params:
    - `caseId: uint256`
- requirements:
    - only contract owner
    - `caseId` should be valid


- `getTotalCases`

**Notes:**
This method decreases `totalLikes` variable

#### Get case

- method: `getCase`
- type: `read`
- params:
    - `caseId: uint256`
- requirements:
    - `caseId` should be valid
- returns: `Case` data struct

#### Get cases

- method: `getCases`
- type: `read`
- returns: `Case` data struct array `[]`

#### Get total cases

- method: `getTotalCases`
- type: `read`
- returns: `uint256` total number of not deleted cases

### Likes

#### Set like

- method: `setLike`
- type: `write`
- params:
    - `caseId: uint256`
- requirements:
    - `caseId` should be valid
    - one user (address) can set only one like on each case

**Notes:**
This method increases `totalLikes` variable and increases `likes` field in `Case` data struct

#### Get total likes

- method: `getTotalLikes`
- type: `read`
- returns: `uint256` total likes number

## Testing

This project includes a suite of unit tests that can be used to verify the functionality of the 
contract. Remember to do all the tasks described in [Getting started](#getting-started)

```bash
npx hardhat test
```

## References

This project makes use of the following external resources:

- The [OpenZeppelin](https://openzeppelin.com/) library for smart contract development and contract upgrades.
- The [hardhat](https://hardhat.org/) development environment for testing and deployment.
- The [ethers.js](https://docs.ethers.io/ethers.js/html/) library for interacting with the Ethereum network.