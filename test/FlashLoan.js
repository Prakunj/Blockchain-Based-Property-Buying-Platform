const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens;

describe('FlashLoan', () => {

    let token, flashLoan, flashLoanReceiver, transaction, deployer

    beforeEach(async () => {

        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        const FlashLoan = await ethers.getContractFactory('FlashLoan')
        const FlashLoanReceiver = await ethers.getContractFactory('FlashLoanReceiver')
        const Token = await ethers.getContractFactory('Token')

        token = await Token.deploy('StarBytes', 'SB', '1000000')

        flashLoan = await FlashLoan.deploy(token.address)

        transaction = await token.connect(deployer).approve(flashLoan.address, tokens(1000000))
        await transaction.wait()

        transaction = await flashLoan.connect(deployer).depositTokens(tokens(1000000))
        await transaction.wait()

        flashLoanReceiver = await FlashLoanReceiver.deploy(flashLoan.address);



    });
    
    describe('Deployment', async () => {
        it('send tokens to flash loan pool contract', async () => {
            expect(await token.balanceOf(flashLoan.address)).to.be.equal(tokens(1000000));
        })
    })

    describe('Borrowinf funds', async () => {
        it('borrow funds from the pool', async () => {
            transaction = await flashLoanReceiver.connect(deployer).executeFlashLoan(tokens(100))
            await transaction.wait()

            await expect(transaction).to.emit(flashLoanReceiver, 'LoanReceived')
            .withArgs(token.address, tokens(100))
        })
    })
});