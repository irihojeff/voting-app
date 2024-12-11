import React, { useState, useEffect } from 'react';
import { voting_app_backend } from 'declarations/voting_app_backend';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  // State Management
  const [votes, setVotes] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userId, setUserId] = useState('');
  const [candidate, setCandidate] = useState('');
  const [newCandidate, setNewCandidate] = useState('');
  const [voteCounts, setVoteCounts] = useState([]);
  const [votingOpen, setVotingOpen] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState({
    votes: true,
    voteCounts: true,
    candidates: true,
    votingStatus: true
  });

  // Initial Setup and Data Fetching
  useEffect(() => {
    async function initializeApp() {
      try {
        setIsLoading(prev => ({ ...prev, candidates: true }));
        await refreshCandidates();
        
        setIsLoading(prev => ({ ...prev, votes: true }));
        await refreshVotes();
        
        setIsLoading(prev => ({ ...prev, voteCounts: true }));
        await refreshVoteCounts();
        
        setIsLoading(prev => ({ ...prev, votingStatus: true }));
        await checkVotingStatus();
      } catch (error) {
        console.error("Initialization error:", error);
        setMessage({ 
          text: 'Failed to initialize the app. Please refresh.', 
          type: 'error' 
        });
      } finally {
        setIsLoading({
          votes: false,
          voteCounts: false,
          candidates: false,
          votingStatus: false
        });
      }
    }

    initializeApp();
  }, []);

  // Candidate Management
  function handleAddCandidate(event) {
    event.preventDefault();
    if (!newCandidate) {
      setMessage({ text: 'Please enter a candidate name', type: 'error' });
      return;
    }

    voting_app_backend.addCandidate(newCandidate)
      .then((msg) => {
        setMessage({ text: msg, type: 'success' });
        setNewCandidate('');
        return refreshCandidates();
      })
      .catch((error) => {
        console.error("Add candidate error:", error);
        setMessage({ 
          text: 'Failed to add candidate. Ensure the name is unique.', 
          type: 'error' 
        });
      });
  }

  // Refresh Candidates
  async function refreshCandidates() {
    try {
      const candidateList = await voting_app_backend.getAllCandidates();
      setCandidates(candidateList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setMessage({ 
        text: 'Could not retrieve candidate list', 
        type: 'error' 
      });
    }
  }

  // Vote Casting
  function handleCastVote(event) {
    event.preventDefault();
    
    // Validation
    if (!userId) {
      setMessage({ text: 'Please enter a User ID', type: 'error' });
      return;
    }
    if (!candidate) {
      setMessage({ text: 'Please select a candidate', type: 'error' });
      return;
    }

    voting_app_backend.castVote(userId, candidate)
      .then((msg) => {
        if (msg.includes('already voted')) {
          setMessage({ text: msg, type: 'error' });
        } else if (msg.includes('Invalid candidate')) {
          setMessage({ text: 'Please choose a valid candidate', type: 'error' });
        } else {
          setMessage({ text: msg, type: 'success' });
          setUserId('');
          setCandidate('');
          
          // Refresh data after successful vote
          Promise.all([
            refreshVotes(),
            refreshVoteCounts()
          ]);
        }
      })
      .catch((error) => {
        console.error("Vote casting error:", error);
        setMessage({ 
          text: 'Failed to cast vote. Please try again.', 
          type: 'error' 
        });
      });
  }

  // Voting Status Management
  function handleCloseVoting() {
    voting_app_backend.closeVoting()
      .then((msg) => {
        setMessage({ text: msg, type: 'success' });
        checkVotingStatus();
      })
      .catch((error) => {
        console.error("Close voting error:", error);
        setMessage({ 
          text: 'Failed to close voting', 
          type: 'error' 
        });
      });
  }

  function handleReopenVoting() {
    voting_app_backend.reopenVoting()
      .then((msg) => {
        setMessage({ text: msg, type: 'success' });
        checkVotingStatus();
      })
      .catch((error) => {
        console.error("Reopen voting error:", error);
        setMessage({ 
          text: 'Failed to reopen voting', 
          type: 'error' 
        });
      });
  }

  // Check Voting Status
  async function checkVotingStatus() {
    try {
      if (voting_app_backend.isVotingOpen) {
        const status = await voting_app_backend.isVotingOpen();
        setVotingOpen(status);
      } else {
        console.warn("isVotingOpen method not found, defaulting to open");
        setVotingOpen(true);
      }
    } catch (error) {
      console.error("Voting status check error:", error);
      setVotingOpen(true);
    }
  }

  // Data Refresh Functions
  // Modify the vote counts conversion
async function refreshVoteCounts() {
  try {
    const counts = await voting_app_backend.getVoteCount();
    const formattedCounts = counts.map(([candidate, count]) => [
      candidate.toString(), // Ensure candidate is a string
      Number(count.toString()) // Convert BigInt to number
    ]);
    setVoteCounts(formattedCounts);
  } catch (error) {
    console.error("Vote count refresh error:", error);
  }
}

  async function refreshVotes() {
    try {
      const allVotes = await voting_app_backend.getAllVotes();
      setVotes(allVotes);
    } catch (error) {
      console.error("Votes refresh error:", error);
    }
  }

  // Chart Configuration
  const chartData = {
    labels: voteCounts.map(([candidate]) => candidate),
    datasets: [
      {
        label: 'Vote Count',
        data: voteCounts.map(([, count]) => count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Voting Results',
      },
    },
  };

  return (
    <main className="voting-app-container">
      <h1>Decentralized Voting Platform</h1>

      {/* Admin Controls */}
      <section className="admin-controls">
        <div className="voting-status">
          <h2>Voting Management</h2>
          <p>Current Status: {votingOpen ? "🟢 Open" : "🔴 Closed"}</p>
          
          <div className="control-buttons">
            <button 
              onClick={handleCloseVoting} 
              disabled={!votingOpen}
              className="btn btn-danger"
            >
              Close Voting
            </button>
            <button 
              onClick={handleReopenVoting} 
              disabled={votingOpen}
              className="btn btn-success"
            >
              Reopen Voting
            </button>
          </div>
        </div>

        {/* Candidate Management */}
        <div className="candidate-management">
          <h2>Candidate Registration</h2>
          <form onSubmit={handleAddCandidate}>
            <input
              type="text"
              value={newCandidate}
              onChange={(e) => setNewCandidate(e.target.value)}
              placeholder="Enter new candidate name"
              required
            />
            <button type="submit" className="btn btn-primary">
              Add Candidate
            </button>
          </form>

          <div className="candidate-list">
            <h3>Registered Candidates</h3>
            {isLoading.candidates ? (
              <p>Loading candidates...</p>
            ) : candidates.length === 0 ? (
              <p>No candidates registered yet</p>
            ) : (
              <ul>
                {candidates.map((candidate) => (
                  <li key={candidate}>{candidate}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Vote Casting Section */}
      <section className="vote-casting">
        <h2>Cast Your Vote</h2>
        <form 
          onSubmit={handleCastVote} 
          style={{ opacity: votingOpen ? 1 : 0.5 }}
        >
          <div className="form-group">
            <label htmlFor="userId">User ID:</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your unique ID"
              required
              disabled={!votingOpen}
            />
          </div>

          <div className="form-group">
            <label htmlFor="candidate">Candidate:</label>
            <select
              id="candidate"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              required
              disabled={!votingOpen}
            >
              <option value="">Select a Candidate</option>
              {candidates.map((candidateName) => (
                <option key={candidateName} value={candidateName}>
                  {candidateName}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={!votingOpen}
            className="btn btn-primary"
          >
            Cast Vote
          </button>
        </form>
      </section>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Votes List */}
      <section className="votes-list">
        <h2>Voting History</h2>
        {isLoading.votes ? (
          <p>Loading votes...</p>
        ) : votes.length === 0 ? (
          <p>No votes cast yet</p>
        ) : (
          <ul>
           {votes.map(([userId, vote]) => (
  <li key={userId}>
    <strong>User:</strong> {userId}
    <p><strong>Candidate:</strong> {vote.candidate}</p>
    <p>
      <strong>Timestamp:</strong> {
        vote.timestamp && vote.timestamp !== BigInt(0) 
        ? new Date(Number(vote.timestamp / BigInt(1_000_000))).toLocaleString() 
        : 'Invalid timestamp'
      }
    </p>
  </li>
))}
          </ul>
        )}
      </section>

      {/* Vote Counts */}
      <section className="vote-counts">
        <h2>Current Vote Counts</h2>
        {isLoading.voteCounts ? (
          <p>Loading vote counts...</p>
        ) : voteCounts.length === 0 ? (
          <p>No votes counted yet</p>
        ) : (
          <ul>
            {voteCounts.map(([candidate, count]) => (
              <li key={candidate}>
                {candidate}: {count} votes
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Voting Results Chart */}
      <section className="voting-results">
        <h2>Voting Results Visualization</h2>
        {voteCounts.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p>Not enough data to generate chart</p>
        )}
      </section>
    </main>
  );
}

export default App;