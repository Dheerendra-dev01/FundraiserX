import { useState, useEffect } from "react"; 
import axios from "axios";
import BASE_URL from "../config";

const CreateCampaign = ({ web3, contract }) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        goal: "",
        deadline: "",
    });
    const [account, setAccount] = useState("");

    useEffect(() => {
        const loadAccount = async () => {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            } else {
                alert("Please connect your wallet.");
            }
        };
    
        if (web3) {
            loadAccount();
        }
    }, [web3]);

    const createCampaign = async () => {
        const { title, description, goal, deadline } = form;
        try {
            const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

            // Interact with the Smart Contract
            const data = await contract.methods
                .createCampaign(title, description, web3.utils.toWei(goal, "ether"), deadlineTimestamp)
                .send({ from: account });

            console.log("data-------->>>>", data);

            // Save the campaign in the backend
            await axios.post(`${BASE_URL}/api/campaigns`, {
                owner: account,
                title,
                description,
                goal,
                deadline,
            });
        } catch (err) {
            console.error("Error creating campaign:", err);
        }
    };

    return (
        <div>
            <h2>Create New Campaign</h2>
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
            </form>
        </div>
    );
};

export default CreateCampaign;
