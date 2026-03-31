import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">Notely</h1>
        <p className="text-gray-600 mb-6">Offline Smart Note & Todo PWA</p>
        <div className="space-x-4">
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Count: {count}
          </button>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Check <code>guideline.md</code> in the <code>doc</code> folder for next steps.
        </p>
      </div>
    </div>
  );
}

export default App;
