import NFTBox from "@/components/NFTBox"
import { useMoralis, useMoralisQuery } from "react-moralis"
import contractAddress from "../constants/contractAddresses.json"
import { useQuery } from "@apollo/client"
import GET_ACTIVE_ITEMS from "@/constants/subGraphQueries"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const nftMarketPlaceAddress = contractAddress[chainString]["NftMarketplace"]

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading....</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            const { price, nftAddress, tokenId, seller } = nft
                            console.log("nft", nft)
                            return (
                                <div className="m-2">
                                    <NFTBox
                                        price={price}
                                        nftAddress={nftAddress}
                                        tokenId={tokenId}
                                        marketPlaceAddress={nftMarketPlaceAddress}
                                        seller={seller}
                                    />
                                </div>
                            )
                        })
                    )
                ) : (
                    <div>WEB 3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
