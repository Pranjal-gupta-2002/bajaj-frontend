import { useState } from 'react';
import './JsonProcessor.css';  // Assuming you have CSS for styling

function JsonProcessor() {
  const [apiInput, setApiInput] = useState('{"data":["L","22","h","5","U","444","i","S","1"], "file_b64":""}');
  const [selectedFilters, setSelectedFilters] = useState(['all']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse and validate input
      const parsedInput = JSON.parse(apiInput);
      if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
        throw new Error("Invalid input: 'data' must be an array.");
      }

      const headersList = { "Content-Type": "application/json" };
      const response = await fetch("http://localhost:5000/bfhl", {
        method: "POST",
        body: JSON.stringify(parsedInput),
        headers: headersList,
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "An error occurred.");
        setResponseData(null);
      } else {
        setResponseData(data);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Invalid JSON input. Please check your input format.');
      setResponseData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Show All' },
    { value: 'alphabets', label: 'Alphabets' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'highest-lowercase', label: 'Highest lowercase alphabet' },
  ];

  const handleFilterChange = (value) => {
    setSelectedFilters((prev) => {
      if (value === 'all') return ['all'];
      const newFilters = prev.includes(value)
        ? prev.filter((f) => f !== value)
        : [...prev.filter((f) => f !== 'all'), value];
      return newFilters.length ? newFilters : ['all'];
    });
  };

  const getFilteredResponse = () => {
    if (!responseData) return null;
    if (selectedFilters.includes('all')) return JSON.stringify(responseData, null, 2);

    let result = {};
    if (selectedFilters.includes('alphabets')) result.alphabets = responseData.alphabets;
    if (selectedFilters.includes('numbers')) result.numbers = responseData.numbers;
    if (selectedFilters.includes('highest-lowercase')) result.highest_lowercase_alphabet = responseData.highest_lowercase_alphabet;

    return JSON.stringify(result, null, 2);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">BFHL API Tester</h1>
        <div className="input-section">
          <label htmlFor="api-input" className="label">API Input</label>
          <textarea
            id="api-input"
            value={apiInput}
            onChange={(e) => setApiInput(e.target.value)}
            className={`textarea ${errorMessage ? 'error' : ''}`}
            rows={4}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {responseData && (
          <>
            <div className="filter-section">
              <div className="filter-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="filter-header">
                  <span className="filter-label">Multi Filter</span>
                  <div className="filter-tags">
                    {selectedFilters.map((filter) => (
                      <span key={filter} className="filter-tag">
                        {filterOptions.find((option) => option.value === filter).label}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </div>
              {isDropdownOpen && (
                <div className="filter-options">
                  {filterOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`filter-option ${selectedFilters.includes(option.value) ? 'selected' : ''}`}
                      onClick={() => handleFilterChange(option.value)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(option.value)}
                        readOnly
                        className="checkbox"
                      />
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="response-section">
              <h2 className="filtered-heading">Filtered Response</h2>
              <pre className="filtered-response">{getFilteredResponse()}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default JsonProcessor;
