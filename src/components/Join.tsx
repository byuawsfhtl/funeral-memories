import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import "../styles/forms.css";

export default function Join({ embedded = false }: { embedded?: boolean }) {
    const [groupId, setGroupId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [joinHover, setJoinHover] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const service = new FuneralMemoryService();

    const Wrapper: any = embedded ? "div" : "main";

    // Handles form submit OR direct param submit
    const handleJoin = async (e?: React.FormEvent, overrideGroupId?: string) => {
        if (e) e.preventDefault();

        const idToUse = overrideGroupId ?? groupId;
        if (!idToUse) return;

        setIsLoading(true);
        try {
            const group = await service.getGroup(idToUse);
            console.log("Group fetched:", group);

            if (group) {
                localStorage.setItem("madeGroup", JSON.stringify(group));
                navigate(`/wall`, { state: { madeGroup: group } });
            } else {
                alert("That group doesn't exist yet, double check the Group ID");
            }
        } catch (err) {
            console.error("Error fetching group:", err);
            alert("That group doesn't exist yet, double check the Group ID");
        } finally {
            setIsLoading(false);
        }
    };

    // If groupId is in the URL query params, auto-join
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paramGroupId = params.get("groupId");

        if (paramGroupId) {
            const lowerGroupId = paramGroupId.toLowerCase();
            setGroupId(lowerGroupId);
            handleJoin(undefined, lowerGroupId);
        }
    }, [location.search]);

    return (
        <Wrapper className={embedded ? "" : "form-main"}>
            <div>
                <div className="login-box">
                    <h1 className="form-title">Join Group</h1>
                    <p>Enter the Group ID to join and view memories.</p>
                    <br />

                    <form onSubmit={handleJoin}>
                        <div className="mb-3">
                            <label htmlFor="group-id" className="form-label">
                                Group ID <span className="text-danger">*<br /></span>
                            </label>
                            <input style={{ fontFamily: "DMSans", width:"100%", paddingTop:"8px", paddingBottom:"8px", paddingLeft:"12px", borderRadius:"5px", border:"1px solid #ccc" }}
                                type="text"
                                id="group-id"
                                className="form-control"
                                placeholder="XXXXX"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value.toLowerCase())}
                                required
                            />
                        </div>
                        <br />
                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-secondary btn-lg"
                                style={{
                                    backgroundColor: joinHover
                                        ? "#153443"
                                        : "#1C495E",
                                    color: "#FFFFF0",
                                    transition: "background 0.2s, border-color 0.2s",
                                }}
                                onMouseEnter={() => setJoinHover(true)}
                                onMouseLeave={() => setJoinHover(false)}
                                disabled={isLoading}
                            >
                                {isLoading ? "Joining..." : "Join Group"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Wrapper>
    );
}