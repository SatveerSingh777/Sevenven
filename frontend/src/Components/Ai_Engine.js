import react from 'react';
import ChatBox from './Chatbox/ChatBox';

function Ai_Engine(){

    const handleData = (data) =>{
        console.log(data);
        const response = await fetch("${process.env.REACT_APP_BASE_URL}/api/ai", {
            method: "POST",
            headers: {
                        "Content-Type": "application/json"
                        },
            body: JSON.stringify({
            messages: [{ role: "user", content: data }] })
    });

const getData = await response.json();
console.log(getData);
    }

    

    return(
        <>
        <ChatBox onSend={handleData}/>
        </>
    );
}

export default Ai_Engine;