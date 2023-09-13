import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Counter from './Counter';

function CounterList() {
  const [counters, setCounters] = useState([]);
  const [newCounterName, setNewCounterName] = useState('');
const api= 'http://localhost:3001/counters'
  // Function to update counters in localStorage and state
  const updateCounters = (updatedCounters) => {
    setCounters(updatedCounters);
    localStorage.setItem('counters', JSON.stringify(updatedCounters));
  };
  

  useEffect(() => {
    axios.get(api)
      .then((response) => {
        const initialCounters = response.data;
        // Check if counters exist in localStorage
        const storedCounters = JSON.parse(localStorage.getItem('counters'));
        if (storedCounters) {
          // If counters exist in localStorage, use them and update the state
          updateCounters(storedCounters);
        } else {
          // Otherwise, use counters from the backend and set them in localStorage
          updateCounters(initialCounters);
        }
      });

    // Create a Broadcast Channel to communicate with other tabs
    const broadcastChannel = new BroadcastChannel('counter-app');
    
    // Listen for messages from other tabs
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'updateCounters') {
        updateCounters(event.data.counters);
      }
    };

    return () => {
      // Clean up the Broadcast Channel when the component unmounts
      broadcastChannel.close();
    };
  }, []);

  const createCounter = () => {
    axios.post(api, { name: newCounterName })
      .then((response) => {
        const updatedCounters = [...counters, response.data];
        updateCounters(updatedCounters);
        setNewCounterName('');
        const broadcastChannel = new BroadcastChannel('counter-app');
        broadcastChannel.postMessage({ type: 'updateCounters', counters: updatedCounters });
      });
  };

  const incrementCounter = (id) => {
    axios.put(`${api}/increment/${id}`)
      .then((response) => {
        const updatedCounters = counters.map((counter) => (counter._id === id ? response.data : counter));
        updateCounters(updatedCounters);
        const broadcastChannel = new BroadcastChannel('counter-app');
        broadcastChannel.postMessage({ type: 'updateCounters', counters: updatedCounters });
      });
  };

  const decrementCounter = (id) => {
    axios.put(`${api}/decrement/${id}`)
      .then((response) => {
        const updatedCounters = counters.map((counter) => (counter._id === id ? response.data : counter));
        updateCounters(updatedCounters);
        const broadcastChannel = new BroadcastChannel('counter-app');
        broadcastChannel.postMessage({ type: 'updateCounters', counters: updatedCounters });
      });
  };

  const removeCounter = (id) => {
    axios.delete(`${api}/${id}`)
      .then(() => {
        const updatedCounters = counters.filter((counter) => counter._id !== id);
        updateCounters(updatedCounters);
        const broadcastChannel = new BroadcastChannel('counter-app');
        broadcastChannel.postMessage({ type: 'updateCounters', counters: updatedCounters });
      });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Counter Name"
        value={newCounterName}
        onChange={(e) => setNewCounterName(e.target.value)}
      />
      <button onClick={createCounter}>Create Counter</button>
      {counters.map((counter) => (
         <Counter
         key={counter._id}
         counter={counter}
         onIncrement={() => incrementCounter(counter._id)}
         onDecrement={() => decrementCounter(counter._id)}
         onRemove={() => removeCounter(counter._id)}
       />
      ))}
    </div>
  );
}

export default CounterList;
