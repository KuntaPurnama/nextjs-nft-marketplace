const Moralis = require("moralis-v1/node")
const Chains = require("@moralisweb3/common-evm-utils")
const EvmChain = Chains.EvmChain
const ABI = require("./constants/abi.json")
const contractAddresses = require("./constants/contractAddresses.json")
require("dotenv").config()
const API_KEY = process.env.MORALIS_API_KEY

const chainId = process.env.chainId || 31337
const CONTRACT_ADDRESS = contractAddresses[chainId]["NftMarketplace"]
const moralisChainId = chainId == "31337" ? "1337" : chainId
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER
const APP_ID = process.env.NEXT_PUBLIC_APP_ID
const MASTER_KEY = process.env.NEXT_PUBLIC_MASTER_KEY

// async function main() {
//     console.log("chain ID", Chains.EvmChain)
//     console.log("chain Ids", moralisChainId)
//     const options = {
//         chains: [moralisChainId],
//         includeContractLogs: true,
//         tag: "Item Listed",
//         description: "Listen NFT Market Place Events",
//         abi: [
//             {
//                 anonymous: false,
//                 inputs: [
//                     {
//                         indexed: true,
//                         internalType: "address",
//                         name: "seller",
//                         type: "address",
//                     },
//                     {
//                         indexed: true,
//                         internalType: "address",
//                         name: "nftAddress",
//                         type: "address",
//                     },
//                     {
//                         indexed: true,
//                         internalType: "uint256",
//                         name: "tokenId",
//                         type: "uint256",
//                     },
//                     {
//                         indexed: false,
//                         internalType: "uint256",
//                         name: "price",
//                         type: "uint256",
//                     },
//                 ],
//                 name: "ItemListed",
//                 type: "event",
//             },
//         ],
//         topic0: ["ItemListed(address,address,uint256,uint256)"],
//         webhookUrl: "https://22be-2001-2003-f58b-b400-f167-f427-d7a8-f84e.ngrok.io/webhook",
//     }
//     await Moralis.start({ apiKey: API_KEY })
//     console.log("go here")
//     const stream = await Moralis.Streams.add(options)
//     const { id } = stream.toJSON()
//     console.log("stream fill : ", stream)
//     await Moralis.Streams.addAddress({
//         id: id,
//         address: [CONTRACT_ADDRESS],
//     })
// }

async function main() {
    console.log("serper ", SERVER_URL)
    console.log("contract address", CONTRACT_ADDRESS)
    await Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID, masterKey: MASTER_KEY })
    console.log(`Working with contract address ${CONTRACT_ADDRESS}`)

    let ItemListedOptions = {
        // Mortalis understands a local chain is 1337
        chainId: moralisChainId,
        address: CONTRACT_ADDRESS,
        sync_historical: true,
        topic: "ItemListed(address, address, uint256, uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemListed",
            type: "event",
        },
        tableName: "ItemListed",
    }

    let ItemBoughtOptions = {
        chainId: moralisChainId,
        address: CONTRACT_ADDRESS,
        topic: "ItemBought(address, address, uint256, uint256)",
        sync_historical: true,
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "buyer",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemBought",
            type: "event",
        },
        tableName: "ItemBought",
    }

    let ItemCanceledOptions = {
        chainId: moralisChainId,
        address: CONTRACT_ADDRESS,
        topic: "ItemCanceled(address, address, uint256)",
        sync_historical: true,
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "ItemCanceled",
            type: "event",
        },
        tableName: "ItemCanceled",
    }

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", ItemListedOptions, {
        useMasterKey: true,
    })
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", ItemBoughtOptions, {
        useMasterKey: true,
    })

    const canceledResponse = await Moralis.Cloud.run("watchContractEvent", ItemCanceledOptions, {
        useMasterKey: true,
    })
    if (listedResponse.success && canceledResponse.success && boughtResponse.success) {
        console.log("Success! Database Updated with watching event")
    } else {
        console.log("Something went wrong...")
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
