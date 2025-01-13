import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import crowdfundingABI from "./components/CrowdfundingABI.json";
import BASE_URL from "./config";
import "./index.css";

const CONTRACT_ADDRESS = "0x4c4801e3280C4DF3bEeE5F6034C758f11ab50F4d";

function App() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [showCreate, setShowCreate] = useState(true);
    const [form, setForm] = useState({
        title: "",
        description: "",
        goal: "",
        deadline: "",
    });

    // Initialize Web3 and Smart Contract
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);

                const contractInstance = new web3Instance.eth.Contract(crowdfundingABI, CONTRACT_ADDRESS);
                setContract(contractInstance);

                fetchCampaignsFromBackend();
            } else {
                alert("Please install MetaMask!");
            }
        };

        initWeb3();
    }, []);

    // Fetch campaigns from backend
    const fetchCampaignsFromBackend = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns`);
            setCampaigns(response.data);
        } catch (err) {
            console.error("Error fetching campaigns from backend:", err);
        }
    };

    // Create a new campaign
    const createCampaign = async () => {
        const { title, description, goal, deadline } = form;
        try {
            const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

            // Interact with the Smart Contract
            await contract.methods
                .createCampaign(title, description, web3.utils.toWei(goal, "ether"), deadlineTimestamp)
                .send({ from: account });

            // Save the campaign in the backend
            await axios.post(`${BASE_URL}/api/campaigns`, {
                owner: account,
                title,
                description,
                goal,
                deadline,
            });

            fetchCampaignsFromBackend();
            setShowCreate(false);
        } catch (err) {
            console.error("Error creating campaign:", err);
        }
    };

    // Contribute to a campaign
    const contributeToCampaign = async (id, amount) => {
        try {
            const campaignId = parseInt(id);
    
            // Ensure the contribution is at least 0.1 ETH
            if (parseFloat(amount) < 0.1) {
                alert("Contribution must be at least 0.1 ETH.");
                return;
            }
    
            // Convert amount to Wei
            const valueInWei = web3.utils.toWei(amount.toString(), "ether");
    
            // Ensure valid Wei conversion
            if (isNaN(valueInWei) || valueInWei <= 0) {
                alert("Invalid contribution amount.");
                return;
            }
    
            // Set gas price and limit to ensure the transaction is processed
            const gasPrice = web3.utils.toWei('20', 'gwei'); // You can adjust this if needed
            const gasLimit = 500000; // Set the gas limit according to your contract's requirements
    
            // Interact with the Smart Contract
            await contract.methods.contribute(campaignId).send({
                from: account,
                value: valueInWei,
                gas: gasLimit,
                gasPrice: gasPrice
            });
    
            // Call backend API
            await axios.post(`${BASE_URL}/api/campaigns/${campaignId}/contribute`, {
                contributor: account,
                amount: parseFloat(amount),
            });
    
            fetchCampaignsFromBackend();
        } catch (err) {
            console.error("Error contributing:", err);
            alert("Transaction failed. Please check your MetaMask or try again later.");
        }
    };
    
    
    


    return (
        <div>
            <h1>Crowdfunding Platform</h1>
            <p>Connected Wallet: {account}</p>
            {showCreate ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createCampaign();
                    }}
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                    ></textarea>
                    <input
                        type="number"
                        placeholder="Goal (in ETH)"
                        value={form.goal}
                        onChange={(e) => setForm({ ...form, goal: e.target.value })}
                        required
                    />
                    <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        required
                    />
                    <button type="submit">Create Campaign</button>
                    <button
                        type="button"
                        onClick={() => setShowCreate(false)}
                        style={{
                            marginLeft: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#007BFF",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        View All Campaigns
                    </button>
                </form>
            ) : (
                <>
                    <h2>Available Campaigns</h2>
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        style={{
                            marginBottom: "20px",
                            padding: "8px 16px",
                            backgroundColor: "#28A745",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Add Campaign
                    </button>
                    {campaigns.map((campaign) => (
                        <div
                            key={campaign._id}
                            style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
                        >
                            <h3>{campaign.title}</h3>
                            <p>{campaign.description}</p>
                            <p>Goal: {web3.utils.fromWei(campaign.goal, "ether")} ETH</p>
                            <p>Raised: {web3.utils.fromWei(campaign.raised.toString(), "ether")} ETH</p>
                            <p>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</p>
                            <p>Owner: {campaign.owner}</p>
                            {campaign.completed ? (
                                <p>Status: Completed</p>
                            ) : (
                                <div>
                                    <input
                                        type="number"
                                        placeholder="Amount (in ETH)"
                                        id={`contribution-${campaign._id}`}
                                    />
                                    <button
                                        onClick={() =>
                                            contributeToCampaign(
                                                campaign._id,
                                                document.getElementById(`contribution-${campaign._id}`).value
                                            )
                                        }
                                        style={{
                                            padding: "8px 16px",
                                            backgroundColor: "#FFC107",
                                            color: "#000",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Contribute
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default App;
