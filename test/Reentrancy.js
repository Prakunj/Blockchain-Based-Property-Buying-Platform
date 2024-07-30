const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const formatTokens = (n) => {
    return ethers.utils.formatEther(n)
}

describe('Reentrancy', () => {
    let deployer, bank, user, attacker, attackerContact;


    beforeEach(async () => {

        [deployer, user, attacker] = await ethers.getSigners();

        const Bank = await ethers.getContractFactory('Bank', deployer);
        bank = await Bank.deploy();

        await bank.deposit({ value: tokens('100') })
        await bank.connect(user).deposit({ value: tokens('50') })
        
        const Attacker = await ethers.getContractFactory('Attacker', attacker);
        attackerContact = await Attacker.deploy(bank.address);
    })


    describe('facilitates deposits and withdraws', async () => {
        it('accepts deposits', async () => {

            const deployerBalance = await bank.balanceOf(deployer.address);
            expect(deployerBalance).to.be.equal(tokens('100'))

            const userBalance = await bank.balanceOf(user.address);
            expect(userBalance).to.be.equal(tokens('50'))
            
        })

        it('accepts withdraws', async () => {

            await bank.withdraw();

            const deployerBalance = await bank.balanceOf(deployer.address);
            expect(deployerBalance).to.be.equal(tokens(0))

            const userBalance = await bank.balanceOf(user.address);
            expect(userBalance).to.be.equal(tokens('50'))
            
        })

        it('allows attack to drain funds from bank', async () => {
            console.log('BEFORE - ')
            console.log('bank balance', ethers.utils.formatEther(await ethers.provider.getBalance(bank.address)));
            console.log('attacker balance', ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)));

            await attackerContact.attack({ value: tokens(10) });

            console.log('AFTER - ')
            console.log('bank balance', ethers.utils.formatEther(await ethers.provider.getBalance(bank.address)));
            console.log('attacker balance', ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)));

            expect(await ethers.provider.getBalance(bank.address)).to.eq(0);
        })
    })
})