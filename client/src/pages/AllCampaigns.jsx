import { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";

const AllCampaigns = ({ web3, contract }) => {
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        const fetchCampaignsFromBackend = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/campaigns`);
                setCampaigns(response.data);
                console.log("Fetched campaigns:", response.data); // Debug
            } catch (err) {
                console.error("Error fetching campaigns from backend:", err);
            }
        };
        fetchCampaignsFromBackend();
    }, []);

    const contributeToCampaign = async (id, amount) => {
        try {
            const campaignId = parseInt(id);

            if (parseFloat(amount) < 0.1) {
                alert("Contribution must be at least 0.1 ETH.");
                return;
            }

            const valueInWei = web3.utils.toWei(amount.toString(), "ether");

            const accounts = await web3.eth.getAccounts();

            await contract.methods.contribute(campaignId).send({
                from: accounts[0], // Use current wallet
                value: valueInWei,
            });

            alert("Contribution successful!");
        } catch (err) {
            console.error("Error contributing:", err);
            alert("Transaction failed. Please check your MetaMask or try again later.");
        }
    };

    return (
        <div>
            <h2>Available Campaigns</h2>
            {campaigns.length === 0 ? (
                <p>No campaigns found.</p>
            ) : (
                campaigns.map((campaign) => (
                    <div
                        key={campaign._id}
                        style={{
                            border: "1px solid #ccc",
                            margin: "10px",
                            padding: "10px",
                            borderRadius: "8px",
                            background: "#f9f9f9",
                        }}
                    >
                        <h3>{campaign.title}</h3>
                        <p>{campaign.description}</p>
                        <p><strong>Goal:</strong> {parseFloat(campaign.goal).toFixed(2)} ETH</p>
                        <p><strong>Raised:</strong> {parseFloat(campaign.raised).toFixed(2)} ETH</p>
                        <p><strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}</p>
                        <p><strong>Owner:</strong> {campaign.owner}</p>
                        <div>
                            <input
                                type="number"
                                placeholder="Amount (in ETH)"
                                id={`contribution-${campaign._id}`}
                                style={{ marginRight: "8px" }}
                            />
                            <button
                                onClick={() =>
                                    contributeToCampaign(
                                        campaign._id,
                                        document.getElementById(`contribution-${campaign._id}`).value
                                    )
                                }
                            >
                                Contribute
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AllCampaigns;
