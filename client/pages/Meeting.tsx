import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRealtimeMeeting } from "../hooks/useRealtimeMeeting";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function Meeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Guest";
  // Local state for in-progress status, driven by timerState or socket
  const [isMeetingStarted, setMeetingStarted] = useState(false);

  const {
    participants,
    currentSpeakerIndex,
    transcript,
    timerState,
    isConnected,
    nextSpeaker,
    sendTranscript,
    syncTimer,
    startMeeting,
    endMeeting,
    socket
  } = useRealtimeMeeting(id!, userName);

  // Debounced transcript sending (1.2s before sending new chunk)
  const { supported, result, reset } = useSpeechRecognition(timerState.isRunning);
  const lastSentRef = useRef<string>("");
  const debouncedSend = useRef(
    debounce((text: string, speaker: string) => sendTranscript(text, speaker), 1200)
  ).current;

  useEffect(() => {
    if (result && result.text && result.text !== lastSentRef.current) {
      debouncedSend(result.text, userName);
      lastSentRef.current = result.text;
      if (result.isFinal) reset();
    }
  }, [result, userName, debouncedSend, reset]);

  // Listen for start/end to transition state based on real-time events
  useEffect(() => {
    if (!socket) return;
    const handleStarted = () => setMeetingStarted(true);
    const handleEnded = () => setMeetingStarted(false);
    socket.on('meeting-started', handleStarted);
    socket.on('meeting-ended', handleEnded);
    // Whenever timerState.isRunning changes (via meeting-state), also update
    setMeetingStarted(timerState.isRunning);
    return () => {
      socket.off('meeting-started', handleStarted);
      socket.off('meeting-ended', handleEnded);
    };
  }, [socket, timerState.isRunning]);

  if (!id) {
    return <div className="p-8 text-lg text-gray-500">No meeting code given.</div>;
  }
  if (!isConnected) {
    return <div className="p-8 text-lg text-orange-600">Connecting to meeting room…<br/>If this doesn't update, ensure the server is running and accessible.</div>;
  }

  // LOBBY: Only show lobby until Start
  if (!isMeetingStarted) {
    return (
      <div className="min-h-screen flex flex-col brand-gradient">
        <header className="bg-white shadow px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="font-bold text-lg">Meeting ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span></div>
          <div className="text-gray-600">Share this code with others to let them join your meeting.</div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
            <button className="ml-4 px-3 py-2 bg-red-600 text-white rounded" onClick={() => { endMeeting(); navigate("/scrums"); }}>Exit</button>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center bg-white">
          <div className="bg-white rounded-lg shadow p-8 min-w-[340px] max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-3">Waiting Room</h2>
            <div className="mb-4 text-gray-600">Participants joined:</div>
            <div className="mb-6">
              {participants.length === 0 && <div className="text-gray-400">No one has joined yet. Copy the code above and share!</div>}
              {participants.map(p => (
                <div key={p.id} className="px-4 py-2 mb-2 rounded bg-blue-50 border flex items-center">
                  <span className="mr-2 font-bold text-blue-700">{p.name}</span>
                  {p.name === userName && <span className="text-xs text-gray-400">(You)</span>}
                </div>
              ))}
            </div>
            {participants.length > 0 && (
              <button
                className="w-full bg-green-600 text-white py-2 rounded-lg text-lg hover:bg-green-700"
                onClick={startMeeting}
              >
                Start Meeting
              </button>
            )}
            <div className="mt-4 text-xs text-gray-500">
              Others joining with this code will appear above. <br />
              Only click Start when everyone is ready!
            </div>
          </div>
        </main>
      </div>
    );
  }

  // MEETING IN PROGRESS
  return (
    <div className="min-h-screen flex flex-col brand-gradient">
      <header className="bg-white shadow px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="font-bold text-lg">Meeting ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span></div>
        <div className="text-gray-600">Connected • Meeting in Progress</div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm">Connected</span>
          <button className="ml-4 px-3 py-2 bg-red-600 text-white rounded" onClick={() => { endMeeting(); navigate("/scrums"); }}>Exit</button>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_300px_400px]">
        <section className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-3">Real-Time Scrum Meeting</h2>
          <div className="mb-6 text-gray-500">Current Speaker: <span className="font-bold text-blue-700">{participants[currentSpeakerIndex]?.name || "—"}</span></div>
          <div className="flex gap-4 mb-8">
            <div>
              <div className="font-mono">Elapsed</div>
              <div className="text-2xl font-bold">
                {Math.floor(timerState.elapsed / 60)}:{(timerState.elapsed % 60).toString().padStart(2, "0")}
              </div>
            </div>
            <div>
              <div className="font-mono">Remaining</div>
              <div className="text-2xl font-bold">
                {Math.floor(timerState.remaining / 60)}:{(timerState.remaining % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
          <progress value={timerState.elapsed} max={timerState.elapsed + timerState.remaining || 900} className="w-64 h-6 rounded" />
          <div className="mt-6 flex gap-4">
            {timerState.isRunning && (
              <>
                <button onClick={nextSpeaker} className="bg-blue-600 text-white py-2 px-4 rounded">Next Speaker</button>
                <button onClick={endMeeting} className="bg-gray-700 text-white py-2 px-4 rounded">End Meeting</button>
              </>
            )}
          </div>
          <div className="mt-8 text-xs text-gray-500">
            {supported
              ? timerState.isRunning
                ? "Listening for live speech (mic required)..."
                : "Start the meeting to enable live transcription."
              : "Speech recognition not supported in this browser."}
          </div>
        </section>
        {/* Participants sidebar */}
        <aside className="border-l border-gray-200 p-6 bg-white">
          <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div key={p.id} className={`p-2 rounded ${idx === currentSpeakerIndex ? "bg-blue-100 border-blue-600 border-2" : "bg-gray-50"}`}>  <span className="inline-block font-bold mr-2">{p.name}</span>
                {idx === currentSpeakerIndex && <span className="inline text-xs text-blue-700">Speaking now</span>}
              </div>
            ))}
          </div>
        </aside>
        {/* Live transcript */}
        <aside className="border-l border-gray-200 p-6 bg-blue-50 overflow-auto">
          <h3 className="font-semibold mb-2">Live Transcript</h3>
          <div className="space-y-2">
            {transcript.length === 0 && <div className="text-gray-400">Speak to start transcript…</div>}
            {transcript.map((entry, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-blue-600">{entry.speaker}:</span> {entry.text} <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
