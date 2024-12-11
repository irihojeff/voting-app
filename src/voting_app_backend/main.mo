import Time "mo:base/Time";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";

actor VotingApp {
  type Vote = {
    candidate : Text;
    timestamp : Int;
  };

  let votes = HashMap.HashMap<Text, Vote>(10, Text.equal, Text.hash);
  let voteCount = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);

  // List of candidates
  var candidates = HashMap.HashMap<Text, Bool>(10, Text.equal, Text.hash);

  // Tracking voting status
  var votingOpen: Bool = true;

  // New method to get all votes
  public query func getAllVotes() : async [(Text, Vote)] {
    Iter.toArray(votes.entries())
  };

  public func getVoteCount() : async [(Text, Nat)] {
    Iter.toArray(voteCount.entries()) // Returns the vote count for each candidate
  };

  // Function to close voting
  public shared({caller}) func closeVoting() : async Text {
    if (not votingOpen) {
      return "Voting is already closed.";
    };
    votingOpen := false;
    return "Voting has been closed.";
  };

  // Check if voting is currently open
  public query func isVotingOpen() : async Bool {
    votingOpen
  };

  // Add candidate function
  public shared({caller}) func addCandidate(candidate: Text) : async Text {
    switch (candidates.get(candidate)) {
      case (?_) {
        return "Candidate already exists.";
      };
      case (null) {
        candidates.put(candidate, true);
        voteCount.put(candidate, 0); // Initialize the vote count for the new candidate
        return "Candidate added successfully!";
      };
    };
  };

  // Get list of all candidates
  public query func getAllCandidates() : async [Text] {
    Iter.toArray(candidates.keys())
  };

  // Cast vote function with voting status check and candidate validation
  public func castVote(userId: Text, candidate: Text) : async Text {
    if (not votingOpen) {
      return "Voting is closed. No votes are being accepted.";
    };
    
    switch (candidates.get(candidate)) {
      case (null) {
        return "Invalid candidate.";
      };
      case (?_) {
        switch (votes.get(userId)) {
          case (?vote) { return "You have already voted!" };
          case (null) {
            let currentTime = Time.now();
            let vote = {
              candidate = candidate;
              timestamp = currentTime;
            };
            votes.put(userId, vote);
            
            switch (voteCount.get(candidate)) {
              case (?count) {
                voteCount.put(candidate, count + 1);
              };
              case (null) {
                voteCount.put(candidate, 1);
              };
            };
            
            return "Vote recorded successfully!";
          };
        };
      };
    };
  };

  // Reopen voting function
  public shared({caller}) func reopenVoting() : async Text {
    if (votingOpen) {
      return "Voting is already open.";
    };
    votingOpen := true;
    return "Voting has been reopened.";
  }
}