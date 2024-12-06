# Decentralized Voting App

A decentralized voting application built for the December24 ICP Rwanda Hackathon. This project demonstrates how blockchain technology can provide a secure, transparent, and tamper-proof voting system, leveraging the Internet Computer Protocol (ICP).

## Features
- **Cast Votes:** Users can vote for candidates securely.
- **Real-Time Results:** View the live vote count displayed using a bar chart.
- **Admin Controls:** Admin can open or close voting sessions.
- **Blockchain Integration:** Fully decentralized with data stored on ICP.

## How It Works
1. **Vote Casting:** Each user casts their vote using their unique ID.
2. **Vote Counting:** Votes are tallied automatically and displayed.
3. **Transparency:** All votes are stored immutably on the blockchain.

## Technologies Used
- **Frontend:** React.js
- **Backend:** Motoko on the Internet Computer
- **Styling:** CSS for responsive design
- **Data Visualization:** Bar chart (e.g., Chart.js)

## Installation

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [dfx SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- [Git](https://git-scm.com/)


### Steps
1. Clone the repository:
     git clone https://github.com/irihojeff/voting-app.git
   cd voting-app
3. Install dependencies:

npm install

3.Start the Internet Computer local replica:

dfx start

4.Deploy the backend canisters:

dfx deploy

Run the frontend:

npm start
Demo
(https://drive.google.com/file/d/1UpMsDVePjU3vgGOsRpITRj51qBd3m0FW/view?usp=sharing)

Challenges Faced
Initial bugs in vote counting logic.
Tight deadlines for UI enhancements and Git integration.
Future Scope
Add multi-factor authentication for user ID verification.
Extend admin controls to manage user roles dynamically.
Enhance UI for a better user experience.
Contributors
Iriho Japhet, 
Nyishimente Lois
 
