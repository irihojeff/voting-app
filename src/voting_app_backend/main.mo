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

  // Tracking voting status
  var votingOpen: Bool = true;

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

  // Modified castVote function with voting status check
  public func castVote(userId: Text, candidate: Text) : async Text {
    if (not votingOpen) {
      return "Voting is closed. No votes are being accepted.";
    };

    switch (votes.get(userId)) {
      case (?vote) { return "You have already voted!" };
      case (_) {
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
          case (_) {
            voteCount.put(candidate, 1);
          };
        };

        return "Vote recorded successfully!";
      };
    };
  };

  public func getAllVotes() : async [(Text, Vote)] {
    Iter.toArray(votes.entries())
  };

  public shared({caller}) func reopenVoting() : async Text {
    if (votingOpen) {
      return "Voting is already open.";
    };
    votingOpen := true;
    return "Voting has been reopened.";
  }
} // Removed the extra brace here