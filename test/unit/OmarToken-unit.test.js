const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
    developmentChains,
    INITIAL_SUPPLY,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("OmarToken Unit Test", function () {
          //Multipler is used to make reading the math easier because of the 18 decimal points
          const multiplier = 10 ** 18
          let omarToken, deployer, user1, accounts, omarTokenContract
          beforeEach(async function () {
              accounts = await getNamedAccounts()
              deployer = accounts.deployer
              user1 = accounts[1]

              await deployments.fixture("all")
              omarToken = await ethers.getContract("OmarToken", deployer)
          })

          it("was deployed", async () => {
              assert(omarToken.target)
          })

          describe("constructor", () => {
              it("Should have correct INITIAL_SUPPLY of token ", async () => {
                  const totalSupply = await omarToken.totalSupply()
                  assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
              })
              it("initializes the token with the correct name and symbol ", async () => {
                  const name = (await omarToken.name()).toString()
                  assert.equal(name, "OmarToken")

                  const symbol = (await omarToken.symbol()).toString()
                  assert.equal(symbol, "OMAT")
              })
          })

          describe("transfers", () => {
              let user1Balance
              it("Should be able to transfer tokens successfully to an address", async () => {
                  const tokensToSend = ethers.parseEther("10")
                  await omarToken.transfer(user1, tokensToSend)
                  user1Balance = await omarToken.balanceOf(user1)
                  expect(Number(user1Balance)).to.be.greaterThan(
                      Number(tokensToSend)
                  )
              })
              it("emits a transfer event, when an transfer occurs", async () => {
                  /**
                   * @Notice Since Openzeppelin ERC20 are Proxy contracts, an event is not emitted in the same way as in a standardt contract.
                   * Therefore, Chai expect().to.emit() will not work. Instead, we need to use the following method.
                   */
                  const receipt = await omarToken.transfer(user1, 5)
                  const tx = await receipt.wait()
                  //expect().to.emit(omarToken.interface, "Transfer")
                  assert.equal(tx.logs[0].eventName, "Transfer")
              })
          })
          describe("allowances", () => {
              const amount = (20 * multiplier).toString()
              beforeEach(async () => {
                  playerToken = await ethers.getContract("OmarToken", user1)
              })
              it("Should approve other address to spend token", async () => {
                  const tokensToSpend = ethers.parseEther("5")
                  //Deployer is approving that user1 can spend 5 of their precious OMAT's
                  await omarToken.approve(user1, tokensToSpend)
                  await playerToken.transferFrom(deployer, user1, tokensToSpend)
                  const user1Balance = await playerToken.balanceOf(user1)
                  expect(Number(user1Balance)).to.be.greaterThan(
                      Number(tokensToSpend)
                  )
              })
              it("doesn't allow an unnaproved member to do transfers", async () => {
                  try {
                      const receipt = await playerToken.transferFrom(
                          deployer,
                          user1,
                          amount
                      )
                  } catch (error) {
                      //expect().to.equal("ERC20: insufficient allowance")
                      expect(error.message).to.include(
                          "ERC20: insufficient allowance"
                      )
                  }
              })
              it("emits an approval event, when an approval occurs", async () => {
                  /**
                   * @Notice Since Openzeppelin ERC20 are Proxy contracts, an event is not emitted in the same way as in a standardt contract.
                   * Therefore, Chai expect().to.emit() will not work. Instead, we need to use the following method.
                   */
                  const receipt = await omarToken.approve(user1, amount)
                  const tx = await receipt.wait()
                  assert.equal(tx.logs[0].eventName, "Approval")
                  //await expect(ourToken.approve(user1, amount)).to.emit(omarToken,"Approval")
              })
              it("the allowance being set is accurate", async () => {
                  await omarToken.approve(user1, amount)
                  const allowance = await omarToken.allowance(deployer, user1)
                  assert.equal(allowance.toString(), amount)
              })
              it("won't allow a user to go over the allowance", async () => {
                  await omarToken.approve(user1, amount)

                  try {
                      await playerToken.transferFrom(
                          deployer,
                          user1,
                          (40 * multiplier).toString()
                      )
                  } catch (error) {
                      expect(error.message).to.include(
                          "ERC20: insufficient allowance"
                      )
                  }
              })
          })
      })
