This is a very basic marketplace application that allows users to put properties up for sale and then those properties can be purchased. Started using the truffle webpack box.

When the property is purchased using Metamask, etc. they should update and move to the "Properties Purchased Section"

Make sure to "truffle compile" and "truffle migrate" when testing. Also, this uses IPFS so you will have to install and have that running as well.

# Design Thinking
This dapp also uses the openzeppelin library and as I did not have time to implement ownership clauses, decided to go with a Pausable contract in the event of any vulnerabilities. As the openzeppelin library is implemented. Should any vulnerabilities be shown, I would implement other security measures as well but Pausable seemed like an appropriate one for this type of marketplace as the contract is relatively simple and should not have too many security vulnerabilities.
