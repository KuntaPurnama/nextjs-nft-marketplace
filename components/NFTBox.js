import { useMoralis, useWeb3Contract } from "react-moralis"
import { useState, useEffect } from "react"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import UpdateListingModal from "./UpdateListingModal"
import NftMarketplaceAbi from "../constants/NftMarketplace.json"
import { BigNumber } from "bignumber.js"
import { ethers } from "ethers"

const truncateStr = (fullstr, strlen) => {
    if (fullstr.lenght <= strlen) return fullstr

    const separator = "..."
    const separatorLength = separator.length
    const charsToShow = strlen - separatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)

    return (
        fullstr.substring(0, frontChars) + separator + fullstr.substring(fullstr.length - backChars)
    )
}

export default function NFTBox({ price, nftAddress, tokenId, marketPlaceAddress, seller }) {
    const [imageURI, setImageURI] = useState("")
    const { isWeb3Enabled, account } = useMoralis()
    const [tokenName, setTokenName] = useState()
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const dispatch = useNotification()
    const convertedPrice = new BigNumber(price).div(new BigNumber(10).pow(18))

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: 0,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: NftMarketplaceAbi,
        contractAddress: marketPlaceAddress,
        functionName: "buyItem",
        msgValue: ethers.utils.parseEther(convertedPrice.toString()),
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    // const { runContractFunction: getTokenCounter } = useWeb3Contract({
    //     abi: nftAbi,
    //     contractAddress: contractAddress,
    //     functionName: "getTokenCounter",
    // })

    async function updateUI() {
        const tokenURI = await getTokenURI()
        console.log(`token URI ${tokenURI}`)
        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller.toLowerCase() === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "You" : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              })
    }

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item Bought!",
            title: "Item Bought!",
            position: "topR",
        })
    }

    const hideModal = () => {
        setShowModal(false)
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            nftAddress={nftAddress}
                            marketPlaceAddress={marketPlaceAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height={"200"}
                                        width={"200"}
                                    />
                                    <div className="font-bold">
                                        Price : {convertedPrice.toString()}
                                        ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading....</div>
                )}
            </div>
        </div>
    )
}
