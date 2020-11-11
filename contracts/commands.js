let instance = await CoinFlip.deployed()

instance = await CoinFlip.deployed()


instance.addLiquidity({value: web3.utils.toWei("4", "ether")})

instance.guess(1, {value: web3.utils.toWei("1", "ether")})

instance.getResult()

instance.getPayout()

instance.random()
