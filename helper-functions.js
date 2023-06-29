// we can't have these functions in our `helper-hardhat-config`
// since these use the hardhat library
// and it would be a circular dependency
const { run } = require("hardhat")

const contractSolfile = "contracts/OmarToken.sol"


/**
  * @Notice Please use the contract parameter with one of the following contracts:
  * @openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20
  * contracts/OmarToken.sol:OmarToken
  * For example:
  *   hardhat verify --contract contracts/Example.sol:ExampleContract <other args>
  * If you are running the verify subtask from within Hardhat instead:
  *   await run("verify:verify", {
  *     <other args>,    
  * contract: "contracts/Example.sol:ExampleContract"
 */
 

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            constructorArguments: args,
            contract: contractSolfile + ":" + "OmarToken",
            address: contractAddress,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    verify,
}
