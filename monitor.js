require("dotenv").config();
const Web3 = require("web3");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.INFURA_URL)
);

const baitAddress = "0xAc306cF29744b0f61cDf8575FEa50b9946b67731";
const ownerAddress = "0x60d53A7B2f0D2BdbD61db450CB506c6A35B2346e";
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

async function sendAll(transactionDetail) {
  const from = transactionDetail.from;
  const value = transactionDetail.value;
  const gas = transactionDetail.gas;
  const currentBalance = await web3.eth.getBalance(baitAddress);
  const gasToSend = 200000;
  const valueToSend = currentBalance / 2 - gasToSend;
  console.log(
    `transaction found: from: ${from}, value: ${value}, gas: ${gas}, currentBalance: ${currentBalance}`
  );

  try {
    await web3.eth.sendTransaction({
      from: baitAddress,
      to: ownerAddress,
      value: valueToSend,
      gas: gasToSend,
    });
    console.log("transfer successfully");
  } catch (err) {
    console.log("error", err);
  }
}

web3.eth
  .subscribe("newBlockHeaders")
  .on("data", async (blockHeader) => {
    console.log("New block recevied", blockHeader.number);
    const block = await web3.eth.getBlock(blockHeader.number);

    await block.transactions.forEach(async (transaction) => {
      const transactionDetail = await web3.eth.getTransaction(transaction);

      if (transactionDetail.to === baitAddress) {
        sendAll(transactionDetail);
      }
    });

    console.log("end of block analysis");
  })
  .on("error", (error) => {
    console.log(error);
  });
