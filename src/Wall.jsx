import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export default function Wall(){
    const [memoryList, setMemoryList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/memories')
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched data:", data);
                setMemoryList(data);
            })
            .catch((err) => {
                console.log(err);
            });
    },[]);
    
    return (
        <>
            {memoryList.length === 0 ? (
                <p>No memories yet.</p>
            ) : (
                <ul>
                    {memoryList.map((memory) => (
                        <li key={memory._id}>{memory.memory}</li>
                    ))}
                </ul>
            )}
            <Button onClick={() => navigate('/addmem')}>Add Memory</Button>
        </>
    );
    
}