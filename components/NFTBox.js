import { useWeb3Contract } from "react-moralis"
import { useState } from "react"
import nftAbi from "../constants/BasicNft.json"

export default function NFTBox(price, nftAddress, tokenId, marketPlaceAddress, seller){
    const [imageURI, setImageURI] = useState("")

    const {runContractFunction: getTokenURI} = useWeb3Contract({
        abi: 
    })
}