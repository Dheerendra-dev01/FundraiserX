import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from "web3";
import axios from "axios";
import crowdfundingABI from "./components/CrowdfundingABI.json";
import BASE_URL from "./config";
import "./index.css";
import { Navigate } from "react-router-dom";

// Import pages
import CreateCampaign from "./pages/CreateCampaign.jsx";
import AllCampaigns from "./pages/AllCampaigns.jsx";

const CONTRACT_ADDRESS = "0x4c4801e3280C4DF3bEeE5F6034C758f11ab50F4d";

function App() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);

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
            } else {
                alert("Please install MetaMask!");
            }
        };

        initWeb3();
    }, []);

    return (
        <Router>
            <div>
                <h1>Crowdfunding Platform</h1>
                <p>Connected Wallet: {account}</p>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">View All Campaigns</Link>
                        </li>
                        <li>
                            <Link to="/create">Create Campaign</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route
                        path="/"
                        element={<AllCampaigns web3={web3} contract={contract} />}
                    />
                    <Route
                        path="/create"
                        element={<CreateCampaign web3={web3} contract={contract} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
