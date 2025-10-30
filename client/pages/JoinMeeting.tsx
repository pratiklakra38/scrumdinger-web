import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinMeeting() {
  // Try to get Google user's name from localStorage
  const gmailName = localStorage.getItem('userName') || '';
  const [meetingCode, setMeetingCode] = useState('');
  const [userName, setUserName] = useState(gmailName);
  const navigate = useNavigate();

  // Enforce update if Google login happens after mount
  useEffect(() => {
    if (gmailName && !userName) setUserName(gmailName);
  }, [gmailName, userName]);

  const handleJoin = () => {
    if (meetingCode && userName) {
      localStorage.setItem('userName', userName);
      navigate(`/meeting/${meetingCode}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Join Meeting</h1>
        <input
          type="text"
          placeholder="Meeting Code"
          value={meetingCode}
          onChange={e => setMeetingCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4"
          readOnly={!!gmailName} // lock if Gmail name exists
        />
        {gmailName && (
          <div className="text-xs text-gray-400 mb-2">Using your Google account name</div>
        )}
        <button
          onClick={handleJoin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}
