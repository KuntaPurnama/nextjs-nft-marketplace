import { useMoralisQuery } from "react-moralis"
export default function Home() {
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem",
        (query) => query.limit(10).descending("tokenId")
    )

    console.log("listedNFts", listedNfts)
    console.log("listedNFts attributes", listedNfts.attributes)
    return <div>Home Page</div>
}
