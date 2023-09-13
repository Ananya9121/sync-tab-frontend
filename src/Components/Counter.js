import React from 'react';

const Counter = ({ counter, onIncrement, onDecrement, onRemove }) => {
  return (
    <div>
      <h3>{counter.name}</h3>
      <p>Count: {counter.count}</p>
      <button onClick={onIncrement}>Increment</button>
      <button onClick={onDecrement}>Decrement</button>
      <button onClick={onRemove}>Remove</button>
    </div>
  );
};

export default Counter;
