import { ethers } from "ethers";

// Function to sign a message with the connected wallet
const signMessage = async (data) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found. Please install it.");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const message = `{
      address: ${data},
      timestamp: ${parseInt(Date.now() / 1000)},
    }`;
    const signature = await signer.signMessage(message);
    const wallet_address = await signer.getAddress();
    return {
      message,
      signature,
      wallet_address,
    };
  } catch (error) {
    console.log(error);
  }
};

export default signMessage;
