import { useState, useEffect } from 'react';
import { voting_app_backend } from 'declarations/voting_app_backend';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [votes, setVotes] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userId, setUserId] = useState('');
  const [candidate, setCandidate] = useState('');
  const [voteCounts, setVoteCounts] = useState([]);
  const [votingOpen, setVotingOpen] = useState(true);

  useEffect(() => {
    try {
      refreshVotes();
      refreshVoteCounts();
      
      // Fallback method if isVotingOpen is not available
      if (voting_app_backend.isVotingOpen) {
        checkVotingStatus();
      } else {
        console.warn("isVotingOpen method not found, defaulting to open");
        setVotingOpen(true);
      }
    } catch (error) {
      console.error("Error in initial setup:", error);
      setVotingOpen(true);
    }
  }, []);

  function handleCastVote(event) {
    event.preventDefault();
    if (!userId || !candidate) {
      setMessage({ text: 'Please provide both user ID and candidate.', type: 'error' });
      return;
    }

    voting_app_backend.castVote(userId, candidate).then((msg) => {
      if (msg.includes('already voted')) {
        setMessage({ text: msg, type: 'error' });
      } else {
        setMessage({ text: msg, type: 'success' });
        refreshVotes();
        refreshVoteCounts();
        setUserId('');
        setCandidate('');
      }
    });
  }

  function handleCloseVoting() {
    voting_app_backend.closeVoting().then((msg) => {
      setMessage({ text: msg, type: 'success' });
      checkVotingStatus();
    });
  }

  function handleReopenVoting() {
    voting_app_backend.reopenVoting().then((msg) => {
      setMessage({ text: msg, type: 'success' });
      checkVotingStatus(); // Refresh the voting status
    }).catch((error) => {
      console.error("Error reopening voting:", error);
      setMessage({ text: "Failed to reopen voting.", type: 'error' });
    });
  }

  function checkVotingStatus() {
    if (voting_app_backend.isVotingOpen) {
      voting_app_backend.isVotingOpen().then(
        (status) => setVotingOpen(status),
        (error) => {
          console.error("Error checking voting status:", error);
          setVotingOpen(true); // Default to open if check fails
        }
      );
    } else {
      console.error("isVotingOpen method not found in backend");
      setVotingOpen(true); // Default to open if method is missing
    }
  }

  function refreshVoteCounts() {
    voting_app_backend.getVoteCount().then((counts) => {
      console.log("Raw Vote Counts:", counts);

      // Transform counts to expected format if necessary
      const formattedCounts = counts.map(([candidate, count]) => [
        candidate.toString(),
        Number(count),
      ]);
      setVoteCounts(formattedCounts);
    });
  }

  function refreshVotes() {
    voting_app_backend.getAllVotes().then(setVotes);
  }

  // Chart Data for Bar Chart
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
    <main>
      <h1>Decentralized Voting App</h1>

      {/* Admin Controls */}
      <div className="admin-controls">
        <button onClick={handleCloseVoting} disabled={!votingOpen} className="primary">
          Close Voting
        </button>
        <p>Voting Status: {votingOpen ? "Open" : "Closed"}</p>
       
        <button onClick={handleReopenVoting} disabled={votingOpen} className="primary">
          Reopen Voting
        </button>
      </div>

      {/* Cast Vote Form */}
      <form onSubmit={handleCastVote} className="cast-vote" style={{ opacity: votingOpen ? 1 : 0.6 }}>
        <h2>Cast Your Vote</h2>
        <label>User ID:</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          placeholder="Enter your unique ID"
          disabled={!votingOpen}
        />
        <br />
        <label>Candidate:</label>
        <input
          id="candidate"
          type="text"
          value={candidate}
          onChange={(e) => setCandidate(e.target.value)}
          required
          placeholder="Type the candidate's name"
          disabled={!votingOpen}
        />
        <br />
        <button type="submit" disabled={!votingOpen}>
          Cast Vote
        </button>
      </form>

      {/* Message Display */}
      {message.text && <p className={`message ${message.type}`}>{message.text}</p>}

      {/* List Votes */}
      <h2>All Votes</h2>
      <ul>
        {votes.map(([userId, vote]) => (
          <li key={userId}>
            <h3>User: {userId}</h3>
            <p>Voted for: {vote.candidate}</p>
            <p>Timestamp: {new Date(Number(vote.timestamp) / 1_000_000).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      {/* Vote Counts */}
      <h2>Vote Counts</h2>
      <ul>
        {voteCounts.map(([candidate, count]) => (
          <li key={candidate}>
            {candidate}: {count}
          </li>
        ))}
      </ul>

      {/* Voting Results - Bar Chart */}
      <h2>Voting Results</h2>
      {voteCounts.length > 0 ? (
        <Bar data={chartData} options={chartOptions} />
      ) : (
        <p>Loading results...</p>
      )}
    </main>
  );
}

export default App;
